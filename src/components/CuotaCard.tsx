import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { formatCOP } from '../lib/format';

interface Props {
  icon: string;
  store: string;
  cuota: number;
  total: number;
  vence: string;
  monto: number;
  tag: 'soon' | 'pending' | 'future';
  onPress?: () => void;
}

export function CuotaCard({ icon, store, cuota, total, vence, monto, tag, onPress }: Props) {
  const isFuture = tag === 'future';
  const tagLabel = tag === 'soon' ? 'Vence pronto' : tag === 'future' ? 'Proxima' : 'Pendiente';
  const tagStyle = tag === 'soon' ? styles.tagSoon : tag === 'future' ? styles.tagFuture : styles.tagPending;
  const tagTextStyle = tag === 'soon' ? styles.tagSoonText : tag === 'future' ? styles.tagFutureText : styles.tagPendingText;
  const pct = Math.round((cuota / total) * 100);

  return (
    <TouchableOpacity
      style={[styles.card, isFuture && styles.cardFuture]}
      onPress={onPress}
      activeOpacity={isFuture ? 1 : 0.7}
      disabled={isFuture}
    >
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.store}>{store}</Text>
        <Text style={styles.date}>
          Cuota {cuota} de {total} {'\u00B7'} {isFuture ? `proxima: ${vence}` : `vence ${vence}`}
        </Text>
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${pct}%` }]} />
        </View>
      </View>
      <View style={styles.right}>
        <Text style={styles.monto}>{formatCOP(monto)}</Text>
        <View style={[styles.tag, tagStyle]}>
          <Text style={[styles.tagText, tagTextStyle]}>{tagLabel}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white, borderWidth: 1.5, borderColor: '#eee', borderRadius: 18,
    padding: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  cardFuture: { opacity: 0.45 },
  iconWrap: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 20 },
  info: { flex: 1 },
  store: { fontSize: 14, fontFamily: 'DMSans_600SemiBold', color: Colors.darkGreen },
  date: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  barTrack: { marginTop: 6, height: 3, backgroundColor: '#eee', borderRadius: 2 },
  barFill: { height: 3, backgroundColor: Colors.primary, borderRadius: 2 },
  right: { alignItems: 'flex-end' },
  monto: { fontSize: 14, fontFamily: 'DMMono_500Medium', color: Colors.darkGreen },
  tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, marginTop: 4 },
  tagText: { fontSize: 10, fontFamily: 'DMSans_700Bold' },
  tagSoon: { backgroundColor: Colors.tagSoon },
  tagSoonText: { color: Colors.tagSoonText },
  tagPending: { backgroundColor: Colors.tagPending },
  tagPendingText: { color: Colors.tagPendingText },
  tagFuture: { backgroundColor: Colors.tagFuture },
  tagFutureText: { color: Colors.tagFutureText },
});
