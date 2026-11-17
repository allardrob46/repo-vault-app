import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SEED_CATEGORIES, SEED_REPOS, Category, Repo } from './data/seed';

const STORAGE_KEY = 'repovault.v1';

export interface VaultState {
  loaded: boolean;
  categories: Category[];
  repos: Repo[];
}

interface VaultActions {
  updateRepo: (id: string, patch: Partial<Repo>) => void;
  addRepo: (draft: { name: string; url: string; description: string; status: Repo['status'] }, categoryId: string) => void;
  deleteRepo: (id: string) => void;
  addCategory: (name: string) => string | null; // returns error message or null
  renameCategory: (id: string, name: string) => string | null;
  deleteCategory: (id: string) => string | null;
}

const VaultContext = createContext<(VaultState & VaultActions) | null>(null);

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [categories, setCategories] = useState<Category[]>(SEED_CATEGORIES);
  const [repos, setRepos] = useState<Repo[]>(SEED_REPOS);

  // First launch: seed from the bundled data, then save. Every change after
  // that is written straight to the phone — stars and notes survive closing.
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed.categories) && Array.isArray(parsed.repos)) {
            setCategories(parsed.categories);
            setRepos(parsed.repos);
          } else {
            await AsyncStorage.setItem(
              STORAGE_KEY,
              JSON.stringify({ categories: SEED_CATEGORIES, repos: SEED_REPOS }),
            );
          }
        } else {
          await AsyncStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ categories: SEED_CATEGORIES, repos: SEED_REPOS }),
          );
        }
      } catch {
        // Storage failed — fall back to the seed in memory. Nothing is lost
        // from the seed file; edits just won't persist this session.
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ categories, repos })).catch(() => {});
  }, [loaded, categories, repos]);

  const value = useMemo<VaultState & VaultActions>(() => {
    const updateRepo = (id: string, patch: Partial<Repo>) =>
      setRepos((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));

    const addRepo: VaultActions['addRepo'] = (draft, categoryId) => {
      const today = new Date();
      const dateInstalled = today.toISOString().slice(0, 10);
      const repo: Repo = {
        id: `r-${Date.now()}`,
        name: draft.name.trim(),
        url: draft.url.trim(),
        description: draft.description.trim(),
        note: null,
        status: draft.status,
        stars: null,
        category: categoryId,
        dateInstalled,
      };
      setRepos((rs) => [repo, ...rs]);
    };

    const deleteRepo = (id: string) =>
      setRepos((rs) => rs.filter((r) => r.id !== id));

    const addCategory: VaultActions['addCategory'] = (name) => {
      const clean = name.trim();
      if (!clean) return 'Give the shelf a name first.';
      if (categories.some((c) => c.name.toLowerCase() === clean.toLowerCase()))
        return 'A shelf with that name already exists.';
      setCategories((cs) => [...cs, { id: `c-${Date.now()}`, name: clean }]);
      return null;
    };

    const renameCategory: VaultActions['renameCategory'] = (id, name) => {
      const clean = name.trim();
      if (!clean) return 'Give the shelf a name first.';
      if (
        categories.some(
          (c) => c.id !== id && c.name.toLowerCase() === clean.toLowerCase(),
        )
      )
        return 'A shelf with that name already exists.';
      setCategories((cs) => cs.map((c) => (c.id === id ? { ...c, name: clean } : c)));
      return null;
    };

    const deleteCategory: VaultActions['deleteCategory'] = (id) => {
      const onShelf = repos.filter((r) => r.category === id).length;
      if (onShelf > 0)
        return `Move the ${onShelf} repo${onShelf === 1 ? '' : 's'} off this shelf first.`;
      setCategories((cs) => cs.filter((c) => c.id !== id));
      return null;
    };

    return {
      loaded,
      categories,
      repos,
      updateRepo,
      addRepo,
      deleteRepo,
      addCategory,
      renameCategory,
      deleteCategory,
    };
  }, [loaded, categories, repos]);

  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>;
}

export function useVault() {
  const ctx = useContext(VaultContext);
  if (!ctx) throw new Error('useVault must be used inside VaultProvider');
  return ctx;
}

/** Repos added in the last 60 days — the "New" shelf. Real window, no fake data. */
export function isNewRepo(repo: Repo): boolean {
  const added = new Date(repo.dateInstalled + 'T00:00:00').getTime();
  if (Number.isNaN(added)) return false;
  const days = (Date.now() - added) / (1000 * 60 * 60 * 24);
  return days >= 0 && days <= 60;
}

export function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
