import { useEffect, useState, useCallback } from "react";
import { MapPin, Copy, Check, AlertCircle, Navigation, ChevronDown } from "lucide-react";

type LookupLevel = {
  code: string;
  name_en: string;
  name_km: string;
  type: string;
  type_en: string | null;
  type_km: string | null;
  postal_code: string | null;
};

type LookupResult = {
  province: LookupLevel;
  district: LookupLevel;
  commune: LookupLevel;
  village: null;
};

type LocationState =
  | { status: "idle" }
  | { status: "requesting" }
  | { status: "loading"; lat: number; lng: number }
  | { status: "success"; lat: number; lng: number; data: LookupResult }
  | { status: "error"; message: string }
  | { status: "denied" };

function CopyableRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [value]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl hover:bg-white/10 transition-colors group cursor-pointer text-left"
      aria-label={`Copy ${label}: ${value}`}
    >
      <div className="min-w-0">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-indigo-300/70 mb-0.5">
          {label}
        </div>
        <div className="text-xs font-medium text-white truncate">{value}</div>
      </div>
      <div className="shrink-0 text-slate-400 group-hover:text-white transition-colors">
        {copied ? (
          <Check className="w-4 h-4 text-green-400" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </div>
    </button>
  );
}

function buildAddress(data: LookupResult): string {
  const parts = [data.commune.name_en, data.district.name_en, data.province.name_en];
  return parts.join(" ");
}

function buildPostalDisplay(data: LookupResult): string {
  // Use the most specific postal code available (commune > district > province)
  return (
    data.commune.postal_code ??
    data.district.postal_code ??
    data.province.postal_code ??
    "N/A"
  );
}

export function LocationInfo() {
  const [state, setState] = useState<LocationState>({ status: "idle" });
  const [isCollapsed, setIsCollapsed] = useState(true);

  const requestLocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setState({ status: "error", message: "Geolocation is not supported by your browser." });
      return;
    }

    setState({ status: "requesting" });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        setState({ status: "loading", lat, lng });

        fetch(`/api/v1/lookup?lat=${lat}&lng=${lng}`)
          .then((res) => {
            if (res.status === 404) {
              throw new Error("Your location is outside Cambodia's administrative boundaries.");
            }
            if (res.status === 429) {
              throw new Error("Too many requests. Please try again in a minute.");
            }
            if (!res.ok) {
              throw new Error("Failed to look up your location.");
            }
            return res.json();
          })
          .then((data: LookupResult) => {
            setState({ status: "success", lat, lng, data });
          })
          .catch((err) => {
            setState({ status: "error", message: err.message });
          });
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setState({ status: "denied" });
        } else {
          setState({
            status: "error",
            message: "Unable to retrieve your location. Please try again.",
          });
        }
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  // Auto-request on mount
  useEffect(() => {
    // Check if permission was previously granted to avoid re-prompting
    if ("permissions" in navigator) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        if (result.state === "granted") {
          requestLocation();
        }
      });
    }
  }, [requestLocation]);

  if (isCollapsed) {
    return (
      <button
        type="button"
        onClick={() => setIsCollapsed(false)}
        className="bg-white/90 hover:bg-white text-slate-900 shadow-md rounded-full px-3 py-1.5 flex items-center gap-2 transition-all cursor-pointer backdrop-blur-sm border border-slate-200/50 animate-in fade-in zoom-in-95 duration-200"
      >
        <MapPin className="w-4 h-4 text-slate-700" />
        <span className="text-xs font-bold">Your Address</span>
      </button>
    );
  }

  // --- Idle / Denied: prompt to share location ---
  if (state.status === "idle" || state.status === "denied") {
    return (
      <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 backdrop-blur-md shadow-2xl relative animate-in fade-in slide-in-from-bottom-2 duration-200">
        <button onClick={() => setIsCollapsed(true)} className="absolute top-3 right-3 text-slate-500 hover:text-white transition-colors cursor-pointer rounded-full hover:bg-white/10 p-0.5">
          <ChevronDown className="w-4 h-4" />
        </button>
        <div className="flex flex-col items-center text-center gap-3 py-1">
          <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
            <Navigation className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-white">
              {state.status === "denied"
                ? "Location access was denied"
                : "Share your location"}
            </p>
            <p className="text-xs text-slate-400 max-w-xs">
              {state.status === "denied"
                ? "Enable location access in your browser settings and try again."
                : "Allow location access to see your administrative address and postal code."}
            </p>
          </div>
          <button
            type="button"
            onClick={requestLocation}
            className="mt-1 px-5 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
          >
            {state.status === "denied" ? "Try Again" : "Share Location"}
          </button>
        </div>
      </div>
    );
  }

  // --- Requesting / Loading ---
  if (state.status === "requesting" || state.status === "loading") {
    return (
      <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 backdrop-blur-md shadow-2xl relative animate-in fade-in slide-in-from-bottom-2 duration-200">
        <button onClick={() => setIsCollapsed(true)} className="absolute top-3 right-3 text-slate-500 hover:text-white transition-colors cursor-pointer rounded-full hover:bg-white/10 p-0.5">
          <ChevronDown className="w-4 h-4" />
        </button>
        <div className="flex items-center justify-center gap-3 py-2">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-400 border-t-transparent"></div>
          <p className="text-sm text-slate-300 font-medium">
            {state.status === "requesting"
              ? "Requesting location access..."
              : "Looking up your address..."}
          </p>
        </div>
      </div>
    );
  }

  // --- Error ---
  if (state.status === "error") {
    return (
      <div className="bg-slate-900/80 border border-red-500/20 rounded-2xl p-4 backdrop-blur-md shadow-2xl relative animate-in fade-in slide-in-from-bottom-2 duration-200">
        <button onClick={() => setIsCollapsed(true)} className="absolute top-3 right-3 text-slate-500 hover:text-white transition-colors cursor-pointer rounded-full hover:bg-white/10 p-0.5">
          <ChevronDown className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-sm text-red-300 font-medium">{state.message}</p>
        </div>
        <button
          type="button"
          onClick={requestLocation}
          className="mt-3 w-full px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-xl transition-colors border border-white/10 cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  // --- Success ---
  const { lat, lng, data } = state;
  const address = buildAddress(data);
  const postal = buildPostalDisplay(data);

  return (
    <div className="bg-slate-900/80 border border-white/10 rounded-2xl backdrop-blur-md overflow-hidden shadow-2xl p-1 transition-all animate-in fade-in slide-in-from-bottom-2 duration-200">
      <button
        type="button"
        onClick={() => setIsCollapsed(true)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="text-[10px] font-semibold text-indigo-300 uppercase tracking-wider">
            Your Location
          </span>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
      </button>
      
      <div className="divide-y divide-white/5 border-t border-white/5 mt-1">
        <CopyableRow label="Coordinates" value={`${lat.toFixed(6)}, ${lng.toFixed(6)}`} />
        <CopyableRow label="Postal Code" value={postal} />
        <CopyableRow label="Address" value={address} />
      </div>
    </div>
  );
}
