import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ProgressHeader } from '../../src/components/ProgressHeader';
import { useOnboarding } from '../../src/providers/OnboardingProvider';
import { Colors } from '../../src/constants/colors';

export default function PhoneScreen() {
  const router = useRouter();
  const { data, update } = useOnboarding();
  const [phone, setPhone] = useState(data.celular);

  const clean = phone.replace(/\s/g, '');
  const isValid = clean.length >= 10;

  const handleContinue = () => {
    update({ celular: clean });
    router.push('/(onboarding)/otp');
  };

  return (
    <View style={styles.container}>
      <ProgressHeader step={2} total={7} label="Tu numero" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.body}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>{'\u2190'} Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Tu numero celular</Text>
          <Text style={styles.sub}>Te enviaremos un codigo por SMS.</Text>

          <Text style={styles.label}>NUMERO</Text>
          <View style={styles.phoneRow}>
            <View style={styles.countryCode}>
              <Text style={styles.countryText}>{'\u{1F1E8}\u{1F1F4}'} +57</Text>
            </View>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="300 000 0000"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={10}
              autoFocus
            />
          </View>
        </View>
        <View style={styles.btnWrap}>
          <TouchableOpacity style={[styles.btn, !isValid && styles.btnDisabled]} onPress={handleContinue} disabled={!isValid} activeOpacity={0.8}>
            <Text style={[styles.btnText, !isValid && styles.btnTextDisabled]}>Enviar codigo</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  body: { flex: 1, paddingHorizontal: 28, paddingTop: 16 },
  back: { fontSize: 13, color: Colors.textMuted, marginBottom: 20, fontFamily: 'DMSans' },
  title: { fontSize: 26, fontFamily: 'DMSans_600SemiBold', color: Colors.darkGreen, marginBottom: 6 },
  sub: { fontSize: 14, color: Colors.textLight, lineHeight: 22, marginBottom: 28 },
  label: { fontSize: 12, fontFamily: 'DMSans_600SemiBold', color: '#444', letterSpacing: 0.4, marginBottom: 6 },
  phoneRow: { flexDirection: 'row', gap: 8 },
  countryCode: { paddingHorizontal: 12, paddingVertical: 14, backgroundColor: Colors.inputBg, borderWidth: 1.5, borderColor: Colors.inputBorder, borderRadius: 14, justifyContent: 'center' },
  countryText: { fontSize: 15, color: Colors.black },
  input: {
    padding: 14, paddingHorizontal: 16, borderWidth: 1.5, borderColor: Colors.inputBorder,
    borderRadius: 14, fontSize: 15, fontFamily: 'DMSans', color: Colors.black, backgroundColor: Colors.inputBg,
  },
  btnWrap: { paddingHorizontal: 28, paddingBottom: 24 },
  btn: { width: '100%', paddingVertical: 16, backgroundColor: Colors.primary, borderRadius: 16, alignItems: 'center' },
  btnDisabled: { backgroundColor: '#d4eedd' },
  btnText: { fontSize: 16, fontFamily: 'DMSans_600SemiBold', color: Colors.white },
  btnTextDisabled: { color: '#a8d4b8' },
});
