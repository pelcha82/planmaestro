import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { User, Settings, LogOut, CheckCircle2, Sparkles, ChevronDown, ChevronUp, Plus, X } from "lucide-react";

interface ActivityPlanningFormProps {
  activityName: string;
  unitName: string;
  unitSubject?: string;
  unitGrade?: string;
}

// Available options
const ESTRATEGIAS_OPTIONS = [
  'Recuperación de experiencias previas',
  'Estrategias expositivas de conocimientos elaborados y/o acumulados',
  'Estrategias de descubrimiento e indagación',
  'Estrategias de inserción de maestras, maestros y el alumnado en el entorno',
  'Estrategias de socialización centrada en actividades grupales',
  'Estrategia de indagación dialógica o cuestionamiento',
  'Aprendizaje Basado en Problemas (ABP)',
  'Aprendizaje Basado en Proyectos (ABP)',
  'Sociodrama o dramatización',
  'Estudio de caso',
  'El debate',
  'El juego'
];

const TECNICAS_OPTIONS = [
  'Observación de los aprendizajes',
  'Entrevistas',
  'Psicométricas',
  'Sociométricas',
  'Intercambios orales',
  'Análisis de desempeño'
];

const INSTRUMENTOS_OPTIONS = [
  'Lista de cotejo',
  'Rúbrica',
  'Escala de valoración',
  'Escala estimativa',
  'Registro anecdótico',
  'Registro diario',
  'Portafolio',
  'Diario reflexivo',
  'Pruebas escritas',
  'Pruebas orales'
];

const MATERIALES_SUGGESTIONS = [
  'Pizarrón',
  'Marcadores',
  'Libros de texto',
  'Cuadernos',
  'Lápices',
  'Fichas',
  'Tarjetas',
  'Tijeras',
  'Pegamento',
  'Cartulinas',
  'Crayones',
  'Reglas',
  'Bloques',
  'Material concreto',
  'Proyector',
  'Computadora',
  'Tablet'
];

