/**
 * Tipos del dominio "plano 2D". Todas las medidas espaciales (x, y, width,
 * length) se guardan en METROS, nunca en píxeles. La conversión a píxeles
 * ocurre únicamente en la capa de presentación (FloorCanvas), usando
 * GridSettings.pixelsPerMeter. Esto evita que un cambio de zoom
 * desincronice los datos guardados.
 */

/** Pasos de snap-to-grid permitidos, en metros. */
export type SnapStep = 0.5 | 1;

/** Configuración inicial capturada por el Wizard. */
export interface FloorPlanConfig {
  /** Ancho del terreno sobre la vía (frente), en metros. */
  frente: number;
  /** Profundidad del terreno, en metros. */
  profundidad: number;
  /** Cantidad de pisos/plantas a diseñar. */
  pisos: number;
}

/** Ajustes del lienzo/grilla, independientes de los datos del plano. */
export interface GridSettings {
  /** Escala base: cuántos píxeles representa 1 metro en zoom = 1. */
  pixelsPerMeter: number;
  /** Paso de snap-to-grid actual, en metros. */
  snapStep: SnapStep;
  /** Nivel de zoom actual del lienzo (1 = 100%). */
  zoom: number;
  /** Desplazamiento de paneo del lienzo, en píxeles. */
  pan: { x: number; y: number };
}

/** Claves de icono representativas para un espacio. Se resuelven a un
 * componente de lucide-react en `lib/roomIcons.ts`. */
export type RoomIconKey =
  | 'bedroom'
  | 'bathroom'
  | 'kitchen'
  | 'living'
  | 'dining'
  | 'garage'
  | 'laundry'
  | 'office'
  | 'stairs'
  | 'balcony'
  | 'generic';

/** Un espacio/ambiente dibujado en un piso específico. */
export interface Room {
  id: string;
  /** Índice del piso al que pertenece (0 = planta baja). */
  floorIndex: number;
  label: string;
  icon: RoomIconKey;
  /** Ancho del bloque, en metros. */
  width: number;
  /** Largo del bloque, en metros. */
  length: number;
  /** Posición de la esquina superior-izquierda, en metros, relativa al
   * origen del terreno (0,0). */
  x: number;
  y: number;
}

/** Área en m², redondeada a 2 decimales. */
export function computeArea(room: Pick<Room, 'width' | 'length'>): number {
  return Math.round(room.width * room.length * 100) / 100;
}

/** Forma completa del store de Zustand. Ver `store/useFloorPlanStore.ts`. */
export interface FloorPlanState {
  config: FloorPlanConfig | null;
  isConfigured: boolean;
  rooms: Room[];
  activeFloor: number;
  grid: GridSettings;

  // Acciones del wizard
  setConfig: (config: FloorPlanConfig) => void;
  resetPlan: () => void;

  // Navegación de pisos
  setActiveFloor: (floorIndex: number) => void;

  // CRUD de espacios (siempre sobre el piso activo salvo que se indique)
  addRoom: (room: Omit<Room, 'id' | 'floorIndex'>, floorIndex?: number) => void;
  updateRoomPosition: (id: string, x: number, y: number) => void;
  updateRoomDimensions: (id: string, width: number, length: number) => void;
  renameRoom: (id: string, label: string) => void;
  removeRoom: (id: string) => void;

  // Ajustes del lienzo
  setSnapStep: (step: SnapStep) => void;
  setZoom: (zoom: number) => void;
  setPan: (pan: { x: number; y: number }) => void;
  nudgeZoom: (delta: number) => void;
}
