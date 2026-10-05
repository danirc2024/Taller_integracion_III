import type { UiSupermarket } from '../types';

export const HOME: { coords: [number, number]; label: string } = {
  coords: [-38.73965, -72.59842],
  label: 'Tu ubicación',
};

export const supermarkets: UiSupermarket[] = [
  {
    id: 'jumbo',
    dbId: 1,
    name: 'Jumbo',
    logo: '/logos/verdemart.png',
    color: 'oklch(0.56 0.2 25)', // Red/Green vibe
    coords: [-38.7410, -72.6000],
  },
  {
    id: 'lider',
    dbId: 2,
    name: 'Lider',
    logo: '/logos/superahorro.png',
    color: 'oklch(0.45 0.2 250)', // Blue
    coords: [-38.7350, -72.5900],
  },
  {
    id: 'unimarc',
    dbId: 3,
    name: 'Unimarc',
    logo: '/logos/mercadia.png',
    color: 'oklch(0.6 0.2 30)', // Reddish orange
    coords: [-38.7450, -72.6100],
  },
  {
    id: 'superofertas',
    dbId: 4,
    name: 'Superofertas',
    logo: '/logos/colmadoplus.png',
    color: 'oklch(0.8 0.15 90)', // Yellow
    coords: [-38.7300, -72.6050],
  },
];

export const supermarketById = (id: string) =>
  supermarkets.find((s) => s.id === id);
