import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../src/constants/colors';
import { useAuth } from '../src/providers/AuthProvider';
import { useEffect } from 'react';
import Svg, { Circle } from 'react-native-svg';

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isLoading, isAuthenticated]);

  return (
    <View style={styles.container}>
      <View style={styles.body}>
        <View style={styles.logoWrap}>
          <Svg width={36} height={36} viewBox="0 0 72 72">
            <Circle cx={20} cy={36} r={10} fill="white" opacity={0.35} />
            <Circle cx={36} cy={36} r={10} fill="white" opacity={0.62} />
            <Circle cx={52} cy={36} r={10} fill="white" />
          </Svg>
        </View>
        <Text style={styles.name}>Pay in 3</Text>
        <Text style={styles.tag}>
          Compra hoy. Paga en tres cuotas.{'\n'}Sin intereses. Sin historial crediticio.
        </Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.push('/(onboarding)/name')} activeOpacity={0.8}>
          <Text style={styles.btnText}>Crear mi cuenta</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.loginRow}>
          <Text style={styles.loginText}>
            Ya tienes cuenta? <Text style={styles.loginLink}>Ingresar</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  logoWrap: {
    width: 72, height: 72, backgroundColor: Colors.primary, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', marginBottom: 28,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.25, shadowRadius: 32, elevation: 8,
  },
  name: { fontSize: 32, fontFamily: 'DMSans_600SemiBold', color: Colors.darkGreen, letterSpacing: -0.5, marginBottom: 8 },
  tag: { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 24 },
  btn: {
    width: '100%', paddingVertical: 16, backgroundColor: Colors.primary, borderRadius: 16,
    alignItems: 'center', marginTop: 40,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 24, elevation: 4,
  },
  btnText: { fontSize: 16, fontFamily: 'DMSans_600SemiBold', color: Colors.white },
  loginRow: { marginTop: 16 },
  loginText: { fontSize: 13, color: Colors.textSecondary },
  loginLink: { color: Colors.primary, fontFamily: 'DMSans_600SemiBold' },
});
