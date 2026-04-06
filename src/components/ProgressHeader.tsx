import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

interface Props {
  step: number;
  total: number;
  label: string;
}

export function ProgressHeader({ step, total, label }: Props) {
  const pct = Math.round((step / total) * 100);
  return (
    <View style={styles.wrap}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%` }]} />
      </View>
      <Text style={styles.label}>Paso {step} de {total} — {label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 28, paddingTop: 16 },
  track: { height: 3, backgroundColor: '#eee', borderRadius: 2 },
  fill: { height: 3, backgroundColor: Colors.primary, borderRadius: 2 },
  label: { fontSize: 11, color: Colors.textMuted, marginTop: 6, fontFamily: 'DMSans_500Medium', letterSpacing: 0.4, textTransform: 'uppercase' },
});
