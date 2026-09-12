import { useState, useMemo, type FormEvent } from 'react';
import { Check, Trash2, X, Ruler, Square, CornerUpRight } from 'lucide-react';
import { useFloorPlanStore } from '@/store/useFloorPlanStore';
import { inferRoomIcon, ROOM_ICONS } from '@/lib/roomIcons';
import { computeArea, type Room, type RoomShapeType, type LCorner } from '@/types';
import { generateLShape, pointsToSvgString } from '@/lib/geometryShapes';

interface RoomFormSheetProps {
  mode: 'add' | 'edit';
  /** Requerido cuando mode === 'edit'. */
  room?: Room;
  onClose: () => void;
}

const CORNER_OPTIONS: { id: LCorner; label: string; symbol: string }[] = [
  { id: 'top-left', label: 'Arriba Izq', symbol: '↖' },
  { id: 'top-right', label: 'Arriba Der', symbol: '↗' },
  { id: 'bottom-left', label: 'Abajo Izq', symbol: '↙' },
  { id: 'bottom-right', label: 'Abajo Der', symbol: '↘' },
];

/**
 * Formulario compartido para "Añadir espacio" (FAB) y "Editar espacio"
 * (tap sobre un bloque existente). Permite crear habitaciones rectangulares o
 * en forma de "L" con recorte paramétrico y previsualización en vivo.
 */
