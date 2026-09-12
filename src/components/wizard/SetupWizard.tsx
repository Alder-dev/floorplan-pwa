import { useState, type FormEvent } from 'react';
import { Ruler, Layers, ArrowRight, LandPlot } from 'lucide-react';
import { useFloorPlanStore } from '@/store/useFloorPlanStore';

/**
 * Pantalla de entrada. Sin plano configurado (`isConfigured === false`),
 * App.tsx renderiza únicamente este componente. Al confirmar, escribe la
 * config en el store y App.tsx cambia automáticamente al lienzo.
 */
export function SetupWizard() {
  const setConfig = useFloorPlanStore((s) => s.setConfig);

  const [frente, setFrente] = useState('8');
  const [profundidad, setProfundidad] = useState('12');
  const [pisos, setPisos] = useState('1');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const frenteNum = Number(frente);
    const profundidadNum = Number(profundidad);
    const pisosNum = Math.round(Number(pisos));

    if (!frenteNum || !profundidadNum || frenteNum <= 0 || profundidadNum <= 0) {
      setError('Ingresa dimensiones válidas mayores a 0.');
      return;
    }
    if (!pisosNum || pisosNum < 1 || pisosNum > 12) {
      setError('La cantidad de pisos debe estar entre 1 y 12.');
      return;
    }

    setError(null);
    setConfig({ frente: frenteNum, profundidad: profundidadNum, pisos: pisosNum });
  }

  return (
    <div className="flex min-h-dvh flex-col justify-center bg-base-900 px-6 py-10">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blueprint-soft text-blueprint">
            <LandPlot size={22} />
          </div>
          <div>
            <h1 className="font-display text-xl font-semibold text-ink-100">Nuevo plano</h1>
            <p className="text-sm text-ink-500">Define el terreno para empezar a distribuir</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <fieldset className="space-y-3">
            <legend className="mb-1 flex items-center gap-2 text-sm font-medium text-ink-300">
              <Ruler size={16} className="text-blueprint" />
              Dimensiones del terreno
            </legend>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1.5 block text-xs text-ink-500">Frente (m)</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min={1}
                  step={0.5}
                  value={frente}
                  onChange={(e) => setFrente(e.target.value)}
                  className="w-full rounded-lg border border-base-600 bg-base-800 px-3 py-3 text-base text-ink-100 outline-none focus:border-blueprint"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs text-ink-500">Profundidad (m)</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min={1}
                  step={0.5}
                  value={profundidad}
                  onChange={(e) => setProfundidad(e.target.value)}
                  className="w-full rounded-lg border border-base-600 bg-base-800 px-3 py-3 text-base text-ink-100 outline-none focus:border-blueprint"
                />
              </label>
            </div>
          </fieldset>

          <label className="block">
            <span className="mb-1.5 flex items-center gap-2 text-sm font-medium text-ink-300">
              <Layers size={16} className="text-blueprint" />
              Cantidad de pisos
            </span>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={12}
              value={pisos}
              onChange={(e) => setPisos(e.target.value)}
              className="w-full rounded-lg border border-base-600 bg-base-800 px-3 py-3 text-base text-ink-100 outline-none focus:border-blueprint"
            />
          </label>

          {error && (
            <p role="alert" className="rounded-lg bg-alert-soft px-3 py-2 text-sm text-alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blueprint px-4 py-3.5 font-medium text-base-950 transition active:scale-[0.98]"
          >
            Crear lienzo
            <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
