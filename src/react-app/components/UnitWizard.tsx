import React, { useState, useEffect } from "react";
import { ArrowLeft, Sparkles, ChevronRight, ChevronLeft } from "lucide-react";

interface UnitWizardProps {
  userEmail: string;
  onSuccess: () => void;
  onCancel: () => void;
}

// Mapa de unidades por grado y asignatura
const GRADE_SUBJECT_UNITS: Record<string, Record<string, string[]>> = {
  "1er": {
    "Lengua Española": [
      "Secuencia 1: La Tarjeta de Identidad",
      "Secuencia 2: El Letrero",
      "Secuencia 3: La Lista de Compras",
      "Secuencia 4: El Mensaje Corto",
      "Secuencia 5: La Noticia",
      "Secuencia 6: El Cuento"
    ],
    "Matemática": [
      "Secuencia 1: Secuencia de números naturales como mínimo hasta el 99",
      "Secuencia 2: Valor de posición: unidad y decena",
      "Secuencia 3: Adición y sustracción de números naturales",
      "Secuencia 4: Cuerpos geométricos y Figuras planas",
      "Secuencia 5: Patrones y mosaicos",
      "Secuencia 6: Líneas: rectas, curvas y mixtas",
      "Secuencia 7: Medidas de longitud (Unidades arbitrarias)",
      "Secuencia 8: Medidas de capacidad, peso y tiempo",
      "Secuencia 9: Monedas y billetes",
      "Secuencia 10: Recolección y organización de datos (Tablas de conteo y pictogramas)"
    ],
    "Ciencias de la Naturaleza": [
      "Secuencia 1: Los seres vivos y su entorno",
      "Secuencia 2: El cuerpo humano: Los sentidos y estructura externa",
      "Secuencia 3: Los alimentos",
      "Secuencia 4: Salud y cuidado (Enfermedades, Higiene, Vacunas)",
      "Secuencia 5: Materia y sus propiedades (Estados, Mezclas)",
      "Secuencia 6: Energía y conservación (Luz solar, Sonido)",
      "Secuencia 7: Interacción y movimiento",
      "Secuencia 8: Sistema y mecanismo (Máquinas simples, Estructuras, Tecnología)",
      "Secuencia 9: Ciencias de la Tierra (Suelo, Agua, Aire)",
      "Secuencia 10: La Tierra y el Universo (Sol, Luna, Día y Noche)"
    ],
    "Ciencias Sociales": [
      "Secuencia 1: Identificación personal y del entorno (Identidad, Familia, Escuela, Comunidad)",
      "Secuencia 2: Historia familiar y entorno",
      "Secuencia 3: Orientación espacial (Vivienda, Escuela, Isla de Santo Domingo)",
      "Secuencia 4: Orientación temporal (Pasado, presente, futuro)",
      "Secuencia 5: Valores y deberes de las personas",
      "Secuencia 6: Derechos y necesidades",
      "Secuencia 7: Entorno natural y social",
      "Secuencia 8: Fechas patrias, Héroes y Símbolos Patrios"
    ]
  },
  "2do": {
    "Lengua Española": [
      "Secuencia 1: El Documento de Identidad",
      "Secuencia 2: La Etiqueta",
      "Secuencia 3: La Receta",
      "Secuencia 4: La Noticia",
      "Secuencia 5: La Canción Infantil",
      "Secuencia 6: El Cuento"
    ],
    "Matemática": [
      "Secuencia 1: Secuencia de números naturales como mínimo hasta el 999",
      "Secuencia 2: Valor de posición: unidad, decena y centena",
      "Secuencia 3: Operaciones: Adición, sustracción, multiplicación y división exacta",
      "Secuencia 4: Figuras planas (Semejantes y congruentes)",
      "Secuencia 5: Simetría y Patrones geométricos",
      "Secuencia 6: Cuerpos geométricos",
      "Secuencia 7: Medidas de longitud (Metro, decímetro, centímetro)",
      "Secuencia 8: Medidas de capacidad, peso, tiempo y dinero",
      "Secuencia 9: Estadística (Tablas, pictogramas, gráficas de barras)"
    ],
    "Ciencias de la Naturaleza": [
      "Secuencia 1: Sistemas del cuerpo humano (Digestivo, Circulatorio, Respiratorio)",
      "Secuencia 2: Nutrición: alimentos y nutrientes",
      "Secuencia 3: Ecosistemas: hábitat y ambiente",
      "Secuencia 4: Salud y prevención de enfermedades",
      "Secuencia 5: Cambios de estado de la materia y Mezclas",
      "Secuencia 6: Energía (Sonido) y Movimiento (Distancia, Tiempo, Rapidez)",
      "Secuencia 7: Tecnología y Máquinas",
      "Secuencia 8: Ciencias de la Tierra (Suelo, Rocas, Fenómenos atmosféricos)",
      "Secuencia 9: Ciclo del agua y Estaciones del año"
    ],
    "Ciencias Sociales": [
      "Secuencia 1: Orientación espacial (Puntos cardinales, Hemisferios, Antillas)",
      "Secuencia 2: La Comunidad (Espacio natural y social)",
      "Secuencia 3: Sucesos y eventos de la historia familiar y comunitaria",
      "Secuencia 4: Derechos y deberes del Niño y la Niña",
      "Secuencia 5: Educación vial: normas y señales de tránsito",
      "Secuencia 6: Eventos históricos esenciales que conforman nuestra identidad (Primeros pobladores, Independencia, Símbolos)"
    ]
  },
  "3ro": {
    "Lengua Española": [
      "Secuencia 1: La Autobiografía",
      "Secuencia 2: El Instructivo",
      "Secuencia 3: La Noticia",
      "Secuencia 4: El Cuento",
      "Secuencia 5: El Artículo Expositivo",
      "Secuencia 6: La Adivinanza"
    ],
    "Matemática": [
      "Secuencia 1: Secuencia de números naturales hasta el 99,999",
      "Secuencia 2: Fracciones comunes",
      "Secuencia 3: Operaciones: Adición, sustracción, multiplicación y división",
      "Secuencia 4: Patrones numéricos",
      "Secuencia 5: Geometría: Segmento, rayo y Polígonos",
      "Secuencia 6: Ángulos y Congruencia",
      "Secuencia 7: Simetría y Transformaciones (traslación, rotación, reflexión)",
      "Secuencia 8: El plano y coordenadas",
      "Secuencia 9: Medición: Longitud, Perímetro, Área, Capacidad, Peso, Tiempo, Dinero",
      "Secuencia 10: Estadística (Gráficas de barras y lineales)"
    ],
    "Ciencias de la Naturaleza": [
      "Secuencia 1: Seres vivos y Cadena alimenticia",
      "Secuencia 2: Sistemas del cuerpo (Excretor, Nervioso, Reproductor)",
      "Secuencia 3: Ciclo de vida y Salud",
      "Secuencia 4: Propiedades de la materia (Masa, peso, volumen, densidad)",
      "Secuencia 5: Energía (Formas y eficiencia) y Fuerzas",
      "Secuencia 6: Máquinas y Tecnología",
      "Secuencia 7: Ciencias de la Tierra (Ciclo de las rocas, Fenómenos geológicos)",
      "Secuencia 8: Sistema Solar y Movimientos de la Tierra"
    ],
    "Ciencias Sociales": [
      "Secuencia 1: El planeta Tierra y sus componentes",
      "Secuencia 2: Geografía local (Región, provincia, municipio)",
      "Secuencia 3: Zona rural y urbana",
      "Secuencia 4: Procedencia familiar y Migración",
      "Secuencia 5: Acontecimientos históricos locales y nacionales",
      "Secuencia 6: Diversidad cultural y Democracia",
      "Secuencia 7: Patrimonio histórico y natural"
    ]
  }
};

