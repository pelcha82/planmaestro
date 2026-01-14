import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { User, Settings, LogOut, BookOpen, X, Edit, Trash2 } from "lucide-react";
import StatsCard from "../components/StatsCard";

interface WebhookResponse {
  id?: number;
  teacher_registration_id?: number | null;
  unit_planning_id?: number | null;
  response_data: any;
  created_at?: string;
  updated_at?: string;
  efemeride?: any;
}

interface Efemeride {
  date: string; // YYYY-MM-DD
  name: string;
  description: string;
}

export default function PlanningSummaryPage() {
  const navigate = useNavigate();
  const [responses, setResponses] = useState<WebhookResponse[]>([]);
  const [selectedResponse, setSelectedResponse] = useState<WebhookResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedEfemeride, setSelectedEfemeride] = useState<Efemeride | null>(null);
  const [showEfemerideDialog, setShowEfemerideDialog] = useState(false);
  const [pendingEfemeride, setPendingEfemeride] = useState<Efemeride | null>(null);
  const [pendingDate, setPendingDate] = useState<Date | null>(null);

  // Efemérides dominicanas
  const efemerides: Efemeride[] = [
    {
      date: '2025-11-06',
      name: 'Día de la Constitución',
      description: 'Conmemoración de la firma de la primera Constitución dominicana en San Cristóbal en 1844, que establece las bases del Estado de derecho.'
    },
    {
      date: '2026-01-06',
      name: 'Día de los Santos Reyes',
      description: 'Tradición cristiana y cultural que celebra la llegada de los Reyes Magos; en las escuelas marca el regreso a clases tras la pausa navideña.'
    },
    {
      date: '2026-01-26',
      name: 'Natalicio de Juan Pablo Duarte',
      description: 'Conmemoración del nacimiento del principal Padre de la Patria y fundador de la sociedad secreta La Trinitaria.'
    },
    {
      date: '2026-02-27',
      name: 'Independencia Nacional',
      description: 'Celebración del aniversario de la proclamación de la separación de Haití en 1844 y el nacimiento de la República Dominicana.'
    },
    {
      date: '2026-05-01',
      name: 'Día Internacional del Trabajo',
      description: 'Homenaje a la lucha histórica por los derechos laborales y la reivindicación de la jornada de trabajo digna.'
    }
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
    
    // Use UTC methods to avoid timezone issues
    const day = date.getUTCDate();
    const month = months[date.getUTCMonth()];
    const year = date.getUTCFullYear();
    
    return `${day} de ${month} de ${year}`;
  };

  // Parse date from createdAt string (ISO format)
  const parseDate = (dateString: string): Date | null => {
    if (!dateString) return null;
    
    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        // Use UTC methods for comparison to avoid timezone issues
        return date;
      }
      return null;
    } catch {
      return null;
    }
  };

  // Parse DD/MM/YYYY to ISO date
  const parseDDMMYYYYToISO = (dateString: string): string | null => {
    if (!dateString) return null;
    
    try {
      // Clean the string - remove quotes, spaces, and any other whitespace
      const cleanedString = dateString.trim().replace(/['"]/g, '');
      
      console.log(`🔍 Parseando fecha: original="${dateString}" → limpia="${cleanedString}"`);
      
      // Check if it's DD/MM/YYYY format
      const parts = cleanedString.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0].trim());
        const month = parseInt(parts[1].trim()) - 1; // Months are 0-indexed
        const year = parseInt(parts[2].trim());
        
        console.log(`📅 Componentes de fecha: día=${day}, mes=${month + 1}, año=${year}`);
        
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
          // Set time to midnight UTC to avoid timezone issues
          const date = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
          const isoString = date.toISOString();
          
          console.log(`✅ Fecha creada exitosamente: ${isoString} → será el día ${date.getUTCDate()}/${date.getUTCMonth() + 1}/${date.getUTCFullYear()}`);
          
          return isoString;
        } else {
          console.error(`❌ Componentes de fecha inválidos: día=${day}, mes=${month}, año=${year}`);
        }
      } else {
        console.error(`❌ Formato de fecha incorrecto. Se esperaba DD/MM/YYYY, se recibió: "${cleanedString}" con ${parts.length} partes`);
      }
      return null;
    } catch (error) {
      console.error(`❌ Error parseando fecha "${dateString}":`, error);
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
    let startingDayOfWeek = firstDay.getDay();
    
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
    const remainingCells = 42 - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false
      });
    }
    
    return days;
  };

  // Get plannings for a specific date
  const getPlanningsForDate = (date: Date | null): WebhookResponse[] => {
    if (!date) return [];
    
    // CRITICAL FIX: Use same timezone for both target and planning dates
    // Both must use UTC to avoid timezone comparison issues
    const targetDay = date.getDate();
    const targetMonth = date.getMonth();
    const targetYear = date.getFullYear();
    
    console.log(`🔍 [CALENDAR] Buscando planificaciones para: ${targetDay}/${targetMonth + 1}/${targetYear}`);
    
    const filtered = responses.filter(response => {
      const planningDate = parseDate(response.created_at || '');
      if (!planningDate) {
        return false;
      }
      
      // CRITICAL FIX: Use UTC for planning date (to match parseDDMMYYYYToISO which uses Date.UTC)
      const planningDay = planningDate.getUTCDate();
      const planningMonth = planningDate.getUTCMonth();
      const planningYear = planningDate.getUTCFullYear();
      
      const matches = (
        planningDay === targetDay &&
        planningMonth === targetMonth &&
        planningYear === targetYear
      );
      
      if (matches) {
        console.log(`✅ [MATCH] Planificación encontrada: ${planningDay}/${planningMonth + 1}/${planningYear} para ${response.response_data?.unidad || 'Sin nombre'}`);
      }
      
      return matches;
    });
    
    console.log(`📊 [CALENDAR] Total de planificaciones encontradas para ${targetDay}/${targetMonth + 1}/${targetYear}: ${filtered.length}`);
    
    return filtered;
  };

  // Get efeméride for a specific date
  const getEfemerideForDate = (date: Date | null): Efemeride | null => {
    if (!date) return null;
    
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const found = efemerides.find(e => e.date === dateStr) || null;
    
    if (found) {
      console.log('✨ [EFEMÉRIDE] Encontrada para fecha:', dateStr, '→', found.name);
    }
    
    return found;
  };

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  // Load plannings on mount
  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      loadPlanningsFromWebhook(userEmail, true);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const loadPlanningsFromWebhook = async (userEmail: string, showLoader: boolean = false) => {
    if (showLoader) {
      setIsLoading(true);
    }
    setError("");
    
    try {
      console.log('🔵 [FRONTEND] Solicitando planificaciones EN VIVO para:', userEmail);

      const response = await fetch('/api/get-plannings-by-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ correo: userEmail }),
      });

      console.log('✅ [FRONTEND] Respuesta de API:', response.status);

      if (!response.ok) {
        throw new Error('Error al obtener planificaciones');
      }

      const result = await response.json();
      console.log('📦 [FRONTEND] Datos EN VIVO recibidos del webhook');

      if (!result.success) {
        throw new Error(result.error || 'Error al obtener planificaciones');
      }

      const planningsArray = Array.isArray(result.data) ? result.data : [];

      console.log('📊 [DEBUG] Total de planificaciones del webhook:', planningsArray.length);
      
      // Transform webhook data to match WebhookResponse interface
      // Create one entry per date in the dates array so the planning appears on all days
      const transformedResponses: WebhookResponse[] = [];
      
      planningsArray.forEach((item: any, index: number) => {
        // 🔍 DEBUG: Log all fields received from webhook for this planning
        console.log(`\n📋 [PLANNING ${index + 1}] TODOS LOS CAMPOS DEL WEBHOOK:`);
        console.log(JSON.stringify(item, null, 2));
        
        // Extract dates from webhook (could be 'dates', 'DATES', 'FECHAS', 'Fecha de creacion', etc.)
        let datesRaw = item.dates || item.DATES || item.FECHAS || item.fechas || 
                       item['Fecha de creacion'] || item['FECHA DE CREACION'] ||
                       item['fecha de creacion'] || item['Fecha de Creacion'] || null;
        
        console.log(`📅 [PLANNING ${index + 1}] Campo de fechas extraído:`, {
          datesRaw,
          tipo: typeof datesRaw,
          esArray: Array.isArray(datesRaw)
        });
        
        // Parse if it's a JSON string
        let datesArray: string[] = [];
        if (typeof datesRaw === 'string') {
          try {
            datesArray = JSON.parse(datesRaw);
            console.log(`📅 [PLANNING ${index + 1}] Fechas parseadas desde string JSON:`, datesArray);
          } catch (e) {
            console.error(`❌ [PLANNING ${index + 1}] Error parseando fechas:`, e);
            datesArray = [];
          }
        } else if (Array.isArray(datesRaw)) {
          datesArray = datesRaw;
        }
        
        console.log(`📅 [PLANNING ${index + 1}] Procesando planificación:`, {
          datesArray,
          totalDates: datesArray.length,
          unidad: item.unidad || item.UNIDAD || 'Sin unidad'
        });
        
        if (Array.isArray(datesArray) && datesArray.length > 0) {
          console.log(`📋 Array de fechas recibido:`, datesArray);
          console.log(`📋 Tipo de cada elemento:`, datesArray.map(d => typeof d));
          
          // Extract efeméride field from webhook
          const efemeride = item['efemeride'] || item['EFEMERIDE'] || null;
          
          // Create one entry per date so the same planning appears on each day
          datesArray.forEach((dateStr: string, idx: number) => {
            console.log(`\n🔄 [FECHA ${idx + 1}/${datesArray.length}] Procesando: "${dateStr}"`);
            
            // Parse DD/MM/YYYY to ISO date - treat each quoted date as individual
            const parsedDate = parseDDMMYYYYToISO(dateStr);
            
            if (!parsedDate) {
              console.error(`❌ ERROR: No se pudo parsear la fecha "${dateStr}"`);
            } else {
              const testDate = new Date(parsedDate);
              console.log(`✅ ÉXITO: Fecha "${dateStr}" convertida a ${testDate.toUTCString()}`);
            }
            
            transformedResponses.push({
              id: transformedResponses.length,
              teacher_registration_id: null,
              unit_planning_id: null,
              response_data: {
                ...item,
                planningDate: dateStr,
                allDates: datesArray
              },
              created_at: parsedDate || new Date().toISOString(),
              updated_at: item.updated_at || new Date().toISOString(),
              efemeride: efemeride
            });
          });
          
          console.log(`✅ Planificación duplicada en ${datesArray.length} fechas`);
          console.log(`📊 Todas las entradas creadas:`, transformedResponses.map(r => ({
            created_at: r.created_at,
            planningDate: r.response_data?.planningDate,
            unidad: r.response_data?.unidad
          })));
        } else {
          // Fallback: if no dates array, try to use single date field
          const fechaCreacion = item['Fecha de creacion'] || 
                               item['FECHA DE CREACION'] || 
                               item['fecha de creacion'] ||
                               item['Fecha de Creacion'] ||
                               item.created_at ||
                               '';
          
          console.warn(`⚠️ [PLANNING ${index + 1}] No se encontró array de fechas, usando fecha única:`, fechaCreacion);
          
          const parsedDate = fechaCreacion ? parseDDMMYYYYToISO(fechaCreacion) : null;
          
          const efemeride = item['efemeride'] || item['EFEMERIDE'] || null;
          
          transformedResponses.push({
            id: transformedResponses.length,
            teacher_registration_id: null,
            unit_planning_id: null,
            response_data: item,
            created_at: parsedDate || item.created_at || new Date().toISOString(),
            updated_at: item.updated_at || new Date().toISOString(),
            efemeride: efemeride
          });
        }
      });

      console.log('📋 [DEBUG] Unidades recibidas:', transformedResponses.map(r => r.response_data?.unidad || 'SIN UNIDAD'));

      const allPlannings = transformedResponses.map((resp, idx) => ({
        ...resp,
        id: idx
      }));

      console.log('🎯 [DEBUG] Total de planificaciones a mostrar:', allPlannings.length);

      // Sort by created_at in descending order (newest first)
      const sortedResponses = allPlannings.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });

      setResponses(sortedResponses);
      setError("");
      console.log('🚀 [FRONTEND] UI actualizada con', sortedResponses.length, 'planificaciones EN VIVO');
    } catch (err) {
      if (showLoader) {
        console.error('❌ [FRONTEND] Error al cargar planificaciones:', err);
        setError(err instanceof Error ? err.message : 'Error al obtener planificaciones');
      }
    } finally {
      if (showLoader) {
        setIsLoading(false);
      }
    }
  };

  const handlePlanningClick = (response: WebhookResponse) => {
    setSelectedResponse(response);
  };

  const handleDateClick = (date: Date) => {
    if (!date) return;
    
    console.log('🖱️ [CLICK] Fecha clickeada:', date.toISOString().split('T')[0]);
    
    // If clicking on a day with existing planning, show it
    const planningsForDate = getPlanningsForDate(date);
    if (planningsForDate.length > 0) {
      console.log('📋 [CLICK] Mostrando planificación existente');
      handlePlanningClick(planningsForDate[0]);
      return;
    }

    // CLEAR previous efeméride data when starting a new selection
    if (!startDate && !endDate) {
      console.log('🧹 [CLICK] Limpiando efemérides anteriores');
      sessionStorage.removeItem('selectedEfemeride');
      sessionStorage.removeItem('efemeridesInRange');
    }

    // Check for efeméride first - ask user if they want to include it
    const efemeride = getEfemerideForDate(date);
    console.log('🔍 [CLICK] Verificando efeméride:', efemeride ? `✅ ${efemeride.name}` : '❌ No encontrada');
    
    if (efemeride) {
      console.log('✨ [CLICK] Mostrando diálogo de efeméride');
      setPendingEfemeride(efemeride);
      setPendingDate(date);
      setShowEfemerideDialog(true);
      return;
    }

    // Check if it's a weekend day (Saturday = 6, Sunday = 0)
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Block planning creation on weekends
    if (isWeekend) {
      alert('Las planificaciones solo se pueden crear de lunes a viernes.');
      return;
    }

    // Otherwise, handle date selection for new planning
    if (!startDate) {
      // First click - set start date
      setStartDate(date);
      setEndDate(null);
    } else if (!endDate) {
      // Second click - set end date
      if (date < startDate) {
        // If end date is before start date, swap them
        setEndDate(startDate);
        setStartDate(date);
      } else {
        setEndDate(date);
      }
    } else {
      // Both dates already selected - start over
      setStartDate(date);
      setEndDate(null);
    }
  };

  const isDateInRange = (date: Date): boolean => {
    if (!startDate || !endDate) return false;
    return date >= startDate && date <= endDate;
  };

  const isDateSelected = (date: Date): boolean => {
    if (!date) return false;
    
    if (startDate && date.getTime() === startDate.getTime()) return true;
    if (endDate && date.getTime() === endDate.getTime()) return true;
    
    return false;
  };

  // Check for efemérides in date range
  const getEfemeridesInRange = (start: Date, end: Date): Efemeride[] => {
    const efemeridesFound: Efemeride[] = [];
    const current = new Date(start);
    
    while (current <= end) {
      const efemeride = getEfemerideForDate(current);
      if (efemeride) {
        efemeridesFound.push(efemeride);
      }
      current.setDate(current.getDate() + 1);
    }
    
    return efemeridesFound;
  };

  // Navigate to unit creation form when both dates are selected
  useEffect(() => {
    if (startDate && endDate) {
      // Check if there are efemérides in the selected range
      const efemeridesInRange = getEfemeridesInRange(startDate, endDate);
      
      console.log('📅 Rango seleccionado:', { startDate, endDate });
      console.log('✨ Efemérides encontradas en rango:', efemeridesInRange);
      
      if (efemeridesInRange.length > 0) {
        // Show dialog with all efemérides found
        setPendingEfemeride(efemeridesInRange[0]); // Show first one, but store all
        sessionStorage.setItem('efemeridesInRange', JSON.stringify(efemeridesInRange));
        setShowEfemerideDialog(true);
        return;
      }
      
      // Store dates in YYYY-MM-DD format to avoid timezone issues
      const startDateStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
      const endDateStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
      
      sessionStorage.setItem('unitPlanningStartDate', startDateStr);
      sessionStorage.setItem('unitPlanningEndDate', endDateStr);
      
      console.log('📅 Guardando fechas en sessionStorage:', { startDateStr, endDateStr });
      
      // Navigate to unit creation form after a short delay to show selection
      setTimeout(() => {
        navigate(responses.length === 0 ? '/configuracion-inicial' : '/create/unit');
      }, 800);
    }
  }, [startDate, endDate, navigate, responses.length]);

  // Create unique ID by combining email, sequence, theme, and date
  const createUniqueId = (response: WebhookResponse): string => {
    const correo = response.response_data?.correo || 
                   response.response_data?.Correo || 
                   response.response_data?.CORREO || 
                   localStorage.getItem('userEmail') || 
                   'unknown';
    
    const secuencia = response.response_data?.unidad || 
                      response.response_data?.UNIDAD || 
                      response.response_data?.Unidad || 
                      `planning-${response.id}`;
    
    const tema = response.response_data?.asignatura || 
                 response.response_data?.ASIGNATURA || 
                 response.response_data?.Asignatura || 
                 'sin-tema';
    
    const allDates = response.response_data?.allDates;
    let fecha = '';
    
    // If we have dates array, use the first date
    if (Array.isArray(allDates) && allDates.length > 0) {
      fecha = allDates[0].replace(/\//g, '-'); // Convert 05/01/2026 to 05-01-2026
    } 
    // Fallback: use created_at date
    else if (response.created_at) {
      const date = new Date(response.created_at);
      fecha = `${String(date.getUTCDate()).padStart(2, '0')}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${date.getUTCFullYear()}`;
    }
    // Last resort
    else {
      fecha = `unknown-${response.id}`;
    }
    
    // Clean strings for URL safety
    const cleanCorreo = correo.replace(/[@.]/g, '-');
    const cleanSecuencia = secuencia.replace(/[/:]/g, '-').replace(/\s+/g, '-');
    const cleanTema = tema.replace(/\s+/g, '-');
    
    // Build unique ID: correo_secuencia_tema_fecha
    return `${cleanCorreo}_${cleanSecuencia}_${cleanTema}_${fecha}`;
  };

  const navigateToDetails = (response: WebhookResponse) => {
    sessionStorage.setItem('selectedPlanning', JSON.stringify(response));
    const uniqueId = createUniqueId(response);
    navigate(`/ver-planificacion-unidad/${encodeURIComponent(uniqueId)}`);
  };

  const handleEdit = (response: WebhookResponse) => {
    sessionStorage.setItem('selectedPlanning', JSON.stringify(response));
    const uniqueId = createUniqueId(response);
    navigate(`/editar-planificacion-unidad/${encodeURIComponent(uniqueId)}`);
  };

  const handleDelete = (response: WebhookResponse) => {
    // Store the planning data in sessionStorage for the delete page
    const planningData = {
      correo: localStorage.getItem('userEmail') || '',
      unidad: response.response_data?.unidad || '',
      ...response.response_data
    };
    
    console.log('🗑️ [DELETE] Guardando datos en sessionStorage:', planningData);
    sessionStorage.setItem('unitPlanningToDelete', JSON.stringify(planningData));
    
    // Verify it was saved
    const saved = sessionStorage.getItem('unitPlanningToDelete');
    console.log('✅ [DELETE] Verificando datos guardados:', saved ? 'OK' : 'FALLO');
    
    const uniqueId = createUniqueId(response);
    navigate(`/eliminar-planificacion-unidad/${encodeURIComponent(uniqueId)}`, {
      state: { 
        response: response,
        returnPath: '/resumen-planificacion'
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 text-slate-600">Cargando planificaciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Error</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all duration-200"
          >
            Actualizar
          </button>
        </div>
      </div>
    );
  }

  const calendarDays = getCalendarDays();
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const dayNamesShort = ['Lu', 'Ma', 'Mi', 'Jue', 'Vi']; // Solo días laborables

  return (
    <div className="min-h-screen" style={{ background: '#FF9A76' }}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between mb-4 sm:mb-8">
          {/* Back Link */}
          <button
            onClick={() => navigate('/')}
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

        {/* Title */}
        <div className="mb-4 sm:mb-6 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
            Planificaciones por Unidad
          </h1>
          <p className="text-white/80 mt-2 text-sm sm:text-base">
            Vista de calendario
          </p>
        </div>

        {/* Stats Card */}
        <div className="mb-3 sm:mb-4 flex justify-center">
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

          {/* Calendar Grid - Solo lunes a viernes */}
          <div className="grid grid-cols-5 gap-2 sm:gap-4">
            {/* Day Names Header */}
            {dayNamesShort.map(day => (
              <div key={day} className="text-center py-1">
                <span className="text-white/70 text-xs sm:text-sm md:text-base font-medium">{day}</span>
              </div>
            ))}
            
            {/* Calendar Days - Filter out weekends */}
            {calendarDays.filter(dayObj => {
              const dayOfWeek = dayObj.date ? dayObj.date.getDay() : -1;
              return dayOfWeek !== 0 && dayOfWeek !== 6; // Exclude Saturday (6) and Sunday (0)
            }).map((dayObj, index) => {
              const { date, isCurrentMonth } = dayObj;
              const planningsForDate = getPlanningsForDate(date);
              const hasPlanning = planningsForDate.length > 0;
              const hasPlanningWithEfemeride = planningsForDate.some(p => p.efemeride && p.efemeride !== null);
              const efemeride = getEfemerideForDate(date);
              const hasEfemeride = efemeride !== null;
              
              // Check if it's a weekend (Saturday = 6, Sunday = 0)
              const dayOfWeek = date ? date.getDay() : -1;
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
              
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              
              const isToday = date && 
                date.getDate() === today.getDate() &&
                date.getMonth() === today.getMonth() &&
                date.getFullYear() === today.getFullYear();
              
              const selected = date ? isDateSelected(date) : false;
              const inRange = date ? isDateInRange(date) : false;
              const isStart = date && startDate && date.getTime() === startDate.getTime();
              const isEnd = date && endDate && date.getTime() === endDate.getTime();
              
              return (
                <div
                  key={index}
                  onClick={() => {
                    if (date) {
                      handleDateClick(date);
                    }
                  }}
                  className={`
                    aspect-square flex items-center justify-center rounded-lg sm:rounded-2xl text-base sm:text-xl md:text-2xl font-bold transition-all
                    ${!isCurrentMonth && !selected && !inRange && !hasPlanning && !hasEfemeride ? 'bg-white/40 text-white/60' : ''}
                    ${isCurrentMonth && !hasPlanning && !selected && !inRange && !isWeekend && !hasEfemeride ? 'bg-white/90 text-[#5B7FCC] hover:bg-white cursor-pointer' : ''}
                    ${!isCurrentMonth && !hasPlanning && !selected && !inRange && !isWeekend && !hasEfemeride ? 'bg-white/50 text-white/70 hover:bg-white/60 cursor-pointer' : ''}
                    ${isWeekend && !hasPlanning && !selected && !inRange && !hasEfemeride ? 'bg-gray-300 text-gray-500 opacity-50 cursor-not-allowed' : ''}
                    ${hasPlanning && hasPlanningWithEfemeride ? 'bg-amber-500 text-white cursor-pointer active:scale-95 sm:hover:scale-105 sm:hover:shadow-xl sm:hover:bg-amber-600 border-2 border-white' : ''}
                    ${hasPlanning && !hasPlanningWithEfemeride ? 'bg-green-500 text-white cursor-pointer active:scale-95 sm:hover:scale-105 sm:hover:shadow-xl sm:hover:bg-green-600 border-2 border-white' : ''}
                    ${hasEfemeride && !hasPlanning ? 'bg-amber-400 text-white cursor-pointer active:scale-95 sm:hover:scale-105 sm:hover:shadow-xl sm:hover:bg-amber-500 border-2 border-white' : ''}
                    ${selected && !hasPlanning && !hasEfemeride ? 'bg-green-400 text-white cursor-pointer ring-4 ring-green-300' : ''}
                    ${inRange && !hasPlanning && !selected && !hasEfemeride ? 'bg-green-200 text-green-800 cursor-pointer' : ''}
                    ${isToday && !selected ? 'ring-[3px] sm:ring-[4px]' : ''}
                    ${hasPlanning || hasEfemeride ? 'relative overflow-hidden' : ''}
                  `}
                  style={isToday && !selected ? { '--tw-ring-color': '#FF9A76' } as React.CSSProperties : undefined}
                >
                  {hasPlanning ? (
                    <div className="w-full h-full flex flex-col items-center justify-center p-1 sm:p-2 relative">
                      <span className="text-xl sm:text-2xl md:text-3xl font-bold leading-none mb-1 text-white">{date ? date.getDate() : ''}</span>
                      <div className="text-xs sm:text-sm md:text-base leading-tight text-center line-clamp-2 font-semibold px-1 text-white">
                        {(() => {
                          const fullName = planningsForDate[0]?.response_data?.unidad || 'Unidad';
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
                    <div className="relative w-full h-full flex flex-col items-center justify-center">
                      <span className="relative z-10 text-lg sm:text-xl md:text-2xl font-bold">{date ? date.getDate() : ''}</span>
                      {selected && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider">
                            {isStart ? 'INICIO' : isEnd ? 'FIN' : ''}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Instructions and Date Selection Info */}
          <div className="mt-6 sm:mt-8">
            {!startDate && !endDate && (
              <div className="bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 border-2 border-white/30">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-white flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-white">
                    <p className="font-bold text-base sm:text-lg mb-1">Para crear una nueva planificación:</p>
                    <p className="text-sm sm:text-base opacity-90">1. Selecciona la <span className="font-bold">fecha de inicio</span></p>
                    <p className="text-sm sm:text-base opacity-90">2. Navega entre meses si necesitas seleccionar fechas en otro mes</p>
                    <p className="text-sm sm:text-base opacity-90">3. Selecciona la <span className="font-bold">fecha de fin</span></p>
                    <p className="text-sm sm:text-base opacity-90">4. Serás dirigido al formulario automáticamente</p>
                  </div>
                </div>
              </div>
            )}

            {startDate && !endDate && (
              <div className="bg-green-400 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 border-2 border-green-500 shadow-lg">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-green-900 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-green-900">
                    <p className="font-bold text-base sm:text-lg">Fecha de inicio seleccionada:</p>
                    <p className="text-sm sm:text-base">{formatSpanishDate(startDate.toISOString())}</p>
                    <p className="text-sm sm:text-base mt-2 font-semibold">Ahora selecciona la fecha de fin</p>
                  </div>
                </div>
              </div>
            )}

            {startDate && endDate && (
              <div className="bg-green-500 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 border-2 border-green-600 shadow-lg animate-pulse">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-white">
                    <p className="font-bold text-base sm:text-lg">¡Fechas seleccionadas!</p>
                    <p className="text-sm sm:text-base">Inicio: {formatSpanishDate(startDate.toISOString())}</p>
                    <p className="text-sm sm:text-base">Fin: {formatSpanishDate(endDate.toISOString())}</p>
                    <p className="text-sm sm:text-base mt-2 font-semibold">Redirigiendo al formulario...</p>
                  </div>
                </div>
              </div>
            )}

            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate(null);
                  setEndDate(null);
                }}
                className="w-full px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-semibold text-sm sm:text-base rounded-xl sm:rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 backdrop-blur-sm border-2 border-white/30"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Cancelar selección</span>
              </button>
            )}
          </div>
        </div>

        {/* Efeméride Planning Dialog */}
        {showEfemerideDialog && pendingEfemeride && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden">
              {/* Dialog Header */}
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <h2 className="text-2xl font-bold text-white">
                    Efeméride Dominicana
                  </h2>
                </div>
                <p className="text-white/90 text-sm">
                  {pendingEfemeride.name}
                </p>
              </div>

              {/* Dialog Content */}
              <div className="p-6">
                <p className="text-slate-700 text-base leading-relaxed mb-6">
                  {pendingEfemeride.description}
                </p>
                
                {(() => {
                  // Check if there are multiple efemérides in range
                  const efemeridesRangeStr = sessionStorage.getItem('efemeridesInRange');
                  let efemeridesCount = 1;
                  
                  if (efemeridesRangeStr) {
                    try {
                      const efemeridesArray = JSON.parse(efemeridesRangeStr);
                      if (Array.isArray(efemeridesArray)) {
                        efemeridesCount = efemeridesArray.length;
                      }
                    } catch (e) {
                      // ignore parsing errors
                    }
                  }
                  
                  if (efemeridesCount > 1) {
                    return (
                      <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 mb-4">
                        <p className="text-amber-900 font-semibold text-sm flex items-center gap-2">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          Se encontraron {efemeridesCount} efemérides en el rango seleccionado
                        </p>
                      </div>
                    );
                  }
                  return null;
                })()}
                
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
                  <p className="text-blue-900 font-semibold text-sm">
                    ¿Deseas incluir {(() => {
                      const efemeridesRangeStr = sessionStorage.getItem('efemeridesInRange');
                      try {
                        const efemeridesArray = JSON.parse(efemeridesRangeStr || '[]');
                        return efemeridesArray.length > 1 ? 'estas efemérides' : 'esta efeméride';
                      } catch {
                        return 'esta efeméride';
                      }
                    })()} en tu planificación por unidad?
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      // User wants to include efeméride(s)
                      const efemeridesRangeStr = sessionStorage.getItem('efemeridesInRange');
                      
                      // Store for use in form
                      if (efemeridesRangeStr) {
                        // Multiple efemérides from range
                        sessionStorage.setItem('selectedEfemeride', efemeridesRangeStr);
                      } else {
                        // Single efeméride
                        sessionStorage.setItem('selectedEfemeride', JSON.stringify(pendingEfemeride));
                      }
                      
                      setShowEfemerideDialog(false);
                      
                      // If this was triggered by range completion, navigate to form
                      if (startDate && endDate) {
                        const startDateStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
                        const endDateStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
                        
                        sessionStorage.setItem('unitPlanningStartDate', startDateStr);
                        sessionStorage.setItem('unitPlanningEndDate', endDateStr);
                        
                        console.log('📅 Guardando fechas con efeméride incluida');
                        
                        setTimeout(() => {
                          navigate(responses.length === 0 ? '/configuracion-inicial' : '/create/unit');
                        }, 800);
                      }
                      // Otherwise continue with date selection flow
                      else {
                        if (!startDate) {
                          setStartDate(pendingDate);
                          setEndDate(null);
                        } else if (!endDate) {
                          if (pendingDate && pendingDate < startDate) {
                            setEndDate(startDate);
                            setStartDate(pendingDate);
                          } else {
                            setEndDate(pendingDate);
                          }
                        } else {
                          setStartDate(pendingDate);
                          setEndDate(null);
                        }
                      }
                    }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl"
                  >
                    Sí, incluir {(() => {
                      const efemeridesRangeStr = sessionStorage.getItem('efemeridesInRange');
                      try {
                        const efemeridesArray = JSON.parse(efemeridesRangeStr || '[]');
                        return efemeridesArray.length > 1 ? 'efemérides' : 'efeméride';
                      } catch {
                        return 'efeméride';
                      }
                    })()}
                  </button>
                  <button
                    onClick={() => {
                      // User doesn't want efeméride(s), just regular planning
                      sessionStorage.removeItem('selectedEfemeride');
                      sessionStorage.removeItem('efemeridesInRange');
                      setShowEfemerideDialog(false);
                      
                      // If this was triggered by range completion, navigate to form
                      if (startDate && endDate) {
                        const startDateStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
                        const endDateStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
                        
                        sessionStorage.setItem('unitPlanningStartDate', startDateStr);
                        sessionStorage.setItem('unitPlanningEndDate', endDateStr);
                        
                        console.log('📅 Guardando fechas SIN efeméride');
                        
                        setTimeout(() => {
                          navigate(responses.length === 0 ? '/configuracion-inicial' : '/create/unit');
                        }, 800);
                      }
                      // Otherwise continue with date selection flow
                      else {
                        if (!startDate) {
                          setStartDate(pendingDate);
                          setEndDate(null);
                        } else if (!endDate) {
                          if (pendingDate && pendingDate < startDate) {
                            setEndDate(startDate);
                            setStartDate(pendingDate);
                          } else {
                            setEndDate(pendingDate);
                          }
                        } else {
                          setStartDate(pendingDate);
                          setEndDate(null);
                        }
                      }
                    }}
                    className="flex-1 px-6 py-3 bg-white border-2 border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all"
                  >
                    No, planificar normal
                  </button>
                </div>

                <button
                  onClick={() => {
                    setShowEfemerideDialog(false);
                    setPendingEfemeride(null);
                    setPendingDate(null);
                    sessionStorage.removeItem('efemeridesInRange');
                    
                    // If we were in the middle of range selection, reset the range
                    if (startDate && endDate) {
                      setStartDate(null);
                      setEndDate(null);
                    }
                  }}
                  className="w-full mt-3 px-6 py-2.5 text-slate-500 hover:text-slate-700 font-medium text-sm transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Efeméride Card */}
        {selectedEfemeride && (
          <div className="mt-4 sm:mt-8 animate-in fade-in slide-in-from-bottom duration-300">
            <div 
              className="rounded-2xl sm:rounded-[32px] p-5 sm:p-8 relative"
              style={{ backgroundColor: '#5B7FCC' }}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedEfemeride(null)}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors z-10"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </button>

              {/* Card Content */}
              <div>
                {/* EFEMÉRIDE Section */}
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

                {/* Sparkle decoration */}
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
        {selectedResponse && !selectedEfemeride && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div 
              className="rounded-2xl sm:rounded-[32px] p-5 sm:p-8 relative max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              style={{ backgroundColor: '#5B7FCC' }}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedResponse(null)}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors z-10"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </button>

              {/* Card Content - Clickable */}
              <div 
                onClick={() => navigateToDetails(selectedResponse)}
                className="cursor-pointer"
              >
                {/* ASIGNATURA Section */}
                <div className="mb-4 sm:mb-6">
                  <div className="text-xs font-bold uppercase tracking-widest text-white/80 mb-2 sm:mb-3">
                    ASIGNATURA
                  </div>
                  <div className="inline-flex items-center gap-2 sm:gap-3 px-3 py-2 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl" style={{ backgroundColor: '#3B5998' }}>
                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    <span className="text-white font-bold text-sm sm:text-base md:text-lg">
                      {selectedResponse.response_data?.asignatura || 'Sin asignatura'}
                    </span>
                  </div>
                </div>

                {/* UNIDAD Section */}
                <div className="mb-4 sm:mb-6">
                  <div className="text-xs font-bold uppercase tracking-widest text-white/80 mb-2 sm:mb-3">
                    UNIDAD
                  </div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight">
                    {selectedResponse.response_data?.unidad || 'Sin nombre'}
                  </h2>
                </div>

                {/* GRADO Section */}
                {selectedResponse.response_data?.grado && (
                  <div className="mb-4 sm:mb-6">
                    <div className="text-xs font-bold uppercase tracking-widest text-white/80 mb-2 sm:mb-3">
                      GRADO
                    </div>
                    <div className="text-white font-semibold text-base sm:text-lg">
                      {selectedResponse.response_data.grado}
                    </div>
                  </div>
                )}

                {/* PERÍODO COMPLETO Section - Show all dates if available */}
                {selectedResponse.response_data?.allDates && Array.isArray(selectedResponse.response_data.allDates) && selectedResponse.response_data.allDates.length > 1 && (
                  <div className="mb-4 sm:mb-6">
                    <div className="text-xs font-bold uppercase tracking-widest text-white/80 mb-2 sm:mb-3">
                      PERÍODO COMPLETO DE LA UNIDAD
                    </div>
                    <div className="text-white/90 text-sm sm:text-base">
                      <span className="font-semibold">
                        {selectedResponse.response_data.allDates[0]} - {selectedResponse.response_data.allDates[selectedResponse.response_data.allDates.length - 1]}
                      </span>
                      <span className="ml-2 text-white/70">
                        ({selectedResponse.response_data.allDates.length} días)
                      </span>
                    </div>
                  </div>
                )}

                {/* FECHA DE CREACIÓN Section */}
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
                      {formatSpanishDate(selectedResponse.created_at || '')}
                    </span>
                  </div>
                </div>

                {/* Sparkle decoration */}
                <div className="absolute bottom-5 right-5 sm:bottom-8 sm:right-8 opacity-30">
                  <svg className="w-8 h-8 sm:w-12 sm:h-12" viewBox="0 0 48 48" fill="none">
                    <path d="M24 0L26.4 21.6L24 48L21.6 21.6L24 0Z" fill="white"/>
                    <path d="M0 24L21.6 26.4L48 24L21.6 21.6L0 24Z" fill="white"/>
                  </svg>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 sm:mt-6 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateToDetails(selectedResponse);
                  }}
                  className="flex-1 px-3 py-2 sm:px-4 sm:py-2.5 bg-white text-[#5B7FCC] font-bold text-sm sm:text-base rounded-lg sm:rounded-xl hover:bg-gray-100 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-1.5 sm:gap-2"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>Ver</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(selectedResponse);
                  }}
                  className="flex-1 px-3 py-2 sm:px-4 sm:py-2.5 bg-purple-600 text-white font-bold text-sm sm:text-base rounded-lg sm:rounded-xl hover:bg-purple-700 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-1.5 sm:gap-2"
                >
                  <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Modificar</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(selectedResponse);
                  }}
                  className="flex-1 px-3 py-2 sm:px-4 sm:py-2.5 bg-red-600 text-white font-bold text-sm sm:text-base rounded-lg sm:rounded-xl hover:bg-red-700 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-1.5 sm:gap-2"
                >
                  <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
