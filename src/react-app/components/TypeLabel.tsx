import { Type } from "@/types";

export function TypeLabel({ type, className }: { type: Type; className?: string }) {
  const getColors = () => {
    switch (type) {
      case Type.PROVINCE:
      case Type.MUNICIPALTY:
        return "bg-amber-50 border-amber-100 text-amber-700";
      case Type.DISTRICT:
        return "bg-indigo-50 border-indigo-100 text-indigo-700";
      case Type.COMMUNE:
        return "bg-emerald-50 border-emerald-100 text-emerald-700";
      case Type.VILLAGE:
        return "bg-slate-50 border-slate-100 text-slate-700";
      default:
        return "bg-slate-50 border-slate-100 text-slate-700";
    }
  };

  const getDotColors = () => {
    switch (type) {
      case Type.PROVINCE:
      case Type.MUNICIPALTY:
        return "bg-amber-500";
      case Type.DISTRICT:
        return "bg-indigo-500";
      case Type.COMMUNE:
        return "bg-emerald-500";
      case Type.VILLAGE:
        return "bg-slate-500";
      default:
        return "bg-slate-500";
    }
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider ${getColors()} ${className}`}
    >
      <div className={`size-1 rounded-full ${getDotColors()}`} />
      {type}
    </div>
  );
}
