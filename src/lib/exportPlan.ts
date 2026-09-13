import type { FloorPlanConfig, Room, PlanLabel } from '@/types';
import { computeArea } from '@/types';
import { computeCentroid } from '@/lib/geometryShapes';
import { sortRoomsByLayer, isTopLayerRoom } from '@/lib/roomIcons';

/** Píxeles por metro en el SVG exportado (resolución del dibujo). */
const EXPORT_SCALE = 80;
const PAD = 48; // padding alrededor del terreno
const HEADER_H = 60; // altura reservada para título

// ── Paleta (independiente del tema de la UI) ───────────────────────────────
const C = {
  terrain: '#0D1117',
  terrainBorder: '#4FD1C5',
  grid: '#1C2530',
  gridOpacity: '0.25',
  roomFill: '#131A22',
  topRoomFill: '#1C2530',
  roomBorder: '#4FD1C5',
  roomText: '#E6EDF3',
  roomSub: '#7D8A99',
  titleText: '#E6EDF3',
  dimText: '#4FD1C5',
  bg: '#0A0E14',
};

/** Nombre de piso según índice. */
export function floorLabel(index: number): string {
  if (index === 0) return 'Planta Baja';
  if (index === 1) return 'Segundo Piso';
  if (index === 2) return 'Tercer Piso';
  if (index === 3) return 'Cuarto Piso';
  return `Piso ${index + 1}`;
}

