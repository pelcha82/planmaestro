import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import ChatInterface from "@/react-app/components/ChatInterface";

export default function DailyPlanningEditChat() {
  const navigate = useNavigate();
  const { planningId } = useParams<{ planningId: string }>();
  const [planningData, setPlanningData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get pre-selected section from navigation state if available
  const locationState = window.history.state?.usr as { preSelectedSection?: string } | undefined;
  const [selectedSection, setSelectedSection] = useState<string>(locationState?.preSelectedSection || "");

  useEffect(() => {
    // Load planning data
    const loadPlanningData = async () => {
      try {
        // For now, use mock data or load from sessionStorage
        const storedPlanning = sessionStorage.getItem('currentDailyPlanning');
        if (storedPlanning) {
          const data = JSON.parse(storedPlanning);
          console.log('📋 [EDIT CHAT] Datos de planificación cargados:', data);
          console.log('📋 [EDIT CHAT] Claves disponibles:', Object.keys(data));
          console.log('📋 [EDIT CHAT] TEMA_DEL_DIA (webhook format):', data['TEMA_DEL_DIA']);
          setPlanningData(data);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading planning data:', error);
        setIsLoading(false);
      }
    };

    loadPlanningData();
  }, [planningId]);

  const handleCancel = () => {
    // Navigate back to previous page
    navigate(-1);
  };

  const handleSectionChange = (section: string) => {
    setSelectedSection(section);
  };

  // Define editable sections for daily planning - estructura completa de clase diaria
  // Los valores (value) son los nombres EXACTOS de los campos en la base de datos del webhook
  const DAILY_PLANNING_EDITABLE_SECTIONS = [
    { value: 'COMPETENCIAS FUNDAMENTALES', label: 'COMPETENCIAS FUNDAMENTALES' },
    { value: 'COMPETENCIA ESPECÍFICA', label: 'COMPETENCIA ESPECÍFICA' },
    { value: 'EJE TRANSVERSAL', label: 'EJE TRANSVERSAL' },
    { value: 'VALORES Y ACTITUDES', label: 'VALORES Y ACTITUDES' },
    { value: 'INDICADORES DE LOGRO', label: 'INDICADORES DE LOGRO' },
    { value: 'ESTRATEGIA DE ENSEÑANZA', label: 'ESTRATEGIA DE ENSEÑANZA' },
    { value: 'INTENCIÓN PEDAGÓGICA DEL DÍA', label: 'INTENCIÓN PEDAGÓGICA DEL DÍA' },
    { value: 'SECUENCIA DIDACTICA', label: 'SECUENCIA DIDÁCTICA' },
    { value: 'ESTRATEGIA E INSTRUMENTO DE EVALUACION', label: 'ESTRATEGIA E INSTRUMENTO DE EVALUACIÓN' },
    { value: 'RECURSOS DIDÁCTICOS', label: 'RECURSOS DIDÁCTICOS' }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 text-slate-600">Cargando planificación...</p>
        </div>
      </div>
    );
  }

  const userEmail = localStorage.getItem('userEmail') || '';
  const userName = userEmail.split('@')[0];
  const planningTitle = planningData?.titulo || planningData?.tema || 'Planificación Diaria';
  
  // Extract activity name from planning data
  // CRITICAL: The webhook returns the field as "TEMA_DEL_DIA" (uppercase with underscores)
  const activityName = planningData?.['TEMA_DEL_DIA'] || 
                       planningData?.['Tema del Día'] || 
                       planningData?.['NOMBRE_ACTIVIDAD'] || 
                       planningData?.['TEMA DEL DÍA'] || 
                       planningData?.tema || 
                       planningData?.titulo || '';
  
  // Extract asignatura (subject) from planning data
  const asignatura = planningData?.['MATERIA'] || 
                     planningData?.MATERIA || 
                     planningData?.asignatura || 
                     planningData?.materia || '';
  
  console.log('🎯 [EDIT CHAT] Activity name extraído:', activityName);
  console.log('🎯 [EDIT CHAT] Asignatura extraída:', asignatura);
  console.log('🎯 [EDIT CHAT] Planning data completo:', planningData);
  console.log('🎯 [EDIT CHAT] Buscando en claves:', planningData ? Object.keys(planningData) : 'no data');
  console.log('🎯 [EDIT CHAT] Valor directo ["TEMA_DEL_DIA"]:', planningData?.['TEMA_DEL_DIA']);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-5xl mx-auto py-8 px-4">
        <ChatInterface
          sectionFieldName={selectedSection}
          onCancel={handleCancel}
          correo={userEmail}
          unitId={planningTitle}
          userName={userName}
          editableSections={DAILY_PLANNING_EDITABLE_SECTIONS}
          selectedSection={selectedSection}
          onSectionChange={handleSectionChange}
          isDailyPlanning={true}
          activityName={activityName}
          asignatura={asignatura}
          planningData={planningData}
        />
      </div>
    </div>
  );
}
