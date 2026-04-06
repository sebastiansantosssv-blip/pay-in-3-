import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="name" />
      <Stack.Screen name="phone" />
      <Stack.Screen name="otp" />
      <Stack.Screen name="selfie" />
      <Stack.Screen name="cedula" />
      <Stack.Screen name="income" />
      <Stack.Screen name="pin" />
      <Stack.Screen name="success" />
    </Stack>
  );
}
