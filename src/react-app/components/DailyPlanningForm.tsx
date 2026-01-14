import { useState } from "react";

interface DailyPlanningFormProps {
  unitPlanningId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormData {
  fecha: string;
  titulo: string;
  objetivos: string;
  actividades: string;
  recursos: string;
  evaluacion: string;
  notas: string;
}

export default function DailyPlanningForm({ unitPlanningId, onSuccess, onCancel }: DailyPlanningFormProps) {
  const [formData, setFormData] = useState<FormData>({
    fecha: new Date().toISOString().split('T')[0],
    titulo: '',
    objetivos: '',
    actividades: '',
    recursos: '',
    evaluacion: '',
    notas: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titulo.trim()) {
      setError("El título es requerido");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch('/api/daily-planning', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          unit_planning_id: unitPlanningId,
          ...formData
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al crear planificación diaria');
      }

      onSuccess();
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

      <div>
        <label htmlFor="fecha" className="block text-sm font-bold text-slate-700 mb-2">
          Fecha
        </label>
        <input
          type="date"
          id="fecha"
          value={formData.fecha}
          onChange={(e) => handleChange('fecha', e.target.value)}
          disabled={isSubmitting}
          required
          className="block w-full px-4 py-2 rounded-lg border-2 border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
        />
      </div>

      <div>
        <label htmlFor="titulo" className="block text-sm font-bold text-slate-700 mb-2">
          Título
        </label>
        <input
          type="text"
          id="titulo"
          value={formData.titulo}
          onChange={(e) => handleChange('titulo', e.target.value)}
          disabled={isSubmitting}
          required
          placeholder="Título de la planificación"
          className="block w-full px-4 py-2 rounded-lg border-2 border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
        />
      </div>

      <div>
        <label htmlFor="objetivos" className="block text-sm font-bold text-slate-700 mb-2">
          Objetivos
        </label>
        <textarea
          id="objetivos"
          value={formData.objetivos}
          onChange={(e) => handleChange('objetivos', e.target.value)}
          disabled={isSubmitting}
          rows={3}
          placeholder="Objetivos de aprendizaje"
          className="block w-full px-4 py-2 rounded-lg border-2 border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 resize-y"
        />
      </div>

      <div>
        <label htmlFor="actividades" className="block text-sm font-bold text-slate-700 mb-2">
          Actividades
        </label>
        <textarea
          id="actividades"
          value={formData.actividades}
          onChange={(e) => handleChange('actividades', e.target.value)}
          disabled={isSubmitting}
          rows={4}
          placeholder="Descripción de las actividades"
          className="block w-full px-4 py-2 rounded-lg border-2 border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 resize-y"
        />
      </div>

      <div>
        <label htmlFor="recursos" className="block text-sm font-bold text-slate-700 mb-2">
          Recursos
        </label>
        <textarea
          id="recursos"
          value={formData.recursos}
          onChange={(e) => handleChange('recursos', e.target.value)}
          disabled={isSubmitting}
          rows={3}
          placeholder="Recursos necesarios"
          className="block w-full px-4 py-2 rounded-lg border-2 border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 resize-y"
        />
      </div>

      <div>
        <label htmlFor="evaluacion" className="block text-sm font-bold text-slate-700 mb-2">
          Evaluación
        </label>
        <textarea
          id="evaluacion"
          value={formData.evaluacion}
          onChange={(e) => handleChange('evaluacion', e.target.value)}
          disabled={isSubmitting}
          rows={3}
          placeholder="Métodos de evaluación"
          className="block w-full px-4 py-2 rounded-lg border-2 border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 resize-y"
        />
      </div>

      <div>
        <label htmlFor="notas" className="block text-sm font-bold text-slate-700 mb-2">
          Notas
        </label>
        <textarea
          id="notas"
          value={formData.notas}
          onChange={(e) => handleChange('notas', e.target.value)}
          disabled={isSubmitting}
          rows={2}
          placeholder="Notas adicionales"
          className="block w-full px-4 py-2 rounded-lg border-2 border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 resize-y"
        />
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}
