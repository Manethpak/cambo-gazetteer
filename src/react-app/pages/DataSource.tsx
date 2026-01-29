import {
  Download,
  FileJson,
  Database,
  ExternalLink,
  Info,
  FileSpreadsheet,
  Map,
} from "lucide-react";

interface FileItem {
  name: string;
  description: string;
  size: string;
  path: string;
  icon: React.ReactNode;
}

export function DataSource() {
  const rawFiles: FileItem[] = [
    {
      name: "geo.zip",
      description:
        "Comprehensive GeoJSON collection including administrative boundaries (level 0-3), centroids, and boundary lines.",
      size: "3.2 MB",
      path: "/data/geo.zip",
      icon: (
        <Map className="w-6 h-6 text-indigo-500 group-hover:text-indigo-600" />
      ),
    },
    {
      name: "2024.10.14.xlsx",
      description:
        "Original Excel dataset sourced from Open Development Cambodia. Contains raw data sheets.",
      size: "990 KB",
      path: "/data/2024.10.14.xlsx",
      icon: (
        <FileSpreadsheet className="w-6 h-6 text-emerald-600 group-hover:text-emerald-700" />
      ),
    },
  ];

  const transformedFiles: FileItem[] = [
    {
      name: "gazetteer-normalized.json",
      description:
        "Flat list of all administrative units with parent references. Ideal for database seeding or flat-file processing.",
      size: "5.0 MB",
      path: "/data/gazetteer-normalized.json",
      icon: (
        <FileJson className="w-6 h-6 text-slate-500 group-hover:text-indigo-600" />
      ),
    },

    {
      name: "postal-normalized.json",
      description:
        "Postal codes mapped to administrative units across Cambodia. Normalized and ready for integration.",
      size: "438 KB",
      path: "/data/postal-normalized.json",
      icon: (
        <FileJson className="w-6 h-6 text-slate-500 group-hover:text-indigo-600" />
      ),
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header Section */}
      <section className="bg-slate-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 text-indigo-300 text-sm font-medium mb-8 backdrop-blur-sm">
              <Database className="w-4 h-4" />
              Open Data
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Data Sources & Downloads
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Transparent, open-source, and ready for your next project.
              Download the raw datasets or learn about our sources.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          {/* Attribution Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-12">
            <div className="flex items-start gap-6">
              <div className="p-4 bg-indigo-50 rounded-xl hidden sm:block">
                <Info className="w-8 h-8 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">
                  Data Sources & Attribution
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">
                      Administrative & Postal Data
                    </h3>
                    <p className="text-slate-600 mb-4 leading-relaxed">
                      Sourced from{" "}
                      <strong className="text-slate-900">
                        Open Development Cambodia (ODC)
                      </strong>
                      . Processed and normalized for consistent JSON formats.
                    </p>
                    <a
                      href="https://data.opendevelopmentcambodia.net/dataset/cambodia-gazetteer"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-indigo-600 font-medium hover:text-indigo-700 hover:underline"
                    >
                      Visit ODC Dataset <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">
                      Geospatial Boundaries (GeoJSON)
                    </h3>
                    <p className="text-slate-600 mb-4 leading-relaxed">
                      Boundary data and centroids sourced from{" "}
                      <strong className="text-slate-900">UNOCHA via HDX</strong>
                      . Includes administrative levels 0 through 3.
                    </p>
                    <a
                      href="https://data.humdata.org/dataset/cod-ab-khm"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-indigo-600 font-medium hover:text-indigo-700 hover:underline"
                    >
                      Visit HDX Dataset <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Downloads Section */}
          <div className="space-y-16">
            {/* Raw Data */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                </div>
                Raw Data
              </h2>
              <p className="text-slate-500 mb-8 ml-12">
                Original source files in their native formats.
              </p>
              <div className="grid md:grid-cols-1 gap-4">
                {rawFiles.map((file) => (
                  <DataFileCard key={file.name} file={file} />
                ))}
              </div>
            </div>

            {/* Transformed Data */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <FileJson className="w-5 h-5 text-indigo-600" />
                </div>
                Transform Data
              </h2>
              <p className="text-slate-500 mb-8 ml-12">
                Processed and developer-ready formats for direct integration.
              </p>
              <div className="grid md:grid-cols-1 gap-4">
                {transformedFiles.map((file) => (
                  <DataFileCard key={file.name} file={file} />
                ))}
              </div>
            </div>
          </div>

          {/* License Info */}
          <div className="mt-12 text-center text-slate-500 text-sm">
            <p>
              Data is licensed under the Open Data Commons Open Database License
              (ODbL).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DataFileCard({ file }: { file: FileItem }) {
  return (
    <div className="group bg-white rounded-xl border border-slate-200 p-6 hover:border-indigo-300 hover:shadow-md transition-all duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-slate-100 rounded-lg group-hover:bg-indigo-50 transition-colors">
            {file.icon}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-1 font-mono">
              {file.name}
            </h3>
            <p className="text-slate-600 text-sm mb-2">{file.description}</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
              {file.size}
            </span>
          </div>
        </div>

        <a
          href={file.path}
          download
          className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-indigo-600 transition-colors active:scale-95 whitespace-nowrap"
        >
          <Download className="w-4 h-4" />
          Download
        </a>
      </div>
    </div>
  );
}
