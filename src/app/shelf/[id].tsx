import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SearchBar } from '@rneui/themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useVault } from '../../store';
import { resolveShelf, searchRepos } from '../../shelves';
import RepoCard from '../../components/RepoCard';
import AddRepo from '../../components/AddRepo';
import { palette, radii, spacing } from '../../theme';

const EMPTY_COPY: Record<string, string> = {
  top: 'No 4–5 star repos yet. Tap the stars on any card to rate it, and the best of the vault gathers here.',
  new: 'Nothing added in the last 60 days yet. Add a repo and it shows up here first.',
  all: 'The vault is empty. Add a repo from a shelf to start the collection.',
};

export default function ShelfScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { loaded, categories, repos } = useVault();
  const [query, setQuery] = useState('');
  const [adding, setAdding] = useState(false);

  const shelf = useMemo(
    () => (loaded ? resolveShelf(id, categories, repos) : null),
    [loaded, id, categories, repos],
  );

  const shown = useMemo(
    () => (shelf ? searchRepos(shelf.repos, query) : []),
    [shelf, query],
  );

  if (!loaded || !shelf) {
    return (
      <SafeAreaView style={styles.safe}>
        <Pressable style={styles.backRow} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={palette.brass} />
          <Text style={styles.backText}>Shelves</Text>
        </Pressable>
        <Text style={styles.empty}>
          {loaded ? 'That shelf does not exist anymore.' : 'Opening the vault…'}
        </Text>
      </SafeAreaView>
    );
  }

  const list = query.trim() ? shown : shelf.repos;
  const emptyCopy =
    shelf.kind === 'category'
      ? `Nothing on the ${shelf.title} shelf yet. Add the first repo.`
      : EMPTY_COPY[shelf.kind];

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable style={styles.backRow} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={palette.brass} />
          <Text style={styles.backText}>Shelves</Text>
        </Pressable>

        <View style={styles.headRow}>
          <View style={styles.headText}>
            <Text style={styles.title}>{shelf.title}</Text>
            <Text style={styles.count}>
              {shelf.repos.length} {shelf.repos.length === 1 ? 'repo' : 'repos'}
            </Text>
          </View>
          {shelf.kind === 'category' && (
            <Pressable
              style={styles.addBtn}
              onPress={() => setAdding(true)}
              accessibilityLabel={`Add a repo to ${shelf.title}`}
            >
              <Feather name="plus" size={22} color={palette.ink} />
            </Pressable>
          )}
        </View>

        <SearchBar
          placeholder={`Search ${shelf.title.toLowerCase()}…`}
          value={query}
          onChangeText={setQuery}
          containerStyle={styles.searchContainer}
          inputContainerStyle={styles.searchInput}
          inputStyle={styles.searchText}
          searchIcon={<Feather name="search" size={18} color={palette.faint} />}
          clearIcon={<Feather name="x" size={18} color={palette.faint} />}
          round
        />

        {list.length === 0 ? (
          <Text style={styles.empty}>
            {query.trim()
              ? `Nothing on this shelf matches “${query.trim()}”.`
              : emptyCopy}
          </Text>
        ) : (
          list.map((r) => <RepoCard key={r.id} repo={r} />)
        )}
      </ScrollView>

      {shelf.kind === 'category' && (
        <AddRepo
          visible={adding}
          categoryId={shelf.id}
          categoryName={shelf.title}
          onClose={() => setAdding(false)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.ink },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  backRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  backText: { color: palette.brass, fontSize: 15, marginLeft: spacing.xs },
  headRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headText: { flex: 1 },
  title: { color: palette.cream, fontSize: 28, fontWeight: '800' },
  count: { color: palette.muted, fontSize: 13, marginTop: 2 },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.brass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    padding: 0,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  searchInput: { backgroundColor: palette.surface, borderRadius: radii.chip, height: 46 },
  searchText: { color: palette.cream, fontSize: 15 },
  empty: { color: palette.muted, fontSize: 14, lineHeight: 20 },
});
