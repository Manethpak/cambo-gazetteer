import type { Database, LocationDetail } from "~/types";
import { getFullHierarchy, buildBreadcrumb } from "~/db/queries";

/**
 * Get location details by code with full hierarchy context
 */
export async function getLocationByCode(
  db: Database,
  code: string
): Promise<LocationDetail | null> {
  const hierarchy = await getFullHierarchy(db, code);

  if (!hierarchy.current) {
    return null;
  }

  const breadcrumb = buildBreadcrumb(hierarchy.ancestors, hierarchy.current);

  return {
    ...hierarchy.current,
    breadcrumb,
    path: breadcrumb.map((b) => b.nameEn).join(" > "),
    ancestors: hierarchy.ancestors,
    children: hierarchy.descendants,
    siblings: hierarchy.siblings,
    childrenCount: hierarchy.childrenCount,
  };
}
