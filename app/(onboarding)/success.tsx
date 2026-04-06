import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboarding } from '../../src/providers/OnboardingProvider';
import { Colors } from '../../src/constants/colors';
import Svg, { Path } from 'react-native-svg';

export default function SuccessScreen() {
  const router = useRouter();
  const { data } = useOnboarding();

  return (
    <View style={styles.container}>
      <View style={styles.body}>
        <View style={styles.ring}>
          <View style={styles.checkCircle}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path d="M5 12l5 5L19 7" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>
        </View>
        <Text style={styles.title}>Bienvenido a Pay in 3!</Text>
        <Text style={styles.sub}>Cuenta lista. Activaremos tu cupo en 24-48h.</Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.key}>Nombre</Text>
            <Text style={styles.val}>{data.nombre} {data.apellido}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.key}>Nivel inicial</Text>
            <View style={styles.tierBadge}><Text style={styles.tierText}>ROOKIE</Text></View>
          </View>
          <View style={styles.row}>
            <Text style={styles.key}>Limite estimado</Text>
            <Text style={styles.val}>$200.000 COP</Text>
          </View>
          <View style={[styles.row, { borderBottomWidth: 0 }]}>
            <Text style={styles.key}>Intereses</Text>
            <Text style={styles.val}>0% siempre</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.btn} onPress={() => router.replace('/(tabs)')} activeOpacity={0.8}>
          <Text style={styles.btnText}>Explorar la app {'\u2192'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  ring: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#e6f9ed', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  checkCircle: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 24, elevation: 6,
  },
  title: { fontSize: 26, fontFamily: 'DMSans_600SemiBold', color: Colors.darkGreen, marginBottom: 10 },
  sub: { fontSize: 14, color: '#888', lineHeight: 24, marginBottom: 28, textAlign: 'center' },
  card: { backgroundColor: '#f5fcf8', borderWidth: 1.5, borderColor: Colors.borderAccent, borderRadius: 20, padding: 20, width: '100%', marginBottom: 28 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  key: { fontSize: 12, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.4, fontFamily: 'DMSans_500Medium' },
  val: { fontSize: 14, color: Colors.darkGreen, fontFamily: 'DMSans_600SemiBold' },
  tierBadge: { backgroundColor: Colors.primary, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  tierText: { fontSize: 11, fontFamily: 'DMSans_700Bold', color: Colors.white },
  btn: {
    width: '100%', paddingVertical: 16, backgroundColor: Colors.primary, borderRadius: 16, alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 24, elevation: 4,
  },
  btnText: { fontSize: 16, fontFamily: 'DMSans_600SemiBold', color: Colors.white },
});
