import { useNavigate, useParams, useLocation } from "react-router";
import UnitSelector from "@/react-app/components/UnitSelector";
import ActivityList from "@/react-app/components/ActivityList";
import DailyPlanningDetails from "@/react-app/components/DailyPlanningDetails";
import ActivityPlanningForm from "@/react-app/components/ActivityPlanningForm";

interface Unit {
  id: string;
  name: string;
  lastModified: string;
  description: string;
  grade: string;
  subject: string;
}

export default function CreateDailyPlanning() {
  const navigate = useNavigate();
  const location = useLocation();
  const { summaryId } = useParams<{ summaryId: string }>();

  console.log('🔍 [CREATE DAILY PLANNING] summaryId:', summaryId);
  console.log('🔍 [CREATE DAILY PLANNING] location.state:', location.state);

  // CRITICAL: When user navigates to /crear-planificacion-diaria/nueva from dashboard,
  // we need to CLEAN ALL residual data from previous planning sessions
  if (summaryId === 'nueva') {
    console.log('🧹 [CLEANUP] Detectada nueva planificación desde dashboard - limpiando datos residuales');
    
    // Clean all planning-related sessionStorage data
    sessionStorage.removeItem('currentDailyPlanning');
    sessionStorage.removeItem('incompletionReason');
    sessionStorage.removeItem('themeCompleted');
    sessionStorage.removeItem('selectedEfemeride');
    sessionStorage.removeItem('selectedPlanningDate');
    sessionStorage.removeItem('selectedUnitName');
    sessionStorage.removeItem('selectedUnitSubject');
    sessionStorage.removeItem('selectedUnitGrade');
    
    console.log('✅ [CLEANUP] SessionStorage limpiado - iniciando con datos frescos');
  }

  const handleSelectUnit = (unit: Unit) => {
    console.log('✅ [CREATE DAILY PLANNING] Unidad seleccionada:', unit.name);
    // Store unit name, subject, and grade in sessionStorage for persistence
    sessionStorage.setItem('selectedUnitName', unit.name);
    sessionStorage.setItem('selectedUnitSubject', unit.subject);
    sessionStorage.setItem('selectedUnitGrade', unit.grade);
    // Navigate to activities route with unit name, subject, and grade in state
    navigate('/crear-planificacion-diaria/actividades', {
      state: { 
        unitName: unit.name,
        unitSubject: unit.subject,
        unitGrade: unit.grade
      }
    });
  };

  const handleCancel = () => {
    navigate('/');
  };

  // Route: /crear-planificacion-diaria/actividades
  if (summaryId === 'actividades') {
    const state = location.state as { unitName?: string; unitSubject?: string; unitGrade?: string } | null;
    
    // Try to get unitName, unitSubject, and unitGrade from state first, then from sessionStorage
    const unitName = state?.unitName || sessionStorage.getItem('selectedUnitName');
    const unitSubject = state?.unitSubject || sessionStorage.getItem('selectedUnitSubject') || '';
    const unitGrade = state?.unitGrade || sessionStorage.getItem('selectedUnitGrade') || '';
    
    if (unitName) {
      return <ActivityList unitName={unitName} unitSubject={unitSubject} unitGrade={unitGrade} />;
    } else {
      console.warn('⚠️ No unitName in state or sessionStorage, redirecting to nueva');
      navigate('/crear-planificacion-diaria/nueva', { replace: true });
      return null;
    }
  }

  // Route: /crear-planificacion-diaria/actividad-formulario
  if (summaryId === 'actividad-formulario') {
    const state = location.state as { activityName?: string; unitName?: string; unitSubject?: string; unitGrade?: string } | null;
    
    // Try to get data from state first, then from sessionStorage
    const unitName = state?.unitName || sessionStorage.getItem('selectedUnitName');
    const unitSubject = state?.unitSubject || sessionStorage.getItem('selectedUnitSubject') || '';
    const unitGrade = state?.unitGrade || sessionStorage.getItem('selectedUnitGrade') || '';
    
    if (state?.activityName && unitName) {
      return (
        <ActivityPlanningForm 
          activityName={state.activityName}
          unitName={unitName}
          unitSubject={unitSubject}
          unitGrade={unitGrade}
        />
      );
    } else {
      console.warn('⚠️ Missing activityName or unitName, redirecting to nueva');
      navigate('/crear-planificacion-diaria/nueva', { replace: true });
      return null;
    }
  }

  // Route: /crear-planificacion-diaria/:activityName (detail view)
  if (summaryId && summaryId !== 'nueva' && summaryId !== 'actividades' && summaryId !== 'actividad-formulario') {
    const activityName = decodeURIComponent(summaryId);
    return <DailyPlanningDetails activityName={activityName} />;
  }

  // Route: /crear-planificacion-diaria/nueva (default - unit selection)
  return (
    <UnitSelector 
      onSelectUnit={handleSelectUnit}
      onCancel={handleCancel}
    />
  );
}
