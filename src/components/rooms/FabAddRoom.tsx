import { Plus } from 'lucide-react';

interface FabAddRoomProps {
  onClick: () => void;
}

export function FabAddRoom({ onClick }: FabAddRoomProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Añadir espacio"
      className="pointer-events-auto absolute bottom-6 left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-blueprint text-base-950 shadow-sheet transition active:scale-95"
    >
      <Plus size={26} strokeWidth={2.5} />
    </button>
  );
}
