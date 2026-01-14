import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { User, Settings, LogOut, BookOpen, X, CheckCircle, AlertCircle, Clock, Users } from "lucide-react";
import StatsCard from "./StatsCard";

interface Unit {
  id: string;
  name: string;
  lastModified: string;
  description: string;
  grade: string;
  subject: string;
}

interface DailyPlanning {
  id: string;
  titulo: string;
  fecha: string;
  objetivos?: string;
  actividades?: string;
  tema?: string;
  grado?: string;
  materia?: string;
  asignatura?: string;
  created_at?: string;
  // All expected webhook fields
  centroEducativo?: string;
  docente?: string;
  competenciaEspecifica?: string;
  indicadoresLogro?: string;
  estrategiaEnsenanza?: string;
  intencionPedagogica?: string;
  // OLD format - keep for backwards compatibility
  actividadInicio?: string;
  actividadDesarrollo?: string;
  actividadCierre?: string;
  // NEW format - SECUENCIA DIDACTICA replaces the 3 activities
  secuenciaDidactica?: string;
  // NEW format - ESTRATEGIA E INSTRUMENTO DE EVALUACION
  estrategiaInstrumentoEvaluacion?: string;
  recursosDidacticos?: string;
  correo?: string;
  apellido?: string;
  competenciaFundamental?: string;
  ejeTransversal?: string;
  valoresYActitudes?: string;
  // Timestamp fields
  createdAt?: string;
  actualizadoAt?: string;
  // Efeméride field
  efemeride?: any;
  // Unit fields (needed for finding matching unit planning)
  unidad?: string;
  UNIDAD?: string;
  Unidad?: string;
}

interface Efemeride {
  date: string; // YYYY-MM-DD
  name: string;
  description: string;
}

interface UnitSelectorProps {
  onSelectUnit: (unit: Unit) => void;
  onCancel: () => void;
}

