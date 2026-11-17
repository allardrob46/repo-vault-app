import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Overlay, Button } from '@rneui/themed';
import { Feather } from '@expo/vector-icons';
import { useVault } from '../store';
import { palette, radii, spacing } from '../theme';

/**
 * Manage shelves — Rob's explicit ask. Categories are data, never hardcoded:
 * add a shelf, rename one, delete an empty one. A shelf with repos on it
 * can't be deleted until its repos are moved — the app says so plainly.
 */
export default function CategoryManager({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { categories, repos, addCategory, renameCategory, deleteCategory } = useVault();
  const [newName, setNewName] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState('');
  const [error, setError] = useState('');

  const submitAdd = () => {
    const err = addCategory(newName);
    if (err) {
      setError(err);
      return;
    }
    setError('');
    setNewName('');
  };

  const submitRename = (id: string) => {
    const err = renameCategory(id, renameDraft);
    if (err) {
      setError(err);
      return;
    }
    setError('');
    setRenamingId(null);
  };

  const tryDelete = (id: string) => {
    const err = deleteCategory(id);
    if (err) setError(err);
    else setError('');
  };

  return (
    <Overlay
      isVisible={visible}
      onBackdropPress={onClose}
      overlayStyle={styles.overlay}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Manage shelves</Text>
        <Pressable onPress={onClose} hitSlop={8} accessibilityLabel="Close">
          <Feather name="x" size={24} color={palette.muted} />
        </Pressable>
      </View>
      <Text style={styles.sub}>
        Shelves are yours — add, rename, or delete them as you see fit. A shelf
        with repos on it cannot be deleted until you move them off it.
      </Text>

      {categories.map((c) => {
        const count = repos.filter((r) => r.category === c.id).length;
        return (
          <View key={c.id} style={styles.row}>
            {renamingId === c.id ? (
              <View style={styles.renameBox}>
                <TextInput
                  style={[styles.input, styles.renameInput]}
                  value={renameDraft}
                  onChangeText={setRenameDraft}
                  autoFocus
                  placeholderTextColor={palette.faint}
                />
                <Pressable
                  style={styles.saveBtn}
                  onPress={() => submitRename(c.id)}
                >
                  <Text style={styles.saveBtnText}>Save</Text>
                </Pressable>
                <Pressable onPress={() => setRenamingId(null)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
              </View>
            ) : (
              <>
                <Pressable
                  style={styles.nameBox}
                  onPress={() => {
                    setRenamingId(c.id);
                    setRenameDraft(c.name);
                    setError('');
                  }}
                >
                  <Text style={styles.name}>{c.name}</Text>
                  <Text style={styles.count}>
                    {count} {count === 1 ? 'repo' : 'repos'}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => tryDelete(c.id)}
                  hitSlop={8}
                  accessibilityLabel={`Delete shelf ${c.name}`}
                >
                  <Feather name="trash-2" size={18} color={palette.rust} />
                </Pressable>
              </>
            )}
          </View>
        );
      })}

      <View style={styles.addRow}>
        <TextInput
          style={[styles.input, styles.addInput]}
          value={newName}
          onChangeText={(t) => {
            setNewName(t);
            setError('');
          }}
          placeholder="New shelf name…"
          placeholderTextColor={palette.faint}
          onSubmitEditing={submitAdd}
        />
        <Button
          title="Add shelf"
          onPress={submitAdd}
          buttonStyle={styles.addBtn}
          titleStyle={styles.addBtnTitle}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </Overlay>
  );
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: palette.surface,
    borderRadius: radii.tile,
    width: '92%',
    padding: spacing.md,
    maxHeight: '85%',
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: palette.cream, fontSize: 19, fontWeight: '700' },
  sub: { color: palette.muted, fontSize: 13, lineHeight: 18, marginTop: spacing.xs, marginBottom: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: palette.line,
  },
  nameBox: { flex: 1 },
  name: { color: palette.cream, fontSize: 16, fontWeight: '600' },
  count: { color: palette.muted, fontSize: 12, marginTop: 2 },
  renameBox: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  renameInput: { flex: 1, marginRight: spacing.xs },
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
  saveBtn: {
    backgroundColor: palette.brass,
    borderRadius: radii.button,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginRight: spacing.sm,
  },
  saveBtnText: { color: palette.ink, fontWeight: '700', fontSize: 13 },
  cancelText: { color: palette.muted, fontSize: 13 },
  addRow: { flexDirection: 'row', marginTop: spacing.md },
  addInput: { flex: 1, marginRight: spacing.sm },
  addBtn: { backgroundColor: palette.brass, borderRadius: radii.button, minHeight: 44 },
  addBtnTitle: { color: palette.ink, fontWeight: '700', fontSize: 14 },
  errorText: { color: palette.rust, fontSize: 12, marginTop: spacing.xs },
});
