import z from "zod";

// User registration schema
export const UserRegistrationSchema = z.object({
  correo: z.string().email("Correo inválido"),
});

export type UserRegistration = z.infer<typeof UserRegistrationSchema>;

// Teacher registration schema
export const TeacherRegistrationSchema = z.object({
  correo: z.string().email("Correo inválido"),
  centro_educativo: z.string().min(1, "Centro educativo es requerido"),
  nombre: z.string().min(1, "Nombre es requerido"),
  apellido: z.string().min(1, "Apellido es requerido"),
  recursos_didacticos: z.string().min(1, "Recursos didácticos es requerido"),
  codigo_telegram: z.string().optional(),
  grado: z.string().min(1, "Grado es requerido"),
  asignatura: z.string().min(1, "Asignatura es requerida"),
  unidad_tema: z.string().min(1, "Unidad/Tema es requerido"),
  hora_planificacion: z.string().min(1, "Hora de planificación es requerida"),
  fecha_inicio_date: z.string().min(1, "Fecha inicio es requerida"),
  fecha_fin_date: z.string().min(1, "Fecha fin es requerida"),
});

export type TeacherRegistration = z.infer<typeof TeacherRegistrationSchema>;

// Login schema
export const LoginSchema = z.object({
  correo: z.string().email("Correo inválido"),
});

export type Login = z.infer<typeof LoginSchema>;

// Unit planning schema
export const UnitPlanningSchema = z.object({
  teacher_registration_id: z.number(),
  titulo: z.string().min(1, "Título es requerido"),
  descripcion: z.string().optional(),
  fecha_inicio_date: z.string().optional(),
  fecha_fin_date: z.string().optional(),
});

export type UnitPlanning = z.infer<typeof UnitPlanningSchema>;

// Daily planning schema
export const DailyPlanningSchema = z.object({
  unit_planning_id: z.number(),
  fecha_date: z.string().min(1, "Fecha es requerida"),
  titulo: z.string().min(1, "Título es requerido"),
  objetivos: z.string().optional(),
  actividades: z.string().optional(),
  recursos: z.string().optional(),
  evaluacion: z.string().optional(),
  notas: z.string().optional(),
});

export type DailyPlanning = z.infer<typeof DailyPlanningSchema>;
