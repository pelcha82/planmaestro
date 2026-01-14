
CREATE TABLE email_verification_webhooks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  correo TEXT NOT NULL,
  payload_data TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email_verification_webhooks_correo ON email_verification_webhooks(correo);
