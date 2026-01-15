import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ChevronDown, Folder, FolderOpen, MapPin, Loader2, Building2, Home } from "lucide-react";
import { AdministrativeUnit, ResponseByCode, Type } from "@/types";
import { getEnglishName, getKhmerName } from "@/libs/name";

interface DirectoryTreeProps {
  items: AdministrativeUnit[];
}

export function DirectoryTree({ items }: DirectoryTreeProps) {
  return (
    <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm">
      <div className="bg-slate-50/80 backdrop-blur-sm px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest px-8">Administrative Unit / ទីតាំងរដ្ឋបាល</span>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest w-32 text-center">Code / លេខកូដ</span>
      </div>
      <div className="divide-y divide-slate-100">
        {items.map((item) => (
          <DirectoryItem key={item.code} unit={item} level={0} />
        ))}
      </div>
    </div>
  );
}

interface DirectoryItemProps {
  unit: AdministrativeUnit;
  level: number;
}

function DirectoryItem({ unit, level }: DirectoryItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [children, setChildren] = useState<AdministrativeUnit[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Determine if this unit can have children (Villages are leaf nodes)
  const isLeaf = unit.type === Type.VILLAGE;
  
  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLeaf) return;

    if (isOpen) {
      setIsOpen(false);
      return;
    }

    setIsOpen(true);

    if (!hasLoaded) {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/code/${unit.code}`);
        const data: ResponseByCode = await res.json();
        if (data.children) {
          const sortedChildren = data.children.sort((a, b) => Number(a.code) - Number(b.code));
          setChildren(sortedChildren);
        }
        setHasLoaded(true);
      } catch (error) {
        console.error("Failed to load children", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const padLeft = level * 32 + 20; // Increased indentation for better visual hierarchy

  return (
    <div className="bg-white">
      <div 
        className={`
          relative flex items-center justify-between py-4 pr-6 hover:bg-slate-50 transition-all cursor-pointer group
          ${isOpen ? "bg-brand-50/30" : ""}
          ${level === 0 ? "border-l-4 border-l-transparent hover:border-l-brand-500" : ""}
        `}
        style={{ paddingLeft: `${padLeft}px` }}
        onClick={handleToggle}
      >
        <div className="flex items-center gap-4">
          {/* Toggle Icon or Spacer */}
          {!isLeaf ? (
            <div 
              className={`p-1 rounded-lg transition-colors ${isOpen ? 'bg-brand-100/50 text-brand-600' : 'text-slate-400 group-hover:bg-slate-200/50'}`}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </div>
          ) : (
             <div className="w-6 flex justify-center">
               <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-brand-400" />
             </div>
          )}

          {/* Unit Icon */}
          <div className={`${isOpen ? "text-brand-600" : "text-slate-400 group-hover:text-brand-500"}`}>
             {getUnitIcon(unit.type, isOpen)}
          </div>

          <div className="flex flex-col gap-0.5">
            <span className={`font-khmer text-base leading-tight ${isOpen ? "text-brand-700 font-bold" : "text-slate-900 font-semibold"}`}>
              {getKhmerName(unit)}
            </span>
            <span className="text-sm text-slate-500 font-medium tracking-tight">
              {getEnglishName(unit)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
           {/* Link to detail page */}
          <Link 
            to={`/code/${unit.code}`}
            onClick={(e) => e.stopPropagation()} 
            className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1.5 rounded-xl hover:bg-brand-100 transition-all border border-brand-100"
          >
            Details <ChevronRight className="size-3" />
          </Link>
          
          <span className={`
            font-mono text-sm font-bold tracking-wider px-4 py-1.5 rounded-xl transition-all w-32 text-center
            ${isOpen ? "bg-brand-600 text-white shadow-lg shadow-brand-500/20" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700"}
          `}>
            {unit.code}
          </span>
        </div>
      </div>

      {/* Children */}
      {isOpen && (
        <div className="animate-in slide-in-from-top-1 duration-200">
           {children.length > 0 ? (
             children.map(child => (
               <DirectoryItem key={child.code} unit={child} level={level + 1} />
             ))
           ) : loading ? null : (
             <div className="py-4 text-sm text-slate-400 italic flex items-center gap-2" style={{ paddingLeft: `${padLeft + 48}px` }}>
               <div className="w-4 h-px bg-slate-200" />
               No items found
             </div>
           )}
        </div>
      )}
    </div>
  );
}

function getUnitIcon(type: string, isOpen: boolean) {
  switch (type) {
    case Type.PROVINCE:
    case Type.MUNICIPALTY:
      return isOpen ? <FolderOpen className="w-5 h-5" /> : <Folder className="w-5 h-5" />;
    case Type.DISTRICT:
      return <Building2 className="w-4 h-4" />;
    case Type.COMMUNE:
      return <Home className="w-4 h-4" />;
    case Type.VILLAGE:
      return <MapPin className="w-4 h-4" />;
    default:
      return <Folder className="w-4 h-4" />;
  }
}
