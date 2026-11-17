import { Repo, Category } from './data/seed';
import { isNewRepo } from './store';

export type ShelfId = 'all' | 'top' | 'new' | string; // string = category id

export interface Shelf {
  id: ShelfId;
  title: string;
  kind: 'all' | 'top' | 'new' | 'category';
  repos: Repo[];
}

/** Resolve a shelf id to its title + repos. Special shelves are computed live. */
export function resolveShelf(
  shelfId: string,
  categories: Category[],
  repos: Repo[],
): Shelf | null {
  if (shelfId === 'all') {
    return { id: 'all', title: 'All repos', kind: 'all', repos: [...repos] };
  }
  if (shelfId === 'top') {
    return {
      id: 'top',
      title: 'Top rated',
      kind: 'top',
      repos: repos.filter((r) => (r.stars ?? 0) >= 4),
    };
  }
  if (shelfId === 'new') {
    return {
      id: 'new',
      title: 'New',
      kind: 'new',
      repos: repos.filter(isNewRepo),
    };
  }
  const cat = categories.find((c) => c.id === shelfId);
  if (!cat) return null;
  return {
    id: cat.id,
    title: cat.name,
    kind: 'category',
    repos: repos.filter((r) => r.category === cat.id),
  };
}

/** Short display name for a repo: "Tencent/WeKnora" stays, long names truncate. */
export function shortName(name: string): string {
  return name.length > 22 ? name.slice(0, 21) + '…' : name;
}

export function searchRepos(repos: Repo[], query: string): Repo[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return repos.filter((r) =>
    [r.name, r.description, r.note ?? '', r.url]
      .join(' ')
      .toLowerCase()
      .includes(q),
  );
}
