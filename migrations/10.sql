
CREATE TABLE unit_planning (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  teacher_registration_id INTEGER NOT NULL,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  fecha_inicio_date DATE,
  fecha_fin_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_unit_planning_teacher ON unit_planning(teacher_registration_id);
