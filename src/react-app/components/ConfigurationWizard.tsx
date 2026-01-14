import { useState, useEffect } from "react";
import { ArrowLeft, Sparkles, ChevronRight, ChevronLeft } from "lucide-react";
import { usePlanning } from "@/react-app/context/PlanningContext";

interface ConfigurationWizardProps {
  userEmail: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const GRADOS = ["1er", "2do", "3er"];
const ASIGNATURAS = ["Lengua Española", "Matemática", "Ciencias de la Naturaleza", "Ciencias Sociales"];

// Temas por asignatura y grado
const TEMAS_POR_ASIGNATURA: Record<string, Record<string, string[]>> = {
  "Lengua Española": {
    "1er": [
      "Secuencia 1: La Tarjeta de Identidad",
      "Secuencia 2: El Letrero",
      "Secuencia 3: La Lista de Compras",
      "Secuencia 4: El Mensaje Corto",
      "Secuencia 5: La Noticia",
      "Secuencia 6: El Cuento"
    ],
    "2do": [
      "Secuencia 1: El Documento de Identidad",
      "Secuencia 2: La Etiqueta",
      "Secuencia 3: La Receta",
      "Secuencia 4: La Noticia",
      "Secuencia 5: La Canción Infantil",
      "Secuencia 6: El Cuento"
    ],
    "3er": [
      "Secuencia 1: La Autobiografía",
      "Secuencia 2: El Instructivo",
      "Secuencia 3: La Noticia",
      "Secuencia 4: El Cuento",
      "Secuencia 5: El Artículo Expositivo",
      "Secuencia 6: La Adivinanza"
    ]
  },
  "Matemática": {
    "1er": [
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
    "2do": [
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
    "3er": [
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
    ]
  },
  "Ciencias de la Naturaleza": {
    "1er": [
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
    "2do": [
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
    "3er": [
      "Secuencia 1: Seres vivos y Cadena alimenticia",
      "Secuencia 2: Sistemas del cuerpo (Excretor, Nervioso, Reproductor)",
      "Secuencia 3: Ciclo de vida y Salud",
      "Secuencia 4: Propiedades de la materia (Masa, peso, volumen, densidad)",
      "Secuencia 5: Energía (Formas y eficiencia) y Fuerzas",
      "Secuencia 6: Máquinas y Tecnología",
      "Secuencia 7: Ciencias de la Tierra (Ciclo de las rocas, Fenómenos geológicos)",
      "Secuencia 8: Sistema Solar y Movimientos de la Tierra"
    ]
  },
  "Ciencias Sociales": {
    "1er": [
      "Secuencia 1: Identificación personal y del entorno (Identidad, Familia, Escuela, Comunidad)",
      "Secuencia 2: Historia familiar y entorno",
      "Secuencia 3: Orientación espacial (Vivienda, Escuela, Isla de Santo Domingo)",
      "Secuencia 4: Orientación temporal (Pasado, presente, futuro)",
      "Secuencia 5: Valores y deberes de las personas",
      "Secuencia 6: Derechos y necesidades",
      "Secuencia 7: Entorno natural y social",
      "Secuencia 8: Fechas patrias, Héroes y Símbolos Patrios"
    ],
    "2do": [
      "Secuencia 1: Orientación espacial (Puntos cardinales, Hemisferios, Antillas)",
      "Secuencia 2: La Comunidad (Espacio natural y social)",
      "Secuencia 3: Sucesos y eventos de la historia familiar y comunitaria",
      "Secuencia 4: Derechos y deberes del Niño y la Niña",
      "Secuencia 5: Educación vial: normas y señales de tránsito",
      "Secuencia 6: Eventos históricos esenciales que conforman nuestra identidad (Primeros pobladores, Independencia, Símbolos)"
    ],
    "3er": [
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

const getTemasPorAsignatura = (grado: string, asignatura: string): string[] => {
  if (!asignatura || !grado) return [];
  return TEMAS_POR_ASIGNATURA[asignatura]?.[grado] || [];
};

export default function ConfigurationWizard({ userEmail, onSuccess: _onSuccess, onCancel }: ConfigurationWizardProps) {
  const { planningData, updatePlanningData, resetPlanningData } = usePlanning();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    const savedStartDate = sessionStorage.getItem('unitPlanningStartDate');
    const savedEndDate = sessionStorage.getItem('unitPlanningEndDate');
    
    if (savedStartDate && savedEndDate) {
      setStartDate(savedStartDate);
      setEndDate(savedEndDate);
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
    console.log('🔘 [NEXT] Usuario presionó "Siguiente" en paso', currentStep);
    console.log('📋 [DATA] Datos actuales:', {
      paso: currentStep,
      recursos: planningData.recursos_disponibles?.substring(0, 50) + '...'
    });
    
    // Validate current step
    if (currentStep === 1 && (!planningData.nombre || !planningData.apellido || !planningData.centro_educativo)) {
      console.warn('⚠️ [VALIDACIÓN] Paso 1 incompleto');
      return;
    }
    if (currentStep === 2 && !planningData.grado) {
      console.warn('⚠️ [VALIDACIÓN] Paso 2 incompleto');
      return;
    }
    if (currentStep === 3 && !planningData.asignatura) {
      console.warn('⚠️ [VALIDACIÓN] Paso 3 incompleto');
      return;
    }
    if (currentStep === 4 && (!planningData.cantidad_alumnos || planningData.cantidad_alumnos < 1)) {
      console.warn('⚠️ [VALIDACIÓN] Paso 4 incompleto');
      return;
    }
    if (currentStep === 5 && !planningData.estrategia_planificacion) {
      console.warn('⚠️ [VALIDACIÓN] Paso 5 incompleto');
      return;
    }
    if (currentStep === 6 && !planningData.tema) {
      console.warn('⚠️ [VALIDACIÓN] Paso 6 incompleto');
      return;
    }
    if (currentStep === 7 && !planningData.recursos_disponibles) {
      console.warn('⚠️ [VALIDACIÓN] Paso 7 incompleto - recursos vacíos');
      return;
    }
    
    if (currentStep === 7) {
      console.log('✅ [REVIEW] Mostrando pantalla de revisión');
      setShowReview(true);
    } else {
      console.log('➡️ [NEXT] Avanzando al paso', currentStep + 1);
      setCurrentStep(currentStep + 1);
    }
  };

  const handleEditField = (step: number) => {
    setShowReview(false);
    setCurrentStep(step);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    console.log('🚀 [SUBMIT] Iniciando generación de planificación');
    setIsSubmitting(true);
    console.log('✅ [SUBMIT] Estado isSubmitting establecido a true');
    
    const allDatesInRange = generateDateRange(startDate, endDate);
    
    // Generar UUID único para esta planificación
    const uniqueId = crypto.randomUUID();
    console.log('🆔 [UUID] Generado ID único para planificación:', uniqueId);
    
    const webhookData = {
      id: uniqueId, // UUID único para identificar esta planificación
      correo: userEmail,
      nombre: planningData.nombre,
      apellido: planningData.apellido,
      centro_educativo: planningData.centro_educativo,
      estrategia_planificacion: planningData.estrategia_planificacion,
      grado: planningData.grado,
      asignatura: planningData.asignatura,
      cantidad_alumnos: planningData.cantidad_alumnos,
      unidad: planningData.tema,
      recursos_disponibles: planningData.recursos_disponibles,
      horario_clase: planningData.horario_clase,
      fecha_estimada: planningData.fecha_estimada,
      dates: allDatesInRange,
    };

    sessionStorage.removeItem('selectedEfemeride');
    sessionStorage.removeItem('efemeridesInRange');

    try {
      const webhookResponse = await fetch('/api/send-unit-planning-to-n8n', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookData),
      });
      
      const result = await webhookResponse.json();
      
      if (result.success) {
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
        
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        let attempts = 0;
        const maxAttempts = 40;
        
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
            const hasNewPlanning = await checkPlanning();
            
            if (hasNewPlanning) {
              resetPlanningData();
              window.location.href = '/resumen-planificacion';
            } else if (attempts >= maxAttempts) {
              alert('La planificación está tomando más tiempo. Por favor, verifica tu lista en unos minutos.');
              setIsSubmitting(false);
            } else {
              pollForPlanning();
            }
          }, 5000);
        };
        
        pollForPlanning();
      } else {
        alert('Hubo un error al generar la planificación. Por favor, intenta nuevamente.');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error al enviar solicitud:', error);
      alert('Hubo un error al generar la planificación. Por favor, intenta nuevamente.');
      setIsSubmitting(false);
    }
  };

  // Loading screen - versión ultra simple sin componentes externos
  if (isSubmitting) {
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

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const canProceed = () => {
    try {
      if (currentStep === 1) return !!(planningData.nombre && planningData.apellido && planningData.centro_educativo);
      if (currentStep === 2) return !!planningData.grado;
      if (currentStep === 3) return !!planningData.asignatura;
      if (currentStep === 4) return !!(planningData.cantidad_alumnos && planningData.cantidad_alumnos > 0);
      if (currentStep === 5) return !!planningData.estrategia_planificacion;
      if (currentStep === 6) return !!planningData.tema;
      if (currentStep === 7) {
        const hasRecursos = planningData.recursos_disponibles && planningData.recursos_disponibles.trim().length > 0;
        console.log('🔍 [VALIDACIÓN RECURSOS]', hasRecursos ? '✅ Válido' : '❌ Vacío');
        return hasRecursos;
      }
      return false;
    } catch (error) {
      console.error('❌ [canProceed] Error:', error);
      return false;
    }
  };

  // Log current step for debugging
  useEffect(() => {
    console.log('🔢 [WIZARD] Paso actual:', currentStep);
    if (currentStep === 7) {
      console.log('📝 [PASO 7] Recursos actuales:', planningData.recursos_disponibles || '(vacío)');
    }
  }, [currentStep, planningData.recursos_disponibles]);

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
            {showReview ? 'Revisar y Confirmar' : 'Configuración Inicial'}
          </h1>
          <p className="text-sm sm:text-base text-white/80">
            {showReview ? 'Verifica tu información antes de enviar' : `Paso ${currentStep} de 7`}
          </p>
        </div>

        {/* Progress Bar */}
        {!showReview && (
          <div className="mb-6">
            <div className="w-full h-2 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 7) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-2xl sm:rounded-[28px] p-5 sm:p-8 shadow-xl">
          {/* Review Screen */}
          {showReview ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
                <p className="text-sm sm:text-base text-blue-900 font-medium">
                  ⚠️ Por favor revisa cuidadosamente toda la información antes de generar la planificación.
                </p>
              </div>

              {/* Información Personal */}
              <div className="border-2 border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base sm:text-lg font-bold text-slate-800">Información Personal</h3>
                  <button
                    onClick={() => handleEditField(1)}
                    className="text-sm text-[#5B7FCC] hover:text-[#4a6bb0] font-semibold"
                  >
                    Editar
                  </button>
                </div>
                <div className="space-y-2 text-sm sm:text-base">
                  <p><span className="font-semibold text-slate-600">Nombre:</span> {planningData.nombre}</p>
                  <p><span className="font-semibold text-slate-600">Apellido:</span> {planningData.apellido}</p>
                  <p><span className="font-semibold text-slate-600">Centro Educativo:</span> {planningData.centro_educativo}</p>
                </div>
              </div>

              {/* Información del Grupo */}
              <div className="border-2 border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base sm:text-lg font-bold text-slate-800">Información del Grupo</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditField(2)}
                      className="text-sm text-[#5B7FCC] hover:text-[#4a6bb0] font-semibold"
                    >
                      Editar
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-sm sm:text-base">
                  <p><span className="font-semibold text-slate-600">Grado:</span> {planningData.grado}</p>
                  <p><span className="font-semibold text-slate-600">Asignatura:</span> {planningData.asignatura}</p>
                  <p><span className="font-semibold text-slate-600">Cantidad de Alumnos:</span> {planningData.cantidad_alumnos}</p>
                </div>
              </div>

              {/* Periodo y Fechas */}
              <div className="border-2 border-green-200 bg-green-50 rounded-xl p-4">
                <h3 className="text-base sm:text-lg font-bold text-green-900 mb-3">Período Seleccionado</h3>
                <div className="space-y-2 text-sm sm:text-base">
                  <p><span className="font-semibold text-green-700">Inicio:</span> {formatDate(startDate)}</p>
                  <p><span className="font-semibold text-green-700">Fin:</span> {formatDate(endDate)}</p>
                </div>
              </div>

              {/* Detalles de Planificación */}
              <div className="border-2 border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base sm:text-lg font-bold text-slate-800">Detalles de la Planificación</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditField(5)}
                      className="text-sm text-[#5B7FCC] hover:text-[#4a6bb0] font-semibold"
                    >
                      Editar
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-sm sm:text-base">
                  <p><span className="font-semibold text-slate-600">Estrategia:</span> {planningData.estrategia_planificacion}</p>
                  <p><span className="font-semibold text-slate-600">Tema/Unidad:</span> {planningData.tema}</p>
                  <p><span className="font-semibold text-slate-600">Recursos Disponibles:</span> {planningData.recursos_disponibles}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowReview(false)}
                  className="px-4 sm:px-6 py-3 sm:py-3.5 bg-slate-100 text-slate-700 font-bold text-sm sm:text-base rounded-xl hover:bg-slate-200 transition-all"
                >
                  Volver
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-3.5 text-white font-bold text-sm sm:text-base rounded-xl shadow-lg hover:shadow-xl active:scale-[0.98] transition-all"
                  style={{ background: '#10b981' }}
                >
                  <Sparkles className="w-5 h-5" />
                  Confirmar y Generar
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5 sm:space-y-6">
            {/* Step 1: Nombre */}
            {currentStep === 1 && (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-lg sm:text-2xl font-bold text-slate-800">Información Personal</h2>
                </div>

                <div>
                  <label className="block text-sm sm:text-base font-bold text-slate-800 mb-2">Nombre</label>
                  <input
                    type="text"
                    value={planningData.nombre}
                    onChange={(e) => updatePlanningData({ nombre: e.target.value })}
                    placeholder="Tu nombre"
                    className="block w-full h-12 sm:h-14 px-3 sm:px-4 text-base sm:text-lg rounded-xl border-2 border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#5B7FCC] focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm sm:text-base font-bold text-slate-800 mb-2">Apellido</label>
                  <input
                    type="text"
                    value={planningData.apellido}
                    onChange={(e) => updatePlanningData({ apellido: e.target.value })}
                    placeholder="Tu apellido"
                    className="block w-full h-12 sm:h-14 px-3 sm:px-4 text-base sm:text-lg rounded-xl border-2 border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#5B7FCC] focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm sm:text-base font-bold text-slate-800 mb-2">Centro Educativo</label>
                  <input
                    type="text"
                    value={planningData.centro_educativo}
                    onChange={(e) => updatePlanningData({ centro_educativo: e.target.value })}
                    placeholder="Nombre de tu escuela"
                    className="block w-full h-12 sm:h-14 px-3 sm:px-4 text-base sm:text-lg rounded-xl border-2 border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#5B7FCC] focus:border-transparent transition-all"
                  />
                </div>
              </>
            )}

            {/* Step 2: Grado */}
            {currentStep === 2 && (
              <div>
                <label className="block text-sm sm:text-base font-bold text-slate-800 mb-3">
                  Grado
                </label>
                <div className="space-y-2">
                  {GRADOS.map((grado) => (
                    <label
                      key={grado}
                      className={`flex items-start gap-3 p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        planningData.grado === grado
                          ? 'border-[#5B7FCC] bg-blue-50'
                          : 'border-slate-200 bg-white hover:border-[#5B7FCC] hover:bg-blue-50/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="grado"
                        value={grado}
                        checked={planningData.grado === grado}
                        onChange={(e) => updatePlanningData({ grado: e.target.value, tema: '' })}
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

            {/* Step 3: Asignatura */}
            {currentStep === 3 && (
              <div>
                <label className="block text-sm sm:text-base font-bold text-slate-800 mb-3">
                  Asignatura
                </label>
                <div className="space-y-2">
                  {ASIGNATURAS.map((asignatura) => (
                    <label
                      key={asignatura}
                      className={`flex items-start gap-3 p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        planningData.asignatura === asignatura
                          ? 'border-[#5B7FCC] bg-blue-50'
                          : 'border-slate-200 bg-white hover:border-[#5B7FCC] hover:bg-blue-50/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="asignatura"
                        value={asignatura}
                        checked={planningData.asignatura === asignatura}
                        onChange={(e) => updatePlanningData({ asignatura: e.target.value, tema: '' })}
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

            {/* Step 4: Cantidad de Alumnos */}
            {currentStep === 4 && (
              <div>
                <label className="block text-sm sm:text-base font-bold text-slate-800 mb-2">Cantidad de Alumnos</label>
                <input
                  type="number"
                  value={planningData.cantidad_alumnos || ''}
                  onChange={(e) => updatePlanningData({ cantidad_alumnos: parseInt(e.target.value) || 0 })}
                  min="1"
                  placeholder="Número de estudiantes"
                  className="block w-full h-12 sm:h-14 px-3 sm:px-4 text-base sm:text-lg rounded-xl border-2 border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#5B7FCC] focus:border-transparent transition-all"
                />
              </div>
            )}

            {/* Step 5: Estrategia de Planificación */}
            {currentStep === 5 && (
              <>
                {startDate && endDate && (
                  <div className="bg-green-50 rounded-xl p-4 sm:p-5 border-2 border-green-200 mb-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-500 flex items-center justify-center">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-green-900 mb-1">Período Seleccionado</h3>
                        <p className="text-xs sm:text-sm text-green-800">
                          {formatDate(startDate)} - {formatDate(endDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

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
                        className={`flex items-start gap-3 p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          planningData.estrategia_planificacion === estrategia.value
                            ? 'border-[#5B7FCC] bg-blue-50'
                            : 'border-slate-200 bg-white hover:border-[#5B7FCC] hover:bg-blue-50/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="estrategiaPlanificacion"
                          value={estrategia.value}
                          checked={planningData.estrategia_planificacion === estrategia.value}
                          onChange={(e) => updatePlanningData({ estrategia_planificacion: e.target.value })}
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
              </>
            )}

            {/* Step 6: Tema/Unidad */}
            {currentStep === 6 && (
              <div>
                <label className="block text-sm sm:text-base font-bold text-slate-800 mb-3">
                  Tema/Unidad
                </label>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                  {getTemasPorAsignatura(planningData.grado, planningData.asignatura).map((tema) => (
                    <label
                      key={tema}
                      className={`flex items-start gap-3 p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        planningData.tema === tema
                          ? 'border-[#5B7FCC] bg-blue-50'
                          : 'border-slate-200 bg-white hover:border-[#5B7FCC] hover:bg-blue-50/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="tema"
                        value={tema}
                        checked={planningData.tema === tema}
                        onChange={(e) => updatePlanningData({ tema: e.target.value })}
                        className="mt-0.5 w-4 h-4 sm:w-5 sm:h-5 text-[#5B7FCC] focus:ring-[#5B7FCC] cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm sm:text-base font-bold text-slate-900">
                          {tema}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Step 7: Recursos Disponibles */}
            {currentStep === 7 && (
              <div className="space-y-4">
                <div className="text-center">
                  <h2 className="text-lg sm:text-2xl font-bold text-slate-800 mb-2">Recursos Disponibles</h2>
                  <p className="text-sm text-slate-600">
                    Describe los recursos que tienes en tu aula
                  </p>
                </div>

                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <p className="text-xs sm:text-sm text-blue-900 font-medium">
                    💡 Ejemplos: Pizarra, proyector, libros, tablets, material concreto, etc.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-3">
                    Lista tus recursos:
                  </label>
                  <textarea
                    value={planningData.recursos_disponibles || ''}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      console.log('📝 [RECURSOS] Actualizando:', newValue.length, 'caracteres');
                      updatePlanningData({ recursos_disponibles: newValue });
                    }}
                    rows={6}
                    placeholder="Pizarra, proyector, libros..."
                    className="w-full px-3 sm:px-4 py-3 text-base sm:text-lg rounded-xl border-2 border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#5B7FCC] focus:border-transparent transition-all resize-none"
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    Separa cada recurso con una coma o escríbelos en líneas separadas
                  </p>
                </div>
              </div>
            )}
          </div>
          )}

          {/* Navigation Buttons */}
          {!showReview && (
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
              {currentStep === 7 ? (
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
          )}
        </div>
      </div>

      
    </div>
  );
}
