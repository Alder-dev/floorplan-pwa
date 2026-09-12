import { useState } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { FloorTabs } from '@/components/layout/FloorTabs';
import { FloorCanvas, type CanvasMode } from '@/components/canvas/FloorCanvas';
import { CanvasToolbar } from '@/components/canvas/CanvasToolbar';
import { FabAddRoom } from '@/components/rooms/FabAddRoom';
import { RoomFormSheet } from '@/components/rooms/RoomFormSheet';
import { LabelFormSheet } from '@/components/labels/LabelFormSheet';
import { ExportSheet } from '@/components/canvas/ExportSheet';
import { useFloorPlanStore } from '@/store/useFloorPlanStore';

type SheetState =
  | { mode: 'add' }
  | { mode: 'edit'; roomId: string }
  | { mode: 'add-label' }
  | { mode: 'edit-label'; labelId: string }
  | { mode: 'export' }
  | null;

export function CanvasScreen() {
  const [canvasMode, setCanvasMode] = useState<CanvasMode>('edit');
  const [sheet, setSheet] = useState<SheetState>(null);
  const rooms = useFloorPlanStore((s) => s.rooms);
  const labels = useFloorPlanStore((s) => s.labels ?? []);

  const editingRoom = sheet?.mode === 'edit' ? rooms.find((r) => r.id === sheet.roomId) : undefined;
  const editingLabel =
    sheet?.mode === 'edit-label' ? labels.find((l) => l.id === sheet.labelId) : undefined;

  return (
    <div className="flex h-dvh flex-col bg-base-900">
      <AppHeader onExport={() => setSheet({ mode: 'export' })} />
      <FloorTabs />

      <div className="relative flex-1 overflow-hidden">
        <FloorCanvas
          mode={canvasMode}
          selectedRoomId={sheet?.mode === 'edit' ? sheet.roomId : null}
          selectedLabelId={sheet?.mode === 'edit-label' ? sheet.labelId : null}
          onSelectRoom={(id) => setSheet({ mode: 'edit', roomId: id })}
          onSelectLabel={(id) => setSheet({ mode: 'edit-label', labelId: id })}
        />
        <CanvasToolbar mode={canvasMode} onModeChange={setCanvasMode} />
        <FabAddRoom
          onAddRoom={() => setSheet({ mode: 'add' })}
          onAddLabel={() => setSheet({ mode: 'add-label' })}
        />
      </div>

      {sheet?.mode === 'add' && <RoomFormSheet mode="add" onClose={() => setSheet(null)} />}
      {sheet?.mode === 'edit' && editingRoom && (
        <RoomFormSheet mode="edit" room={editingRoom} onClose={() => setSheet(null)} />
      )}
      {sheet?.mode === 'add-label' && <LabelFormSheet mode="add" onClose={() => setSheet(null)} />}
      {sheet?.mode === 'edit-label' && editingLabel && (
        <LabelFormSheet mode="edit" label={editingLabel} onClose={() => setSheet(null)} />
      )}
      {sheet?.mode === 'export' && <ExportSheet onClose={() => setSheet(null)} />}
    </div>
  );
}
