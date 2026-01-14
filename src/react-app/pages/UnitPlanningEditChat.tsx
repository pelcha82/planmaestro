import { useParams, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import ChatInterface from "@/react-app/components/ChatInterface";

export default function UnitPlanningEditChat() {
  const navigate = useNavigate();
  const { planningId } = useParams<{ planningId: string }>();
  const [planningData, setPlanningData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get pre-selected section from navigation state if available
  const locationState = window.history.state?.usr as { preSelectedSection?: string } | undefined;
  const [selectedSection, setSelectedSection] = useState<string>(locationState?.preSelectedSection || "");

  useEffect(() => {
    const loadPlanningData = async () => {
      setIsLoading(true);
      
      try {
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) {
          navigate('/login');
          return;
        }

        // Load planning data from sessionStorage
        const storedPlanning = sessionStorage.getItem('selectedPlanning');
        if (storedPlanning) {
          const data = JSON.parse(storedPlanning);
          console.log('📋 [UNIT EDIT CHAT] Datos de planificación cargados:', data);
          console.log('📋 [UNIT EDIT CHAT] Claves disponibles:', Object.keys(data));
          setPlanningData(data);
        }
      } catch (error) {
        console.error('Error loading planning data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPlanningData();
  }, [planningId, navigate]);

  const handleCancel = () => {
    navigate(-1);
  };

  const handleSectionChange = (section: string) => {
    setSelectedSection(section);
  };

  const editableSections = [
    { value: 'presentacion_secuencia', label: 'Presentación de la Secuencia' },
    { value: 'situacion_aprendizaje', label: 'Situación de aprendizaje' },
    { value: 'contenidos_procedimentales', label: 'Contenidos Procedimentales' },
    { value: 'competencias_fundamentales', label: 'Competencias Fundamentales' },
    { value: 'competencias_especificas_grado', label: 'Competencias Específicas del Grado' },
    { value: 'ejes_transversal', label: 'Ejes Transversales' },
    { value: 'valores_actitudes', label: 'Valores y Actitudes' },
    { value: 'indicadores_logro', label: 'Indicadores de Logro' },
    { value: 'areas_articuladas', label: 'Áreas Articuladas' },
    { value: 'estrategia_ensenanza_aprendizaje', label: 'Estrategia Enseñanza-Aprendizaje' },
    { value: 'actividades_ensenanza', label: 'Actividades de Enseñanza' },
    { value: 'actividades_aprendizaje', label: 'Actividades de Aprendizaje' },
    { value: 'actividades_evaluacion', label: 'Actividades de Evaluación' },
    { value: 'recursos_didacticos', label: 'Recursos Didácticos' },
    { value: 'secuencia_didactica', label: 'Secuencia Didáctica' },
    { value: 'orientaciones_atencion_diversidad', label: 'Orientaciones para la Atención a la Diversidad' }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 text-slate-600">Cargando chatbot...</p>
        </div>
      </div>
    );
  }

  const userEmail = localStorage.getItem('userEmail') || '';
  const userName = userEmail.split('@')[0];
  
  // Extract planning details from loaded data
  const responseData = planningData?.response_data || {};
  const asignatura = responseData?.asignatura || responseData?.ASIGNATURA || '';
  const unidadName = responseData?.unidad || responseData?.UNIDAD || planningId || '';
  
  console.log('🎯 [UNIT EDIT CHAT] Asignatura extraída:', asignatura);
  console.log('🎯 [UNIT EDIT CHAT] Unidad extraída:', unidadName);
  console.log('🎯 [UNIT EDIT CHAT] Planning data completo:', planningData);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-5xl mx-auto py-8 px-4">
        <ChatInterface
          sectionFieldName={selectedSection ? (editableSections.find(s => s.value === selectedSection)?.label || selectedSection) : ''}
          onCancel={handleCancel}
          correo={userEmail}
          unitId={unidadName}
          userName={userName}
          editableSections={editableSections}
          selectedSection={selectedSection}
          onSectionChange={handleSectionChange}
          asignatura={asignatura}
          isDailyPlanning={false}
          planningId={planningId}
        />
      </div>
    </div>
  );
}
