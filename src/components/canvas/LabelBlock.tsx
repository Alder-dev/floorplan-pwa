import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { PlanLabel } from '@/types';
import { metersToPx } from '@/lib/geometry';

interface LabelBlockProps {
  label: PlanLabel;
  pixelsPerMeter: number;
  zoom: number;
  isDraggable: boolean;
  isSelected: boolean;
  onTap: (id: string) => void;
}

const SIZE_CLASSES = {
  sm: 'text-[11px] px-2 py-0.5 font-medium',
  md: 'text-[13px] px-2.5 py-1 font-semibold',
  lg: 'text-[15px] px-3 py-1.5 font-bold',
};

const COLOR_CLASSES = {
  blueprint: 'text-blueprint border-blueprint/50 bg-blueprint-soft/80',
  ink: 'text-ink-100 border-base-600 bg-base-800/90',
  sub: 'text-ink-500 border-base-700 bg-base-900/90',
};

/**
 * Representación visual y táctil de una etiqueta de texto en el plano 2D.
 * Admite arrastre y selección para edición.
 */
export function LabelBlock({
  label,
  pixelsPerMeter,
  zoom,
  isDraggable,
  isSelected,
  onTap,
}: LabelBlockProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: label.id,
    disabled: !isDraggable,
  });

  const left = metersToPx(label.x, pixelsPerMeter, 1);
  const top = metersToPx(label.y, pixelsPerMeter, 1);

  const dragStyle = transform
    ? { transform: CSS.Translate.toString({ x: transform.x / zoom, y: transform.y / zoom, scaleX: 1, scaleY: 1 }) }
    : undefined;

  const sizeClass = SIZE_CLASSES[label.fontSize] || SIZE_CLASSES.md;
  const colorClass = COLOR_CLASSES[label.color] || COLOR_CLASSES.blueprint;

  return (
    <button
      ref={setNodeRef}
      type="button"
      {...listeners}
      {...attributes}
      onClick={() => !isDragging && onTap(label.id)}
      className={`touch-none-important absolute flex items-center justify-center rounded-md border shadow-sm backdrop-blur transition-all select-none whitespace-nowrap tracking-wide font-mono ${sizeClass} ${colorClass} ${
        isSelected ? 'ring-2 ring-blueprint border-blueprint z-30 shadow-sheet' : 'z-20 hover:border-ink-500'
      } ${isDragging ? 'z-40 shadow-sheet opacity-90 scale-105' : ''}`}
      style={{
        left,
        top,
        ...dragStyle,
      }}
    >
      {label.text}
    </button>
  );
}