/** Genera el SVG como string a partir de los datos del store. */
export function buildSVG(
  config: FloorPlanConfig,
  rooms: Room[],
  floorIndex: number,
  labels: PlanLabel[] = [],
): string {
  const W = config.frente * EXPORT_SCALE;
  const H = config.profundidad * EXPORT_SCALE;
  const totalW = W + PAD * 2;
  const totalH = H + PAD * 2 + HEADER_H;

  const floorRooms = sortRoomsByLayer(rooms.filter((r) => r.floorIndex === floorIndex));

  // Grilla cada metro
  const gridLines: string[] = [];
  for (let x = 1; x < config.frente; x++) {
    const px = PAD + x * EXPORT_SCALE;
    gridLines.push(
      `<line x1="${px}" y1="${PAD + HEADER_H}" x2="${px}" y2="${PAD + HEADER_H + H}" stroke="${C.grid}" stroke-opacity="${C.gridOpacity}" stroke-width="1"/>`,
    );
  }
  for (let y = 1; y < config.profundidad; y++) {
    const py = PAD + HEADER_H + y * EXPORT_SCALE;
    gridLines.push(
      `<line x1="${PAD}" y1="${py}" x2="${PAD + W}" y2="${py}" stroke="${C.grid}" stroke-opacity="${C.gridOpacity}" stroke-width="1"/>`,
    );
  }

  // Dimensiones del terreno (anotaciones)
  const dimFronteY = PAD + HEADER_H - 12;
  const dimProfX = PAD + W + 14;

  // Bloques de habitaciones
  const roomBlocks = floorRooms.map((room) => {
    const rx = PAD + room.x * EXPORT_SCALE;
    const ry = PAD + HEADER_H + room.y * EXPORT_SCALE;
    const rw = room.width * EXPORT_SCALE;
    const rh = room.length * EXPORT_SCALE;
    const area = computeArea(room);
    const isTop = isTopLayerRoom(room);
    const fill = isTop ? C.topRoomFill : C.roomFill;

    // Texto adaptado al tamaño del bloque
    const fontSize = Math.min(13, Math.max(8, rw / 8));
    const subFontSize = Math.max(7, fontSize - 2);

    const isLShape = room.shapeType === 'l-shape' && !!room.points && room.points.length >= 3;

    if (isLShape && room.points) {
      const centroid = computeCentroid(room.points);
      const cx = PAD + (room.x + centroid.x) * EXPORT_SCALE;
      const cy = PAD + HEADER_H + (room.y + centroid.y) * EXPORT_SCALE;
      const svgPts = room.points
        .map(
          (p) =>
            `${Math.round((PAD + (room.x + p.x) * EXPORT_SCALE) * 100) / 100},${Math.round((PAD + HEADER_H + (room.y + p.y) * EXPORT_SCALE) * 100) / 100}`,
        )
        .join(' ');

      return `
      <polygon points="${svgPts}"
        fill="${fill}" stroke="${C.roomBorder}" stroke-width="1.5" stroke-linejoin="round"/>
      <text x="${cx}" y="${cy - fontSize * 0.5}" text-anchor="middle"
        font-family="Inter, system-ui, sans-serif" font-size="${fontSize}" font-weight="bold"
        fill="${C.roomText}">${escXml(room.label)}</text>
      <text x="${cx}" y="${cy + subFontSize * 1.2}" text-anchor="middle"
        font-family="'JetBrains Mono', monospace" font-size="${subFontSize}"
        fill="${C.roomSub}">(${room.width}m x ${room.length}m máx.) ${area}m²</text>`;
    }

    const cx = rx + rw / 2;
    const cy = ry + rh / 2;

    return `
      <rect x="${rx}" y="${ry}" width="${rw}" height="${rh}"
        fill="${fill}" stroke="${C.roomBorder}" stroke-width="1.5" rx="3"/>
      <text x="${cx}" y="${cy - fontSize * 0.5}" text-anchor="middle"
        font-family="Inter, system-ui, sans-serif" font-size="${fontSize}" font-weight="bold"
        fill="${C.roomText}">${escXml(room.label)}</text>
      <text x="${cx}" y="${cy + subFontSize * 1.2}" text-anchor="middle"
        font-family="'JetBrains Mono', monospace" font-size="${subFontSize}"
        fill="${C.roomSub}">(${room.width}m x ${room.length}m) ${area}m²</text>`;
  });

  // Etiquetas de texto
  const floorLabels = labels.filter((l) => l.floorIndex === floorIndex);
  const labelBlocks = floorLabels.map((l) => {
    const lx = PAD + l.x * EXPORT_SCALE;
    const ly = PAD + HEADER_H + l.y * EXPORT_SCALE + 16;
    const fontSize = l.fontSize === 'lg' ? 14 : l.fontSize === 'sm' ? 10 : 12;
    const fill = l.color === 'blueprint' ? C.roomBorder : l.color === 'sub' ? C.roomSub : C.roomText;
    return `
      <text x="${lx}" y="${ly}"
        font-family="'JetBrains Mono', monospace" font-size="${fontSize}" font-weight="bold"
        fill="${fill}" letter-spacing="0.5">${escXml(l.text)}</text>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
  width="${totalW}" height="${totalH}" viewBox="0 0 ${totalW} ${totalH}">

  <!-- Fondo -->
  <rect width="${totalW}" height="${totalH}" fill="${C.bg}"/>

  <!-- Título -->
  <text x="${PAD}" y="${PAD - 4}"
    font-family="'Space Grotesk', system-ui, sans-serif" font-size="18" font-weight="bold"
    fill="${C.titleText}">Planos 2D — ${escXml(floorLabel(floorIndex))}</text>
  <text x="${PAD}" y="${PAD + 14}"
    font-family="'JetBrains Mono', monospace" font-size="11"
    fill="${C.dimText}">${config.frente}m × ${config.profundidad}m · ${floorRooms.length} espacios</text>

  <!-- Terreno -->
  <rect x="${PAD}" y="${PAD + HEADER_H}" width="${W}" height="${H}"
    fill="${C.terrain}" stroke="${C.terrainBorder}" stroke-width="2"/>

  <!-- Grilla -->
  ${gridLines.join('\n  ')}

  <!-- Dimensión frente -->
  <text x="${PAD + W / 2}" y="${dimFronteY}"
    text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="11"
    fill="${C.dimText}">${config.frente} m</text>

  <!-- Dimensión profundidad -->
  <text x="${dimProfX}" y="${PAD + HEADER_H + H / 2}"
    text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="11"
    fill="${C.dimText}" transform="rotate(90, ${dimProfX}, ${PAD + HEADER_H + H / 2})">${config.profundidad} m</text>

  <!-- Habitaciones -->
  ${roomBlocks.join('\n')}

  <!-- Etiquetas de texto -->
  ${labelBlocks.join('\n')}

  <!-- Indicador de escala -->
  <rect x="${PAD}" y="${totalH - 16}" width="${EXPORT_SCALE}" height="4"
    fill="${C.terrainBorder}" rx="2"/>
  <text x="${PAD + EXPORT_SCALE / 2}" y="${totalH - 20}"
    text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="9"
    fill="${C.dimText}">1 m</text>
</svg>`;
}

function escXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Dispara la descarga de un blob en el navegador. */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/** Nombre de archivo base sin extensión. */
function baseName(config: FloorPlanConfig, floorIndex: number): string {
  return `plano_${floorLabel(floorIndex).toLowerCase().replace(/\s+/g, '_')}_${config.frente}x${config.profundidad}m`;
}

// ── Exportadores públicos ───────────────────────────────────────────────────

export function exportSVG(
  config: FloorPlanConfig,
  rooms: Room[],
  floorIndex: number,
  labels: PlanLabel[] = [],
): void {
  const svg = buildSVG(config, rooms, floorIndex, labels);
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  downloadBlob(blob, `${baseName(config, floorIndex)}.svg`);
}

export async function exportPNG(
  config: FloorPlanConfig,
  rooms: Room[],
  floorIndex: number,
  labels: PlanLabel[] = [],
): Promise<void> {
  const svg = buildSVG(config, rooms, floorIndex, labels);
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      // Escala 2× para resolución Retina
      canvas.width = img.naturalWidth * 2;
      canvas.height = img.naturalHeight * 2;
      const ctx = canvas.getContext('2d')!;
      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob((pngBlob) => {
        if (!pngBlob) { reject(new Error('PNG generation failed')); return; }
        downloadBlob(pngBlob, `${baseName(config, floorIndex)}.png`);
        resolve();
      }, 'image/png');
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('SVG load failed')); };
    img.src = url;
  });
}

export async function exportPDF(
  config: FloorPlanConfig,
  rooms: Room[],
  floorIndex: number,
  labels: PlanLabel[] = [],
): Promise<void> {
  const [{ jsPDF }, { svg2pdf }] = await Promise.all([
    import('jspdf'),
    import('svg2pdf.js'),
  ]);

  const svgString = buildSVG(config, rooms, floorIndex, labels);
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svgString, 'image/svg+xml');
  const svgElement = svgDoc.documentElement;

  const W = config.frente * EXPORT_SCALE;
  const H = config.profundidad * EXPORT_SCALE;
  const totalW = W + PAD * 2;
  const totalH = H + PAD * 2 + HEADER_H;

  const orientation = totalW > totalH ? 'landscape' : 'portrait';
  const doc = new jsPDF({
    orientation,
    unit: 'pt',
    format: [totalW, totalH],
    compress: true,
  });

  await svg2pdf(svgElement, doc, {
    x: 0,
    y: 0,
    width: totalW,
    height: totalH,
  });

  doc.save(`${baseName(config, floorIndex)}.pdf`);
}
