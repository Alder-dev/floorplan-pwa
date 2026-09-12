import type { Point, LCorner } from '@/types';

/**
 * Genera los 4 vértices de un rectángulo estándar.
 */
export function generateRectangleShape(width: number, length: number): Point[] {
  return [
    { x: 0, y: 0 },
    { x: width, y: 0 },
    { x: width, y: length },
    { x: 0, y: length },
  ];
}

/**
 * Genera los 6 vértices ordenados en sentido horario para una habitación con forma en "L",
 * especificando la esquina que queda recortada.
 */
export function generateLShape(
  width: number,
  length: number,
  cutoutWidth: number,
  cutoutLength: number,
  cutoutCorner: LCorner = 'top-right',
): Point[] {
  // Asegurar que el corte deje al menos 0.5m en cada lado
  const cutW = Math.min(Math.max(cutoutWidth, 0.5), Math.max(width - 0.5, 0.5));
  const cutL = Math.min(Math.max(cutoutLength, 0.5), Math.max(length - 0.5, 0.5));

  switch (cutoutCorner) {
    case 'top-left':
      return [
        { x: cutW, y: 0 },
        { x: width, y: 0 },
        { x: width, y: length },
        { x: 0, y: length },
        { x: 0, y: cutL },
        { x: cutW, y: cutL },
      ];

    case 'top-right':
      return [
        { x: 0, y: 0 },
        { x: width - cutW, y: 0 },
        { x: width - cutW, y: cutL },
        { x: width, y: cutL },
        { x: width, y: length },
        { x: 0, y: length },
      ];

    case 'bottom-right':
      return [
        { x: 0, y: 0 },
        { x: width, y: 0 },
        { x: width, y: length - cutL },
        { x: width - cutW, y: length - cutL },
        { x: width - cutW, y: length },
        { x: 0, y: length },
      ];

    case 'bottom-left':
      return [
        { x: 0, y: 0 },
        { x: width, y: 0 },
        { x: width, y: length },
        { x: cutW, y: length },
        { x: cutW, y: length - cutL },
        { x: 0, y: length - cutL },
      ];
  }
}

/**
 * Calcula el centroide geométrico de un polígono 2D.
 * Usado para centrar texto e iconos dentro de formas no rectangulares.
 */
export function computeCentroid(points: Point[]): Point {
  if (!points || points.length === 0) return { x: 0, y: 0 };
  if (points.length === 1) return { ...points[0] };
  if (points.length === 2) {
    return {
      x: (points[0].x + points[1].x) / 2,
      y: (points[0].y + points[1].y) / 2,
    };
  }

  let cx = 0;
  let cy = 0;
  let signedArea = 0;

  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    const factor = points[i].x * points[j].y - points[j].x * points[i].y;
    signedArea += factor;
    cx += (points[i].x + points[j].x) * factor;
    cy += (points[i].y + points[j].y) * factor;
  }

  signedArea *= 0.5;

  if (Math.abs(signedArea) < 1e-6) {
    // Si el área es cercana a 0, promedio aritmético de vértices
    const sumX = points.reduce((acc, p) => acc + p.x, 0);
    const sumY = points.reduce((acc, p) => acc + p.y, 0);
    return { x: sumX / points.length, y: sumY / points.length };
  }

  return {
    x: cx / (6 * signedArea),
    y: cy / (6 * signedArea),
  };
}

/**
 * Convierte un arreglo de puntos a la cadena de puntos requerida por el elemento SVG `<polygon points="...">`.
 */
export function pointsToSvgString(
  points: Point[],
  scale: number,
  offsetX: number = 0,
  offsetY: number = 0,
): string {
  return points
    .map((p) => `${Math.round((offsetX + p.x * scale) * 100) / 100},${Math.round((offsetY + p.y * scale) * 100) / 100}`)
    .join(' ');
}

/**
 * Convierte un arreglo de puntos en porcentajes para la propiedad CSS `clip-path: polygon(...)`.
 */
export function pointsToCssPolygon(points: Point[], width: number, length: number): string {
  if (width <= 0 || length <= 0) return '';
  const coords = points.map((p) => {
    const pctX = Math.round((p.x / width) * 10000) / 100;
    const pctY = Math.round((p.y / length) * 10000) / 100;
    return `${pctX}% ${pctY}%`;
  });
  return `polygon(${coords.join(', ')})`;
}
