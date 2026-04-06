import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { ProgressHeader } from '../../src/components/ProgressHeader';
import { useOnboarding } from '../../src/providers/OnboardingProvider';
import { signUp, verifyOTP } from '../../src/lib/auth';
import { Colors } from '../../src/constants/colors';

export default function OTPScreen() {
  const router = useRouter();
  const { data } = useOnboarding();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputs = useRef<(TextInput | null)[]>([]);

  const full = code.every((d) => d.length === 1);

  const handleChange = (text: string, index: number) => {
    const clean = text.replace(/[^0-9]/g, '');
    const newCode = [...code];
    newCode[index] = clean;
    setCode(newCode);
    if (clean && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otp = code.join('');
    setLoading(true);
    try {
      const valid = await verifyOTP(data.celular, otp);
      if (valid) {
        await signUp(data.celular);
        router.push('/(onboarding)/selfie');
      } else {
        Alert.alert('Error', 'Codigo invalido');
      }
    } catch (e: any) {
      // If user already exists, just proceed
      if (e?.message?.includes('already registered')) {
        router.push('/(onboarding)/selfie');
      } else {
        Alert.alert('Error', e?.message || 'Error de verificacion');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ProgressHeader step={3} total={7} label="Verificacion" />
      <View style={styles.body}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>{'\u2190'} Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Codigo de verificacion</Text>
        <Text style={styles.sub}>6 digitos enviados a tu celular.</Text>

        <View style={styles.otpRow}>
          {code.map((digit, i) => (
            <TextInput
              key={i}
              ref={(ref) => { inputs.current[i] = ref; }}
              style={[styles.otpBox, digit && styles.otpBoxFilled]}
              value={digit}
              onChangeText={(t) => handleChange(t, i)}
              onKeyPress={(e) => handleKeyPress(e, i)}
              keyboardType="number-pad"
              maxLength={1}
              autoFocus={i === 0}
            />
          ))}
        </View>

        <Text style={styles.resend}>
          No llego?{' '}
          <Text style={styles.resendLink} onPress={() => Alert.alert('Reenviado', 'Codigo reenviado')}>
            Reenviar
          </Text>
        </Text>
      </View>
      <View style={styles.btnWrap}>
        <TouchableOpacity style={[styles.btn, !full && styles.btnDisabled]} onPress={handleVerify} disabled={!full || loading} activeOpacity={0.8}>
          <Text style={[styles.btnText, !full && styles.btnTextDisabled]}>{loading ? 'Verificando...' : 'Verificar'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  body: { flex: 1, paddingHorizontal: 28, paddingTop: 16 },
  back: { fontSize: 13, color: Colors.textMuted, marginBottom: 20, fontFamily: 'DMSans' },
  title: { fontSize: 26, fontFamily: 'DMSans_600SemiBold', color: Colors.darkGreen, marginBottom: 6 },
  sub: { fontSize: 14, color: Colors.textLight, lineHeight: 22, marginBottom: 28 },
  otpRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 24 },
  otpBox: {
    width: 48, height: 56, borderWidth: 1.5, borderColor: Colors.inputBorder, borderRadius: 14,
    textAlign: 'center', fontSize: 22, fontFamily: 'DMMono_500Medium', color: Colors.darkGreen, backgroundColor: Colors.inputBg,
  },
  otpBoxFilled: { borderColor: Colors.primary, backgroundColor: Colors.white },
  resend: { fontSize: 13, color: Colors.textMuted, textAlign: 'center' },
  resendLink: { color: Colors.primary, fontFamily: 'DMSans_500Medium' },
  btnWrap: { paddingHorizontal: 28, paddingBottom: 24 },
  btn: { width: '100%', paddingVertical: 16, backgroundColor: Colors.primary, borderRadius: 16, alignItems: 'center' },
  btnDisabled: { backgroundColor: '#d4eedd' },
  btnText: { fontSize: 16, fontFamily: 'DMSans_600SemiBold', color: Colors.white },
  btnTextDisabled: { color: '#a8d4b8' },
});