export default function ActivityPlanningForm({ activityName, unitName, unitSubject, unitGrade }: ActivityPlanningFormProps) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // Collapsible sections state
  const [expandedSection, setExpandedSection] = useState<string | null>('materiales');
  
  const [formData, setFormData] = useState({
    materialesDidacticos: [] as string[],
    contextoAulico: '',
    estrategiasEnsenanza: [] as string[],
    tecnicasEvaluacion: [] as string[],
    instrumentosEvaluacion: [] as string[]
  });

  const [customMaterial, setCustomMaterial] = useState('');
  const [efemeride, setEfemeride] = useState<any>(null);
  const [teacherInfo, setTeacherInfo] = useState<{
    nombre: string;
    apellido: string;
    centro_educativo: string;
  } | null>(null);

  // Load teacher info on mount
  useEffect(() => {
    const loadTeacherInfo = async () => {
      // 🆕 PRIORIDAD 1: Intentar obtener de localStorage (más rápido, siempre disponible)
      const storedNombre = localStorage.getItem('teacherNombre');
      const storedApellido = localStorage.getItem('teacherApellido');
      const storedCentroEducativo = localStorage.getItem('teacherCentroEducativo');

      if (storedNombre || storedApellido || storedCentroEducativo) {
        const info = {
          nombre: storedNombre || '',
          apellido: storedApellido || '',
          centro_educativo: storedCentroEducativo || ''
        };
        
        console.log('✅ [ACTIVITY FORM] Datos del docente obtenidos de localStorage:', info);
        setTeacherInfo(info);
        return; // Usar datos de localStorage y no llamar webhook
      }

      // PRIORIDAD 2: Si no hay datos en localStorage, intentar webhook como fallback
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        console.warn('⚠️ No hay correo de usuario ni datos en localStorage');
        return;
      }

      try {
        console.log('📋 [ACTIVITY FORM] No hay datos en localStorage, intentando webhook...');
        
        const response = await fetch('/api/get-teacher-account', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ correo: userEmail }),
        });

        if (!response.ok) {
          console.warn('⚠️ No se pudieron obtener datos del docente del webhook');
          return;
        }

        const result = await response.json();
        
        if (result.success && result.data) {
          const data = Array.isArray(result.data) ? result.data[0] : result.data;
          
          const info = {
            nombre: data.nombre || data.Nombre || data.NOMBRE || '',
            apellido: data.apellido || data.Apellido || data.APELLIDO || '',
            centro_educativo: data.centro_educativo || 
                            data['centro educativo'] || 
                            data['Centro Educativo'] || 
                            data['CENTRO EDUCATIVO'] ||
                            data.centroEducativo || 
                            data['Centro educativo'] || ''
          };
          
          // Guardar en localStorage para próximas veces
          if (info.nombre) localStorage.setItem('teacherNombre', info.nombre);
          if (info.apellido) localStorage.setItem('teacherApellido', info.apellido);
          if (info.centro_educativo) localStorage.setItem('teacherCentroEducativo', info.centro_educativo);
          
          console.log('✅ [ACTIVITY FORM] Datos del docente obtenidos del webhook y guardados:', info);
          setTeacherInfo(info);
        }
      } catch (error) {
        console.error('❌ Error al obtener datos del docente del webhook:', error);
      }
    };

    loadTeacherInfo();
  }, []);

  // Load efeméride from sessionStorage if available
  useEffect(() => {
    const efemeridesRangeStr = sessionStorage.getItem('efemeridesInRange');
    const selectedEfemerideStr = sessionStorage.getItem('selectedEfemeride');
    
    if (efemeridesRangeStr) {
      try {
        const efemeridesArray = JSON.parse(efemeridesRangeStr);
        setEfemeride(efemeridesArray);
        console.log('✨ [FORM] Efemérides cargadas desde sessionStorage:', efemeridesArray);
      } catch (e) {
        console.error('❌ Error parseando efemérides:', e);
      }
    } else if (selectedEfemerideStr) {
      try {
        const singleEfemeride = JSON.parse(selectedEfemerideStr);
        setEfemeride(singleEfemeride);
        console.log('✨ [FORM] Efeméride cargada desde sessionStorage:', singleEfemeride);
      } catch (e) {
        console.error('❌ Error parseando efeméride:', e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const addMaterial = (material: string) => {
    if (!formData.materialesDidacticos.includes(material)) {
      setFormData(prev => ({
        ...prev,
        materialesDidacticos: [...prev.materialesDidacticos, material]
      }));
    }
  };

  const removeMaterial = (material: string) => {
    setFormData(prev => ({
      ...prev,
      materialesDidacticos: prev.materialesDidacticos.filter(m => m !== material)
    }));
  };

  const addCustomMaterial = () => {
    const trimmed = customMaterial.trim();
    if (trimmed && !formData.materialesDidacticos.includes(trimmed)) {
      addMaterial(trimmed);
      setCustomMaterial('');
    }
  };

  const toggleEstrategia = (estrategia: string) => {
    setFormData(prev => ({
      ...prev,
      estrategiasEnsenanza: prev.estrategiasEnsenanza.includes(estrategia)
        ? prev.estrategiasEnsenanza.filter(e => e !== estrategia)
        : [...prev.estrategiasEnsenanza, estrategia]
    }));
  };

  const toggleTecnica = (tecnica: string) => {
    setFormData(prev => ({
      ...prev,
      tecnicasEvaluacion: prev.tecnicasEvaluacion.includes(tecnica)
        ? prev.tecnicasEvaluacion.filter(t => t !== tecnica)
        : [...prev.tecnicasEvaluacion, tecnica]
    }));
  };

  const toggleInstrumento = (instrumento: string) => {
    setFormData(prev => ({
      ...prev,
      instrumentosEvaluacion: prev.instrumentosEvaluacion.includes(instrumento)
        ? prev.instrumentosEvaluacion.filter(i => i !== instrumento)
        : [...prev.instrumentosEvaluacion, instrumento]
    }));
  };

  // Simulate progress steps
  useEffect(() => {
    if (!isSubmitting || isComplete) return;

    const steps = [
      { progress: 20, text: 'Analizando materiales didácticos...', duration: 800 },
      { progress: 40, text: 'Procesando contexto del día...', duration: 800 },
      { progress: 60, text: 'Estructurando la planificación...', duration: 1000 },
      { progress: 80, text: 'Generando detalles pedagógicos...', duration: 1000 },
      { progress: 95, text: 'Finalizando planificación...', duration: 600 }
    ];

    let currentStepIndex = 0;

    const runStep = () => {
      if (currentStepIndex < steps.length && isSubmitting && !isComplete) {
        const step = steps[currentStepIndex];
        setProgress(step.progress);
        setCurrentStep(step.text);
        currentStepIndex++;
        
        setTimeout(runStep, step.duration);
      }
    };

    // Start first step
    setTimeout(runStep, 300);
  }, [isSubmitting, isComplete]);

  // Helper function to capitalize names properly
  const capitalizeName = (name: string): string => {
    if (!name) return '';
    return name
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.materialesDidacticos.length === 0) {
      alert('Por favor selecciona al menos un material didáctico');
      setExpandedSection('materiales');
      return;
    }

    if (formData.estrategiasEnsenanza.length === 0) {
      alert('Por favor selecciona al menos una estrategia de enseñanza');
      setExpandedSection('estrategias');
      return;
    }

    if (formData.tecnicasEvaluacion.length === 0) {
      alert('Por favor selecciona al menos una técnica de evaluación');
      setExpandedSection('tecnicas');
      return;
    }

    if (formData.instrumentosEvaluacion.length === 0) {
      alert('Por favor selecciona al menos un instrumento de evaluación');
      setExpandedSection('instrumentos');
      return;
    }

    setIsSubmitting(true);
    setProgress(10);
    setCurrentStep('Iniciando generación...');

    try {
      const userEmail = localStorage.getItem('userEmail');
      
      if (!userEmail) {
        alert('No se encontró el correo del usuario');
        setIsSubmitting(false);
        return;
      }

      // Get the selected date from sessionStorage (set when user clicked calendar date)
      const selectedDateStr = sessionStorage.getItem('selectedPlanningDate');
      let planningDate: string;
      
      if (selectedDateStr) {
        const selectedDate = new Date(selectedDateStr);
        planningDate = selectedDate.toISOString().split('T')[0];
        console.log('📅 [ACTIVITY PLANNING] Usando fecha seleccionada del calendario:', planningDate);
      } else {
        planningDate = new Date().toISOString().split('T')[0];
        console.log('📅 [ACTIVITY PLANNING] Usando fecha actual como fallback:', planningDate);
      }

      // Format teacher name properly (capitalize first letter of each word)
      const formattedNombre = teacherInfo?.nombre 
        ? capitalizeName(teacherInfo.nombre) 
        : '';
      const formattedApellido = teacherInfo?.apellido 
        ? capitalizeName(teacherInfo.apellido) 
        : '';
      const nombreCompleto = [formattedNombre, formattedApellido]
        .filter(n => n)
        .join(' ');

      console.log('👤 [ACTIVITY PLANNING] Datos del docente formateados:');
      console.log('  - Nombre completo:', nombreCompleto);
      console.log('  - Centro educativo:', teacherInfo?.centro_educativo || '');
      console.log('  - Correo (minúsculas):', userEmail.toLowerCase());

      // Generar UUID único para esta planificación diaria
      const uniqueId = crypto.randomUUID();
      console.log('🆔 [UUID] Generado ID único para planificación diaria:', uniqueId);

      const webhookData = {
        id: uniqueId, // UUID único para identificar esta planificación
        correo: userEmail.toLowerCase(), // Correo en minúsculas completo
        nombre_docente: nombreCompleto, // Nombre con formato correcto de mayúsculas/minúsculas
        centro_educativo: teacherInfo?.centro_educativo || '', // Centro educativo
        unidad: unitName,
        actividad: activityName,
        materiales_didacticos: formData.materialesDidacticos,
        contexto_aulico: formData.contextoAulico,
        fecha: planningDate,
        GRADO: unitGrade || sessionStorage.getItem('selectedUnitGrade') || '',
        ASIGNATURA: unitSubject || sessionStorage.getItem('selectedUnitSubject') || '',
        estrategias_ensenanza_aprendizaje: formData.estrategiasEnsenanza,
        tecnicas_evaluacion: formData.tecnicasEvaluacion,
        instrumentos_evaluacion: formData.instrumentosEvaluacion,
        efemeride: efemeride || null
      };

      console.log('📤 [ACTIVITY PLANNING] Enviando al webhook:', webhookData);

      // Send directly to n8n webhook
      const response = await fetch('https://n8n.srv1144975.hstgr.cloud/webhook/a5de0afb-b2ae-4d46-8056-0f9bfefa282c', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData),
      });

      console.log('📥 [ACTIVITY PLANNING] Respuesta:', response.status);

      if (!response.ok) {
        throw new Error('Error al guardar la planificación');
      }

      console.log('✅ [ACTIVITY PLANNING] Planificación guardada exitosamente');

      // Set completion state
      setProgress(100);
      setCurrentStep('¡Planificación completada!');
      
      // Small delay to show 100% before showing success screen
      setTimeout(() => {
        setIsComplete(true);
      }, 500);

    } catch (error) {
      console.error('❌ Error al guardar planificación:', error);
      alert('Error al guardar la planificación. Por favor, intenta de nuevo.');
      setIsSubmitting(false);
      setProgress(0);
      setCurrentStep('');
    }
  };

  const handleViewPlanning = () => {
    // Store the planning data in sessionStorage so the detail view can load it
    const userEmail = localStorage.getItem('userEmail');
    
    const planningData = {
      CORREO: userEmail,
      ASIGNATURA: unitSubject || sessionStorage.getItem('selectedUnitSubject') || '',
      TEMA_DEL_DIA: activityName,
      // Store additional context for the detail page
      _justCreated: true
    };
    
    sessionStorage.setItem('currentDailyPlanning', JSON.stringify(planningData));
    
    // Navigate directly to the planning detail view
    navigate('/crear-planificacion-diaria/detalle');
  };

  // Get available options (not selected)
  const availableEstrategias = ESTRATEGIAS_OPTIONS.filter(e => !formData.estrategiasEnsenanza.includes(e));
  const availableTecnicas = TECNICAS_OPTIONS.filter(t => !formData.tecnicasEvaluacion.includes(t));
  const availableInstrumentos = INSTRUMENTOS_OPTIONS.filter(i => !formData.instrumentosEvaluacion.includes(i));
  const availableMateriales = MATERIALES_SUGGESTIONS.filter(m => !formData.materialesDidacticos.includes(m));

  // Loading/Success Screen
  if (isSubmitting) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FF9A76' }}>
        <div className="max-w-2xl w-full mx-auto px-4">
          {!isComplete ? (
            // Loading State
            <div className="bg-white rounded-[32px] p-8 sm:p-12 text-center">
              {/* Animated Icon */}
              <div className="relative w-24 h-24 mx-auto mb-8">
                <div className="absolute inset-0 rounded-full" style={{ background: '#5B7FCC', opacity: 0.1 }}></div>
                <div className="absolute inset-0 rounded-full animate-ping" style={{ background: '#5B7FCC', opacity: 0.2 }}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-white animate-pulse" style={{ color: '#5B7FCC' }} />
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: '#5B7FCC' }}>
                Generando tu Planificación
              </h2>
              <p className="text-slate-600 mb-8 text-sm sm:text-base">
                Estamos preparando una planificación personalizada para tu clase
              </p>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{ 
                      width: `${progress}%`,
                      background: 'linear-gradient(90deg, #5B7FCC 0%, #4A6AB8 100%)'
                    }}
                  ></div>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <p className="text-sm text-slate-600 font-medium">
                    {currentStep}
                  </p>
                  <p className="text-sm font-bold" style={{ color: '#5B7FCC' }}>
                    {progress}%
                  </p>
                </div>
              </div>

              {/* Activity Info */}
              <div className="mt-8 pt-6 border-t border-slate-100">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl" style={{ backgroundColor: '#F0F4FF' }}>
                  <svg className="w-4 h-4" style={{ color: '#5B7FCC' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="text-sm font-semibold" style={{ color: '#5B7FCC' }}>
                    {activityName}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            // Success State
            <div className="bg-white rounded-[32px] p-8 sm:p-12 text-center">
              {/* Success Icon */}
              <div className="relative w-24 h-24 mx-auto mb-8">
                <div className="absolute inset-0 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-16 h-16 text-green-600" strokeWidth={2.5} />
                </div>
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="w-8 h-8 text-yellow-400 animate-bounce" />
                </div>
              </div>

              {/* Success Message */}
              <h2 className="text-2xl sm:text-3xl font-bold text-green-600 mb-3">
                ¡Planificación Lista!
              </h2>
              <p className="text-slate-600 mb-8 text-sm sm:text-base leading-relaxed">
                Tu planificación diaria ha sido generada exitosamente y está lista para usar en tu clase.
              </p>

              {/* Activity Info */}
              <div className="mb-8 p-5 rounded-2xl" style={{ backgroundColor: '#F0F4FF' }}>
                <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: '#5B7FCC' }}>
                  Planificación Creada
                </p>
                <p className="text-base sm:text-lg font-bold" style={{ color: '#5B7FCC' }}>
                  {activityName}
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  {unitName}
                </p>
              </div>

              {/* Action Button */}
              <button
                onClick={handleViewPlanning}
                className="w-full px-8 py-4 text-white text-base sm:text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95"
                style={{ backgroundColor: '#5B7FCC' }}
              >
                Ver mi Planificación
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Form Screen (default)
  return (
    <div className="min-h-screen" style={{ background: '#FF9A76' }}>
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between mb-6 sm:mb-10">
          {/* Back Link */}
          <button
            onClick={() => navigate('/crear-planificacion-diaria/actividades')}
            className="flex items-center gap-1 sm:gap-2 text-white hover:text-white/80 transition-colors group"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm sm:text-base font-medium">Volver</span>
          </button>

          {/* Profile Widget */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-all focus:outline-none focus:ring-4 focus:ring-white/30"
            >
              <User className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-4 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                <div className="py-2">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/mi-cuenta');
                    }}
                    className="w-full flex items-center gap-3 px-5 py-3 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                  >
                    <Settings className="w-5 h-5" />
                    <span>Mi Cuenta</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-5 py-3 text-red-600 hover:bg-red-50 transition-colors font-medium"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Cerrar</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Page Title */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
            Nueva Planificación Diaria
          </h1>
          <div className="h-1 w-20 sm:w-24 bg-white/80 rounded-full mb-3"></div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-xl">
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-xs sm:text-sm text-white/90 font-semibold">
              {unitName}
            </span>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl sm:rounded-[32px] p-5 sm:p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Activity Name - Read Only */}
            <div>
              <label className="block text-xs sm:text-sm font-bold uppercase tracking-wide mb-2" style={{ color: '#5B7FCC' }}>
                Actividad
              </label>
              <div className="px-4 py-3 rounded-xl" style={{ backgroundColor: '#F0F4FF', color: '#5B7FCC' }}>
                <p className="text-sm sm:text-base font-semibold">
                  {activityName}
                </p>
              </div>
            </div>

            {/* Efeméride Info - Show if loaded */}
            {efemeride && (
              <div className="border-2 border-amber-300 bg-amber-50 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-xs font-bold uppercase tracking-wide text-amber-700 mb-1">
                      Efeméride Incluida
                    </p>
                    <p className="text-sm font-semibold text-amber-900">
                      {Array.isArray(efemeride) 
                        ? efemeride.map(e => e.name).join(', ')
                        : efemeride.name}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* COLLAPSIBLE SECTION: Materiales Didácticos */}
            <div className="border-2 rounded-xl overflow-hidden" style={{ borderColor: expandedSection === 'materiales' ? '#5B7FCC' : '#E0E7FF' }}>
              <button
                type="button"
                onClick={() => toggleSection('materiales')}
                className="w-full px-4 py-3 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-wide" style={{ color: '#5B7FCC' }}>
                    Materiales Didácticos <span className="text-red-500">*</span>
                  </span>
                  {formData.materialesDidacticos.length > 0 && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                      {formData.materialesDidacticos.length}
                    </span>
                  )}
                </div>
                {expandedSection === 'materiales' ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </button>
              {expandedSection === 'materiales' && (
                <div className="px-4 pb-4">
                  {/* Selected Materials */}
                  {formData.materialesDidacticos.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-green-700 mb-2">Seleccionados</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.materialesDidacticos.map((material) => (
                          <button
                            key={material}
                            type="button"
                            onClick={() => removeMaterial(material)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-800 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                          >
                            <span>{material}</span>
                            <X className="w-3.5 h-3.5" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Available Materials */}
                  {availableMateriales.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-600 mb-2">Disponibles</p>
                      <div className="flex flex-wrap gap-2">
                        {availableMateriales.map((material) => (
                          <button
                            key={material}
                            type="button"
                            onClick={() => addMaterial(material)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-blue-100 hover:text-blue-800 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>{material}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add Custom Material */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-600 mb-2">Agregar otro</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customMaterial}
                        onChange={(e) => setCustomMaterial(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomMaterial())}
                        placeholder="Escribe el nombre..."
                        className="flex-1 px-3 py-2 rounded-lg border-2 border-slate-200 text-sm focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={addCustomMaterial}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* COLLAPSIBLE SECTION: Contexto Aúlico */}
            <div className="border-2 rounded-xl overflow-hidden" style={{ borderColor: expandedSection === 'contexto' ? '#5B7FCC' : '#E0E7FF' }}>
              <button
                type="button"
                onClick={() => toggleSection('contexto')}
                className="w-full px-4 py-3 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-wide" style={{ color: '#5B7FCC' }}>
                    Contexto del Día / Efemérides
                  </span>
                  {formData.contextoAulico && expandedSection !== 'contexto' && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                      ✓
                    </span>
                  )}
                </div>
                {expandedSection === 'contexto' ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </button>
              {expandedSection === 'contexto' && (
                <div className="px-4 pb-4">
                  <textarea
                    value={formData.contextoAulico}
                    onChange={(e) => setFormData(prev => ({ ...prev, contextoAulico: e.target.value }))}
                    disabled={isSubmitting}
                    rows={4}
                    placeholder="Ej: Día de la Independencia - Acto escolar a las 10:00 AM..."
                    className="block w-full px-4 py-3 rounded-xl border-2 text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none transition-all disabled:opacity-50 resize-y"
                    style={{ borderColor: '#E0E7FF', backgroundColor: '#FAFBFF' }}
                    onFocus={(e) => e.target.style.borderColor = '#5B7FCC'}
                    onBlur={(e) => e.target.style.borderColor = '#E0E7FF'}
                  />
                </div>
              )}
            </div>

            {/* COLLAPSIBLE SECTION: Estrategias */}
            <div className="border-2 rounded-xl overflow-hidden" style={{ borderColor: expandedSection === 'estrategias' ? '#5B7FCC' : '#E0E7FF' }}>
              <button
                type="button"
                onClick={() => toggleSection('estrategias')}
                className="w-full px-4 py-3 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-wide" style={{ color: '#5B7FCC' }}>
                    Estrategias de Enseñanza <span className="text-red-500">*</span>
                  </span>
                  {formData.estrategiasEnsenanza.length > 0 && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                      {formData.estrategiasEnsenanza.length}
                    </span>
                  )}
                </div>
                {expandedSection === 'estrategias' ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </button>
              {expandedSection === 'estrategias' && (
                <div className="px-4 pb-4">
                  {/* Selected */}
                  {formData.estrategiasEnsenanza.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-green-700 mb-2">Seleccionadas</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.estrategiasEnsenanza.map((estrategia) => (
                          <button
                            key={estrategia}
                            type="button"
                            onClick={() => toggleEstrategia(estrategia)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-800 rounded-lg text-xs sm:text-sm font-medium hover:bg-green-200 transition-colors text-left"
                          >
                            <span>{estrategia}</span>
                            <X className="w-3.5 h-3.5 flex-shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Available */}
                  {availableEstrategias.length > 0 && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-600 mb-2">Disponibles</p>
                      <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
                        {availableEstrategias.map((estrategia) => (
                          <button
                            key={estrategia}
                            type="button"
                            onClick={() => toggleEstrategia(estrategia)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-100 hover:text-blue-800 transition-colors text-left"
                          >
                            <Plus className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>{estrategia}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* COLLAPSIBLE SECTION: Técnicas */}
            <div className="border-2 rounded-xl overflow-hidden" style={{ borderColor: expandedSection === 'tecnicas' ? '#5B7FCC' : '#E0E7FF' }}>
              <button
                type="button"
                onClick={() => toggleSection('tecnicas')}
                className="w-full px-4 py-3 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-wide" style={{ color: '#5B7FCC' }}>
                    Técnicas de Evaluación <span className="text-red-500">*</span>
                  </span>
                  {formData.tecnicasEvaluacion.length > 0 && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                      {formData.tecnicasEvaluacion.length}
                    </span>
                  )}
                </div>
                {expandedSection === 'tecnicas' ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </button>
              {expandedSection === 'tecnicas' && (
                <div className="px-4 pb-4">
                  {/* Selected */}
                  {formData.tecnicasEvaluacion.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-green-700 mb-2">Seleccionadas</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.tecnicasEvaluacion.map((tecnica) => (
                          <button
                            key={tecnica}
                            type="button"
                            onClick={() => toggleTecnica(tecnica)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-800 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                          >
                            <span>{tecnica}</span>
                            <X className="w-3.5 h-3.5" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Available */}
                  {availableTecnicas.length > 0 && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-600 mb-2">Disponibles</p>
                      <div className="flex flex-wrap gap-2">
                        {availableTecnicas.map((tecnica) => (
                          <button
                            key={tecnica}
                            type="button"
                            onClick={() => toggleTecnica(tecnica)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-blue-100 hover:text-blue-800 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>{tecnica}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* COLLAPSIBLE SECTION: Instrumentos */}
            <div className="border-2 rounded-xl overflow-hidden" style={{ borderColor: expandedSection === 'instrumentos' ? '#5B7FCC' : '#E0E7FF' }}>
              <button
                type="button"
                onClick={() => toggleSection('instrumentos')}
                className="w-full px-4 py-3 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-wide" style={{ color: '#5B7FCC' }}>
                    Instrumentos de Evaluación <span className="text-red-500">*</span>
                  </span>
                  {formData.instrumentosEvaluacion.length > 0 && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                      {formData.instrumentosEvaluacion.length}
                    </span>
                  )}
                </div>
                {expandedSection === 'instrumentos' ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </button>
              {expandedSection === 'instrumentos' && (
                <div className="px-4 pb-4">
                  {/* Selected */}
                  {formData.instrumentosEvaluacion.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-green-700 mb-2">Seleccionados</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.instrumentosEvaluacion.map((instrumento) => (
                          <button
                            key={instrumento}
                            type="button"
                            onClick={() => toggleInstrumento(instrumento)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-800 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                          >
                            <span>{instrumento}</span>
                            <X className="w-3.5 h-3.5" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Available */}
                  {availableInstrumentos.length > 0 && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-600 mb-2">Disponibles</p>
                      <div className="flex flex-wrap gap-2">
                        {availableInstrumentos.map((instrumento) => (
                          <button
                            key={instrumento}
                            type="button"
                            onClick={() => toggleInstrumento(instrumento)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-blue-100 hover:text-blue-800 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>{instrumento}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate('/crear-planificacion-diaria/actividades')}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 sm:py-4 border-2 text-slate-700 text-sm sm:text-base font-bold rounded-xl hover:bg-slate-50 transition-all disabled:opacity-50"
                style={{ borderColor: '#E0E7FF' }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 sm:py-4 text-white text-sm sm:text-base font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                style={{ backgroundColor: '#5B7FCC' }}
              >
                Generar Planificación
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
