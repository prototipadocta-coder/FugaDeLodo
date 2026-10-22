export interface Character {
  id: string;
  name: string;
  title: string;
  avatar: string;
  speed: number; // 1-10
  agility: number; // 1-10
  mudResistance: number; // 1-10
  special: string;
  flavor: string;
  accentColor: string;
}

export interface Difficulty {
  id: 'facil' | 'normal' | 'extremo';
  name: string;
  tagline: string;
  mudSpeed: string;
  description: string;
  obstacleDensity: string;
  multiplier: string;
}

export interface HighScore {
  rank: number;
  player: string;
  character: string;
  distance: number; // in meters
  date: string;
}

export const CHARACTERS: Character[] = [
  {
    id: 'mateo',
    name: 'Mateo "El Ágil"',
    title: 'Explorador Todoterreno',
    avatar: '/src/assets/images/runner_hero_avatar_1790690132233.jpg',
    speed: 8,
    agility: 8,
    mudResistance: 7,
    special: 'Zancada Veloz (Acelera en terreno rocoso)',
    flavor: 'Con sus gafas y botas impermeables, Mateo siempre va un paso adelante de cualquier alud.',
    accentColor: 'from-amber-500 to-orange-600',
  },
  {
    id: 'lia',
    name: 'Lía "Pies de Viento"',
    title: 'Saltadora de Jungla',
    avatar: '/src/assets/images/runner_hero_avatar_1790690132233.jpg',
    speed: 9,
    agility: 10,
    mudResistance: 5,
    special: 'Salto Doble Supremo (Esquiva baches gigantes)',
    flavor: 'Ligera como una pluma, vuela por encima de los charcos de fango más pegajosos.',
    accentColor: 'from-emerald-400 to-teal-600',
  },
  {
    id: 'roco',
    name: 'Roco "El Imparable"',
    title: 'Guardián del Pantano',
    avatar: '/src/assets/images/runner_hero_avatar_1790690132233.jpg',
    speed: 6,
    agility: 6,
    mudResistance: 10,
    special: 'Escudo Rompe-Lodo (Reduce el freno del barro)',
    flavor: 'Fuerte como una roca, ningún golpe de lodo logra detener su carrera fácilmente.',
    accentColor: 'from-amber-600 to-yellow-700',
  },
];

export const DIFFICULTIES: Difficulty[] = [
  {
    id: 'facil',
    name: 'Paseo Fangoso',
    tagline: 'Para principiantes',
    mudSpeed: 'Lenta (8 km/h)',
    obstacleDensity: 'Baja',
    multiplier: '1.0x',
    description: 'La avalancha avanza con calma. Ideal para calentar y familiarizarse con los saltos y las 3 vidas.',
  },
  {
    id: 'normal',
    name: 'Aventura Clásica',
    tagline: 'El desafío recomendado',
    mudSpeed: 'Constante (14 km/h)',
    obstacleDensity: 'Media',
    multiplier: '1.5x',
    description: 'El fango ruge a tus espaldas con fuerza. Cada tropiezo te acerca peligrosamente a la ola.',
  },
  {
    id: 'extremo',
    name: 'Furia de la Avalancha',
    tagline: '¡Solo para leyendas!',
    mudSpeed: 'Imparable (20 km/h)',
    obstacleDensity: 'Alta + Temblores',
    multiplier: '2.5x',
    description: 'La gran ola de barro traga todo a su paso. Requiere reflejos de acero para no perder tus 3 vidas.',
  },
];

export const HIGH_SCORES: HighScore[] = [
  { rank: 1, player: 'Camilo_Runner', character: 'Mateo "El Ágil"', distance: 3420, date: 'Ayer' },
  { rank: 2, player: 'Sofía_Salta', character: 'Lía "Pies de Viento"', distance: 2950, date: 'Hace 2 días' },
  { rank: 3, player: 'TitanMud_99', character: 'Roco "El Imparable"', distance: 2680, date: 'Hace 3 días' },
  { rank: 4, player: 'SpeedyGonzalo', character: 'Mateo "El Ágil"', distance: 2110, date: 'Esta semana' },
  { rank: 5, player: 'Ana_Aventura', character: 'Lía "Pies de Viento"', distance: 1840, date: 'Esta semana' },
];
