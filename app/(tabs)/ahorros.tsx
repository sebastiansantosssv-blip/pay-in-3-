import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMemo } from 'react';
import { Header } from '../../src/components/Header';
import { Colors } from '../../src/constants/colors';
import { formatCOP, formatDate } from '../../src/lib/format';
import { useUser } from '../../src/providers/UserProvider';
import { toggleAhorrosFreeze } from '../../src/lib/actions';

const DEMO_AHORROS = [
  { icon: '\u{1F45F}', store: 'Nike \u2014 Zapatillas', totalCompra: 54000, ahorro: 2700, fecha: 'Mar 8, 2026' },
  { icon: '\u2615', store: 'Juan Valdez \u2014 Cafe', totalCompra: 36000, ahorro: 1800, fecha: 'Mar 5, 2026' },
];

export default function AhorrosScreen() {
  const { user, ahorros: rawAhorros, level, refreshUser, refreshAhorros } = useUser();
  const frozen = user?.ahorros_frozen ?? false;
  const userName = user?.nombre || 'Sebastian';

  const historial = useMemo(() => {
    if (!user || rawAhorros.length === 0) return DEMO_AHORROS;
    return rawAhorros
      .filter((a) => a.tipo === 'deposito')
      .map((a) => ({
        icon: a.icono || '\u{1F6CD}\u{FE0F}',
        store: a.tienda || 'Compra',
        totalCompra: a.monto_total || 0,
        ahorro: a.monto,
        fecha: formatDate(new Date(a.created_at)),
      }));
  }, [user, rawAhorros]);

  const totalAhorrado = useMemo(() => {
    if (!user || rawAhorros.length === 0) return DEMO_AHORROS.reduce((a, h) => a + h.ahorro, 0);
    return rawAhorros
      .filter((a) => a.tipo === 'deposito')
      .reduce((acc, a) => acc + a.monto, 0);
  }, [user, rawAhorros]);

  const numAportes = user ? rawAhorros.filter((a) => a.tipo === 'deposito').length : DEMO_AHORROS.length;

  const handleFreeze = async () => {
    if (!user) return;
    await toggleAhorrosFreeze(user.id, !frozen);
    await refreshUser();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Header userName={userName} levelEmoji={level.emoji} levelName={level.name} />

        {/* Savings Card */}
        <View style={styles.ahorroCard}>
          <View style={styles.ahorroTop}>
            <View>
              <Text style={styles.ahorroLabel}>Cuenta de ahorros</Text>
              <Text style={styles.ahorroSaldo}><Text style={styles.ahorroDollar}>$ </Text>{totalAhorrado.toLocaleString('es-CO').replace(/,/g, '.')}</Text>
              <Text style={styles.ahorroSub}>5% de cada compra {'\u00B7'} automatico</Text>
            </View>
            <TouchableOpacity style={[styles.freezeBtn, frozen && styles.freezeBtnFrozen]} onPress={handleFreeze} activeOpacity={0.7}>
              <Text style={[styles.freezeTxt, frozen && styles.freezeTxtFrozen]}>{frozen ? '\u{1F513} Descongelar' : '\u{1F9CA} Congelar'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.estadoRow}>
            <View style={[styles.estadoDot, frozen && styles.estadoDotFrozen]} />
            <Text style={styles.estadoTxt}>{frozen ? 'Cuenta congelada' : 'Cuenta activa'}</Text>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Total ahorrado</Text>
              <Text style={[styles.statVal, { color: Colors.primary }]}>{formatCOP(totalAhorrado)}</Text>
            </View>
            <View style={[styles.stat, styles.statBorder]}>
              <Text style={styles.statLabel}>Aportes</Text>
              <Text style={styles.statVal}>{numAportes} compras</Text>
            </View>
            <View style={[styles.stat, styles.statBorder]}>
              <Text style={styles.statLabel}>Por compra</Text>
              <View style={styles.pctBadge}><Text style={styles.pctText}>5%</Text></View>
            </View>
          </View>
        </View>

        {/* History */}
        <Text style={styles.secTitle}>HISTORIAL DE APORTES</Text>
        <View style={styles.histWrap}>
          {historial.length === 0 ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: Colors.textSecondary, fontSize: 13 }}>Sin aportes aun</Text>
            </View>
          ) : historial.map((h, i) => (
            <View key={i} style={styles.histItem}>
              <View style={styles.histIcon}><Text style={{ fontSize: 18 }}>{h.icon}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.histStore}>{h.store}</Text>
                <Text style={styles.histMeta}>{h.fecha} {'\u00B7'} Compra de {formatCOP(h.totalCompra)}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.histAmt}>+{formatCOP(h.ahorro)}</Text>
                <Text style={styles.histPct}>5% aportado</Text>
              </View>
            </View>
          ))}
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  secTitle: { fontSize: 13, fontFamily: 'DMSans_600SemiBold', color: Colors.textSecondary, letterSpacing: 0.5, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 12 },
  // Card
  ahorroCard: { borderRadius: 24, padding: 24, backgroundColor: Colors.darkGreen, marginHorizontal: 24, marginTop: 20, overflow: 'hidden' },
  ahorroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  ahorroLabel: { fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 0.7, fontFamily: 'DMSans_500Medium', marginBottom: 6 },
  ahorroSaldo: { fontSize: 40, fontFamily: 'DMMono', color: Colors.white, letterSpacing: -1.5, lineHeight: 44 },
  ahorroDollar: { fontSize: 20, opacity: 0.4 },
  ahorroSub: { fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 4 },
  freezeBtn: { backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  freezeBtnFrozen: { backgroundColor: 'rgba(160,210,255,0.15)', borderColor: 'rgba(160,210,255,0.3)' },
  freezeTxt: { fontSize: 12, fontFamily: 'DMSans_600SemiBold', color: 'rgba(255,255,255,0.7)' },
  freezeTxtFrozen: { color: '#a0d2ff' },
  estadoRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 16 },
  estadoDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  estadoDotFrozen: { backgroundColor: '#a0d2ff' },
  estadoTxt: { fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: 'DMSans_500Medium' },
  statsRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)', paddingTop: 16 },
  stat: { flex: 1 },
  statBorder: { borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.08)', paddingLeft: 16 },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 0.6, fontFamily: 'DMSans_500Medium' },
  statVal: { fontSize: 15, fontFamily: 'DMMono_500Medium', color: Colors.white, marginTop: 4 },
  pctBadge: { backgroundColor: '#e6f9ed', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, marginTop: 4, alignSelf: 'flex-start' },
  pctText: { fontSize: 11, fontFamily: 'DMSans_700Bold', color: Colors.primary },
  // History
  histWrap: { paddingHorizontal: 24 },
  histItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  histIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#f0faf3', alignItems: 'center', justifyContent: 'center' },
  histStore: { fontSize: 14, fontFamily: 'DMSans_600SemiBold', color: Colors.darkGreen },
  histMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  histAmt: { fontSize: 15, fontFamily: 'DMMono_500Medium', color: Colors.primary },
  histPct: { fontSize: 10, color: Colors.textSecondary, marginTop: 2 },
});
