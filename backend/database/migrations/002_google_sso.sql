-- Budget SDF - soporte para autenticación con Google.
-- Agrega la identidad de Google al usuario existente.

USE budget_sdf;

ALTER TABLE usuarios
    ADD COLUMN email VARCHAR(255) NULL,
    ADD COLUMN google_subject VARCHAR(255) NULL;

ALTER TABLE usuarios
    ADD CONSTRAINT uq_usuarios_email UNIQUE (email),
    ADD CONSTRAINT uq_usuarios_google_subject UNIQUE (google_subject);

DESCRIBE usuarios;