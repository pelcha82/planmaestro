import { useState } from "react";

interface DailyPlanFormProps {
  unitName: string;
  activityName: string;
  onSubmit: (data: DailyPlanData) => void;
  onBack: () => void;
}

export interface DailyPlanData {
  fecha: string;
  contexto: string;
  recursosDidacticos: string;
}

export default function DailyPlanForm({ unitName, activityName, onSubmit, onBack }: DailyPlanFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<DailyPlanData>({
    fecha: new Date().toISOString().split('T')[0],
    contexto: '',
    recursosDidacticos: ''
  });

  const handleChange = (field: keyof DailyPlanData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Get user email from localStorage
      const userEmail = localStorage.getItem('userEmail');
      
      if (!userEmail) {
        alert('No se encontró el correo del usuario');
        setIsSubmitting(false);
        return;
      }

      // Prepare data for webhook
      const webhookData = {
        correo: userEmail,
        unidad: unitName,
        actividad: activityName,
        fecha: formData.fecha,
        contexto: formData.contexto,
        recursos_didacticos: formData.recursosDidacticos,
        estrategias_ensenanza_aprendizaje: ''
      };

      console.log('Enviando planificación diaria al webhook:', webhookData);

      // Send to webhook
      const response = await fetch('https://n8n.srv1144975.hstgr.cloud/webhook/a5de0afb-b2ae-4d46-8056-0f9bfefa282c', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData),
      });

      console.log('Respuesta del webhook:', response.status);

      if (!response.ok) {
        throw new Error('Error al enviar datos al webhook');
      }

      console.log('Planificación diaria enviada exitosamente');

      // Proceed to next step
      onSubmit(formData);
    } catch (error) {
      console.error('Error al enviar planificación:', error);
      alert('Error al enviar la planificación. Por favor, intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            disabled={isSubmitting}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-4 transition-colors duration-200 disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-lg">Volver a Actividades</span>
          </button>
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Detalles de la Planificación</h1>
          <p className="text-slate-600">
            Unidad: <span className="font-semibold text-indigo-600">{unitName}</span>
            {' • '}
            Actividad: <span className="font-semibold text-indigo-600">{activityName}</span>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 space-y-6">
          {/* Fecha */}
          <div>
            <label htmlFor="fecha" className="block text-sm font-bold text-slate-700 mb-2 tracking-wide uppercase">
              Fecha de la Clase
            </label>
            <input
              type="date"
              id="fecha"
              value={formData.fecha}
              onChange={(e) => handleChange('fecha', e.target.value)}
              disabled={isSubmitting}
              required
              className="block w-full px-4 py-3 rounded-lg border-2 border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
            />
          </div>

          {/* Contexto */}
          <div>
            <label htmlFor="contexto" className="block text-sm font-bold text-slate-700 mb-2 tracking-wide uppercase">
              Contexto / Efemérides y Actos Especiales
            </label>
            <textarea
              id="contexto"
              value={formData.contexto}
              onChange={(e) => handleChange('contexto', e.target.value)}
              disabled={isSubmitting}
              rows={4}
              placeholder="¿Hay alguna efeméride o acto especial ese día que deba incluirse en la planificación?"
              className="block w-full px-4 py-3 rounded-lg border-2 border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 resize-y"
            />
          </div>

          {/* Recursos Didácticos */}
          <div>
            <label htmlFor="recursosDidacticos" className="block text-sm font-bold text-slate-700 mb-2 tracking-wide uppercase">
              Recursos Didácticos
            </label>
            <textarea
              id="recursosDidacticos"
              value={formData.recursosDidacticos}
              onChange={(e) => handleChange('recursosDidacticos', e.target.value)}
              disabled={isSubmitting}
              required
              rows={4}
              placeholder="Lista de recursos didácticos necesarios para esta clase"
              className="block w-full px-4 py-3 rounded-lg border-2 border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 resize-y"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-lg font-bold rounded-lg shadow-lg hover:from-indigo-700 hover:to-indigo-800 hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generando Planificación...
                </span>
              ) : (
                'Generar Planificación Diaria'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
