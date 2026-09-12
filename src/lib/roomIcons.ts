import {
  BedDouble,
  Bath,
  ChefHat,
  Sofa,
  UtensilsCrossed,
  CarFront,
  WashingMachine,
  Briefcase,
  MoveVertical,
  DoorOpen,
  Square,
  type LucideIcon,
} from 'lucide-react';
import type { RoomIconKey } from '@/types';

/** Componente de icono por cada clave. Centralizado para que Wizard,
 * RoomBlock y AddRoomSheet siempre muestren el mismo icono por tipo. */
export const ROOM_ICONS: Record<RoomIconKey, LucideIcon> = {
  bedroom: BedDouble,
  bathroom: Bath,
  kitchen: ChefHat,
  living: Sofa,
  dining: UtensilsCrossed,
  garage: CarFront,
  laundry: WashingMachine,
  office: Briefcase,
  stairs: MoveVertical,
  balcony: DoorOpen,
  generic: Square,
};

/** Palabras clave para inferir un icono representativo a partir de la
 * etiqueta libre que escribe el usuario (en español, con variantes
 * comunes). Si no hay coincidencia, se usa el icono genérico. */
const KEYWORD_MAP: Array<{ icon: RoomIconKey; keywords: string[] }> = [
  { icon: 'bathroom', keywords: ['baño', 'bano', 'wc'] },
  { icon: 'bedroom', keywords: ['dormitorio', 'habitacion', 'habitación', 'cuarto', 'alcoba'] },
  { icon: 'kitchen', keywords: ['cocina'] },
  { icon: 'dining', keywords: ['comedor'] },
  { icon: 'living', keywords: ['sala', 'living', 'estar'] },
  { icon: 'garage', keywords: ['garaje', 'parqueadero', 'cochera'] },
  { icon: 'laundry', keywords: ['lavanderia', 'lavandería', 'ropas'] },
  { icon: 'office', keywords: ['estudio', 'oficina', 'despacho'] },
  { icon: 'stairs', keywords: ['escalera'] },
  { icon: 'balcony', keywords: ['balcon', 'balcón', 'terraza', 'patio'] },
];

export function inferRoomIcon(label: string): RoomIconKey {
  const normalized = label.trim().toLowerCase();
  if (!normalized) return 'generic';
  for (const entry of KEYWORD_MAP) {
    if (entry.keywords.some((kw) => normalized.includes(kw))) {
      return entry.icon;
    }
  }
  return 'generic';
}