const getAvailableUnits = (grade: string, subject: string): string[] => {
  if (!grade || !subject) return [];
  return GRADE_SUBJECT_UNITS[grade]?.[subject] || [];
};

// Recursos didácticos sugeridos
const RECURSOS_ESTUDIANTES = [
  'Cuadernos y libretas',
  'Lápices de colores',
  'Tijeras y pegamento',
  'Reglas y compases',
  'Materiales reciclados',
  'Fichas y tarjetas',
  'Bloques de construcción',
  'Ábacos y regletas',
  'Mapas y globos terráqueos',
  'Libros de texto',
  'Cuentos y literatura infantil',
  'Revistas y periódicos',
  'Tabletas o computadoras',
  'Calculadoras',
  'Material manipulable (botones, semillas, piedras)',
  'Cartulinas y papel bond',
  'Plastilina o arcilla',
  'Pinturas y pinceles'
];

const RECURSOS_MAESTRO = [
  'Pizarra y marcadores',
  'Proyector o pantalla',
  'Computadora portátil',
  'Presentaciones digitales',
  'Videos educativos',
  'Audios y música',
  'Láminas didácticas',
  'Carteles y afiches',
  'Juegos educativos',
  'Rúbricas de evaluación',
  'Listas de cotejo',
  'Guías didácticas',
  'Planificaciones modelo',
  'Material concreto para demostraciones',
  'Experimentos científicos',
  'Instrumentos musicales',
  'Materiales deportivos',
  'Bibliotecas de aula'
];

