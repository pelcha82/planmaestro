import { useState, useEffect } from "react";

interface WebhookResponse {
  id: number;
  teacher_registration_id: number | null;
  unit_planning_id: number | null;
  response_data: any;
  created_at: string;
  updated_at: string;
}

interface WebhookResponsesListProps {
  teacherId: number;
}

export default function WebhookResponsesList({ teacherId }: WebhookResponsesListProps) {
  const [responses, setResponses] = useState<WebhookResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  useEffect(() => {
    // Automatically request webhook response when component mounts
    requestWebhookResponse();
  }, [teacherId]);

  const requestWebhookResponse = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const response = await fetch('/api/request-webhook-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teacher_registration_id: teacherId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al solicitar respuesta del webhook');
      }

      // Load the saved response
      await loadResponses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al solicitar respuesta del webhook');
      setIsLoading(false);
    }
  };

  const loadResponses = async () => {
    try {
      const response = await fetch(`/api/webhook-responses/${teacherId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al cargar respuestas');
      }

      // Filter out responses that have no data
      const filteredResponses = result.data.filter((resp: WebhookResponse) => {
        if (!resp.response_data || typeof resp.response_data !== 'object') {
          return false;
        }
        
        // Check if response has at least one field with actual data
        return Object.entries(resp.response_data).some(([key, value]) => {
          // Skip internal fields
          if (key === 'teacher_registration_id' || key === 'unit_planning_id') {
            return false;
          }
          
          // Skip "row number" field (case insensitive)
          if (key.toLowerCase().replace(/[_\s]/g, '') === 'rownumber') {
            return false;
          }
          
          // Check if value has actual data
          if (value === null || value === undefined || value === '') {
            return false;
          }
          if (Array.isArray(value) && value.length === 0) {
            return false;
          }
          if (typeof value === 'object' && Object.keys(value).length === 0) {
            return false;
          }
          
          return true;
        });
      });

      // Deduplicate by "unidad" field - keep only the most recent response for each unique unidad
      const seenUnidades = new Map<string, WebhookResponse>();
      
      for (const resp of filteredResponses) {
        if (resp.response_data && typeof resp.response_data === 'object') {
          const unidad = resp.response_data.unidad;
          
          // Only deduplicate if unidad field exists and has a value
          if (unidad && unidad !== null && unidad !== undefined && unidad !== '') {
            const unidadKey = String(unidad).toLowerCase().trim();
            
            // Keep the first occurrence (most recent since results are ordered by created_at DESC)
            if (!seenUnidades.has(unidadKey)) {
              seenUnidades.set(unidadKey, resp);
            }
          } else {
            // If no unidad field, keep the response (don't filter it out)
            // Use a unique key based on the response ID to avoid conflicts
            seenUnidades.set(`no-unidad-${resp.id}`, resp);
          }
        }
      }
      
      const deduplicatedResponses = Array.from(seenUnidades.values());

      setResponses(deduplicatedResponses);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar respuestas');
    } finally {
      setIsLoading(false);
    }
  };

  

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
        <h3 className="text-xl font-bold text-slate-800 mb-4">Respuestas del Sistema</h3>
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-slate-800">Respuestas del Sistema</h3>
        <button
          onClick={loadResponses}
          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
          title="Actualizar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {responses.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="font-semibold">No hay respuestas recibidas</p>
          <p className="text-sm mt-1">Las respuestas del sistema aparecerán aquí</p>
        </div>
      ) : (
        <div>
          {/* Navigation Controls */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
            <button
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Anterior
            </button>
            
            <div className="text-sm font-semibold text-slate-700">
              Respuesta {currentIndex + 1} de {responses.length}
            </div>
            
            <button
              onClick={() => setCurrentIndex(Math.min(responses.length - 1, currentIndex + 1))}
              disabled={currentIndex === responses.length - 1}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Siguiente
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Current Response */}
          {responses[currentIndex] && (
            <div className="border border-slate-200 rounded-lg overflow-hidden bg-gradient-to-r from-slate-50 to-white shadow-md">
              {/* Header Section - Personal Data */}
              {responses[currentIndex].response_data && typeof responses[currentIndex].response_data === 'object' && (
                <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 p-8 text-white shadow-lg">
                  {/* Status Badge and Timestamp */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-xs font-medium opacity-90 tracking-wide">
                      {new Date(responses[currentIndex].created_at).toLocaleString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-400 text-emerald-950 shadow-sm">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Recibido
                    </span>
                  </div>
                  
                  {/* Información del Docente y Académica */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Nombre */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                      <div className="text-xs font-bold uppercase tracking-widest opacity-75 mb-2 text-indigo-100">
                        Nombre
                      </div>
                      <div className="text-xl font-bold">
                        {responses[currentIndex].response_data['Nombre'] 
                          ? String(responses[currentIndex].response_data['Nombre']) 
                          : 'N/A'}
                      </div>
                    </div>
                    
                    {/* Apellido */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                      <div className="text-xs font-bold uppercase tracking-widest opacity-75 mb-2 text-indigo-100">
                        Apellido
                      </div>
                      <div className="text-xl font-bold">
                        {responses[currentIndex].response_data['Apellido'] 
                          ? String(responses[currentIndex].response_data['Apellido']) 
                          : 'N/A'}
                      </div>
                    </div>
                    
                    {/* Centro Educativo */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                      <div className="text-xs font-bold uppercase tracking-widest opacity-75 mb-2 text-indigo-100">
                        Centro Educativo
                      </div>
                      <div className="text-xl font-bold">
                        {responses[currentIndex].response_data['centro educativo'] 
                          ? String(responses[currentIndex].response_data['centro educativo']) 
                          : 'N/A'}
                      </div>
                    </div>
                    
                    {/* Correo Electrónico */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                      <div className="text-xs font-bold uppercase tracking-widest opacity-75 mb-2 text-indigo-100">
                        Correo Electrónico
                      </div>
                      <div className="text-xl font-bold break-all">
                        {responses[currentIndex].response_data['Correo'] 
                          ? String(responses[currentIndex].response_data['Correo']) 
                          : 'N/A'}
                      </div>
                    </div>
                    
                    {/* Grado */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                      <div className="text-xs font-bold uppercase tracking-widest opacity-75 mb-2 text-indigo-100">
                        Grado
                      </div>
                      <div className="text-xl font-bold">
                        {responses[currentIndex].response_data['grado'] 
                          ? String(responses[currentIndex].response_data['grado']) 
                          : 'N/A'}
                      </div>
                    </div>
                    
                    {/* Asignatura */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                      <div className="text-xs font-bold uppercase tracking-widest opacity-75 mb-2 text-indigo-100">
                        Asignatura
                      </div>
                      <div className="text-xl font-bold">
                        {responses[currentIndex].response_data['asignatura'] 
                          ? String(responses[currentIndex].response_data['asignatura']) 
                          : 'N/A'}
                      </div>
                    </div>
                    
                    {/* Unidad Temática */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                      <div className="text-xs font-bold uppercase tracking-widest opacity-75 mb-2 text-indigo-100">
                        Unidad Temática
                      </div>
                      <div className="text-xl font-bold">
                        {responses[currentIndex].response_data['unidad'] 
                          ? String(responses[currentIndex].response_data['unidad']) 
                          : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Content Section - Other Data */}
              <div className="p-8 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
                {responses[currentIndex].response_data && typeof responses[currentIndex].response_data === 'object' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(responses[currentIndex].response_data).map(([key, value]) => {
                      // Skip internal fields
                      if (key === 'teacher_registration_id' || key === 'unit_planning_id') {
                        return null;
                      }
                      
                      // Skip "row number" field (case insensitive)
                      if (key.toLowerCase().replace(/[_\s]/g, '') === 'rownumber') {
                        return null;
                      }
                      
                      // Skip personal data fields (already shown in header)
                      if (['Nombre', 'nombre', 'Apellido', 'apellido', 'centro educativo', 'centro_educativo', 'grado', 'asignatura', 'unidad', 'Correo', 'correo'].includes(key)) {
                        return null;
                      }
                      
                      // Skip empty fields (null, undefined, empty string, empty array)
                      if (value === null || value === undefined || value === '') {
                        return null;
                      }
                      if (Array.isArray(value) && value.length === 0) {
                        return null;
                      }
                      if (typeof value === 'object' && Object.keys(value).length === 0) {
                        return null;
                      }
                      
                      return (
                        <div key={key} className="bg-white/80 backdrop-blur-sm rounded-lg p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                          <div className="text-lg font-bold text-blue-600 mb-3 capitalize">
                            {key.replace(/_/g, ' ')}
                          </div>
                          <div className="text-base font-normal text-slate-700 leading-relaxed break-words">
                            {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
