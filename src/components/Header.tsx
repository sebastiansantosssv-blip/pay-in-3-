import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import Svg, { Circle, Path } from 'react-native-svg';

interface Props {
  userName: string;
  levelEmoji: string;
  levelName: string;
}

export function Header({ userName, levelEmoji, levelName }: Props) {
  return (
    <View style={styles.header}>
      <View style={styles.left}>
        <View style={styles.logoPill}>
          <Svg width={22} height={22} viewBox="0 0 72 72">
            <Circle cx={20} cy={36} r={10} fill="white" opacity={0.35} />
            <Circle cx={36} cy={36} r={10} fill="white" opacity={0.62} />
            <Circle cx={52} cy={36} r={10} fill="white" />
          </Svg>
        </View>
        <View>
          <Text style={styles.greeting}>Hola,</Text>
          <View style={styles.userRow}>
            <Text style={styles.username}>{userName}</Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{levelEmoji} {levelName}</Text>
            </View>
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.notifBtn} activeOpacity={0.7}>
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </Svg>
        <View style={styles.notifDot} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 24, paddingTop: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  left: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoPill: { backgroundColor: Colors.primary, borderRadius: 12, width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  greeting: { fontSize: 12, color: Colors.textSecondary },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 1 },
  username: { fontSize: 15, fontFamily: 'DMSans_600SemiBold', color: Colors.darkGreen },
  levelBadge: {
    backgroundColor: '#f0faf3', borderWidth: 1, borderColor: Colors.borderAccent,
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20,
  },
  levelText: { fontSize: 11, fontFamily: 'DMSans_700Bold', color: Colors.primary },
  notifBtn: {
    width: 36, height: 36, borderRadius: 12, backgroundColor: '#f5f5f5',
    alignItems: 'center', justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute', top: 7, right: 7, width: 7, height: 7,
    backgroundColor: Colors.primary, borderRadius: 3.5, borderWidth: 2, borderColor: Colors.white,
  },
});
