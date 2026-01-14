import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router';
import { Printer, Edit, ChevronLeft, ChevronRight, Home } from 'lucide-react';
import TemplateSelector from '@/react-app/components/TemplateSelector';
import { generateDailyPlanningPDF } from '@/react-app/utils/pdfGenerator';

interface Section {
  title: string;
  content: string;
  key: string;
  category: string;
}

export default function DailyPlanningDetails() {
  const { activityName } = useParams<{ activityName: string }>();
  const [planning, setPlanning] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle touch events for swipe navigation with live drag feedback
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    touchEndX.current = e.touches[0].clientX;
    const diff = touchEndX.current - touchStartX.current;
    
    // Apply resistance at edges
    let resistance = 1;
    if ((currentSlide === 0 && diff > 0) || (currentSlide === allSections.length - 1 && diff < 0)) {
      resistance = 0.3; // Strong resistance at boundaries
    }
    
    setDragOffset(diff * resistance);
  };

  const handleTouchEnd = () => {
    const difference = touchStartX.current - touchEndX.current;
    const threshold = 30; // More sensitive - reduced from 50

    if (Math.abs(difference) > threshold) {
      if (difference > 0) {
        handleNextSlide();
      } else {
        handlePreviousSlide();
      }
    }
    
    setIsDragging(false);
    setDragOffset(0);
  };

  const handleNextSlide = () => {
    if (currentSlide < allSections.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const handlePreviousSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePreviousSlide();
      } else if (e.key === 'ArrowRight') {
        handleNextSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide]);

  const handleEditSection = (section: Section) => {
    // Store the selected section for the edit chat
    sessionStorage.setItem('editingSection', section.key);
    sessionStorage.setItem('sectionContent', section.content);
    
    // Navigate to edit chat - use 'edit' as planningId since we have data in sessionStorage
    window.location.href = `/editar-planificacion-diaria/edit`;
  };

  useEffect(() => {
    const loadPlanning = () => {
      try {
        console.log('📱 [VERSION] DailyPlanningDetails.tsx v4.0 - PRESENTACIÓN ESTILO SLIDES');
        
        const stored = sessionStorage.getItem('currentDailyPlanning');
        
        if (!stored) {
          console.error('❌ [ERROR] No hay datos en sessionStorage');
          setIsLoading(false);
          return;
        }
        
        const parsedData = JSON.parse(stored);
        let planningData = Array.isArray(parsedData) ? parsedData[0] : parsedData;
        
        setPlanning(planningData);
        setIsLoading(false);
      } catch (error) {
        console.error('❌ [ERROR CRÍTICO] Error al parsear datos:', error);
        setIsLoading(false);
      }
    };

    loadPlanning();
  }, [activityName]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 text-slate-600">Cargando planificación...</p>
        </div>
      </div>
    );
  }

  if (!planning) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <svg className="w-16 h-16 text-slate-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">No se encontró la planificación</h2>
          <p className="text-slate-600 mb-6">Por favor, selecciona una planificación del calendario para verla aquí.</p>
          <button
            onClick={() => window.location.href = '/crear-planificacion'}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all"
          >
            Volver al Calendario
          </button>
        </div>
      </div>
    );
  }

  // ALL sections in order with categories
  const allSections: Section[] = [
    // Planificación
    {
      title: 'Intención Pedagógica',
      content: planning['INTENCIÓN PEDAGÓGICA'] || '',
      key: 'INTENCIÓN PEDAGÓGICA',
      category: 'Planificación'
    },
    {
      title: 'Competencias Fundamentales',
      content: planning['COMPETENCIAS FUNDAMENTALES'] || '',
      key: 'COMPETENCIAS FUNDAMENTALES',
      category: 'Planificación'
    },
    {
      title: 'Competencia Específica',
      content: planning['COMPETENCIA ESPECÍFICA'] || '',
      key: 'COMPETENCIA ESPECÍFICA',
      category: 'Planificación'
    },
    {
      title: 'Eje Transversal',
      content: planning['EJE TRANSVERSAL'] || '',
      key: 'EJE TRANSVERSAL',
      category: 'Planificación'
    },
    // Desarrollo
    {
      title: 'Estrategia de Enseñanza',
      content: planning['ESTRATEGIA DE ENSEÑANZA'] || '',
      key: 'ESTRATEGIA DE ENSEÑANZA',
      category: 'Desarrollo'
    },
    {
      title: 'Momento de Inicio',
      content: planning['MOMENTO DE INICIO'] || '',
      key: 'MOMENTO DE INICIO',
      category: 'Desarrollo'
    },
    {
      title: 'Momento de Desarrollo',
      content: planning['MOMENTO DE DESARROLLO'] || '',
      key: 'MOMENTO DE DESARROLLO',
      category: 'Desarrollo'
    },
    {
      title: 'Momento de Cierre',
      content: planning['MOMENTO DE CIERRE'] || '',
      key: 'MOMENTO DE CIERRE',
      category: 'Desarrollo'
    },
    // Evaluación
    {
      title: 'Indicadores de Logro',
      content: planning['INDICADORES DE LOGRO'] || '',
      key: 'INDICADORES DE LOGRO',
      category: 'Evaluación'
    },
    {
      title: 'Contenidos Procedimentales',
      content: planning['CONTENIDOS PROCEDIMENTALES'] || '',
      key: 'CONTENIDOS PROCEDIMENTALES',
      category: 'Evaluación'
    },
    {
      title: 'Valores y Actitudes',
      content: planning['VALORES Y ACTITUDES'] || '',
      key: 'VALORES Y ACTITUDES',
      category: 'Evaluación'
    },
    {
      title: 'Recursos Didácticos',
      content: planning['RECURSOS DIDÁCTICOS'] || '',
      key: 'RECURSOS DIDÁCTICOS',
      category: 'Evaluación'
    }
  ];

  // Color schemes - alternating
  const colorSchemes = [
    { bg: '#5B7FCC', text: 'white', name: 'azul' },      // Blue
    { bg: '#FF9A76', text: 'white', name: 'coral' },     // Coral
    { bg: '#8B5CF6', text: 'white', name: 'morado' }     // Purple
  ];

  const currentSection = allSections[currentSlide];
  const currentColor = colorSchemes[currentSlide % colorSchemes.length];

  // Render section content with formatting
  const renderSectionContent = (section: Section) => {
    if (!section.content || section.content.trim() === '') {
      return (
        <div className="text-center py-8 opacity-70">
          <p className="text-lg">No hay contenido para esta sección</p>
        </div>
      );
    }

    return (
      <div className="prose prose-lg max-w-none">
        {section.content.split('\n').map((paragraph, pIndex) => {
          if (!paragraph.trim()) return null;
          
          if (/^\d+\./.test(paragraph.trim())) {
            return (
              <p key={pIndex} className="mb-4 pl-6 leading-relaxed text-lg opacity-95">
                {paragraph.trim()}
              </p>
            );
          }
          
          if (paragraph.trim().startsWith('•') || paragraph.trim().startsWith('-')) {
            return (
              <p key={pIndex} className="mb-3 pl-6 leading-relaxed flex items-start gap-3 text-lg opacity-95">
                <span className="font-bold text-xl">•</span>
                <span>{paragraph.trim().replace(/^[•-]\s*/, '')}</span>
              </p>
            );
          }
          
          if (paragraph.includes('**')) {
            const formatted = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>');
            return (
              <p 
                key={pIndex} 
                className="mb-4 leading-relaxed text-lg opacity-95"
                dangerouslySetInnerHTML={{ __html: formatted }}
              />
            );
          }
          
          return (
            <p key={pIndex} className="mb-4 leading-relaxed text-lg opacity-95">
              {paragraph.trim()}
            </p>
          );
        })}
      </div>
    );
  };

  const handleDownloadPDF = (template: 'modern' | 'professional' | 'creative') => {
    const pdfData = {
      centroEducativo: planning['CENTRO EDUCATIVO'] || '',
      docente: planning['DOCENTE'] || '',
      correo: planning['CORREO'] || '',
      grado: planning['GRADO'] || '',
      materia: planning['MATERIA'] || '',
      unidad: planning['UNIDAD'] || '',
      temaDia: planning['TEMA DEL DÍA'] || '',
      intencionPedagogica: planning['INTENCIÓN PEDAGÓGICA'] || '',
      competenciasFundamentales: planning['COMPETENCIAS FUNDAMENTALES'] || '',
      competenciaEspecifica: planning['COMPETENCIA ESPECÍFICA'] || '',
      ejeTransversal: planning['EJE TRANSVERSAL'] || '',
      indicadoresLogro: planning['INDICADORES DE LOGRO'] || '',
      contenidosProcedimentales: planning['CONTENIDOS PROCEDIMENTALES'] || '',
      estrategiaEnsenanza: planning['ESTRATEGIA DE ENSEÑANZA'] || '',
      valoresActitudes: planning['VALORES Y ACTITUDES'] || '',
      recursosDidacticos: planning['RECURSOS DIDÁCTICOS'] || '',
      momentoInicio: planning['MOMENTO DE INICIO'] || '',
      momentoDesarrollo: planning['MOMENTO DE DESARROLLO'] || '',
      momentoCierre: planning['MOMENTO DE CIERRE'] || '',
      createdAt: planning['FECHA DE CREACIÓN'] || ''
    };

    generateDailyPlanningPDF(pdfData, template);
    setShowTemplateSelector(false);
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 overflow-hidden"
      style={{ 
        backgroundColor: currentColor.bg,
        transition: isDragging ? 'none' : 'background-color 600ms cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {/* Fixed Header - Always Visible */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-black/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            {/* Back Button */}
            <button
              onClick={() => window.location.href = '/crear-planificacion'}
              className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all text-white font-semibold text-sm"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Calendario</span>
            </button>

            {/* Topic Title - Compact */}
            <div className="flex-1 min-w-0 text-center">
              <h1 className="text-white font-bold text-base sm:text-lg truncate px-2">
                {planning['TEMA DEL DÍA'] || activityName}
              </h1>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowTemplateSelector(true)}
                className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all"
                aria-label="Descargar PDF"
              >
                <Printer className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={() => handleEditSection(currentSection)}
                className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all"
                aria-label="Editar sección"
              >
                <Edit className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className="text-white/80 text-xs font-medium">
              {currentSlide + 1} de {allSections.length}
            </span>
            <div className="flex-1 max-w-md h-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all duration-300"
                style={{ width: `${((currentSlide + 1) / allSections.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Slide Content - Swipeable Container */}
      <div 
        className="h-full flex items-center justify-center px-4 sm:px-6 pt-24 pb-32 sm:pt-28 sm:pb-36 relative overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="max-w-5xl w-full"
          style={{
            transform: `translateX(${dragOffset}px)`,
            transition: isDragging ? 'none' : 'transform 600ms cubic-bezier(0.4, 0, 0.2, 1)',
            opacity: isDragging ? 1 - Math.abs(dragOffset) / 400 : 1
          }}
        >
          <div 
            className="bg-white/10 backdrop-blur-md rounded-3xl sm:rounded-[40px] p-6 sm:p-10 md:p-12 shadow-2xl"
            style={{
              transform: isDragging ? `scale(${1 - Math.abs(dragOffset) / 2000})` : 'scale(1)',
              transition: isDragging ? 'none' : 'transform 600ms cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {/* Category Badge */}
            <div className="mb-4 sm:mb-6">
              <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl text-white text-xs sm:text-sm font-bold uppercase tracking-wide">
                {currentSection.category}
              </span>
            </div>

            {/* Section Title */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 sm:mb-8 leading-tight">
              {currentSection.title}
            </h2>

            {/* Section Content - Scrollable (vertical scroll does NOT change slides) */}
            <div 
              className="max-h-[50vh] sm:max-h-[55vh] overflow-y-auto custom-scrollbar"
              style={{ color: currentColor.text }}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
            >
              {renderSectionContent(currentSection)}
            </div>
          </div>
        </div>

        {/* Previous Slide Preview - Left */}
        {currentSlide > 0 && isDragging && dragOffset > 0 && (
          <div 
            className="absolute left-0 top-0 bottom-0 w-24 sm:w-32 flex items-center justify-start pl-2 sm:pl-4 pointer-events-none"
            style={{
              opacity: Math.min(dragOffset / 100, 0.6),
              transform: `translateX(${-50 + (dragOffset / 4)}px)`
            }}
          >
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 sm:p-4 shadow-xl">
              <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8 text-white" strokeWidth={3} />
            </div>
          </div>
        )}

        {/* Next Slide Preview - Right */}
        {currentSlide < allSections.length - 1 && isDragging && dragOffset < 0 && (
          <div 
            className="absolute right-0 top-0 bottom-0 w-24 sm:w-32 flex items-center justify-end pr-2 sm:pr-4 pointer-events-none"
            style={{
              opacity: Math.min(Math.abs(dragOffset) / 100, 0.6),
              transform: `translateX(${50 + (dragOffset / 4)}px)`
            }}
          >
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 sm:p-4 shadow-xl">
              <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 text-white" strokeWidth={3} />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation - Large Buttons */}
      <div className="absolute bottom-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between gap-4">
            {/* Previous Button */}
            <button
              onClick={handlePreviousSlide}
              disabled={currentSlide === 0}
              className={`
                flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-4 sm:py-5 rounded-2xl font-bold text-base sm:text-lg transition-all shadow-xl
                ${currentSlide === 0
                  ? 'bg-white/10 text-white/40 cursor-not-allowed'
                  : 'bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white active:scale-95'
                }
              `}
              style={{ minWidth: '120px' }}
            >
              <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={3} />
              <span className="hidden sm:inline">Anterior</span>
            </button>

            {/* Dots Navigation - Desktop Only */}
            <div className="hidden sm:flex items-center gap-2">
              {allSections.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`
                    transition-all rounded-full
                    ${index === currentSlide 
                      ? 'w-8 h-3 bg-white' 
                      : 'w-3 h-3 bg-white/40 hover:bg-white/60'
                    }
                  `}
                  aria-label={`Ir a slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Home Button - Center (Mobile Only) */}
            <button
              onClick={() => window.location.href = '/'}
              className="sm:hidden p-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-2xl transition-all active:scale-95"
            >
              <Home className="w-6 h-6 text-white" />
            </button>

            {/* Next Button */}
            <button
              onClick={handleNextSlide}
              disabled={currentSlide === allSections.length - 1}
              className={`
                flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-4 sm:py-5 rounded-2xl font-bold text-base sm:text-lg transition-all shadow-xl
                ${currentSlide === allSections.length - 1
                  ? 'bg-white/10 text-white/40 cursor-not-allowed'
                  : 'bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white active:scale-95'
                }
              `}
              style={{ minWidth: '120px' }}
            >
              <span className="hidden sm:inline">Siguiente</span>
              <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>

      {/* Template Selector Modal */}
      {showTemplateSelector && (
        <TemplateSelector
          onSelect={handleDownloadPDF}
          onClose={() => setShowTemplateSelector(false)}
        />
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
}
