import { useState } from 'react';
import { X, FileText, Sparkles, BookOpen } from 'lucide-react';

interface TemplateSelectorProps {
  onSelect: (template: 'modern' | 'professional' | 'creative') => void;
  onClose: () => void;
}

export default function TemplateSelector({ onSelect, onClose }: TemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<'modern' | 'professional' | 'creative'>('modern');

  const templates = [
    {
      id: 'modern' as const,
      name: 'Moderno',
      description: 'Diseño limpio con tarjetas sutiles. Mínimos colores, perfecto para impresión.',
      icon: Sparkles,
      color: 'slate',
      emoji: '📄',
      features: ['Tarjetas grises', 'Diseño minimalista', 'Fácil de imprimir']
    },
    {
      id: 'professional' as const,
      name: 'Profesional',
      description: 'Formato de tabla formal. Sin tarjetas, solo bordes y estructura institucional.',
      icon: FileText,
      color: 'neutral',
      emoji: '📋',
      features: ['Estructura de tabla', 'Formato institucional', 'Muy profesional']
    },
    {
      id: 'creative' as const,
      name: 'Clásico',
      description: 'Diseño simple con borde izquierdo de acento. Elegante y tradicional.',
      icon: BookOpen,
      color: 'stone',
      emoji: '📖',
      features: ['Borde de acento', 'Diseño tradicional', 'Elegante y simple']
    }
  ];

  const getColorClasses = (color: string, isSelected: boolean) => {
    const colors = {
      slate: {
        border: isSelected ? 'border-slate-400' : 'border-slate-200',
        bg: isSelected ? 'bg-slate-50' : 'bg-white',
        icon: 'text-slate-600',
        button: 'bg-slate-700 hover:bg-slate-800',
        ring: isSelected ? 'ring-2 ring-slate-400' : ''
      },
      neutral: {
        border: isSelected ? 'border-neutral-400' : 'border-neutral-200',
        bg: isSelected ? 'bg-neutral-50' : 'bg-white',
        icon: 'text-neutral-600',
        button: 'bg-neutral-700 hover:bg-neutral-800',
        ring: isSelected ? 'ring-2 ring-neutral-400' : ''
      },
      stone: {
        border: isSelected ? 'border-stone-400' : 'border-stone-200',
        bg: isSelected ? 'bg-stone-50' : 'bg-white',
        icon: 'text-stone-600',
        button: 'bg-stone-700 hover:bg-stone-800',
        ring: isSelected ? 'ring-2 ring-stone-400' : ''
      }
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Selecciona un Estilo de PDF</h2>
            <p className="text-sm text-slate-600 mt-1">Diseños optimizados para impresión</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-slate-600" />
          </button>
        </div>

        {/* Templates Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map((template) => {
            const isSelected = selectedTemplate === template.id;
            const colors = getColorClasses(template.color, isSelected);
            const Icon = template.icon;

            return (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={`${colors.bg} ${colors.border} border-2 rounded-xl p-6 text-left transition-all hover:shadow-lg ${colors.ring}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <Icon className={`w-8 h-8 ${colors.icon}`} />
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">{template.emoji}</span>
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 mb-2">{template.name}</h3>
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">{template.description}</p>
                
                <div className="pt-4 border-t border-slate-200">
                  <ul className="space-y-1.5">
                    {template.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-xs text-slate-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-2"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {isSelected && (
                  <div className="mt-4 flex items-center justify-center gap-2 py-2 bg-white rounded-lg font-semibold text-sm">
                    <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                    <span className="text-slate-700">Seleccionado</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Info Box */}
        <div className="mx-6 mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-900 font-medium mb-1">Optimizado para Impresión</p>
              <p className="text-xs text-blue-700">
                Todos los estilos están diseñados para verse bien en papel, usando colores mínimos y estructuras claras.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-6 py-3 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => onSelect(selectedTemplate)}
            className={`px-8 py-3 text-white font-bold rounded-xl shadow-lg transition-all hover:-translate-y-0.5 ${
              getColorClasses(templates.find(t => t.id === selectedTemplate)?.color || 'slate', true).button
            }`}
          >
            Descargar PDF
          </button>
        </div>
      </div>
    </div>
  );
}
