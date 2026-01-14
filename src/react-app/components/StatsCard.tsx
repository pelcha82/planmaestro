import { useState, useEffect } from "react";
import { Calendar, Library, Clock, DollarSign } from "lucide-react";

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

export default function StatsCard() {
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

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) return;

    // Fetch time and money saved statistics from TIEMPOAHORRADO webhook
    const fetchTimeMoneyStats = async () => {
      try {
        setIsLoadingStats(true);
        console.log('💰 [STATS CARD] Obteniendo estadísticas de tiempo y dinero para:', userEmail);
        
        const response = await fetch('/api/get-teacher-name', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ correo: userEmail }),
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ [STATS CARD] Datos recibidos del webhook TIEMPOAHORRADO:', result);

          if (result.success && result.data) {
            const data = result.data;
            
            const conteoDiaria = parseInt(data.conteo_diaria || 0);
            const conteoUnidad = parseInt(data.conteo_unidad || 0);
            const totalHoras = parseFloat(data.total_horas || 0);
            const totalPesos = parseFloat(data.total_pesos || 0);
            
            console.log('📊 [STATS CARD] Valores extraídos:', {
              conteoDiaria,
              conteoUnidad,
              totalHoras,
              totalPesos
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
            }
            
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
            
            setStats(newStats);
            setIsLoadingStats(false);
          }
        } else {
          console.warn('⚠️ [STATS CARD] No se pudieron obtener estadísticas');
          setIsLoadingStats(false);
        }
      } catch (error) {
        console.error('❌ [STATS CARD] Error al cargar estadísticas:', error);
        setIsLoadingStats(false);
      }
    };

    fetchTimeMoneyStats();
  }, []);

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

  return (
    <div className="inline-block bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-3 sm:p-4 shadow-sm border border-emerald-100 animate-fade-in-up relative overflow-hidden max-w-sm w-full">
      {/* Efecto de brillo animado de fondo */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
      
      {isLoadingStats ? (
        /* Loading State - Skeleton animado */
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <div className="p-1 bg-emerald-100 rounded">
                <div className="w-3 h-3 bg-emerald-300 rounded animate-pulse"></div>
              </div>
              <div className="h-2 w-16 bg-emerald-200 rounded animate-pulse"></div>
            </div>
            
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 bg-emerald-400 rounded-full animate-ping"></div>
              <div className="h-2 w-10 bg-emerald-200 rounded animate-pulse"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-1.5 min-w-0">
                <div className="w-3 h-3 bg-slate-200 rounded animate-pulse"></div>
                <div className="min-w-0 flex-1">
                  <div className="h-4 w-10 bg-slate-300 rounded mb-0.5 animate-pulse" style={{ animationDelay: `${i * 100}ms` }}></div>
                  <div className="h-2 w-12 bg-slate-200 rounded animate-pulse" style={{ animationDelay: `${i * 100}ms` }}></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-2 pt-2 border-t border-emerald-200">
            <div className="h-2 w-32 bg-emerald-200 rounded mx-auto animate-pulse"></div>
          </div>
        </div>
      ) : (
        /* Data Loaded - Animación de conteo */
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <div className="p-1 bg-emerald-100 rounded animate-bounce">
                <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-[10px] font-medium text-emerald-700">Progreso</p>
            </div>
            
            {/* Indicador de actualización en tiempo real */}
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-medium text-emerald-600">En vivo</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {/* Planificaciones Diarias */}
            <div className="flex items-center gap-1.5 group min-w-0 transform transition-all hover:scale-105">
              <Calendar className="w-3 h-3 text-orange-600 flex-shrink-0 transition-transform group-hover:scale-110" />
              <div className="min-w-0 flex-1">
                <p className="text-base font-bold text-slate-800 transition-all leading-none tabular-nums">
                  {animatedStats.conteoDiaria}
                </p>
                <p className="text-[10px] font-medium text-slate-600 truncate">diarias</p>
              </div>
            </div>
            
            {/* Planificaciones de Unidad */}
            <div className="flex items-center gap-1.5 group min-w-0 transform transition-all hover:scale-105">
              <Library className="w-3 h-3 text-blue-600 flex-shrink-0 transition-transform group-hover:scale-110" />
              <div className="min-w-0 flex-1">
                <p className="text-base font-bold text-slate-800 transition-all leading-none tabular-nums">
                  {animatedStats.conteoUnidad}
                </p>
                <p className="text-[10px] font-medium text-slate-600 truncate">unidad</p>
              </div>
            </div>
            
            {/* Tiempo Ahorrado */}
            <div className="flex items-center gap-1.5 group min-w-0 transform transition-all hover:scale-105">
              <Clock className="w-3 h-3 text-emerald-600 flex-shrink-0 transition-transform group-hover:scale-110" />
              <div className="min-w-0 flex-1">
                <p className="text-base font-bold text-slate-800 transition-all leading-none truncate tabular-nums">
                  {animatedStats.tiempoTotal.toFixed(1)}
                </p>
                <p className="text-[10px] font-medium text-slate-600 truncate">hrs</p>
              </div>
            </div>
            
            {/* Dinero Ahorrado */}
            <div className="flex items-center gap-1.5 group min-w-0 transform transition-all hover:scale-105">
              <DollarSign className="w-3 h-3 text-amber-600 flex-shrink-0 transition-transform group-hover:scale-110" />
              <div className="min-w-0 flex-1 overflow-visible">
                <p className="text-sm font-bold text-slate-800 transition-all leading-none tabular-nums whitespace-nowrap" title={`Dinero total: RD$ ${animatedStats.dineroTotal.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}>
                  {animatedStats.dineroTotal > 0 ? `$${Math.round(animatedStats.dineroTotal).toLocaleString('es-DO')}` : '$0'}
                </p>
                <p className="text-[10px] font-medium text-slate-600">RD$</p>
              </div>
            </div>
          </div>
          
          {/* Nota informativa sobre el cálculo */}
          <div className="mt-2 pt-2 border-t border-emerald-200">
            <p className="text-[9px] text-slate-500 text-center italic">
              Basado en un salario de RD$ 45,000
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
