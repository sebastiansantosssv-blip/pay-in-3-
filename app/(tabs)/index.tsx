import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { Header } from '../../src/components/Header';
import { CupoCard } from '../../src/components/CupoCard';
import { CuotaCard } from '../../src/components/CuotaCard';
import { PaymentOverlay } from '../../src/components/PaymentOverlay';
import { LevelUpOverlay } from '../../src/components/LevelUpOverlay';
import { Colors } from '../../src/constants/colors';
import { formatCOP, formatDateShort } from '../../src/lib/format';
import { useUser } from '../../src/providers/UserProvider';
import { pagarCuota, pagarTodo } from '../../src/lib/actions';

// Demo fallback when not authenticated
const DEMO_CUOTAS = [
  { id: '1', icon: '\u{1F45F}', store: 'Nike \u2014 Zapatillas', cuota: 2, total: 3, vence: 'Mar 22', monto: 18000, tag: 'soon' as const },
  { id: '2', icon: '\u{1F4F1}', store: 'Alkosto \u2014 Accesorios', cuota: 1, total: 3, vence: 'Abr 5', monto: 28000, tag: 'pending' as const },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user, cuotas: rawCuotas, level, refreshCuotas, refreshUser, refreshPagos } = useUser();

  const [paymentVisible, setPaymentVisible] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentLabel, setPaymentLabel] = useState('');
  const [levelUpVisible, setLevelUpVisible] = useState(false);
  const [levelUpData, setLevelUpData] = useState({ emoji: '', name: '', description: '' });

  // Transform Supabase cuotas to display format
  const cuotas = useMemo(() => {
    if (!user || rawCuotas.length === 0) return DEMO_CUOTAS;
    return rawCuotas
      .filter((c) => c.estado === 'pendiente')
      .map((c) => {
        const venceDate = new Date(c.fecha_vencimiento);
        const now = new Date();
        const daysUntil = Math.ceil((venceDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const tag: 'soon' | 'pending' | 'future' = daysUntil <= 7 ? 'soon' : daysUntil <= 30 ? 'pending' : 'future';
        return {
          id: c.id,
          icon: c.icono || '\u{1F6CD}\u{FE0F}',
          store: c.tienda || 'Compra',
          cuota: c.numero_cuota,
          total: c.num_cuotas || 1,
          vence: formatDateShort(venceDate),
          monto: c.monto,
          tag,
        };
      });
  }, [user, rawCuotas]);

  const pendientes = cuotas.filter((c) => c.tag !== 'future');
  const totalPendiente = pendientes.reduce((acc, c) => acc + c.monto, 0);
  const proximoPago = pendientes.length > 0 ? pendientes[0].vence : '--';

  const handlePayCuota = async (cuotaId: string) => {
    const c = cuotas.find((x) => x.id === cuotaId);
    if (!c || !user) return;

    try {
      const result = await pagarCuota({
        cuotaId: c.id,
        usuarioId: user.id,
        monto: c.monto,
        tienda: c.store,
        icono: c.icon,
      });

      setPaymentAmount(formatCOP(c.monto));
      setPaymentLabel(`${c.store} \u00B7 0% intereses`);
      setPaymentVisible(true);

      if (result.leveledUp && result.newLevel && result.newLevelEmoji) {
        setLevelUpData({ emoji: result.newLevelEmoji, name: result.newLevel, description: `Nuevo cupo y beneficios desbloqueados` });
        setTimeout(() => setLevelUpVisible(true), 2700);
      }

      await Promise.all([refreshCuotas(), refreshUser(), refreshPagos()]);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Error procesando pago');
    }
  };

  const handlePayAll = async () => {
    if (!user || pendientes.length === 0) return;

    try {
      const result = await pagarTodo({
        cuotas: pendientes.map((c) => ({ id: c.id, monto: c.monto, tienda: c.store, icono: c.icon })),
        usuarioId: user.id,
      });

      setPaymentAmount(formatCOP(result.totalPagado));
      setPaymentLabel('Todos los pagos \u00B7 0% intereses');
      setPaymentVisible(true);

      if (result.leveledUp && result.newLevel && result.newLevelEmoji) {
        setLevelUpData({ emoji: result.newLevelEmoji, name: result.newLevel, description: 'Nuevo cupo y beneficios desbloqueados' });
        setTimeout(() => setLevelUpVisible(true), 2700);
      }

      await Promise.all([refreshCuotas(), refreshUser(), refreshPagos()]);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Error procesando pagos');
    }
  };

  const userName = user?.nombre || 'Sebastian';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <PaymentOverlay visible={paymentVisible} amount={paymentAmount} label={paymentLabel} onDone={() => setPaymentVisible(false)} />
      <LevelUpOverlay visible={levelUpVisible} emoji={levelUpData.emoji} name={levelUpData.name} description={levelUpData.description} onClose={() => setLevelUpVisible(false)} />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Header userName={userName} levelEmoji={level.emoji} levelName={level.name} />
        <CupoCard
          cupoTotal={user?.cupo_total || level.cupo}
          cupoUsado={totalPendiente}
          comprasActivas={pendientes.length}
          proximoPago={proximoPago}
        />

        <Text style={styles.secTitle}>CUOTAS ACTIVAS</Text>
        <View style={styles.cuotasWrap}>
          {cuotas.length === 0 ? (
            <Text style={styles.emptyText}>{'\u2705'} Sin cuotas pendientes</Text>
          ) : (
            cuotas.map((c) => (
              <CuotaCard key={c.id} {...c} onPress={() => handlePayCuota(c.id)} />
            ))
          )}
        </View>

        {pendientes.length > 0 && (
          <View style={styles.resumenCard}>
            <View>
              <Text style={styles.resLabel}>Total pendiente</Text>
              <Text style={styles.resVal}>{formatCOP(totalPendiente)}</Text>
              <Text style={styles.resSub}>{pendientes.length} cuota{pendientes.length !== 1 ? 's' : ''} este mes</Text>
            </View>
            <TouchableOpacity style={styles.greenBtn} onPress={handlePayAll} activeOpacity={0.8}>
              <Text style={styles.greenBtnText}>Pagar todo</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Settings link */}
        <TouchableOpacity style={styles.settingsLink} onPress={() => router.push('/settings')} activeOpacity={0.7}>
          <Text style={styles.settingsText}>{'\u2699\u{FE0F}'} Configuracion</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scroll: { flex: 1 },
  secTitle: {
    fontSize: 13, fontFamily: 'DMSans_600SemiBold', color: Colors.textSecondary,
    letterSpacing: 0.5, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 12,
  },
  cuotasWrap: { paddingHorizontal: 24, gap: 10 },
  emptyText: { textAlign: 'center', padding: 20, color: Colors.textSecondary, fontSize: 14 },
  resumenCard: {
    marginHorizontal: 24, marginTop: 14, backgroundColor: Colors.lightBg,
    borderWidth: 1.5, borderColor: Colors.borderDark, borderRadius: 20,
    padding: 16, paddingHorizontal: 20, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
  },
  resLabel: { fontSize: 12, color: Colors.textSecondary, fontFamily: 'DMSans_500Medium', textTransform: 'uppercase', letterSpacing: 0.4 },
  resVal: { fontSize: 20, fontFamily: 'DMMono', color: Colors.darkGreen, marginTop: 2 },
  resSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  greenBtn: { backgroundColor: Colors.primary, borderRadius: 14, paddingHorizontal: 18, paddingVertical: 10 },
  greenBtnText: { fontSize: 13, fontFamily: 'DMSans_600SemiBold', color: Colors.white },
  settingsLink: { marginHorizontal: 24, marginTop: 20, paddingVertical: 14, alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 14 },
  settingsText: { fontSize: 14, fontFamily: 'DMSans_600SemiBold', color: Colors.textLight },
});
