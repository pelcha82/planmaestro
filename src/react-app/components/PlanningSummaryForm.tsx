import { useState } from "react";
import { useNavigate } from "react-router";

interface PlanningSummaryFormProps {
  teacherId: number;
}

export default function PlanningSummaryForm({ teacherId }: PlanningSummaryFormProps) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      teacher_registration_id: teacherId,
      centro_educativo: formData.get('centro_educativo') as string,
      docente: formData.get('docente') as string,
      grado: formData.get('grado') as string,
      tiempo_asignado: formData.get('tiempo_asignado') as string,
      asignatura: formData.get('asignatura') as string,
      unidad: formData.get('unidad') as string,
      contenidos_procedimentales: formData.get('contenidos_procedimentales') as string,
      competencias_fundamentales: formData.get('competencias_fundamentales') as string,
      competencias_especificas_grado: formData.get('competencias_especificas_grado') as string,
      ejes_transversal: formData.get('ejes_transversal') as string,
      valores_actitudes: formData.get('valores_actitudes') as string,
      indicadores_logro: formData.get('indicadores_logro') as string,
      areas_articuladas: formData.get('areas_articuladas') as string,
      estrategia_ensenanza_aprendizaje: formData.get('estrategia_ensenanza_aprendizaje') as string,
      actividades_ensenanza: formData.get('actividades_ensenanza') as string,
      actividades_aprendizaje: formData.get('actividades_aprendizaje') as string,
      actividades_evaluacion: formData.get('actividades_evaluacion') as string,
      recursos_didacticos: formData.get('recursos_didacticos') as string,
      fecha_inicio_date: formData.get('fecha_inicio_date') as string,
      fecha_fin_date: formData.get('fecha_fin_date') as string,
      actividades: formData.get('actividades') as string,
    };

    try {
      const response = await fetch('/api/planning-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al crear planificación');
      }

      // Navigate to the summary view
      navigate(`/resumen-planificacion/${result.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear planificación');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <div className="bg-slate-50 rounded-lg p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Información Básica</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="centro_educativo" className="block text-sm font-semibold text-slate-700 mb-2">
              Centro Educativo
            </label>
            <input
              type="text"
              id="centro_educativo"
              name="centro_educativo"
              disabled={isSubmitting}
              className="block w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
            />
          </div>
          <div>
            <label htmlFor="docente" className="block text-sm font-semibold text-slate-700 mb-2">
              Docente
            </label>
            <input
              type="text"
              id="docente"
              name="docente"
              disabled={isSubmitting}
              className="block w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
            />
          </div>
          <div>
            <label htmlFor="grado" className="block text-sm font-semibold text-slate-700 mb-2">
              Grado
            </label>
            <input
              type="text"
              id="grado"
              name="grado"
              disabled={isSubmitting}
              className="block w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
            />
          </div>
          <div>
            <label htmlFor="tiempo_asignado" className="block text-sm font-semibold text-slate-700 mb-2">
              Tiempo Asignado
            </label>
            <input
              type="text"
              id="tiempo_asignado"
              name="tiempo_asignado"
              disabled={isSubmitting}
              className="block w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
            />
          </div>
          <div>
            <label htmlFor="asignatura" className="block text-sm font-semibold text-slate-700 mb-2">
              Asignatura
            </label>
            <input
              type="text"
              id="asignatura"
              name="asignatura"
              disabled={isSubmitting}
              className="block w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
            />
          </div>
          <div>
            <label htmlFor="unidad" className="block text-sm font-semibold text-slate-700 mb-2">
              Unidad
            </label>
            <input
              type="text"
              id="unidad"
              name="unidad"
              disabled={isSubmitting}
              className="block w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Creando...' : 'Crear Planificación'}
      </button>
    </form>
  );
}
