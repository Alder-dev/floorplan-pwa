import { useState } from 'react';
import { FileImage, FileText, FileCode2, X, Download, Loader2 } from 'lucide-react';
import { useFloorPlanStore } from '@/store/useFloorPlanStore';
import { exportSVG, exportPNG, exportPDF } from '@/lib/exportPlan';

interface ExportSheetProps {
  onClose: () => void;
}

type ExportFormat = 'svg' | 'png' | 'pdf';
type ExportStatus = 'idle' | 'loading' | 'done' | 'error';

const FORMATS: { id: ExportFormat; label: string; sub: string; Icon: typeof FileImage }[] = [
  {
    id: 'pdf',
    label: 'PDF',
    sub: 'Documento listo para imprimir',
    Icon: FileText,
  },
  {
    id: 'png',
    label: 'Imagen PNG',
    sub: 'Alta resolución (2×), fondo oscuro',
    Icon: FileImage,
  },
  {
    id: 'svg',
    label: 'SVG',
    sub: 'Vector escalable, editable',
    Icon: FileCode2,
  },
];

/**
 * Sheet modal de exportación. Genera el archivo del piso activo
 * en el formato elegido y dispara la descarga en el navegador.
 */
export function ExportSheet({ onClose }: ExportSheetProps) {
  const config = useFloorPlanStore((s) => s.config);
  const rooms = useFloorPlanStore((s) => s.rooms);
  const labels = useFloorPlanStore((s) => s.labels ?? []);
  const activeFloor = useFloorPlanStore((s) => s.activeFloor);

  const [status, setStatus] = useState<ExportStatus>('idle');
  const [activeFormat, setActiveFormat] = useState<ExportFormat | null>(null);

  if (!config) return null;

  async function handleExport(format: ExportFormat) {
    if (!config || status === 'loading') return;
    setActiveFormat(format);
    setStatus('loading');
    try {
      if (format === 'svg') exportSVG(config, rooms, activeFloor, labels);
      else if (format === 'png') await exportPNG(config, rooms, activeFloor, labels);
      else await exportPDF(config, rooms, activeFloor, labels);
      setStatus('done');
      setTimeout(() => {
        setStatus('idle');
        setActiveFormat(null);
      }, 1500);
    } catch (err) {
      console.error('Export failed:', err);
      setStatus('error');
      setTimeout(() => {
        setStatus('idle');
        setActiveFormat(null);
      }, 2000);
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end bg-black/50" onClick={onClose}>
      <div
        className="w-full rounded-t-2xl border-t border-base-600 bg-base-800 px-5 pb-safe pt-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-base-600" />

        {/* Encabezado */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-display text-base font-semibold text-ink-100">Exportar plano</h2>
            <p className="text-xs text-ink-500">
              Piso activo · {config.frente}m × {config.profundidad}m
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 active:bg-base-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* Opciones de formato */}
        <div className="mb-5 space-y-2">
          {FORMATS.map(({ id, label, sub, Icon }) => {
            const isThis = activeFormat === id;
            const isLoading = isThis && status === 'loading';
            const isDone = isThis && status === 'done';
            const isError = isThis && status === 'error';

            return (
              <button
                key={id}
                type="button"
                id={`export-${id}`}
                onClick={() => handleExport(id)}
                disabled={status === 'loading'}
                className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition active:scale-[0.98] disabled:opacity-60 ${
                  isDone
                    ? 'border-blueprint bg-blueprint-soft text-blueprint'
                    : isError
                      ? 'border-alert/40 bg-alert-soft text-alert'
                      : 'border-base-600 bg-base-900 text-ink-100 active:bg-base-700'
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                    isDone ? 'bg-blueprint/20' : isError ? 'bg-alert/10' : 'bg-base-700'
                  }`}
                >
                  {isLoading ? (
                    <Loader2 size={18} className="animate-spin text-blueprint" />
                  ) : isDone ? (
                    <Download size={18} className="text-blueprint" />
                  ) : (
                    <Icon size={18} className={isError ? 'text-alert' : 'text-blueprint'} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium leading-tight">
                    {isLoading
                      ? 'Generando…'
                      : isDone
                        ? '¡Descargado!'
                        : isError
                          ? 'Error al exportar'
                          : label}
                  </p>
                  <p className="text-xs text-ink-500">{sub}</p>
                </div>
              </button>
            );
          })}
        </div>

        <p className="pb-1 text-center text-[11px] text-ink-500">
          Solo se exporta el piso que estás viendo actualmente
        </p>
      </div>
    </div>
  );
}
