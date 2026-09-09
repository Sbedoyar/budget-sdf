-- Budget SDF - normalización de categorías de producto.
-- Requiere MySQL 8 y debe ejecutarse sobre la base budget_sdf.
-- La rutina se detiene antes del primer ALTER si productos o movimientos tienen datos.

USE budget_sdf;

DROP PROCEDURE IF EXISTS normalizar_categorias;

DELIMITER //

CREATE PROCEDURE normalizar_categorias()
BEGIN
    DECLARE total_productos BIGINT DEFAULT 0;
    DECLARE total_movimientos BIGINT DEFAULT 0;
    DECLARE total_usuarios_antes BIGINT DEFAULT 0;
    DECLARE total_usuarios_despues BIGINT DEFAULT 0;

    SELECT COUNT(*) INTO total_productos FROM productos;
    SELECT COUNT(*) INTO total_movimientos FROM movimientos;
    SELECT COUNT(*) INTO total_usuarios_antes FROM usuarios;

    IF total_productos <> 0 OR total_movimientos <> 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Migración cancelada: productos y movimientos deben estar vacíos';
    END IF;

    CREATE TABLE IF NOT EXISTS categorias (
        id BIGINT NOT NULL AUTO_INCREMENT,
        nombre VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL,
        PRIMARY KEY (id),
        CONSTRAINT uq_categorias_nombre UNIQUE (nombre)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'productos'
          AND COLUMN_NAME = 'categoria_id'
    ) THEN
        ALTER TABLE productos
            ADD COLUMN categoria_id BIGINT NULL AFTER nombre;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'productos'
          AND COLUMN_NAME = 'categoria_id'
          AND REFERENCED_TABLE_NAME = 'categorias'
          AND REFERENCED_COLUMN_NAME = 'id'
    ) THEN
        ALTER TABLE productos
            ADD CONSTRAINT fk_productos_categoria
            FOREIGN KEY (categoria_id) REFERENCES categorias (id);
    END IF;

    IF EXISTS (
        SELECT 1
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'productos'
          AND COLUMN_NAME = 'categoria'
    ) THEN
        ALTER TABLE productos DROP COLUMN categoria;
    END IF;

    ALTER TABLE productos
        MODIFY COLUMN categoria_id BIGINT NOT NULL;

    SELECT COUNT(*) INTO total_usuarios_despues FROM usuarios;
    IF total_usuarios_antes <> total_usuarios_despues THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Validación fallida: cambió la cantidad de usuarios';
    END IF;
END//

DELIMITER ;

CALL normalizar_categorias();
DROP PROCEDURE normalizar_categorias;

-- Verificaciones visibles al finalizar.
SHOW TABLES;
DESCRIBE categorias;
DESCRIBE productos;
SELECT CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'productos'
  AND REFERENCED_TABLE_NAME IS NOT NULL;
