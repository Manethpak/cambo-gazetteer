import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Loader2,
  Copy,
  Check,
  MapPin,
  ChevronRight,
  Search,
  Share2,
} from "lucide-react";
import { TypeLabel } from "@/components/TypeLabel";
import { getEnglishName, getKhmerName } from "@/libs/name";
import { ResponseByCode, Type } from "@/types";

export function LocationPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [location, setLocation] = useState<ResponseByCode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;

    setLoading(true);
    setError(null);

    fetch(`/api/v1/code/${code}`)
      .then((res) => {
        if (!res.ok) throw new Error("Location not found");
        return res.json();
      })
      .then((data) => {
        setLocation(data);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "Failed to load location");
      })
      .finally(() => setLoading(false));
  }, [code]);

  const handleCopyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 2000);
  };

  const handleShareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
  };

  // Generate postal code from administrative code
  const getPostalCode = (code: string): string => {
    // Only commune level (6 digits) and above have postal codes
    if (code.length > 6) {
      // Villages don't have postal codes
      return "N/A";
    }
    // Pad code with zeros to make it 6 digits
    return code.padEnd(6, "0");
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="flex justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-brand-600" />
        </div>
      </div>
    );
  }

  if (error || !location) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-red-50 mb-6">
            <Search className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            Location Not Found
          </h1>
          <p className="text-slate-600 mb-8">
            We couldn't find a location with code "{code}". Please check the
            code and try again.
          </p>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-500 transition-all"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  const pageTitle = `${getEnglishName(location)} - Cambodia Gazetteer`;
  const postalCode = getPostalCode(location.code);
  const pageDescription = `${getEnglishName(location)} (${getKhmerName(location)}) - Administrative ${location.type} in Cambodia. Code: ${location.code}${postalCode !== "N/A" ? `, Postal Code: ${postalCode}` : ""}.`;

  // Build JSON-LD structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: location.name_en,
    alternateName: location.name_km,
    identifier: location.code,
    address: {
      "@type": "PostalAddress",
      addressCountry: "KH",
      addressLocality: location.breadcrumb?.[0]?.name_en || location.name_en,
      ...(postalCode !== "N/A" && { postalCode: postalCode }),
    },
    containedInPlace: location.parent_code
      ? {
          "@type": "AdministrativeArea",
          name: location.ancestors?.[location.ancestors.length - 1]?.name_en,
        }
      : {
          "@type": "Country",
          name: "Cambodia",
        },
  };

  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: window.location.origin,
      },
      ...location.breadcrumb.map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 2,
        name: crumb.name_en,
        item: `${window.location.origin}/location/${crumb.code}`,
      })),
    ],
  };

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="place" />
        <meta property="og:url" content={window.location.href} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <link rel="canonical" href={window.location.href} />

        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbStructuredData)}
        </script>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        {location.breadcrumb.length > 0 && (
          <nav
            className="flex items-center gap-2 mb-6 text-base overflow-x-auto"
            aria-label="Breadcrumb"
          >
            <Link
              to="/"
              className="text-slate-500 hover:text-brand-600 transition-colors whitespace-nowrap"
            >
              Home
            </Link>
            {location.breadcrumb.map((crumb, index) => (
              <div key={crumb.code} className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                {index === location.breadcrumb.length - 1 ? (
                  <span className="text-brand-600 font-medium whitespace-nowrap">
                    {crumb.name_en}
                  </span>
                ) : (
                  <Link
                    to={`/location/${crumb.code}`}
                    className="text-slate-500 hover:text-brand-600 transition-colors whitespace-nowrap"
                  >
                    {crumb.name_en}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        )}

        <div className="max-w-5xl mx-auto">
          {/* Header Card */}
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8 mb-6">
            <div className="flex items-start justify-between gap-6 mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="w-6 h-6 text-brand-600" />
                  <TypeLabel type={location.type as Type} />
                </div>
                <h1 className="text-4xl font-black text-slate-900 font-khmer mb-2">
                  {getKhmerName(location)}
                </h1>
                <h2 className="text-2xl text-slate-600 font-semibold">
                  {getEnglishName(location)}
                </h2>
              </div>
              <div className="flex gap-3 mt-6 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleShareLink}
                  className="p-2 bg-slate-100 rounded-xl font-medium hover:bg-slate-200 transition-colors cursor "
                >
                  <span className="sr-only">Share</span>
                  <Share2 className="size-5" />
                </button>
              </div>
            </div>

            {/* Location Details */}
            <div className="grid md:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
              <div>
                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Administrative Code
                </div>
                <div className="flex items-center gap-3">
                  <code className="text-2xl font-mono font-bold text-brand-600">
                    {location.code}
                  </code>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(location.code, "admin")}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Copy code"
                  >
                    {copiedId === "admin" ? (
                      <Check className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Copy className="w-5 h-5 text-slate-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Postal Code
                </div>
                <div className="flex items-center gap-3">
                  <code className="text-2xl font-mono font-bold text-slate-700">
                    {getPostalCode(location.code)}
                  </code>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyCode(getPostalCode(location.code), "postal")
                    }
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Copy code"
                  >
                    {copiedId === "postal" ? (
                      <Check className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Copy className="w-5 h-5 text-slate-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-6">
              {/* Khmer Path */}
              <div>
                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Full Path
                </div>
                <div className="text-slate-900 font-khmer">
                  {location.path_km}
                </div>
                <div className="text-slate-700">{location.path}</div>
              </div>
            </div>
          </div>

          {/* Children Locations */}
          {location.children && location.children.length > 0 && (
            <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8 mb-6">
              <h3 className="text-xl font-bold text-slate-900 mb-6">
                {location.childrenCount?.[0]?.type === "district"
                  ? "Districts"
                  : location.childrenCount?.[0]?.type === "commune"
                    ? "Communes"
                    : location.childrenCount?.[0]?.type === "village"
                      ? "Villages"
                      : "Sub-locations"}{" "}
                ({location.children.length})
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {location.children.map((child) => (
                  <Link
                    key={child.code}
                    to={`/location/${child.code}`}
                    className="p-4 border border-slate-200 rounded-xl hover:border-brand-300 hover:bg-brand-50 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-900 font-khmer truncate group-hover:text-brand-700">
                          {child.name_km}
                        </div>
                        <div className="text-sm text-slate-600 truncate">
                          {child.name_en}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-brand-500 shrink-0 ml-2" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Siblings */}
          {location.siblings && location.siblings.length > 0 && (
            <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-6">
                Nearby{" "}
                {location.type === Type.PROVINCE ||
                location.type === Type.MUNICIPALTY
                  ? "Provinces"
                  : location.type === Type.DISTRICT
                    ? "Districts"
                    : location.type === Type.COMMUNE
                      ? "Communes"
                      : "Locations"}
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {location.siblings.slice(0, 8).map((sibling) => (
                  <Link
                    key={sibling.code}
                    to={`/location/${sibling.code}`}
                    className="p-3 border border-slate-200 rounded-xl hover:border-brand-300 hover:bg-brand-50 transition-all group"
                  >
                    <div className="font-semibold text-slate-900 truncate group-hover:text-brand-700 text-base">
                      {sibling.name_km}
                    </div>
                    <div className="text-slate-600 truncate group-hover:text-brand-700 text-xs">
                      {sibling.name_en}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
