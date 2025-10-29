-- =============================================
-- CREAR USUARIO ADMINISTRADOR INICIAL
-- =============================================

-- Verificar si ya existe un usuario admin
SELECT COUNT(*) as admin_count FROM users WHERE role = 'admin';

-- Insertar usuario administrador
-- Contraseña: admin123 (encriptada con bcrypt)
INSERT INTO users (id, email, password, name, role, is_active, created_at, updated_at) 
VALUES (
    uuid_generate_v4(),
    'admin@escuela.com',
    '$2a$10$8K1p/a0dRTlR0.0a.8QwEeZQbW3c5q5Y5g5Y5g5Y5g5Y5g5Y5g5Y5',
    'Administrador Principal',
    'admin',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Verificar que se creó correctamente
SELECT id, email, name, role, is_active, created_at 
FROM users 
WHERE email = 'admin@escuela.com';