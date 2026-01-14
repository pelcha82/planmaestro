import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  User, 
  BookOpen, 
  MapPin, 
  Sparkles, 
  Printer, 
  LayoutDashboard,
  Loader2,
  Target,
  BrainCircuit,
  Lightbulb,
  ListOrdered,
  FileText,
  Download
} from "lucide-react";
import TemplateSelector from "./TemplateSelector";
import { generateDailyPlanningPDF } from "../utils/pdfGenerator";

interface DailyPlanningDetailsProps {
  activityName: string;
}

interface PlanningData {
  [key: string]: any;
}

export default function DailyPlanningDetails({ activityName }: DailyPlanningDetailsProps) {
  const navigate = useNavigate();
  const [planning, setPlanning] = useState<PlanningData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  const handleEditSection = (sectionKey: string) => {
    navigate(`/editar-planificacion-diaria/${activityName}`, {
      state: { preSelectedSection: sectionKey }
    });
  };

  const handleBack = () => {
    navigate('/crear-planificacion-diaria/nueva');
  };

  const handleDownloadPDF = (template: 'modern' | 'professional' | 'creative') => {
    if (!planning) return;

    const pdfData = {
      centroEducativo,
      docente,
      materia,
      grado,
      temaDia,
      correo,
      unidad,
      fechaCreacion,
      competenciaEspecifica,
      indicadoresLogro,
      estrategiaEnsenanza,
      intencionPedagogica,
      momentoInicio,
      momentoDesarrollo,
      momentoCierre,
      recursosDidacticos,
      competenciasFundamentales,
      ejeTransversal,
      valoresActitudes,
      contenidosProcedimentales
    };

    generateDailyPlanningPDF(pdfData, template);
    setShowTemplateSelector(false);
  };

  useEffect(() => {
    const loadPlanning = async () => {
      setIsLoading(true);
      setError("");
      
      try {
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) throw new Error('No se encontró el correo del usuario');

        // PASO 1: Intentar cargar desde sessionStorage primero
        const storedData = sessionStorage.getItem('currentDailyPlanning');
        
        if (storedData) {
          console.log('📦 [LOAD] Datos encontrados en sessionStorage');
          const initialData = JSON.parse(storedData);
          
          // Extraer ASIGNATURA, TEMA_DEL_DIA, y GRADO de los datos guardados
          const asignatura = initialData?.MATERIA || initialData?.ASIGNATURA || '';
          const temaDia = initialData?.TEMA_DEL_DIA || initialData?.['TEMA DEL DÍA'] || activityName;
          const grado = initialData?.GRADO || initialData?.grado || '';

          console.log('📤 [LOAD] Enviando al nuevo webhook');
          console.log('  - CORREO:', userEmail);
          console.log('  - ASIGNATURA:', asignatura);
          console.log('  - TEMA_DEL_DIA:', temaDia);
          console.log('  - GRADO:', grado);

          // Llamar al NUEVO webhook con datos completos
          try {
            const newResponse = await fetch('/api/get-daily-planning-details', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                CORREO: userEmail,
                ASIGNATURA: asignatura,
                TEMA_DEL_DIA: temaDia,
                GRADO: grado
              }),
            });

            console.log('✅ [LOAD] Respuesta del nuevo webhook:', newResponse.status);

            if (newResponse.ok) {
              const newResult = await newResponse.json();
              if (newResult.success && newResult.data) {
                console.log('📦 [LOAD] Usando datos del nuevo webhook');
                
                // If data is array, extract first element
                const planningData = Array.isArray(newResult.data) ? newResult.data[0] : newResult.data;
                
                sessionStorage.setItem('currentDailyPlanning', JSON.stringify(planningData));
                setPlanning(planningData);
                return;
              }
            }
            
            // Si el nuevo webhook falla, usar datos de sessionStorage
            console.log('⚠️ [LOAD] Nuevo webhook falló, usando datos de sessionStorage');
            setPlanning(initialData);
          } catch (webhookError) {
            console.log('⚠️ [LOAD] Error al llamar nuevo webhook, usando datos de sessionStorage');
            setPlanning(initialData);
          }
        } else {
          // No hay datos en sessionStorage - tratar de obtener del webhook viejo
          console.log('🔍 [LOAD] No hay datos en sessionStorage, intentando webhook viejo');
          
          const fallbackGrado = '';
          const fallbackAsignatura = '';
          
          const oldResponse = await fetch('/api/get-daily-planning-by-activity-old', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              CORREO: userEmail,
              NOMBRE_ACTIVIDAD: activityName,
              GRADO: fallbackGrado,
              ASIGNATURA: fallbackAsignatura
            }),
          });

          const oldResult = await oldResponse.json();
          
          if (oldResult.success && oldResult.data) {
            console.log('✅ [LOAD] Datos obtenidos del webhook viejo');
            sessionStorage.setItem('currentDailyPlanning', JSON.stringify(oldResult.data));
            setPlanning(oldResult.data);
          } else {
            throw new Error('No se pudieron obtener los datos de la planificación');
          }
        }
      } catch (err) {
        console.error('❌ [LOAD] Error:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar la planificación');
      } finally {
        setIsLoading(false);
      }
    };

    loadPlanning();
  }, [activityName]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <p className="text-lg text-slate-600 font-medium">Recuperando tu planificación...</p>
      </div>
    );
  }

  if (error || !planning) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-red-200 rounded-2xl p-8 text-center shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LayoutDashboard className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">No pudimos cargar la planificación</h2>
          <p className="text-slate-600 mb-6">{error || 'La información solicitada no está disponible en este momento.'}</p>
          <button
            onClick={handleBack}
            className="w-full px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all"
          >
            Volver a Seleccionar Unidad
          </button>
        </div>
      </div>
    );
  }

  // ===== MAPEO EXACTO de los 19 campos del webhook 3e96875c =====
  const centroEducativo = planning['CENTRO EDUCATIVO'] || 'Sin asignar';
  const docente = planning['DOCENTE'] || 'Sin asignar';
  const materia = planning['MATERIA'] || 'General';
  const grado = planning['GRADO'] || 'Sin asignar';
  const temaDia = planning['TEMA DEL DÍA'] || activityName;
  const correo = planning['CORREO'] || '';
  const unidad = planning['UNIDAD'] || '';
  const fechaCreacion = planning['FECHA DE CREACIÓN'] || '';

  // Campos pedagógicos - NOMBRES EXACTOS del webhook 3e96875c
  const intencionPedagogica = planning['INTENCIÓN PEDAGÓGICA'] || ''; // SIN "DEL DÍA"
  const competenciasFundamentales = planning['COMPETENCIAS FUNDAMENTALES'] || '';
  const competenciaEspecifica = planning['COMPETENCIA ESPECÍFICA'] || '';
  const ejeTransversal = planning['EJE TRANSVERSAL'] || '';
  const indicadoresLogro = planning['INDICADORES DE LOGRO'] || '';
  const contenidosProcedimentales = planning['CONTENIDOS PROCEDIMENTALES'] || '';
  const estrategiaEnsenanza = planning['ESTRATEGIA DE ENSEÑANZA'] || '';
  const valoresActitudes = planning['VALORES Y ACTITUDES'] || '';
  const recursosDidacticos = planning['RECURSOS DIDÁCTICOS'] || '';
  
  // Secuencia didáctica - NOMBRES EXACTOS del webhook 3e96875c
  const momentoInicio = planning['MOMENTO DE INICIO'] || '';
  const momentoDesarrollo = planning['MOMENTO DE DESARROLLO'] || '';
  const momentoCierre = planning['MOMENTO DE CIERRE'] || '';

  console.log('📋 [DISPLAY] Campos extraídos del webhook 3e96875c:');
  console.log('  ✓ Centro Educativo:', centroEducativo);
  console.log('  ✓ Docente:', docente);
  console.log('  ✓ Materia:', materia);
  console.log('  ✓ Grado:', grado);
  console.log('  ✓ Tema del Día:', temaDia);
  console.log('  ✓ Correo:', correo);
  console.log('  ✓ Unidad:', unidad);
  console.log('  ✓ Fecha de Creación:', fechaCreacion);
  console.log('  ✓ Intención Pedagógica:', intencionPedagogica ? 'CON DATOS' : 'VACÍO');
  console.log('  ✓ Competencias Fundamentales:', competenciasFundamentales ? 'CON DATOS' : 'VACÍO');
  console.log('  ✓ Competencia Específica:', competenciaEspecifica ? 'CON DATOS' : 'VACÍO');
  console.log('  ✓ Eje Transversal:', ejeTransversal ? 'CON DATOS' : 'VACÍO');
  console.log('  ✓ Indicadores de Logro:', indicadoresLogro ? 'CON DATOS' : 'VACÍO');
  console.log('  ✓ Contenidos Procedimentales:', contenidosProcedimentales ? 'CON DATOS' : 'VACÍO');
  console.log('  ✓ Estrategia de Enseñanza:', estrategiaEnsenanza ? 'CON DATOS' : 'VACÍO');
  console.log('  ✓ Valores y Actitudes:', valoresActitudes ? 'CON DATOS' : 'VACÍO');
  console.log('  ✓ Recursos Didácticos:', recursosDidacticos ? 'CON DATOS' : 'VACÍO');
  console.log('  ✓ Momento de Inicio:', momentoInicio ? 'CON DATOS' : 'VACÍO');
  console.log('  ✓ Momento de Desarrollo:', momentoDesarrollo ? 'CON DATOS' : 'VACÍO');
  console.log('  ✓ Momento de Cierre:', momentoCierre ? 'CON DATOS' : 'VACÍO');

  // Function to format content
  const formatContent = (text: string) => {
    if (!text) return null;
    
    // Check if content is a JSON array
    if (typeof text === 'string' && text.trim().startsWith('[')) {
      try {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          return (
            <ul className="space-y-2 ml-4">
              {parsed.map((item: any, idx: number) => (
                <li key={idx} className="text-slate-600 leading-relaxed text-sm sm:text-base flex items-start">
                  <span className="mr-2">•</span>
                  <span>{String(item)}</span>
                </li>
              ))}
            </ul>
          );
        }
      } catch (e) {
        // If parsing fails, continue with normal formatting
      }
    }
    
    // Normal text formatting with whitespace preserved
    return (
      <div className="text-slate-600 leading-relaxed whitespace-pre-wrap text-sm sm:text-base text-justify">
        {text}
      </div>
    );
  };

  // Componente interno para secciones editables
  const EditableSection = ({ title, content, sectionKey, icon: Icon }: any) => {
    if (!content) return null;
    return (
      <div className="group relative bg-white p-4 sm:p-6 rounded-lg sm:rounded-xl border border-slate-100 shadow-sm break-inside-avoid">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {Icon && <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500 flex-shrink-0" />}
            <h3 className="text-sm sm:text-base md:text-lg font-bold text-slate-800">{title}</h3>
          </div>
          <button
            onClick={() => handleEditSection(sectionKey)}
            className="flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 active:scale-95 rounded-lg border border-indigo-100 transition-all print:hidden w-full sm:w-auto"
          >
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Mejorar con IA</span>
          </button>
        </div>
        {formatContent(content)}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12 print:bg-white print:pb-0">
      {showTemplateSelector && (
        <TemplateSelector
          onSelect={handleDownloadPDF}
          onClose={() => setShowTemplateSelector(false)}
        />
      )}
      
      {/* HEADER DE NAVEGACIÓN */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-3 sm:px-4 py-2.5 sm:py-3 shadow-sm print:hidden">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
          <button 
            onClick={handleBack}
            className="flex items-center gap-1.5 sm:gap-2 text-slate-600 hover:text-slate-900 font-medium px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-slate-100 active:scale-95 transition-all text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="hidden sm:inline">Volver a Seleccionar Unidad</span>
            <span className="sm:hidden">Volver</span>
          </button>
          <div className="flex gap-1 sm:gap-2">
             <button
               onClick={() => setShowTemplateSelector(true)}
               className="p-1.5 sm:p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
               title="Descargar PDF"
             >
               <Download className="w-4 h-4 sm:w-5 sm:h-5" />
             </button>
             <button
               onClick={() => window.print()}
               className="p-1.5 sm:p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
               title="Imprimir"
             >
               <Printer className="w-4 h-4 sm:w-5 sm:h-5" />
             </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-3 sm:px-4 mt-4 sm:mt-6 md:mt-8 print:mt-0 print:px-0 print:max-w-none">
        
        {/* FICHA TÉCNICA */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 mb-6 sm:mb-8 print:border-none print:shadow-none print:p-0">
            <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold text-slate-900 mb-4 sm:mb-6 text-center border-b pb-3 sm:pb-4 print:text-black">
                PLANIFICACIÓN DIARIA
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 sm:gap-y-6 gap-x-4 sm:gap-x-8">
                {/* Centro Educativo */}
                <div className="flex items-start gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-blue-50 rounded-lg text-blue-600 print:hidden flex-shrink-0">
                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Centro Educativo</p>
                        <p className="font-bold text-slate-800 text-sm sm:text-base md:text-lg break-words">{centroEducativo}</p>
                    </div>
                </div>

                {/* Docente */}
                <div className="flex items-start gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-purple-50 rounded-lg text-purple-600 print:hidden flex-shrink-0">
                        <User className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Docente</p>
                        <p className="font-bold text-slate-800 text-sm sm:text-base md:text-lg break-words">{docente}</p>
                    </div>
                </div>

                {/* Materia */}
                <div className="flex items-start gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-emerald-50 rounded-lg text-emerald-600 print:hidden flex-shrink-0">
                        <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Materia</p>
                        <p className="font-bold text-slate-800 text-sm sm:text-base md:text-lg break-words">{materia}</p>
                    </div>
                </div>

                {/* Grado */}
                <div className="flex items-start gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-indigo-50 rounded-lg text-indigo-600 print:hidden flex-shrink-0">
                        <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Grado</p>
                        <p className="font-bold text-slate-800 text-sm sm:text-base md:text-lg break-words">{grado}</p>
                    </div>
                </div>

                {/* Tema del Día */}
                <div className="flex items-start gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-amber-50 rounded-lg text-amber-600 print:hidden flex-shrink-0">
                        <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tema del Día</p>
                        <p className="font-bold text-slate-800 text-sm sm:text-base md:text-lg leading-tight break-words">{temaDia}</p>
                    </div>
                </div>

                {/* Correo */}
                {correo && (
                    <div className="flex items-start gap-2 sm:gap-3">
                        <div className="p-1.5 sm:p-2 bg-pink-50 rounded-lg text-pink-600 print:hidden flex-shrink-0">
                            <User className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Correo</p>
                            <p className="font-bold text-slate-800 text-sm sm:text-base md:text-lg break-all">{correo}</p>
                        </div>
                    </div>
                )}

                {/* Unidad */}
                {unidad && (
                    <div className="flex items-start gap-2 sm:gap-3">
                        <div className="p-1.5 sm:p-2 bg-cyan-50 rounded-lg text-cyan-600 print:hidden flex-shrink-0">
                            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Unidad</p>
                            <p className="font-bold text-slate-800 text-sm sm:text-base md:text-lg break-words">{unidad}</p>
                        </div>
                    </div>
                )}

                {/* Fecha de Creación */}
                {fechaCreacion && (
                    <div className="flex items-start gap-2 sm:gap-3">
                        <div className="p-1.5 sm:p-2 bg-green-50 rounded-lg text-green-600 print:hidden flex-shrink-0">
                            <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Fecha de Creación</p>
                            <p className="font-bold text-slate-800 text-sm sm:text-base md:text-lg break-words">{fechaCreacion}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* BLOQUE PEDAGÓGICO */}
        <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-800 border-l-4 border-indigo-500 pl-2 sm:pl-3 flex items-center gap-1.5 sm:gap-2 print:border-black">
                <BrainCircuit className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400 print:hidden flex-shrink-0" />
                <span>Estructura Pedagógica</span>
            </h2>
            
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
                <EditableSection 
                    title="Intención Pedagógica" 
                    content={intencionPedagogica} 
                    sectionKey="INTENCIÓN PEDAGÓGICA"
                    icon={Target}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <EditableSection 
                        title="Competencias Fundamentales" 
                        content={competenciasFundamentales} 
                        sectionKey="COMPETENCIAS FUNDAMENTALES"
                    />
                    <EditableSection 
                        title="Competencia Específica" 
                        content={competenciaEspecifica} 
                        sectionKey="COMPETENCIA ESPECÍFICA"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <EditableSection 
                        title="Eje Transversal" 
                        content={ejeTransversal} 
                        sectionKey="EJE TRANSVERSAL"
                    />
                    <EditableSection 
                        title="Valores y Actitudes" 
                        content={valoresActitudes} 
                        sectionKey="VALORES Y ACTITUDES"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <EditableSection 
                        title="Indicadores de Logro" 
                        content={indicadoresLogro} 
                        sectionKey="INDICADORES DE LOGRO"
                        icon={Target}
                    />
                    <EditableSection 
                        title="Contenidos Procedimentales" 
                        content={contenidosProcedimentales} 
                        sectionKey="CONTENIDOS PROCEDIMENTALES"
                    />
                </div>

                <EditableSection 
                    title="Estrategia de Enseñanza" 
                    content={estrategiaEnsenanza} 
                    sectionKey="ESTRATEGIA DE ENSEÑANZA"
                    icon={Lightbulb}
                />
            </div>
        </div>

        {/* SECUENCIA DIDÁCTICA */}
        <div className="mb-6 sm:mb-8 break-inside-avoid">
             <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-800 border-l-4 border-indigo-500 pl-2 sm:pl-3 mb-4 sm:mb-6 flex items-center gap-1.5 sm:gap-2 print:border-black">
                <ListOrdered className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400 print:hidden flex-shrink-0" />
                <span>Secuencia Didáctica</span>
            </h2>

            {/* Render the 3 MOMENTO sections */}
            <div className="relative space-y-4 sm:space-y-6 pl-0 md:pl-0">
                {/* Línea conectora */}
                <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-slate-200 hidden md:block print:hidden"></div>

                {/* MOMENTO DE INICIO */}
                {momentoInicio && (
                    <div className="relative md:pl-20 break-inside-avoid">
                        <div className="hidden md:flex absolute left-4 top-0 w-8 h-8 bg-indigo-100 rounded-full border-4 border-white items-center justify-center z-10 font-bold text-indigo-600 text-xs print:hidden">
                            01
                        </div>
                        <EditableSection 
                            title="I. Momento de Inicio" 
                            content={momentoInicio} 
                            sectionKey="MOMENTO DE INICIO"
                        />
                    </div>
                )}

                {/* MOMENTO DE DESARROLLO */}
                {momentoDesarrollo && (
                    <div className="relative md:pl-20 break-inside-avoid">
                         <div className="hidden md:flex absolute left-4 top-0 w-8 h-8 bg-indigo-600 rounded-full border-4 border-white items-center justify-center z-10 font-bold text-white text-xs print:hidden">
                            02
                        </div>
                        <EditableSection 
                            title="II. Momento de Desarrollo" 
                            content={momentoDesarrollo} 
                            sectionKey="MOMENTO DE DESARROLLO"
                        />
                    </div>
                )}

                {/* MOMENTO DE CIERRE */}
                {momentoCierre && (
                    <div className="relative md:pl-20 break-inside-avoid">
                        <div className="hidden md:flex absolute left-4 top-0 w-8 h-8 bg-slate-200 rounded-full border-4 border-white items-center justify-center z-10 font-bold text-slate-600 text-xs print:hidden">
                            03
                        </div>
                        <EditableSection 
                            title="III. Momento de Cierre" 
                            content={momentoCierre} 
                            sectionKey="MOMENTO DE CIERRE"
                        />
                    </div>
                )}
            </div>
        </div>

        {/* RECURSOS */}
        {recursosDidacticos && (
            <div className="mb-12 break-inside-avoid">
                 <EditableSection 
                    title="Recursos Didácticos" 
                    content={recursosDidacticos} 
                    sectionKey="RECURSOS DIDÁCTICOS"
                    icon={BookOpen}
                />
            </div>
        )}

        {/* FOOTER ACTIONS */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 sm:pt-8 border-t border-slate-200 print:hidden">
            <button
                onClick={() => setShowTemplateSelector(true)}
                className="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-emerald-600 text-white text-sm sm:text-base font-bold rounded-lg sm:rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all sm:hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
            >
                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Descargar PDF</span>
            </button>
            <button
                onClick={() => window.print()}
                className="flex-1 px-4 sm:px-6 py-3 sm:py-4 border-2 border-slate-200 text-slate-700 text-sm sm:text-base font-bold rounded-lg sm:rounded-xl hover:border-slate-300 hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
                <Printer className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Imprimir Planificación</span>
            </button>
            <button
                onClick={handleBack}
                className="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-indigo-600 text-white text-sm sm:text-base font-bold rounded-lg sm:rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all sm:hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
            >
                <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Volver a Seleccionar Unidad</span>
                <span className="sm:hidden">Volver</span>
            </button>
        </div>

        {/* ESTILOS DE IMPRESIÓN */}
        <style>{`
          @media print {
            @page { margin: 2cm; size: auto; }
            body { background: white; -webkit-print-color-adjust: exact; }
            .print\\:hidden { display: none !important; }
            .shadow-sm, .shadow-lg, .shadow-md { box-shadow: none !important; }
            .border { border: 1px solid #ccc !important; }
            .bg-slate-50 { background: white !important; }
            .bg-blue-50, .bg-purple-50, .bg-emerald-50, .bg-amber-50 {
                background-color: transparent !important; 
                padding: 0 !important;
            }
            .p-2.rounded-lg svg { display: none; }
          }
        `}</style>
      </div>
    </div>
  );
}
