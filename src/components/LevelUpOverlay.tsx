import { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { Colors } from '../constants/colors';

interface Props {
  visible: boolean;
  emoji: string;
  name: string;
  description: string;
  onClose: () => void;
}

const { width } = Dimensions.get('window');
const STAR_EMOJIS = ['\u2B50', '\u2728', '\u{1F31F}', '\u{1F4AB}', '\u26A1'];

function StarParticle({ delay }: { delay: number }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: -300, duration: 1500, delay, useNativeDriver: true }),
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.5, duration: 750, delay, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0, duration: 750, useNativeDriver: true }),
      ]),
      Animated.timing(opacity, { toValue: 0, duration: 1500, delay: delay + 300, useNativeDriver: true }),
    ]).start();
  }, []);

  const emoji = STAR_EMOJIS[Math.floor(Math.random() * STAR_EMOJIS.length)];

  return (
    <Animated.Text
      style={{
        position: 'absolute',
        left: Math.random() * width,
        top: '60%',
        fontSize: 16 + Math.random() * 20,
        transform: [{ translateY }, { scale }],
        opacity,
      }}
    >
      {emoji}
    </Animated.Text>
  );
}

export function LevelUpOverlay({ visible, emoji, name, description, onClose }: Props) {
  const emojiScale = useRef(new Animated.Value(0)).current;
  const emojiRotate = useRef(new Animated.Value(-20)).current;
  const titleY = useRef(new Animated.Value(16)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      emojiScale.setValue(0);
      emojiRotate.setValue(-20);
      titleY.setValue(16);
      titleOpacity.setValue(0);

      Animated.sequence([
        Animated.parallel([
          Animated.spring(emojiScale, { toValue: 1, friction: 3, tension: 50, useNativeDriver: true }),
          Animated.spring(emojiRotate, { toValue: 0, friction: 3, tension: 50, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(titleY, { toValue: 0, duration: 400, useNativeDriver: true }),
          Animated.timing(titleOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  const spin = emojiRotate.interpolate({ inputRange: [-20, 0], outputRange: ['-20deg', '0deg'] });

  return (
    <View style={styles.overlay}>
      {/* Stars */}
      {Array.from({ length: 20 }).map((_, i) => (
        <StarParticle key={i} delay={Math.random() * 600} />
      ))}

      <Animated.Text style={[styles.emoji, { transform: [{ scale: emojiScale }, { rotate: spin }] }]}>
        {emoji}
      </Animated.Text>

      <Animated.View style={{ transform: [{ translateY: titleY }], opacity: titleOpacity, alignItems: 'center' }}>
        <Text style={styles.subtitle}>Subiste de nivel!</Text>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.description}>{description}</Text>
        <TouchableOpacity style={styles.btn} onPress={onClose} activeOpacity={0.8}>
          <Text style={styles.btnText}>Genial! {'\u2192'}</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,46,20,0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 400,
  },
  emoji: { fontSize: 72 },
  subtitle: {
    fontSize: 13, fontFamily: 'DMSans_700Bold', color: Colors.primary,
    textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 16,
  },
  name: { fontSize: 34, fontFamily: 'DMSans_700Bold', color: Colors.white, letterSpacing: -0.5, marginTop: 4 },
  description: {
    fontSize: 14, color: 'rgba(255,255,255,0.45)', marginTop: 8,
    textAlign: 'center', lineHeight: 22, paddingHorizontal: 40,
  },
  btn: {
    marginTop: 32, backgroundColor: Colors.primary, borderRadius: 16,
    paddingHorizontal: 36, paddingVertical: 14,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 24, elevation: 6,
  },
  btnText: { fontSize: 15, fontFamily: 'DMSans_700Bold', color: Colors.white },
});
