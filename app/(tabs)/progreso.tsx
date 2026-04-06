import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMemo } from 'react';
import { Header } from '../../src/components/Header';
import { Colors } from '../../src/constants/colors';
import { getNextLevel, LEVELS } from '../../src/constants/levels';
import { formatCOP } from '../../src/lib/format';
import { useUser } from '../../src/providers/UserProvider';

export default function ProgresoScreen() {
  const { user, cuotas, level } = useUser();
  const pagosATiempo = user?.pagos_a_tiempo ?? 3;
  const userName = user?.nombre || 'Sebastian';

  const next = getNextLevel(pagosATiempo);
  const prevMin = level.min;
  const nextMin = next ? next.min : level.min + 1;
  const pct = next ? Math.min(Math.round(((pagosATiempo - prevMin) / (nextMin - prevMin)) * 100), 100) : 100;
  const faltan = next ? nextMin - pagosATiempo : 0;

  const numCompras = useMemo(() => {
    if (!user) return 2;
    const uniqueCompras = new Set(cuotas.map((c) => c.compra_id));
    return uniqueCompras.size;
  }, [user, cuotas]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Header userName={userName} levelEmoji={level.emoji} levelName={level.name} />

        {/* Level Card */}
        <View style={styles.levelCard}>
          <View style={styles.levelTop}>
            <View>
              <Text style={styles.levelLabel}>Tu nivel actual</Text>
              <Text style={styles.levelName}>{level.name}</Text>
            </View>
            <Text style={styles.levelEmoji}>{level.emoji}</Text>
          </View>
          <View>
            <View style={styles.progRow}>
              <Text style={styles.progLabel}>Progreso al siguiente nivel</Text>
              <Text style={styles.progPct}>{pct}%</Text>
            </View>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${pct}%` }]} />
            </View>
            <Text style={styles.faltanText}>
              Faltan <Text style={styles.faltanBold}>{faltan} pagos a tiempo</Text>{next ? ` para ser ${next.name} ${next.emoji}` : ''}
            </Text>
          </View>
        </View>

        {/* Metrics */}
        <Text style={styles.secTitle}>TUS METRICAS</Text>
        <View style={styles.metricsRow}>
          {[
            { icon: '\u2705', val: pagosATiempo, label: 'A tiempo', green: true },
            { icon: '\u{1F6CD}\u{FE0F}', val: numCompras, label: 'Compras', green: false },
            { icon: '\u{1F4C5}', val: user?.pagos_tardios ?? 0, label: 'Tardios', green: true },
            { icon: '\u26A1', val: user?.puntos ?? pagosATiempo * 11, label: 'Puntos', green: false },
          ].map((m, i) => (
            <View key={i} style={[styles.metricItem, i > 0 && styles.metricBorder]}>
              <Text style={styles.metricIcon}>{m.icon}</Text>
              <Text style={[styles.metricVal, m.green && { color: Colors.primary }]}>{m.val}</Text>
              <Text style={styles.metricLabel}>{m.label}</Text>
            </View>
          ))}
        </View>

        {/* Level Ladder */}
        <Text style={styles.secTitle}>EL CAMINO</Text>
        <View style={styles.ladder}>
          {[...LEVELS].reverse().map((lv, i) => {
            const isCurrent = lv.name === level.name;
            const isUnlocked = lv.min <= pagosATiempo;
            const isLocked = !isUnlocked;
            return (
              <View key={lv.name} style={styles.step}>
                <View style={styles.stepLeft}>
                  <View style={[styles.stepCircle, isCurrent && styles.stepCircleCurrent, isLocked && styles.stepCircleLocked]}>
                    <Text style={{ fontSize: 16 }}>{lv.emoji}</Text>
                  </View>
                  {i < LEVELS.length - 1 && <View style={[styles.stepLine, isUnlocked && styles.stepLineDone]} />}
                </View>
                <View style={[styles.stepCard, isCurrent && styles.stepCardCurrent, isLocked && styles.stepCardLocked]}>
                  <View style={styles.stepHeader}>
                    <Text style={styles.stepName}>{lv.emoji} {lv.name}</Text>
                    <View style={[styles.stepBadge, isCurrent ? styles.stepBadgeCurrent : isUnlocked ? styles.stepBadgeUnlocked : styles.stepBadgeLocked]}>
                      <Text style={[styles.stepBadgeText, isCurrent ? styles.stepBadgeTextCurrent : isUnlocked ? styles.stepBadgeTextUnlocked : styles.stepBadgeTextLocked]}>
                        {isCurrent ? 'NIVEL ACTUAL' : isUnlocked ? '\u2705 Desbloqueado' : '\u{1F512} Bloqueado'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.stepReq}>{lv.min} pagos a tiempo</Text>
                  <View style={styles.benefitsRow}>
                    <View style={[styles.benefitPill, isUnlocked && styles.benefitPillGreen]}>
                      <Text style={[styles.benefitText, isUnlocked && styles.benefitTextGreen]}>{lv.maxCuotas} cuotas</Text>
                    </View>
                    <View style={[styles.benefitPill, isUnlocked && styles.benefitPillGreen]}>
                      <Text style={[styles.benefitText, isUnlocked && styles.benefitTextGreen]}>Cupo {formatCOP(lv.cupo)}</Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  secTitle: { fontSize: 13, fontFamily: 'DMSans_600SemiBold', color: Colors.textSecondary, letterSpacing: 0.5, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 12 },
  // Level card
  levelCard: { borderRadius: 24, padding: 22, backgroundColor: Colors.darkGreen, marginHorizontal: 24, marginTop: 20, overflow: 'hidden' },
  levelTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  levelLabel: { fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 0.7, fontFamily: 'DMSans_500Medium', marginBottom: 6 },
  levelName: { fontSize: 28, fontFamily: 'DMSans_700Bold', color: Colors.white, letterSpacing: -0.5 },
  levelEmoji: { fontSize: 42, lineHeight: 48 },
  progRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progLabel: { fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'DMSans_500Medium' },
  progPct: { fontSize: 11, color: Colors.primary, fontFamily: 'DMSans_700Bold' },
  barTrack: { height: 5, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4 },
  barFill: { height: 5, backgroundColor: Colors.primary, borderRadius: 4 },
  faltanText: { fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 8 },
  faltanBold: { color: 'rgba(255,255,255,0.65)', fontFamily: 'DMSans_600SemiBold' },
  // Metrics
  metricsRow: {
    flexDirection: 'row', marginHorizontal: 24, backgroundColor: Colors.lightBg,
    borderWidth: 1.5, borderColor: '#e0f0e7', borderRadius: 18, padding: 4,
  },
  metricItem: { flex: 1, alignItems: 'center', paddingVertical: 12, gap: 2 },
  metricBorder: { borderLeftWidth: 1, borderLeftColor: '#e0f0e7' },
  metricIcon: { fontSize: 14 },
  metricVal: { fontSize: 18, fontFamily: 'DMMono_500Medium', color: Colors.darkGreen },
  metricLabel: { fontSize: 10, color: Colors.textSecondary, fontFamily: 'DMSans_500Medium', textAlign: 'center' },
  // Ladder
  ladder: { paddingHorizontal: 24 },
  step: { flexDirection: 'row', gap: 14 },
  stepLeft: { alignItems: 'center', width: 36 },
  stepCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  stepCircleCurrent: { backgroundColor: Colors.darkGreen, borderColor: Colors.primary },
  stepCircleLocked: { backgroundColor: '#f5f5f5', borderColor: '#eee' },
  stepLine: { width: 2, flex: 1, backgroundColor: '#eee', marginVertical: 4 },
  stepLineDone: { backgroundColor: Colors.primary },
  stepCard: { flex: 1, backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.borderLight, borderRadius: 18, padding: 14, paddingHorizontal: 16, marginBottom: 12 },
  stepCardCurrent: { borderColor: Colors.primary, backgroundColor: Colors.lightBg },
  stepCardLocked: { opacity: 0.5 },
  stepHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  stepName: { fontSize: 15, fontFamily: 'DMSans_700Bold', color: Colors.darkGreen },
  stepBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  stepBadgeCurrent: { backgroundColor: Colors.darkGreen },
  stepBadgeLocked: { backgroundColor: '#f5f5f5' },
  stepBadgeUnlocked: { backgroundColor: '#e6f9ed' },
  stepBadgeText: { fontSize: 10, fontFamily: 'DMSans_700Bold' },
  stepBadgeTextCurrent: { color: Colors.primary },
  stepBadgeTextLocked: { color: Colors.textSecondary },
  stepBadgeTextUnlocked: { color: Colors.primary },
  stepReq: { fontSize: 12, color: Colors.textSecondary, marginBottom: 8 },
  benefitsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  benefitPill: { backgroundColor: '#f5f5f5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  benefitPillGreen: { backgroundColor: '#e6f9ed' },
  benefitText: { fontSize: 11, fontFamily: 'DMSans_500Medium', color: '#555' },
  benefitTextGreen: { color: Colors.primary },
});
