import { Layers } from 'lucide-react';
import { useFloorPlanStore } from '@/store/useFloorPlanStore';

/**
 * Tabs de piso. Cambiar de tab solo cambia `activeFloor` en el store: los
 * rooms de cada nivel ya están filtrados por floorIndex en el Canvas, así
 * que la distribución de cada piso se conserva intacta al alternar.
 */
export function FloorTabs() {
  const config = useFloorPlanStore((s) => s.config);
  const activeFloor = useFloorPlanStore((s) => s.activeFloor);
  const setActiveFloor = useFloorPlanStore((s) => s.setActiveFloor);

  if (!config || config.pisos <= 1) return null;

  const floors = Array.from({ length: config.pisos }, (_, i) => i);

  return (
    <div className="no-scrollbar flex items-center gap-2 overflow-x-auto border-b border-base-700 bg-base-900 px-3 py-2">
      <Layers size={15} className="shrink-0 text-ink-500" />
      {floors.map((floorIndex) => {
        const isActive = floorIndex === activeFloor;
        const label = floorIndex === 0 ? 'PB' : `Piso ${floorIndex}`;
        return (
          <button
            key={floorIndex}
            type="button"
            onClick={() => setActiveFloor(floorIndex)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
              isActive
                ? 'bg-blueprint text-base-950'
                : 'bg-base-800 text-ink-300 active:bg-base-700'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
