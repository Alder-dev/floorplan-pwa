import { useState, type FormEvent } from 'react';
import { Check, Trash2, X, Type, Sparkles } from 'lucide-react';
import { useFloorPlanStore } from '@/store/useFloorPlanStore';
import type { PlanLabel, LabelSize, LabelColor } from '@/types';

interface LabelFormSheetProps {
  mode: 'add' | 'edit';
  label?: PlanLabel;
  onClose: () => void;
}

const QUICK_CHIPS = [
  'Ingreso',
  'Acceso Principal',
  'Patio',
  'Jardín',
  'Cochera',
  'Nivel +0.15',
  'Pasillo',
  'Vacío',
  'Terraza',
  'Lavadero',
];

const SIZE_OPTIONS: { id: LabelSize; label: string; preview: string }[] = [
  { id: 'sm', label: 'Pequeño', preview: 'Aa' },
  { id: 'md', label: 'Mediano', preview: 'Aa' },
  { id: 'lg', label: 'Grande', preview: 'Aa' },
];

const COLOR_OPTIONS: { id: LabelColor; label: string; sampleClass: string }[] = [
  { id: 'blueprint', label: 'Cian', sampleClass: 'bg-blueprint text-base-950' },
  { id: 'ink', label: 'Blanco', sampleClass: 'bg-ink-100 text-base-950' },
  { id: 'sub', label: 'Gris', sampleClass: 'bg-ink-500 text-base-950' },
];

export function LabelFormSheet({ mode, label, onClose }: LabelFormSheetProps) {
  const addLabel = useFloorPlanStore((s) => s.addLabel);
  const updateLabel = useFloorPlanStore((s) => s.updateLabel);
  const removeLabel = useFloorPlanStore((s) => s.removeLabel);

  const [text, setText] = useState(label?.text ?? '');
  const [fontSize, setFontSize] = useState<LabelSize>(label?.fontSize ?? 'md');
  const [color, setColor] = useState<LabelColor>(label?.color ?? 'blueprint');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) {
      setError('Escribe el texto de la etiqueta.');
      return;
    }

    if (mode === 'add') {
      addLabel({
        text: text.trim(),
        fontSize,
        color,
        x: 1,
        y: 1,
      });
    } else if (label) {
      updateLabel(label.id, {
        text: text.trim(),
        fontSize,
        color,
      });
    }
    onClose();
  }

  function handleDelete() {
    if (label) removeLabel(label.id);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end bg-black/50" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl border-t border-base-600 bg-base-800 px-5 pb-safe pt-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-base-600" />

        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blueprint-soft text-blueprint">
            <Type size={20} />
          </div>
          <div>
            <h2 className="font-display text-base font-semibold text-ink-100">
              {mode === 'add' ? 'Añadir etiqueta de texto' : 'Editar etiqueta'}
            </h2>
            <p className="font-sans text-xs text-ink-500">
              Anotaciones de accesos, niveles, notas y nombres de áreas.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs text-ink-500">Texto de la etiqueta</span>
            <input
              type="text"
              autoFocus
              placeholder="Ej. Ingreso, Nivel +0.15, Patio..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full rounded-lg border border-base-600 bg-base-900 px-3 py-2.5 text-base text-ink-100 outline-none focus:border-blueprint"
            />
          </label>

          {/* Sugerencias rápidas */}
          <div>
            <span className="mb-1.5 flex items-center gap-1.5 text-xs text-ink-500">
              <Sparkles size={13} className="text-blueprint" />
              Sugerencias rápidas
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setText(chip)}
                  className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                    text === chip
                      ? 'border-blueprint bg-blueprint-soft text-blueprint font-medium'
                      : 'border-base-600 bg-base-900 text-ink-300 hover:border-base-700'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Tamaño y color en dos columnas */}
          <div className="grid grid-cols-2 gap-3">
            {/* Tamaño */}
            <div>
              <span className="mb-1.5 block text-xs text-ink-500">Tamaño</span>
              <div className="grid grid-cols-3 gap-1.5">
                {SIZE_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFontSize(opt.id)}
                    className={`flex flex-col items-center justify-center rounded-lg border py-2 text-xs transition-colors ${
                      fontSize === opt.id
                        ? 'border-blueprint bg-blueprint-soft text-blueprint font-semibold'
                        : 'border-base-600 bg-base-900 text-ink-300 hover:border-base-700'
                    }`}
                  >
                    <span
                      className={
                        opt.id === 'lg' ? 'text-sm font-bold' : opt.id === 'sm' ? 'text-[10px]' : 'text-xs'
                      }
                    >
                      {opt.preview}
                    </span>
                    <span className="text-[10px] mt-0.5">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div>
              <span className="mb-1.5 block text-xs text-ink-500">Color / Estilo</span>
              <div className="grid grid-cols-3 gap-1.5">
                {COLOR_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setColor(opt.id)}
                    className={`flex flex-col items-center justify-center rounded-lg border py-2 text-xs transition-colors ${
                      color === opt.id
                        ? 'border-blueprint bg-blueprint-soft text-blueprint font-semibold'
                        : 'border-base-600 bg-base-900 text-ink-300 hover:border-base-700'
                    }`}
                  >
                    <span className={`h-3 w-3 rounded-full mb-1 ${opt.sampleClass}`} />
                    <span className="text-[10px]">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Previsualización en vivo */}
          {text.trim() && (
            <div className="flex flex-col items-center justify-center rounded-lg border border-base-700 bg-base-950/60 p-3">
              <span className="mb-2 text-[10px] uppercase tracking-wider text-ink-500 font-mono">
                Previsualización en plano
              </span>
              <div
                className={`rounded-md border font-mono tracking-wide transition-all ${
                  fontSize === 'lg'
                    ? 'text-[15px] px-3 py-1.5 font-bold'
                    : fontSize === 'sm'
                    ? 'text-[11px] px-2 py-0.5 font-medium'
                    : 'text-[13px] px-2.5 py-1 font-semibold'
                } ${
                  color === 'blueprint'
                    ? 'text-blueprint border-blueprint/50 bg-blueprint-soft/80'
                    : color === 'ink'
                    ? 'text-ink-100 border-base-600 bg-base-800/90'
                    : 'text-ink-500 border-base-700 bg-base-900/90'
                }`}
              >
                {text.trim()}
              </div>
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
                aria-label="Eliminar etiqueta"
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
