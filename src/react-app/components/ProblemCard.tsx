import { ReactNode } from "react";

interface ProblemCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  examples?: string[];
}

export function ProblemCard({ title, description, icon, examples }: ProblemCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg hover:border-red-200 transition-all group h-full">
      <div className="flex flex-col gap-4 h-full">
        <div className="p-3 bg-red-50 rounded-lg w-fit text-red-600 group-hover:bg-red-100 transition-colors">
          {icon}
        </div>
        <div className="flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-red-700 transition-colors">
            {title}
          </h3>
          <p className="text-slate-600 mb-4 leading-relaxed text-sm grow">{description}</p>
          {examples && examples.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-slate-100 mt-auto">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Examples
              </p>
              <ul className="space-y-2">
                {examples.map((example, idx) => (
                  <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                    <span className="text-red-400 mt-1.5 text-[10px]">●</span>
                    <span className="text-slate-700 leading-snug">{example}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
