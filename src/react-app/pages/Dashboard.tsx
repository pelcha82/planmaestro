import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Calendar, Library, Clock, Settings, LogOut, User, DollarSign } from "lucide-react";

interface RecentPlanning {
  id: string;
  title: string;
  date: string;
  type: 'daily' | 'unit';
}

interface TimeMoneyStats {
  tiempoDiaria: number;
  dineroDiaria: number;
  tiempoUnidad: number;
  dineroUnidad: number;
  tiempoTotal: number;
  dineroTotal: number;
  conteoDiaria: number;
  conteoUnidad: number;
  conteoTotal: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [recentPlannings, setRecentPlannings] = useState<RecentPlanning[]>([]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [stats, setStats] = useState<TimeMoneyStats>({
    tiempoDiaria: 0,
    dineroDiaria: 0,
    tiempoUnidad: 0,
    dineroUnidad: 0,
    tiempoTotal: 0,
    dineroTotal: 0,
    conteoDiaria: 0,
    conteoUnidad: 0,
    conteoTotal: 0
  });
  const [teacherName, setTeacherName] = useState<string>('Profe');
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [animatedStats, setAnimatedStats] = useState<TimeMoneyStats>({
    tiempoDiaria: 0,
    dineroDiaria: 0,
    tiempoUnidad: 0,
    dineroUnidad: 0,
    tiempoTotal: 0,
    dineroTotal: 0,
    conteoDiaria: 0,
    conteoUnidad: 0,
    conteoTotal: 0
  });
  const [showStatsExplanation, setShowStatsExplanation] = useState(false);

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      navigate('/login');
      return;
    }

