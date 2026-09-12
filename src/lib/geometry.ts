import type { SnapStep } from '@/types';

/** Redondea un valor en metros al paso de grilla más cercano. */
export function snapToGrid(value: number, step: SnapStep): number {
  return Math.round((Math.round(value / step) * step) * 1000) / 1000;
}

/** Restringe un valor entre un mínimo y máximo (usado para no soltar un
 * bloque fuera del terreno). */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Convierte una distancia en píxeles de pantalla (ya afectada por el
 * zoom del lienzo) a metros reales del plano. */
export function pxToMeters(px: number, pixelsPerMeter: number, zoom: number): number {
  return px / (pixelsPerMeter * zoom);
}

export function metersToPx(meters: number, pixelsPerMeter: number, zoom: number): number {
  return meters * pixelsPerMeter * zoom;
}

export const ZOOM_MIN = 0.25;
export const ZOOM_MAX = 2.5;
export const ZOOM_STEP = 0.05;
