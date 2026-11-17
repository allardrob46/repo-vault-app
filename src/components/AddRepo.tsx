import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Overlay, Button } from '@rneui/themed';
import { Feather } from '@expo/vector-icons';
import { Repo } from '../data/seed';
import { useVault } from '../store';
import { palette, radii, spacing } from '../theme';

/** Add a repo to a shelf. Name + link are required; the rest is optional. */
export default function AddRepo({
  visible,
  categoryId,
  categoryName,
  onClose,
}: {
  visible: boolean;
  categoryId: string;
  categoryName: string;
  onClose: () => void;
}) {
  const { addRepo } = useVault();
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Repo['status']>('LATER');
  const [error, setError] = useState('');

  const reset = () => {
    setName('');
    setUrl('');
    setDescription('');
    setStatus('LATER');
    setError('');
  };

  const submit = () => {
    if (!name.trim()) {
      setError('Give the repo a name — owner/repo works best.');
      return;
    }
    if (!/^https?:\/\/.+/.test(url.trim())) {
      setError('Add the link — it has to start with https://');
      return;
    }
    addRepo({ name, url, description, status }, categoryId);
    reset();
    onClose();
  };

  return (
    <Overlay
      isVisible={visible}
      onBackdropPress={() => {
        reset();
        onClose();
      }}
      overlayStyle={styles.overlay}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Add to {categoryName}</Text>
        <Pressable
          onPress={() => {
            reset();
            onClose();
          }}
          hitSlop={8}
          accessibilityLabel="Close"
        >
          <Feather name="x" size={24} color={palette.muted} />
        </Pressable>
      </View>

      <Text style={styles.label}>Repo name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="owner/repo"
        placeholderTextColor={palette.faint}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Text style={styles.label}>Link</Text>
      <TextInput
        style={styles.input}
        value={url}
        onChangeText={setUrl}
        placeholder="https://github.com/owner/repo"
        placeholderTextColor={palette.faint}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Text style={styles.label}>What it is (optional)</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={description}
        onChangeText={setDescription}
        placeholder="One line on what it does…"
        placeholderTextColor={palette.faint}
        multiline
      />
      <Text style={styles.label}>Status</Text>
      <View style={styles.chips}>
        {(['FORGE-INSTALLED', 'LATER', 'VAULT-ONLY'] as const).map((s) => (
          <Pressable
            key={s}
            style={[styles.chip, status === s ? styles.chipActive : styles.chipIdle]}
            onPress={() => setStatus(s)}
          >
            <Text style={status === s ? styles.chipTextActive : styles.chipText}>{s}</Text>
          </Pressable>
        ))}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <Button
        title="Add to shelf"
        onPress={submit}
        buttonStyle={styles.addBtn}
        titleStyle={styles.addBtnTitle}
      />
      <Text style={styles.fine}>Dated today. You can change the date on the card.</Text>
    </Overlay>
  );
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: palette.surface,
    borderRadius: radii.tile,
    width: '92%',
    padding: spacing.md,
    maxHeight: '88%',
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: palette.cream, fontSize: 19, fontWeight: '700' },
  label: {
    color: palette.muted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
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
  multiline: { minHeight: 64, textAlignVertical: 'top' },
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
  errorText: { color: palette.rust, fontSize: 12, marginTop: spacing.xs },
  addBtn: { backgroundColor: palette.brass, borderRadius: radii.button, marginTop: spacing.md, minHeight: 48 },
  addBtnTitle: { color: palette.ink, fontWeight: '700', fontSize: 15 },
  fine: { color: palette.faint, fontSize: 12, textAlign: 'center', marginTop: spacing.sm },
});
