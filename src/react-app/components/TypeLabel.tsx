import { Type } from "@/types";

export function TypeLabel({ type }: { type: Type }) {
  return (
    <div
      className={`flex items-center gap-2 px-2.5 py-1 rounded-full border ${
        type === "province" || type === "municipality"
          ? "bg-yellow-50 border-yellow-100 text-yellow-700"
          : type === "district"
            ? "bg-blue-50 border-blue-100 text-blue-700"
            : type === "commune"
              ? "bg-emerald-50 border-emerald-100 text-emerald-700"
              : "bg-slate-50 border-slate-100 text-slate-700"
      }`}
    >
      <div
        className={`size-1.5 rounded-full ${
          type === "province" || type === "municipality"
            ? "bg-yellow-500"
            : type === "district"
              ? "bg-blue-500"
              : type === "commune"
                ? "bg-emerald-500"
                : "bg-slate-500"
        }`}
      />
      <span className="text-xs font-medium capitalize">{type}</span>
    </div>
  );
}
