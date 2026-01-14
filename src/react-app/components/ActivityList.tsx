import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { User, Settings, LogOut, ArrowRight } from "lucide-react";

interface Activity {
  id: string;
  name: string;
  description: string;
  duration: string;
  icon: string;
  originalName: string; // The original activity name from webhook to send to detail endpoint
}

interface ActivityListProps {
  unitName: string;
  unitSubject: string;
  unitGrade: string;
}

export default function ActivityList({ unitName, unitSubject, unitGrade }: ActivityListProps) {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) {
          setError('No se encontró el correo del usuario');
          setIsLoading(false);
          return;
        }

        console.log('📚 [ACTIVITIES] Solicitando actividades al webhook');
        console.log('  - Usuario:', userEmail);
        console.log('  - Unidad seleccionada:', unitName);

        const requestBody = {
          correo: userEmail,
          unit_name: unitName,
          asignatura: unitSubject,
          grado: unitGrade
        };
        
        console.log('📤 [ACTIVITIES] Enviando al backend:', requestBody);
        console.log('  - Asignatura incluida:', unitSubject);
        console.log('  - Grado incluido:', unitGrade);

        const response = await fetch('/api/get-daily-activities', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        console.log('📥 [ACTIVITIES] Respuesta del backend:', response.status, response.statusText);

        if (!response.ok) {
          throw new Error('Error al obtener las actividades');
        }

        const data = await response.json();
        console.log('✅ [ACTIVITIES] Actividades recibidas del webhook:', data.data?.length || 0);
        console.log('📋 [ACTIVITIES] Datos completos:', data);

        if (data.success && data.data) {
          console.log('📊 [ACTIVITIES] Procesando respuesta del webhook');
          console.log('📊 [ACTIVITIES] Tipo de data:', Array.isArray(data.data) ? 'Array' : typeof data.data);
          console.log('📊 [ACTIVITIES] Total de elementos recibidos:', data.data.length);
          
          // Map the webhook response to our Activity interface
          const mappedActivities: Activity[] = data.data.map((item: any, index: number) => {
            // Log the raw structure of each activity item
            console.log(`🔍 [ACTIVITY ${index + 1}] ==========================================`);
            console.log(`🔍 [ACTIVITY ${index + 1}] Estructura completa:`, JSON.stringify(item, null, 2));
            console.log(`🔍 [ACTIVITY ${index + 1}] Campos disponibles:`, Object.keys(item));
            
            // Default icons based on activity type or index
            const defaultIcons = ['📚', '👨‍🏫', '💭', '🎨', '🎭', '📝', '✏️', '🔍', '🎯', '💡'];
            
            // IMPORTANT: Extract activity name from "ACTIVIDADES" field
            // Format received: "Actividad 2: Presentaciones, preguntas y respuestas."
            let activityName = '';
            
            // Try "ACTIVIDADES" field first (this is where the data comes from)
            if (item['ACTIVIDADES']) {
              activityName = item['ACTIVIDADES'];
              console.log(`✅ [ACTIVITY ${index + 1}] Nombre encontrado en "ACTIVIDADES":`, activityName);
            }
            else if (item['actividades']) {
              activityName = item['actividades'];
              console.log(`✅ [ACTIVITY ${index + 1}] Nombre encontrado en "actividades":`, activityName);
            }
            // Try "TEMA DEL DÍA" as fallback
            else if (item['TEMA DEL DÍA']) {
              activityName = item['TEMA DEL DÍA'];
              console.log(`✅ [ACTIVITY ${index + 1}] Nombre encontrado en "TEMA DEL DÍA":`, activityName);
            }
            else if (item['TEMA_DEL_DIA']) {
              activityName = item['TEMA_DEL_DIA'];
              console.log(`✅ [ACTIVITY ${index + 1}] Nombre encontrado en "TEMA_DEL_DIA":`, activityName);
            }
            else if (item['tema_del_dia']) {
              activityName = item['tema_del_dia'];
              console.log(`✅ [ACTIVITY ${index + 1}] Nombre encontrado en "tema_del_dia":`, activityName);
            }
            else if (item['TEMA DEL DIA']) {
              activityName = item['TEMA DEL DIA'];
              console.log(`✅ [ACTIVITY ${index + 1}] Nombre encontrado en "TEMA DEL DIA":`, activityName);
            }
            else if (item.tema) {
              activityName = item.tema;
              console.log(`⚠️ [ACTIVITY ${index + 1}] Nombre encontrado en "tema":`, activityName);
            }
            else if (item.nombre) {
              activityName = item.nombre;
              console.log(`⚠️ [ACTIVITY ${index + 1}] Nombre encontrado en "nombre":`, activityName);
            }
            else if (item.titulo) {
              activityName = item.titulo;
              console.log(`⚠️ [ACTIVITY ${index + 1}] Nombre encontrado en "titulo":`, activityName);
            }
            else {
              activityName = `Actividad ${item.row_number || index + 1}`;
              console.log(`⚠️ [ACTIVITY ${index + 1}] Sin nombre, usando genérico:`, activityName);
            }
            
            // Extract description
            const description = item['INTENCIÓN PEDAGÓGICA DEL DÍA'] || 
                              item['INTENCION_PEDAGOGICA_DEL_DIA'] ||
                              item.description || 
                              item.descripcion || '';
            
            const mappedActivity = {
              id: item.id || item.row_number || `activity-${index}`,
              name: activityName,
              originalName: activityName, // This exact value will be sent to detail webhook
              description: description,
              duration: '45-60 minutos',
              icon: defaultIcons[index % defaultIcons.length]
            };
            
            console.log(`✅ [ACTIVITY ${index + 1}] Actividad mapeada exitosamente:`);
            console.log(`   - ID: ${mappedActivity.id}`);
            console.log(`   - Nombre (UI): ${mappedActivity.name}`);
            console.log(`   - Nombre (Original): ${mappedActivity.originalName}`);
            console.log(`   - Descripción: ${mappedActivity.description.substring(0, 50)}...`);
            
            return mappedActivity;
          });

          console.log('🎯 [ACTIVITIES] ==========================================');
          console.log('🎯 [ACTIVITIES] Total de actividades mapeadas:', mappedActivities.length);
          console.log('🎯 [ACTIVITIES] Nombres de actividades:');
          mappedActivities.forEach((act, i) => {
            console.log(`   ${i + 1}. "${act.name}"`);
          });
          console.log('🎯 [ACTIVITIES] ==========================================');
          
          setActivities(mappedActivities);
        } else {
          console.log('⚠️ [ACTIVITIES] No hay datos o success=false');
          setActivities([]);
        }
      } catch (err) {
        console.error('❌ Error al cargar actividades:', err);
        setError('No se pudieron cargar las actividades. Por favor, intenta de nuevo.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [unitName]);

  const handleActivityClick = (activity: Activity) => {
    console.log('🎯 [ACTIVITY CLICK] Navegando a formulario de planificación de actividad');
    console.log('  - Nombre de actividad (UI):', activity.name);
    console.log('  - Nombre de actividad (Original):', activity.originalName);
    console.log('  - Unidad:', unitName);
    console.log('  - Asignatura:', unitSubject);
    console.log('  - Grado:', unitGrade);
    
    // Navigate to the activity planning form with all required data
    navigate(`/crear-planificacion-diaria/actividad-formulario`, {
      state: {
        activityName: activity.originalName,
        unitName: unitName,
        unitSubject: unitSubject,
        unitGrade: unitGrade
      }
    });
  };

  return (
    <div className="min-h-screen" style={{ background: '#FF9A76' }}>
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between mb-6 sm:mb-10">
          {/* Back Link */}
          <button
            onClick={() => navigate('/crear-planificacion-diaria/nueva')}
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
            Selecciona una Actividad
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

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-6">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-white/30 rounded-full"></div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-white rounded-full animate-spin border-t-transparent"></div>
            </div>
            <p className="text-lg sm:text-xl font-bold text-white">Cargando actividades...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-white rounded-2xl sm:rounded-[32px] p-6 sm:p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Error al cargar actividades</h3>
            <p className="text-slate-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-lg"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && activities.length === 0 && (
          <div className="bg-white rounded-2xl sm:rounded-[32px] p-6 sm:p-8 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No hay actividades disponibles</h3>
            <p className="text-slate-600">
              No se encontraron actividades para esta unidad.
            </p>
          </div>
        )}

        {/* Activities Grid */}
        {!isLoading && !error && activities.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {activities.map((activity, index) => {
              // Parse activity name to separate number from title
              let activityNumber = '';
              let activityTitle = activity.name;
              
              const match = activity.name.match(/^(Actividad\s+\d+):\s*(.+)$/i);
              if (match) {
                activityNumber = match[1];
                activityTitle = match[2];
              }
              
              return (
                <button
                  key={activity.id}
                  onClick={() => handleActivityClick(activity)}
                  className="bg-white rounded-2xl sm:rounded-[24px] p-4 sm:p-6 hover:shadow-xl active:scale-95 transition-all duration-200 text-left group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Activity Number Badge */}
                  {activityNumber && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl mb-3" style={{ backgroundColor: '#5B7FCC' }}>
                      <span className="text-xs font-bold text-white uppercase tracking-wide">
                        {activityNumber}
                      </span>
                    </div>
                  )}
                  
                  {/* Activity Title */}
                  <h3 className="text-base sm:text-lg font-bold leading-tight" style={{ color: '#5B7FCC' }}>
                    {activityTitle}
                  </h3>
                  
                  {/* Description */}
                  {activity.description && (
                    <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed line-clamp-3">
                      {activity.description}
                    </p>
                  )}
                  
                  {/* Arrow Icon */}
                  <div className="flex justify-end mt-3">
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300 group-hover:text-[#5B7FCC] group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
