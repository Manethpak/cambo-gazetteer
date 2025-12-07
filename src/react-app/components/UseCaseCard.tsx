import { ReactNode } from "react";

interface UseCaseCardProps {
  title: string;
  problem: string;
  solution: string;
  impact: string;
  icon: ReactNode;
}

export function UseCaseCard({
  title,
  problem,
  solution,
  impact,
  icon,
}: UseCaseCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 hover:border-indigo-300 hover:shadow-md transition-all">
      <div className="flex items-start gap-4 mb-4">
        <div className="p-3 bg-indigo-50 rounded-lg flex-shrink-0">{icon}</div>
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-slate-700 mb-1">Problem:</p>
          <p className="text-sm text-slate-600 leading-relaxed">{problem}</p>
        </div>

        <div className="h-px bg-slate-200"></div>

        <div>
          <p className="text-sm font-medium text-slate-700 mb-1">Solution:</p>
          <p className="text-sm text-slate-600 leading-relaxed">{solution}</p>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
          <p className="text-sm font-medium text-emerald-900">
            Impact: <span className="font-normal">{impact}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