export default function UnitWizard({ userEmail, onSuccess: _onSuccess, onCancel }: UnitWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    estrategiaPlanificacion: '',
    subject: '',
    grade: '',
    unitId: '',
    startDate: '',
    endDate: '',
    recursosEstudiantes: [] as string[],
    recursosMaestro: [] as string[]
  });

  const [efemeride, setEfemeride] = useState<any>(null);
  
  // Ref to store the auto-advance timeout
  const autoAdvanceTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Load dates and efemérides from calendar selection on mount
  useEffect(() => {
    const startDateFromCalendar = sessionStorage.getItem('unitPlanningStartDate');
    const endDateFromCalendar = sessionStorage.getItem('unitPlanningEndDate');
    
    if (startDateFromCalendar && endDateFromCalendar) {
      setFormData(prev => ({
        ...prev,
        startDate: startDateFromCalendar,
        endDate: endDateFromCalendar
      }));
    }

    // Load efeméride from sessionStorage if available
    const efemeridesRangeStr = sessionStorage.getItem('efemeridesInRange');
    const selectedEfemerideStr = sessionStorage.getItem('selectedEfemeride');
    
    if (efemeridesRangeStr) {
      try {
        const efemeridesArray = JSON.parse(efemeridesRangeStr);
        setEfemeride(efemeridesArray);
      } catch (e) {
        console.error('❌ Error parseando efemérides:', e);
      }
    } else if (selectedEfemerideStr) {
      try {
        const singleEfemeride = JSON.parse(selectedEfemerideStr);
        setEfemeride(singleEfemeride);
      } catch (e) {
        console.error('❌ Error parseando efeméride:', e);
      }
    }
  }, []);

  const generateDateRange = (start: string, end: string): string[] => {
    if (!start || !end) return [];
    
    const [startYear, startMonth, startDay] = start.split('-').map(Number);
    const [endYear, endMonth, endDay] = end.split('-').map(Number);
    
    const dates: string[] = [];
    const currentDate = new Date(startYear, startMonth - 1, startDay);
    const endDate = new Date(endYear, endMonth - 1, endDay);
    
    while (currentDate <= endDate) {
      const day = String(currentDate.getDate()).padStart(2, '0');
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const year = currentDate.getFullYear();
      dates.push(`${day}/${month}/${year}`);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  };

  const handleNext = () => {
    // Validate current step
    if (currentStep === 1 && !formData.grade) return;
    if (currentStep === 2 && !formData.subject) return;
    if (currentStep === 3 && !formData.unitId) return;
    if (currentStep === 4 && !formData.estrategiaPlanificacion) return;
    if (currentStep === 5 && formData.recursosEstudiantes.length === 0) return;
    if (currentStep === 6 && formData.recursosMaestro.length === 0) return;
    
    if (currentStep === 6) {
      handleSubmit();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSelectionAndAdvance = (field: keyof typeof formData, value: string) => {
    // Prevent multiple simultaneous transitions
    if (isTransitioning) return;
    
    // Cancel any pending auto-advance
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }
    
    // Update the form data
    const updates: any = { [field]: value };
    
    // Clear dependent fields when changing earlier selections
    if (field === 'grade') {
      updates.subject = '';
      updates.unitId = '';
    } else if (field === 'subject') {
      updates.unitId = '';
    }
    
    setFormData({ ...formData, ...updates });
    setIsTransitioning(true);
    
    // Auto-advance to next step after a short delay
    autoAdvanceTimeoutRef.current = setTimeout(() => {
      if (currentStep < 6) {
        setCurrentStep(currentStep + 1);
      } else {
        // Last step - submit
        handleSubmit();
      }
      setIsTransitioning(false);
      autoAdvanceTimeoutRef.current = null;
    }, 300);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current);
      }
    };
  }, []);

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    console.log('🚀 [SUBMIT] Iniciando generación de planificación');
    setIsLoading(true);
    console.log('✅ [SUBMIT] Estado isLoading establecido a true');

    try {
      const allDatesInRange = generateDateRange(formData.startDate, formData.endDate);

      // Generar UUID único para esta planificación
      const uniqueId = crypto.randomUUID();
      console.log('🆔 [UUID] Generado ID único para planificación:', uniqueId);

      const webhookData = {
        id: uniqueId, // UUID único para identificar esta planificación
        correo: userEmail,
        estrategia_planificacion: formData.estrategiaPlanificacion,
        asignatura: formData.subject,
        grado: formData.grade,
        unidad: formData.unitId,
        dates: allDatesInRange,
        recursos_estudiantes: formData.recursosEstudiantes,
        recursos_maestro: formData.recursosMaestro,
        recursos_disponibles: '',
        estrategias_ensenanza_aprendizaje: [],
        tecnicas_evaluacion: [],
        instrumentos_evaluacion: [],
        efemeride: efemeride || null
      };

      // Clean up efeméride data from sessionStorage
      sessionStorage.removeItem('selectedEfemeride');
      sessionStorage.removeItem('efemeridesInRange');

      const webhookResponse = await fetch('/api/send-unit-planning-to-n8n', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookData),
      });

      const result = await webhookResponse.json();
      
      if (result.success) {
        // Obtener el conteo inicial de planificaciones
        let initialCount = 0;
        try {
          const initialResponse = await fetch(`https://n8n.srv1144975.hstgr.cloud/webhook/b5d1a794-50e1-402d-b03a-624283425719`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo: userEmail }),
          });
          const initialPlannings = await initialResponse.json();
          initialCount = Array.isArray(initialPlannings) ? initialPlannings.length : 0;
        } catch (err) {
          console.error('Error obteniendo conteo inicial:', err);
        }
        
        // Esperar 10 segundos antes de empezar a verificar
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        // Polling
        let attempts = 0;
        const maxAttempts = 40;
        const startTime = Date.now();
        
        const checkPlanning = async (): Promise<boolean> => {
          try {
            const response = await fetch(`https://n8n.srv1144975.hstgr.cloud/webhook/b5d1a794-50e1-402d-b03a-624283425719`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ correo: userEmail }),
            });
            
            const plannings = await response.json();
            const currentCount = Array.isArray(plannings) ? plannings.length : 0;
            return currentCount > initialCount;
          } catch (err) {
            console.error('Error verificando planificación:', err);
            return false;
          }
        };
        
        const pollForPlanning = () => {
          setTimeout(async () => {
            attempts++;
            const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
            console.log(`🔍 Verificando planificación (intento ${attempts}/${maxAttempts}, ${elapsedSeconds}s transcurridos)...`);
            
            const hasNewPlanning = await checkPlanning();
            
            if (hasNewPlanning) {
              window.location.href = '/resumen-planificacion';
            } else if (attempts >= maxAttempts) {
              alert('La planificación está tomando más tiempo del esperado. Por favor, verifica tu lista de planificaciones en unos minutos.');
              setIsLoading(false);
            } else {
              pollForPlanning();
            }
          }, 5000);
        };
        
        pollForPlanning();
      } else {
        throw new Error(result.error || 'Error al generar la planificación');
      }
      
    } catch (err) {
      console.error('Error:', err);
      setIsLoading(false);
      alert('Hubo un error al iniciar la planificación. Por favor, intenta nuevamente.');
    }
  };

  // Loading screen - versión ultra simple sin componentes externos
  if (isLoading) {
    return (
      <div 
        id="loading-screen"
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#5B7FCC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 9999
        }}
      >
        <div style={{ textAlign: 'center', width: '100%', maxWidth: '350px' }}>
          {/* Emoji como icono - funciona en TODOS los navegadores */}
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>
            ✨
          </div>
          
          {/* Título */}
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '12px'
          }}>
            Generando Planificación
          </div>
          
          {/* Descripción */}
          <div style={{
            fontSize: '16px',
            color: 'white',
            opacity: 0.9,
            marginBottom: '20px'
          }}>
            Esto puede tomar unos segundos...
          </div>
          
          {/* Barra de progreso simple */}
          <div style={{
            width: '80%',
            height: '6px',
            backgroundColor: 'rgba(255,255,255,0.3)',
            borderRadius: '3px',
            margin: '0 auto 16px'
          }}>
            <div style={{
              width: '50%',
              height: '100%',
              backgroundColor: 'white',
              borderRadius: '3px'
            }} />
          </div>
          
          {/* Texto de ayuda */}
          <div style={{
            fontSize: '13px',
            color: 'white',
            opacity: 0.7
          }}>
            Por favor no cierres esta ventana
          </div>
        </div>
      </div>
    );
  }

  const canProceed = () => {
    if (currentStep === 1) return formData.grade !== '';
    if (currentStep === 2) return formData.subject !== '';
    if (currentStep === 3) return formData.unitId !== '';
    if (currentStep === 4) return formData.estrategiaPlanificacion !== '';
    if (currentStep === 5) return formData.recursosEstudiantes.length > 0;
    if (currentStep === 6) return formData.recursosMaestro.length > 0;
    return false;
  };

  const toggleRecursoEstudiante = (recurso: string) => {
    setFormData(prev => ({
      ...prev,
      recursosEstudiantes: prev.recursosEstudiantes.includes(recurso)
        ? prev.recursosEstudiantes.filter(r => r !== recurso)
        : [...prev.recursosEstudiantes, recurso]
    }));
  };

  const toggleRecursoMaestro = (recurso: string) => {
    setFormData(prev => ({
      ...prev,
      recursosMaestro: prev.recursosMaestro.includes(recurso)
        ? prev.recursosMaestro.filter(r => r !== recurso)
        : [...prev.recursosMaestro, recurso]
    }));
  };

  return (
    <div className="min-h-screen px-3 sm:px-4 py-4 sm:py-8" style={{ background: '#5B7FCC' }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-white/90 hover:text-white mb-4 sm:mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm sm:text-base font-medium">Volver al calendario</span>
        </button>

        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
            Nueva Planificación
          </h1>
          <p className="text-sm sm:text-base text-white/80">
            Paso {currentStep} de 6
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full h-2 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 6) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl sm:rounded-[28px] p-5 sm:p-8 shadow-xl">
          <div className="space-y-4">
            {/* Previous selections summary - Show compact badges */}
            {currentStep > 1 && (
              <div className="bg-blue-50 rounded-xl p-3 sm:p-4 border-2 border-blue-200">
                <div className="flex flex-wrap gap-2">
                  {formData.grade && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#5B7FCC] text-white rounded-lg text-sm font-semibold">
                      <span className="text-xs opacity-75">Grado:</span>
                      <span>{formData.grade}</span>
                      <button
                        onClick={() => {
                          // Cancel any pending auto-advance
                          if (autoAdvanceTimeoutRef.current) {
                            clearTimeout(autoAdvanceTimeoutRef.current);
                            autoAdvanceTimeoutRef.current = null;
                          }
                          setIsTransitioning(false);
                          setFormData({ ...formData, grade: '', subject: '', unitId: '' });
                          setCurrentStep(1);
                        }}
                        className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                  {formData.subject && currentStep > 2 && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#5B7FCC] text-white rounded-lg text-sm font-semibold">
                      <span className="text-xs opacity-75">Asignatura:</span>
                      <span>{formData.subject}</span>
                      <button
                        onClick={() => {
                          // Cancel any pending auto-advance
                          if (autoAdvanceTimeoutRef.current) {
                            clearTimeout(autoAdvanceTimeoutRef.current);
                            autoAdvanceTimeoutRef.current = null;
                          }
                          setIsTransitioning(false);
                          setFormData({ ...formData, subject: '', unitId: '' });
                          setCurrentStep(2);
                        }}
                        className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                  {formData.unitId && currentStep > 3 && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#5B7FCC] text-white rounded-lg text-sm font-semibold max-w-full">
                      <span className="text-xs opacity-75">Unidad:</span>
                      <span className="truncate">{formData.unitId}</span>
                      <button
                        onClick={() => {
                          // Cancel any pending auto-advance
                          if (autoAdvanceTimeoutRef.current) {
                            clearTimeout(autoAdvanceTimeoutRef.current);
                            autoAdvanceTimeoutRef.current = null;
                          }
                          setIsTransitioning(false);
                          setFormData({ ...formData, unitId: '' });
                          setCurrentStep(3);
                        }}
                        className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors flex-shrink-0"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Período seleccionado - Hidden but still loaded and sent to webhook */}

            {/* Efeméride Info */}
            {efemeride && (
              <div className="border-2 border-amber-300 bg-amber-50 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-xs font-bold uppercase tracking-wide text-amber-700 mb-1">
                      {Array.isArray(efemeride) && efemeride.length > 1 
                        ? 'Efemérides Incluidas' 
                        : 'Efeméride Incluida'}
                    </p>
                    <p className="text-sm font-semibold text-amber-900">
                      {Array.isArray(efemeride) 
                        ? efemeride.map((e: any) => e.name).join(', ')
                        : efemeride.name}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Grado */}
            {currentStep === 1 && (
              <div>
                <label className="block text-sm sm:text-base font-bold text-slate-800 mb-3">
                  Grado
                </label>
                <div className="space-y-2">
                  {['1er', '2do', '3er'].map((grado) => (
                    <label
                      key={grado}
                      className={`flex items-start gap-3 p-3 sm:p-4 rounded-xl border-2 transition-all ${
                        formData.grade === grado
                          ? 'border-[#5B7FCC] bg-blue-50'
                          : 'border-slate-200 bg-white hover:border-[#5B7FCC] hover:bg-blue-50/50'
                      } ${isTransitioning ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                    >
                      <input
                        type="radio"
                        name="grade"
                        value={grado}
                        checked={formData.grade === grado}
                        onChange={(e) => handleSelectionAndAdvance('grade', e.target.value)}
                        className="mt-0.5 w-4 h-4 sm:w-5 sm:h-5 text-[#5B7FCC] focus:ring-[#5B7FCC] cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm sm:text-base font-bold text-slate-900">
                          {grado}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Asignatura */}
            {currentStep === 2 && (
              <div>
                <label className="block text-sm sm:text-base font-bold text-slate-800 mb-3">
                  Asignatura
                </label>
                <div className="space-y-2">
                  {['Lengua Española', 'Matemática', 'Ciencias de la Naturaleza', 'Ciencias Sociales'].map((asignatura) => (
                    <label
                      key={asignatura}
                      className={`flex items-start gap-3 p-3 sm:p-4 rounded-xl border-2 transition-all ${
                        formData.subject === asignatura
                          ? 'border-[#5B7FCC] bg-blue-50'
                          : 'border-slate-200 bg-white hover:border-[#5B7FCC] hover:bg-blue-50/50'
                      } ${isTransitioning ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                    >
                      <input
                        type="radio"
                        name="subject"
                        value={asignatura}
                        checked={formData.subject === asignatura}
                        onChange={(e) => handleSelectionAndAdvance('subject', e.target.value)}
                        className="mt-0.5 w-4 h-4 sm:w-5 sm:h-5 text-[#5B7FCC] focus:ring-[#5B7FCC] cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm sm:text-base font-bold text-slate-900">
                          {asignatura}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Unidad */}
            {currentStep === 3 && (
              <div>
                <label className="block text-sm sm:text-base font-bold text-slate-800 mb-3">
                  Unidad
                </label>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                  {getAvailableUnits(formData.grade, formData.subject).map((unidad) => (
                    <label
                      key={unidad}
                      className={`flex items-start gap-3 p-3 sm:p-4 rounded-xl border-2 transition-all ${
                        formData.unitId === unidad
                          ? 'border-[#5B7FCC] bg-blue-50'
                          : 'border-slate-200 bg-white hover:border-[#5B7FCC] hover:bg-blue-50/50'
                      } ${isTransitioning ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                    >
                      <input
                        type="radio"
                        name="unitId"
                        value={unidad}
                        checked={formData.unitId === unidad}
                        onChange={(e) => handleSelectionAndAdvance('unitId', e.target.value)}
                        className="mt-0.5 w-4 h-4 sm:w-5 sm:h-5 text-[#5B7FCC] focus:ring-[#5B7FCC] cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm sm:text-base font-bold text-slate-900">
                          {unidad}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Estrategia de Planificación */}
            {currentStep === 4 && (
              <div>
                <label className="block text-sm sm:text-base font-bold text-slate-800 mb-3">
                  Estrategia de Planificación
                </label>
                <div className="space-y-2">
                  {[
                    { 
                      value: 'Unidad de Aprendizaje', 
                      desc: 'Organiza los contenidos en torno a una situación de aprendizaje concreta para construir conocimientos.' 
                    },
                    { 
                      value: 'Eje Temático', 
                      desc: 'Organiza el plan alrededor de un tema central (ej. "El Agua") que conecta varias asignaturas.' 
                    }
                  ].map((estrategia) => (
                    <label
                      key={estrategia.value}
                      className={`flex items-start gap-3 p-3 sm:p-4 rounded-xl border-2 transition-all ${
                        formData.estrategiaPlanificacion === estrategia.value
                          ? 'border-[#5B7FCC] bg-blue-50'
                          : 'border-slate-200 bg-white hover:border-[#5B7FCC] hover:bg-blue-50/50'
                      } ${isTransitioning ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                    >
                      <input
                        type="radio"
                        name="estrategiaPlanificacion"
                        value={estrategia.value}
                        checked={formData.estrategiaPlanificacion === estrategia.value}
                        onChange={(e) => handleSelectionAndAdvance('estrategiaPlanificacion', e.target.value)}
                        className="mt-0.5 w-4 h-4 sm:w-5 sm:h-5 text-[#5B7FCC] focus:ring-[#5B7FCC] cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm sm:text-base font-bold text-slate-900 mb-1">
                          {estrategia.value}
                        </p>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                          {estrategia.desc}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Recursos para Estudiantes */}
            {currentStep === 5 && (
              <div>
                <label className="block text-sm sm:text-base font-bold text-slate-800 mb-2">
                  Materiales de los Estudiantes
                </label>
                <p className="text-sm text-slate-600 mb-4">
                  ¿Qué materiales disponibles tienen los estudiantes para este tema?
                </p>
                
                {/* Selected recursos badges */}
                {formData.recursosEstudiantes.length > 0 && (
                  <div className="bg-blue-50 rounded-xl p-3 sm:p-4 border-2 border-blue-200 mb-3">
                    <div className="flex flex-wrap gap-2">
                      {formData.recursosEstudiantes.map((recurso) => (
                        <div key={recurso} className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#5B7FCC] text-white rounded-lg text-xs sm:text-sm font-semibold">
                          <span>{recurso}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRecursoEstudiante(recurso);
                            }}
                            className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                          >
                            <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-blue-700 mt-2 font-medium">
                      {formData.recursosEstudiantes.length} material{formData.recursosEstudiantes.length !== 1 ? 'es' : ''} seleccionado{formData.recursosEstudiantes.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}

                {/* Available recursos list */}
                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                  {RECURSOS_ESTUDIANTES.filter(r => !formData.recursosEstudiantes.includes(r)).map((recurso) => (
                    <label
                      key={recurso}
                      className={`flex items-start gap-3 p-3 sm:p-4 rounded-xl border-2 transition-all ${
                        isTransitioning 
                          ? 'cursor-not-allowed opacity-50 border-slate-200 bg-white' 
                          : 'cursor-pointer border-slate-200 bg-white hover:border-[#5B7FCC] hover:bg-blue-50/50'
                      }`}
                      onClick={() => !isTransitioning && toggleRecursoEstudiante(recurso)}
                    >
                      <div className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 border-slate-300 bg-white">
                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <span className="text-sm sm:text-base font-medium text-slate-900 flex-1">{recurso}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Step 6: Recursos para Maestro */}
            {currentStep === 6 && (
              <div>
                <label className="block text-sm sm:text-base font-bold text-slate-800 mb-2">
                  Materiales del Maestro
                </label>
                <p className="text-sm text-slate-600 mb-4">
                  ¿Qué materiales tienes tú para desarrollar este tema?
                </p>
                
                {/* Selected recursos badges */}
                {formData.recursosMaestro.length > 0 && (
                  <div className="bg-blue-50 rounded-xl p-3 sm:p-4 border-2 border-blue-200 mb-3">
                    <div className="flex flex-wrap gap-2">
                      {formData.recursosMaestro.map((recurso) => (
                        <div key={recurso} className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#5B7FCC] text-white rounded-lg text-xs sm:text-sm font-semibold">
                          <span>{recurso}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRecursoMaestro(recurso);
                            }}
                            className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                          >
                            <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-blue-700 mt-2 font-medium">
                      {formData.recursosMaestro.length} material{formData.recursosMaestro.length !== 1 ? 'es' : ''} seleccionado{formData.recursosMaestro.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}

                {/* Available recursos list */}
                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                  {RECURSOS_MAESTRO.filter(r => !formData.recursosMaestro.includes(r)).map((recurso) => (
                    <label
                      key={recurso}
                      className={`flex items-start gap-3 p-3 sm:p-4 rounded-xl border-2 transition-all ${
                        isTransitioning 
                          ? 'cursor-not-allowed opacity-50 border-slate-200 bg-white' 
                          : 'cursor-pointer border-slate-200 bg-white hover:border-[#5B7FCC] hover:bg-blue-50/50'
                      }`}
                      onClick={() => !isTransitioning && toggleRecursoMaestro(recurso)}
                    >
                      <div className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 border-slate-300 bg-white">
                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <span className="text-sm sm:text-base font-medium text-slate-900 flex-1">{recurso}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-6 sm:mt-8">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-3.5 bg-slate-100 text-slate-700 font-bold text-sm sm:text-base rounded-xl hover:bg-slate-200 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
                Anterior
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-3.5 text-white font-bold text-sm sm:text-base rounded-xl shadow-lg hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: '#5B7FCC' }}
            >
              {currentStep === 6 ? (
                <>
                  <Sparkles className="w-5 h-5" />
                  Crear Planificación
                </>
              ) : (
                <>
                  Siguiente
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      
    </div>
  );
}
