interface SolutionComparisonProps {
  beforeTitle?: string;
  afterTitle?: string;
}

export function SolutionComparison({
  beforeTitle = "Before (Fragmented)",
  afterTitle = "After (Unified Code)",
}: SolutionComparisonProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Before */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">❌</span>
          <h3 className="text-lg font-bold text-slate-900">{beforeTitle}</h3>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">
              User Form (4+ Fields):
            </p>
            <div className="space-y-2 bg-white rounded-lg p-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Province
                </label>
                <input
                  type="text"
                  disabled
                  defaultValue="Siem Reap"
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded text-slate-700 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  District
                </label>
                <input
                  type="text"
                  disabled
                  defaultValue="Siem Reap (or Krong Siem Reap?)"
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded text-slate-700 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Commune
                </label>
                <input
                  type="text"
                  disabled
                  defaultValue="ឃុំស្វាយលើ"
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded text-slate-700 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Village
                </label>
                <input
                  type="text"
                  disabled
                  defaultValue="Optional (often left blank)"
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded text-slate-700 text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">
              Database Storage:
            </p>
            <pre className="bg-white p-4 rounded-lg overflow-x-auto text-xs text-slate-700 border border-slate-300">
              {`province: "Siem Reap"
district: "Siem Reap"
commune: "ឃុំស្វាយលើ"
village: NULL
notes: "near temple"`}
            </pre>
          </div>

          <div className="pt-2 border-t border-red-200">
            <p className="text-sm text-red-700 font-medium">Issues:</p>
            <ul className="text-xs text-red-600 space-y-1 mt-2">
              <li>• Multiple columns = complex schema</li>
              <li>• Inconsistent naming (Khmer/English mix)</li>
              <li>• Hard to validate against source data</li>
              <li>• Mistranslations across systems</li>
            </ul>
          </div>
        </div>
      </div>

      {/* After */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">✅</span>
          <h3 className="text-lg font-bold text-slate-900">{afterTitle}</h3>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">
              User Form (Single Dropdown):
            </p>
            <div className="bg-white rounded-lg p-4 text-sm">
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                Location
              </label>
              <select disabled className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded text-slate-700">
                <option>Select location...</option>
                <option>Siem Reap, Krong - 02</option>
                <option>Siem Reap, Siem Reap District - 0202</option>
                <option>Siem Reap, Svay Leu Commune - 020205</option>
                <option selected>Siem Reap, Svay Leu, Sangkat Svay Leu - 02020501</option>
              </select>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">
              Database Storage:
            </p>
            <pre className="bg-white p-4 rounded-lg overflow-x-auto text-xs text-slate-700 border border-slate-300">
              {`location_code: "02020501"
label: "Home"`}
            </pre>
          </div>

          <div className="pt-2 border-t border-emerald-200">
            <p className="text-sm text-emerald-700 font-medium">Benefits:</p>
            <ul className="text-xs text-emerald-600 space-y-1 mt-2">
              <li>• Single column = clean schema</li>
              <li>• Unique identifier (no ambiguity)</li>
              <li>• Auto-validate against Gazetteer</li>
              <li>• 100% data consistency</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
