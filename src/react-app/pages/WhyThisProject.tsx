import { Package, AlertCircle } from "lucide-react";
import { ProblemCard } from "../components/ProblemCard";
import { SolutionComparison } from "../components/SolutionComparison";
import { CodeComparison } from "../components/CodeComparison";

export function WhyThisProject() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-linear-to-b from-slate-900 to-slate-800 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526374965328-7f5ae4e8b161?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-5 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-linear-to-b from-slate-900/50 via-slate-900/80 to-slate-900"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-[100px] mix-blend-screen"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] mix-blend-screen"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 text-red-300 text-sm font-medium mb-6 backdrop-blur-sm">
              <AlertCircle className="w-4 h-4" />
              The Real Problem
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-8 tracking-tight leading-tight">
              Why Cambodia Needed This
            </h1>

            <p className="text-xl text-slate-300 mb-8 leading-relaxed max-w-3xl">
              Location data in Cambodia is fragmented across systems, mistranslated across
              languages, and stored in inconsistent ways. This creates real problems for developers,
              businesses, and government agencies trying to build reliable systems.
            </p>

            <p className="text-lg text-slate-400">
              Discover how Cambodia Gazetteer solves this with a unified, standardized approach to
              geographical data.
            </p>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="py-16 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                The Problem: Fragmented Data
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Every time you fill out a form with your address in Cambodia, you encounter
                inconsistencies. When developers store this data, they struggle with the lack of
                standardization.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <ProblemCard
                title="Mistranslation & Inconsistency"
                description="The same location is written differently across systems. District names have multiple English spellings, mixed Khmer/English entries, and no standardized source of truth."
                icon={<AlertCircle className="w-6 h-6 text-red-600" />}
                examples={[
                  "Mongkol Borei vs Mongkol Borey vs Mongkul Bourey",
                  "Siem Reap District vs Krong Siem Reap vs ក្រុងសៀមរាប",
                  "Svay Leu vs ឃុំស្វាយលើ (no English equivalent)",
                ]}
              />

              <ProblemCard
                title="Fragmented Database Storage"
                description="Applications store location data across 4-5 separate columns (province, district, commune, village). This creates redundant schemas and makes querying difficult."
                icon={<Package className="w-6 h-6 text-red-600" />}
                examples={["province | district | commune | village"]}
              />

              <ProblemCard
                title="Data Quality Issues"
                description="Without a standard, location data becomes unreliable. Free-text fields lead to typos, incomplete data, and no way to validate against authoritative sources."
                icon={<AlertCircle className="w-6 h-6 text-red-600" />}
                examples={[
                  "Village field left blank (no required validation)",
                  "Typos: 'Siem Reap' spelled 5 different ways",
                  "No way to detect or correct address mismatches",
                ]}
              />
            </div>

            {/* Real-world Government Example */}
            <div className="mt-12 bg-amber-50 border-l-4 border-amber-600 rounded-r-xl overflow-hidden">
              <div className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-amber-900 mb-1">
                      Real-World Example: Government Citizen Data
                    </h3>
                    <p className="text-sm text-amber-700">
                      How address data is actually stored in government systems
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-semibold text-amber-900 mb-3">
                      Current Address Format:
                    </p>
                    <div className="bg-white p-4 rounded-lg border border-amber-200">
                      <code className="text-sm text-slate-700 block">
                        "លេខផ្ទះ, ផ្លូវ, ឃុំ/សង្កាត់, ស្រុក/ក្រុង, ខេត្ត/រាជធានី"
                      </code>
                      <p className="text-xs text-slate-500 mt-2">
                        (home/building, street, commune, district, province)
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-amber-900 mb-3">
                      Birth Address Format:
                    </p>
                    <div className="bg-white p-4 rounded-lg border border-amber-200">
                      <code className="text-sm text-slate-700 block">
                        "ឃុំ/សង្កាត់, ស្រុក/ក្រុង, ខេត្ត/រាជធានី"
                      </code>
                      <p className="text-xs text-slate-500 mt-2">(commune, district, province)</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-amber-200">
                  <p className="text-amber-800 leading-relaxed mb-3">
                    <strong className="text-amber-900">The Problem:</strong> Government databases
                    store citizen addresses as free-text strings in Khmer. Each field is manually
                    entered, leading to:
                  </p>
                  <ul className="space-y-2 text-sm text-amber-800">
                    <li className="flex gap-2">
                      <span className="text-amber-600">•</span>
                      <span>Inconsistent spelling and formatting across different records</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-amber-600">•</span>
                      <span>No validation against official administrative divisions</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-amber-600">•</span>
                      <span>Difficult to query, aggregate, or analyze location-based data</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-amber-600">•</span>
                      <span>
                        Translation errors when converting between Khmer and English systems
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Solution Section */}
      <section className="py-20 bg-slate-50 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                The Solution: Single Unified Code
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Instead of storing fragmented data across columns, use a single administrative code.
                One code contains everything—location name in Khmer & English, hierarchy, and
                metadata.
              </p>
            </div>

            <div className="mt-12 p-8 bg-white rounded-xl border border-slate-200 mb-8">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Code Structure Explained</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-3">Administrative Codes:</p>
                  <div className="space-y-2 text-sm font-mono">
                    <div>
                      <span className="text-slate-500">Province:</span>
                      <code className="ml-2 bg-indigo-50 px-2 py-1 rounded text-indigo-700">
                        02
                      </code>{" "}
                      (Siem Reap)
                    </div>
                    <div>
                      <span className="text-slate-500">District:</span>
                      <code className="ml-2 bg-indigo-50 px-2 py-1 rounded text-indigo-700">
                        0202
                      </code>{" "}
                      (Siem Reap District)
                    </div>
                    <div>
                      <span className="text-slate-500">Commune:</span>
                      <code className="ml-2 bg-indigo-50 px-2 py-1 rounded text-indigo-700">
                        020205
                      </code>{" "}
                      (Svay Leu)
                    </div>
                    <div>
                      <span className="text-slate-500">Village:</span>
                      <code className="ml-2 bg-indigo-50 px-2 py-1 rounded text-indigo-700">
                        02020501
                      </code>{" "}
                      (Specific village)
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-3">API Response:</p>
                  <pre className="bg-slate-900 text-slate-200 p-4 rounded text-xs overflow-x-auto">
                    {`{
  "code": "02020501",
  "name_km": "ឃុំស្វាយលើ",
  "name_en": "Svay Leu",
  "type": "village",
  "parent_code": "020205"
}`}
                  </pre>
                </div>
              </div>
            </div>

            <SolutionComparison />
          </div>
        </div>
      </section>

      {/* Code Comparison Section */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                See how the code becomes simpler, cleaner, and more reliable with a unified
                approach.
              </p>
            </div>

            <CodeComparison />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-linear-to-r from-indigo-600 to-purple-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516321318423-f06f70d504f0?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-linear-to-r from-indigo-600/90 to-purple-600/90"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Build Better?</h2>
            <p className="text-xl text-indigo-100 mb-10 leading-relaxed">
              Start using Cambodia Gazetteer in your next project. Standardize your location data,
              simplify your code, and ship faster.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/api/docs"
                target="_blank"
                className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-all hover:shadow-lg hover:shadow-indigo-600/20 active:scale-95"
              >
                Explore API Docs
              </a>
              <a
                href="/provinces"
                className="px-8 py-4 bg-indigo-700 text-white rounded-xl font-bold hover:bg-indigo-800 transition-all border border-indigo-500 active:scale-95"
              >
                Browse Data
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
