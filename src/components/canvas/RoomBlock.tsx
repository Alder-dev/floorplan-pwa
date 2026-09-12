import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Room } from '@/types';
import { computeArea } from '@/types';
import { ROOM_ICONS } from '@/lib/roomIcons';
import { metersToPx } from '@/lib/geometry';
import { computeCentroid, pointsToSvgString, pointsToCssPolygon } from '@/lib/geometryShapes';

interface RoomBlockProps {
  room: Room;
  pixelsPerMeter: number;
  zoom: number;
  isDraggable: boolean;
  isSelected: boolean;
  onTap: (id: string) => void;
}

/**
 * Un espacio dibujado sobre el lienzo. La posición se expresa en metros en
 * el store; aquí se convierte a píxeles solo para pintar. `isDraggable`
 * viene en `false` cuando el lienzo está en modo paneo, para que un mismo
 * gesto no dispare a la vez un pan del lienzo y un drag del bloque.
 */
export function RoomBlock({
  room,
  pixelsPerMeter,
  zoom,
  isDraggable,
  isSelected,
  onTap,
}: RoomBlockProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: room.id,
    disabled: !isDraggable,
  });

  const Icon = ROOM_ICONS[room.icon];
  const area = computeArea(room);

  const left = metersToPx(room.x, pixelsPerMeter, 1);
  const top = metersToPx(room.y, pixelsPerMeter, 1);
  const width = metersToPx(room.width, pixelsPerMeter, 1);
  const height = metersToPx(room.length, pixelsPerMeter, 1);

  // El transform de arrastre lo entrega dnd-kit en píxeles de PANTALLA, que
  // ya están afectados por el `scale(zoom)` del contenedor padre. Hay que
  // dividir por `zoom` para que el bloque no "vuele" más rápido que el dedo
  // cuando el lienzo está acercado.
  const dragStyle = transform
    ? { transform: CSS.Translate.toString({ x: transform.x / zoom, y: transform.y / zoom, scaleX: 1, scaleY: 1 }) }
    : undefined;

  const isLShape = room.shapeType === 'l-shape' && !!room.points && room.points.length >= 3;

  if (isLShape && room.points) {
    const centroid = computeCentroid(room.points);
    const cx = metersToPx(centroid.x, pixelsPerMeter, 1);
    const cy = metersToPx(centroid.y, pixelsPerMeter, 1);
    const svgPts = pointsToSvgString(room.points, pixelsPerMeter, 0, 0);
    const cssClip = pointsToCssPolygon(room.points, room.width, room.length);

    return (
      <button
        ref={setNodeRef}
        type="button"
        {...listeners}
        {...attributes}
        onClick={() => !isDragging && onTap(room.id)}
        className={`touch-none-important absolute p-0 text-left transition-colors ${
          isDragging ? 'z-20 shadow-sheet' : 'z-10'
        }`}
        style={{
          left,
          top,
          width,
          height,
          clipPath: cssClip,
          ...dragStyle,
        }}
      >
        <svg
          className="absolute inset-0 h-full w-full pointer-events-none overflow-visible"
          width={width}
          height={height}
        >
          <polygon
            points={svgPts}
            className={`transition-colors ${
              isSelected
                ? 'fill-blueprint-soft stroke-blueprint'
                : 'fill-base-800 stroke-base-600 active:stroke-ink-500'
            }`}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
        <div
          className="pointer-events-none absolute flex flex-col items-center justify-center text-center -translate-x-1/2 -translate-y-1/2 max-w-[85%]"
          style={{ left: cx, top: cy }}
        >
          <Icon size={Math.min(18, Math.min(width, height) / 4)} className="text-blueprint mb-0.5" />
          <p className="truncate font-sans text-[11px] font-medium leading-tight text-ink-100 max-w-full">
            {room.label}
          </p>
          <p className="font-mono text-[10px] leading-tight text-ink-500 whitespace-nowrap">
            ({room.width}m x {room.length}m máx.) {area}m²
          </p>
        </div>
      </button>
    );
  }

  return (
    <button
      ref={setNodeRef}
      type="button"
      {...listeners}
      {...attributes}
      onClick={() => !isDragging && onTap(room.id)}
      className={`touch-none-important absolute flex flex-col items-start justify-between rounded-md border-2 p-2 text-left transition-colors ${
        isSelected
          ? 'border-blueprint bg-blueprint-soft'
          : 'border-base-600 bg-base-800 active:border-ink-500'
      } ${isDragging ? 'z-20 shadow-sheet' : 'z-10'}`}
      style={{
        left,
        top,
        width,
        height,
        ...dragStyle,
      }}
    >
      <Icon size={Math.min(18, width / 4)} className="text-blueprint" />
      <div className="min-w-0">
        <p className="truncate font-sans text-[11px] font-medium leading-tight text-ink-100">
          {room.label}
        </p>
        <p className="font-mono text-[10px] leading-tight text-ink-500">
          ({room.width}m x {room.length}m) {area}m²
        </p>
      </div>
    </button>
  );
}
