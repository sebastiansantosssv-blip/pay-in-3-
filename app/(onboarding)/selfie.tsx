import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { ProgressHeader } from '../../src/components/ProgressHeader';
import { useOnboarding } from '../../src/providers/OnboardingProvider';
import { Colors } from '../../src/constants/colors';

export default function SelfieScreen() {
  const router = useRouter();
  const { data, update } = useOnboarding();
  const [uploaded, setUploaded] = useState(!!data.selfieUri);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      update({ selfieUri: result.assets[0].uri });
      setUploaded(true);
    }
  };

  return (
    <View style={styles.container}>
      <ProgressHeader step={4} total={7} label="Tu foto" />
      <View style={styles.body}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>{'\u2190'} Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Tomate una selfie</Text>
        <Text style={styles.sub}>Buena luz, directo a la camara.</Text>

        <TouchableOpacity style={[styles.uploadArea, uploaded && styles.uploadDone]} onPress={pickImage} activeOpacity={0.7}>
          <Text style={styles.uIcon}>{'\u{1F933}'}</Text>
          <Text style={styles.uTitle}>Tomar foto o subir imagen</Text>
          <Text style={styles.uSub}>Sin gafas, fondo claro</Text>
          {uploaded && (
            <View style={styles.checkBadge}>
              <Text style={styles.checkText}>{'\u2713'} Foto cargada</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.btnWrap}>
        <TouchableOpacity style={[styles.btn, !uploaded && styles.btnDisabled]} onPress={() => router.push('/(onboarding)/cedula')} disabled={!uploaded} activeOpacity={0.8}>
          <Text style={[styles.btnText, !uploaded && styles.btnTextDisabled]}>Continuar</Text>
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
  uploadArea: {
    borderWidth: 2, borderStyle: 'dashed', borderColor: Colors.borderAccent, borderRadius: 18,
    padding: 24, alignItems: 'center', backgroundColor: Colors.lightBg, marginBottom: 14,
  },
  uploadDone: { borderStyle: 'solid', borderColor: Colors.primary, backgroundColor: '#f0faf3' },
  uIcon: { fontSize: 26, marginBottom: 8 },
  uTitle: { fontSize: 14, fontFamily: 'DMSans_600SemiBold', color: Colors.black, marginBottom: 3 },
  uSub: { fontSize: 12, color: Colors.textMuted },
  checkBadge: { backgroundColor: '#e0f5e9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginTop: 8 },
  checkText: { fontSize: 12, fontFamily: 'DMSans_600SemiBold', color: Colors.primary },
  btnWrap: { paddingHorizontal: 28, paddingBottom: 24 },
  btn: { width: '100%', paddingVertical: 16, backgroundColor: Colors.primary, borderRadius: 16, alignItems: 'center' },
  btnDisabled: { backgroundColor: '#d4eedd' },
  btnText: { fontSize: 16, fontFamily: 'DMSans_600SemiBold', color: Colors.white },
  btnTextDisabled: { color: '#a8d4b8' },
});
