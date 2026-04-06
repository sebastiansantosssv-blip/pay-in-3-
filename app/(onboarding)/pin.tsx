import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ProgressHeader } from '../../src/components/ProgressHeader';
import { PinPad } from '../../src/components/PinPad';
import { useOnboarding } from '../../src/providers/OnboardingProvider';
import { supabase } from '../../src/lib/supabase';
import { Colors } from '../../src/constants/colors';

export default function PinScreen() {
  const router = useRouter();
  const { data, update } = useOnboarding();
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePress = async (digit: string) => {
    if (pin.length >= 4) return;
    const newPin = pin + digit;
    setPin(newPin);

    if (newPin.length === 4) {
      update({ pin: newPin });
      setLoading(true);
      try {
        // Create user profile in Supabase
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('usuarios').insert({
            id: user.id,
            nombre: data.nombre,
            apellido: data.apellido,
            fecha_nacimiento: data.fechaNacimiento,
            celular: data.celular,
            tipo_ingreso: data.tipoIngreso,
            nivel: 'Rookie',
            cupo_total: 200000,
            cupo_usado: 0,
            pagos_a_tiempo: 0,
            pagos_tardios: 0,
            puntos: 0,
            card_frozen: true,
          });
        }
        setTimeout(() => router.replace('/(onboarding)/success'), 350);
      } catch (e: any) {
        Alert.alert('Error', e?.message || 'Error creando cuenta');
        setPin('');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  return (
    <View style={styles.container}>
      <ProgressHeader step={7} total={7} label="Tu PIN" />
      <View style={styles.body}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>{'\u2190'} Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Crea tu PIN</Text>
        <Text style={styles.sub}>4 digitos para proteger tu cuenta.</Text>
        <PinPad pin={pin} onPress={handlePress} onDelete={handleDelete} />
        {loading && <Text style={styles.loadingText}>Creando cuenta...</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  body: { flex: 1, paddingHorizontal: 28, paddingTop: 16 },
  back: { fontSize: 13, color: Colors.textMuted, marginBottom: 20, fontFamily: 'DMSans' },
  title: { fontSize: 26, fontFamily: 'DMSans_600SemiBold', color: Colors.darkGreen, marginBottom: 6 },
  sub: { fontSize: 14, color: Colors.textLight, lineHeight: 22, marginBottom: 8 },
  loadingText: { textAlign: 'center', marginTop: 20, color: Colors.primary, fontFamily: 'DMSans_500Medium' },
});
