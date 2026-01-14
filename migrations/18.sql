
CREATE TABLE planning_summary_webhooks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  correo TEXT NOT NULL,
  payload_data TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_planning_summary_webhooks_correo ON planning_summary_webhooks(correo);
