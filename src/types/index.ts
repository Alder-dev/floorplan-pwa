/**
 * Tipos del dominio "plano 2D". Todas las medidas espaciales (x, y, width,
 * length) se guardan en METROS, nunca en píxeles. La conversión a píxeles
 * ocurre únicamente en la capa de presentación (FloorCanvas), usando
 * GridSettings.pixelsPerMeter. Esto evita que un cambio de zoom
 * desincronice los datos guardados.
 */

/** Pasos de snap-to-grid permitidos, en metros. */
export type SnapStep = 0.25 | 0.5 | 1;

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

/** Tipos de forma de un espacio. */
export type RoomShapeType = 'rect' | 'l-shape';

/** Esquina en la que se ubica el recorte para formas en L. */
export type LCorner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

/** Vértice 2D en metros, relativo al origen (x, y) de la habitación. */
export interface Point {
  x: number;
  y: number;
}

/** Parámetros específicos para formas no rectangulares. */
export interface RoomShapeParams {
  /** Ancho del recorte en metros (para forma en L). */
  cutoutWidth?: number;
  /** Largo del recorte en metros (para forma en L). */
  cutoutLength?: number;
  /** Esquina recortada. */
  cutoutCorner?: LCorner;
}

/** Un espacio/ambiente dibujado en un piso específico. */
export interface Room {
  id: string;
  /** Índice del piso al que pertenece (0 = planta baja). */
  floorIndex: number;
  label: string;
  icon: RoomIconKey;
  /** Ancho del bounding box exterior del bloque, en metros. */
  width: number;
  /** Largo del bounding box exterior del bloque, en metros. */
  length: number;
  /** Posición de la esquina superior-izquierda, en metros, relativa al
   * origen del terreno (0,0). */
  x: number;
  y: number;
  /** Tipo de geometría del espacio ('rect' por defecto). */
  shapeType?: RoomShapeType;
  /** Parámetros de la forma paramétrica. */
  shapeParams?: RoomShapeParams;
  /** Vértices calculados o personalizados en metros relativos a (x,y). */
  points?: Point[];
  /** Capa o nivel de elevación visual (1 = base, 2 = superior/por encima para baños y en-suite). */
  layer?: number;
}

/** Área en m², redondeada a 2 decimales (soporta rectángulos y polígonos mediante fórmula de Gauss). */
export function computeArea(room: Pick<Room, 'width' | 'length'> & { points?: Point[] }): number {
  if (room.points && room.points.length >= 3) {
    let area = 0;
    const pts = room.points;
    for (let i = 0; i < pts.length; i++) {
      const j = (i + 1) % pts.length;
      area += pts[i].x * pts[j].y;
      area -= pts[j].x * pts[i].y;
    }
    return Math.round((Math.abs(area) / 2) * 100) / 100;
  }
  return Math.round(room.width * room.length * 100) / 100;
}

/** Tamaño de fuente relativo para etiquetas de texto. */
export type LabelSize = 'sm' | 'md' | 'lg';

/** Variante cromática de una etiqueta. */
export type LabelColor = 'blueprint' | 'ink' | 'sub';

/** Una etiqueta / anotación de texto flotante en un piso específico. */
export interface PlanLabel {
  id: string;
  floorIndex: number;
  text: string;
  /** Coordenada X en metros relativa al origen (0,0) del terreno. */
  x: number;
  /** Coordenada Y en metros relativa al origen (0,0) del terreno. */
  y: number;
  fontSize: LabelSize;
  color: LabelColor;
}

/** Forma completa del store de Zustand. Ver `store/useFloorPlanStore.ts`. */
export interface FloorPlanState {
  config: FloorPlanConfig | null;
  isConfigured: boolean;
  rooms: Room[];
  labels: PlanLabel[];
  activeFloor: number;
  grid: GridSettings;

  // Acciones del wizard
  setConfig: (config: FloorPlanConfig) => void;
  resetPlan: () => void;

  // Navegación de pisos
  setActiveFloor: (floorIndex: number) => void;

  // CRUD de espacios (siempre sobre el piso activo salvo que se indique)
  addRoom: (room: Omit<Room, 'id' | 'floorIndex'>, floorIndex?: number) => void;
  updateRoom: (id: string, updates: Partial<Omit<Room, 'id' | 'floorIndex'>>) => void;
  updateRoomPosition: (id: string, x: number, y: number) => void;
  updateRoomDimensions: (id: string, width: number, length: number) => void;
  renameRoom: (id: string, label: string) => void;
  removeRoom: (id: string) => void;

  // CRUD de etiquetas de texto
  addLabel: (label: Omit<PlanLabel, 'id' | 'floorIndex'>, floorIndex?: number) => void;
  updateLabel: (id: string, updates: Partial<Omit<PlanLabel, 'id' | 'floorIndex'>>) => void;
  updateLabelPosition: (id: string, x: number, y: number) => void;
  removeLabel: (id: string) => void;

  // Ajustes del lienzo
  setSnapStep: (step: SnapStep) => void;
  setZoom: (zoom: number) => void;
  setPan: (pan: { x: number; y: number }) => void;
  nudgeZoom: (delta: number) => void;
}
