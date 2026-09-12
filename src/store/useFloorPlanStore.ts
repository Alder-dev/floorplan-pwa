import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FloorPlanConfig, FloorPlanState, Room, SnapStep } from '@/types';
import { clamp, snapToGrid, ZOOM_MAX, ZOOM_MIN } from '@/lib/geometry';

const DEFAULT_GRID: FloorPlanState['grid'] = {
  pixelsPerMeter: 40,
  snapStep: 0.5,
  zoom: 1,
  pan: { x: 0, y: 0 },
};

function makeId(): string {
  return `room_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Store único para toda la app. Los `rooms` de TODOS los pisos viven en un
 * solo arreglo plano, cada uno con su `floorIndex` — así el Canvas siempre
 * filtra por `activeFloor` y cada nivel mantiene su distribución
 * independiente sin necesidad de estructuras anidadas por piso.
 *
 * `persist` guarda el plano en localStorage para que sobreviva a que la
 * PWA se cierre y reabra (comportamiento esperado de una app "instalada").
 */
export const useFloorPlanStore = create<FloorPlanState>()(
  persist(
    (set, get) => ({
      config: null,
      isConfigured: false,
      rooms: [],
      activeFloor: 0,
      grid: DEFAULT_GRID,

      setConfig: (config: FloorPlanConfig) => {
        set({
          config,
          isConfigured: true,
          activeFloor: 0,
        });
      },

      resetPlan: () => {
        set({
          config: null,
          isConfigured: false,
          rooms: [],
          activeFloor: 0,
          grid: DEFAULT_GRID,
        });
      },

      setActiveFloor: (floorIndex: number) => {
        const { config } = get();
        if (!config) return;
        const safeIndex = clamp(floorIndex, 0, config.pisos - 1);
        set({ activeFloor: safeIndex });
      },

      addRoom: (room, floorIndex) => {
        const { activeFloor, grid, config } = get();
        const targetFloor = floorIndex ?? activeFloor;
        const maxX = config ? config.frente - room.width : room.x;
        const maxY = config ? config.profundidad - room.length : room.y;

        const newRoom: Room = {
          ...room,
          id: makeId(),
          floorIndex: targetFloor,
          x: clamp(snapToGrid(room.x, grid.snapStep), 0, Math.max(maxX, 0)),
          y: clamp(snapToGrid(room.y, grid.snapStep), 0, Math.max(maxY, 0)),
        };
        set({ rooms: [...get().rooms, newRoom] });
      },

      updateRoomPosition: (id: string, x: number, y: number) => {
        const { rooms, grid, config } = get();
        set({
          rooms: rooms.map((r) => {
            if (r.id !== id) return r;
            const maxX = config ? config.frente - r.width : x;
            const maxY = config ? config.profundidad - r.length : y;
            return {
              ...r,
              x: clamp(snapToGrid(x, grid.snapStep), 0, Math.max(maxX, 0)),
              y: clamp(snapToGrid(y, grid.snapStep), 0, Math.max(maxY, 0)),
            };
          }),
        });
      },

      updateRoomDimensions: (id: string, width: number, length: number) => {
        set({
          rooms: get().rooms.map((r) =>
            r.id === id ? { ...r, width: Math.max(width, 0.5), length: Math.max(length, 0.5) } : r,
          ),
        });
      },

      renameRoom: (id: string, label: string) => {
        set({
          rooms: get().rooms.map((r) => (r.id === id ? { ...r, label } : r)),
        });
      },

      removeRoom: (id: string) => {
        set({ rooms: get().rooms.filter((r) => r.id !== id) });
      },

      setSnapStep: (step: SnapStep) => {
        set({ grid: { ...get().grid, snapStep: step } });
      },

      setZoom: (zoom: number) => {
        set({ grid: { ...get().grid, zoom: clamp(zoom, ZOOM_MIN, ZOOM_MAX) } });
      },

      nudgeZoom: (delta: number) => {
        const { grid } = get();
        set({ grid: { ...grid, zoom: clamp(grid.zoom + delta, ZOOM_MIN, ZOOM_MAX) } });
      },

      setPan: (pan: { x: number; y: number }) => {
        set({ grid: { ...get().grid, pan } });
      },
    }),
    { name: 'floorplan-pwa-storage' },
  ),
);

/** Selector de conveniencia: rooms del piso actualmente activo. */
export function useActiveFloorRooms(): Room[] {
  return useFloorPlanStore((s) => s.rooms.filter((r) => r.floorIndex === s.activeFloor));
}
