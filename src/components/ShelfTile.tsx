import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { palette, radii, spacing } from '../theme';

interface Props {
  title: string;
  count: number;
  countLabel?: string;
  preview: string[]; // real repo names sitting on this shelf — the tile shows them
  icon: keyof typeof Feather.glyphMap;
  special?: boolean; // All / Top rated / New get a brass shelf edge; categories get wood
  onPress: () => void;
}

/**
 * A shelf, not a card. The tile reads like a labelled shelf in a store:
 * big name, what's sitting on it, and a board edge underneath.
 * The edge color means something: brass = a built-in shelf, wood = Rob's own.
 */
export default function ShelfTile({
  title,
  count,
  countLabel,
  preview,
  icon,
  special,
  onPress,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${count} repos`}
    >
      <View style={styles.topRow}>
        <View style={styles.iconBox}>
          <Feather name={icon} size={22} color={palette.brass} />
        </View>
        <View style={styles.titleBox}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.count}>
            {count} {countLabel ?? (count === 1 ? 'repo' : 'repos')}
          </Text>
        </View>
        <Feather name="chevron-right" size={22} color={palette.faint} />
      </View>
      {preview.length > 0 && (
        <Text style={styles.preview} numberOfLines={1}>
          {preview.join('  ·  ')}
        </Text>
      )}
      <View style={[styles.edge, special ? styles.edgeBrass : styles.edgeWood]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    backgroundColor: palette.surface2,
    borderRadius: radii.tile,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  pressed: { opacity: 0.82 },
  topRow: { flexDirection: 'row', alignItems: 'center' },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: palette.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  titleBox: { flex: 1 },
  title: { color: palette.cream, fontSize: 20, fontWeight: '700' },
  count: { color: palette.muted, fontSize: 13, marginTop: 2 },
  preview: {
    color: palette.faint,
    fontSize: 12,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  edge: { height: 6, marginHorizontal: -spacing.md, marginTop: 2 },
  edgeBrass: { backgroundColor: palette.brass },
  edgeWood: { backgroundColor: palette.board },
});
