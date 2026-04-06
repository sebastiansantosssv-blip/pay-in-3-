import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { ProgressHeader } from '../../src/components/ProgressHeader';
import { useOnboarding } from '../../src/providers/OnboardingProvider';
import { Colors } from '../../src/constants/colors';

export default function CedulaScreen() {
  const router = useRouter();
  const { data, update } = useOnboarding();
  const [front, setFront] = useState(!!data.cedulaFrontUri);
  const [back, setBack] = useState(!!data.cedulaBackUri);

  const pickImage = async (side: 'front' | 'back') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 10],
      quality: 0.7,
    });
    if (!result.canceled) {
      if (side === 'front') {
        update({ cedulaFrontUri: result.assets[0].uri });
        setFront(true);
      } else {
        update({ cedulaBackUri: result.assets[0].uri });
        setBack(true);
      }
    }
  };

  const isValid = front && back;

  return (
    <View style={styles.container}>
      <ProgressHeader step={5} total={7} label="Tu cedula" />
      <View style={styles.body}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>{'\u2190'} Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Foto de tu cedula</Text>
        <Text style={styles.sub}>Ambas caras de tu cedula.</Text>

        <TouchableOpacity style={[styles.uploadArea, front && styles.uploadDone]} onPress={() => pickImage('front')} activeOpacity={0.7}>
          <Text style={styles.uIcon}>{'\u{1FAAA}'}</Text>
          <Text style={styles.uTitle}>Parte delantera</Text>
          <Text style={styles.uSub}>Foto y nombre</Text>
          {front && <View style={styles.checkBadge}><Text style={styles.checkText}>{'\u2713'} Cargada</Text></View>}
        </TouchableOpacity>

        <TouchableOpacity style={[styles.uploadArea, back && styles.uploadDone]} onPress={() => pickImage('back')} activeOpacity={0.7}>
          <Text style={styles.uIcon}>{'\u{1F504}'}</Text>
          <Text style={styles.uTitle}>Parte trasera</Text>
          <Text style={styles.uSub}>Codigo de barras</Text>
          {back && <View style={styles.checkBadge}><Text style={styles.checkText}>{'\u2713'} Cargada</Text></View>}
        </TouchableOpacity>
      </View>
      <View style={styles.btnWrap}>
        <TouchableOpacity style={[styles.btn, !isValid && styles.btnDisabled]} onPress={() => router.push('/(onboarding)/income')} disabled={!isValid} activeOpacity={0.8}>
          <Text style={[styles.btnText, !isValid && styles.btnTextDisabled]}>Continuar</Text>
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
