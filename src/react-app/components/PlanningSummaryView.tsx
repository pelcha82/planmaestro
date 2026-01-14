import { useState } from "react";
import { useNavigate } from "react-router";
import { PlanningSummary } from "@/shared/planning-types";

interface PlanningSummaryViewProps {
  summary: PlanningSummary & { id: number };
  onModify: () => void;
}

export default function PlanningSummaryView({ summary, onModify }: PlanningSummaryViewProps) {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveAndContinue = async () => {
    setIsSaving(true);
    // Navigate to daily planning creation
    navigate(`/crear-planificacion-diaria/${summary.id}`);
  };

  const renderSection = (label: string, value: string | null | undefined) => {
    if (!value) return null;
    
    return (
      <div className="mb-6">
        <h3 className="text-sm font-bold text-indigo-600 mb-2 tracking-wide uppercase">
          {label}
        </h3>
        <div className="bg-slate-50 rounded-lg p-4 text-slate-800 whitespace-pre-wrap">
          {value}
        </div>
      </div>
    );
  };

  const ActionButtons = () => (
    <div className="flex gap-3">
      <button
        onClick={onModify}
        className="flex-1 px-6 py-3 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300 transition-all duration-200 shadow-md hover:shadow-lg"
      >
        Modificar
      </button>
      <button
        onClick={handleSaveAndContinue}
        disabled={isSaving}
        className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:from-indigo-700 hover:to-indigo-800 hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? 'Guardando...' : 'Guardar y Enviar'}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Resumen de Planificación</h1>
          <p className="text-slate-600">Revisa y confirma todos los detalles de tu planificación</p>
        </div>

        {/* Action Buttons - Top */}
        <div className="mb-6">
          <ActionButtons />
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="border-b border-slate-200 pb-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Información Básica</h2>
              {renderSection('Centro Educativo', summary.centro_educativo)}
              {renderSection('Docente', summary.docente)}
              {renderSection('Grado', summary.grado)}
              {renderSection('Tiempo Asignado', summary.tiempo_asignado)}
              {renderSection('Asignatura', summary.asignatura)}
              {renderSection('Unidad', summary.unidad)}
            </div>

            {/* Competencies */}
            <div className="border-b border-slate-200 pb-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Competencias</h2>
              {renderSection('Contenidos Procedimentales', summary.contenidos_procedimentales)}
              {renderSection('Competencias Fundamentales', summary.competencias_fundamentales)}
              {renderSection('Competencias Específicas del Grado', summary.competencias_especificas_grado)}
              {renderSection('Ejes Transversal', summary.ejes_transversal)}
              {renderSection('Valores y Actitudes', summary.valores_actitudes)}
              {renderSection('Indicadores de Logro', summary.indicadores_logro)}
              {renderSection('Áreas Articuladas', summary.areas_articuladas)}
            </div>

            {/* Teaching Strategy */}
            <div className="border-b border-slate-200 pb-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Estrategia de Enseñanza-Aprendizaje</h2>
              {renderSection('Estrategia Enseñanza-Aprendizaje', summary.estrategia_ensenanza_aprendizaje)}
              {renderSection('Actividades de Enseñanza', summary.actividades_ensenanza)}
              {renderSection('Actividades de Aprendizaje', summary.actividades_aprendizaje)}
              {renderSection('Actividades de Evaluación', summary.actividades_evaluacion)}
            </div>

            {/* Resources and Timeline */}
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Recursos y Cronograma</h2>
              {renderSection('Recursos Didácticos', summary.recursos_didacticos)}
              {renderSection('Fecha Inicio', summary.fecha_inicio_date)}
              {renderSection('Fecha Fin', summary.fecha_fin_date)}
              {renderSection('Actividades', summary.actividades)}
            </div>
          </div>
        </div>

        {/* Action Buttons - Bottom */}
        <div className="mt-6">
          <ActionButtons />
        </div>
      </div>
    </div>
  );
}
