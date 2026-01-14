
CREATE TABLE daily_planning_components (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  daily_planning_id INTEGER NOT NULL,
  component_type TEXT NOT NULL,
  component_data TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_daily_planning_components_daily ON daily_planning_components(daily_planning_id);
