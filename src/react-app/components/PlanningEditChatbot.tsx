import { useState } from "react";
import { PlanningSummary, EDITABLE_SECTIONS } from "@/shared/planning-types";

interface PlanningEditChatbotProps {
  summary: PlanningSummary & { id: number };
  onSave: (updates: Partial<PlanningSummary>) => Promise<void>;
  onCancel: () => void;
}

export default function PlanningEditChatbot({ summary, onSave, onCancel }: PlanningEditChatbotProps) {
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [editValue, setEditValue] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>("");

  const handleSectionChange = (section: string) => {
    setSelectedSection(section);
    const currentValue = summary[section as keyof PlanningSummary];
    setEditValue(currentValue?.toString() || "");
    setError("");
  };

  const handleSave = async () => {
    if (!selectedSection) {
      setError("Por favor selecciona una sección para editar");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      await onSave({ [selectedSection]: editValue });
      setSelectedSection("");
      setEditValue("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar cambios");
    } finally {
      setIsSaving(false);
    }
  };

  const selectedSectionLabel = EDITABLE_SECTIONS.find(s => s.value === selectedSection)?.label;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Editar Planificación</h1>
          <p className="text-slate-600">Selecciona la sección que deseas modificar</p>
        </div>

        {/* Chatbot Interface */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Section Selector */}
          <div className="mb-6">
            <label htmlFor="section" className="block text-sm font-semibold text-slate-700 mb-3 tracking-wide">
              SELECCIONA LA SECCIÓN A EDITAR
            </label>
            <select
              id="section"
              value={selectedSection}
              onChange={(e) => handleSectionChange(e.target.value)}
              disabled={isSaving}
              className="block w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
            >
              <option value="">-- Selecciona una opción --</option>
              {EDITABLE_SECTIONS.map((section) => (
                <option key={section.value} value={section.value}>
                  {section.label}
                </option>
              ))}
            </select>
          </div>

          {/* Editor */}
          {selectedSection && (
            <div className="mb-6 animate-fadeIn">
              <label htmlFor="editValue" className="block text-sm font-semibold text-slate-700 mb-3 tracking-wide">
                EDITAR: {selectedSectionLabel}
              </label>
              <textarea
                id="editValue"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                disabled={isSaving}
                rows={8}
                className="block w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 resize-y"
                placeholder={`Ingresa el nuevo valor para ${selectedSectionLabel}...`}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={isSaving || !selectedSection}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:from-indigo-700 hover:to-indigo-800 hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <button
              onClick={onCancel}
              disabled={isSaving}
              className="px-6 py-3 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Volver al Resumen
            </button>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-slate-500">
          <p>💡 Selecciona una sección del menú desplegable para comenzar a editar</p>
        </div>
      </div>
    </div>
  );
}
