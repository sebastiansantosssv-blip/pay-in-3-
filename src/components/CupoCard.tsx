import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { formatCOP } from '../lib/format';

interface Props {
  cupoTotal: number;
  cupoUsado: number;
  comprasActivas: number;
  proximoPago: string;
}

export function CupoCard({ cupoTotal, cupoUsado, comprasActivas, proximoPago }: Props) {
  const disponible = cupoTotal - cupoUsado;
  const pct = cupoTotal > 0 ? Math.round((cupoUsado / cupoTotal) * 100) : 0;

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Cupo disponible</Text>
      <Text style={styles.amount}>
        <Text style={styles.dollar}>$ </Text>
        {disponible.toLocaleString('es-CO').replace(/,/g, '.')}
      </Text>
      <Text style={styles.sub}>de {formatCOP(cupoTotal)} COP {'\u00B7'} sin intereses</Text>

      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${Math.min(pct, 100)}%` }]} />
      </View>

      <View style={styles.meta}>
        <View>
          <Text style={styles.metaLabel}>Usado</Text>
          <Text style={styles.metaVal}>{formatCOP(cupoUsado)}</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.metaLabel}>Cuotas activas</Text>
          <Text style={styles.metaVal}>{comprasActivas} compra{comprasActivas !== 1 ? 's' : ''}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.metaLabel}>Proximo pago</Text>
          <Text style={styles.metaVal}>{proximoPago}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24, padding: 22, paddingBottom: 20, backgroundColor: Colors.darkGreen,
    marginHorizontal: 24, marginTop: 20, overflow: 'hidden',
  },
  label: { fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 0.7, fontFamily: 'DMSans_500Medium', marginBottom: 6 },
  amount: { fontSize: 36, fontFamily: 'DMMono', color: Colors.white, letterSpacing: -1, lineHeight: 40 },
  dollar: { fontSize: 18, opacity: 0.45 },
  sub: { fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 4, marginBottom: 16 },
  barTrack: { height: 5, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, marginBottom: 8 },
  barFill: { height: 5, backgroundColor: Colors.primary, borderRadius: 4 },
  meta: { flexDirection: 'row', justifyContent: 'space-between' },
  metaLabel: { fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 0.4 },
  metaVal: { fontSize: 13, color: Colors.white, fontFamily: 'DMSans_600SemiBold', marginTop: 2 },
});
