interface CodeComparisonProps {
  beforeTitle?: string;
  afterTitle?: string;
}

export function CodeComparison({
  beforeTitle = "Without Gazetteer",
  afterTitle = "With Gazetteer",
}: CodeComparisonProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Before */}
      <div className="bg-slate-900 rounded-xl p-6 overflow-hidden border border-slate-700">
        <h3 className="text-sm font-bold text-red-400 mb-4 flex items-center gap-2">
          <span>❌</span> {beforeTitle}
        </h3>
        <pre className="text-xs text-slate-300 overflow-x-auto">
          <code>{`// Database schema (fragmented)
interface UserAddress {
  province: string;    // free text
  district: string;    // needs validation
  commune: string;     // mixed Khmer/English
  village: string;     // optional, missing
  notes?: string;      // workaround for bad data
}

// Validation nightmare
async function validateAddress(
  addr: UserAddress
) {
  // Hard-coded list of provinces?
  // Check against multiple sources?
  // No reliable validation for subdivisions
  return ??? // How do we validate?
}`}</code>
        </pre>
      </div>

      {/* After */}
      <div className="bg-slate-900 rounded-xl p-6 overflow-hidden border border-emerald-700">
        <h3 className="text-sm font-bold text-emerald-400 mb-4 flex items-center gap-2">
          <span>✅</span> {afterTitle}
        </h3>
        <pre className="text-xs text-slate-300 overflow-x-auto">
          <code>{`// Database schema (standardized)
interface UserAddress {
  location_code: string;  // e.g., "02020501"
  label?: string;         // "Home", "Office"
}

// Validation is trivial
async function validateAddress(
  locationCode: string
) {
  const location =
    await gazetteer.getByCode(
      locationCode
    );
  return !!location;  // either exists or not
}

// Fetch full address when needed
const addr =
  await gazetteer.getByCode("02020501");
// → { code, name_km, name_en, ... }`}</code>
        </pre>
      </div>
    </div>
  );
}
