
CREATE TABLE teacher_registrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  centro_educativo TEXT,
  nombre TEXT,
  apellido TEXT,
  recursos_didacticos TEXT,
  codigo_telegram TEXT,
  grado TEXT,
  asignatura TEXT,
  unidad_tema TEXT,
  hora_planificacion TEXT,
  fecha_inicio_date DATE,
  fecha_fin_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_teacher_registrations_nombre ON teacher_registrations(nombre);
CREATE INDEX idx_teacher_registrations_apellido ON teacher_registrations(apellido);
