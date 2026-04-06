export interface Level {
  min: number;
  name: string;
  emoji: string;
  description: string;
  cupo: number;
  maxCuotas: number;
  benefits: string[];
}

export const LEVELS: Level[] = [
  {
    min: 0,
    name: 'Rookie',
    emoji: '\u{1F331}',
    description: 'Tu punto de partida. Cada pago a tiempo suma.',
    cupo: 200000,
    maxCuotas: 1,
    benefits: ['1 cuota sin interes', 'Cupo $200.000', 'Visa universal', 'Educacion financiera'],
  },
  {
    min: 7,
    name: 'Responsable',
    emoji: '\u{1F525}',
    description: 'Estas construyendo tu historial crediticio.',
    cupo: 400000,
    maxCuotas: 2,
    benefits: ['2 cuotas sin interes', 'Cupo $400.000', 'Comercios premium', 'Notificaciones anticipadas'],
  },
  {
    min: 50,
    name: 'Avanzado',
    emoji: '\u{1F680}',
    description: 'Ya dominas el credito responsable.',
    cupo: 800000,
    maxCuotas: 3,
    benefits: ['3 cuotas sin interes', 'Cupo $800.000', 'Cashback', 'Ofertas exclusivas'],
  },
  {
    min: 100,
    name: 'Elite',
    emoji: '\u{1F451}',
    description: 'El top 1% de Pay in 3.',
    cupo: 2000000,
    maxCuotas: 4,
    benefits: ['4 cuotas sin interes', 'Cupo $2.000.000', 'Funciones anticipadas', 'Soporte 24/7'],
  },
  {
    min: 200,
    name: 'Pay in 3',
    emoji: '\u{1F3C6}',
    description: 'Nivel legendario. Maximo prestigio.',
    cupo: 5000000,
    maxCuotas: 4,
    benefits: ['4 cuotas sin interes', 'Cupo $5.000.000', 'Beneficios VIP', 'Invitaciones especiales'],
  },
];

export function getCurrentLevel(pagosATiempo: number): Level {
  return [...LEVELS].reverse().find((l) => pagosATiempo >= l.min) || LEVELS[0];
}

export function getNextLevel(pagosATiempo: number): Level | null {
  return LEVELS.find((l) => l.min > pagosATiempo) || null;
}
