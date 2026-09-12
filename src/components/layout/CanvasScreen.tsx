import { useState } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { FloorTabs } from '@/components/layout/FloorTabs';
import { FloorCanvas, type CanvasMode } from '@/components/canvas/FloorCanvas';
import { CanvasToolbar } from '@/components/canvas/CanvasToolbar';
import { FabAddRoom } from '@/components/rooms/FabAddRoom';
import { RoomFormSheet } from '@/components/rooms/RoomFormSheet';
import { useFloorPlanStore } from '@/store/useFloorPlanStore';

type SheetState = { mode: 'add' } | { mode: 'edit'; roomId: string } | null;

export function CanvasScreen() {
  const [canvasMode, setCanvasMode] = useState<CanvasMode>('edit');
  const [sheet, setSheet] = useState<SheetState>(null);
  const rooms = useFloorPlanStore((s) => s.rooms);

  const editingRoom = sheet?.mode === 'edit' ? rooms.find((r) => r.id === sheet.roomId) : undefined;

  return (
    <div className="flex h-dvh flex-col bg-base-900">
      <AppHeader />
      <FloorTabs />

      <div className="relative flex-1 overflow-hidden">
        <FloorCanvas
          mode={canvasMode}
          selectedRoomId={sheet?.mode === 'edit' ? sheet.roomId : null}
          onSelectRoom={(id) => setSheet({ mode: 'edit', roomId: id })}
        />
        <CanvasToolbar mode={canvasMode} onModeChange={setCanvasMode} />
        <FabAddRoom onClick={() => setSheet({ mode: 'add' })} />
      </div>

      {sheet?.mode === 'add' && <RoomFormSheet mode="add" onClose={() => setSheet(null)} />}
      {sheet?.mode === 'edit' && editingRoom && (
        <RoomFormSheet mode="edit" room={editingRoom} onClose={() => setSheet(null)} />
      )}
    </div>
  );
}
