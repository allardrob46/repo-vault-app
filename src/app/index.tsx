import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SearchBar, Button } from '@rneui/themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useVault, isNewRepo } from '../store';
import { searchRepos, shortName } from '../shelves';
import ShelfTile from '../components/ShelfTile';
import RepoCard from '../components/RepoCard';
import CategoryManager from '../components/CategoryManager';
import { palette, radii, spacing } from '../theme';

export default function HomeScreen() {
  const router = useRouter();
  const { loaded, categories, repos } = useVault();
  const [query, setQuery] = useState('');
  const [managing, setManaging] = useState(false);

  const topRated = useMemo(() => repos.filter((r) => (r.stars ?? 0) >= 4), [repos]);
  const fresh = useMemo(() => repos.filter(isNewRepo), [repos]);
  const results = useMemo(() => searchRepos(repos, query), [repos, query]);

  // Shelves in size order — the biggest shelf leads. Categories are data:
  // whatever Rob adds, renames, or deletes shows up here automatically.
  const categoryShelves = useMemo(
    () =>
      categories
        .map((c) => ({ ...c, count: repos.filter((r) => r.category === c.id).length }))
        .sort((a, b) => b.count - a.count),
    [categories, repos],
  );

  const goShelf = (id: string) => router.push({ pathname: '/shelf/[id]', params: { id } });

  if (!loaded) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.loading}>Opening the vault…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.title}>Repo Vault</Text>
            <Text style={styles.rule}>
              Nobody gets everything — everybody gets more than they need.
            </Text>

            <SearchBar
              placeholder="Search the vault…"
              value={query}
              onChangeText={setQuery}
              containerStyle={styles.searchContainer}
              inputContainerStyle={styles.searchInput}
              inputStyle={styles.searchText}
              searchIcon={<Feather name="search" size={18} color={palette.faint} />}
              clearIcon={<Feather name="x" size={18} color={palette.faint} />}
              round
            />

            {query.trim() ? (
              <View>
                <Text style={styles.sectionLabel}>
                  {results.length} {results.length === 1 ? 'match' : 'matches'}
                </Text>
                {results.length === 0 ? (
                  <Text style={styles.empty}>
                    Nothing in the vault matches “{query.trim()}”. Try a shorter
                    word, or add it as a new repo from a shelf.
                  </Text>
                ) : (
                  results.map((r) => (
                    <RepoCard
                      key={r.id}
                      repo={r}
                      categoryName={
                        categories.find((c) => c.id === r.category)?.name
                      }
                    />
                  ))
                )}
              </View>
            ) : (
              <View>
                <Text style={styles.sectionLabel}>The shelves</Text>
                <ShelfTile
                  title="All repos"
                  count={repos.length}
                  preview={repos.slice(0, 3).map((r) => shortName(r.name))}
                  icon="layers"
                  special
                  onPress={() => goShelf('all')}
                />
                <ShelfTile
                  title="Top rated"
                  count={topRated.length}
                  countLabel="4–5 stars"
                  preview={topRated.slice(0, 3).map((r) => shortName(r.name))}
                  icon="star"
                  special
                  onPress={() => goShelf('top')}
                />
                <ShelfTile
                  title="New"
                  count={fresh.length}
                  countLabel="added in the last 60 days"
                  preview={fresh.slice(0, 3).map((r) => shortName(r.name))}
                  icon="clock"
                  special
                  onPress={() => goShelf('new')}
                />
                {categoryShelves.map((c) => (
                  <ShelfTile
                    key={c.id}
                    title={c.name}
                    count={c.count}
                    preview={repos
                      .filter((r) => r.category === c.id)
                      .slice(0, 3)
                      .map((r) => shortName(r.name))}
                    icon="folder"
                    onPress={() => goShelf(c.id)}
                  />
                ))}

                <Button
                  title="Manage shelves"
                  type="outline"
                  onPress={() => setManaging(true)}
                  buttonStyle={styles.manageBtn}
                  titleStyle={styles.manageBtnTitle}
                />
                <Text style={styles.footer}>
                  {repos.length} repos · {categories.length} shelves · saved on this
                  phone
                </Text>
              </View>
            )}
      </ScrollView>
      <CategoryManager visible={managing} onClose={() => setManaging(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.ink },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  loading: { color: palette.muted, fontSize: 16, padding: spacing.lg },
  title: { color: palette.cream, fontSize: 34, fontWeight: '800' },
  rule: {
    color: palette.muted,
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 4,
    marginBottom: spacing.md,
  },
  searchContainer: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    padding: 0,
    marginBottom: spacing.md,
  },
  searchInput: { backgroundColor: palette.surface, borderRadius: radii.chip, height: 46 },
  searchText: { color: palette.cream, fontSize: 15 },
  sectionLabel: {
    color: palette.muted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  empty: { color: palette.muted, fontSize: 14, lineHeight: 20 },
  manageBtn: {
    borderColor: palette.brass,
    borderRadius: radii.button,
    marginTop: spacing.sm,
    minHeight: 48,
  },
  manageBtnTitle: { color: palette.brass, fontWeight: '700', fontSize: 15 },
  footer: { color: palette.faint, fontSize: 12, textAlign: 'center', marginTop: spacing.md },
});
