import { Tabs } from 'expo-router';
import { Colors } from '../../src/constants/colors';
import Svg, { Path, Rect, Line, Polyline, Circle as SvgCircle } from 'react-native-svg';

function TabIcon({ name, color }: { name: string; color: string }) {
  const props = { width: 20, height: 20, stroke: color, fill: 'none', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  switch (name) {
    case 'home':
      return <Svg {...props} viewBox="0 0 24 24"><Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><Polyline points="9 22 9 12 15 12 15 22" /></Svg>;
    case 'tarjeta':
      return <Svg {...props} viewBox="0 0 24 24"><Rect x={1} y={4} width={22} height={16} rx={2} /><Line x1={1} y1={10} x2={23} y2={10} /></Svg>;
    case 'pagos':
      return <Svg {...props} viewBox="0 0 24 24"><Line x1={12} y1={1} x2={12} y2={23} /><Path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></Svg>;
    case 'ahorros':
      return <Svg {...props} viewBox="0 0 24 24"><Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></Svg>;
    case 'progreso':
      return <Svg {...props} viewBox="0 0 24 24"><Polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><Polyline points="17 6 23 6 23 12" /></Svg>;
    default:
      return <Svg {...props} viewBox="0 0 24 24"><SvgCircle cx={12} cy={12} r={10} /></Svg>;
  }
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: '#ccc',
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.borderLight,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 20,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: 'DMSans_600SemiBold',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Inicio', tabBarIcon: ({ color }) => <TabIcon name="home" color={color} /> }}
      />
      <Tabs.Screen
        name="tarjeta"
        options={{ title: 'Tarjeta', tabBarIcon: ({ color }) => <TabIcon name="tarjeta" color={color} /> }}
      />
      <Tabs.Screen
        name="pagos"
        options={{ title: 'Pagos', tabBarIcon: ({ color }) => <TabIcon name="pagos" color={color} /> }}
      />
      <Tabs.Screen
        name="ahorros"
        options={{ title: 'Ahorros', tabBarIcon: ({ color }) => <TabIcon name="ahorros" color={color} /> }}
      />
      <Tabs.Screen
        name="progreso"
        options={{ title: 'Progreso', tabBarIcon: ({ color }) => <TabIcon name="progreso" color={color} /> }}
      />
    </Tabs>
  );
}
