
CREATE TABLE daily_planning (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  unit_planning_id INTEGER NOT NULL,
  fecha_date DATE NOT NULL,
  titulo TEXT NOT NULL,
  objetivos TEXT,
  actividades TEXT,
  recursos TEXT,
  evaluacion TEXT,
  notas TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_daily_planning_unit ON daily_planning(unit_planning_id);
CREATE INDEX idx_daily_planning_fecha ON daily_planning(fecha_date);
