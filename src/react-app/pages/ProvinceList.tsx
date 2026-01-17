import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdministrativeUnit } from "@/types";
import { Loader2 } from "lucide-react";
import { DirectoryTree } from "../components/DirectoryTree";
import { SearchBar } from "../components/SearchBar";

export function ProvinceList() {
  const navigate = useNavigate();
  const [provinces, setProvinces] = useState<AdministrativeUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/provinces")
      .then((res) => res.json())
      .then((data: { data: AdministrativeUnit[] }) => {
        const sorted = data.data.sort((a, b) => Number(a.code) - Number(b.code));
        setProvinces(sorted);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load provinces");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Explore data sets</h1>
        <p className="text-slate-600">Explore and browse all administrative units of Cambodia.</p>
      </div>

      {!loading && !error && (
        <div className="mb-6 max-w-2xl mx-auto">
          <SearchBar onSearch={handleSearch} />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-600 bg-red-50 rounded-xl">{error}</div>
      ) : (
        <div className="max-w-5xl mx-auto">
          <DirectoryTree items={provinces} />
        </div>
      )}
    </div>
  );
}
