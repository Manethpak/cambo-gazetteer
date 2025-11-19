import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-slate-600 mb-6 overflow-x-auto pb-2">
      <Link
        to="/provinces"
        className="flex items-center hover:text-indigo-600 transition-colors"
      >
        <Home className="w-4 h-4" />
      </Link>

      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2 whitespace-nowrap">
          <ChevronRight className="w-4 h-4 text-slate-400" />
          {item.path ? (
            <Link
              to={item.path}
              className="hover:text-indigo-600 transition-colors font-medium"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-900 font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
