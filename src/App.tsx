import { SetupWizard } from '@/components/wizard/SetupWizard';
import { CanvasScreen } from '@/components/layout/CanvasScreen';
import { useFloorPlanStore } from '@/store/useFloorPlanStore';
import { useTheme } from '@/lib/useTheme';

export default function App() {
  const isConfigured = useFloorPlanStore((s) => s.isConfigured);
  // Inicializa el tema lo más alto posible para evitar parpadeo
  useTheme();
  return isConfigured ? <CanvasScreen /> : <SetupWizard />;
}
