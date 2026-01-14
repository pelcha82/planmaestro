
CREATE TABLE home_webhooks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  correo TEXT NOT NULL,
  payload_data TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_home_webhooks_correo ON home_webhooks(correo);
