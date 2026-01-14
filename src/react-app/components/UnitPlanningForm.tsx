import { useState } from "react";

interface UnitPlanningFormProps {
  userEmail: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function UnitPlanningForm({ userEmail, onSuccess, onCancel }: UnitPlanningFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  const formatDateToDDMMYYYY = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const titulo = formData.get('titulo') as string;
    const descripcion = formData.get('descripcion') as string;
    const fechaInicio = formData.get('fecha_inicio_date') as string;
    const fechaFin = formData.get('fecha_fin_date') as string;

    try {
      // Prepare webhook data using userEmail and form data
      const webhookData = {
        correo: userEmail,
        unidad: titulo,
        recursos_didacticos: descripcion || '',
        fecha_inicio: formatDateToDDMMYYYY(fechaInicio),
        fecha_fin: formatDateToDDMMYYYY(fechaFin),
        estrategias_ensenanza_aprendizaje: ''
      };

      console.log('Enviando datos al webhook de creación:', webhookData);

      // Send data directly to the webhook
      const webhookResponse = await fetch('https://n8n.srv1144975.hstgr.cloud/webhook/2b437f86-685f-4fd9-a2e5-ca934995dd1c', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData),
      });

      console.log('Respuesta del webhook:', webhookResponse.status, webhookResponse.statusText);

      if (!webhookResponse.ok) {
        throw new Error(`Error del webhook: ${webhookResponse.status} ${webhookResponse.statusText}`);
      }

      // Get the webhook response
      const webhookResponseText = await webhookResponse.text();
      console.log('Cuerpo de respuesta del webhook:', webhookResponseText);

      // Show success message
      setIsSubmitting(false);
      setError(""); // Clear any previous errors
      
      // Show success message to user
      alert('Planificación generada satisfactoriamente');
      
      // Refresh the unit list by fetching from the new webhook
      try {
        console.log('Solicitando actualización de lista de unidades con correo:', userEmail);
        
        const refreshResponse = await fetch('https://apocalipsis.app.n8n.cloud/webhook/9425cc30-3ea8-46d3-b228-4ba52dec7d31', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ correo: userEmail }),
        });

        console.log('Respuesta de actualización:', refreshResponse.status);
        
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.text();
          console.log('Lista actualizada recibida:', refreshData);
        }
      } catch (refreshError) {
        console.error('Error al actualizar lista (no crítico):', refreshError);
      }
      
      // Call onSuccess to refresh and close the form
      onSuccess();

    } catch (err) {
      console.error('Error en handleSubmit:', err);
      setError(err instanceof Error ? err.message : 'Error al crear planificación');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="titulo" className="block text-sm font-semibold text-slate-700 mb-2">
          TÍTULO
        </label>
        <select
          id="titulo"
          name="titulo"
          required
          disabled={isSubmitting}
          className="block w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
        >
          <option value="">-- Selecciona una unidad --</option>
          <option value="Secuencia 1: Los Números hasta el 10">Secuencia 1: Los Números hasta el 10</option>
          <option value="Secuencia 2: Números hasta el 31">Secuencia 2: Números hasta el 31</option>
          <option value="Secuencia 3: Operaciones y Números hasta el 100">Secuencia 3: Operaciones y Números hasta el 100</option>
          <option value="Secuencia 4: Datos y Operaciones">Secuencia 4: Datos y Operaciones</option>
          <option value="Secuencia 5: Números, Medición y Operaciones">Secuencia 5: Números, Medición y Operaciones</option>
          <option value="Secuencia 6: Números, Medición y Geometría">Secuencia 6: Números, Medición y Geometría</option>
        </select>
      </div>

      <div>
        <label htmlFor="descripcion" className="block text-sm font-semibold text-slate-700 mb-2">
          RECURSOS DIDÁCTICOS PARA ESTA UNIDAD
        </label>
        <textarea
          id="descripcion"
          name="descripcion"
          rows={3}
          disabled={isSubmitting}
          className="block w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
          placeholder="Recursos didácticos que se utilizarán en esta unidad..."
        />
      </div>

      <div>
        <label htmlFor="fecha_inicio_date" className="block text-sm font-semibold text-slate-700 mb-2">
          FECHA INICIO
        </label>
        <input
          type="date"
          id="fecha_inicio_date"
          name="fecha_inicio_date"
          disabled={isSubmitting}
          className="block w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
        />
      </div>

      <div>
        <label htmlFor="fecha_fin_date" className="block text-sm font-semibold text-slate-700 mb-2">
          FECHA FIN
        </label>
        <input
          type="date"
          id="fecha_fin_date"
          name="fecha_fin_date"
          disabled={isSubmitting}
          className="block w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Creando...' : 'Crear'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
