import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";

export default function DeleteDailyPlanningConfirmation() {
  const navigate = useNavigate();
  const { planningId } = useParams<{ planningId: string }>();
  const [isDeleting, setIsDeleting] = useState(false);
  const [planningInfo, setPlanningInfo] = useState<{ tema?: string; isUUID: boolean } | null>(null);

  useEffect(() => {
    if (!planningId) {
      console.error('❌ [DELETE] No se recibió ID de planificación en la URL');
      return;
    }

    console.log('🔍 [DELETE] ID recibido en URL:', planningId);
    
    // Determine if this is a UUID or composite ID
    const isUUID = planningId.length > 30 && planningId.includes('-');
    console.log('🆔 [DELETE] Tipo de ID:', isUUID ? 'UUID (nueva planificación)' : 'ID Compuesto (planificación vieja)');
    
    // Try to extract topic name from composite ID for display
    let tema = 'esta planificación';
    if (!isUUID && planningId.includes('-')) {
      const parts = planningId.split('-');
      if (parts.length > 1) {
        tema = parts.slice(1).join('-');
      }
    }
    
    setPlanningInfo({ tema, isUUID });
  }, [planningId]);

  const handleConfirmDelete = async () => {
    if (!planningId) {
      alert('Error: No se encontró el ID de la planificación');
      return;
    }

    setIsDeleting(true);

    try {
      console.log('🗑️ [DELETE] Iniciando eliminación de planificación');
      console.log('  - Planning ID:', planningId);
      console.log('  - Tipo:', planningInfo?.isUUID ? 'UUID' : 'ID Compuesto');
      
      // Send the planning ID to the backend
      // The backend will forward it to the webhook ELIMINARPLANIFICACIONDIARIA
      const response = await fetch('/api/delete-daily-planning', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: planningId
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [DELETE] Error del servidor:', response.status, errorText);
        throw new Error('Error al eliminar la planificación');
      }

      const result = await response.json();
      console.log('✅ [DELETE] Respuesta del servidor:', result);
      console.log('✅ [DELETE] Planificación eliminada exitosamente');
      
      // Clean up any leftover sessionStorage (for backwards compatibility)
      sessionStorage.removeItem('planningToDelete');
      
      // Redirect back to daily planning page
      navigate('/crear-planificacion-diaria/nueva');
    } catch (error) {
      console.error('❌ [DELETE] Error deleting planning:', error);
      alert('Error al eliminar la planificación. Por favor, intenta de nuevo.');
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  if (!planningId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center py-8 px-4">
        <div className="text-center">
          <p className="text-red-600 font-bold text-lg">Error: No se encontró el ID de la planificación</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center py-8 px-4">
      <div className="max-w-md w-full">
        {/* Confirmation Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          {/* Warning Icon */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 p-8 text-center border-b border-red-100">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">¿Estás seguro?</h2>
            <p className="text-slate-600">Esta acción no se puede deshacer</p>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800 leading-relaxed">
                <strong className="font-bold">Advertencia:</strong> Estás a punto de eliminar permanentemente esta planificación diaria. 
                Todos los datos asociados se perderán y no podrás recuperarlos.
              </p>
            </div>

            {planningInfo && !planningInfo.isUUID && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong className="font-bold">Planificación:</strong> {planningInfo.tema}
                </p>
              </div>
            )}

            <p className="text-slate-700 mb-6 text-center">
              ¿Confirmas que deseas borrar esta planificación?
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="w-full px-6 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white text-lg font-bold rounded-lg shadow-lg hover:from-red-700 hover:to-red-800 hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Eliminando...
                  </span>
                ) : (
                  <>
                    <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Sí, Eliminar Planificación
                  </>
                )}
              </button>
              
              <button
                onClick={handleCancel}
                disabled={isDeleting}
                className="w-full px-6 py-4 border-2 border-slate-300 text-slate-700 text-lg font-bold rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                No, Volver Atrás
              </button>
            </div>
          </div>
        </div>

        {/* Info Text */}
        <p className="text-center text-sm text-slate-500 mt-4">
          Presiona "No, Volver Atrás" si cambiaste de opinión
        </p>
        
        {/* Debug Info - only visible in development */}
        {planningInfo && (
          <div className="mt-4 p-3 bg-slate-100 rounded-lg text-xs text-slate-600 font-mono">
            <p><strong>ID:</strong> {planningId}</p>
            <p><strong>Tipo:</strong> {planningInfo.isUUID ? 'UUID' : 'ID Compuesto'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
