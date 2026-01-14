
CREATE TABLE chat_conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  correo TEXT NOT NULL,
  unit_id TEXT NOT NULL,
  section_name TEXT NOT NULL,
  conversation_data TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_conversations_correo ON chat_conversations(correo);
CREATE INDEX idx_chat_conversations_unit_id ON chat_conversations(unit_id);