export default function UnitSelector({ onSelectUnit, onCancel }: UnitSelectorProps) {
  const navigate = useNavigate();
  const [allUnits, setAllUnits] = useState<Unit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [dailyPlannings, setDailyPlannings] = useState<DailyPlanning[]>([]);
  const [selectedPlanning, setSelectedPlanning] = useState<DailyPlanning | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPlannings, setIsLoadingPlannings] = useState(false);
  const [error, setError] = useState<string>("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showUnitListModal, setShowUnitListModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEfemeride, setSelectedEfemeride] = useState<Efemeride | null>(null);
  const [showEfemerideDialog, setShowEfemerideDialog] = useState(false);
  const [pendingEfemeride, setPendingEfemeride] = useState<Efemeride | null>(null);
  const [pendingDate, setPendingDate] = useState<Date | null>(null);
  const [showThemeCompletionDialog, setShowThemeCompletionDialog] = useState(false);
  const [showReasonDialog, setShowReasonDialog] = useState(false);
  const [showIndicadorDialog, setShowIndicadorDialog] = useState(false);
  const [selectedIndicadores, setSelectedIndicadores] = useState<number[]>([]);
  const [showPlanningListDialog, setShowPlanningListDialog] = useState(false);
  const [showEstrategiaReviewDialog, setShowEstrategiaReviewDialog] = useState(false);
  const [showSelectionAlert, setShowSelectionAlert] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [showContenidosDialog, setShowContenidosDialog] = useState(false);
  const [selectedContenidos, setSelectedContenidos] = useState<number[]>([]);

  // Efemérides dominicanas - Calendario escolar completo
  const efemerides: Efemeride[] = [
    // ENERO
    { date: '2025-11-06', name: 'Día de la Constitución', description: 'Conmemoración de la firma de la primera Constitución dominicana en San Cristóbal en 1844, que establece las bases del Estado de derecho.' },
    { date: '2026-01-06', name: 'Día de los Santos Reyes', description: 'Tradición cristiana y cultural que celebra la llegada de los Reyes Magos; en las escuelas marca el regreso a clases tras la pausa navideña.' },
    { date: '2026-01-26', name: 'Natalicio de Juan Pablo Duarte', description: 'Conmemoración del nacimiento del principal Padre de la Patria y fundador de la sociedad secreta La Trinitaria.' },
    { date: '2026-02-27', name: 'Independencia Nacional', description: 'Celebración del aniversario de la proclamación de la separación de Haití en 1844 y el nacimiento de la República Dominicana.' },
    { date: '2026-05-01', name: 'Día Internacional del Trabajo', description: 'Homenaje a la lucha histórica por los derechos laborales y la reivindicación de la jornada de trabajo digna.' }
  ];

  // Format date in Spanish
  const formatSpanishDate = (dateString: string): string => {
    if (!dateString) return '';
    
    const date = parseDate(dateString);
    if (!date) return dateString;
    
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day} de ${month} de ${year}`;
  };

  // Parse date from createdAt string - SIEMPRE devuelve fecha UTC
  const parseDate = (dateString: string): Date | null => {
    if (!dateString || dateString === 'Invalid DateTime') {
      console.warn('⚠️ [PARSE DATE] Fecha inválida o vacía:', dateString);
      return null;
    }
    
    try {
      // CRITICAL: Try ISO format FIRST (YYYY-MM-DD) porque el webhook ahora usa este formato
      if (/^\d{4}-\d{2}-\d{2}/.test(dateString)) {
        // Extract year, month, day manually to avoid timezone issues
        const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (match) {
          const year = parseInt(match[1]);
          const month = parseInt(match[2]) - 1; // Month is 0-indexed
          const day = parseInt(match[3]);
          
          if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
            // Create UTC date at midnight
            const date = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
            return date;
          }
        }
      }
      
      // Try DD/MM/YYYY format
      if (dateString.includes('/')) {
        const parts = dateString.split('/');
        if (parts.length === 3) {
          const day = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1; // Month is 0-indexed
          const year = parseInt(parts[2]);
          
          if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
            // Use Date.UTC to avoid timezone issues
            const date = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
            return date;
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('❌ [PARSE DATE] Error al parsear:', dateString, error);
      return null;
    }
  };

  // Get calendar days for current month
  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevMonthLastDay = new Date(year, month, 0);
    
    const daysInMonth = lastDay.getDate();
    let startingDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Convert to Monday-first (0 = Monday, 6 = Sunday)
    startingDayOfWeek = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
    
    const daysInPrevMonth = prevMonthLastDay.getDate();
    
    const days: { date: Date | null; isCurrentMonth: boolean }[] = [];
    
    // Add days from previous month
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      days.push({
        date: new Date(year, month - 1, day),
        isCurrentMonth: false
      });
    }
    
    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        date: new Date(year, month, day),
        isCurrentMonth: true
      });
    }
    
    // Add days from next month to fill the grid
    const remainingCells = 42 - days.length; // 6 rows × 7 days
    for (let day = 1; day <= remainingCells; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false
      });
    }
    
    return days;
  };

  // Get plannings for a specific date
  const getPlanningsForDate = (date: Date | null): DailyPlanning[] => {
    if (!date) return [];
    
    // CRITICAL FIX: El calendario usa fechas locales, las planificaciones usan UTC
    // Necesitamos convertir la fecha del calendario a UTC para comparar manzanas con manzanas
    const targetDay = date.getDate();
    const targetMonth = date.getMonth();
    const targetYear = date.getFullYear();
    
    return dailyPlannings.filter(planning => {
      const planningDate = parseDate(planning.createdAt || '');
      if (!planningDate) return false;
      
      // CRITICAL: parseDate devuelve fecha UTC, así que usamos getUTCDate/Month/FullYear
      const planningDay = planningDate.getUTCDate();
      const planningMonth = planningDate.getUTCMonth();
      const planningYear = planningDate.getUTCFullYear();
      
      const matches = (
        planningDay === targetDay &&
        planningMonth === targetMonth &&
        planningYear === targetYear
      );
      
      return matches;
    });
  };

  // Get efeméride for a specific date
  const getEfemerideForDate = (date: Date | null): Efemeride | null => {
    if (!date) return null;
    
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const found = efemerides.find(e => e.date === dateStr) || null;
    
    return found;
  };

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  useEffect(() => {
    const loadAllUnits = async () => {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        setError("No se encontró el correo del usuario");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/get-plannings-by-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ correo: userEmail }),
        });

        if (!response.ok) {
          throw new Error('Error al obtener planificaciones');
        }

        const result = await response.json();

        if (!result.success || !result.data || result.data.length === 0) {
          setError("No hay planificaciones disponibles");
          setIsLoading(false);
          return;
        }

        // Map ALL units from webhook data
        const units: Unit[] = result.data.map((webhookData: any) => {
          // Handle both uppercase and lowercase field names for asignatura
          const asignatura = webhookData.ASIGNATURA || webhookData.asignatura || 'Sin asignatura';
          
          return {
            id: webhookData.unidad || webhookData.id || crypto.randomUUID(),
            name: webhookData.unidad || 'Sin nombre',
            lastModified: webhookData.created_at || new Date().toISOString(),
            description: webhookData.contenidos_procedimentales || 'Sin descripción',
            grade: webhookData.grado || webhookData.GRADO || 'Sin grado',
            subject: asignatura
          };
        });

        // The latest unit is the LAST row in the data (last element in array)
        const lastUnit = units[units.length - 1];

        setAllUnits(units);
        setSelectedUnit(lastUnit);
        setIsLoading(false);

        // Load ALL daily plannings (no filtering by unit)
        loadDailyPlannings(userEmail);
      } catch (err) {
        console.error('Error al cargar unidades:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar planificaciones');
        setIsLoading(false);
      }
    };

    loadAllUnits();
  }, []);

  const loadDailyPlannings = async (userEmail: string) => {
    setIsLoadingPlannings(true);
    try {
      const response = await fetch('/api/get-daily-plannings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          CORREO: userEmail
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // The backend returns data in a standard format
        const rawPlannings = result.data || [];
        
        // Map webhook fields
        const plannings: DailyPlanning[] = rawPlannings.map((item: any) => {
          const webhookId = item['id'] || item['ID'] || '';
          const centroEducativo = item['CENTRO EDUCATIVO'] || item['CENTRO_EDUCATIVO'] || '';
          const docente = item['DOCENTE'] || '';
          const materia = item['MATERIA'] || '';
          const temaDia = item['TEMA DEL DÍA'] || item['TEMA_DEL_DIA'] || '';
          const competenciaEspecifica = item['COMPETENCIA ESPECÍFICA'] || item['COMPETENCIA_ESPECIFICA'] || '';
          const indicadoresLogro = item['INDICADORES DE LOGRO'] || item['INDICADORES_DE_LOGRO'] || '';
          const estrategiaEnsenanza = item['ESTRATEGIA DE ENSEÑANZA'] || item['ESTRATEGIA_DE_ENSENANZA'] || '';
          const intencionPedagogica = item['INTENCIÓN PEDAGÓGICA DEL DÍA'] || item['INTENCION_PEDAGOGICA_DEL_DIA'] || '';
          const actividadInicio = item['ACTIVIDAD DE INICIO'] || item['ACTIVIDAD_DE_INICIO'] || '';
          const actividadDesarrollo = item['ACTIVIDAD DE DESARROLLO'] || item['ACTIVIDAD_DE_DESARROLLO'] || '';
          const actividadCierre = item['ACTIVIDAD DE CIERRE'] || item['ACTIVIDAD_DE_CIERRE'] || '';
          const secuenciaDidactica = item['SECUENCIA DIDACTICA'] || item['SECUENCIA_DIDACTICA'] || '';
          const estrategiaInstrumentoEvaluacion = item['ESTRATEGIA E INSTRUMENTO DE EVALUACION'] || item['ESTRATEGIA_E_INSTRUMENTO_DE_EVALUACION'] || '';
          const recursosDidacticos = item['RECURSOS DIDÁCTICOS'] || item['RECURSOS DIDACTICOS'] || item['RECURSOS_DIDACTICOS'] || '';
          const correo = item['CORREO'] || '';
          const apellido = item['APELLIDO'] || '';
          const competenciaFundamental = item['COMPETENCIAS FUNDAMENTALES'] || item['COMPETENCIA FUNDAMENTALES'] || item['COMPETENCIA_FUNDAMENTAL'] || '';
          const ejeTransversal = item['EJE TRANSVERSAL'] || item['EJE_TRANSVERSAL'] || '';
          const valoresYActitudes = item['VALORES Y ACTITUDES'] || item['VALAORES Y ACTITUDES'] || item['VALORES_Y_ACTITUDES'] || '';
          let createdAt = item['FECHA DE CREACIÓN'] || item['FECHA DE CREACION'] || item['FECHA_DE_CREACION'] || item['createdAt'] || item['created_at'] || '';
          const actualizadoAt = item['actualizadoAt'] || item['updated_at'] || '';
          const efemeride = item['efemeride'] || item['EFEMERIDE'] || null;
          const unidad = item['Unidad'] || item['UNIDAD'] || item['unidad'] || item['SECUENCIA'] || item['secuencia'] || '';
          const grado = item['GRADO'] || item['grado'] || item['Grado'] || '';
          
          const uniqueId = webhookId || `${correo}-${temaDia}`;
          
          return {
            id: uniqueId,
            titulo: temaDia,
            fecha: new Date().toISOString(),
            objetivos: intencionPedagogica,
            actividades: secuenciaDidactica || `${actividadInicio}\n\n${actividadDesarrollo}\n\n${actividadCierre}`,
            tema: temaDia,
            grado: grado,
            materia: materia,
            asignatura: materia,
            created_at: new Date().toISOString(),
            centroEducativo,
            docente,
            competenciaEspecifica,
            indicadoresLogro,
            estrategiaEnsenanza,
            intencionPedagogica,
            actividadInicio,
            actividadDesarrollo,
            actividadCierre,
            secuenciaDidactica,
            estrategiaInstrumentoEvaluacion,
            recursosDidacticos,
            correo,
            apellido,
            competenciaFundamental,
            ejeTransversal,
            valoresYActitudes,
            createdAt,
            actualizadoAt,
            efemeride,
            unidad,
            UNIDAD: unidad,
            Unidad: unidad
          };
        });
        
        setDailyPlannings(plannings);
      } else {
        setDailyPlannings([]);
      }
    } catch (err) {
      console.error('❌ Error al cargar planificaciones diarias:', err);
      setDailyPlannings([]);
    } finally {
      setIsLoadingPlannings(false);
    }
  };

  const handlePlanningClick = (planning: DailyPlanning) => {
    setSelectedPlanning(planning);
  };

  const navigateToDetails = async (planning: DailyPlanning) => {
    const materia = planning.materia || planning.asignatura || 'Sin materia';
    const temaDia = planning.tema || planning.titulo || 'Sin tema';
    const userEmail = planning.correo || localStorage.getItem('userEmail');
    const grado = planning.grado || '';
    
    if (!userEmail) {
      console.error('❌ No se encontró el correo del usuario');
      return;
    }
    
    try {
      const response = await fetch('/api/get-daily-planning-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          CORREO: userEmail,
          ASIGNATURA: materia,
          TEMA_DEL_DIA: temaDia,
          GRADO: grado
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        let planningData = result.data;
        if (Array.isArray(planningData)) {
          planningData = planningData[0];
        }
        
        sessionStorage.setItem('currentDailyPlanning', JSON.stringify(planningData));
      } else {
        sessionStorage.setItem('currentDailyPlanning', JSON.stringify(planning));
      }
    } catch (error) {
      console.error('❌ [ERROR] Error al obtener detalles:', error);
      sessionStorage.setItem('currentDailyPlanning', JSON.stringify(planning));
    }
    
    window.location.href = `/crear-planificacion-diaria/${encodeURIComponent(temaDia)}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 text-slate-600">Cargando unidades...</p>
        </div>
      </div>
    );
  }

  if (error || !selectedUnit || allUnits.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4">
        <div className="max-w-2xl w-full text-center">
          <div className="mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-slate-800 mb-4">
            ¡Comienza tu Planificación!
          </h2>
          
          <p className="text-lg text-slate-600 mb-6 leading-relaxed">
            Para crear planificaciones diarias, primero necesitas generar una 
            <span className="font-semibold text-indigo-700"> Planificación por Unidad</span>.
          </p>
          
          <p className="text-base text-slate-500 mb-8">
            Las planificaciones por unidad son la base que te permitirá crear planificaciones 
            diarias detalladas y personalizadas para cada actividad.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.location.href = '/create/unit'}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-3"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Crear Planificación por Unidad
            </button>
            
            <button
              onClick={onCancel}
              className="px-8 py-4 bg-white text-slate-700 font-semibold text-lg rounded-xl border-2 border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver al Dashboard
            </button>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-200">
            <p className="text-sm text-slate-500">
              💡 <span className="font-medium">Tip:</span> Una vez que tengas tu planificación por unidad, 
              podrás generar múltiples planificaciones diarias basadas en ella.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const calendarDays = getCalendarDays();
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const dayNamesShort = ['Lu', 'Ma', 'Mi', 'Jue', 'Vi'];

  return (
    <div className="min-h-screen" style={{ background: '#FF9A76' }}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between mb-4 sm:mb-8">
          <Link
            to="/"
            className="flex items-center gap-1 sm:gap-2 text-white hover:text-white/80 transition-colors group"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm sm:text-base font-medium">Volver</span>
          </Link>

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

        {/* Stats Card */}
        <div className="mb-3 sm:mb-4">
          <StatsCard />
        </div>

        {/* Calendar Container */}
        <div className="rounded-2xl sm:rounded-[32px] p-4 sm:p-8" style={{ backgroundColor: '#5B7FCC' }}>
          {/* Calendar Header with Navigation */}
          <div className="flex items-center justify-between mb-4 sm:mb-8">
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className="p-2 sm:p-3 hover:bg-white/10 rounded-lg sm:rounded-xl transition-colors"
            >
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-white tracking-wide">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h2>
            
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className="p-2 sm:p-3 hover:bg-white/10 rounded-lg sm:rounded-xl transition-colors"
            >
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-5 gap-2 sm:gap-4">
            {dayNamesShort.map(day => (
              <div key={day} className="text-center py-1">
                <span className="text-white/70 text-xs sm:text-sm md:text-base font-medium">{day}</span>
              </div>
            ))}
            
            {calendarDays.filter(dayObj => {
              const dayOfWeek = dayObj.date ? dayObj.date.getDay() : -1;
              return dayOfWeek !== 0 && dayOfWeek !== 6;
            }).map((dayObj, index) => {
              const { date, isCurrentMonth } = dayObj;
              const planningsForDate = getPlanningsForDate(date);
              const hasPlanning = planningsForDate.length > 0;
              const hasPlanningWithEfemeride = planningsForDate.some(p => p.efemeride && p.efemeride !== null);
              const efemeride = getEfemerideForDate(date);
              const hasEfemeride = efemeride !== null;
              
              const today = new Date();
              const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0));
              
              const isToday = date && 
                date.getUTCDate() === todayUTC.getUTCDate() &&
                date.getUTCMonth() === todayUTC.getUTCMonth() &&
                date.getUTCFullYear() === todayUTC.getUTCFullYear();
              
              const isWeekend = date && (date.getDay() === 0 || date.getDay() === 6);
              
              return (
                <div
                  key={index}
                  onClick={() => {
                    if (!date) return;
                    
                    if (hasPlanning && planningsForDate.length > 0) {
                      handlePlanningClick(planningsForDate[0]);
                      return;
                    }
                    
                    if (hasEfemeride && efemeride) {
                      setPendingEfemeride(efemeride);
                      setPendingDate(date);
                      setShowEfemerideDialog(true);
                      return;
                    }
                    
                    if (isCurrentMonth && !hasPlanning) {
                      if (isWeekend) {
                        alert('No puedes planificar para fines de semana. Por favor selecciona un día de lunes a viernes.');
                        return;
                      }
                      setSelectedDate(date);
                      sessionStorage.removeItem('themeCompleted');
                      sessionStorage.removeItem('incompletionReason');
                      
                      if (dailyPlannings.length === 0) {
                        setShowUnitListModal(true);
                      } else {
                        setShowThemeCompletionDialog(true);
                      }
                    }
                  }}
                  className={`
                    aspect-square flex items-center justify-center rounded-lg sm:rounded-2xl text-base sm:text-xl md:text-2xl font-bold transition-all
                    ${!isCurrentMonth ? 'bg-white/30 text-white/50' : ''}
                    ${isCurrentMonth && !hasPlanning && !isWeekend && !hasEfemeride ? 'bg-white/90 text-[#5B7FCC] hover:bg-white cursor-pointer active:scale-95 sm:hover:scale-105' : ''}
                    ${isCurrentMonth && isWeekend && !hasPlanning && !hasEfemeride ? 'bg-white/40 text-white/60 cursor-not-allowed' : ''}
                    ${hasPlanning && hasPlanningWithEfemeride ? 'bg-amber-500 text-white cursor-pointer active:scale-95 sm:hover:scale-105 sm:hover:shadow-xl sm:hover:bg-amber-600 border-2 border-white' : ''}
                    ${hasPlanning && !hasPlanningWithEfemeride ? 'bg-green-500 text-white cursor-pointer active:scale-95 sm:hover:scale-105 sm:hover:shadow-xl sm:hover:bg-green-600 border-2 border-white' : ''}
                    ${hasEfemeride && !hasPlanning ? 'bg-amber-400 text-white cursor-pointer active:scale-95 sm:hover:scale-105 sm:hover:shadow-xl sm:hover:bg-amber-500 border-2 border-white' : ''}
                    ${isToday ? 'ring-[3px] sm:ring-[4px]' : ''}
                    ${hasPlanning || hasEfemeride ? 'relative overflow-hidden' : ''}
                  `}
                  style={isToday ? { '--tw-ring-color': '#FF9A76' } as React.CSSProperties : undefined}
                >
                  {hasPlanning ? (
                    <div className="w-full h-full flex flex-col items-center justify-center p-1 sm:p-2 relative">
                      <span className="text-xl sm:text-2xl md:text-3xl font-bold leading-none mb-1 text-white">{date ? date.getDate() : ''}</span>
                      <div className="text-xs sm:text-sm md:text-base leading-tight text-center line-clamp-2 font-semibold px-1 text-white">
                        {(() => {
                          const fullName = planningsForDate[0]?.tema || planningsForDate[0]?.titulo || '';
                          const parts = fullName.split(':');
                          return parts.length > 1 ? parts[0].trim() : fullName;
                        })()}
                      </div>
                      {hasPlanningWithEfemeride && (
                        <div className="absolute top-1 right-1">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                      )}
                      {planningsForDate.length > 1 && (
                        <div className={`absolute bottom-1 right-1 text-xs sm:text-sm bg-white rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center font-bold shadow-md border-2 border-white ${hasPlanningWithEfemeride ? 'text-amber-600' : 'text-green-600'}`}>
                          +{planningsForDate.length - 1}
                        </div>
                      )}
                    </div>
                  ) : hasEfemeride ? (
                    <div className="w-full h-full flex flex-col items-center justify-center p-1 sm:p-2 relative">
                      <span className="text-xl sm:text-2xl md:text-3xl font-bold leading-none mb-1 text-white">{date ? date.getDate() : ''}</span>
                      <div className="text-[10px] sm:text-xs md:text-sm leading-tight text-center line-clamp-2 font-bold px-1 text-white uppercase">
                        {efemeride.name}
                      </div>
                      <div className="absolute top-1 right-1">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <span className="relative z-10 text-lg sm:text-xl md:text-2xl font-bold">{date ? date.getDate() : ''}</span>
                  )}
                </div>
              );
            })}
          </div>

          {isLoadingPlannings && (
            <div className="mt-4 sm:mt-8 flex items-center justify-center gap-2 sm:gap-3 text-white">
              <div className="inline-block animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-2 border-white border-t-transparent"></div>
              <p className="text-xs sm:text-sm font-medium">Cargando planificaciones...</p>
            </div>
          )}
        </div>

        {/* Efeméride Card */}
        {selectedEfemeride && (
          <div className="mt-4 sm:mt-8 animate-in fade-in slide-in-from-bottom duration-300">
            <div 
              className="rounded-2xl sm:rounded-[32px] p-5 sm:p-8 relative"
              style={{ backgroundColor: '#5B7FCC' }}
            >
              <button
                onClick={() => setSelectedEfemeride(null)}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors z-10"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </button>

              <div>
                <div className="mb-4 sm:mb-6">
                  <div className="text-xs font-bold uppercase tracking-widest text-white/80 mb-2 sm:mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    EFEMÉRIDE DOMINICANA
                  </div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight mb-4">
                    {selectedEfemeride.name}
                  </h2>
                  <p className="text-sm sm:text-base text-white/90 leading-relaxed">
                    {selectedEfemeride.description}
                  </p>
                </div>

                <div className="absolute bottom-5 right-5 sm:bottom-8 sm:right-8 opacity-20">
                  <svg className="w-12 h-12 sm:w-16 sm:h-16" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Planning Card - Modal Overlay */}
        {selectedPlanning && !selectedEfemeride && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div 
              className="rounded-2xl sm:rounded-[32px] p-5 sm:p-8 relative max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              style={{ backgroundColor: '#5B7FCC' }}
            >
              {sessionStorage.getItem('incompletionReason') && (
                <div className="mb-4 sm:mb-6 bg-amber-500 rounded-xl sm:rounded-2xl p-4 sm:p-5 border-2 border-white/30">
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-base sm:text-lg mb-1">
                        Tema Incompleto
                      </h3>
                      <p className="text-white/90 text-sm sm:text-base leading-relaxed">
                        {sessionStorage.getItem('incompletionReason') === 'tiempo' 
                          ? 'Esta planificación quedó incompleta por falta de tiempo. Continúa trabajando en el mismo tema.'
                          : 'Los estudiantes necesitan más tiempo con este tema. Continúa reforzando los conceptos.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  setSelectedPlanning(null);
                  sessionStorage.removeItem('incompletionReason');
                }}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors z-10"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </button>

              <div 
                onClick={() => {
                  const isIncompleteTheme = sessionStorage.getItem('incompletionReason');
                  
                  if (isIncompleteTheme) {
                    setShowIndicadorDialog(true);
                  } else {
                    navigateToDetails(selectedPlanning);
                  }
                }}
                className="cursor-pointer"
              >
                <div className="mb-4 sm:mb-6">
                  <div className="text-xs font-bold uppercase tracking-widest text-white/80 mb-2 sm:mb-3">
                    MATERIA
                  </div>
                  <div className="inline-flex items-center gap-2 sm:gap-3 px-3 py-2 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl" style={{ backgroundColor: '#3B5998' }}>
                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    <span className="text-white font-bold text-sm sm:text-base md:text-lg">
                      {selectedPlanning.materia || selectedPlanning.asignatura || 'Sin materia'}
                    </span>
                  </div>
                </div>

                <div className="mb-4 sm:mb-6">
                  <div className="text-xs font-bold uppercase tracking-widest text-white/80 mb-2 sm:mb-3">
                    TEMA DEL DÍA
                  </div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight">
                    {selectedPlanning.tema || selectedPlanning.titulo || 'Sin tema'}
                  </h2>
                </div>

                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-white/80 mb-2 sm:mb-3">
                    FECHA DE CREACIÓN
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth={2}/>
                      <line x1="16" y1="2" x2="16" y2="6" strokeWidth={2}/>
                      <line x1="8" y1="2" x2="8" y2="6" strokeWidth={2}/>
                      <line x1="3" y1="10" x2="21" y2="10" strokeWidth={2}/>
                    </svg>
                    <span className="text-white font-semibold text-base sm:text-lg md:text-xl">
                      {formatSpanishDate(selectedPlanning.createdAt || '')}
                    </span>
                  </div>
                </div>

                <div className="absolute bottom-5 right-5 sm:bottom-8 sm:right-8 opacity-30">
                  <svg className="w-8 h-8 sm:w-12 sm:h-12" viewBox="0 0 48 48" fill="none">
                    <path d="M24 0L26.4 21.6L24 48L21.6 21.6L24 0Z" fill="white"/>
                    <path d="M0 24L21.6 26.4L48 24L21.6 21.6L0 24Z" fill="white"/>
                  </svg>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = `/eliminar-planificacion-diaria/${encodeURIComponent(selectedPlanning.id)}`;
                }}
                className="mt-4 sm:mt-6 w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-red-600 text-white font-bold text-sm sm:text-base rounded-lg sm:rounded-xl hover:bg-red-700 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Borrar Planificación</span>
              </button>
            </div>
          </div>
        )}

        {/* Theme Completion Dialog - REDISEÑADO */}
        {showThemeCompletionDialog && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden">
              {/* Header - Azul #5B7FCC */}
              <div className="p-6 sm:p-8" style={{ backgroundColor: '#5B7FCC' }}>
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white flex-shrink-0" strokeWidth={2} />
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    Estado del Tema Anterior
                  </h2>
                </div>
                <p className="text-white/90 text-sm sm:text-base">
                  ¿Terminaste el tema de la planificación anterior?
                </p>
              </div>

              {/* Content */}
              <div className="p-6 sm:p-8">
                <div className="flex flex-col gap-3 sm:gap-4">
                  <button
                    onClick={() => {
                      console.log('✅ [TEMA TERMINADO] Usuario confirmó que terminó el tema');
                      
                      // Limpiar COMPLETAMENTE todos los datos de la planificación anterior
                      sessionStorage.setItem('themeCompleted', 'true');
                      sessionStorage.removeItem('currentDailyPlanning');
                      sessionStorage.removeItem('incompletionReason');
                      
                      // Limpiar estado de planificación seleccionada
                      setSelectedPlanning(null);
                      
                      // Cerrar diálogo actual y mostrar lista de secuencias
                      setShowThemeCompletionDialog(false);
                      setShowUnitListModal(true);
                      
                      console.log('📚 [SECUENCIAS] Mostrando lista de secuencias disponibles para nueva planificación');
                    }}
                    className="w-full px-6 py-4 sm:py-5 bg-green-600 hover:bg-green-700 text-white font-bold text-base sm:text-lg rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-98 flex items-center justify-center gap-3"
                    style={{ minHeight: '48px' }}
                  >
                    <CheckCircle className="w-6 h-6" strokeWidth={2.5} />
                    <span>Sí, terminé el tema</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      sessionStorage.setItem('themeCompleted', 'false');
                      setShowThemeCompletionDialog(false);
                      setShowReasonDialog(true);
                    }}
                    className="w-full px-6 py-4 sm:py-5 text-white font-bold text-base sm:text-lg rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-98 flex items-center justify-center gap-3"
                    style={{ backgroundColor: '#FF9A76', minHeight: '48px' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ff8860'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FF9A76'}
                  >
                    <AlertCircle className="w-6 h-6" strokeWidth={2.5} />
                    <span>No, no terminé el tema</span>
                  </button>
                  
                  <button
                    onClick={async () => {
                      if (dailyPlannings.length === 0 || !selectedDate) return;
                      
                      const lastPlanning = dailyPlannings[0];
                      const userEmail = lastPlanning.correo || localStorage.getItem('userEmail');
                      
                      const newDate = selectedDate;
                      const formattedDate = `${String(newDate.getDate()).padStart(2, '0')}/${String(newDate.getMonth() + 1).padStart(2, '0')}/${newDate.getFullYear()}`;
                      
                      const copiedPlanningPayload = {
                        'CENTRO EDUCATIVO': lastPlanning.centroEducativo || '',
                        'DOCENTE': lastPlanning.docente || '',
                        'MATERIA': lastPlanning.materia || lastPlanning.asignatura || '',
                        'TEMA DEL DÍA': lastPlanning.tema || lastPlanning.titulo || '',
                        'COMPETENCIA ESPECÍFICA': lastPlanning.competenciaEspecifica || '',
                        'INDICADORES DE LOGRO': lastPlanning.indicadoresLogro || '',
                        'ESTRATEGIA DE ENSEÑANZA': lastPlanning.estrategiaEnsenanza || '',
                        'INTENCIÓN PEDAGÓGICA DEL DÍA': lastPlanning.intencionPedagogica || '',
                        'ACTIVIDAD DE INICIO': lastPlanning.actividadInicio || '',
                        'ACTIVIDAD DE DESARROLLO': lastPlanning.actividadDesarrollo || '',
                        'ACTIVIDAD DE CIERRE': lastPlanning.actividadCierre || '',
                        'RECURSOS DIDACTICOS': lastPlanning.recursosDidacticos || '',
                        'CORREO': userEmail,
                        'APELLIDO': lastPlanning.apellido || '',
                        'COMPETENCIA FUNDAMENTALES': lastPlanning.competenciaFundamental || '',
                        'EJE TRANSVERSAL': lastPlanning.ejeTransversal || '',
                        'VALAORES Y ACTITUDES': lastPlanning.valoresYActitudes || '',
                        'GRADO': lastPlanning.grado || '',
                        'UNIDAD': lastPlanning.unidad || lastPlanning.UNIDAD || '',
                        'FECHA DE CREACION': formattedDate,
                      };
                      
                      try {
                        const response = await fetch('https://n8n.srv1144975.hstgr.cloud/webhook/a5de0afb-b2ae-4d46-8056-0f9bfefa282c', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify(copiedPlanningPayload),
                        });
                        
                        if (response.ok) {
                          setShowThemeCompletionDialog(false);
                          if (userEmail) {
                            await loadDailyPlannings(userEmail);
                          }
                        } else {
                          alert('Error al copiar la planificación. Por favor intenta de nuevo.');
                        }
                      } catch (error) {
                        alert('Error al copiar la planificación. Por favor intenta de nuevo.');
                      }
                    }}
                    className="w-full px-6 py-4 sm:py-5 border-2 text-base sm:text-lg font-semibold rounded-xl transition-all hover:shadow-lg active:scale-98 flex items-center justify-center gap-3"
                    style={{ 
                      borderColor: '#5B7FCC',
                      color: '#5B7FCC',
                      minHeight: '48px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#E8F0FE';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                    }}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Copiar para hoy</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    setShowThemeCompletionDialog(false);
                    setSelectedDate(null);
                  }}
                  className="w-full mt-4 px-6 py-3 text-slate-500 hover:text-slate-700 font-medium text-sm transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Incompletion Reason Dialog - REDISEÑADO */}
        {showReasonDialog && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden">
              {/* Header - Naranja #FF9A76 */}
              <div className="p-6 sm:p-8" style={{ backgroundColor: '#FF9A76' }}>
                <div className="flex items-center gap-3 mb-3">
                  <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white flex-shrink-0" strokeWidth={2} />
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    ¿Por qué no terminaste?
                  </h2>
                </div>
                <p className="text-white/90 text-sm sm:text-base">
                  Selecciona la razón para crear el refuerzo adecuado
                </p>
              </div>

              {/* Content */}
              <div className="p-6 sm:p-8">
                <div className="flex flex-col gap-3 sm:gap-4">
                  <button
                    onClick={() => {
                      sessionStorage.setItem('incompletionReason', 'tiempo');
                      setShowReasonDialog(false);
                      setShowPlanningListDialog(true);
                    }}
                    className="w-full px-6 py-4 sm:py-5 text-white font-bold text-base sm:text-lg rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-98 flex items-center justify-center gap-3"
                    style={{ backgroundColor: '#5B7FCC', minHeight: '48px' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4a6bb8'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#5B7FCC'}
                  >
                    <Clock className="w-6 h-6" strokeWidth={2.5} />
                    <span>Se me acabó el tiempo</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      sessionStorage.setItem('incompletionReason', 'comprension');
                      setShowReasonDialog(false);
                      setShowPlanningListDialog(true);
                    }}
                    className="w-full px-6 py-4 sm:py-5 text-white font-bold text-base sm:text-lg rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-98 flex items-center justify-center gap-3"
                    style={{ backgroundColor: '#5B7FCC', minHeight: '48px' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4a6bb8'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#5B7FCC'}
                  >
                    <Users className="w-6 h-6" strokeWidth={2.5} />
                    <span>Los estudiantes no entendieron</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    setShowReasonDialog(false);
                    setSelectedDate(null);
                    sessionStorage.removeItem('themeCompleted');
                  }}
                  className="w-full mt-4 px-6 py-3 text-slate-500 hover:text-slate-700 font-medium text-sm transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Efeméride Dialog - REDISEÑADO */}
        {showEfemerideDialog && pendingEfemeride && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden">
              {/* Header - Azul #5B7FCC */}
              <div className="p-6 sm:p-8" style={{ backgroundColor: '#5B7FCC' }}>
                <div className="flex items-center gap-3 mb-3">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">
                      Efeméride Dominicana
                    </h2>
                    <p className="text-white/90 text-sm mt-1">
                      {pendingEfemeride.name}
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 sm:p-8">
                <p className="text-slate-700 text-sm sm:text-base leading-relaxed mb-6">
                  {pendingEfemeride.description}
                </p>
                
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
                  <p className="text-blue-900 font-semibold text-sm">
                    ¿Deseas incluir esta efeméride en tu planificación diaria?
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      sessionStorage.setItem('selectedEfemeride', JSON.stringify(pendingEfemeride));
                      setShowEfemerideDialog(false);
                      setSelectedDate(pendingDate);
                      setShowUnitListModal(true);
                    }}
                    className="flex-1 px-6 py-4 text-white font-bold text-base rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-98"
                    style={{ backgroundColor: '#5B7FCC', minHeight: '48px' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4a6bb8'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#5B7FCC'}
                  >
                    Sí, incluir efeméride
                  </button>
                  <button
                    onClick={() => {
                      sessionStorage.removeItem('selectedEfemeride');
                      setShowEfemerideDialog(false);
                      setSelectedDate(pendingDate);
                      setShowUnitListModal(true);
                    }}
                    className="flex-1 px-6 py-4 bg-white border-2 text-slate-700 font-semibold text-base rounded-xl hover:bg-slate-50 transition-all active:scale-98"
                    style={{ borderColor: '#5B7FCC', minHeight: '48px' }}
                  >
                    No, planificar normal
                  </button>
                </div>

                <button
                  onClick={() => {
                    setShowEfemerideDialog(false);
                    setPendingEfemeride(null);
                    setPendingDate(null);
                  }}
                  className="w-full mt-3 px-6 py-3 text-slate-500 hover:text-slate-700 font-medium text-sm transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Planning List Dialog - REDISEÑADO */}
        {showPlanningListDialog && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
              {/* Header - Azul #5B7FCC */}
              <div className="p-6 sm:p-8 flex-shrink-0" style={{ backgroundColor: '#5B7FCC' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-white flex-shrink-0" strokeWidth={2} />
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-white">
                        Selecciona la Planificación
                      </h2>
                      <p className="text-white/90 text-sm mt-1">
                        {sessionStorage.getItem('incompletionReason') === 'tiempo'
                          ? '¿De cuál planificación se te acabó el tiempo?'
                          : '¿Cuál planificación los estudiantes no entendieron?'
                        }
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowPlanningListDialog(false);
                      sessionStorage.removeItem('incompletionReason');
                    }}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors flex-shrink-0"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                {dailyPlannings.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">No hay planificaciones disponibles</p>
                ) : (
                  <div className="space-y-3">
                    {dailyPlannings.map((planning) => (
                      <button
                        key={planning.id}
                        onClick={async () => {
                          const incompletionReason = sessionStorage.getItem('incompletionReason');
                          
                          if (incompletionReason === 'tiempo') {
                            let processedIndicadores = planning.indicadoresLogro || '';
                            
                            if (processedIndicadores && !processedIndicadores.startsWith('[')) {
                              if (processedIndicadores.includes('-')) {
                                const items = processedIndicadores.split('-')
                                  .map(item => item.trim())
                                  .filter(item => item.length > 0);
                                processedIndicadores = JSON.stringify(items);
                              } else {
                                processedIndicadores = JSON.stringify([processedIndicadores]);
                              }
                            }
                            
                            const updatedPlanning = {
                              ...planning,
                              indicadoresLogro: processedIndicadores
                            };
                            
                            setSelectedPlanning(updatedPlanning);
                            setShowPlanningListDialog(false);
                            setShowIndicadorDialog(true);
                          }
                          else if (incompletionReason === 'comprension') {
                            setSelectedPlanning(planning);
                            setShowPlanningListDialog(false);
                            setShowEstrategiaReviewDialog(true);
                          }
                        }}
                        className="w-full text-left p-4 sm:p-5 bg-white hover:bg-blue-50 border-2 border-slate-200 hover:border-blue-400 rounded-xl sm:rounded-2xl transition-all duration-200 hover:shadow-lg group"
                        style={{ minHeight: '80px' }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#5B7FCC' }} />
                              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider" style={{ color: '#5B7FCC' }}>
                                {planning.materia || planning.asignatura}
                              </span>
                            </div>
                            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-700 transition-colors line-clamp-2">
                              {planning.tema || planning.titulo}
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-600">
                              {formatSpanishDate(planning.createdAt || '')}
                            </p>
                          </div>
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 sm:p-8 bg-slate-50 border-t border-slate-200 flex-shrink-0">
                <button
                  onClick={() => {
                    setShowPlanningListDialog(false);
                    sessionStorage.removeItem('incompletionReason');
                  }}
                  className="w-full px-6 py-4 bg-white border-2 border-slate-300 text-slate-700 font-semibold text-base rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all active:scale-98"
                  style={{ minHeight: '48px' }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Indicadores/Estrategias Dialog - Se mantiene el diseño actual pero con mejor consistencia */}
        {showIndicadorDialog && selectedPlanning && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header - Azul #5B7FCC */}
              <div className="p-6 sm:p-8 flex-shrink-0" style={{ backgroundColor: '#5B7FCC' }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 pr-4">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 leading-tight">
                      {sessionStorage.getItem('incompletionReason') === 'comprension' 
                        ? 'Estrategias de Enseñanza'
                        : '¿Qué lograron hoy?'
                      }
                    </h2>
                    <p className="text-white/90 text-sm sm:text-base leading-relaxed">
                      {sessionStorage.getItem('incompletionReason') === 'comprension'
                        ? 'Selecciona las estrategias que quieres modificar o reforzar para la próxima clase'
                        : 'Marca los indicadores de logro que los estudiantes SÍ cumplieron durante la clase de hoy'
                      }
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowIndicadorDialog(false);
                      setSelectedIndicadores([]);
                    }}
                    className="p-2.5 hover:bg-white/20 rounded-full transition-colors flex-shrink-0"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>
                
                {sessionStorage.getItem('incompletionReason') === 'tiempo' && (
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-6 h-6 text-white flex-shrink-0 mt-0.5" />
                      <p className="text-white text-sm font-medium leading-relaxed">
                        <strong className="font-bold">Importante:</strong> Los indicadores que marques NO se incluirán en el refuerzo porque ya fueron cumplidos.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {showSelectionAlert && (
                <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-[70] animate-in fade-in slide-in-from-top duration-300">
                  <div className="rounded-2xl p-5 flex items-center gap-4 shadow-2xl border-2 border-white" style={{ backgroundColor: '#FF9A76' }}>
                    <AlertCircle className="w-6 h-6 text-white flex-shrink-0" />
                    <p className="text-base font-semibold text-white leading-tight">
                      Este indicador NO se incluirá en el refuerzo porque ya fue cumplido
                    </p>
                  </div>
                </div>
              )}
              
              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-4 sm:p-6">
                  {(() => {
                    const isTiempo = sessionStorage.getItem('incompletionReason') === 'tiempo';
                    const sourceText = isTiempo 
                      ? (selectedPlanning.indicadoresLogro || '[]')
                      : ((selectedPlanning as any).estrategiasAlternativas || selectedPlanning.indicadoresLogro || '[]');
                    
                    let indicadores: string[] = [];
                    
                    try {
                      indicadores = JSON.parse(sourceText);
                    } catch (parseError) {
                      if (sourceText.includes('-')) {
                        indicadores = sourceText.split('-').map((item: string) => item.trim()).filter((item: string) => item.length > 0);
                      }
                    }
                    
                    if (indicadores.length === 0) {
                      const isComprension = sessionStorage.getItem('incompletionReason') === 'comprension';
                      return (
                        <div className="text-center py-8">
                          <BookOpen className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                          <p className="text-blue-900 text-base font-medium">
                            {isComprension 
                              ? 'No hay estrategias disponibles'
                              : 'No hay indicadores de logro disponibles'
                            }
                          </p>
                        </div>
                      );
                    }
                    
                    return (
                      <ul className="space-y-3">
                        {indicadores.map((item, index) => {
                          const isSelected = selectedIndicadores.includes(index);
                          
                          return (
                            <li 
                              key={index} 
                              onClick={() => {
                                const wasSelected = selectedIndicadores.includes(index);
                                setSelectedIndicadores(prev => 
                                  prev.includes(index) 
                                    ? prev.filter(i => i !== index)
                                    : [...prev, index]
                                );
                                
                                if (!wasSelected && sessionStorage.getItem('incompletionReason') === 'tiempo') {
                                  setShowSelectionAlert(true);
                                  setTimeout(() => setShowSelectionAlert(false), 3000);
                                }
                              }}
                              className={`
                                flex items-start gap-4 p-4 sm:p-5 rounded-xl sm:rounded-2xl cursor-pointer transition-all border-2
                                ${isSelected 
                                  ? 'shadow-md' 
                                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                                }
                              `}
                              style={isSelected ? { 
                                backgroundColor: '#E8F0FE',
                                borderColor: '#5B7FCC',
                                minHeight: '60px'
                              } : { minHeight: '60px' }}
                            >
                              <div 
                                className={`
                                  w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-1 transition-all
                                  ${isSelected ? '' : 'border-gray-300 bg-white'}
                                `}
                                style={isSelected ? {
                                  borderColor: '#5B7FCC',
                                  backgroundColor: '#5B7FCC'
                                } : {}}
                              >
                                {isSelected && (
                                  <CheckCircle className="w-4 h-4 text-white" strokeWidth={3} />
                                )}
                              </div>
                              <span 
                                className="flex-1 text-sm sm:text-base leading-relaxed"
                                style={{ color: isSelected ? '#1e3a8a' : '#374151', fontWeight: isSelected ? '500' : '400' }}
                              >
                                {(() => {
                                  if (item.includes('<BOLD>')) {
                                    const parts = item.split('<BOLD>');
                                    return (
                                      <>
                                        {parts.map((part, idx) => {
                                          if (idx === 0) return part;
                                          
                                          const [boldText, ...rest] = part.split('</BOLD>');
                                          return (
                                            <span key={idx}>
                                              <strong style={{ fontWeight: '700' }}>{boldText}</strong>
                                              {rest.join('</BOLD>')}
                                            </span>
                                          );
                                        })}
                                      </>
                                    );
                                  }
                                  return item;
                                })()}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    );
                  })()}
                </div>
              </div>

              {/* Footer with Actions */}
              <div className="p-6 sm:p-8 bg-slate-50 border-t border-slate-200 flex-shrink-0">
                <div className="flex flex-col gap-3">
                  <button
                    onClick={async () => {
                      if (!selectedPlanning) return;
                      
                      const isTiempo = sessionStorage.getItem('incompletionReason') === 'tiempo';
                      
                      if (isTiempo) {
                        const webhookPayload = {
                          'CENTRO EDUCATIVO': selectedPlanning.centroEducativo || '',
                          'DOCENTE': selectedPlanning.docente || '',
                          'MATERIA': selectedPlanning.materia || selectedPlanning.asignatura || '',
                          'TEMA DEL DÍA': selectedPlanning.tema || selectedPlanning.titulo || '',
                          'COMPETENCIA ESPECÍFICA': selectedPlanning.competenciaEspecifica || '',
                          'INDICADORES DE LOGRO': selectedPlanning.indicadoresLogro || '',
                          'ESTRATEGIA DE ENSEÑANZA': selectedPlanning.estrategiaEnsenanza || '',
                          'INTENCIÓN PEDAGÓGICA DEL DÍA': selectedPlanning.intencionPedagogica || '',
                          'ACTIVIDAD DE INICIO': selectedPlanning.actividadInicio || '',
                          'ACTIVIDAD DE DESARROLLO': selectedPlanning.actividadDesarrollo || '',
                          'ACTIVIDAD DE CIERRE': selectedPlanning.actividadCierre || '',
                          'RECURSOS DIDACTICOS': selectedPlanning.recursosDidacticos || '',
                          'CORREO': selectedPlanning.correo || localStorage.getItem('userEmail') || '',
                          'APELLIDO': selectedPlanning.apellido || '',
                          'COMPETENCIA FUNDAMENTALES': selectedPlanning.competenciaFundamental || '',
                          'EJE TRANSVERSAL': selectedPlanning.ejeTransversal || '',
                          'VALAORES Y ACTITUDES': selectedPlanning.valoresYActitudes || '',
                          'GRADO': selectedPlanning.grado || '',
                          'FECHA DE CREACION': selectedPlanning.createdAt || '',
                          'UNIDAD': selectedPlanning.unidad || selectedPlanning.UNIDAD || ''
                        };
                        
                        try {
                          const webhookResponse = await fetch('https://n8n.srv1144975.hstgr.cloud/webhook/BUSCARINDICADORES', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(webhookPayload),
                          });
                          
                          if (!webhookResponse.ok) {
                            alert('Error al obtener contenidos procedimentales. Por favor intenta de nuevo.');
                            return;
                          }
                          
                          const responseText = await webhookResponse.text();
                          let webhookData;
                          try {
                            webhookData = JSON.parse(responseText);
                          } catch (parseError) {
                            alert('Error al procesar la respuesta del servidor');
                            return;
                          }
                          
                          let contenidosRaw: string | string[] = '';
                          
                          if (Array.isArray(webhookData) && webhookData.length > 0) {
                            contenidosRaw = webhookData[0]['PROCEDIMIENTOS DE LA ACTIVIDAD'] || '';
                          } else {
                            contenidosRaw = webhookData['PROCEDIMIENTOS DE LA ACTIVIDAD'] || '';
                          }
                          
                          if (!contenidosRaw) {
                            alert('No se encontraron procedimientos de la actividad');
                            return;
                          }
                          
                          let contenidosList: string[] = [];
                          
                          if (typeof contenidosRaw === 'string') {
                            const items = contenidosRaw.split(/\s*-\s*|•|\n/).map((item: string) => {
                              return item.replace(/<br\s*\/?>/gi, '').trim();
                            }).filter((item: string) => item.length > 0);
                            contenidosList = items;
                          } else if (Array.isArray(contenidosRaw)) {
                            contenidosList = contenidosRaw.map((item: string) => item.replace(/<br\s*\/?>/gi, '').trim());
                          }
                          
                          if (contenidosList.length === 0) {
                            alert('No se pudieron procesar los procedimientos de la actividad');
                            return;
                          }
                          
                          const processedContenidos = JSON.stringify(contenidosList);
                          
                          const updatedPlanning = {
                            ...selectedPlanning,
                            contenidosProcedimentales: processedContenidos
                          };
                          
                          setSelectedPlanning(updatedPlanning);
                          setShowIndicadorDialog(false);
                          setShowContenidosDialog(true);
                        } catch (error) {
                          alert('Error al obtener contenidos procedimentales. Por favor intenta de nuevo.');
                        }
                        
                        return;
                      }
                      
                      // FLUJO COMPRENSIÓN
                      const sourceText = (selectedPlanning as any).estrategiasAlternativas || selectedPlanning.indicadoresLogro || '[]';
                      
                      let items: string[] = [];
                      try {
                        items = JSON.parse(sourceText);
                      } catch {
                        items = sourceText.split('-').map((item: string) => item.trim()).filter((item: string) => item.length > 0);
                      }
                      
                      const datosModificados = selectedIndicadores.map(index => items[index]).join(' - ');
                      
                      let fechaSeleccionada = selectedPlanning.createdAt || '';
                      if (selectedDate) {
                        const day = String(selectedDate.getDate()).padStart(2, '0');
                        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                        const year = selectedDate.getFullYear();
                        fechaSeleccionada = `${day}/${month}/${year}`;
                      }
                      
                      const uniqueId = crypto.randomUUID();
                      
                      const webhookPayload = {
                        id: uniqueId,
                        'correo': selectedPlanning.correo || localStorage.getItem('userEmail') || '',
                        'CENTRO EDUCATIVO': selectedPlanning.centroEducativo || '',
                        'DOCENTE': selectedPlanning.docente || '',
                        'APELLIDO': selectedPlanning.apellido || '',
                        'TEMA DEL DÍA': selectedPlanning.tema || selectedPlanning.titulo || '',
                        'UNIDAD': selectedPlanning.unidad || selectedPlanning.UNIDAD || '',
                        'GRADO': selectedPlanning.grado || '',
                        'MATERIA': selectedPlanning.materia || selectedPlanning.asignatura || '',
                        'FECHA DE CREACION': fechaSeleccionada,
                        'INDICADORES DE LOGRO': selectedPlanning.indicadoresLogro || '',
                        'ESTRATEGIA DE ENSEÑANZA': datosModificados,
                        'RECURSOS DIDACTICOS': selectedPlanning.recursosDidacticos || '',
                        'CONTENIDOS PROCEDIMENTALES': (selectedPlanning as any).contenidosProcedimentales || ''
                      };
                      
                      setShowIndicadorDialog(false);
                      setSelectedIndicadores([]);
                      setShowLoadingScreen(true);
                      
                      try {
                        const response = await fetch('https://n8n.srv1144975.hstgr.cloud/webhook/REFUERZO', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify(webhookPayload),
                        });
                        
                        if (response.ok) {
                          const userEmail = selectedPlanning.correo || localStorage.getItem('userEmail');
                          if (userEmail) {
                            await loadDailyPlannings(userEmail);
                          }
                          
                          setShowLoadingScreen(false);
                          setShowSuccessScreen(true);
                          
                          setTimeout(() => {
                            setShowSuccessScreen(false);
                            sessionStorage.removeItem('incompletionReason');
                            setSelectedPlanning(null);
                          }, 2000);
                        } else {
                          setShowLoadingScreen(false);
                          alert('Error al generar la planificación de refuerzo. Por favor intenta de nuevo.');
                          setShowIndicadorDialog(true);
                        }
                      } catch (error) {
                        setShowLoadingScreen(false);
                        alert('Error al generar la planificación de refuerzo. Por favor intenta de nuevo.');
                        setShowIndicadorDialog(true);
                      }
                    }}
                    className="w-full px-8 py-4 sm:py-5 text-white font-bold text-base sm:text-lg rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-98"
                    style={{ backgroundColor: '#5B7FCC', minHeight: '56px' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4a6bb8'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#5B7FCC'}
                  >
                    {sessionStorage.getItem('incompletionReason') === 'tiempo'
                      ? 'Continuar'
                      : 'Enviar Estrategias Seleccionadas'
                    }
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowIndicadorDialog(false);
                      setSelectedIndicadores([]);
                      sessionStorage.removeItem('incompletionReason');
                      setSelectedPlanning(null);
                    }}
                    className="w-full px-8 py-3 text-slate-600 hover:text-slate-800 font-semibold text-base transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contenidos Dialog - Similar structure to Indicadores */}
        {showContenidosDialog && selectedPlanning && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header - Azul #5B7FCC */}
              <div className="p-6 sm:p-8 flex-shrink-0" style={{ backgroundColor: '#5B7FCC' }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 pr-4">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 leading-tight">
                      ¿Qué procedimientos ya trabajaste?
                    </h2>
                    <p className="text-white/90 text-sm sm:text-base leading-relaxed">
                      Marca los que SÍ alcanzaste a trabajar. Los NO marcados se incluirán en el refuerzo.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowContenidosDialog(false);
                      setSelectedContenidos([]);
                      setShowIndicadorDialog(true);
                    }}
                    className="p-2.5 hover:bg-white/20 rounded-full transition-colors flex-shrink-0"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>
                
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-white flex-shrink-0 mt-0.5" />
                    <p className="text-white text-sm font-medium leading-relaxed">
                      <strong className="font-bold">Importante:</strong> Los procedimientos marcados NO se incluirán en el refuerzo porque ya los trabajaste.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-4 sm:p-6">
                  {(() => {
                    const sourceText = (selectedPlanning as any).contenidosProcedimentales || '[]';
                    let contenidos: string[] = [];
                    
                    try {
                      contenidos = JSON.parse(sourceText);
                    } catch (parseError) {
                      if (sourceText.includes('•')) {
                        contenidos = sourceText.split('•').map((item: string) => item.trim()).filter((item: string) => item.length > 0);
                      } else if (sourceText.includes('\n')) {
                        contenidos = sourceText.split('\n').map((item: string) => item.trim()).filter((item: string) => item.length > 0);
                      }
                    }
                    
                    if (contenidos.length === 0) {
                      return (
                        <div className="text-center py-8">
                          <BookOpen className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                          <p className="text-blue-900 text-base font-medium">
                            No hay procedimientos disponibles
                          </p>
                        </div>
                      );
                    }
                    
                    return (
                      <ul className="space-y-3">
                        {contenidos.map((item, index) => {
                          const isSelected = selectedContenidos.includes(index);
                          
                          return (
                            <li 
                              key={index} 
                              onClick={() => {
                                setSelectedContenidos(prev => 
                                  prev.includes(index) 
                                    ? prev.filter(i => i !== index)
                                    : [...prev, index]
                                );
                              }}
                              className={`
                                flex items-start gap-4 p-4 sm:p-5 rounded-xl sm:rounded-2xl cursor-pointer transition-all border-2
                                ${isSelected 
                                  ? 'shadow-md' 
                                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                                }
                              `}
                              style={isSelected ? { 
                                backgroundColor: '#E8F0FE',
                                borderColor: '#5B7FCC',
                                minHeight: '60px'
                              } : { minHeight: '60px' }}
                            >
                              <div 
                                className={`
                                  w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-1 transition-all
                                  ${isSelected ? '' : 'border-gray-300 bg-white'}
                                `}
                                style={isSelected ? {
                                  borderColor: '#5B7FCC',
                                  backgroundColor: '#5B7FCC'
                                } : {}}
                              >
                                {isSelected && (
                                  <CheckCircle className="w-4 h-4 text-white" strokeWidth={3} />
                                )}
                              </div>
                              <span 
                                className="flex-1 text-sm sm:text-base leading-relaxed"
                                style={{ color: isSelected ? '#1e3a8a' : '#374151', fontWeight: isSelected ? '500' : '400' }}
                              >
                                {item}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    );
                  })()}
                </div>
              </div>

              {/* Footer with Actions */}
              <div className="p-6 sm:p-8 bg-slate-50 border-t border-slate-200 flex-shrink-0">
                <div className="flex flex-col gap-3">
                  <button
                    onClick={async () => {
                      if (!selectedPlanning) return;
                      
                      const indicadoresSource = selectedPlanning.indicadoresLogro || '[]';
                      let indicadoresItems: string[] = [];
                      try {
                        indicadoresItems = JSON.parse(indicadoresSource);
                      } catch {
                        indicadoresItems = indicadoresSource.split('-').map((item: string) => item.trim()).filter((item: string) => item.length > 0);
                      }
                      
                      const indicesNoSeleccionados = indicadoresItems
                        .map((_, index) => index)
                        .filter(index => !selectedIndicadores.includes(index));
                      
                      const indicadoresModificados = indicesNoSeleccionados
                        .map(index => indicadoresItems[index])
                        .join(' - ');
                      
                      const contenidosSource = (selectedPlanning as any).contenidosProcedimentales || '[]';
                      let contenidosItems: string[] = [];
                      try {
                        contenidosItems = JSON.parse(contenidosSource);
                      } catch {
                        contenidosItems = [];
                      }
                      
                      const contenidosSeleccionados = selectedContenidos
                        .map(index => contenidosItems[index])
                        .join(' • ');
                      
                      let fechaSeleccionada = selectedPlanning.createdAt || '';
                      if (selectedDate) {
                        const day = String(selectedDate.getDate()).padStart(2, '0');
                        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                        const year = selectedDate.getFullYear();
                        fechaSeleccionada = `${day}/${month}/${year}`;
                      }
                      
                      const uniqueId = crypto.randomUUID();
                      
                      const webhookPayload = {
                        id: uniqueId,
                        'correo': selectedPlanning.correo || localStorage.getItem('userEmail') || '',
                        'CENTRO EDUCATIVO': selectedPlanning.centroEducativo || '',
                        'DOCENTE': selectedPlanning.docente || '',
                        'APELLIDO': selectedPlanning.apellido || '',
                        'TEMA DEL DÍA': selectedPlanning.tema || selectedPlanning.titulo || '',
                        'UNIDAD': selectedPlanning.unidad || selectedPlanning.UNIDAD || '',
                        'GRADO': selectedPlanning.grado || '',
                        'MATERIA': selectedPlanning.materia || selectedPlanning.asignatura || '',
                        'FECHA DE CREACION': fechaSeleccionada,
                        'INDICADORES DE LOGRO': indicadoresModificados,
                        'ESTRATEGIA DE ENSEÑANZA': selectedPlanning.estrategiaEnsenanza || '',
                        'RECURSOS DIDACTICOS': selectedPlanning.recursosDidacticos || '',
                        'CONTENIDOS PROCEDIMENTALES': contenidosSeleccionados
                      };
                      
                      setShowContenidosDialog(false);
                      setSelectedContenidos([]);
                      setSelectedIndicadores([]);
                      setShowLoadingScreen(true);
                      
                      try {
                        const response = await fetch('https://n8n.srv1144975.hstgr.cloud/webhook/REFUERZO', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify(webhookPayload),
                        });
                        
                        if (response.ok) {
                          const userEmail = selectedPlanning.correo || localStorage.getItem('userEmail');
                          if (userEmail) {
                            await loadDailyPlannings(userEmail);
                          }
                          
                          setShowLoadingScreen(false);
                          setShowSuccessScreen(true);
                          
                          setTimeout(() => {
                            setShowSuccessScreen(false);
                            sessionStorage.removeItem('incompletionReason');
                            setSelectedPlanning(null);
                          }, 2000);
                        } else {
                          setShowLoadingScreen(false);
                          alert('Error al generar la planificación de refuerzo. Por favor intenta de nuevo.');
                          setShowContenidosDialog(true);
                        }
                      } catch (error) {
                        setShowLoadingScreen(false);
                        alert('Error al generar la planificación de refuerzo. Por favor intenta de nuevo.');
                        setShowContenidosDialog(true);
                      }
                    }}
                    className="w-full px-8 py-4 sm:py-5 text-white font-bold text-base sm:text-lg rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-98"
                    style={{ backgroundColor: '#5B7FCC', minHeight: '56px' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4a6bb8'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#5B7FCC'}
                  >
                    Crear Planificación de Refuerzo
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowContenidosDialog(false);
                      setSelectedContenidos([]);
                      setShowIndicadorDialog(true);
                    }}
                    className="w-full px-8 py-3 text-slate-600 hover:text-slate-800 font-semibold text-base transition-colors"
                  >
                    Volver a Indicadores
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Estrategia Review Dialog - Mantener diseño existente pero mejorado */}
        {showEstrategiaReviewDialog && selectedPlanning && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 sm:p-8" style={{ backgroundColor: '#5B7FCC' }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 pr-4">
                    <div className="flex items-center gap-3 mb-3">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <h2 className="text-2xl sm:text-3xl font-bold text-white">
                        Estrategia Utilizada en Clase
                      </h2>
                    </div>
                    <p className="text-white/90 text-sm sm:text-base leading-relaxed">
                      Esta fue la estrategia de enseñanza-aprendizaje que implementaste cuando los estudiantes no comprendieron el tema
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowEstrategiaReviewDialog(false);
                      setSelectedPlanning(null);
                      sessionStorage.removeItem('incompletionReason');
                    }}
                    className="p-2.5 hover:bg-white/20 rounded-full transition-colors flex-shrink-0"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5 sm:p-6 mb-6 sm:mb-8">
                  <div className="flex items-start gap-4">
                    <svg className="w-7 h-7 flex-shrink-0 mt-0.5" style={{ color: '#5B7FCC' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                      <h4 className="font-bold text-base mb-2" style={{ color: '#1e3a8a' }}>Sugerencia Pedagógica</h4>
                      <p className="text-slate-700 text-sm sm:text-base font-medium leading-relaxed">
                        Los estudiantes no comprendieron el tema con esta estrategia. Te recomendamos cambiarla por una alternativa que se ajuste mejor a las necesidades del grupo.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5 sm:p-6 mb-6 sm:mb-8">
                  <h3 className="font-bold text-sm sm:text-base uppercase tracking-wide mb-4 flex items-center gap-2" style={{ color: '#1e3a8a' }}>
                    <BookOpen className="w-5 h-5" />
                    Estrategia de Enseñanza-Aprendizaje Original
                  </h3>
                  <div className="text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-wrap bg-white rounded-xl p-4 sm:p-5">
                    {selectedPlanning.estrategiaEnsenanza || 'No se encontró estrategia registrada'}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={async () => {
                      const webhookPayload = {
                        'CENTRO EDUCATIVO': selectedPlanning.centroEducativo || '',
                        'DOCENTE': selectedPlanning.docente || '',
                        'MATERIA': selectedPlanning.materia || selectedPlanning.asignatura || '',
                        'TEMA DEL DÍA': selectedPlanning.tema || selectedPlanning.titulo || '',
                        'COMPETENCIA ESPECÍFICA': selectedPlanning.competenciaEspecifica || '',
                        'INDICADORES DE LOGRO': selectedPlanning.indicadoresLogro || '',
                        'ESTRATEGIA DE ENSEÑANZA': selectedPlanning.estrategiaEnsenanza || '',
                        'INTENCIÓN PEDAGÓGICA DEL DÍA': selectedPlanning.intencionPedagogica || '',
                        'ACTIVIDAD DE INICIO': selectedPlanning.actividadInicio || '',
                        'ACTIVIDAD DE DESARROLLO': selectedPlanning.actividadDesarrollo || '',
                        'ACTIVIDAD DE CIERRE': selectedPlanning.actividadCierre || '',
                        'RECURSOS DIDACTICOS': selectedPlanning.recursosDidacticos || '',
                        'CORREO': selectedPlanning.correo || localStorage.getItem('userEmail') || '',
                        'APELLIDO': selectedPlanning.apellido || '',
                        'COMPETENCIA FUNDAMENTALES': selectedPlanning.competenciaFundamental || '',
                        'EJE TRANSVERSAL': selectedPlanning.ejeTransversal || '',
                        'VALAORES Y ACTITUDES': selectedPlanning.valoresYActitudes || '',
                        'GRADO': selectedPlanning.grado || '',
                        'FECHA DE CREACION': selectedPlanning.createdAt || '',
                        'UNIDAD': selectedPlanning.unidad || selectedPlanning.UNIDAD || ''
                      };
                      
                      try {
                        const webhookResponse = await fetch('https://n8n.srv1144975.hstgr.cloud/webhook/BUSCARINDICADORES', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify(webhookPayload),
                        });
                        
                        if (!webhookResponse.ok) {
                          alert('Error al obtener estrategias alternativas. Por favor intenta de nuevo.');
                          return;
                        }
                        
                        const responseText = await webhookResponse.text();
                        let webhookData;
                        try {
                          webhookData = JSON.parse(responseText);
                        } catch (parseError) {
                          alert('Error al procesar la respuesta del servidor');
                          return;
                        }
                        
                        let estrategiasRaw: string | string[] = '';
                        
                        if (Array.isArray(webhookData) && webhookData.length > 0) {
                          estrategiasRaw = webhookData[0]['Estrategia Enseñanza-Aprendizaje'] || '';
                        } else {
                          estrategiasRaw = webhookData['Estrategia Enseñanza-Aprendizaje'] || '';
                        }
                        
                        if (!estrategiasRaw) {
                          alert('No se encontraron estrategias alternativas en la respuesta');
                          return;
                        }
                        
                        let estrategiasList: string[] = [];
                        
                        if (typeof estrategiasRaw === 'string') {
                          const items = estrategiasRaw.split(/\n\n+/);
                          estrategiasList = items
                            .map((item: string) => {
                              let cleaned = item.replace(/\*\*([^*]+)\*\*/g, '<BOLD>$1</BOLD>');
                              cleaned = cleaned.replace(/\n/g, ' ');
                              cleaned = cleaned.replace(/\s+/g, ' ').trim();
                              return cleaned;
                            })
                            .filter((item: string) => item.length > 0);
                        } else if (Array.isArray(estrategiasRaw)) {
                          estrategiasList = estrategiasRaw;
                        }
                        
                        const processedEstrategias = JSON.stringify(estrategiasList);
                        
                        const updatedPlanning = {
                          ...selectedPlanning,
                          estrategiasAlternativas: processedEstrategias
                        };
                        
                        setSelectedPlanning(updatedPlanning);
                        setShowEstrategiaReviewDialog(false);
                        setShowIndicadorDialog(true);
                      } catch (error) {
                        alert('Error al obtener estrategias alternativas. Por favor intenta de nuevo.');
                      }
                    }}
                    className="w-full px-8 py-4 sm:py-5 text-white font-bold text-base sm:text-lg rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-98 flex items-center justify-center gap-3"
                    style={{ backgroundColor: '#5B7FCC', minHeight: '56px' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4a6bb8'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#5B7FCC'}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    Ver Estrategias Alternativas
                  </button>
                  
                  <button
                    onClick={async () => {
                      const userEmail = selectedPlanning.correo || localStorage.getItem('userEmail');
                      
                      const webhookPayload = {
                        'CENTRO EDUCATIVO': selectedPlanning.centroEducativo || '',
                        'DOCENTE': selectedPlanning.docente || '',
                        'MATERIA': selectedPlanning.materia || selectedPlanning.asignatura || '',
                        'TEMA DEL DÍA': selectedPlanning.tema || selectedPlanning.titulo || '',
                        'COMPETENCIA ESPECÍFICA': selectedPlanning.competenciaEspecifica || '',
                        'INDICADORES DE LOGRO': selectedPlanning.indicadoresLogro || '',
                        'ESTRATEGIA DE ENSEÑANZA': selectedPlanning.estrategiaEnsenanza || '',
                        'INTENCIÓN PEDAGÓGICA DEL DÍA': selectedPlanning.intencionPedagogica || '',
                        'ACTIVIDAD DE INICIO': selectedPlanning.actividadInicio || '',
                        'ACTIVIDAD DE DESARROLLO': selectedPlanning.actividadDesarrollo || '',
                        'ACTIVIDAD DE CIERRE': selectedPlanning.actividadCierre || '',
                        'RECURSOS DIDACTICOS': selectedPlanning.recursosDidacticos || '',
                        'CORREO': userEmail,
                        'APELLIDO': selectedPlanning.apellido || '',
                        'COMPETENCIA FUNDAMENTALES': selectedPlanning.competenciaFundamental || '',
                        'EJE TRANSVERSAL': selectedPlanning.ejeTransversal || '',
                        'VALAORES Y ACTITUDES': selectedPlanning.valoresYActitudes || '',
                        'GRADO': selectedPlanning.grado || '',
                        'UNIDAD': selectedPlanning.unidad || selectedPlanning.UNIDAD || '',
                        'FECHA DE CREACION': selectedPlanning.createdAt || '',
                        'INDICADOR_DE_LOGRO': ''
                      };
                      
                      try {
                        const response = await fetch('https://n8n.srv1144975.hstgr.cloud/webhook/a5de0afb-b2ae-4d46-8056-0f9bfefa282c', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify(webhookPayload),
                        });
                        
                        if (response.ok) {
                          console.log('✅ [WEBHOOK] Respuesta:', response.status);
                        }
                      } catch (error) {
                        console.error('❌ [WEBHOOK] Error:', error);
                      }
                      
                      setShowEstrategiaReviewDialog(false);
                      setSelectedPlanning(null);
                      sessionStorage.removeItem('incompletionReason');
                    }}
                    className="w-full px-8 py-4 sm:py-5 bg-white border-2 font-semibold text-base sm:text-lg rounded-xl transition-all active:scale-98"
                    style={{ 
                      borderColor: '#5B7FCC',
                      color: '#5B7FCC',
                      minHeight: '56px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#E8F0FE';
                      e.currentTarget.style.borderColor = '#4a6bb8';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.borderColor = '#5B7FCC';
                    }}
                  >
                    Mantener Estrategia Original
                  </button>
                </div>

                <button
                  onClick={() => {
                    setShowEstrategiaReviewDialog(false);
                    setSelectedPlanning(null);
                    sessionStorage.removeItem('incompletionReason');
                  }}
                  className="w-full mt-4 px-8 py-3 text-slate-600 hover:text-slate-800 font-semibold text-base transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading Screen */}
        {showLoadingScreen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #5B7FCC 0%, #4a6bb8 100%)' }}>
            <div className="max-w-md w-full text-center">
              <div className="mb-8 relative">
                <div className="w-32 h-32 mx-auto relative">
                  <div className="absolute inset-0 border-8 border-white/30 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
                  <div className="absolute inset-4 border-8 border-white/50 rounded-full animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-white animate-pulse" />
                  </div>
                </div>
              </div>

              <h2 className="text-3xl font-bold text-white mb-4">
                Generando Planificación de Refuerzo
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Estamos creando tu planificación personalizada...
              </p>

              <div className="flex justify-center gap-3">
                <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Success Screen */}
        {showSuccessScreen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>
            <div className="max-w-md w-full text-center animate-in zoom-in duration-500">
              <div className="mb-8">
                <div className="w-32 h-32 mx-auto bg-white rounded-full flex items-center justify-center shadow-2xl">
                  <CheckCircle className="w-20 h-20 text-green-500" strokeWidth={2.5} />
                </div>
              </div>

              <h2 className="text-4xl font-bold text-white mb-4">
                ¡Listo!
              </h2>
              <p className="text-2xl text-white/90">
                Planificación de refuerzo creada exitosamente
              </p>
            </div>
          </div>
        )}

        {/* Unit Selection Modal */}
        {showUnitListModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
              {/* Header - Azul #5B7FCC */}
              <div className="p-6 sm:p-8 flex items-center justify-between flex-shrink-0" style={{ backgroundColor: '#5B7FCC' }}>
                <div className="flex items-center gap-3">
                  <BookOpen className="w-7 h-7 sm:w-8 sm:h-8 text-white" strokeWidth={2} />
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    Selecciona una Secuencia
                  </h2>
                </div>
                <button
                  onClick={() => setShowUnitListModal(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                <p className="text-slate-600 text-sm sm:text-base mb-6">
                  Elige la secuencia didáctica para crear tu planificación diaria:
                </p>

                <div className="space-y-3">
                  {allUnits.map((unit, index) => (
                    <button
                      key={unit.id}
                      onClick={() => {
                        setSelectedUnit(unit);
                        setShowUnitListModal(false);
                        
                        if (selectedDate) {
                          sessionStorage.setItem('selectedPlanningDate', selectedDate.toISOString());
                        }
                        
                        onSelectUnit(unit);
                      }}
                      className="w-full text-left p-4 sm:p-5 bg-white hover:bg-blue-50 border-2 border-slate-200 hover:border-blue-400 rounded-xl sm:rounded-2xl transition-all duration-200 hover:shadow-lg group"
                      style={{ minHeight: '100px' }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded" style={{ backgroundColor: '#E8F0FE', color: '#5B7FCC' }}>
                              Secuencia {index + 1}
                            </span>
                          </div>
                          <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-700 transition-colors line-clamp-2">
                            {unit.name}
                          </h3>
                          <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-600">
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-4 h-4" />
                              {unit.subject}
                            </span>
                            <span>{unit.grade}</span>
                          </div>
                          <p className="mt-2 text-xs text-slate-500 line-clamp-2">
                            {unit.description}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <svg className="w-6 h-6 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 sm:p-8 bg-slate-50 border-t border-slate-200 flex-shrink-0">
                <button
                  onClick={() => setShowUnitListModal(false)}
                  className="w-full px-6 py-4 bg-white border-2 border-slate-300 text-slate-700 font-semibold text-base rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all active:scale-98"
                  style={{ minHeight: '48px' }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
