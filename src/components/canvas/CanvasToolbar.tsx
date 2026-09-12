import { Plus, Minus, Hand, MousePointer2, Grid2x2 } from 'lucide-react';
import { useFloorPlanStore } from '@/store/useFloorPlanStore';
import type { CanvasMode } from '@/components/canvas/FloorCanvas';
import type { SnapStep } from '@/types';

interface CanvasToolbarProps {
  mode: CanvasMode;
  onModeChange: (mode: CanvasMode) => void;
}

function getNextSnapStep(current: SnapStep): SnapStep {
  if (current === 1) return 0.5;
  if (current === 0.5) return 0.25;
  return 1;
}

/**
 * Toolbar vertical flotante, alineada a la zona cómoda para el pulgar
 * (borde derecho, altura media-baja). Agrupa: alternar modo
 * edición/paneo (evita el conflicto con el drag-and-drop), zoom, y paso
 * de snap-to-grid.
 */
export function CanvasToolbar({ mode, onModeChange }: CanvasToolbarProps) {
  const zoom = useFloorPlanStore((s) => s.grid.zoom);
  const nudgeZoom = useFloorPlanStore((s) => s.nudgeZoom);
  const snapStep = useFloorPlanStore((s) => s.grid.snapStep);
  const setSnapStep = useFloorPlanStore((s) => s.setSnapStep);

  return (
    <div className="pointer-events-none absolute inset-0">
      {/* Modo edición / paneo */}
      <div className="pointer-events-auto absolute right-3 top-3 flex flex-col overflow-hidden rounded-xl border border-base-600 bg-base-800/95 shadow-sheet">
        <button
          type="button"
          aria-label="Modo selección y arrastre"
          aria-pressed={mode === 'edit'}
          onClick={() => onModeChange('edit')}
          className={`flex h-11 w-11 items-center justify-center transition ${
            mode === 'edit' ? 'bg-blueprint text-base-950' : 'text-ink-300'
          }`}
        >
          <MousePointer2 size={18} />
        </button>
        <button
          type="button"
          aria-label="Modo paneo del lienzo"
          aria-pressed={mode === 'pan'}
          onClick={() => onModeChange('pan')}
          className={`flex h-11 w-11 items-center justify-center border-t border-base-600 transition ${
            mode === 'pan' ? 'bg-blueprint text-base-950' : 'text-ink-300'
          }`}
        >
          <Hand size={18} />
        </button>
      </div>

      {/* Zoom + snap, en la zona baja para uso con el pulgar */}
      <div className="pointer-events-auto absolute bottom-24 right-3 flex flex-col overflow-hidden rounded-xl border border-base-600 bg-base-800/95 shadow-sheet">
        <button
          type="button"
          aria-label="Acercar zoom"
          onClick={() => nudgeZoom(0.05)}
          className="flex h-11 w-11 items-center justify-center text-ink-300 active:bg-base-700"
        >
          <Plus size={18} />
        </button>
        <div className="border-t border-base-600 py-1 text-center font-mono text-[10px] text-ink-500">
          {Math.round(zoom * 100)}%
        </div>
        <button
          type="button"
          aria-label="Alejar zoom"
          onClick={() => nudgeZoom(-0.05)}
          className="flex h-11 w-11 items-center justify-center border-t border-base-600 text-ink-300 active:bg-base-700"
        >
          <Minus size={18} />
        </button>
        <button
          type="button"
          aria-label={`Cambiar paso de grilla, actual ${snapStep}m`}
          onClick={() => setSnapStep(getNextSnapStep(snapStep))}
          className="flex h-11 w-11 flex-col items-center justify-center border-t border-base-600 text-ink-300 active:bg-base-700"
        >
          <Grid2x2 size={16} />
          <span className="font-mono text-[9px] leading-none">{snapStep}m</span>
        </button>
      </div>
    </div>
  );
}
