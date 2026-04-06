import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ProgressHeader } from '../../src/components/ProgressHeader';
import { useOnboarding } from '../../src/providers/OnboardingProvider';
import { Colors } from '../../src/constants/colors';

export default function NameScreen() {
  const router = useRouter();
  const { data, update } = useOnboarding();
  const [nombre, setNombre] = useState(data.nombre);
  const [apellido, setApellido] = useState(data.apellido);
  const [dob, setDob] = useState(data.fechaNacimiento);

  const isValid = nombre.trim() && apellido.trim() && dob.trim();

  const handleContinue = () => {
    update({ nombre: nombre.trim(), apellido: apellido.trim(), fechaNacimiento: dob });
    router.push('/(onboarding)/phone');
  };

  return (
    <View style={styles.container}>
      <ProgressHeader step={1} total={7} label="Tu informacion" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>{'\u2190'} Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Como te llamas?</Text>
          <Text style={styles.sub}>Tal como aparece en tu cedula.</Text>

          <Text style={styles.label}>NOMBRES</Text>
          <TextInput style={styles.input} placeholder="Ej: Sebastian" value={nombre} onChangeText={setNombre} autoFocus />

          <Text style={styles.label}>APELLIDOS</Text>
          <TextInput style={styles.input} placeholder="Ej: Perez Gomez" value={apellido} onChangeText={setApellido} />

          <Text style={styles.label}>FECHA DE NACIMIENTO</Text>
          <TextInput style={styles.input} placeholder="DD/MM/AAAA" value={dob} onChangeText={setDob} keyboardType="numbers-and-punctuation" />
        </ScrollView>
        <View style={styles.btnWrap}>
          <TouchableOpacity style={[styles.btn, !isValid && styles.btnDisabled]} onPress={handleContinue} disabled={!isValid} activeOpacity={0.8}>
            <Text style={[styles.btnText, !isValid && styles.btnTextDisabled]}>Continuar</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  body: { flex: 1, paddingHorizontal: 28 },
  bodyContent: { paddingTop: 16, paddingBottom: 20 },
  back: { fontSize: 13, color: Colors.textMuted, marginBottom: 20, fontFamily: 'DMSans' },
  title: { fontSize: 26, fontFamily: 'DMSans_600SemiBold', color: Colors.darkGreen, lineHeight: 33, marginBottom: 6 },
  sub: { fontSize: 14, color: Colors.textLight, lineHeight: 22, marginBottom: 28 },
  label: { fontSize: 12, fontFamily: 'DMSans_600SemiBold', color: '#444', letterSpacing: 0.4, marginBottom: 6, marginTop: 16 },
  input: {
    width: '100%', padding: 14, paddingHorizontal: 16, borderWidth: 1.5, borderColor: Colors.inputBorder,
    borderRadius: 14, fontSize: 15, fontFamily: 'DMSans', color: Colors.black, backgroundColor: Colors.inputBg,
  },
  btnWrap: { paddingHorizontal: 28, paddingBottom: 24 },
  btn: { width: '100%', paddingVertical: 16, backgroundColor: Colors.primary, borderRadius: 16, alignItems: 'center' },
  btnDisabled: { backgroundColor: '#d4eedd' },
  btnText: { fontSize: 16, fontFamily: 'DMSans_600SemiBold', color: Colors.white },
  btnTextDisabled: { color: '#a8d4b8' },
});
