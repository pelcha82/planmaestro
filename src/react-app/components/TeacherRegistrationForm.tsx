import { useState } from "react";
import { useNavigate } from "react-router";

export default function TeacherRegistrationForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      correo: formData.get('correo') as string,
      centro_educativo: formData.get('centroEducativo') as string,
      nombre: formData.get('nombre') as string,
      apellido: formData.get('apellido') as string,
      recursos_didacticos: formData.get('recursosDidacticos') as string,
      codigo_telegram: '',
      grado: formData.get('grado') as string,
      asignatura: formData.get('asignatura') as string,
      unidad_tema: formData.get('unidadTema') as string,
      hora_planificacion: formData.get('horaPlanificacion') as string,
      fecha_inicio_date: formData.get('fechaInicio') as string,
      fecha_fin_date: formData.get('fechaFin') as string
    };

    try {
      console.log('Guardando datos del maestro:', data);
      
      // Save teacher data to the database
      const response = await fetch('/api/register-teacher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log('Respuesta del servidor:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Error al guardar datos');
      }

      console.log('Maestro registrado exitosamente en la base de datos');
      
      // Store teacher ID in localStorage for later use
      const teacherId = result.id;
      localStorage.setItem('teacherId', teacherId.toString());
      
      // 🆕 Store teacher data in localStorage for immediate access
      localStorage.setItem('teacherNombre', data.nombre);
      localStorage.setItem('teacherApellido', data.apellido);
      localStorage.setItem('teacherCentroEducativo', data.centro_educativo);
      console.log('✅ Datos del docente guardados en localStorage:', {
        nombre: data.nombre,
        apellido: data.apellido,
        centro_educativo: data.centro_educativo
      });
      
      // Send data to webhook (non-blocking)
      try {
        console.log('Enviando datos al webhook...');
        const webhookResponse = await fetch('/api/send-teacher-to-n8n', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        const webhookResult = await webhookResponse.json();
        console.log('Respuesta del webhook:', webhookResult);

        if (!webhookResponse.ok) {
          console.error('Error al enviar al webhook (continuando de todas formas):', webhookResult.error);
        } else {
          console.log('Datos enviados exitosamente al webhook');
        }
      } catch (webhookError) {
        console.error('Error al enviar al webhook (continuando de todas formas):', webhookError);
      }
      
      // Redirect to planning summary
      setIsSubmitting(false);
      navigate('/resumen-planificacion');

    } catch (err) {
      console.error('Error al enviar datos:', err);
      setError(err instanceof Error ? err.message : 'Error al guardar datos del maestro');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12">
      <div className="w-full max-w-2xl px-6">
        <form 
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 backdrop-blur-sm"
        >
          <h2 className="text-3xl font-bold text-center mb-8 text-slate-800 tracking-tight">
            Registro para Maestros
          </h2>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          
          
          <div className="space-y-6">
            {/* Correo Electrónico */}
            <div className="flex flex-col">
              <label 
                htmlFor="correo" 
                className="block text-sm font-semibold text-slate-700 mb-2 tracking-wide"
              >
                CORREO ELECTRÓNICO
              </label>
              <input
                type="email"
                id="correo"
                name="correo"
                required
                disabled={isSubmitting}
                className="block w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="tu@email.com"
              />
            </div>

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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-8 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:from-indigo-700 hover:to-indigo-800 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? 'Enviando...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
