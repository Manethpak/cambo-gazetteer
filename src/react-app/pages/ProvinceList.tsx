import { useEffect, useState } from "react";
import { AdministrativeUnit } from "@/types";
import { Loader2, Search } from "lucide-react";
import { getEnglishName, getKhmerName } from "@/libs/name";
import { DirectoryTree } from "../components/DirectoryTree";

export function ProvinceList() {
  const [provinces, setProvinces] = useState<AdministrativeUnit[]>([]);
  const [filteredProvinces, setFilteredProvinces] = useState<AdministrativeUnit[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/provinces")
      .then((res) => res.json())
      .then((data: { data: AdministrativeUnit[] }) => {
        const sorted = data.data.sort((a, b) => Number(a.code) - Number(b.code));
        setProvinces(sorted);
        setFilteredProvinces(sorted);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load provinces");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProvinces(provinces);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = provinces.filter((province) => {
      const englishName = getEnglishName(province).toLowerCase();
      const khmerName = getKhmerName(province).toLowerCase();
      const code = province.code.toLowerCase();

      return englishName.includes(query) || khmerName.includes(query) || code.includes(query);
    });

    setFilteredProvinces(filtered);
  }, [searchQuery, provinces]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Explore data sets</h1>
        <p className="text-slate-600">Explore and browse all administrative units of Cambodia.</p>
      </div>

      {!loading && !error && (
        <div className="mb-6 max-w-2xl mx-auto">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter provinces..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Search className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-600 bg-red-50 rounded-xl">{error}</div>
      ) : filteredProvinces.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl">
          <p className="text-slate-600">No provinces found matching "{searchQuery}"</p>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto">
          <DirectoryTree items={filteredProvinces} />
        </div>
      )}
    </div>
  );
}
