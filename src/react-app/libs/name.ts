import { AdministrativeUnit } from "@/types";

export function getKhmerName(unit: AdministrativeUnit) {
    // Check if name already starts with the type to avoid duplication
    if (unit.name_km.startsWith(unit.type_km)) {
        return unit.name_km;
    }
    return `${unit.type_km} ${unit.name_km}`;
}

export function getEnglishName(unit: AdministrativeUnit) {
    if (unit.type === "province") {
        return unit.name_en;
    } else if (["district", "commune", "village"].includes(unit.type)) {
        // Check if name already starts with the type to avoid duplication
        if (unit.name_en.startsWith(unit.type_en)) {
            return unit.name_en;
        }
        return `${unit.type_en} ${unit.name_en}`;
    }
    return `${unit.type_en} ${unit.name_en}`;
}
