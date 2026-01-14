import z from "zod";

// Planning Summary schema
export const PlanningSummarySchema = z.object({
  teacher_registration_id: z.number(),
  centro_educativo: z.string().optional(),
  docente: z.string().optional(),
  grado: z.string().optional(),
  tiempo_asignado: z.string().optional(),
  asignatura: z.string().optional(),
  unidad: z.string().optional(),
  contenidos_procedimentales: z.string().optional(),
  competencias_fundamentales: z.string().optional(),
  competencias_especificas_grado: z.string().optional(),
  ejes_transversal: z.string().optional(),
  valores_actitudes: z.string().optional(),
  indicadores_logro: z.string().optional(),
  areas_articuladas: z.string().optional(),
  estrategia_ensenanza_aprendizaje: z.string().optional(),
  actividades_ensenanza: z.string().optional(),
  actividades_aprendizaje: z.string().optional(),
  actividades_evaluacion: z.string().optional(),
  recursos_didacticos: z.string().optional(),
  fecha_inicio_date: z.string().optional(),
  fecha_fin_date: z.string().optional(),
  actividades: z.string().optional(),
});

export type PlanningSummary = z.infer<typeof PlanningSummarySchema>;

// Daily Planning Component schema
export const DailyPlanningComponentSchema = z.object({
  daily_planning_id: z.number(),
  component_type: z.enum(['lista_asistencia', 'el_cuento']),
  component_data: z.string().optional(),
});

export type DailyPlanningComponent = z.infer<typeof DailyPlanningComponentSchema>;

// Editable sections for planning summary
export const EDITABLE_SECTIONS = [
  { value: 'centro_educativo', label: 'Centro Educativo' },
  { value: 'docente', label: 'Docente' },
  { value: 'grado', label: 'Grado' },
  { value: 'tiempo_asignado', label: 'Tiempo Asignado' },
  { value: 'asignatura', label: 'Asignatura' },
  { value: 'unidad', label: 'Unidad' },
  { value: 'contenidos_procedimentales', label: 'CONTENIDOS PROCEDIMENTALES' },
  { value: 'competencias_fundamentales', label: 'COMPETENCIA FUNDAMENTALES' },
  { value: 'competencias_especificas_grado', label: 'COMPETENCIAS ESPECÍFICAS DEL GRADO' },
  { value: 'ejes_transversal', label: 'EJES TRANSVERSAL' },
  { value: 'valores_actitudes', label: 'VALORES Y ACTITUDES' },
  { value: 'indicadores_logro', label: 'INDICADORES DE LOGRO' },
  { value: 'areas_articuladas', label: 'Áreas Articuladas' },
  { value: 'estrategia_ensenanza_aprendizaje', label: 'ESTRATEGIA ENSEÑANZA-APRENDIZAJE' },
  { value: 'actividades_ensenanza', label: 'ACTIVIDADES DE ENSEÑANZA' },
  { value: 'actividades_aprendizaje', label: 'ACTIVIDADES DE APRENDIZAJE' },
  { value: 'actividades_evaluacion', label: 'ACTIVIDADES DE EVALUACIÓN' },
  { value: 'recursos_didacticos', label: 'Recursos Didácticos' },
  { value: 'fecha_inicio_date', label: 'Fecha Inicio' },
  { value: 'fecha_fin_date', label: 'Fecha Fin' },
  { value: 'actividades', label: 'Actividades' },
] as const;

// Component types for daily planning
export const DAILY_PLANNING_COMPONENT_TYPES = [
  { value: 'lista_asistencia', label: 'Lista de Asistencia' },
  { value: 'el_cuento', label: 'El Cuento' },
] as const;
