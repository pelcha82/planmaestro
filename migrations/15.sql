
CREATE TABLE webhook_backups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  correo TEXT NOT NULL,
  payload_data TEXT NOT NULL,
  backup_type TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_webhook_backups_correo ON webhook_backups(correo);
CREATE INDEX idx_webhook_backups_created_at ON webhook_backups(created_at);
