import type { CollectionPiece } from "../data/collection";
import type { GenderFilter } from "../store/experience";

export type SortKey = "featured" | "price-asc" | "price-desc";

export const SORT_OPTIONS: { id: SortKey; label: string }[] = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price, low to high" },
  { id: "price-desc", label: "Price, high to low" },
];

export interface CollectionQuery {
  gender: GenderFilter;
  /** a category name, or "all" */
  category: string;
  /** free text matched against name, category and fabric */
  search: string;
  sort: SortKey;
}

/** Lower-case and strip accents, so "crepe" finds "crêpe". */
function normalize(text: string): string {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

/**
 * Filters and orders the collection. Every whitespace-separated search term
 * must appear somewhere in the piece's name, category or fabric. "Featured"
 * keeps the curated order; price sorts are stable, so ties keep it too.
 */
export function queryCollection(pieces: readonly CollectionPiece[], q: CollectionQuery): CollectionPiece[] {
  const terms = normalize(q.search).split(/\s+/).filter(Boolean);
  const matched = pieces.filter((p) => {
    if (q.gender !== "all" && p.gender !== q.gender) return false;
    if (q.category !== "all" && p.category !== q.category) return false;
    if (terms.length === 0) return true;
    const haystack = normalize(`${p.name} ${p.category} ${p.fabric}`);
    return terms.every((t) => haystack.includes(t));
  });
  if (q.sort === "price-asc") return [...matched].sort((a, b) => a.price - b.price);
  if (q.sort === "price-desc") return [...matched].sort((a, b) => b.price - a.price);
  return matched;
}
