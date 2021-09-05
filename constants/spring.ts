import { SpringConfig } from '@react-spring/web';

export const SPRING_CONFIG: SpringConfig = {
  mass: 1,
  tension: 170,
  friction: 20,
  clamp: true,
} as const;
