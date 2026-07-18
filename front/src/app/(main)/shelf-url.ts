export const SHELF_FILTERS = ["all", "reading", "finished", "wishlist"] as const;
export type ShelfFilter = (typeof SHELF_FILTERS)[number];

export const SHELF_SORTS = ["recent", "title", "author"] as const;
export type ShelfSort = (typeof SHELF_SORTS)[number];

export interface ShelfParams {
  status: ShelfFilter;
  view: "shelf" | "grid";
  q: string;
  sort: ShelfSort;
}

/** 기본값이 아닌 파라미터만 포함한 서재 URL을 만든다 */
export function shelfUrl(params: ShelfParams): string {
  const sp = new URLSearchParams();
  if (params.status !== "all") sp.set("status", params.status);
  if (params.view !== "shelf") sp.set("view", params.view);
  if (params.q !== "") sp.set("q", params.q);
  if (params.sort !== "recent") sp.set("sort", params.sort);
  const query = sp.toString();
  return query ? `/?${query}` : "/";
}