    // Fetch teacher name from account webhook
    const fetchTeacherName = async () => {
      try {
        console.log('👤 [DASHBOARD] Obteniendo nombre del docente para:', userEmail);
        
        const response = await fetch('/api/get-teacher-account', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ correo: userEmail }),
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ [DASHBOARD] Datos de cuenta recibidos:', result);

          if (result.success && result.data) {
            // Extract teacher name - the field is called "docente" in the webhook
            const teacherInfo = Array.isArray(result.data) ? result.data[0] : result.data;
            const nombre = teacherInfo.docente || teacherInfo.DOCENTE || teacherInfo.Docente || 
                          teacherInfo.nombre || teacherInfo.NOMBRE || teacherInfo.Nombre || '';
            if (nombre) {
              setTeacherName(nombre);
              console.log('👤 [DASHBOARD] Nombre del docente establecido:', nombre);
              console.log('👤 [DASHBOARD] Campos disponibles en webhook:', Object.keys(teacherInfo));
            } else {
              console.warn('⚠️ [DASHBOARD] No se encontró el campo "docente" en el webhook');
              console.warn('⚠️ [DASHBOARD] Datos completos:', teacherInfo);
            }
          }
        }
      } catch (error) {
        console.error('❌ [DASHBOARD] Error al obtener nombre del docente:', error);
      }
    };

    // Fetch time and money saved statistics from TIEMPOAHORRADO webhook
    const fetchTimeMoneyStats = async () => {
      try {
        setIsLoadingStats(true);
        console.log('💰 [DASHBOARD] Obteniendo estadísticas de tiempo y dinero para:', userEmail);
        
        const response = await fetch('/api/get-teacher-name', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ correo: userEmail }),
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ [DASHBOARD] Datos recibidos del webhook TIEMPOAHORRADO:', result);
          console.log('📦 [DASHBOARD] Estructura completa:', JSON.stringify(result.data, null, 2));

          if (result.success && result.data) {
            const data = result.data;
            console.log('🔍 [DASHBOARD] Datos del webhook:', JSON.stringify(data, null, 2));
            
            const conteoDiaria = parseInt(data.conteo_diaria || 0);
            const conteoUnidad = parseInt(data.conteo_unidad || 0);
            const totalHoras = parseFloat(data.total_horas || 0);
            const totalPesos = parseFloat(data.total_pesos || 0);
            
            console.log('📊 [DASHBOARD] Valores extraídos:', {
              conteoDiaria,
              conteoUnidad,
              totalHoras,
              totalPesos,
              resumen: data.resumen_final
            });
            
            const totalConteo = conteoDiaria + conteoUnidad;
            
            let tiempoDiaria = 0;
            let tiempoUnidad = 0;
            let dineroDiaria = 0;
            let dineroUnidad = 0;
            
            if (totalConteo > 0) {
              const proporcionDiaria = conteoDiaria / totalConteo;
              const proporcionUnidad = conteoUnidad / totalConteo;
              
              tiempoDiaria = totalHoras * proporcionDiaria;
              tiempoUnidad = totalHoras * proporcionUnidad;
              dineroDiaria = totalPesos * proporcionDiaria;
              dineroUnidad = totalPesos * proporcionUnidad;
              
              console.log('💰 [DASHBOARD] Distribución calculada:', {
                tiempoDiaria,
                tiempoUnidad,
                dineroDiaria,
                dineroUnidad
              });
            } else {
              console.warn('⚠️ [DASHBOARD] No hay planificaciones, mostrando ceros');
            }
            
            console.log('💰 [DASHBOARD] ESTADÍSTICAS FINALES:', {
              tiempoDiaria,
              dineroDiaria,
              tiempoUnidad,
              dineroUnidad,
              tiempoTotal: totalHoras,
              dineroTotal: totalPesos
            });
            
            const newStats = {
              tiempoDiaria,
              dineroDiaria,
              tiempoUnidad,
              dineroUnidad,
              tiempoTotal: totalHoras,
              dineroTotal: totalPesos,
              conteoDiaria: conteoDiaria,
              conteoUnidad: conteoUnidad,
              conteoTotal: totalConteo
            };
            
            console.log('🎯 [DASHBOARD] Estableciendo stats con dineroTotal:', totalPesos);
            console.log('🎯 [DASHBOARD] Stats completo que se va a guardar:', newStats);
            
            setStats(newStats);
            setIsLoadingStats(false);
          }
        } else {
          console.warn('⚠️ [DASHBOARD] No se pudieron obtener estadísticas');
          setIsLoadingStats(false);
        }
      } catch (error) {
        console.error('❌ [DASHBOARD] Error al cargar estadísticas:', error);
        setIsLoadingStats(false);
      }
    };

    fetchTeacherName();
    fetchTimeMoneyStats();

    // Fetch real plannings data from webhook
    const fetchPlannings = async () => {
      try {
        console.log('📊 [DASHBOARD] Obteniendo planificaciones para:', userEmail);
        
        const response = await fetch('/api/get-dashboard-plannings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: userEmail }),
        });

        if (!response.ok) {
          console.error('❌ [DASHBOARD] Error al obtener planificaciones:', response.status);
          return;
        }

        const result = await response.json();
        console.log('✅ [DASHBOARD] Planificaciones recibidas:', result);

        if (result.success && result.data && Array.isArray(result.data)) {
          // Map webhook data to RecentPlanning format
          const mappedPlannings: RecentPlanning[] = result.data.map((item: any) => {
            // Determine if it's a daily or unit planning based on available fields
            const isDailyPlanning = item['TEMA DEL DÍA'] || item.tema_del_dia || item.tema;
            
            // For daily plannings
            if (isDailyPlanning) {
              const title = item['TEMA DEL DÍA'] || item.tema_del_dia || item.tema || 'Planificación Diaria';
              const materia = item['MATERIA'] || item.materia || '';
              const fecha = item['FECHA'] || item.fecha || item.created_at || '';
              
              return {
                id: item.id || String(Math.random()),
                title: materia ? `${materia} - ${title}` : title,
                date: fecha ? new Date(fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' }) : 'Fecha desconocida',
                type: 'daily' as const
              };
            }
            
            // For unit plannings
            const unitName = item.unidad || item.unit_name || item.nombre_unidad || 'Unidad';
            const asignatura = item.asignatura || item.materia || item.subject || '';
            const fecha = item.created_at || item.fecha || '';
            
            return {
              id: item.id || String(Math.random()),
              title: asignatura ? `${asignatura} - ${unitName}` : unitName,
              date: fecha ? new Date(fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' }) : 'Fecha desconocida',
              type: 'unit' as const
            };
          });

          console.log('📋 [DASHBOARD] Planificaciones mapeadas:', mappedPlannings.length);
          setRecentPlannings(mappedPlannings);
        } else {
          console.log('⚠️ [DASHBOARD] No se encontraron planificaciones');
          setRecentPlannings([]);
        }
      } catch (error) {
        console.error('❌ [DASHBOARD] Error al cargar planificaciones:', error);
        setRecentPlannings([]);
      }
    };

    fetchPlannings();
  }, [navigate]);

  // Animate stats counting effect
  useEffect(() => {
    if (!isLoadingStats) {
      const duration = 1500;
      const steps = 60;
      const stepDuration = duration / steps;
      let currentStep = 0;

      const interval = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        
        setAnimatedStats({
          tiempoDiaria: stats.tiempoDiaria * progress,
          dineroDiaria: stats.dineroDiaria * progress,
          tiempoUnidad: stats.tiempoUnidad * progress,
          dineroUnidad: stats.dineroUnidad * progress,
          tiempoTotal: stats.tiempoTotal * progress,
          dineroTotal: stats.dineroTotal * progress,
          conteoDiaria: Math.round(stats.conteoDiaria * progress),
          conteoUnidad: Math.round(stats.conteoUnidad * progress),
          conteoTotal: Math.round(stats.conteoTotal * progress)
        });

        if (currentStep >= steps) {
          clearInterval(interval);
          setAnimatedStats(stats);
        }
      }, stepDuration);

      return () => clearInterval(interval);
    }
  }, [stats, isLoadingStats]);

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-6 sm:py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* PARTE SUPERIOR - Profile Widget */}
        <div className="relative mb-12 sm:mb-16">
          {/* Greeting with Teacher Name - Centered */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 animate-fade-in">
              Hola, <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{teacherName.charAt(0).toUpperCase() + teacherName.slice(1)}</span>.
            </h1>
          </div>

          {/* Profile Icon Button */}
          <div className="absolute top-0 right-0 z-50">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 flex items-center justify-center text-white shadow-2xl hover:shadow-[0_10px_40px_-10px_rgba(168,85,247,0.6)] hover:scale-110 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-300"
            >
              <User className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={2.5} />
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-4 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
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

        {/* Horizontal Stats Card - Above Main Cards */}
        <div className="mb-6 sm:mb-8">
          <div 
            onClick={() => setShowStatsExplanation(true)}
            className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 shadow-sm border border-emerald-100 animate-fade-in-up relative overflow-hidden w-full cursor-pointer hover:shadow-md transition-shadow duration-200"
          >
            {/* Efecto de brillo animado de fondo */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
            
            {isLoadingStats ? (
              /* Loading State - Skeleton animado */
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-100 rounded-lg">
                      <div className="w-4 h-4 bg-emerald-300 rounded animate-pulse"></div>
                    </div>
                    <div className="h-3 w-20 bg-emerald-200 rounded animate-pulse"></div>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></div>
                    <div className="h-3 w-12 bg-emerald-200 rounded animate-pulse"></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-2 min-w-0">
                      <div className="w-4 h-4 bg-slate-200 rounded animate-pulse"></div>
                      <div className="min-w-0 flex-1">
                        <div className="h-6 w-12 bg-slate-300 rounded mb-1 animate-pulse" style={{ animationDelay: `${i * 100}ms` }}></div>
                        <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" style={{ animationDelay: `${i * 100}ms` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-3 border-t border-emerald-200">
                  <div className="h-3 w-40 bg-emerald-200 rounded mx-auto animate-pulse"></div>
                </div>
              </div>
            ) : (
              /* Data Loaded - Horizontal Layout */
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-400 rounded-xl blur-md opacity-60 animate-pulse"></div>
                      <div className="relative px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl shadow-lg border border-emerald-300">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-white animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <p className="text-sm font-bold text-white uppercase tracking-wider">Tus Ahorros</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Indicador de actualización en tiempo real */}
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-emerald-600">En vivo</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  {/* Planificaciones Diarias */}
                  <div className="flex items-center gap-2 group min-w-0 transform transition-all hover:scale-105">
                    <Calendar className="w-4 h-4 text-orange-600 flex-shrink-0 transition-transform group-hover:scale-110 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xl font-bold text-slate-800 transition-all leading-none tabular-nums">
                        {animatedStats.conteoDiaria}
                      </p>
                      <p className="text-xs font-medium text-slate-600 truncate">diarias</p>
                    </div>
                  </div>
                  
                  {/* Planificaciones de Unidad */}
                  <div className="flex items-center gap-2 group min-w-0 transform transition-all hover:scale-105">
                    <Library className="w-4 h-4 text-blue-600 flex-shrink-0 transition-transform group-hover:scale-110 animate-bounce" style={{ animationDelay: '100ms' }} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xl font-bold text-slate-800 transition-all leading-none tabular-nums">
                        {animatedStats.conteoUnidad}
                      </p>
                      <p className="text-xs font-medium text-slate-600 truncate">unidad</p>
                    </div>
                  </div>
                  
                  {/* Tiempo Ahorrado */}
                  <div className="flex items-center gap-2 group min-w-0 transform transition-all hover:scale-105">
                    <Clock className="w-4 h-4 text-emerald-600 flex-shrink-0 transition-transform group-hover:scale-110 animate-bounce" style={{ animationDelay: '200ms' }} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xl font-bold text-slate-800 transition-all leading-none truncate tabular-nums">
                        {animatedStats.tiempoTotal.toFixed(1)}
                      </p>
                      <p className="text-xs font-medium text-slate-600 truncate">hrs</p>
                    </div>
                  </div>
                  
                  {/* Dinero Ahorrado */}
                  <div className="flex items-center gap-2 group min-w-0 transform transition-all hover:scale-105">
                    <DollarSign className="w-4 h-4 text-amber-600 flex-shrink-0 transition-transform group-hover:scale-110 animate-bounce" style={{ animationDelay: '300ms' }} />
                    <div className="min-w-0 flex-1 overflow-visible">
                      <p className="text-lg font-bold text-slate-800 transition-all leading-none tabular-nums whitespace-nowrap" title={`Dinero total: RD$ ${animatedStats.dineroTotal.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}>
                        {animatedStats.dineroTotal > 0 ? `$${Math.round(animatedStats.dineroTotal).toLocaleString('es-DO')}` : '$0'}
                      </p>
                      <p className="text-xs font-medium text-slate-600">RD$</p>
                    </div>
                  </div>
                </div>
                
                {/* Nota informativa sobre el cálculo */}
                <div className="mt-4 pt-3 border-t border-emerald-200">
                  <p className="text-xs text-slate-500 text-center italic">
                    Basado en un salario de RD$ 45,000
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Action Cards with Solid Colors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-20">
          {/* Left Card: Unit Planning - Solid Matte Blue */}
          <div className="relative">
            {/* Money Saved Badge - Outside Card, Top Left */}
            {!isLoadingStats && stats.dineroUnidad > 0 && (
              <div className="absolute -top-3 -left-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 shadow-xl animate-in fade-in slide-in-from-left duration-700 z-30 border-2 border-emerald-300">
                <div className="flex items-center gap-2 min-w-0">
                  <DollarSign className="w-4 h-4 text-white flex-shrink-0" />
                  <div className="min-w-0 flex-1 overflow-visible">
                    <p className="text-lg font-bold text-white transition-all leading-none tabular-nums whitespace-nowrap">
                      {animatedStats.dineroUnidad > 0 ? `$${Math.round(animatedStats.dineroUnidad).toLocaleString('es-DO')}` : '$0'}
                    </p>
                    <p className="text-xs font-medium text-white/80">RD$</p>
                  </div>
                </div>
              </div>
            )}
            
            <Link
              to="/resumen-planificacion"
              className="group relative bg-[#5B7FCC] rounded-[2rem] p-8 sm:p-10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden block"
            >
              {/* Animated gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative flex flex-col items-center text-center z-10">
                {/* Flat Illustration - Books and Calendar */}
                <div className="mb-6 relative">
                  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg">
                    {/* Calendar */}
                    <rect x="65" y="20" width="45" height="50" rx="4" fill="#FFFFFF" />
                    <rect x="65" y="20" width="45" height="12" rx="4" fill="#4A5FBF" />
                    <circle cx="75" cy="26" r="2" fill="#FFFFFF" />
                    <circle cx="100" cy="26" r="2" fill="#FFFFFF" />
                    <rect x="72" y="38" width="8" height="8" rx="2" fill="#E8EDF7" />
                    <rect x="85" y="38" width="8" height="8" rx="2" fill="#4A5FBF" />
                    <rect x="98" y="38" width="8" height="8" rx="2" fill="#E8EDF7" />
                    <rect x="72" y="50" width="8" height="8" rx="2" fill="#E8EDF7" />
                    <rect x="85" y="50" width="8" height="8" rx="2" fill="#E8EDF7" />
                    
                    {/* Books Stack */}
                    <rect x="10" y="55" width="50" height="10" rx="2" fill="#FF9A76" transform="rotate(-5 35 60)" />
                    <rect x="12" y="45" width="50" height="10" rx="2" fill="#FFD166" transform="rotate(-2 37 50)" />
                    <rect x="15" y="35" width="50" height="10" rx="2" fill="#4ECDC4" />
                    <line x1="40" y1="35" x2="40" y2="45" stroke="#FFFFFF" strokeWidth="2" />
                  </svg>
                </div>
                
                {/* Title */}
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                  Planificación de Unidad
                </h2>
                
                {/* Description */}
                <p className="text-white/90 text-base sm:text-lg mb-6 leading-relaxed">
                  Para un tema que dura varias semanas.
                </p>
                
                {/* Action Button */}
                <button className="w-full bg-[#4A5FBF] text-white font-bold py-4 px-6 rounded-2xl hover:bg-[#3D4E9F] transition-all duration-200 shadow-md hover:shadow-lg">
                  Comenzar Unidad
                </button>
              </div>
            </Link>
          </div>

          {/* Right Card: Daily Planning - Solid Matte Orange */}
          <div className="relative">
            {/* Money Saved Badge - Outside Card, Top Left */}
            {!isLoadingStats && stats.dineroDiaria > 0 && (
              <div className="absolute -top-3 -left-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 shadow-xl animate-in fade-in slide-in-from-left duration-700 z-30 border-2 border-emerald-300">
                <div className="flex items-center gap-2 min-w-0">
                  <DollarSign className="w-4 h-4 text-white flex-shrink-0" />
                  <div className="min-w-0 flex-1 overflow-visible">
                    <p className="text-lg font-bold text-white transition-all leading-none tabular-nums whitespace-nowrap">
                      {animatedStats.dineroDiaria > 0 ? `$${Math.round(animatedStats.dineroDiaria).toLocaleString('es-DO')}` : '$0'}
                    </p>
                    <p className="text-xs font-medium text-white/80">RD$</p>
                  </div>
                </div>
              </div>
            )}
            
            <Link
              to="/crear-planificacion"
              className="group relative bg-[#FF9A76] rounded-[2rem] p-8 sm:p-10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden block"
            >
              {/* Animated gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative flex flex-col items-center text-center z-10">
                {/* Flat Illustration - Agenda and Sun */}
                <div className="mb-6 relative">
                  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg">
                    {/* Sun */}
                    <circle cx="85" cy="25" r="15" fill="#FFD166" />
                    <circle cx="85" cy="25" r="10" fill="#FFEB99" />
                    <line x1="85" y1="5" x2="85" y2="10" stroke="#FFD166" strokeWidth="3" strokeLinecap="round" />
                    <line x1="85" y1="40" x2="85" y2="45" stroke="#FFD166" strokeWidth="3" strokeLinecap="round" />
                    <line x1="65" y1="25" x2="70" y2="25" stroke="#FFD166" strokeWidth="3" strokeLinecap="round" />
                    <line x1="100" y1="25" x2="105" y2="25" stroke="#FFD166" strokeWidth="3" strokeLinecap="round" />
                    <line x1="72" y1="12" x2="76" y2="16" stroke="#FFD166" strokeWidth="3" strokeLinecap="round" />
                    <line x1="94" y1="34" x2="98" y2="38" stroke="#FFD166" strokeWidth="3" strokeLinecap="round" />
                    <line x1="72" y1="38" x2="76" y2="34" stroke="#FFD166" strokeWidth="3" strokeLinecap="round" />
                    <line x1="94" y1="16" x2="98" y2="12" stroke="#FFD166" strokeWidth="3" strokeLinecap="round" />
                    
                    {/* Agenda/Notebook */}
                    <rect x="10" y="30" width="55" height="70" rx="4" fill="#FFFFFF" />
                    <rect x="10" y="30" width="8" height="70" rx="2" fill="#E85D75" />
                    <line x1="25" y1="45" x2="55" y2="45" stroke="#E8EDF7" strokeWidth="3" strokeLinecap="round" />
                    <line x1="25" y1="55" x2="55" y2="55" stroke="#E8EDF7" strokeWidth="3" strokeLinecap="round" />
                    <line x1="25" y1="65" x2="50" y2="65" stroke="#E8EDF7" strokeWidth="3" strokeLinecap="round" />
                    <line x1="25" y1="75" x2="55" y2="75" stroke="#E8EDF7" strokeWidth="3" strokeLinecap="round" />
                    <line x1="25" y1="85" x2="45" y2="85" stroke="#E8EDF7" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="22" cy="45" r="2" fill="#FF9A76" />
                    <circle cx="22" cy="55" r="2" fill="#FF9A76" />
                    <circle cx="22" cy="65" r="2" fill="#FF9A76" />
                  </svg>
                </div>
                
                {/* Title */}
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                  Planificación Diaria
                </h2>
                
                {/* Description */}
                <p className="text-white/90 text-base sm:text-lg mb-6 leading-relaxed">
                  Para una sola clase o lección específica.
                </p>
                
                {/* Action Button */}
                <button className="w-full bg-[#E85D75] text-white font-bold py-4 px-6 rounded-2xl hover:bg-[#D14861] transition-all duration-200 shadow-md hover:shadow-lg">
                  Comenzar Diaria
                </button>
              </div>
            </Link>
          </div>
        </div>

        {/* Stats Explanation Modal */}
        {showStatsExplanation && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 sticky top-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                      ¿Cómo se calculan tus estadísticas?
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowStatsExplanation(false)}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Introduction */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <p className="text-blue-900 text-sm leading-relaxed">
                    Estas estadísticas te muestran el impacto real de usar PlanMaestro para crear tus planificaciones educativas. 
                    Cada métrica representa el tiempo y recursos que has ahorrado comparado con hacer las planificaciones manualmente.
                  </p>
                </div>

                {/* Planificaciones Diarias */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-orange-100 rounded-xl">
                      <Calendar className="w-6 h-6 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">Planificaciones Diarias</h3>
                  </div>
                  <div className="pl-12">
                    <p className="text-slate-700 mb-2">
                      <span className="font-bold text-orange-600">{stats.conteoDiaria}</span> planificaciones diarias creadas
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Cada planificación diaria representa una clase o lección específica que has preparado usando nuestra plataforma. 
                      Crear una planificación diaria manualmente toma aproximadamente <span className="font-semibold">45-60 minutos</span>, 
                      mientras que con PlanMaestro lo haces en <span className="font-semibold">5-10 minutos</span>.
                    </p>
                  </div>
                </div>

                {/* Planificaciones de Unidad */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <Library className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">Planificaciones de Unidad</h3>
                  </div>
                  <div className="pl-12">
                    <p className="text-slate-700 mb-2">
                      <span className="font-bold text-blue-600">{stats.conteoUnidad}</span> planificaciones de unidad creadas
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Las planificaciones de unidad cubren temas que duran varias semanas. Tradicionalmente, crear una planificación 
                      de unidad completa toma entre <span className="font-semibold">2-3 horas</span>, mientras que con PlanMaestro 
                      lo logras en <span className="font-semibold">15-20 minutos</span>.
                    </p>
                  </div>
                </div>

                {/* Tiempo Ahorrado */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-100 rounded-xl">
                      <Clock className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">Tiempo Ahorrado</h3>
                  </div>
                  <div className="pl-12">
                    <p className="text-slate-700 mb-2">
                      <span className="font-bold text-emerald-600">{stats.tiempoTotal.toFixed(1)}</span> horas de trabajo ahorradas
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mb-3">
                      Este tiempo se calcula comparando el tiempo promedio que toma hacer planificaciones manualmente versus 
                      usando PlanMaestro:
                    </p>
                    <div className="bg-slate-50 rounded-lg p-3 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Planificación diaria:</span>
                        <span className="font-semibold text-emerald-600">~0.75 hrs ahorradas por planificación</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Planificación de unidad:</span>
                        <span className="font-semibold text-emerald-600">~2.5 hrs ahorradas por planificación</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dinero Ahorrado */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-100 rounded-xl">
                      <DollarSign className="w-6 h-6 text-amber-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">Valor Monetario Ahorrado</h3>
                  </div>
                  <div className="pl-12">
                    <p className="text-slate-700 mb-2">
                      <span className="font-bold text-amber-600">RD$ {Math.round(stats.dineroTotal).toLocaleString('es-DO')}</span> en valor de tiempo
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mb-3">
                      El valor monetario se calcula basándose en el salario promedio de un docente en República Dominicana 
                      (RD$ 45,000 mensuales) y las horas de trabajo ahorradas.
                    </p>
                    <div className="bg-slate-50 rounded-lg p-3 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Salario mensual base:</span>
                        <span className="font-semibold">RD$ 45,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Horas laborales/mes:</span>
                        <span className="font-semibold">160 horas</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Valor por hora:</span>
                        <span className="font-semibold text-amber-600">RD$ 281.25/hr</span>
                      </div>
                      <div className="pt-2 border-t border-slate-200">
                        <p className="text-xs text-slate-500 italic">
                          Fórmula: (Horas ahorradas) × (RD$ 281.25/hr) = Valor total ahorrado
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Note */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4 mt-6">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-purple-900 mb-1">
                        ¡Sigue así!
                      </p>
                      <p className="text-sm text-purple-800">
                        Cada planificación que creas con PlanMaestro te libera más tiempo para enfocarte en lo que realmente 
                        importa: enseñar y conectar con tus estudiantes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 bg-slate-50 border-t border-slate-200">
                <button
                  onClick={() => setShowStatsExplanation(false)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PARTE INFERIOR - Recent Plannings */}
        {recentPlannings.length > 0 && (
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border-2 border-slate-200 p-6 sm:p-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-6 sm:mb-8">
              Sus últimas planificaciones
            </h2>

            <div className="space-y-4">
              {recentPlannings.map((planning) => (
                <div
                  key={planning.id}
                  className="group flex flex-col sm:flex-row sm:items-center sm:justify-between p-5 sm:p-6 bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl border-2 border-slate-200 hover:border-indigo-400 hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 gap-4 sm:gap-0 shadow-md hover:shadow-xl"
                >
                  <div className="flex items-center gap-4 sm:gap-5 flex-1 min-w-0">
                    <div className="flex-shrink-0 p-3 bg-white rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
                      {planning.type === 'daily' ? (
                        <Calendar className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600" />
                      ) : (
                        <Library className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base sm:text-lg text-slate-900 truncate mb-1">
                        {planning.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">{planning.date}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto sm:ml-4">
                    {planning.type === 'daily' && (
                      <>
                        <Link
                          to={`/editar-planificacion-diaria/${planning.id}`}
                          className="flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2 text-sm"
                          title="Modificar con IA"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          <span>Modificar</span>
                        </Link>
                        <Link
                          to={`/eliminar-planificacion-diaria/${planning.id}`}
                          className="px-4 sm:px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2 text-sm"
                          title="Borrar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span className="hidden sm:inline">Borrar</span>
                        </Link>
                      </>
                    )}
                    <Link
                      to={planning.type === 'daily' ? `/crear-planificacion-diaria/${planning.id}` : '/resumen-planificacion'}
                      className="flex-1 sm:flex-initial px-5 sm:px-7 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 text-center text-sm"
                    >
                      Ver
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
