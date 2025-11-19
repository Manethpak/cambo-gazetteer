import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ResponseByCode } from "../types";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { Loader2, MapPin, ChevronRight } from "lucide-react";
import { getEnglishName, getKhmerName } from "@/libs/name";

export function Detail() {
  const { code } = useParams<{ code: string }>();
  const [unit, setUnit] = useState<ResponseByCode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Fetch current unit details
        const unitRes = await fetch(`/api/v1/code/${code}`);
        if (!unitRes.ok) throw new Error("Unit not found");
        const unitData = await unitRes.json();
        setUnit(unitData);
      } catch (err) {
        console.error(err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [code]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !unit) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl inline-block">
          {error || "Unit not found"}
        </div>
        <div className="mt-4">
          <Link to="/" className="text-indigo-600 hover:underline">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  // Use breadcrumbs from API if available, otherwise fall back to path parsing
  const breadcrumbs =
    unit.breadcrumb?.map((item) => ({
      label: item.name_en,
      path: `/code/${item.code}`,
    })) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbs} />

      <div className="bg-white border border-slate-200 rounded-2xl p-8 mb-8 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-slate-900">
                {unit.name_en}
              </h1>
              <span className="px-3 py-1 text-sm font-medium bg-indigo-100 text-indigo-700 rounded-full">
                {unit.type}
              </span>
            </div>
            <h2 className="text-2xl font-khmer text-slate-600 mb-4">
              {unit.name_km}
            </h2>
            <div className="flex items-center gap-2 text-slate-600">
              <MapPin className="w-4 h-4" />
              <span className="font-mono text-sm bg-slate-100 px-2 py-1 rounded">
                Code: {unit.code}
              </span>
            </div>
          </div>
        </div>
      </div>

      {unit.children.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            {unit.children[0]?.type_en}s / <span className="font-khmer">{unit.children[0]?.type_km}</span>
            <span className="text-sm font-normal text-slate-600 bg-slate-100 px-2 py-1 rounded-full">
              {unit.children.length}
            </span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unit.children.sort((a,b) => Number(a.code) - Number(b.code)).map((child) => (
              <Link
                key={child.code}
                to={`/code/${child.code}`}
                className="group p-4 bg-white text-text border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">
                      {getEnglishName(child)}
                    </div>
                    <div className="font-khmer text-slate-600 mt-1">
                      {getKhmerName(child)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm bg-slate-100 px-2 py-1 rounded">
                      {child.code}
                    </p>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
