import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Colors } from '../constants/colors';
import Svg, { Path } from 'react-native-svg';

interface Props {
  visible: boolean;
  amount: string;
  label: string;
  onDone: () => void;
}

const CONFETTI_COLORS = ['#1DB954', '#ffffff', '#a8e6c0', '#5ece89', '#FFD700', '#FF6B6B'];
const NUM_CONFETTI = 30;
const { width, height } = Dimensions.get('window');

function ConfettiPiece({ delay, color, startX }: { delay: number; color: string; startX: number }) {
  const translateY = useRef(new Animated.Value(-20)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: height, duration: 1200 + Math.random() * 800, delay, useNativeDriver: true }),
      Animated.timing(rotate, { toValue: 720, duration: 1200, delay, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 1200, delay: delay + 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const spin = rotate.interpolate({ inputRange: [0, 720], outputRange: ['0deg', '720deg'] });
  const size = 6 + Math.random() * 8;

  return (
    <Animated.View
      style={{
        position: 'absolute', left: startX, top: -10,
        width: size, height: size,
        backgroundColor: color,
        borderRadius: Math.random() > 0.5 ? size / 2 : 2,
        transform: [{ translateY }, { rotate: spin }],
        opacity,
      }}
    />
  );
}

export function PaymentOverlay({ visible, amount, label, onDone }: Props) {
  const scale = useRef(new Animated.Value(0)).current;
  const textY = useRef(new Animated.Value(16)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scale.setValue(0);
      textY.setValue(16);
      textOpacity.setValue(0);

      Animated.sequence([
        Animated.spring(scale, { toValue: 1, friction: 4, tension: 60, useNativeDriver: true }),
        Animated.parallel([
          Animated.timing(textY, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.timing(textOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        ]),
      ]).start();

      const timer = setTimeout(onDone, 2400);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      {/* Confetti */}
      {Array.from({ length: NUM_CONFETTI }).map((_, i) => (
        <ConfettiPiece
          key={i}
          delay={Math.random() * 500}
          color={CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]}
          startX={Math.random() * width}
        />
      ))}

      {/* Check circle */}
      <Animated.View style={[styles.circle, { transform: [{ scale }] }]}>
        <Svg width={48} height={48} viewBox="0 0 48 48" fill="none">
          <Path d="M10 24l10 10L38 14" stroke="white" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </Animated.View>

      {/* Amount */}
      <Animated.Text style={[styles.amount, { transform: [{ translateY: textY }], opacity: textOpacity }]}>
        {amount}
      </Animated.Text>
      <Animated.Text style={[styles.label, { transform: [{ translateY: textY }], opacity: textOpacity }]}>
        {label}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,46,20,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 300,
  },
  circle: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  amount: {
    fontSize: 36, fontFamily: 'DMMono', color: Colors.white, letterSpacing: -1, marginTop: 16,
  },
  label: {
    fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 4,
  },
});
