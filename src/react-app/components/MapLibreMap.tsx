import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const stripKhPrefix = (code: string) => code.replace(/^KH/, "");
const toPostalCode = (adminCode: string) => stripKhPrefix(adminCode).padEnd(6, "0");

const getGeometryBounds = (
  geometry: maplibregl.MapGeoJSONFeature["geometry"],
): maplibregl.LngLatBounds | null => {
  const bounds = new maplibregl.LngLatBounds();

  if (geometry.type === "Polygon") {
    const rings = geometry.coordinates as [number, number][][];
    rings.forEach((ring) => {
      ring.forEach((coord) => {
        bounds.extend(coord);
      });
    });
    return bounds;
  }

  if (geometry.type === "MultiPolygon") {
    const polygons = geometry.coordinates as [number, number][][][];
    polygons.forEach((polygon) => {
      polygon.forEach((ring) => {
        ring.forEach((coord) => {
          bounds.extend(coord);
        });
      });
    });
    return bounds;
  }

  return null;
};

type HoverInfo = {
  name: string;
  adminCode: string;
  postalCode: string;
  x: number;
  y: number;
  level: "province" | "district" | "commune";
  parents?: {
    adm1?: string;
    adm2?: string;
  };
};

interface MapLibreMapProps {
  /** Initial map center coordinates [lng, lat] */
  center?: [number, number];
  /** Initial zoom level */
  zoom?: number;
  /** Height of the map container */
  height?: string;
  /** Currently highlighted location */
  highlightedLocation?: {
    code: string;
    name: string;
    coordinates?: [number, number];
  };
  /** Enable geolocation feature */
  enableGeolocation?: boolean;
}

const CAMBODIA_CENTER: [number, number] = [104.9, 12.5];

