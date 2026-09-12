import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { useFloorPlanStore, useActiveFloorRooms, useActiveFloorLabels } from '@/store/useFloorPlanStore';
import { RoomBlock } from '@/components/canvas/RoomBlock';
import { LabelBlock } from '@/components/canvas/LabelBlock';
import { pxToMeters } from '@/lib/geometry';

export type CanvasMode = 'edit' | 'pan';

interface FloorCanvasProps {
  mode: CanvasMode;
  selectedRoomId: string | null;
  selectedLabelId: string | null;
  onSelectRoom: (id: string) => void;
  onSelectLabel: (id: string) => void;
}

/**
 * ---- Cómo el drag-and-drop convive con el scroll/paneo nativo ----
 *
 * 1. `TouchSensor` se configura con un `activationConstraint.delay` de
 *    150ms + `tolerance` de 5px: un toque corto se interpreta como tap
 *    (selecciona el bloque/etiqueta), y solo un mantener-presionado inicia el
 *    drag. Esto evita que arrastrar el dedo para hacer scroll de la
 *    página dispare un drag accidental.
 * 2. Cada `RoomBlock` y `LabelBlock` tiene `touch-action: none` (clase
 *    `touch-none-important`) para que, una vez que SÍ es un drag, el
 *    navegador no compita interpretándolo como scroll.
 * 3. El paneo del lienzo es un modo explícito y separado (`mode ===
 *    'pan'`): en ese modo los bloques reciben `disabled` en
 *    `useDraggable` y el contenedor captura los eventos de puntero para
 *    trasladar el lienzo. Nunca están activos los dos gestos a la vez.
 */
export function FloorCanvas({
  mode,
  selectedRoomId,
  selectedLabelId,
  onSelectRoom,
  onSelectLabel,
}: FloorCanvasProps) {
  const config = useFloorPlanStore((s) => s.config);
  const grid = useFloorPlanStore((s) => s.grid);
  const setPan = useFloorPlanStore((s) => s.setPan);
  const updateRoomPosition = useFloorPlanStore((s) => s.updateRoomPosition);
  const updateLabelPosition = useFloorPlanStore((s) => s.updateLabelPosition);
  const rooms = useActiveFloorRooms();
  const labels = useActiveFloorLabels();

  const containerRef = useRef<HTMLDivElement>(null);
  const panOrigin = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const [isPanning, setIsPanning] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    }),
  );

  if (!config) return null;

  const worldWidth = config.frente * grid.pixelsPerMeter;
  const worldHeight = config.profundidad * grid.pixelsPerMeter;
  const cellPx = grid.snapStep * grid.pixelsPerMeter * grid.zoom;

  function handleDragEnd(event: DragEndEvent) {
    const activeId = String(event.active.id);
    const room = rooms.find((r) => r.id === activeId);
    if (room) {
      const deltaXMeters = pxToMeters(event.delta.x, grid.pixelsPerMeter, grid.zoom);
      const deltaYMeters = pxToMeters(event.delta.y, grid.pixelsPerMeter, grid.zoom);
      updateRoomPosition(room.id, room.x + deltaXMeters, room.y + deltaYMeters);
      return;
    }
    const label = labels.find((l) => l.id === activeId);
    if (label) {
      const deltaXMeters = pxToMeters(event.delta.x, grid.pixelsPerMeter, grid.zoom);
      const deltaYMeters = pxToMeters(event.delta.y, grid.pixelsPerMeter, grid.zoom);
      updateLabelPosition(label.id, label.x + deltaXMeters, label.y + deltaYMeters);
      return;
    }
  }

  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (mode !== 'pan') return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    panOrigin.current = { x: e.clientX, y: e.clientY, panX: grid.pan.x, panY: grid.pan.y };
    setIsPanning(true);
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (mode !== 'pan' || !panOrigin.current) return;
    const dx = e.clientX - panOrigin.current.x;
    const dy = e.clientY - panOrigin.current.y;
    setPan({ x: panOrigin.current.panX + dx, y: panOrigin.current.panY + dy });
  }

  function handlePointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    if (mode !== 'pan') return;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    panOrigin.current = null;
    setIsPanning(false);
  }

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full overflow-hidden bg-base-950 ${
        mode === 'pan' ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : ''
      }`}
      style={mode === 'pan' ? { touchAction: 'none' } : undefined}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div
        className="absolute left-1/2 top-1/2 origin-center border border-base-600"
        style={{
          width: worldWidth,
          height: worldHeight,
          transform: `translate(-50%, -50%) translate(${grid.pan.x}px, ${grid.pan.y}px) scale(${grid.zoom})`,
          backgroundColor: 'var(--color-base-800)',
          backgroundImage:
            'linear-gradient(to right, var(--color-base-600) 1px, transparent 1px), linear-gradient(to bottom, var(--color-base-600) 1px, transparent 1px)',
          backgroundSize: `${cellPx / grid.zoom}px ${cellPx / grid.zoom}px`,
        }}
      >
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          {rooms.map((room) => (
            <RoomBlock
              key={room.id}
              room={room}
              pixelsPerMeter={grid.pixelsPerMeter}
              zoom={grid.zoom}
              isDraggable={mode === 'edit'}
              isSelected={room.id === selectedRoomId}
              onTap={onSelectRoom}
            />
          ))}
          {labels.map((label) => (
            <LabelBlock
              key={label.id}
              label={label}
              pixelsPerMeter={grid.pixelsPerMeter}
              zoom={grid.zoom}
              isDraggable={mode === 'edit'}
              isSelected={label.id === selectedLabelId}
              onTap={onSelectLabel}
            />
          ))}
        </DndContext>
      </div>
    </div>
  );
}
