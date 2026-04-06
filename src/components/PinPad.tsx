import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

interface Props {
  pin: string;
  onPress: (digit: string) => void;
  onDelete: () => void;
  length?: number;
}

export function PinPad({ pin, onPress, onDelete, length = 4 }: Props) {
  return (
    <View>
      <View style={styles.dotsRow}>
        {Array.from({ length }).map((_, i) => (
          <View key={i} style={[styles.dot, i < pin.length && styles.dotFilled]} />
        ))}
      </View>
      <View style={styles.grid}>
        {['1','2','3','4','5','6','7','8','9','','0','del'].map((key) => {
          if (key === '') return <View key="empty" style={styles.btn} />;
          if (key === 'del') {
            return (
              <TouchableOpacity key="del" style={styles.btn} onPress={onDelete} activeOpacity={0.6}>
                <Text style={[styles.btnText, styles.delText]}>{'\u232B'}</Text>
              </TouchableOpacity>
            );
          }
          return (
            <TouchableOpacity key={key} style={styles.btn} onPress={() => onPress(key)} activeOpacity={0.6}>
              <Text style={styles.btnText}>{key}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginVertical: 20, marginBottom: 28 },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: '#ddd' },
  dotFilled: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  btn: {
    width: '30%', paddingVertical: 15, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#f5f7f5', borderRadius: 14,
  },
  btnText: { fontSize: 20, fontFamily: 'DMSans_500Medium', color: Colors.black },
  delText: { fontSize: 16, color: Colors.textLight },
});
