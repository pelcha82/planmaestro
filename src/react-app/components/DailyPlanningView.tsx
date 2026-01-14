import { useState, useEffect } from "react";
import DailyPlanningForm from "@/react-app/components/DailyPlanningForm";

interface UnitPlanning {
  id: number;
  titulo: string;
  descripcion?: string;
  fecha_inicio_date?: string;
  fecha_fin_date?: string;
}

interface DailyPlanning {
  id: number;
  unit_planning_id: number;
  fecha_date: string;
  titulo: string;
  objetivos?: string;
  actividades?: string;
  recursos?: string;
  evaluacion?: string;
  notas?: string;
  created_at: string;
  updated_at: string;
}

interface DailyPlanningViewProps {
  unitPlanning: UnitPlanning;
  onBack: () => void;
}

export default function DailyPlanningView({ unitPlanning, onBack }: DailyPlanningViewProps) {
  const [dailyPlannings, setDailyPlannings] = useState<DailyPlanning[]>([]);
  const [selectedDaily, setSelectedDaily] = useState<DailyPlanning | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    loadDailyPlannings();
  }, [unitPlanning.id]);

  const loadDailyPlannings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/daily-planning/${unitPlanning.id}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al cargar planificaciones diarias');
      }

      setDailyPlannings(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar planificaciones');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDaily = () => {
    setShowForm(true);
    setSelectedDaily(null);
  };

  const handleDailyCreated = () => {
    setShowForm(false);
    setSelectedDaily(null);
    loadDailyPlannings();
  };

  const handleSelectDaily = (daily: DailyPlanning) => {
    setSelectedDaily(daily);
    setShowForm(false);
  };

  const handleDeleteDaily = async (dailyId: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta planificación diaria?')) {
      return;
    }

    try {
      const response = await fetch(`/api/daily-planning/${dailyId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al eliminar planificación');
      }

      if (selectedDaily?.id === dailyId) {
        setSelectedDaily(null);
      }
      loadDailyPlannings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar planificación');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 text-white">
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-2 text-white/90 hover:text-white transition-colors duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a unidades
        </button>
        <h2 className="text-3xl font-bold">{unitPlanning.titulo}</h2>
        {unitPlanning.descripcion && (
          <p className="text-white/90 mt-2">{unitPlanning.descripcion}</p>
        )}
      </div>

      {error && (
        <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="p-6">
        {/* Action Bar */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-slate-800">Planificaciones Diarias</h3>
          <button
            onClick={handleCreateDaily}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200"
          >
            + Nueva Planificación
          </button>
        </div>

        {/* Form or Content */}
        {showForm ? (
          <DailyPlanningForm
            unitPlanningId={unitPlanning.id}
            onSuccess={handleDailyCreated}
            onCancel={() => setShowForm(false)}
          />
        ) : isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
          </div>
        ) : dailyPlannings.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="font-semibold">No hay planificaciones diarias</p>
            <p className="text-sm mt-2">Crea una nueva para comenzar</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dailyPlannings.map((daily) => (
              <div
                key={daily.id}
                className="group relative border-2 border-slate-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => handleSelectDaily(daily)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-indigo-600 mb-1">
                      {daily.fecha_date}
                    </div>
                    <h4 className="font-bold text-slate-800 truncate">{daily.titulo}</h4>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDaily(daily.id);
                    }}
                    className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-red-100 rounded text-red-600"
                    title="Eliminar"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                
                {daily.objetivos && (
                  <p className="text-sm text-slate-600 line-clamp-2 mt-2">
                    <span className="font-semibold">Objetivos:</span> {daily.objetivos}
                  </p>
                )}
                
                {daily.actividades && (
                  <p className="text-sm text-slate-600 line-clamp-2 mt-1">
                    <span className="font-semibold">Actividades:</span> {daily.actividades}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Selected Daily Planning Detail */}
        {selectedDaily && !showForm && (
          <div className="mt-6 border-t-2 border-slate-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xl font-bold text-slate-800">Detalles de Planificación</h4>
              <button
                onClick={() => setSelectedDaily(null)}
                className="text-slate-500 hover:text-slate-700 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-6 space-y-4">
              <div>
                <div className="text-sm font-semibold text-indigo-600 mb-1">FECHA</div>
                <div className="text-slate-800">{selectedDaily.fecha_date}</div>
              </div>
              
              <div>
                <div className="text-sm font-semibold text-indigo-600 mb-1">TÍTULO</div>
                <div className="text-slate-800">{selectedDaily.titulo}</div>
              </div>
              
              {selectedDaily.objetivos && (
                <div>
                  <div className="text-sm font-semibold text-indigo-600 mb-1">OBJETIVOS</div>
                  <div className="text-slate-800 whitespace-pre-wrap">{selectedDaily.objetivos}</div>
                </div>
              )}
              
              {selectedDaily.actividades && (
                <div>
                  <div className="text-sm font-semibold text-indigo-600 mb-1">ACTIVIDADES</div>
                  <div className="text-slate-800 whitespace-pre-wrap">{selectedDaily.actividades}</div>
                </div>
              )}
              
              {selectedDaily.recursos && (
                <div>
                  <div className="text-sm font-semibold text-indigo-600 mb-1">RECURSOS</div>
                  <div className="text-slate-800 whitespace-pre-wrap">{selectedDaily.recursos}</div>
                </div>
              )}
              
              {selectedDaily.evaluacion && (
                <div>
                  <div className="text-sm font-semibold text-indigo-600 mb-1">EVALUACIÓN</div>
                  <div className="text-slate-800 whitespace-pre-wrap">{selectedDaily.evaluacion}</div>
                </div>
              )}
              
              {selectedDaily.notas && (
                <div>
                  <div className="text-sm font-semibold text-indigo-600 mb-1">NOTAS</div>
                  <div className="text-slate-800 whitespace-pre-wrap">{selectedDaily.notas}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
