import { useState } from "react";

interface TeacherRegistrationFormEmbeddedProps {
  userEmail: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function TeacherRegistrationFormEmbedded({ userEmail, onSuccess, onCancel }: TeacherRegistrationFormEmbeddedProps) {
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
    const fechaInicio = formData.get('fechaInicio') as string;
    const fechaFin = formData.get('fechaFin') as string;

    try {
      // Prepare webhook data using userEmail and form data
      const webhookData = {
        correo: userEmail,
        centro_educativo: formData.get('centroEducativo') as string,
        nombre: formData.get('nombre') as string,
        apellido: formData.get('apellido') as string,
        codigo_telegram: '',
        grado: formData.get('grado') as string,
        asignatura: formData.get('asignatura') as string,
        unidad_tema: formData.get('unidadTema') as string,
        hora_planificacion: formData.get('horaPlanificacion') as string,
        // Form data
        unidad: formData.get('unidadTema') as string,
        recursos_didacticos: formData.get('recursosDidacticos') as string,
        fecha_inicio: formatDateToDDMMYYYY(fechaInicio),
        fecha_fin: formatDateToDDMMYYYY(fechaFin),
        estrategias_ensenanza_aprendizaje: ''
      };

      console.log('Enviando datos al webhook de creación:', webhookData);

      // Send data to the initial registration webhook (for first-time planning)
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Centro Educativo */}
      <div className="flex flex-col">
        <label 
          htmlFor="centroEducativo" 
          className="block text-sm font-semibold text-slate-700 mb-2 tracking-wide"
        >
          CENTRO EDUCATIVO
        </label>
        <input
          type="text"
          id="centroEducativo"
          name="centroEducativo"
          required
          disabled={isSubmitting}
          className="block w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="Ingresa el centro educativo"
        />
      </div>

      {/* Nombre */}
      <div className="flex flex-col">
        <label 
          htmlFor="nombre" 
          className="block text-sm font-semibold text-slate-700 mb-2 tracking-wide"
        >
          NOMBRE
        </label>
        <input
          type="text"
          id="nombre"
          name="nombre"
          required
          disabled={isSubmitting}
          className="block w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="Ingresa tu nombre"
        />
      </div>

      {/* Apellido */}
      <div className="flex flex-col">
        <label 
          htmlFor="apellido" 
          className="block text-sm font-semibold text-slate-700 mb-2 tracking-wide"
        >
          APELLIDO
        </label>
        <input
          type="text"
          id="apellido"
          name="apellido"
          required
          disabled={isSubmitting}
          className="block w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="Ingresa tu apellido"
        />
      </div>

      {/* Recursos Didácticos */}
      <div className="flex flex-col">
        <label 
          htmlFor="recursosDidacticos" 
          className="block text-sm font-semibold text-slate-700 mb-2 tracking-wide"
        >
          RECURSOS DIDÁCTICOS
        </label>
        <input
          type="text"
          id="recursosDidacticos"
          name="recursosDidacticos"
          required
          disabled={isSubmitting}
          className="block w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="Ingresa los recursos didácticos"
        />
      </div>

      {/* Grado */}
      <div className="flex flex-col">
        <label 
          htmlFor="grado" 
          className="block text-sm font-semibold text-slate-700 mb-2 tracking-wide"
        >
          GRADO
        </label>
        <select
          id="grado"
          name="grado"
          required
          disabled={isSubmitting}
          className="block w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="1er">1er</option>
          <option value="2do">2do</option>
          <option value="3ro">3ro</option>
          <option value="4to">4to</option>
          <option value="5to">5to</option>
          <option value="6to">6to</option>
        </select>
      </div>

      {/* Asignatura */}
      <div className="flex flex-col">
        <label 
          htmlFor="asignatura" 
          className="block text-sm font-semibold text-slate-700 mb-2 tracking-wide"
        >
          ASIGNATURA
        </label>
        <select
          id="asignatura"
          name="asignatura"
          required
          disabled={isSubmitting}
          className="block w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="Lengua Española">Lengua Española</option>
          <option value="Matemáticas">Matemáticas</option>
          <option value="Ciencias Naturales">Ciencias Naturales</option>
          <option value="Ciencias Sociales">Ciencias Sociales</option>
        </select>
      </div>

      {/* Unidad/Tema */}
      <div className="flex flex-col">
        <label 
          htmlFor="unidadTema" 
          className="block text-sm font-semibold text-slate-700 mb-2 tracking-wide"
        >
          UNIDAD/TEMA
        </label>
        <select
          id="unidadTema"
          name="unidadTema"
          required
          disabled={isSubmitting}
          className="block w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="Tarjeta de Presentación">Tarjeta de Presentación</option>
          <option value="Lista de Asistencia">Lista de Asistencia</option>
          <option value="El letrero">El letrero</option>
          <option value="El cuento">El cuento</option>
          <option value="El mensaje corto">El mensaje corto</option>
          <option value="La noticia">La noticia</option>
          <option value="La lista de compra">La lista de compra</option>
        </select>
      </div>

      {/* Hora de la planificación */}
      <div className="flex flex-col">
        <label 
          htmlFor="horaPlanificacion" 
          className="block text-sm font-semibold text-slate-700 mb-2 tracking-wide"
        >
          HORA DE LA PLANIFICACIÓN
        </label>
        <select
          id="horaPlanificacion"
          name="horaPlanificacion"
          required
          disabled={isSubmitting}
          className="block w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="4:00 PM">4:00 PM</option>
          <option value="4:30 PM">4:30 PM</option>
          <option value="5:00 PM">5:00 PM</option>
          <option value="5:30 PM">5:30 PM</option>
          <option value="6:00 PM">6:00 PM</option>
          <option value="6:30 PM">6:30 PM</option>
          <option value="7:00 PM">7:00 PM</option>
          <option value="7:30 PM">7:30 PM</option>
          <option value="8:00 PM">8:00 PM</option>
          <option value="8:30 PM">8:30 PM</option>
          <option value="9:00 PM">9:00 PM</option>
          <option value="9:30 PM">9:30 PM</option>
          <option value="10:00 PM">10:00 PM</option>
          <option value="10:30 PM">10:30 PM</option>
          <option value="11:00 PM">11:00 PM</option>
          <option value="11:30 PM">11:30 PM</option>
        </select>
      </div>

      {/* Fecha Inicio */}
      <div className="flex flex-col">
        <label 
          htmlFor="fechaInicio" 
          className="block text-sm font-semibold text-slate-700 mb-2 tracking-wide"
        >
          FECHA INICIO
        </label>
        <input
          type="date"
          id="fechaInicio"
          name="fechaInicio"
          required
          disabled={isSubmitting}
          className="block w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Fecha Fin */}
      <div className="flex flex-col">
        <label 
          htmlFor="fechaFin" 
          className="block text-sm font-semibold text-slate-700 mb-2 tracking-wide"
        >
          FECHA FIN
        </label>
        <input
          type="date"
          id="fechaFin"
          name="fechaFin"
          required
          disabled={isSubmitting}
          className="block w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
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
