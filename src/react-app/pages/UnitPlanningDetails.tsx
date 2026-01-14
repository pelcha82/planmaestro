import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { Printer, Edit, ChevronLeft, ChevronRight, Home } from "lucide-react";
import TemplateSelector from "../components/TemplateSelector";
import { generateUnitPlanningPDF } from "../utils/pdfGenerator";

interface PlanningData {
  id?: number;
  response_data?: any;
  created_at?: string;
  updated_at?: string;
}

interface Section {
  keys: string[];
  label: string;
  section: string;
}

export default function UnitPlanningDetails() {
  const { planningId } = useParams<{ planningId: string }>();
  const navigate = useNavigate();
  const [planning, setPlanning] = useState<PlanningData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  // Handle touch events for swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const difference = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (Math.abs(difference) > threshold) {
      if (difference > 0) {
        handleNextSlide();
      } else {
        handlePreviousSlide();
      }
    }
  };

  const handleNextSlide = () => {
    if (currentSlide < allSections.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePreviousSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
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

  useEffect(() => {
    const loadLatestPlanningData = async () => {
      setIsLoading(true);
      
      try {
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) {
          navigate('/login');
          return;
        }

        console.log('🔄 [UNIT DETAILS] Cargando datos actualizados desde webhook...');

        const response = await fetch('/api/get-plannings-by-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ correo: userEmail }),
        });

        if (!response.ok) {
          throw new Error('Error al obtener planificaciones');
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Error al obtener planificaciones');
        }

        const planningsArray = Array.isArray(result.data) ? result.data : [];
        
        const decodedPlanningId = decodeURIComponent(planningId || '');
        console.log('🔍 [UNIT DETAILS] Searching for planning with ID:', decodedPlanningId);
        
        const matchedPlanning = planningsArray.find((item: any) => {
          const correo = item.correo || item.Correo || item.CORREO || userEmail || '';
          const secuencia = item.unidad || item.UNIDAD || item.Unidad || '';
          const tema = item.asignatura || item.ASIGNATURA || item.Asignatura || 'sin-tema';
          
          let datesRaw = item.dates || item.DATES || item.FECHAS || item.fechas || 
                         item['Fecha de creacion'] || item['FECHA DE CREACION'] ||
                         item['fecha de creacion'] || item['Fecha de Creacion'] || null;
          
          let datesArray: string[] = [];
          if (typeof datesRaw === 'string') {
            try {
              datesArray = JSON.parse(datesRaw);
            } catch (e) {
              datesArray = [];
            }
          } else if (Array.isArray(datesRaw)) {
            datesArray = datesRaw;
          }
          
          let fecha = '';
          if (Array.isArray(datesArray) && datesArray.length > 0) {
            fecha = datesArray[0].replace(/\//g, '-');
          }
          
          const cleanCorreo = correo.replace(/[@.]/g, '-');
          const cleanSecuencia = secuencia.replace(/[/:]/g, '-').replace(/\s+/g, '-');
          const cleanTema = tema.replace(/\s+/g, '-');
          
          const planningUniqueId = `${cleanCorreo}_${cleanSecuencia}_${cleanTema}_${fecha}`;
          
          return planningUniqueId === decodedPlanningId;
        });

        if (matchedPlanning) {
          const transformedPlanning: PlanningData = {
            id: 0,
            response_data: matchedPlanning,
            created_at: matchedPlanning.created_at || new Date().toISOString(),
            updated_at: matchedPlanning.updated_at || new Date().toISOString()
          };

          console.log('✅ [UNIT DETAILS] Datos actualizados cargados');
          
          sessionStorage.setItem('selectedPlanning', JSON.stringify(transformedPlanning));
          
          setPlanning(transformedPlanning);
        } else {
          console.warn('⚠️ [UNIT DETAILS] No se encontró planificación con ID:', planningId);
          const storedPlanning = sessionStorage.getItem('selectedPlanning');
          if (storedPlanning) {
            try {
              const data = JSON.parse(storedPlanning);
              setPlanning(data);
            } catch (error) {
              console.error('Error parsing stored planning:', error);
            }
          }
        }
      } catch (error) {
        console.error('❌ [UNIT DETAILS] Error al cargar datos:', error);
        const storedPlanning = sessionStorage.getItem('selectedPlanning');
        if (storedPlanning) {
          try {
            const data = JSON.parse(storedPlanning);
            setPlanning(data);
          } catch (parseError) {
            console.error('Error parsing stored planning:', parseError);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadLatestPlanningData();
  }, [planningId, navigate]);

  const handleEdit = (section?: string) => {
    if (section) {
      navigate(`/editar-planificacion-unidad/${planningId}`, {
        state: { preSelectedSection: section }
      });
    } else {
      navigate(`/editar-planificacion-unidad/${planningId}`);
    }
  };

  const handleDownloadPDF = (template: 'modern' | 'professional' | 'creative') => {
    if (!planning) return;
    
    const data = planning.response_data || {};
    
    let dateRangeField = data['Fecha de creacion'] || 
                          data.allDates || 
                          data.dates || 
                          data.DATES || 
                          data.FECHAS || 
                          data.fechas;
    
    let dateRange = '';
    if (typeof dateRangeField === 'string' && (dateRangeField.startsWith('[') || dateRangeField.startsWith('{"'))) {
      try {
        dateRangeField = JSON.parse(dateRangeField);
      } catch (e) {
        console.error('Error parsing date range:', e);
      }
    }
    
    if (dateRangeField && Array.isArray(dateRangeField) && dateRangeField.length > 0) {
      dateRange = `${dateRangeField[0]} - ${dateRangeField[dateRangeField.length - 1]}`;
    } else if (typeof dateRangeField === 'string') {
      dateRange = dateRangeField;
    }
    
    generateUnitPlanningPDF({
      centroEducativo: data['centro educativo'] || data['CENTRO EDUCATIVO'] || data.CENTRO_EDUCATIVO || 'Sin asignar',
      docente: data.docente || data.DOCENTE || 'Sin asignar',
      correo: data.Correo || data.CORREO || data.correo || '',
      asignatura: data.asignatura || data.ASIGNATURA || 'Sin asignatura',
      grado: data.grado || data.GRADO || 'Sin asignar',
      unidad: data.unidad || data.UNIDAD || 'Sin nombre',
      dateRange,
      presentacion_secuencia: data['Presentancion de la Secuencia'] || data.presentacion_secuencia || data.PRESENTACION_SECUENCIA || data['Presentacion de la Secuencia'] || data['Presentación de la Secuencia'] || '',
      situacion_aprendizaje: data['situación de aprendizaje'] || data.situacion_aprendizaje || data.SITUACION_APRENDIZAJE || data['Situacion de aprendizaje'] || data['Situación de aprendizaje'] || '',
      contenidos_procedimentales: data.contenidos_procedimentales || data.CONTENIDOS_PROCEDIMENTALES || data['Contenidos Procedimentales'] || '',
      competencias_fundamentales: data.competencias_fundamentales || data.COMPETENCIAS_FUNDAMENTALES || data['Competencias Fundamentales'] || '',
      competencias_especificas_grado: data.competencias_especificas_grado || data.COMPETENCIAS_ESPECIFICAS_GRADO || data['Competencias Específicas del Grado'] || '',
      ejes_transversal: data.ejes_transversal || data.EJES_TRANSVERSAL || data['Ejes Transversales'] || '',
      valores_actitudes: data.valores_actitudes || data.VALORES_ACTITUDES || data['Valores y Actitudes'] || '',
      indicadores_logro: data.indicadores_logro || data.INDICADORES_LOGRO || data['Indicadores de Logro'] || '',
      areas_articuladas: data.areas_articuladas || data.AREAS_ARTICULADAS || data['Áreas Articuladas'] || '',
      estrategia_ensenanza_aprendizaje: data.estrategia_ensenanza_aprendizaje || data.ESTRATEGIA_ENSENANZA_APRENDIZAJE || data['Estrategia Enseñanza-Aprendizaje'] || '',
      actividades_ensenanza: data['ACTIVIDAD DE ENSEÑANAZA'] || data['ACTIVIDAD DE ENSEÑANZA'] || data.actividades_ensenanza || data.ACTIVIDADES_ENSENANZA || data['Actividades de Enseñanza'] || data.ACTIVIDAD_DE_ENSEÑANZA || '',
      actividades_aprendizaje: data['ACTIVIDAD DE APRENDIZAJE'] || data.actividades_aprendizaje || data.ACTIVIDADES_APRENDIZAJE || data['Actividades de Aprendizaje'] || data.ACTIVIDAD_DE_APRENDIZAJE || '',
      actividades_evaluacion: data['ACTIVIDAD DE EVALUACION'] || data.actividades_evaluacion || data.ACTIVIDADES_EVALUACION || data['Actividades de Evaluación'] || data.ACTIVIDAD_DE_EVALUACION || '',
      recursos_didacticos: data.recursos_didacticos || data.RECURSOS_DIDACTICOS || data['Recursos Didácticos'] || '',
      secuencia_didactica: data['SECUANCIA DIDACTICA'] || data.secuencia_didactica || data.SECUENCIA_DIDACTICA || data['Secuencia Didáctica'] || data['SECUENCIA DIDACTICA'] || data.SECUANCIA_DIDACTICA || '',
      orientaciones_atencion_diversidad: data['ATENCION A LA DIVERSIDAD'] || data.orientaciones_atencion_diversidad || data.ORIENTACIONES_ATENCION_DIVERSIDAD || data['Orientaciones para la Atención a la Diversidad'] || data.ATENCION_A_LA_DIVERSIDAD || ''
    }, template);
    
    setShowTemplateSelector(false);
  };

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
            onClick={() => navigate('/resumen-planificacion')}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all"
          >
            Volver al Calendario
          </button>
        </div>
      </div>
    );
  }

  const data = planning.response_data || {};

  // Define all sections
  const sectionDefinitions: Section[] = [
    { keys: ['Presentancion de la Secuencia', 'presentacion_secuencia', 'PRESENTACION_SECUENCIA', 'Presentacion de la Secuencia', 'Presentación de la Secuencia'], label: 'Presentación de la Secuencia', section: 'presentacion_secuencia' },
    { keys: ['situación de aprendizaje', 'situacion_aprendizaje', 'SITUACION_APRENDIZAJE', 'Situacion de aprendizaje', 'Situación de aprendizaje'], label: 'Situación de aprendizaje', section: 'situacion_aprendizaje' },
    { keys: ['Contenidos Procedimentales', 'contenidos_procedimentales', 'CONTENIDOS_PROCEDIMENTALES', 'Contenidos procedimentales'], label: 'Contenidos Procedimentales', section: 'contenidos_procedimentales' },
    { keys: ['Competencias Fundamentales', 'competencias_fundamentales', 'COMPETENCIAS_FUNDAMENTALES', 'Competencias fundamentales'], label: 'Competencias Fundamentales', section: 'competencias_fundamentales' },
    { keys: ['Competencias Específicas del Grado', 'competencias_especificas_grado', 'COMPETENCIAS_ESPECIFICAS_GRADO', 'competencias_especificas'], label: 'Competencias Específicas del Grado', section: 'competencias_especificas_grado' },
    { keys: ['Ejes Transversales', 'ejes_transversal', 'EJES_TRANSVERSAL', 'ejes_transversales'], label: 'Ejes Transversales', section: 'ejes_transversal' },
    { keys: ['Valores y Actitudes', 'valores_actitudes', 'VALORES_ACTITUDES', 'valores_y_actitudes'], label: 'Valores y Actitudes', section: 'valores_actitudes' },
    { keys: ['Indicadores de Logro', 'indicadores_logro', 'INDICADORES_LOGRO', 'indicadores_de_logro'], label: 'Indicadores de Logro', section: 'indicadores_logro' },
    { keys: ['Áreas Articuladas', 'areas_articuladas', 'AREAS_ARTICULADAS', 'Areas Articuladas'], label: 'Áreas Articuladas', section: 'areas_articuladas' },
    { keys: ['Estrategia Enseñanza-Aprendizaje', 'estrategia_ensenanza_aprendizaje', 'ESTRATEGIA_ENSENANZA_APRENDIZAJE', 'estrategias_ensenanza_aprendizaje'], label: 'Estrategia Enseñanza-Aprendizaje', section: 'estrategia_ensenanza_aprendizaje' },
    { keys: ['ACTIVIDAD DE ENSEÑANAZA', 'ACTIVIDAD DE ENSEÑANZA', 'Actividades de Enseñanza', 'actividades_ensenanza', 'ACTIVIDADES_ENSENANZA', 'actividades_de_ensenanza', 'ACTIVIDAD_DE_ENSEÑANZA'], label: 'Actividades de Enseñanza', section: 'actividades_ensenanza' },
    { keys: ['ACTIVIDAD DE APRENDIZAJE', 'Actividades de Aprendizaje', 'actividades_aprendizaje', 'ACTIVIDADES_APRENDIZAJE', 'actividades_de_aprendizaje', 'ACTIVIDAD_DE_APRENDIZAJE'], label: 'Actividades de Aprendizaje', section: 'actividades_aprendizaje' },
    { keys: ['ACTIVIDAD DE EVALUACION', 'Actividades de Evaluación', 'actividades_evaluacion', 'ACTIVIDADES_EVALUACION', 'actividades_de_evaluacion', 'ACTIVIDAD_DE_EVALUACION'], label: 'Actividades de Evaluación', section: 'actividades_evaluacion' },
    { keys: ['Recursos Didácticos', 'recursos_didacticos', 'RECURSOS_DIDACTICOS', 'Recursos Didacticos'], label: 'Recursos Didácticos', section: 'recursos_didacticos' },
    { keys: ['SECUANCIA DIDACTICA', 'Secuencia Didáctica', 'secuencia_didactica', 'SECUENCIA_DIDACTICA', 'Secuencia Didactica', 'SECUENCIA DIDACTICA', 'SECUANCIA_DIDACTICA'], label: 'Secuencia Didáctica', section: 'secuencia_didactica' },
    { keys: ['ATENCION A LA DIVERSIDAD', 'Orientaciones para la Atención a la Diversidad', 'orientaciones_atencion_diversidad', 'ORIENTACIONES_ATENCION_DIVERSIDAD', 'orientaciones_diversidad', 'ORIENTACIONES_DIVERSIDAD', 'ATENCION_A_LA_DIVERSIDAD'], label: 'Orientaciones para la Atención a la Diversidad', section: 'orientaciones_atencion_diversidad' }
  ];

  // Extract sections with content
  const allSections = sectionDefinitions.map(def => {
    let content = '';
    for (const key of def.keys) {
      if (data[key]) {
        content = data[key];
        break;
      }
    }
    return {
      ...def,
      content
    };
  }).filter(s => s.content && s.content.trim());

  // Color schemes - alternating
  const colorSchemes = [
    { bg: '#5B7FCC', text: 'white', name: 'azul' },      // Blue
    { bg: '#FF9A76', text: 'white', name: 'coral' },     // Coral
    { bg: '#8B5CF6', text: 'white', name: 'morado' }     // Purple
  ];

  const currentSection = allSections[currentSlide];
  const currentColor = colorSchemes[currentSlide % colorSchemes.length];

  // Render section content with formatting
  const renderSectionContent = (content: string) => {
    if (!content || content.trim() === '') {
      return (
        <div className="text-center py-8 opacity-70">
          <p className="text-lg">No hay contenido para esta sección</p>
        </div>
      );
    }

    // Check if content is a JSON array
    if (typeof content === 'string' && content.trim().startsWith('[')) {
      try {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          return (
            <ul className="space-y-3">
              {parsed.map((item: any, idx: number) => (
                <li key={idx} className="text-lg opacity-95 leading-relaxed flex items-start gap-3">
                  <span className="font-bold text-xl">•</span>
                  <span>{String(item)}</span>
                </li>
              ))}
            </ul>
          );
        }
      } catch (e) {
        // Continue with normal formatting
      }
    }

    // Replace <br> tags with newlines
    let formatted = content.replace(/<br\s*\/?>/gi, '\n');
    const lines = formatted.split('\n');

    return (
      <div className="space-y-3 prose prose-lg max-w-none">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-2"></div>;

          // Process markdown bold (**text**)
          const parts: (string | React.ReactNode)[] = [];
          let partKey = 0;

          const boldRegex = /\*\*([^*]+)\*\*/g;
          let lastIndex = 0;
          let match;

          while ((match = boldRegex.exec(line)) !== null) {
            if (match.index > lastIndex) {
              parts.push(line.substring(lastIndex, match.index));
            }
            parts.push(<strong key={partKey++} className="font-bold">{match[1]}</strong>);
            lastIndex = match.index + match[0].length;
          }

          if (lastIndex < line.length) {
            parts.push(line.substring(lastIndex));
          }

          return (
            <div key={idx} className="text-lg opacity-95 leading-relaxed">
              {parts.length > 0 ? parts : line}
            </div>
          );
        })}
      </div>
    );
  };

  // Extract unit name for header
  const unidad = data.unidad || data.UNIDAD || data.Unidad || 'Planificación por Unidad';

  return (
    <div 
      className="fixed inset-0 overflow-hidden transition-colors duration-500"
      style={{ backgroundColor: currentColor.bg }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Fixed Header - Always Visible */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-black/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            {/* Back Button */}
            <button
              onClick={() => navigate('/resumen-planificacion')}
              className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all text-white font-semibold text-sm"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Calendario</span>
            </button>

            {/* Unit Title - Compact */}
            <div className="flex-1 min-w-0 text-center">
              <h1 className="text-white font-bold text-base sm:text-lg truncate px-2">
                {unidad}
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
                onClick={() => handleEdit(currentSection?.section)}
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

      {/* Main Slide Content */}
      {currentSection && (
        <div className="h-full flex items-center justify-center px-4 sm:px-6 pt-24 pb-32 sm:pt-28 sm:pb-36">
          <div className="max-w-5xl w-full">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl sm:rounded-[40px] p-6 sm:p-10 md:p-12 shadow-2xl">
              {/* Section Title */}
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 sm:mb-8 leading-tight">
                {currentSection.label}
              </h2>

              {/* Section Content - Scrollable */}
              <div 
                className="max-h-[50vh] sm:max-h-[55vh] overflow-y-auto custom-scrollbar"
                style={{ color: currentColor.text }}
              >
                {renderSectionContent(currentSection.content)}
              </div>
            </div>
          </div>
        </div>
      )}

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
              onClick={() => navigate('/')}
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
