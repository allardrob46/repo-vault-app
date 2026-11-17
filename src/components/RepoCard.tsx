import { useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Repo } from '../data/seed';
import { formatDate, useVault } from '../store';
import { palette, radii, spacing } from '../theme';

const STATUS_STYLE: Record<
  Repo['status'],
  { label: string; bg: string; fg: string; border: string }
> = {
  'FORGE-INSTALLED': {
    label: 'FORGE-INSTALLED',
    bg: palette.brass,
    fg: palette.ink,
    border: palette.brass,
  },
  LATER: { label: 'LATER', bg: 'transparent', fg: palette.sage, border: palette.sage },
  'VAULT-ONLY': {
    label: 'VAULT-ONLY',
    bg: 'transparent',
    fg: palette.muted,
    border: palette.faint,
  },
  UNRESOLVED: {
    label: 'UNRESOLVED',
    bg: 'transparent',
    fg: palette.rust,
    border: palette.rust,
  },
};

function isValidDate(iso: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const d = new Date(iso + 'T00:00:00');
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === iso;
}

interface Props {
  repo: Repo;
  categoryName?: string; // shown in search results, where the shelf isn't obvious
}

export default function RepoCard({ repo, categoryName }: Props) {
  const { updateRepo, deleteRepo, categories } = useVault();
  const [expanded, setExpanded] = useState(false);
  const [editingNote, setEditingNote] = useState(false);
  const [noteDraft, setNoteDraft] = useState(repo.note ?? '');
  const [editingDate, setEditingDate] = useState(false);
  const [dateDraft, setDateDraft] = useState(repo.dateInstalled);
  const [dateError, setDateError] = useState('');

  const status = STATUS_STYLE[repo.status];
  const stars = repo.stars ?? 0;

  const setStars = (n: number) => {
    // Tap the star you already gave to clear the rating.
    updateRepo(repo.id, { stars: n === stars ? null : n });
  };

  const saveNote = () => {
    updateRepo(repo.id, { note: noteDraft.trim() ? noteDraft.trim() : null });
    setEditingNote(false);
  };

  const saveDate = () => {
    if (!isValidDate(dateDraft.trim())) {
      setDateError('Use YYYY-MM-DD, like 2026-09-19.');
      return;
    }
    setDateError('');
    updateRepo(repo.id, { dateInstalled: dateDraft.trim() });
    setEditingDate(false);
  };

  const confirmDelete = () => {
    Alert.alert(
      'Remove this repo?',
      `${repo.name} leaves the vault. This can't be undone.`,
      [
        { text: 'Keep it', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => deleteRepo(repo.id),
        },
      ],
    );
  };

  return (
    <View style={styles.card}>
      <Pressable
        onPress={() => setExpanded((e) => !e)}
        accessibilityRole="button"
        accessibilityLabel={`${repo.name}, ${expanded ? 'collapse' : 'expand'}`}
      >
        <View style={styles.headRow}>
          <Text style={styles.name} numberOfLines={2}>
            {repo.name}
          </Text>
          <Feather
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={palette.faint}
          />
        </View>
        <View style={styles.metaRow}>
          <View style={[styles.badge, { backgroundColor: status.bg, borderColor: status.border }]}>
            <Text style={[styles.badgeText, { color: status.fg }]}>{status.label}</Text>
          </View>
          {categoryName && <Text style={styles.catTag}>{categoryName}</Text>}
        </View>
        <View style={styles.starRow}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Pressable
              key={n}
              onPress={() => setStars(n)}
              hitSlop={6}
              accessibilityLabel={`Rate ${n} star${n === 1 ? '' : 's'}`}
            >
              <Feather
                name="star"
                size={22}
                color={n <= stars ? palette.brass : palette.faint}
                style={styles.star}
              />
            </Pressable>
          ))}
          <Text style={styles.dateText}>Added {formatDate(repo.dateInstalled)}</Text>
        </View>
      </Pressable>

      {expanded && (
        <View style={styles.body}>
          {repo.description ? (
            <Text style={styles.description}>{repo.description}</Text>
          ) : null}

          <Pressable
            style={styles.linkRow}
            onPress={() => Linking.openURL(repo.url)}
            accessibilityRole="link"
          >
            <Feather name="link" size={15} color={palette.brass} />
            <Text style={styles.linkText} numberOfLines={1}>
              {repo.url.replace('https://github.com/', '')}
            </Text>
            <Feather name="external-link" size={15} color={palette.brass} />
          </Pressable>

          <Text style={styles.sectionLabel}>Note</Text>
          {editingNote ? (
            <View>
              <TextInput
                style={styles.input}
                value={noteDraft}
                onChangeText={setNoteDraft}
                placeholder="Your note on this repo…"
                placeholderTextColor={palette.faint}
                multiline
                autoFocus
              />
              <View style={styles.editActions}>
                <Pressable style={styles.saveBtn} onPress={saveNote}>
                  <Text style={styles.saveBtnText}>Save note</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setNoteDraft(repo.note ?? '');
                    setEditingNote(false);
                  }}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable onPress={() => setEditingNote(true)}>
              <Text style={repo.note ? styles.note : styles.noteEmpty}>
                {repo.note ?? 'No note yet — tap to add one.'}
              </Text>
            </Pressable>
          )}

          <Text style={styles.sectionLabel}>Date installed</Text>
          {editingDate ? (
            <View>
              <TextInput
                style={styles.input}
                value={dateDraft}
                onChangeText={(t) => {
                  setDateDraft(t);
                  setDateError('');
                }}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={palette.faint}
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
              />
              {dateError ? <Text style={styles.errorText}>{dateError}</Text> : null}
              <View style={styles.editActions}>
                <Pressable style={styles.saveBtn} onPress={saveDate}>
                  <Text style={styles.saveBtnText}>Save date</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setDateDraft(repo.dateInstalled);
                    setDateError('');
                    setEditingDate(false);
                  }}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable onPress={() => setEditingDate(true)}>
              <Text style={styles.dateValue}>
                {formatDate(repo.dateInstalled)} — tap to change
              </Text>
            </Pressable>
          )}

          <Text style={styles.sectionLabel}>Shelf</Text>
          <View style={styles.chips}>
            {categories.map((c) => (
              <Pressable
                key={c.id}
                style={[
                  styles.chip,
                  c.id === repo.category ? styles.chipActive : styles.chipIdle,
                ]}
                onPress={() => updateRepo(repo.id, { category: c.id })}
              >
                <Text
                  style={
                    c.id === repo.category ? styles.chipTextActive : styles.chipText
                  }
                >
                  {c.name}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable style={styles.deleteRow} onPress={confirmDelete}>
            <Feather name="trash-2" size={15} color={palette.rust} />
            <Text style={styles.deleteText}>Remove from vault</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderRadius: radii.card,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  headRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  name: { color: palette.cream, fontSize: 17, fontWeight: '700', flex: 1, marginRight: spacing.sm },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs, flexWrap: 'wrap' },
  badge: {
    borderWidth: 1,
    borderRadius: radii.chip,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: spacing.xs,
  },
  badgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  catTag: { color: palette.muted, fontSize: 12 },
  starRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  star: { marginRight: 4 },
  dateText: { color: palette.muted, fontSize: 12, marginLeft: 'auto' },
  body: { marginTop: spacing.md, borderTopWidth: 1, borderTopColor: palette.line, paddingTop: spacing.md },
  description: { color: palette.cream, fontSize: 14, lineHeight: 20 },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    backgroundColor: palette.ink,
    borderRadius: radii.button,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  linkText: { color: palette.brass, fontSize: 13, flex: 1, marginHorizontal: spacing.xs },
  sectionLabel: {
    color: palette.muted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  note: { color: palette.cream, fontSize: 14, fontStyle: 'italic', lineHeight: 20 },
  noteEmpty: { color: palette.faint, fontSize: 14, fontStyle: 'italic' },
  dateValue: { color: palette.cream, fontSize: 14 },
  input: {
    backgroundColor: palette.ink,
    color: palette.cream,
    borderRadius: radii.input,
    borderWidth: 1,
    borderColor: palette.line,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    fontSize: 14,
    minHeight: 44,
  },
  editActions: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
  saveBtn: {
    backgroundColor: palette.brass,
    borderRadius: radii.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginRight: spacing.md,
  },
  saveBtnText: { color: palette.ink, fontWeight: '700', fontSize: 13 },
  cancelText: { color: palette.muted, fontSize: 13 },
  errorText: { color: palette.rust, fontSize: 12, marginTop: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: {
    borderRadius: radii.chip,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  chipIdle: { borderColor: palette.faint },
  chipActive: { backgroundColor: palette.brass, borderColor: palette.brass },
  chipText: { color: palette.muted, fontSize: 12 },
  chipTextActive: { color: palette.ink, fontSize: 12, fontWeight: '700' },
  deleteRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md },
  deleteText: { color: palette.rust, fontSize: 13, marginLeft: spacing.xs },
});
