import { LandPlot, RotateCcw, Sun, Moon } from 'lucide-react';
import { useFloorPlanStore } from '@/store/useFloorPlanStore';
import { useTheme } from '@/lib/useTheme';

export function AppHeader() {
  const config = useFloorPlanStore((s) => s.config);
  const resetPlan = useFloorPlanStore((s) => s.resetPlan);
  const { theme, toggleTheme } = useTheme();

  function handleReset() {
    if (window.confirm('¿Descartar este plano y volver a la configuración inicial?')) {
      resetPlan();
    }
  }

  return (
    <header className="flex items-center justify-between border-b border-base-700 bg-base-900/95 px-4 py-3 backdrop-blur">
      <div className="flex items-center gap-2">
        <LandPlot size={18} className="text-blueprint" />
        <div className="leading-tight">
          <p className="font-display text-sm font-semibold text-ink-100">Planos 2D</p>
          {config && (
            <p className="font-mono text-[11px] text-ink-500">
              {config.frente}m × {config.profundidad}m
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        {/* Toggle claro / oscuro */}
        <button
          type="button"
          id="theme-toggle"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
          title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 transition active:scale-95 active:bg-base-700"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Reiniciar plano */}
        <button
          type="button"
          onClick={handleReset}
          aria-label="Reiniciar plano"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 transition active:scale-95 active:bg-base-700"
        >
          <RotateCcw size={18} />
        </button>
      </div>
    </header>
  );
}