export function MapLibreMap({
  center = CAMBODIA_CENTER,
  zoom = 7,
  height = "400px",
  highlightedLocation,
  enableGeolocation = false,
}: MapLibreMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const clickTimeoutRef = useRef<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);

  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

  const clearPendingClick = useCallback(() => {
    if (clickTimeoutRef.current === null) return;

    window.clearTimeout(clickTimeoutRef.current);
    clickTimeoutRef.current = null;
  }, []);

  const handleProvinceClick = useCallback((
    e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] },
  ) => {
    if (!e.features || e.features.length === 0 || !mapRef.current) return;

    const feature = e.features[0];
    const bounds = getGeometryBounds(feature.geometry);
    if (!bounds) return;

    // Delay to allow double-click to cancel single-click zoom.
    clearPendingClick();
    clickTimeoutRef.current = window.setTimeout(() => {
      if (!mapRef.current) return;
      mapRef.current.fitBounds(bounds, { padding: 50, duration: 1000 });
      clickTimeoutRef.current = null;
    }, 250);
  }, [clearPendingClick]);

  const handleProvinceDoubleClick = useCallback((
    e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] },
  ) => {
    clearPendingClick();
    e.preventDefault();

    if (!e.features || e.features.length === 0) return;

    const feature = e.features[0];
    const properties = feature.properties as {
      adm1_pcode: string;
      adm1_name: string;
    };

    if (!properties?.adm1_pcode) return;

    const adminCode = stripKhPrefix(properties.adm1_pcode);
    navigateRef.current(`/location/${adminCode}`);
  }, [clearPendingClick]);

  const handleProvinceHover = useCallback((e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }) => {
    if (!e.features || e.features.length === 0 || !mapRef.current) return;

    const feature = e.features[0];
    const properties = feature.properties as {
      adm1_pcode: string;
      adm1_name: string;
    };

    if (!properties?.adm1_pcode || !properties?.adm1_name) return;

    mapRef.current.getCanvas().style.cursor = "pointer";
    mapRef.current.setFilter("province-hover", ["==", "adm1_pcode", properties.adm1_pcode]);

    setHoverInfo({
      name: properties.adm1_name,
      adminCode: stripKhPrefix(properties.adm1_pcode),
      postalCode: toPostalCode(properties.adm1_pcode),
      x: e.point.x,
      y: e.point.y,
      level: "province",
    });
  }, []);

  const handleProvinceLeave = useCallback(() => {
    if (!mapRef.current) return;

    mapRef.current.getCanvas().style.cursor = "";
    mapRef.current.setFilter("province-hover", ["==", "adm1_pcode", ""]);
    setHoverInfo(null);
  }, []);

  const handleDistrictClick = useCallback((
    e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] },
  ) => {
    if (!e.features || e.features.length === 0 || !mapRef.current) return;

    const feature = e.features[0];
    const bounds = getGeometryBounds(feature.geometry);
    if (!bounds) return;

    clearPendingClick();
    clickTimeoutRef.current = window.setTimeout(() => {
      if (!mapRef.current) return;
      mapRef.current.fitBounds(bounds, { padding: 50, duration: 1000 });
      clickTimeoutRef.current = null;
    }, 250);
  }, [clearPendingClick]);

  const handleDistrictDoubleClick = useCallback((
    e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] },
  ) => {
    clearPendingClick();
    e.preventDefault();

    if (!e.features || e.features.length === 0) return;

    const feature = e.features[0];
    const properties = feature.properties as {
      adm2_pcode: string;
      adm2_name: string;
    };

    if (!properties?.adm2_pcode) return;

    const adminCode = stripKhPrefix(properties.adm2_pcode);
    navigateRef.current(`/location/${adminCode}`);
  }, [clearPendingClick]);

  const handleDistrictHover = useCallback((e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }) => {
    if (!e.features || e.features.length === 0 || !mapRef.current) return;

    const feature = e.features[0];
    const properties = feature.properties as {
      adm2_pcode: string;
      adm2_name: string;
      adm1_name?: string;
    };

    if (!properties?.adm2_pcode || !properties?.adm2_name) return;

    mapRef.current.getCanvas().style.cursor = "pointer";
    mapRef.current.setFilter("district-hover", ["==", "adm2_pcode", properties.adm2_pcode]);

    setHoverInfo({
      name: properties.adm2_name,
      adminCode: stripKhPrefix(properties.adm2_pcode),
      postalCode: toPostalCode(properties.adm2_pcode),
      x: e.point.x,
      y: e.point.y,
      level: "district",
      parents: {
        adm1: properties.adm1_name,
      },
    });
  }, []);

  const handleDistrictLeave = useCallback(() => {
    if (!mapRef.current) return;

    mapRef.current.getCanvas().style.cursor = "";
    mapRef.current.setFilter("district-hover", ["==", "adm2_pcode", ""]);
    setHoverInfo(null);
  }, []);

  const handleCommuneClick = useCallback((
    e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] },
  ) => {
    if (!e.features || e.features.length === 0 || !mapRef.current) return;

    const feature = e.features[0];
    const bounds = getGeometryBounds(feature.geometry);
    if (!bounds) return;

    clearPendingClick();
    clickTimeoutRef.current = window.setTimeout(() => {
      if (!mapRef.current) return;
      mapRef.current.fitBounds(bounds, { padding: 50, duration: 1000 });
      clickTimeoutRef.current = null;
    }, 250);
  }, [clearPendingClick]);

  const handleCommuneDoubleClick = useCallback((
    e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] },
  ) => {
    clearPendingClick();
    e.preventDefault();

    if (!e.features || e.features.length === 0) return;

    const feature = e.features[0];
    const properties = feature.properties as {
      adm3_pcode: string;
      adm3_name: string;
    };

    if (!properties?.adm3_pcode) return;

    const adminCode = stripKhPrefix(properties.adm3_pcode);
    navigateRef.current(`/location/${adminCode}`);
  }, [clearPendingClick]);

  const handleCommuneHover = useCallback((e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }) => {
    if (!e.features || e.features.length === 0 || !mapRef.current) return;

    const feature = e.features[0];
    const properties = feature.properties as {
      adm3_pcode: string;
      adm3_name: string;
      adm1_name?: string;
      adm2_name?: string;
    };

    if (!properties?.adm3_pcode || !properties?.adm3_name) return;

    mapRef.current.getCanvas().style.cursor = "pointer";
    mapRef.current.setFilter("commune-hover", ["==", "adm3_pcode", properties.adm3_pcode]);

    setHoverInfo({
      name: properties.adm3_name,
      adminCode: stripKhPrefix(properties.adm3_pcode),
      postalCode: toPostalCode(properties.adm3_pcode),
      x: e.point.x,
      y: e.point.y,
      level: "commune",
      parents: {
        adm1: properties.adm1_name,
        adm2: properties.adm2_name,
      },
    });
  }, []);

  const handleCommuneLeave = useCallback(() => {
    if (!mapRef.current) return;

    mapRef.current.getCanvas().style.cursor = "";
    mapRef.current.setFilter("commune-hover", ["==", "adm3_pcode", ""]);
    setHoverInfo(null);
  }, []);

  // Use refs to store initial values for initialization, so updates to these props
  // don't trigger a full map destruction/re-creation in the main useEffect.
  const initialCenter = useRef(center);
  const initialZoom = useRef(zoom);

  // Map Initialization Effect - Runs once (guarded), deps included for lint correctness.
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    try {
      // Initialize the map
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: {
          version: 8,
          sources: {
            "osm": {
              type: "raster",
              tiles: [
                "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              ],
              tileSize: 256,
            }
          },
          layers: [
            {
              id: "osm",
              type: "raster",
              source: "osm"
            }
          ]
        },
        center: initialCenter.current,
        zoom: initialZoom.current,
      });

      mapRef.current = map;

      // We use double-click for navigation (not zoom)
      map.doubleClickZoom.disable();

      // Handle map load
      map.on("load", () => {
        // ===== PROVINCE LAYER (Admin Level 1) =====
        map.addSource("provinces", {
          type: "geojson",
          data: "/data/geo/khm_admin1.geojson",
        });

        // Province fill layer (visible at lower zoom levels)
        map.addLayer({
          id: "province-boundaries",
          type: "fill",
          source: "provinces",
          paint: {
            "fill-color": "#3b82f6",
            "fill-opacity": 0.07,
          },
          maxzoom: 11, // Hide when zoomed in beyond level 10
        });

        // Province outline layer
        map.addLayer({
          id: "province-boundaries-outline",
          type: "line",
          source: "provinces",
          paint: {
            "line-color": "#1e40af",
            "line-width": 1.5,
          },
          maxzoom: 11,
        });

        // Province hover effect
        map.addLayer({
          id: "province-hover",
          type: "fill",
          source: "provinces",
          paint: {
            "fill-color": "#3b82f6",
            "fill-opacity": 0.1,
          },
          filter: ["==", "adm1_pcode", ""],
          maxzoom: 11,
        });

        // ===== DISTRICT LAYER (Admin Level 2) =====
        map.addSource("districts", {
          type: "geojson",
          data: "/data/geo/khm_admin2.geojson",
        });

        // District fill layer (visible at medium zoom levels)
        map.addLayer({
          id: "district-boundaries",
          type: "fill",
          source: "districts",
          paint: {
            "fill-color": "#ec4899", // Magenta/pink - contrasts with green vegetation
            "fill-opacity": 0.03,
          },
          minzoom: 8,
          maxzoom: 15,
        });

        // District outline layer
        map.addLayer({
          id: "district-boundaries-outline",
          type: "line",
          source: "districts",
          paint: {
            "line-color": "#db2777", // Darker pink for visibility
            "line-width": 1.2,
          },
          minzoom: 8,
          maxzoom: 15,
        });

        // District hover effect
        map.addLayer({
          id: "district-hover",
          type: "fill",
          source: "districts",
          paint: {
            "fill-color": "#ec4899",
            "fill-opacity": 0.15,
          },
          filter: ["==", "adm2_pcode", ""],
          minzoom: 8,
          maxzoom: 15,
        });

        // ===== COMMUNE LAYER (Admin Level 3) =====
        map.addSource("communes", {
          type: "geojson",
          data: "/data/geo/khm_admin3.geojson",
        });

        // Commune fill layer (visible at high zoom levels)
        map.addLayer({
          id: "commune-boundaries",
          type: "fill",
          source: "communes",
          paint: {
            "fill-color": "#a855f7", // Purple - contrasts with water and vegetation
            "fill-opacity": 0.04,
          },
          minzoom: 10,
        });

        // Commune outline layer
        map.addLayer({
          id: "commune-boundaries-outline",
          type: "line",
          source: "communes",
          paint: {
            "line-color": "#9333ea", // Darker purple for visibility
            "line-width": 0.9,
          },
          minzoom: 10,
        });

        // Commune hover effect
        map.addLayer({
          id: "commune-hover",
          type: "fill",
          source: "communes",
          paint: {
            "fill-color": "#a855f7",
            "fill-opacity": 0.18,
          },
          filter: ["==", "adm3_pcode", ""],
          minzoom: 10,
        });

        // Add click handler for provinces
        map.on("click", "province-boundaries", handleProvinceClick);

        // Add double-click handler for provinces
        map.on("dblclick", "province-boundaries", handleProvinceDoubleClick);

        // Add hover handlers for provinces
        map.on("mousemove", "province-boundaries", handleProvinceHover);
        map.on("mouseleave", "province-boundaries", handleProvinceLeave);

        // Add click handler for districts
        map.on("click", "district-boundaries", handleDistrictClick);

        // Add double-click handler for districts
        map.on("dblclick", "district-boundaries", handleDistrictDoubleClick);

        // Add hover handlers for districts
        map.on("mousemove", "district-boundaries", handleDistrictHover);
        map.on("mouseleave", "district-boundaries", handleDistrictLeave);

        // Add click handler for communes
        map.on("click", "commune-boundaries", handleCommuneClick);

        // Add double-click handler for communes
        map.on("dblclick", "commune-boundaries", handleCommuneDoubleClick);

        // Add hover handlers for communes
        map.on("mousemove", "commune-boundaries", handleCommuneHover);
        map.on("mouseleave", "commune-boundaries", handleCommuneLeave);

        setIsLoading(false);
      });

      // Handle map errors
      map.on("error", (e) => {
        console.error("Map error:", e);
        setError("Failed to load map");
        setIsLoading(false);
      });

      // Add navigation controls
      map.addControl(new maplibregl.NavigationControl(), "top-right");

      // Add geolocation control if enabled
      if (enableGeolocation && "geolocation" in navigator) {
        map.addControl(
          new maplibregl.GeolocateControl({
            positionOptions: {
              enableHighAccuracy: true,
            },
            trackUserLocation: true,
          }),
          "top-right"
        );
      }
    } catch (err) {
      console.error("Failed to initialize map:", err);
      setError("Failed to initialize map");
      setIsLoading(false);
    }

    return () => {
      clearPendingClick();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [
    enableGeolocation,
    handleProvinceClick,
    handleProvinceDoubleClick,
    handleProvinceHover,
    handleProvinceLeave,
    handleDistrictClick,
    handleDistrictDoubleClick,
    handleDistrictHover,
    handleDistrictLeave,
    handleCommuneClick,
    handleCommuneDoubleClick,
    handleCommuneHover,
    handleCommuneLeave,
    clearPendingClick,
  ]);

  // Update map view when highlighted location changes
  useEffect(() => {
    if (!mapRef.current || !highlightedLocation?.coordinates) return;

    mapRef.current.flyTo({
      center: highlightedLocation.coordinates,
      zoom: 10,
      duration: 2000,
    });
  }, [highlightedLocation]);

  if (error) {
    return (
      <div
        className="flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg"
        style={{ height }}
      >
        <div className="text-center">
          <p className="text-red-600 mb-2">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg z-10"
          style={{ height }}
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
      {hoverInfo && (
        <div
          className="absolute z-20 bg-white/95 border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-sm pointer-events-none"
          style={{ left: hoverInfo.x + 12, top: hoverInfo.y + 12 }}
        >
          <div className="font-semibold text-slate-900">{hoverInfo.name}</div>
          {hoverInfo.parents?.adm1 && (
            <div className="text-xs text-slate-500 mt-0.5">
              {hoverInfo.parents.adm1}
              {hoverInfo.parents.adm2 && ` > ${hoverInfo.parents.adm2}`}
            </div>
          )}
          <div className="text-xs text-slate-600">Admin Code: {hoverInfo.adminCode}</div>
          <div className="text-xs text-slate-600">Postal Code: {hoverInfo.postalCode}</div>
          <div className="text-xs text-slate-500 mt-1 italic">Double-click to view details</div>
        </div>
      )}
      <div
        ref={mapContainerRef}
        className="w-full border border-gray-300 rounded-lg overflow-hidden"
        style={{ height }}
      />
    </div>
  );
}
