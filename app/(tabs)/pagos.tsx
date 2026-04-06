import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useMemo } from 'react';
import { Header } from '../../src/components/Header';
import { PaymentOverlay } from '../../src/components/PaymentOverlay';
import { LevelUpOverlay } from '../../src/components/LevelUpOverlay';
import { Colors } from '../../src/constants/colors';
import { formatCOP, formatDate, formatDateShort, getCurrentMonth, getCurrentYear } from '../../src/lib/format';
import { useUser } from '../../src/providers/UserProvider';
import { pagarCuota } from '../../src/lib/actions';

export default function PagosScreen() {
  const { user, cuotas: rawCuotas, pagos, level, refreshCuotas, refreshUser, refreshPagos } = useUser();
  const [paymentVisible, setPaymentVisible] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentLabel, setPaymentLabel] = useState('');
  const [levelUpVisible, setLevelUpVisible] = useState(false);
  const [levelUpData, setLevelUpData] = useState({ emoji: '', name: '', description: '' });
  const [historyModalVisible, setHistoryModalVisible] = useState(false);

  const pendientes = useMemo(() => {
    if (!user || rawCuotas.length === 0) {
      return [
        { id: '1', icon: '\u{1F45F}', store: 'Nike \u2014 Zapatillas', cuota: 2, total: 3, vence: 'Mar 22', monto: 18000 },
        { id: '2', icon: '\u{1F4F1}', store: 'Alkosto \u2014 Accesorios', cuota: 1, total: 3, vence: 'Abr 5', monto: 28000 },
      ];
    }
    return rawCuotas
      .filter((c) => c.estado === 'pendiente')
      .map((c) => ({
        id: c.id,
        icon: c.icono || '\u{1F6CD}\u{FE0F}',
        store: c.tienda || 'Compra',
        cuota: c.numero_cuota,
        total: c.num_cuotas || 1,
        vence: formatDateShort(new Date(c.fecha_vencimiento)),
        monto: c.monto,
      }));
  }, [user, rawCuotas]);

  const historial = useMemo(() => {
    if (pagos.length === 0) {
      return [
        { icon: '\u{1F45F}', store: 'Nike \u2014 Zapatillas', fecha: 'Mar 8, 2026', monto: 18000 },
        { icon: '\u2615', store: 'Juan Valdez \u2014 Cafe', fecha: 'Mar 5, 2026', monto: 12000 },
        { icon: '\u{1F4DA}', store: 'Libreria Nacional', fecha: 'Feb 28, 2026', monto: 15000 },
      ];
    }
    return pagos.map((p) => ({
      icon: p.icono || '\u{1F4B3}',
      store: p.tienda || 'Pago',
      fecha: formatDate(new Date(p.created_at)),
      monto: p.monto,
    }));
  }, [pagos]);

  const totalPendiente = pendientes.reduce((a, c) => a + c.monto, 0);
  const totalPagado = pagos.reduce((a, p) => a + p.monto, 0) || 82000;
  const userName = user?.nombre || 'Sebastian';

  const handlePay = async (cuotaId: string) => {
    const c = pendientes.find((x) => x.id === cuotaId);
    if (!c || !user) return;
    try {
      const result = await pagarCuota({ cuotaId: c.id, usuarioId: user.id, monto: c.monto, tienda: c.store, icono: c.icon });
      setPaymentAmount(formatCOP(c.monto));
      setPaymentLabel(`${c.store} \u00B7 0% intereses`);
      setPaymentVisible(true);
      if (result.leveledUp && result.newLevel && result.newLevelEmoji) {
        setLevelUpData({ emoji: result.newLevelEmoji, name: result.newLevel, description: 'Nuevo cupo y beneficios desbloqueados' });
        setTimeout(() => setLevelUpVisible(true), 2700);
      }
      await Promise.all([refreshCuotas(), refreshUser(), refreshPagos()]);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Error procesando pago');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <PaymentOverlay visible={paymentVisible} amount={paymentAmount} label={paymentLabel} onDone={() => setPaymentVisible(false)} />
      <LevelUpOverlay visible={levelUpVisible} emoji={levelUpData.emoji} name={levelUpData.name} description={levelUpData.description} onClose={() => setLevelUpVisible(false)} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Header userName={userName} levelEmoji={level.emoji} levelName={level.name} />

        <View style={styles.resumenMes}>
          <Text style={styles.mesLabel}>{getCurrentMonth()} {getCurrentYear()} {'\u00B7'} Resumen</Text>
          <Text style={styles.mesAmount}><Text style={styles.mesDollar}>$ </Text>{totalPagado.toLocaleString('es-CO').replace(/,/g, '.')}</Text>
          <Text style={styles.mesSub}>pagado este mes {'\u00B7'} 0% intereses</Text>
          <View style={styles.mesStats}>
            <View style={styles.mesStat}><Text style={styles.mesStatLabel}>Pagos hechos</Text><Text style={[styles.mesStatVal, { color: Colors.primary }]}>{user?.pagos_a_tiempo || 3}</Text></View>
            <View style={[styles.mesStat, styles.mesStatBorder]}><Text style={styles.mesStatLabel}>Pendientes</Text><Text style={styles.mesStatVal}>{pendientes.length}</Text></View>
            <View style={[styles.mesStat, styles.mesStatBorder]}><Text style={styles.mesStatLabel}>Proximo pago</Text><Text style={styles.mesStatVal}>{pendientes[0]?.vence || '--'}</Text></View>
          </View>
        </View>

        <Text style={styles.secTitle}>{'\u26A0'} PENDIENTES</Text>
        <View style={styles.pendingCard}>
          <View style={styles.pendingHeader}>
            <Text style={styles.pendingTitle}>{pendientes.length} cuota{pendientes.length !== 1 ? 's' : ''} por pagar</Text>
            <Text style={styles.pendingTotal}>{formatCOP(totalPendiente)}</Text>
          </View>
          {pendientes.length === 0 ? (
            <View style={{ padding: 16, alignItems: 'center' }}><Text style={{ color: Colors.textSecondary, fontSize: 13 }}>{'\u2705'} Todo al dia</Text></View>
          ) : pendientes.map((c) => (
            <View key={c.id} style={styles.pendingItem}>
              <View style={styles.pendingLeft}>
                <Text style={{ fontSize: 16 }}>{c.icon}</Text>
                <View><Text style={styles.pStore}>{c.store}</Text><Text style={styles.pDate}>Cuota {c.cuota} de {c.total} {'\u00B7'} vence {c.vence}</Text></View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.pMonto}>{formatCOP(c.monto)}</Text>
                <TouchableOpacity style={styles.payBtn} onPress={() => handlePay(c.id)} activeOpacity={0.8}><Text style={styles.payBtnText}>Pagar</Text></TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.secTitle}>HISTORIAL RECIENTE</Text>
        <View style={styles.histList}>
          {historial.slice(0, 3).map((h, i) => (
            <View key={i} style={styles.histItem}>
              <View style={styles.histIcon}><Text style={{ fontSize: 18 }}>{h.icon}</Text></View>
              <View style={{ flex: 1 }}><Text style={styles.histStore}>{h.store}</Text><Text style={styles.histMeta}>{h.fecha}</Text></View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.histMonto}>{formatCOP(h.monto)}</Text>
                <View style={styles.paidTag}><Text style={styles.paidTagText}>Pagado</Text></View>
              </View>
            </View>
          ))}
        </View>

        {historial.length > 3 && (
          <TouchableOpacity style={styles.verBtn} onPress={() => setHistoryModalVisible(true)} activeOpacity={0.7}>
            <Text style={styles.verBtnText}>Ver historial completo {'\u203A'}</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Full History Modal */}
      <Modal visible={historyModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Historial completo</Text>
            {historial.map((h, i) => (
              <View key={i} style={styles.histItem}>
                <View style={styles.histIcon}><Text style={{ fontSize: 16 }}>{h.icon}</Text></View>
                <View style={{ flex: 1 }}><Text style={styles.histStore}>{h.store}</Text><Text style={styles.histMeta}>{h.fecha}</Text></View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.histMonto}>{formatCOP(h.monto)}</Text>
                  <View style={styles.paidTag}><Text style={styles.paidTagText}>Pagado</Text></View>
                </View>
              </View>
            ))}
            <TouchableOpacity style={styles.modalClose} onPress={() => setHistoryModalVisible(false)}><Text style={styles.modalCloseText}>Cerrar</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  secTitle: { fontSize: 13, fontFamily: 'DMSans_600SemiBold', color: Colors.textSecondary, letterSpacing: 0.5, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 12 },
  resumenMes: { borderRadius: 24, padding: 22, backgroundColor: Colors.darkGreen, marginHorizontal: 24, marginTop: 20, overflow: 'hidden' },
  mesLabel: { fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 0.7, fontFamily: 'DMSans_500Medium', marginBottom: 6 },
  mesAmount: { fontSize: 34, fontFamily: 'DMMono', color: Colors.white, letterSpacing: -1, lineHeight: 38 },
  mesDollar: { fontSize: 16, opacity: 0.45 },
  mesSub: { fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 4, marginBottom: 18 },
  mesStats: { flexDirection: 'row' },
  mesStat: { flex: 1 },
  mesStatBorder: { borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.08)', paddingLeft: 16 },
  mesStatLabel: { fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 0.6, fontFamily: 'DMSans_500Medium' },
  mesStatVal: { fontSize: 14, fontFamily: 'DMMono_500Medium', color: Colors.white, marginTop: 3 },
  pendingCard: { marginHorizontal: 24, backgroundColor: '#fffdf5', borderWidth: 1.5, borderColor: '#f5e6b0', borderRadius: 20, overflow: 'hidden' },
  pendingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#f5e6b0' },
  pendingTitle: { fontSize: 13, fontFamily: 'DMSans_600SemiBold', color: '#8a6000' },
  pendingTotal: { fontSize: 14, fontFamily: 'DMMono_500Medium', color: '#c98a00' },
  pendingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(245,230,176,0.5)' },
  pendingLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  pStore: { fontSize: 13, fontFamily: 'DMSans_600SemiBold', color: Colors.darkGreen },
  pDate: { fontSize: 11, color: '#bbb', marginTop: 1 },
  pMonto: { fontSize: 13, fontFamily: 'DMMono_500Medium', color: '#c98a00' },
  payBtn: { backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 5, marginTop: 3 },
  payBtnText: { fontSize: 11, fontFamily: 'DMSans_700Bold', color: Colors.white },
  histList: { paddingHorizontal: 24, gap: 8 },
  histItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, paddingHorizontal: 14, borderWidth: 1.5, borderColor: Colors.borderLight, borderRadius: 16, backgroundColor: Colors.white },
  histIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center' },
  histStore: { fontSize: 14, fontFamily: 'DMSans_600SemiBold', color: Colors.darkGreen },
  histMeta: { fontSize: 11, color: '#bbb', marginTop: 2 },
  histMonto: { fontSize: 14, fontFamily: 'DMMono_500Medium', color: Colors.darkGreen },
  paidTag: { backgroundColor: Colors.tagPaid, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, marginTop: 4 },
  paidTagText: { fontSize: 10, fontFamily: 'DMSans_700Bold', color: Colors.primary },
  verBtn: { marginHorizontal: 24, marginTop: 10, paddingVertical: 13, backgroundColor: Colors.lightBg, borderWidth: 1.5, borderColor: Colors.borderDark, borderRadius: 16, alignItems: 'center' },
  verBtnText: { fontSize: 13, fontFamily: 'DMSans_600SemiBold', color: Colors.primary },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: Colors.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, maxHeight: '85%' },
  modalHandle: { width: 36, height: 4, backgroundColor: '#eee', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 17, fontFamily: 'DMSans_600SemiBold', color: Colors.darkGreen, marginBottom: 16 },
  modalClose: { width: '100%', paddingVertical: 14, backgroundColor: '#f5f5f5', borderRadius: 14, alignItems: 'center', marginTop: 12 },
  modalCloseText: { fontSize: 14, fontFamily: 'DMSans_600SemiBold', color: '#444' },
});
