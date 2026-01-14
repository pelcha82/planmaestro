
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

CREATE TABLE planning_summaries (
id INTEGER PRIMARY KEY AUTOINCREMENT,
teacher_registration_id INTEGER NOT NULL,
centro_educativo TEXT,
docente TEXT,
grado TEXT,
tiempo_asignado TEXT,
asignatura TEXT,
unidad TEXT,
contenidos_procedimentales TEXT,
competencias_fundamentales TEXT,
competencias_especificas_grado TEXT,
ejes_transversal TEXT,
valores_actitudes TEXT,
indicadores_logro TEXT,
areas_articuladas TEXT,
estrategia_ensenanza_aprendizaje TEXT,
actividades_ensenanza TEXT,
actividades_aprendizaje TEXT,
actividades_evaluacion TEXT,
recursos_didacticos TEXT,
fecha_inicio_date DATE,
fecha_fin_date DATE,
actividades TEXT,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE daily_planning_components (
id INTEGER PRIMARY KEY AUTOINCREMENT,
daily_planning_id INTEGER NOT NULL,
component_type TEXT NOT NULL,
component_data TEXT,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
