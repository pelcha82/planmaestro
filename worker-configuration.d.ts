interface Env {
  // --- Autenticación y Registro ---
  WEBHOOK_LOGIN_URL: string;
  WEBHOOK_REGISTRO_URL: string;
  WEBHOOK_VERIFY_EMAIL_URL: string;
  
  // --- Perfil del Maestro ---
  WEBHOOK_SAVE_PROFILE_URL: string;
  WEBHOOK_GET_TEACHER_URL: string;
  WEBHOOK_UPDATE_TEACHER_URL: string;

  // --- Planificaciones y Dashboard ---
  WEBHOOK_GET_DASHBOARD_URL: string;
  WEBHOOK_GET_SUMMARY_URL: string;     // Para listar planificaciones
  WEBHOOK_GET_PLANNINGS_URL: string;   // Si usaste esta para búsquedas específicas
  
  // --- Acciones (Crear, Borrar, Editar) ---
  WEBHOOK_CREATE_PLANNING_URL: string;
  WEBHOOK_DELETE_PLANNING_URL: string; // Para borrar planificación diaria
  WEBHOOK_DELETE_UNIT_URL: string;     // Para borrar unidad
  
  // --- Chats con IA ---
  WEBHOOK_UPDATE_CHAT_URL: string;      // Chat de planificación diaria
  WEBHOOK_UPDATE_UNIT_CHAT_URL: string; // Chat de unidad
}
