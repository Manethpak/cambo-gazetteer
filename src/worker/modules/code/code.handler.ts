import { getFullHierarchy, buildBreadcrumb } from "~/db/queries";
import { DatabaseType } from "~/db";

/**
 * Get location details by code with full hierarchy context
 */
export async function getLocationByCode(db: DatabaseType, code: string) {
  const hierarchy = await getFullHierarchy(db, code);

  if (!hierarchy.current) {
    return null;
  }

  const breadcrumb = buildBreadcrumb(hierarchy.ancestors, hierarchy.current);

  return {
    ...hierarchy.current,
    breadcrumb,
    path: breadcrumb.map((b) => b.name_en).join(", "),
    path_km: breadcrumb.map((b) => b.name_km).join(", "),
    ancestors: hierarchy.ancestors,
    children: hierarchy.descendants,
    siblings: hierarchy.siblings,
    childrenCount: hierarchy.childrenCount,
  };
}
