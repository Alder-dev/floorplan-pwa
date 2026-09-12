import { Plus, Type } from 'lucide-react';

interface FabAddRoomProps {
  onAddRoom: () => void;
  onAddLabel: () => void;
}

export function FabAddRoom({ onAddRoom, onAddLabel }: FabAddRoomProps) {
  return (
    <div className="pointer-events-auto absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-base-600 bg-base-800/95 p-1.5 shadow-sheet backdrop-blur">
      <button
        type="button"
        onClick={onAddRoom}
        aria-label="Añadir espacio"
        className="flex items-center gap-1.5 rounded-full bg-blueprint px-4 py-2.5 text-xs font-semibold text-base-950 shadow transition active:scale-95"
      >
        <Plus size={16} strokeWidth={2.5} />
        <span>Espacio</span>
      </button>
      <button
        type="button"
        onClick={onAddLabel}
        aria-label="Añadir texto o etiqueta"
        className="flex items-center gap-1.5 rounded-full border border-base-600 bg-base-900 px-3.5 py-2.5 text-xs font-medium text-ink-100 transition active:scale-95 hover:border-blueprint"
      >
        <Type size={15} className="text-blueprint" />
        <span>Texto</span>
      </button>
    </div>
  );
}
