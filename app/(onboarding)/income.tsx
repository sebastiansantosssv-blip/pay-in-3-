import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ProgressHeader } from '../../src/components/ProgressHeader';
import { useOnboarding } from '../../src/providers/OnboardingProvider';
import { Colors } from '../../src/constants/colors';

const OPTIONS = [
  { label: 'Empleo formal', sub: 'Contrato, nomina' },
  { label: 'Independiente / freelance', sub: 'Servicios, honorarios' },
  { label: 'Trabajo informal', sub: 'Ventas, encargos' },
  { label: 'Estudiante / sin ingresos fijos', sub: 'Mesada, apoyo familiar' },
];

export default function IncomeScreen() {
  const router = useRouter();
  const { data, update } = useOnboarding();
  const [selected, setSelected] = useState(data.tipoIngreso);

  const handleSelect = (label: string) => {
    setSelected(label);
    update({ tipoIngreso: label });
  };

  return (
    <View style={styles.container}>
      <ProgressHeader step={6} total={7} label="Tus ingresos" />
      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>{'\u2190'} Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Como recibes ingresos?</Text>
        <Text style={styles.sub}>Define tu limite inicial.</Text>

        {OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.label}
            style={[styles.option, selected === opt.label && styles.optionSelected]}
            onPress={() => handleSelect(opt.label)}
            activeOpacity={0.7}
          >
            <View>
              <Text style={styles.optLabel}>{opt.label}</Text>
              <Text style={styles.optSub}>{opt.sub}</Text>
            </View>
            <View style={[styles.radio, selected === opt.label && styles.radioSelected]} />
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.btnWrap}>
        <TouchableOpacity style={[styles.btn, !selected && styles.btnDisabled]} onPress={() => router.push('/(onboarding)/pin')} disabled={!selected} activeOpacity={0.8}>
          <Text style={[styles.btnText, !selected && styles.btnTextDisabled]}>Continuar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  body: { flex: 1, paddingHorizontal: 28 },
  bodyContent: { paddingTop: 16, paddingBottom: 20 },
  back: { fontSize: 13, color: Colors.textMuted, marginBottom: 20, fontFamily: 'DMSans' },
  title: { fontSize: 26, fontFamily: 'DMSans_600SemiBold', color: Colors.darkGreen, marginBottom: 6 },
  sub: { fontSize: 14, color: Colors.textLight, lineHeight: 22, marginBottom: 28 },
  option: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 14, paddingHorizontal: 16, borderWidth: 1.5, borderColor: Colors.inputBorder,
    borderRadius: 14, marginBottom: 10, backgroundColor: Colors.inputBg,
  },
  optionSelected: { borderColor: Colors.primary, backgroundColor: '#f0faf3' },
  optLabel: { fontSize: 14, fontFamily: 'DMSans_500Medium', color: Colors.black },
  optSub: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#ccc' },
  radioSelected: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  btnWrap: { paddingHorizontal: 28, paddingBottom: 24 },
  btn: { width: '100%', paddingVertical: 16, backgroundColor: Colors.primary, borderRadius: 16, alignItems: 'center' },
  btnDisabled: { backgroundColor: '#d4eedd' },
  btnText: { fontSize: 16, fontFamily: 'DMSans_600SemiBold', color: Colors.white },
  btnTextDisabled: { color: '#a8d4b8' },
});
