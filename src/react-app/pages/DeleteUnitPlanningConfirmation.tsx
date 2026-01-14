import { useState } from "react";
import { useNavigate, useLocation } from "react-router";

export default function DeleteUnitPlanningConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { response?: any; returnPath?: string } | null;
  const [isDeleting, setIsDeleting] = useState(false);
  
  const response = state?.response;
  const returnPath = state?.returnPath || '/resumen-planificacion';
  const unitName = response?.response_data?.unidad || 'esta planificación';

  const handleConfirmDelete = async () => {
    setIsDeleting(true);

    try {
      console.log('🔍 [DELETE] Buscando datos en sessionStorage...');
      
      // Retrieve the planning data from sessionStorage
      const planningDataStr = sessionStorage.getItem('unitPlanningToDelete');
      
      console.log('📦 [DELETE] Datos en sessionStorage:', planningDataStr ? 'Encontrados' : 'NO ENCONTRADOS');
      
      if (!planningDataStr) {
        console.error('❌ No se encontró la planificación a eliminar');
        console.log('🔍 [DELETE] Intentando usar datos de location.state...');
        
        // Fallback: try to use data from location state
        const stateResponse = state?.response;
        if (stateResponse?.response_data) {
          const planningData = {
            correo: localStorage.getItem('userEmail') || '',
            unidad: stateResponse.response_data?.unidad || '',
            ...stateResponse.response_data
          };
          
          console.log('✅ [DELETE] Usando datos de location.state:', planningData);
          
          // Proceed with deletion using state data
          const deleteResponse = await fetch('/api/delete-unit-planning', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(planningData),
          });

          if (!deleteResponse.ok) {
            throw new Error('Error al eliminar la planificación');
          }

          console.log('✅ [DELETE UNIT] Planificación eliminada exitosamente');
          navigate(returnPath);
          return;
        }
        
        alert('Error: No se encontró la planificación a eliminar');
        setIsDeleting(false);
        return;
      }

      const planningData = JSON.parse(planningDataStr);
      
      console.log('🗑️ [DELETE UNIT] Enviando solicitud de eliminación al webhook');
      console.log('  - Planning Data:', planningData);
      
      // Send the planning data to the webhook
      const response = await fetch('/api/delete-unit-planning', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(planningData),
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la planificación');
      }

      console.log('✅ [DELETE UNIT] Planificación eliminada exitosamente');
      
      // Clean up sessionStorage
      sessionStorage.removeItem('unitPlanningToDelete');
      
      // Redirect back to summary page
      navigate(returnPath);
    } catch (error) {
      console.error('❌ [DELETE UNIT] Error deleting planning:', error);
      alert('Error al eliminar la planificación. Por favor, intenta de nuevo.');
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    navigate(returnPath);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h1 className="text-2xl font-bold">Confirmar Eliminación</h1>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-lg text-slate-700 mb-6">
            ¿Estás seguro de que deseas eliminar la planificación <span className="font-bold text-slate-900">"{unitName}"</span>?
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-yellow-900 mb-1">Advertencia</p>
                <p className="text-sm text-yellow-800">
                  Esta acción no se puede deshacer. Todos los datos asociados a esta planificación se eliminarán permanentemente.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all duration-200"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className={`flex-1 px-6 py-3 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 ${
                isDeleting 
                  ? 'bg-gray-400 cursor-wait' 
                  : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 hover:shadow-xl'
              }`}
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
                'Sí, Eliminar'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
