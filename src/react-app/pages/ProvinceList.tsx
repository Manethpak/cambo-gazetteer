import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AdministrativeUnit } from "@/types";
import { Loader2, Map } from "lucide-react";
import { getEnglishName, getKhmerName } from "@/libs/name";

export function ProvinceList() {
  const [provinces, setProvinces] = useState<AdministrativeUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/provinces")
      .then((res) => res.json())
      .then((data: { data: AdministrativeUnit[] }) => {
        setProvinces(data.data.sort((a, b) => a.code.localeCompare(b.code)));
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load provinces");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Provinces of Cambodia
        </h1>
        <p className="text-slate-600">
          Browse all 24 provinces and the Autonomous Municipality of Phnom Penh
          of the Kingdom of Cambodia.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-600 bg-red-50 rounded-xl">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {provinces.map((province) => (
            <Link
              key={province.code}
              to={`/code/${province.code}`}
              className="group block bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-indigo-300 transition-all"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                    <Map className="w-6 h-6" />
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-md">
                    {province.code}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-indigo-700 transition-colors">
                  {getEnglishName(province)}
                </h3>
                <h4 className="text-lg font-khmer text-slate-700 mb-4">
{getKhmerName(province)}
                </h4>

                <div className="flex items-center text-sm text-slate-500">
                  <span className="group-hover:translate-x-1 transition-transform duration-300">
                    View Districts &rarr;
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
