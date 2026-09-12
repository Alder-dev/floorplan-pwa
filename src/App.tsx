import { SetupWizard } from '@/components/wizard/SetupWizard';
import { CanvasScreen } from '@/components/layout/CanvasScreen';
import { useFloorPlanStore } from '@/store/useFloorPlanStore';

export default function App() {
  const isConfigured = useFloorPlanStore((s) => s.isConfigured);
  return isConfigured ? <CanvasScreen /> : <SetupWizard />;
}
