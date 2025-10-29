-- =============================================
-- SISTEMA DE PLANEACIÓN DIDÁCTICA
-- Base de datos: sistema_planeacion
-- =============================================

-- Conectarse a la base de datos sistema_planeacion y ejecutar lo siguiente:

-- =============================================
-- EXTENSIÓN PARA UUID
-- =============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLA: users (Usuarios del sistema)
-- =============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'coordinator', 'professor')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLA: courses (Materias/Cursos)
-- =============================================
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    credits INTEGER DEFAULT 0,
    coordinator_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLA: didactic_plannings (Planeaciones Didácticas)
-- =============================================
CREATE TABLE didactic_plannings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professor_id UUID NOT NULL REFERENCES users(id),
    course_id UUID NOT NULL REFERENCES courses(id),
    partial INTEGER NOT NULL CHECK (partial BETWEEN 1 AND 3),
    cycle VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    objectives TEXT NOT NULL,
    methodology TEXT NOT NULL,
    evaluation TEXT NOT NULL,
    resources TEXT,
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'adjustments_required')),
    feedback TEXT,
    file_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLA: partial_progress (Avances Parciales)
-- =============================================
CREATE TABLE partial_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    planning_id UUID NOT NULL REFERENCES didactic_plannings(id) ON DELETE CASCADE,
    partial INTEGER NOT NULL CHECK (partial BETWEEN 1 AND 3),
    progress_percentage INTEGER NOT NULL CHECK (progress_percentage BETWEEN 0 AND 100),
    status VARCHAR(20) NOT NULL CHECK (status IN ('fulfilled', 'partial', 'unfulfilled')),
    achievements TEXT,
    challenges TEXT,
    adjustments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLA: evidences (Evidencias de Capacitación)
-- =============================================
CREATE TABLE evidences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professor_id UUID NOT NULL REFERENCES users(id),
    course_name VARCHAR(255) NOT NULL,
    institution VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    hours INTEGER NOT NULL CHECK (hours > 0),
    file_url VARCHAR(500) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- ÍNDICES para mejorar el rendimiento
-- =============================================

-- Índices para users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- Índices para courses
CREATE INDEX idx_courses_code ON courses(code);
CREATE INDEX idx_courses_coordinator ON courses(coordinator_id);

-- Índices para didactic_plannings
CREATE INDEX idx_plannings_professor ON didactic_plannings(professor_id);
CREATE INDEX idx_plannings_course ON didactic_plannings(course_id);
CREATE INDEX idx_plannings_partial ON didactic_plannings(partial);
CREATE INDEX idx_plannings_cycle ON didactic_plannings(cycle);
CREATE INDEX idx_plannings_status ON didactic_plannings(status);
CREATE INDEX idx_plannings_course_partial ON didactic_plannings(course_id, partial);
CREATE INDEX idx_plannings_professor_course ON didactic_plannings(professor_id, course_id);

-- Índices para partial_progress
CREATE INDEX idx_progress_planning ON partial_progress(planning_id);
CREATE INDEX idx_progress_partial ON partial_progress(partial);
CREATE INDEX idx_progress_status ON partial_progress(status);

-- Índices para evidences
CREATE INDEX idx_evidences_professor ON evidences(professor_id);
CREATE INDEX idx_evidences_status ON evidences(status);
CREATE INDEX idx_evidences_date ON evidences(date);

-- =============================================
-- VISTAS ÚTILES
-- =============================================

-- Vista para reportes de cumplimiento de planeaciones
CREATE OR REPLACE VIEW planning_compliance_view AS
SELECT 
    dp.cycle,
    dp.partial,
    COUNT(*) as total_plannings,
    COUNT(CASE WHEN dp.status = 'approved' THEN 1 END) as approved,
    COUNT(CASE WHEN dp.status = 'pending' THEN 1 END) as pending,
    COUNT(CASE WHEN dp.status = 'adjustments_required' THEN 1 END) as adjustments_required,
    ROUND((COUNT(CASE WHEN dp.status = 'approved' THEN 1 END) * 100.0 / COUNT(*)), 2) as compliance_rate
FROM didactic_plannings dp
GROUP BY dp.cycle, dp.partial
ORDER BY dp.cycle DESC, dp.partial ASC;

-- Vista para reportes de avances
CREATE OR REPLACE VIEW progress_summary_view AS
SELECT 
    dp.cycle,
    dp.partial,
    c.name as course_name,
    u.name as professor_name,
    pp.progress_percentage,
    pp.status as progress_status,
    dp.status as planning_status
FROM partial_progress pp
JOIN didactic_plannings dp ON pp.planning_id = dp.id
JOIN courses c ON dp.course_id = c.id
JOIN users u ON dp.professor_id = u.id;

-- Vista para reportes de capacitación
CREATE OR REPLACE VIEW training_summary_view AS
SELECT 
    u.name as professor_name,
    u.role,
    COUNT(*) as total_courses,
    SUM(e.hours) as total_hours,
    COUNT(CASE WHEN e.status = 'approved' THEN 1 END) as approved_courses,
    COUNT(CASE WHEN e.status = 'pending' THEN 1 END) as pending_courses,
    COUNT(CASE WHEN e.status = 'rejected' THEN 1 END) as rejected_courses
FROM evidences e
JOIN users u ON e.professor_id = u.id
GROUP BY u.id, u.name, u.role;

-- =============================================
-- FUNCIONES Y TRIGGERS
-- =============================================

-- Función para actualizar el campo updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plannings_updated_at BEFORE UPDATE ON didactic_plannings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evidences_updated_at BEFORE UPDATE ON evidences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- COMENTARIOS EN LAS TABLAS
-- =============================================

COMMENT ON TABLE users IS 'Tabla de usuarios del sistema con roles: admin, coordinator, professor';
COMMENT ON TABLE courses IS 'Tabla de materias o cursos académicos';
COMMENT ON TABLE didactic_plannings IS 'Planeaciones didácticas por parcial de cada profesor';
COMMENT ON TABLE partial_progress IS 'Registro de avances parciales de cada planeación';
COMMENT ON TABLE evidences IS 'Evidencias de cursos de capacitación tomados por profesores';

COMMENT ON COLUMN users.role IS 'Roles: admin (administrador), coordinator (coordinador), professor (profesor)';
COMMENT ON COLUMN didactic_plannings.status IS 'Estado: pending (pendiente), approved (aprobado), adjustments_required (requiere ajustes)';
COMMENT ON COLUMN partial_progress.status IS 'Estado: fulfilled (cumplido), partial (parcial), unfulfilled (no cumplido)';
COMMENT ON COLUMN evidences.status IS 'Estado: pending (pendiente), approved (aprobado), rejected (rechazado)';

-- =============================================
-- VERIFICACIÓN FINAL
-- =============================================

-- Verificar que las tablas se crearon correctamente
SELECT 
    '✅ Base de datos creada exitosamente' as status,
    COUNT(*) as tablas_creadas
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'courses', 'didactic_plannings', 'partial_progress', 'evidences');