export function RoomFormSheet({ mode, room, onClose }: RoomFormSheetProps) {
  const addRoom = useFloorPlanStore((s) => s.addRoom);
  const updateRoom = useFloorPlanStore((s) => s.updateRoom);
  const removeRoom = useFloorPlanStore((s) => s.removeRoom);

  const [label, setLabel] = useState(room?.label ?? '');
  const [shapeType, setShapeType] = useState<RoomShapeType>(room?.shapeType ?? 'rect');
  const [width, setWidth] = useState(String(room?.width ?? (room?.shapeType === 'l-shape' ? 5 : 2)));
  const [length, setLength] = useState(String(room?.length ?? (room?.shapeType === 'l-shape' ? 4 : 2)));

  // Parámetros específicos de forma en L
  const [cutoutWidth, setCutoutWidth] = useState(String(room?.shapeParams?.cutoutWidth ?? 2.5));
  const [cutoutLength, setCutoutLength] = useState(String(room?.shapeParams?.cutoutLength ?? 2));
  const [cutoutCorner, setCutoutCorner] = useState<LCorner>(
    room?.shapeParams?.cutoutCorner ?? 'top-right',
  );

  const [error, setError] = useState<string | null>(null);

  const previewIcon = inferRoomIcon(label || 'espacio');
  const PreviewIcon = ROOM_ICONS[previewIcon];

  const widthNum = Number(width) || 0;
  const lengthNum = Number(length) || 0;
  const cutWNum = Number(cutoutWidth) || 0;
  const cutLNum = Number(cutoutLength) || 0;

  // Puntos calculados para forma en L y cálculo de área dinámico
  const previewPoints = useMemo(() => {
    if (shapeType === 'l-shape') {
      if (widthNum > 0 && lengthNum > 0 && cutWNum > 0 && cutLNum > 0 && cutWNum < widthNum && cutLNum < lengthNum) {
        return generateLShape(widthNum, lengthNum, cutWNum, cutLNum, cutoutCorner);
      }
    }
    return undefined;
  }, [shapeType, widthNum, lengthNum, cutWNum, cutLNum, cutoutCorner]);

  const currentArea = useMemo(() => {
    if (shapeType === 'l-shape' && previewPoints) {
      return computeArea({ width: widthNum, length: lengthNum, points: previewPoints });
    }
    return computeArea({ width: widthNum, length: lengthNum });
  }, [shapeType, previewPoints, widthNum, lengthNum]);

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

    if (shapeType === 'l-shape') {
      if (cutWNum <= 0 || cutLNum <= 0) {
        setError('Las medidas del recorte deben ser mayores a 0.');
        return;
      }
      if (cutWNum >= widthNum) {
        setError('El recorte de ancho debe ser menor al ancho total.');
        return;
      }
      if (cutLNum >= lengthNum) {
        setError('El recorte de largo debe ser menor al largo total.');
        return;
      }
    }

    const calculatedPoints =
      shapeType === 'l-shape'
        ? generateLShape(widthNum, lengthNum, cutWNum, cutLNum, cutoutCorner)
        : undefined;

    const shapeParams =
      shapeType === 'l-shape'
        ? { cutoutWidth: cutWNum, cutoutLength: cutLNum, cutoutCorner }
        : undefined;

    if (mode === 'add') {
      addRoom({
        label: label.trim(),
        icon: previewIcon,
        width: widthNum,
        length: lengthNum,
        shapeType,
        shapeParams,
        points: calculatedPoints,
        x: 0,
        y: 0,
      });
    } else if (room) {
      updateRoom(room.id, {
        label: label.trim(),
        icon: previewIcon,
        width: widthNum,
        length: lengthNum,
        shapeType,
        shapeParams,
        points: calculatedPoints,
      });
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
        className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl border-t border-base-600 bg-base-800 px-5 pb-safe pt-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-base-600" />

        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blueprint-soft text-blueprint">
              <PreviewIcon size={20} />
            </div>
            <div>
              <h2 className="font-display text-base font-semibold text-ink-100">
                {mode === 'add' ? 'Añadir espacio' : 'Editar espacio'}
              </h2>
              {widthNum > 0 && lengthNum > 0 && (
                <p className="font-mono text-xs text-ink-500">
                  {shapeType === 'l-shape'
                    ? `(${widthNum}m x ${lengthNum}m máx.) ${currentArea} m²`
                    : `(${widthNum}m x ${lengthNum}m) ${currentArea} m²`}
                </p>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Selector de forma */}
          <div>
            <span className="mb-1.5 block text-xs text-ink-500">Forma del espacio</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setShapeType('rect')}
                className={`flex items-center justify-center gap-2 rounded-lg border py-2.5 text-xs font-medium transition-colors ${
                  shapeType === 'rect'
                    ? 'border-blueprint bg-blueprint-soft text-blueprint font-semibold'
                    : 'border-base-600 bg-base-900 text-ink-300 active:border-base-700'
                }`}
              >
                <Square size={15} />
                Rectangular
              </button>
              <button
                type="button"
                onClick={() => {
                  setShapeType('l-shape');
                  if (widthNum < 3) setWidth('5');
                  if (lengthNum < 3) setLength('4');
                }}
                className={`flex items-center justify-center gap-2 rounded-lg border py-2.5 text-xs font-medium transition-colors ${
                  shapeType === 'l-shape'
                    ? 'border-blueprint bg-blueprint-soft text-blueprint font-semibold'
                    : 'border-base-600 bg-base-900 text-ink-300 active:border-base-700'
                }`}
              >
                <CornerUpRight size={15} />
                Forma en L
              </button>
            </div>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs text-ink-500">Etiqueta</span>
            <input
              type="text"
              autoFocus
              placeholder="Ej. Salón comedor, Cocina..."
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full rounded-lg border border-base-600 bg-base-900 px-3 py-2.5 text-base text-ink-100 outline-none focus:border-blueprint"
            />
          </label>

          {/* Dimensiones principales */}
          <div>
            <span className="mb-1.5 flex items-center gap-1.5 text-xs text-ink-500">
              <Ruler size={13} className="text-blueprint" />
              {shapeType === 'l-shape' ? 'Dimensiones totales (metros)' : 'Dimensiones (metros)'}
            </span>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block text-[11px] text-ink-500">
                  {shapeType === 'l-shape' ? 'Ancho total (frente)' : 'Ancho'}
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  min={0.25}
                  step={0.25}
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  className="w-full rounded-lg border border-base-600 bg-base-900 px-3 py-2.5 text-base text-ink-100 outline-none focus:border-blueprint"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] text-ink-500">
                  {shapeType === 'l-shape' ? 'Largo total (fondo)' : 'Largo'}
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  min={0.25}
                  step={0.25}
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className="w-full rounded-lg border border-base-600 bg-base-900 px-3 py-2.5 text-base text-ink-100 outline-none focus:border-blueprint"
                />
              </label>
            </div>
          </div>

          {/* Parámetros de Forma en L */}
          {shapeType === 'l-shape' && (
            <div className="rounded-xl border border-base-600 bg-base-900/50 p-3.5 space-y-3.5">
              <div>
                <span className="mb-1.5 block text-xs font-medium text-ink-300">
                  Recorte de la L (metros)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="mb-1 block text-[11px] text-ink-500">Ancho recorte</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      min={0.25}
                      max={Math.max(widthNum - 0.25, 0.25)}
                      step={0.25}
                      value={cutoutWidth}
                      onChange={(e) => setCutoutWidth(e.target.value)}
                      className="w-full rounded-lg border border-base-600 bg-base-900 px-3 py-2 text-sm text-ink-100 outline-none focus:border-blueprint"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[11px] text-ink-500">Largo recorte</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      min={0.25}
                      max={Math.max(lengthNum - 0.25, 0.25)}
                      step={0.25}
                      value={cutoutLength}
                      onChange={(e) => setCutoutLength(e.target.value)}
                      className="w-full rounded-lg border border-base-600 bg-base-900 px-3 py-2 text-sm text-ink-100 outline-none focus:border-blueprint"
                    />
                  </label>
                </div>
              </div>

              <div>
                <span className="mb-1.5 block text-xs font-medium text-ink-300">
                  Esquina recortada (abierta)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {CORNER_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setCutoutCorner(opt.id)}
                      className={`flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs transition-colors ${
                        cutoutCorner === opt.id
                          ? 'border-blueprint bg-blueprint-soft text-blueprint font-medium'
                          : 'border-base-600 bg-base-800 text-ink-300 hover:border-base-700'
                      }`}
                    >
                      <span className="font-mono text-sm">{opt.symbol}</span>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Previsualización en miniatura */}
              {previewPoints && (
                <div className="flex flex-col items-center justify-center rounded-lg border border-base-700 bg-base-950/60 p-2.5">
                  <span className="mb-1.5 text-[10px] uppercase tracking-wider text-ink-500 font-mono">
                    Previsualización
                  </span>
                  <svg
                    width="120"
                    height="80"
                    viewBox={`-5 -5 ${widthNum * 20 + 10} ${lengthNum * 20 + 10}`}
                    className="overflow-visible"
                  >
                    <polygon
                      points={pointsToSvgString(previewPoints, 20, 0, 0)}
                      className="fill-blueprint-soft stroke-blueprint"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="mt-1 font-mono text-[11px] text-blueprint font-medium">
                    {currentArea} m²
                  </span>
                </div>
              )}
            </div>
          )}

          {error && (
            <p role="alert" className="rounded-lg bg-alert-soft px-3 py-2 text-sm text-alert">
              {error}
            </p>
          )}

          <div className="sticky bottom-0 -mx-5 mt-4 flex items-center gap-2 border-t border-base-700/80 bg-base-800/95 px-5 py-3 backdrop-blur">
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
