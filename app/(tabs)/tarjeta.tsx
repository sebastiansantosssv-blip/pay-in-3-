import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Header } from '../../src/components/Header';
import { PaymentOverlay } from '../../src/components/PaymentOverlay';
import { Colors } from '../../src/constants/colors';
import { formatCOP } from '../../src/lib/format';
import { useUser } from '../../src/providers/UserProvider';
import { crearCompra, toggleCardFreeze } from '../../src/lib/actions';

const EMOJIS = ['\u{1F6CD}\u{FE0F}', '\u{1F45F}', '\u{1F4F1}', '\u{1F3AE}', '\u{1F457}', '\u{1F484}', '\u{1F3E0}', '\u2708\u{FE0F}'];

export default function TarjetaScreen() {
  const { user, level, refreshCuotas, refreshUser, refreshAhorros } = useUser();
  const [cardFlipped, setCardFlipped] = useState(false);
  const [cvvVisible, setCvvVisible] = useState(false);

  // Purchase form
  const [selectedEmoji, setSelectedEmoji] = useState(EMOJIS[0]);
  const [tienda, setTienda] = useState('');
  const [monto, setMonto] = useState('');
  const [numCuotas, setNumCuotas] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paymentVisible, setPaymentVisible] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentLabel, setPaymentLabel] = useState('');

  const frozen = user?.card_frozen ?? false;
  const montoNum = parseInt(monto) || 0;
  const cuotaMonto = numCuotas > 0 ? Math.ceil(montoNum / numCuotas) : 0;
  const userName = user?.nombre || 'Sebastian';
  const holderName = `${userName} ${user?.apellido || 'Perez'}`.toUpperCase();

  const handleFreeze = async () => {
    if (!user) return;
    try {
      await toggleCardFreeze(user.id, !frozen);
      await refreshUser();
    } catch (e: any) {
      Alert.alert('Error', e?.message);
    }
  };

  const handleCompra = async () => {
    if (!tienda.trim() || montoNum <= 0) {
      Alert.alert('Datos incompletos', 'Completa el comercio y monto');
      return;
    }
    if (!user) {
      Alert.alert('Sesion', 'Inicia sesion para hacer compras');
      return;
    }
    if (frozen) {
      Alert.alert('Tarjeta congelada', 'Descongela tu tarjeta para hacer compras');
      return;
    }

    const disponible = (user.cupo_total || level.cupo) - (user.cupo_usado || 0);
    if (montoNum > disponible) {
      Alert.alert('Cupo insuficiente', `Tu cupo disponible es ${formatCOP(disponible)}`);
      return;
    }

    setLoading(true);
    try {
      await crearCompra({
        usuarioId: user.id,
        icono: selectedEmoji,
        tienda: tienda.trim(),
        montoTotal: montoNum,
        numCuotas,
      });

      setPaymentAmount(formatCOP(montoNum));
      setPaymentLabel(`${tienda.trim()} \u00B7 0% intereses`);
      setPaymentVisible(true);

      setTienda('');
      setMonto('');
      setNumCuotas(1);
      setSelectedEmoji(EMOJIS[0]);

      await Promise.all([refreshCuotas(), refreshUser(), refreshAhorros()]);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Error creando compra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <PaymentOverlay visible={paymentVisible} amount={paymentAmount} label={paymentLabel} onDone={() => setPaymentVisible(false)} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Header userName={userName} levelEmoji={level.emoji} levelName={level.name} />

        {/* Virtual Card */}
        <TouchableOpacity style={styles.cardScene} onPress={() => setCardFlipped(!cardFlipped)} activeOpacity={0.95}>
          {!cardFlipped ? (
            <View style={styles.cardFront}>
              <View style={styles.cardTopRow}><Text style={styles.cardBrand}>Pay in 3</Text></View>
              <View style={styles.chip}><View style={styles.chipLineH} /><View style={styles.chipLineV} /></View>
              <Text style={styles.cardNumber}>4532 {'\u2022\u2022\u2022\u2022'} {'\u2022\u2022\u2022\u2022'} 8821</Text>
              <View style={styles.cardBottom}>
                <View><Text style={styles.cardLabel}>CARD HOLDER</Text><Text style={styles.cardName}>{holderName}</Text></View>
                <View style={{ alignItems: 'flex-end' }}><Text style={styles.cardLabel}>EXPIRES</Text><Text style={styles.cardExpiry}>03/28</Text></View>
                <Text style={styles.visaLogo}>VISA</Text>
              </View>
            </View>
          ) : (
            <View style={styles.cardBack}>
              <View style={styles.magStrip} />
              <View style={styles.cvvRow}><View style={styles.cvvBar}>
                <Text style={styles.cvvSquiggle}>{'/'}</Text>
                <TouchableOpacity onPress={() => setCvvVisible(!cvvVisible)}>
                  <Text style={styles.cvvNumber}>{cvvVisible ? '924' : '\u2022\u2022\u2022'}</Text>
                </TouchableOpacity>
              </View></View>
              <Text style={styles.cvvLabel}>CVV / Security code</Text>
              <View style={styles.backBottom}>
                <View><Text style={styles.backBrand}>Pay in 3</Text><Text style={styles.backNote}>Tarjeta virtual {'\u00B7'} Visa{'\n'}hola@payin3.co</Text></View>
                <Text style={[styles.visaLogo, { fontSize: 18, opacity: 0.5 }]}>VISA</Text>
              </View>
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.flipHint}>{'\u21BB'} Toca para voltear</Text>

        {/* Card Status */}
        <View style={styles.statusRow}>
          <View style={styles.statusLeft}>
            <View style={[styles.statusDot, frozen && styles.statusDotFrozen]} />
            <View>
              <Text style={styles.statusTxt}>{frozen ? 'Tarjeta congelada' : 'Tarjeta activa'}</Text>
              <Text style={styles.statusSub}>{frozen ? 'No se pueden realizar compras' : 'Lista para usar en cualquier comercio'}</Text>
            </View>
          </View>
          <TouchableOpacity style={[styles.freezeBtn, frozen && styles.freezeBtnFrozen]} onPress={handleFreeze} activeOpacity={0.7}>
            <Text style={[styles.freezeTxt, frozen && styles.freezeTxtFrozen]}>{frozen ? 'Descongelar' : 'Congelar'}</Text>
          </TouchableOpacity>
        </View>

        {/* Purchase Form */}
        <Text style={styles.secTitle}>NUEVA COMPRA</Text>
        <View style={styles.compraCard}>
          <View style={styles.emojiRow}>
            {EMOJIS.map((e) => (
              <TouchableOpacity key={e} style={[styles.emojiOpt, selectedEmoji === e && styles.emojiSelected]} onPress={() => setSelectedEmoji(e)}>
                <Text style={styles.emojiText}>{e}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput style={styles.compraInput} placeholder="Donde compraste?" value={tienda} onChangeText={setTienda} />
          <TextInput style={styles.compraInput} placeholder="Monto total ($)" value={monto} onChangeText={setMonto} keyboardType="numeric" />
          <Text style={styles.cuotasLabel}>NUMERO DE CUOTAS</Text>
          <View style={styles.cuotasRow}>
            {Array.from({ length: Math.max(level.maxCuotas, 1) }, (_, i) => i + 1).map((n) => (
              <TouchableOpacity key={n} style={[styles.cuotaOpt, numCuotas === n && styles.cuotaOptSelected]} onPress={() => setNumCuotas(n)}>
                <Text style={[styles.cuotaOptN, numCuotas === n && styles.cuotaOptNSel]}>{n}</Text>
                <Text style={[styles.cuotaOptL, numCuotas === n && styles.cuotaOptLSel]}>cuota{n > 1 ? 's' : ''}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {montoNum > 0 && tienda.trim() && (
            <View style={styles.preview}>
              <View style={styles.prevRow}><Text style={styles.prevKey}>Cuota mensual</Text><Text style={styles.prevVal}>{formatCOP(cuotaMonto)} x {numCuotas}</Text></View>
              <View style={styles.prevRow}><Text style={styles.prevKey}>Total a pagar</Text><Text style={styles.prevVal}>{formatCOP(montoNum)}</Text></View>
              <View style={styles.prevRow}><Text style={styles.prevKey}>Ahorro (5%)</Text><Text style={[styles.prevVal, { color: Colors.primary }]}>+{formatCOP(Math.round(montoNum * 0.05))}</Text></View>
              <View style={[styles.prevRow, styles.prevRowLast]}><Text style={[styles.prevKey, { color: Colors.primary, fontFamily: 'DMSans_600SemiBold' }]}>Intereses</Text><Text style={[styles.prevVal, { color: Colors.primary }]}>$0 {'\u2014'} siempre</Text></View>
            </View>
          )}
          <TouchableOpacity style={[styles.confirmBtn, loading && { opacity: 0.6 }]} onPress={handleCompra} disabled={loading} activeOpacity={0.8}>
            <Text style={styles.confirmBtnText}>{loading ? 'Procesando...' : 'Confirmar compra'}</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  cardScene: { marginHorizontal: 32, marginTop: 28, height: 196, borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.28, shadowRadius: 30, elevation: 10 },
  cardFront: { flex: 1, backgroundColor: '#0d2b1a', borderRadius: 16, padding: 20, paddingHorizontal: 22, justifyContent: 'space-between' },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between' },
  cardBrand: { fontSize: 13, fontFamily: 'DMSans_600SemiBold', color: 'rgba(255,255,255,0.75)', letterSpacing: 0.6, textTransform: 'uppercase' },
  chip: { width: 38, height: 28, borderRadius: 5, backgroundColor: '#c8a84b', overflow: 'hidden', marginTop: 10 },
  chipLineH: { position: 'absolute', top: '50%', left: 0, right: 0, height: 1, backgroundColor: 'rgba(100,70,0,0.35)' },
  chipLineV: { position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(100,70,0,0.35)' },
  cardNumber: { fontFamily: 'DMMono', fontSize: 16, color: Colors.white, letterSpacing: 2.5, marginTop: 2 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  cardLabel: { fontSize: 8, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 3 },
  cardName: { fontSize: 12, fontFamily: 'DMMono', color: 'rgba(255,255,255,0.9)', letterSpacing: 0.8, textTransform: 'uppercase' },
  cardExpiry: { fontSize: 12, fontFamily: 'DMMono', color: 'rgba(255,255,255,0.9)', letterSpacing: 1 },
  visaLogo: { fontSize: 22, fontFamily: 'DMSans_700Bold', color: Colors.white, fontStyle: 'italic', letterSpacing: -1, opacity: 0.92 },
  cardBack: { flex: 1, backgroundColor: '#0d2b1a', borderRadius: 16 },
  magStrip: { width: '100%', height: 40, backgroundColor: '#050f08', marginTop: 22 },
  cvvRow: { paddingHorizontal: 22, paddingTop: 12 },
  cvvBar: { flex: 1, height: 34, backgroundColor: '#f0ece4', borderRadius: 3, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, justifyContent: 'space-between' },
  cvvSquiggle: { fontSize: 10, color: '#999', fontStyle: 'italic' },
  cvvNumber: { fontFamily: 'DMMono_500Medium', fontSize: 14, color: '#1a1a1a', letterSpacing: 3 },
  cvvLabel: { fontSize: 9, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 1, paddingHorizontal: 22, paddingTop: 5 },
  backBottom: { paddingHorizontal: 22, paddingVertical: 10, marginTop: 'auto', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  backBrand: { fontSize: 11, fontFamily: 'DMSans_600SemiBold', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.6 },
  backNote: { fontSize: 7.5, color: 'rgba(255,255,255,0.2)', lineHeight: 12, marginTop: 4 },
  flipHint: { textAlign: 'center', fontSize: 12, color: '#bbb', marginVertical: 6 },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 24, marginTop: 16, backgroundColor: Colors.lightBg, borderWidth: 1.5, borderColor: Colors.borderDark, borderRadius: 18, padding: 14, paddingHorizontal: 18 },
  statusLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  statusDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  statusDotFrozen: { backgroundColor: Colors.frozen },
  statusTxt: { fontSize: 14, fontFamily: 'DMSans_600SemiBold', color: Colors.darkGreen },
  statusSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 1 },
  freezeBtn: { backgroundColor: Colors.white, borderWidth: 1.5, borderColor: '#e0f0e7', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6 },
  freezeBtnFrozen: { backgroundColor: Colors.frozenBg, borderColor: '#a0c4e8' },
  freezeTxt: { fontSize: 12, fontFamily: 'DMSans_600SemiBold', color: '#444' },
  freezeTxtFrozen: { color: '#2a6fa8' },
  secTitle: { fontSize: 13, fontFamily: 'DMSans_600SemiBold', color: Colors.textSecondary, letterSpacing: 0.5, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 12 },
  compraCard: { marginHorizontal: 24, backgroundColor: Colors.lightBg, borderWidth: 1.5, borderColor: Colors.borderDark, borderRadius: 22, padding: 18, gap: 10 },
  emojiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  emojiOpt: { width: 38, height: 38, borderRadius: 12, borderWidth: 1.5, borderColor: '#e0f0e7', backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center' },
  emojiSelected: { borderColor: Colors.primary, backgroundColor: '#f0faf3' },
  emojiText: { fontSize: 18 },
  compraInput: { width: '100%', padding: 12, paddingHorizontal: 14, borderWidth: 1.5, borderColor: '#e0f0e7', borderRadius: 14, fontSize: 14, fontFamily: 'DMSans', color: Colors.black, backgroundColor: Colors.white },
  cuotasLabel: { fontSize: 11, color: Colors.textSecondary, fontFamily: 'DMSans_600SemiBold', letterSpacing: 0.4, marginTop: 4 },
  cuotasRow: { flexDirection: 'row', gap: 8 },
  cuotaOpt: { flex: 1, paddingVertical: 10, borderWidth: 1.5, borderColor: '#e0f0e7', borderRadius: 12, alignItems: 'center', backgroundColor: Colors.white },
  cuotaOptSelected: { backgroundColor: Colors.darkGreen, borderColor: Colors.darkGreen },
  cuotaOptN: { fontSize: 16, fontFamily: 'DMSans_700Bold', color: Colors.darkGreen },
  cuotaOptNSel: { color: Colors.primary },
  cuotaOptL: { fontSize: 10, color: Colors.textSecondary, marginTop: 2 },
  cuotaOptLSel: { color: 'rgba(29,185,84,0.6)' },
  preview: { backgroundColor: Colors.white, borderWidth: 1.5, borderColor: '#e0f0e7', borderRadius: 14, padding: 12, paddingHorizontal: 14 },
  prevRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  prevRowLast: { marginBottom: 0, paddingTop: 8, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  prevKey: { fontSize: 12, color: Colors.textSecondary },
  prevVal: { fontSize: 12, fontFamily: 'DMSans_600SemiBold', color: Colors.darkGreen },
  confirmBtn: { backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  confirmBtnText: { fontSize: 14, fontFamily: 'DMSans_600SemiBold', color: Colors.white },
});
