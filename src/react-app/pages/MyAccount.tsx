import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

interface TeacherData {
  correo: string;
  centro_educativo: string;
  nombre: string;
  apellido: string;
  recursos_didacticos: string;
  codigo_telegram: string;
  grado: string;
  asignatura: string;
  unidad_tema: string;
  hora_planificacion: string;
  fecha_inicio: string;
  fecha_fin: string;
}

export default function MyAccount() {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('userEmail');
  const [teacherData, setTeacherData] = useState<TeacherData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  useEffect(() => {
    if (!userEmail) {
      navigate('/login');
      return;
    }
    loadTeacherData();
  }, [userEmail, navigate]);

  const loadTeacherData = async () => {
    try {
      setIsLoading(true);
      setError("");
      
      console.log('Obteniendo datos del maestro para correo:', userEmail);
      
      // Call the backend API to get teacher account data
      const response = await fetch('/api/get-teacher-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ correo: userEmail }),
      });

      console.log('Respuesta del API:', response.status);

      if (!response.ok) {
        throw new Error('Error al obtener datos del maestro');
      }

      const result = await response.json();
      console.log('Datos recibidos del API');

      if (!result.success) {
        throw new Error(result.error || 'Error al obtener datos del maestro');
      }

      const data = result.data;

      // If the webhook returns an array, take the first element
      const teacherInfo = Array.isArray(data) ? data[0] : data;

      if (!teacherInfo || typeof teacherInfo !== 'object') {
        throw new Error('No se encontraron datos del maestro');
      }

      // Log all available fields from webhook for debugging
      console.log('📋 [MI CUENTA] Campos disponibles del webhook:', Object.keys(teacherInfo));
      console.log('📋 [MI CUENTA] Datos completos del webhook:', teacherInfo);

      // Map the webhook data to our TeacherData interface
      // Priority: Use exact field names from new webhook (nombre, correo, centro_educativo)
      const mappedData = {
        correo: teacherInfo.correo || teacherInfo.Correo || teacherInfo.CORREO || userEmail || '',
        centro_educativo: teacherInfo.centro_educativo || 
                         teacherInfo['centro educativo'] || 
                         teacherInfo['Centro Educativo'] || 
                         teacherInfo['CENTRO EDUCATIVO'] ||
                         teacherInfo.centroEducativo || 
                         teacherInfo['Centro educativo'] || '',
        nombre: teacherInfo.nombre || teacherInfo.Nombre || teacherInfo.NOMBRE || '',
        apellido: teacherInfo.apellido || teacherInfo.Apellido || teacherInfo.APELLIDO || '',
        recursos_didacticos: teacherInfo.recursos_didacticos || teacherInfo['recursos didacticos'] || teacherInfo.recursosDidacticos || '',
        codigo_telegram: teacherInfo.codigo_telegram || teacherInfo.codigoTelegram || '',
        grado: teacherInfo.grado || teacherInfo.Grado || teacherInfo.GRADO || '',
        asignatura: teacherInfo.asignatura || teacherInfo.Asignatura || teacherInfo.ASIGNATURA || '',
        unidad_tema: teacherInfo.unidad_tema || teacherInfo.unidad || teacherInfo.Unidad || teacherInfo['unidad/tema'] || '',
        hora_planificacion: teacherInfo.hora_planificacion || teacherInfo['hora de planificacion'] || teacherInfo.horaPlanificacion || '',
        fecha_inicio: teacherInfo.fecha_inicio || teacherInfo.fecha_inicio_date || teacherInfo.fechaInicio || '',
        fecha_fin: teacherInfo.fecha_fin || teacherInfo.fecha_fin_date || teacherInfo.fechaFin || '',
      };
      
      console.log('✅ [MI CUENTA] Datos mapeados:', {
        nombre: mappedData.nombre,
        correo: mappedData.correo,
        centro_educativo: mappedData.centro_educativo
      });

      setTeacherData(mappedData);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccessMessage("");

    const formData = new FormData(e.currentTarget);
    const newCentroEducativo = formData.get('centro_educativo') as string;
    const correo = formData.get('correo') as string;

    try {
      console.log('🏫 [MI CUENTA] Actualizando centro educativo');
      console.log('  - Correo:', correo);
      console.log('  - Nuevo centro educativo:', newCentroEducativo);
      
      // Send correo and new centro_educativo to the backend API
      const response = await fetch('/api/update-teacher-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          correo: correo,
          centro_educativo: newCentroEducativo
        }),
      });

      console.log('✅ [MI CUENTA] Respuesta de actualización:', response.status);

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Error al actualizar centro educativo');
      }
      
      setSuccessMessage('Centro educativo actualizado exitosamente');
      setIsEditing(false);
      
      // Reload teacher data
      await loadTeacherData();
    } catch (err) {
      console.error('❌ [MI CUENTA] Error al actualizar:', err);
      setError(err instanceof Error ? err.message : 'Error al actualizar centro educativo');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 text-slate-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (!teacherData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">No se encontraron datos</h2>
          <p className="text-slate-600 mb-6">No hay información disponible para este usuario.</p>
          <button
            onClick={() => navigate('/resumen-planificacion')}
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all duration-200"
          >
            Volver a Planificaciones
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-800 mb-2">Mi Cuenta</h1>
              <p className="text-slate-600">Gestiona tu información personal</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/resumen-planificacion')}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Volver a Planificaciones
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200 font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {successMessage}
          </div>
        )}

        {/* User Info Panel */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl shadow-xl p-8 mb-8 text-white">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-1">
                {teacherData.nombre && teacherData.apellido 
                  ? `${teacherData.nombre} ${teacherData.apellido}`
                  : teacherData.nombre || teacherData.apellido || 'Usuario'}
              </h2>
              <p className="text-indigo-100 text-lg">Docente</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-indigo-200 text-sm font-semibold mb-1 uppercase tracking-wide">Correo Electrónico</div>
              <div className="text-white text-lg font-medium">{teacherData.correo}</div>
            </div>
            
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-indigo-200 text-sm font-semibold mb-1 uppercase tracking-wide">Centro Educativo</div>
              <div className="text-white text-lg font-medium">{teacherData.centro_educativo || 'No especificado'}</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          {!isEditing ? (
            // View Mode
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Información Personal</h2>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Editar Centro Educativo
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="text-sm font-bold text-indigo-600 mb-2 uppercase tracking-wide">Correo Electrónico</div>
                  <div className="text-slate-800">{teacherData.correo}</div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="text-sm font-bold text-indigo-600 mb-2 uppercase tracking-wide">Centro Educativo</div>
                  <div className="text-slate-800">{teacherData.centro_educativo || 'No especificado'}</div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="text-sm font-bold text-indigo-600 mb-2 uppercase tracking-wide">Nombre</div>
                  <div className="text-slate-800">{teacherData.nombre || 'No especificado'}</div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="text-sm font-bold text-indigo-600 mb-2 uppercase tracking-wide">Apellido</div>
                  <div className="text-slate-800">{teacherData.apellido || 'No especificado'}</div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="text-sm font-bold text-indigo-600 mb-2 uppercase tracking-wide">Grado</div>
                  <div className="text-slate-800">{teacherData.grado || 'No especificado'}</div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="text-sm font-bold text-indigo-600 mb-2 uppercase tracking-wide">Asignatura</div>
                  <div className="text-slate-800">{teacherData.asignatura || 'No especificado'}</div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="text-sm font-bold text-indigo-600 mb-2 uppercase tracking-wide">Unidad/Tema</div>
                  <div className="text-slate-800">{teacherData.unidad_tema || 'No especificado'}</div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="text-sm font-bold text-indigo-600 mb-2 uppercase tracking-wide">Hora de Planificación</div>
                  <div className="text-slate-800">{teacherData.hora_planificacion || 'No especificado'}</div>
                </div>
              </div>
            </div>
          ) : (
            // Edit Mode - Only centro educativo is editable
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Editar Centro Educativo</h2>
                <p className="text-slate-600 mt-2">Solo puedes modificar el nombre del centro educativo. Los demás datos no son editables.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="block text-sm font-semibold text-slate-700 mb-2 tracking-wide">CORREO ELECTRÓNICO</div>
                  <div className="block w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-600">
                    {teacherData.correo}
                  </div>
                </div>

                <div>
                  <label htmlFor="centro_educativo" className="block text-sm font-semibold text-slate-700 mb-2 tracking-wide">
                    CENTRO EDUCATIVO
                  </label>
                  <input
                    type="text"
                    id="centro_educativo"
                    name="centro_educativo"
                    defaultValue={teacherData.centro_educativo}
                    required
                    disabled={isSaving}
                    className="block w-full px-4 py-3 rounded-lg border-2 border-indigo-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
                  />
                </div>

                <div>
                  <div className="block text-sm font-semibold text-slate-700 mb-2 tracking-wide">NOMBRE</div>
                  <div className="block w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-600">
                    {teacherData.nombre || 'No especificado'}
                  </div>
                </div>

                <div>
                  <div className="block text-sm font-semibold text-slate-700 mb-2 tracking-wide">APELLIDO</div>
                  <div className="block w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-600">
                    {teacherData.apellido || 'No especificado'}
                  </div>
                </div>

                <div>
                  <div className="block text-sm font-semibold text-slate-700 mb-2 tracking-wide">GRADO</div>
                  <div className="block w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-600">
                    {teacherData.grado || 'No especificado'}
                  </div>
                </div>

                <div>
                  <div className="block text-sm font-semibold text-slate-700 mb-2 tracking-wide">ASIGNATURA</div>
                  <div className="block w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-600">
                    {teacherData.asignatura || 'No especificado'}
                  </div>
                </div>

                <input type="hidden" name="correo" value={teacherData.correo} />
                <input type="hidden" name="nombre" value={teacherData.nombre} />
                <input type="hidden" name="apellido" value={teacherData.apellido} />
                <input type="hidden" name="grado" value={teacherData.grado} />
                <input type="hidden" name="asignatura" value={teacherData.asignatura} />
                <input type="hidden" name="recursos_didacticos" value={teacherData.recursos_didacticos} />
                <input type="hidden" name="codigo_telegram" value={teacherData.codigo_telegram} />
                <input type="hidden" name="unidad_tema" value={teacherData.unidad_tema} />
                <input type="hidden" name="hora_planificacion" value={teacherData.hora_planificacion} />
                <input type="hidden" name="fecha_inicio" value={teacherData.fecha_inicio} />
                <input type="hidden" name="fecha_fin" value={teacherData.fecha_fin} />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setError("");
                  }}
                  disabled={isSaving}
                  className="px-6 py-3 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:from-indigo-700 hover:to-indigo-800 hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Guardando...' : 'Actualizar Centro Educativo'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
