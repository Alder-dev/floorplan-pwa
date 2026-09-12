import { useState, type FormEvent } from 'react';
import { Check, Trash2, X, Ruler } from 'lucide-react';
import { useFloorPlanStore } from '@/store/useFloorPlanStore';
import { inferRoomIcon, ROOM_ICONS } from '@/lib/roomIcons';
import { computeArea, type Room } from '@/types';

interface RoomFormSheetProps {
  mode: 'add' | 'edit';
  /** Requerido cuando mode === 'edit'. */
  room?: Room;
  onClose: () => void;
}

/**
 * Formulario compartido para "Añadir espacio" (FAB) y "Editar espacio"
 * (tap sobre un bloque existente). Cada acción principal — confirmar,
 * eliminar, cerrar — está respaldada por su propio icono, tal como pide
 * la guía de UX del proyecto.
 */
export function RoomFormSheet({ mode, room, onClose }: RoomFormSheetProps) {
  const addRoom = useFloorPlanStore((s) => s.addRoom);
  const renameRoom = useFloorPlanStore((s) => s.renameRoom);
  const updateRoomDimensions = useFloorPlanStore((s) => s.updateRoomDimensions);
  const removeRoom = useFloorPlanStore((s) => s.removeRoom);

  const [label, setLabel] = useState(room?.label ?? '');
  const [width, setWidth] = useState(String(room?.width ?? 2));
  const [length, setLength] = useState(String(room?.length ?? 2));
  const [error, setError] = useState<string | null>(null);

  const previewIcon = inferRoomIcon(label || 'espacio');
  const PreviewIcon = ROOM_ICONS[previewIcon];
  const widthNum = Number(width) || 0;
  const lengthNum = Number(length) || 0;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!label.trim()) {
      setError('Ponle un nombre al espacio.');
      return;
    }
    if (widthNum <= 0 || lengthNum <= 0) {
      setError('El ancho y el largo deben ser mayores a 0.');
      return;
    }

    if (mode === 'add') {
      addRoom({
        label: label.trim(),
        icon: previewIcon,
        width: widthNum,
        length: lengthNum,
        x: 0,
        y: 0,
      });
    } else if (room) {
      renameRoom(room.id, label.trim());
      updateRoomDimensions(room.id, widthNum, lengthNum);
    }
    onClose();
  }

  function handleDelete() {
    if (room) removeRoom(room.id);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end bg-black/50" onClick={onClose}>
      <div
        className="w-full rounded-t-2xl border-t border-base-600 bg-base-800 px-5 pb-safe pt-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-base-600" />

        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blueprint-soft text-blueprint">
            <PreviewIcon size={20} />
          </div>
          <div>
            <h2 className="font-display text-base font-semibold text-ink-100">
              {mode === 'add' ? 'Añadir espacio' : 'Editar espacio'}
            </h2>
            {widthNum > 0 && lengthNum > 0 && (
              <p className="font-mono text-xs text-ink-500">
                {computeArea({ width: widthNum, length: lengthNum })} m²
              </p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs text-ink-500">Etiqueta</span>
            <input
              type="text"
              autoFocus
              placeholder="Ej. Baño visitas"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full rounded-lg border border-base-600 bg-base-900 px-3 py-3 text-base text-ink-100 outline-none focus:border-blueprint"
            />
          </label>

          <div>
            <span className="mb-1.5 flex items-center gap-1.5 text-xs text-ink-500">
              <Ruler size={13} className="text-blueprint" />
              Dimensiones (metros)
            </span>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block text-[11px] text-ink-500">Ancho</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min={0.5}
                  step={0.5}
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  className="w-full rounded-lg border border-base-600 bg-base-900 px-3 py-3 text-base text-ink-100 outline-none focus:border-blueprint"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] text-ink-500">Largo</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min={0.5}
                  step={0.5}
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className="w-full rounded-lg border border-base-600 bg-base-900 px-3 py-3 text-base text-ink-100 outline-none focus:border-blueprint"
                />
              </label>
            </div>
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-alert-soft px-3 py-2 text-sm text-alert">
              {error}
            </p>
          )}

          <div className="flex items-center gap-2 pt-1">
            {mode === 'edit' && (
              <button
                type="button"
                onClick={handleDelete}
                aria-label="Eliminar espacio"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-alert/40 text-alert active:bg-alert-soft"
              >
                <Trash2 size={18} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Cancelar"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-base-600 text-ink-300 active:bg-base-700"
            >
              <X size={18} />
            </button>
            <button
              type="submit"
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-blueprint font-medium text-base-950 active:scale-[0.98]"
            >
              <Check size={18} />
              {mode === 'add' ? 'Añadir' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
