import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../src/constants/colors';
import { useUser } from '../src/providers/UserProvider';
import { signOut } from '../src/lib/auth';
import { formatCOP } from '../src/lib/format';
import Svg, { Path } from 'react-native-svg';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, level } = useUser();

  const handleLogout = () => {
    Alert.alert('Cerrar sesion', 'Seguro que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesion',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backBtn}>{'\u2190'} Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Configuracion</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarText}>{user?.nombre?.[0] || 'P'}{user?.apellido?.[0] || '3'}</Text>
          </View>
          <Text style={styles.profileName}>{user?.nombre || 'Usuario'} {user?.apellido || ''}</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{level.emoji} {level.name}</Text>
          </View>
          <Text style={styles.profilePhone}>+57 {user?.celular || '---'}</Text>
        </View>

        {/* Info Section */}
        <Text style={styles.secTitle}>TU CUENTA</Text>
        <View style={styles.infoCard}>
          <InfoRow label="Nombre" value={`${user?.nombre || ''} ${user?.apellido || ''}`} />
          <InfoRow label="Celular" value={`+57 ${user?.celular || '---'}`} />
          <InfoRow label="Nivel" value={`${level.emoji} ${level.name}`} />
          <InfoRow label="Cupo total" value={formatCOP(user?.cupo_total || 200000)} />
          <InfoRow label="Pagos a tiempo" value={`${user?.pagos_a_tiempo || 0}`} />
          <InfoRow label="Puntos" value={`${user?.puntos || 0}`} last />
        </View>

        {/* Actions */}
        <Text style={styles.secTitle}>ACCIONES</Text>
        <View style={styles.actionsCard}>
          <ActionRow icon="\u{1F512}" label="Cambiar PIN" onPress={() => Alert.alert('PIN', 'Funcion disponible pronto')} />
          <ActionRow icon="\u{1F514}" label="Notificaciones" onPress={() => Alert.alert('Notificaciones', 'Funcion disponible pronto')} />
          <ActionRow icon="\u{2753}" label="Ayuda y soporte" onPress={() => Alert.alert('Soporte', 'Escribe a hola@payin3.co')} last />
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutText}>Cerrar sesion</Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={styles.version}>Pay in 3 v1.0.0</Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.infoRow, !last && styles.infoRowBorder]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function ActionRow({ icon, label, onPress, last }: { icon: string; label: string; onPress: () => void; last?: boolean }) {
  return (
    <TouchableOpacity style={[styles.actionRow, !last && styles.infoRowBorder]} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.actionLeft}>
        <Text style={styles.actionIcon}>{icon}</Text>
        <Text style={styles.actionLabel}>{label}</Text>
      </View>
      <Text style={styles.actionArrow}>{'\u203A'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16 },
  backBtn: { fontSize: 13, color: Colors.textMuted, fontFamily: 'DMSans', marginBottom: 12 },
  title: { fontSize: 28, fontFamily: 'DMSans_700Bold', color: Colors.darkGreen },
  // Profile
  profileCard: {
    marginHorizontal: 24, backgroundColor: Colors.darkGreen, borderRadius: 24, padding: 24,
    alignItems: 'center', overflow: 'hidden',
  },
  avatarWrap: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatarText: { fontSize: 22, fontFamily: 'DMSans_700Bold', color: Colors.white },
  profileName: { fontSize: 20, fontFamily: 'DMSans_700Bold', color: Colors.white, marginBottom: 6 },
  levelBadge: { backgroundColor: 'rgba(29,185,84,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginBottom: 8 },
  levelText: { fontSize: 12, fontFamily: 'DMSans_700Bold', color: Colors.primary },
  profilePhone: { fontSize: 13, color: 'rgba(255,255,255,0.4)' },
  // Sections
  secTitle: { fontSize: 13, fontFamily: 'DMSans_600SemiBold', color: Colors.textSecondary, letterSpacing: 0.5, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 10 },
  infoCard: { marginHorizontal: 24, backgroundColor: Colors.lightBg, borderWidth: 1.5, borderColor: Colors.border, borderRadius: 20, overflow: 'hidden' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 18 },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  infoLabel: { fontSize: 13, color: Colors.textSecondary },
  infoValue: { fontSize: 13, fontFamily: 'DMSans_600SemiBold', color: Colors.darkGreen },
  // Actions
  actionsCard: { marginHorizontal: 24, backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.borderLight, borderRadius: 20, overflow: 'hidden' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 18 },
  actionLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  actionIcon: { fontSize: 18 },
  actionLabel: { fontSize: 14, fontFamily: 'DMSans_500Medium', color: Colors.darkGreen },
  actionArrow: { fontSize: 20, color: Colors.textSecondary },
  // Logout
  logoutBtn: {
    marginHorizontal: 24, marginTop: 24, backgroundColor: '#fff0f0',
    borderWidth: 1.5, borderColor: '#ffcccc', borderRadius: 16,
    paddingVertical: 16, alignItems: 'center',
  },
  logoutText: { fontSize: 16, fontFamily: 'DMSans_600SemiBold', color: '#d94040' },
  version: { textAlign: 'center', fontSize: 12, color: Colors.textMuted, marginTop: 20 },
});
