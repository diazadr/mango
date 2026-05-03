-- ============================================================
-- MANGO DATABASE — PostgreSQL DDL
-- Compatible with pgAdmin 4 / PostgreSQL 14+
-- Generated from MANGO ERD
-- ============================================================

-- Drop & recreate schema (optional, comment out if not needed)
-- DROP SCHEMA IF EXISTS public CASCADE;
-- CREATE SCHEMA public;

-- Enable UUID extension (optional)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- DOMAIN: Core / IAM
-- ============================================================

CREATE TABLE users (
    id                  BIGSERIAL PRIMARY KEY,
    name                VARCHAR(255) NOT NULL,
    email               VARCHAR(255) NOT NULL UNIQUE,
    phone               VARCHAR(50),
    avatar              VARCHAR(500),
    password            VARCHAR(255) NOT NULL,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    email_verified_at   TIMESTAMP,
    remember_token      VARCHAR(255),
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMP
);

CREATE TABLE campuses (
    id            BIGSERIAL PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    slug          VARCHAR(255) NOT NULL UNIQUE,
    email         VARCHAR(255),
    phone         VARCHAR(50),
    address       VARCHAR(500),
    city          VARCHAR(100),
    province      VARCHAR(100),
    postal_code   VARCHAR(20),
    logo          VARCHAR(500),
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at    TIMESTAMP
);

CREATE TABLE campus_departments (
    id              BIGSERIAL PRIMARY KEY,
    campus_id       BIGINT NOT NULL REFERENCES campuses(id),
    name            VARCHAR(255) NOT NULL,
    slug            VARCHAR(255) NOT NULL,
    description     TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMP
);

CREATE TABLE campus_user (
    id              BIGSERIAL PRIMARY KEY,
    campus_id       BIGINT NOT NULL REFERENCES campuses(id),
    user_id         BIGINT NOT NULL REFERENCES users(id),
    department_id   BIGINT REFERENCES campus_departments(id),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    joined_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE upts (
    id            BIGSERIAL PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    slug          VARCHAR(255) NOT NULL UNIQUE,
    email         VARCHAR(255),
    phone         VARCHAR(50),
    address       VARCHAR(500),
    city          VARCHAR(100),
    province      VARCHAR(100),
    postal_code   VARCHAR(20),
    logo          VARCHAR(500),
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at    TIMESTAMP
);

CREATE TABLE upt_user (
    id              BIGSERIAL PRIMARY KEY,
    upt_id          BIGINT NOT NULL REFERENCES upts(id),
    user_id         BIGINT NOT NULL REFERENCES users(id),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    joined_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- DOMAIN: UMKM
-- ============================================================

CREATE TABLE umkm_organizations (
    id            BIGSERIAL PRIMARY KEY,
    upt_id        BIGINT NOT NULL REFERENCES upts(id),
    name          VARCHAR(255) NOT NULL,
    slug          VARCHAR(255) NOT NULL UNIQUE,
    email         VARCHAR(255),
    phone         VARCHAR(50),
    address       VARCHAR(500),
    city          VARCHAR(100),
    province      VARCHAR(100),
    postal_code   VARCHAR(20),
    logo          VARCHAR(500),
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at    TIMESTAMP
);

CREATE TABLE umkm (
    id                BIGSERIAL PRIMARY KEY,
    umkm_organization_id BIGINT NOT NULL REFERENCES umkm_organizations(id),
    user_id            BIGINT NOT NULL UNIQUE REFERENCES users(id),
    name              VARCHAR(255) NOT NULL,
    owner_name        VARCHAR(255) NOT NULL,
    nib               VARCHAR(100),
    sector            VARCHAR(255) NOT NULL,
    established_year  SMALLINT,
    employee_count    INTEGER,
    is_active         BOOLEAN NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at        TIMESTAMP
);

CREATE TABLE business_profiles (
    id              BIGSERIAL PRIMARY KEY,
    umkm_id         BIGINT NOT NULL REFERENCES umkm(id),
    vision          TEXT,
    mission         TEXT,
    main_product    VARCHAR(255),
    annual_revenue  NUMERIC(15,2),
    market_target   VARCHAR(255),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE production_capacities (
    id                BIGSERIAL PRIMARY KEY,
    umkm_id           BIGINT NOT NULL REFERENCES umkm(id),
    product_name      VARCHAR(255) NOT NULL,
    capacity_per_day  NUMERIC(12,2) NOT NULL,
    unit              VARCHAR(50) NOT NULL,
    notes             TEXT,
    created_at        TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE machine_manuals (
    id            BIGSERIAL PRIMARY KEY,
    umkm_id       BIGINT NOT NULL REFERENCES umkm(id),
    machine_name  VARCHAR(255) NOT NULL,
    brand         VARCHAR(255),
    quantity      INTEGER NOT NULL DEFAULT 1,
    condition     VARCHAR(10) NOT NULL CHECK (condition IN ('good', 'fair', 'poor')),
    notes         TEXT,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- DOMAIN: Assessment
-- ============================================================

CREATE TABLE assessment_categories (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    slug        VARCHAR(255) NOT NULL,
    description TEXT,
    weight      NUMERIC(5,2) NOT NULL DEFAULT 1.00,
    "order"     INTEGER NOT NULL DEFAULT 0,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE questions (
    id                      BIGSERIAL PRIMARY KEY,
    assessment_category_id  BIGINT NOT NULL REFERENCES assessment_categories(id),
    text                    TEXT NOT NULL,
    type                    VARCHAR(20) NOT NULL CHECK (type IN ('scale', 'choice', 'text')),
    weight                  NUMERIC(5,2) NOT NULL DEFAULT 1.00,
    "order"                 INTEGER NOT NULL DEFAULT 0,
    is_active               BOOLEAN NOT NULL DEFAULT TRUE,
    created_at              TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE assessment_results (
    id           BIGSERIAL PRIMARY KEY,
    umkm_id      BIGINT NOT NULL REFERENCES umkm(id),
    user_id      BIGINT NOT NULL REFERENCES users(id),
    total_score  NUMERIC(8,2) NOT NULL DEFAULT 0,
    level        VARCHAR(20) NOT NULL CHECK (level IN ('basic', 'developing', 'advanced')),
    status       VARCHAR(20) NOT NULL CHECK (status IN ('draft', 'submitted', 'reviewed')) DEFAULT 'draft',
    submitted_at TIMESTAMP,
    reviewed_at  TIMESTAMP,
    reviewer_id  BIGINT REFERENCES users(id),
    created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE answers (
    id                    BIGSERIAL PRIMARY KEY,
    assessment_result_id  BIGINT NOT NULL REFERENCES assessment_results(id),
    question_id           BIGINT NOT NULL REFERENCES questions(id),
    value                 TEXT NOT NULL,
    score                 NUMERIC(8,2) NOT NULL DEFAULT 0,
    created_at            TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE recommendations (
    id                      BIGSERIAL PRIMARY KEY,
    assessment_result_id    BIGINT NOT NULL REFERENCES assessment_results(id),
    assessment_category_id  BIGINT NOT NULL REFERENCES assessment_categories(id),
    gap_score               NUMERIC(8,2) NOT NULL DEFAULT 0,
    priority                VARCHAR(10) NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
    recommendation_text     TEXT NOT NULL,
    created_at              TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- DOMAIN: Project
-- ============================================================

CREATE TABLE projects (
    id                    BIGSERIAL PRIMARY KEY,
    umkm_id               BIGINT NOT NULL REFERENCES umkm(id),
    assessment_result_id  BIGINT REFERENCES assessment_results(id),
    name                  VARCHAR(255) NOT NULL,
    type                  VARCHAR(20) NOT NULL CHECK (type IN ('advisory', 'pbl')),
    status                VARCHAR(20) NOT NULL CHECK (status IN ('draft', 'active', 'completed', 'cancelled')) DEFAULT 'draft',
    started_at            DATE,
    ended_at              DATE,
    created_at            TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at            TIMESTAMP
);

CREATE TABLE iterations (
    id          BIGSERIAL PRIMARY KEY,
    project_id  BIGINT NOT NULL REFERENCES projects(id),
    name        VARCHAR(255) NOT NULL,
    "order"     INTEGER NOT NULL DEFAULT 0,
    status      VARCHAR(20) NOT NULL CHECK (status IN ('planned', 'ongoing', 'done')) DEFAULT 'planned',
    started_at  DATE,
    ended_at    DATE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE action_plans (
    id            BIGSERIAL PRIMARY KEY,
    iteration_id  BIGINT NOT NULL REFERENCES iterations(id),
    title         VARCHAR(255) NOT NULL,
    description   TEXT,
    pic_user_id   BIGINT REFERENCES users(id),
    due_date      DATE,
    status        VARCHAR(20) NOT NULL CHECK (status IN ('todo', 'in_progress', 'done')) DEFAULT 'todo',
    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE deliverables (
    id            BIGSERIAL PRIMARY KEY,
    iteration_id  BIGINT NOT NULL REFERENCES iterations(id),
    title         VARCHAR(255) NOT NULL,
    file_path     VARCHAR(500),
    url           VARCHAR(500),
    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE project_notes (
    id          BIGSERIAL PRIMARY KEY,
    project_id  BIGINT NOT NULL REFERENCES projects(id),
    user_id     BIGINT NOT NULL REFERENCES users(id),
    content     TEXT NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- DOMAIN: ERP
-- (defined before MES because work_orders references products)
-- ============================================================

CREATE TABLE products (
    id          BIGSERIAL PRIMARY KEY,
    umkm_id     BIGINT NOT NULL REFERENCES umkm(id),
    name        VARCHAR(255) NOT NULL,
    sku         VARCHAR(100) NOT NULL,
    unit        VARCHAR(50) NOT NULL,
    price       NUMERIC(15,2) NOT NULL DEFAULT 0,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMP
);

CREATE TABLE materials (
    id              BIGSERIAL PRIMARY KEY,
    umkm_id         BIGINT NOT NULL REFERENCES umkm(id),
    name            VARCHAR(255) NOT NULL,
    sku             VARCHAR(100) NOT NULL,
    unit            VARCHAR(50) NOT NULL,
    cost_per_unit   NUMERIC(15,2) NOT NULL DEFAULT 0,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE inventories (
    id           BIGSERIAL PRIMARY KEY,
    umkm_id      BIGINT NOT NULL REFERENCES umkm(id),
    item_type    VARCHAR(20) NOT NULL CHECK (item_type IN ('product', 'material')),
    item_id      BIGINT NOT NULL,
    qty_on_hand  NUMERIC(12,2) NOT NULL DEFAULT 0,
    qty_reserved NUMERIC(12,2) NOT NULL DEFAULT 0,
    updated_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE bill_of_materials (
    id            BIGSERIAL PRIMARY KEY,
    product_id    BIGINT NOT NULL REFERENCES products(id),
    material_id   BIGINT NOT NULL REFERENCES materials(id),
    qty_required  NUMERIC(12,2) NOT NULL,
    unit          VARCHAR(50) NOT NULL,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE sales_orders (
    id              BIGSERIAL PRIMARY KEY,
    umkm_id         BIGINT NOT NULL REFERENCES umkm(id),
    code            VARCHAR(100) NOT NULL UNIQUE,
    customer_name   VARCHAR(255) NOT NULL,
    status          VARCHAR(20) NOT NULL CHECK (status IN ('draft', 'confirmed', 'shipped', 'done', 'cancelled')) DEFAULT 'draft',
    total_amount    NUMERIC(15,2) NOT NULL DEFAULT 0,
    ordered_at      DATE NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE sales_order_items (
    id              BIGSERIAL PRIMARY KEY,
    sales_order_id  BIGINT NOT NULL REFERENCES sales_orders(id),
    product_id      BIGINT NOT NULL REFERENCES products(id),
    qty             INTEGER NOT NULL DEFAULT 1,
    unit_price      NUMERIC(15,2) NOT NULL,
    subtotal        NUMERIC(15,2) NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE purchase_orders (
    id              BIGSERIAL PRIMARY KEY,
    umkm_id         BIGINT NOT NULL REFERENCES umkm(id),
    code            VARCHAR(100) NOT NULL UNIQUE,
    supplier_name   VARCHAR(255) NOT NULL,
    status          VARCHAR(20) NOT NULL CHECK (status IN ('draft', 'ordered', 'received', 'cancelled')) DEFAULT 'draft',
    total_amount    NUMERIC(15,2) NOT NULL DEFAULT 0,
    ordered_at      DATE NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE purchase_order_items (
    id                  BIGSERIAL PRIMARY KEY,
    purchase_order_id   BIGINT NOT NULL REFERENCES purchase_orders(id),
    material_id         BIGINT NOT NULL REFERENCES materials(id),
    qty                 INTEGER NOT NULL DEFAULT 1,
    unit_cost           NUMERIC(15,2) NOT NULL,
    subtotal            NUMERIC(15,2) NOT NULL,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- DOMAIN: Machine & IoT
-- ============================================================

CREATE TABLE machines (
    id          BIGSERIAL PRIMARY KEY,
    umkm_id     BIGINT NOT NULL REFERENCES umkm(id),
    name        VARCHAR(255) NOT NULL,
    code        VARCHAR(100) NOT NULL UNIQUE,
    brand       VARCHAR(255),
    model       VARCHAR(255),
    status      VARCHAR(20) NOT NULL CHECK (status IN ('active', 'inactive', 'maintenance')) DEFAULT 'active',
    is_shared   BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMP
);

CREATE TABLE machine_tokens (
    id            BIGSERIAL PRIMARY KEY,
    machine_id    BIGINT NOT NULL REFERENCES machines(id),
    token         VARCHAR(512) NOT NULL UNIQUE,
    last_used_at  TIMESTAMP,
    expires_at    TIMESTAMP,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE machine_parameters (
    id          BIGSERIAL PRIMARY KEY,
    machine_id  BIGINT NOT NULL REFERENCES machines(id),
    key         VARCHAR(100) NOT NULL,
    value       VARCHAR(500) NOT NULL,
    unit        VARCHAR(50),
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE production_events (
    id           BIGSERIAL PRIMARY KEY,
    machine_id   BIGINT NOT NULL REFERENCES machines(id),
    event_type   VARCHAR(100) NOT NULL,
    payload      JSONB NOT NULL DEFAULT '{}',
    recorded_at  TIMESTAMP NOT NULL,
    created_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE machine_status_events (
    id           BIGSERIAL PRIMARY KEY,
    machine_id   BIGINT NOT NULL REFERENCES machines(id),
    status       VARCHAR(20) NOT NULL CHECK (status IN ('running', 'idle', 'down')),
    recorded_at  TIMESTAMP NOT NULL,
    created_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- DOMAIN: MES
-- ============================================================

CREATE TABLE shifts (
    id          BIGSERIAL PRIMARY KEY,
    umkm_id     BIGINT NOT NULL REFERENCES umkm(id),
    name        VARCHAR(100) NOT NULL,
    start_time  TIME NOT NULL,
    end_time    TIME NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE operators (
    id          BIGSERIAL PRIMARY KEY,
    umkm_id     BIGINT NOT NULL REFERENCES umkm(id),
    user_id     BIGINT REFERENCES users(id),
    name        VARCHAR(255) NOT NULL,
    code        VARCHAR(100) NOT NULL,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE work_orders (
    id              BIGSERIAL PRIMARY KEY,
    umkm_id         BIGINT NOT NULL REFERENCES umkm(id),
    product_id      BIGINT NOT NULL REFERENCES products(id),
    code            VARCHAR(100) NOT NULL UNIQUE,
    target_qty      INTEGER NOT NULL,
    status          VARCHAR(20) NOT NULL CHECK (status IN ('draft', 'released', 'in_progress', 'done', 'cancelled')) DEFAULT 'draft',
    planned_start   DATE NOT NULL,
    planned_end     DATE NOT NULL,
    actual_start    TIMESTAMP,
    actual_end      TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMP
);

CREATE TABLE job_orders (
    id            BIGSERIAL PRIMARY KEY,
    work_order_id BIGINT NOT NULL REFERENCES work_orders(id),
    machine_id    BIGINT NOT NULL REFERENCES machines(id),
    operator_id   BIGINT NOT NULL REFERENCES operators(id),
    shift_id      BIGINT NOT NULL REFERENCES shifts(id),
    target_qty    INTEGER NOT NULL,
    status        VARCHAR(20) NOT NULL CHECK (status IN ('queued', 'running', 'done')) DEFAULT 'queued',
    started_at    TIMESTAMP,
    ended_at      TIMESTAMP,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE production_logs (
    id            BIGSERIAL PRIMARY KEY,
    job_order_id  BIGINT NOT NULL REFERENCES job_orders(id),
    operator_id   BIGINT NOT NULL REFERENCES operators(id),
    good_qty      INTEGER NOT NULL DEFAULT 0,
    reject_qty    INTEGER NOT NULL DEFAULT 0,
    logged_at     TIMESTAMP NOT NULL,
    notes         TEXT,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE downtime_logs (
    id                BIGSERIAL PRIMARY KEY,
    job_order_id      BIGINT NOT NULL REFERENCES job_orders(id),
    machine_id        BIGINT NOT NULL REFERENCES machines(id),
    reason            VARCHAR(500) NOT NULL,
    category          VARCHAR(20) NOT NULL CHECK (category IN ('planned', 'unplanned', 'breakdown')),
    started_at        TIMESTAMP NOT NULL,
    ended_at          TIMESTAMP,
    duration_minutes  INTEGER,
    created_at        TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- DOMAIN: Analytics
-- ============================================================

CREATE TABLE production_daily_summaries (
    id                 BIGSERIAL PRIMARY KEY,
    umkm_id            BIGINT NOT NULL REFERENCES umkm(id),
    machine_id         BIGINT NOT NULL REFERENCES machines(id),
    date               DATE NOT NULL,
    good_qty           INTEGER NOT NULL DEFAULT 0,
    reject_qty         INTEGER NOT NULL DEFAULT 0,
    runtime_minutes    INTEGER NOT NULL DEFAULT 0,
    downtime_minutes   INTEGER NOT NULL DEFAULT 0,
    oee_percent        NUMERIC(5,2) NOT NULL DEFAULT 0,
    created_at         TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE production_monthly_summaries (
    id                  BIGSERIAL PRIMARY KEY,
    umkm_id             BIGINT NOT NULL REFERENCES umkm(id),
    year                SMALLINT NOT NULL,
    month               SMALLINT NOT NULL CHECK (month BETWEEN 1 AND 12),
    total_good_qty      INTEGER NOT NULL DEFAULT 0,
    total_reject_qty    INTEGER NOT NULL DEFAULT 0,
    avg_oee_percent     NUMERIC(5,2) NOT NULL DEFAULT 0,
    growth_percent      NUMERIC(8,2),
    created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE oee_summaries (
    id            BIGSERIAL PRIMARY KEY,
    machine_id    BIGINT NOT NULL REFERENCES machines(id),
    date          DATE NOT NULL,
    availability  NUMERIC(5,2) NOT NULL DEFAULT 0,
    performance   NUMERIC(5,2) NOT NULL DEFAULT 0,
    quality       NUMERIC(5,2) NOT NULL DEFAULT 0,
    oee           NUMERIC(5,2) NOT NULL DEFAULT 0,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- DOMAIN: Reservation
-- ============================================================

CREATE TABLE machine_reservations (
    id                  BIGSERIAL PRIMARY KEY,
    requester_umkm_id   BIGINT NOT NULL REFERENCES umkm(id),
    machine_id          BIGINT NOT NULL REFERENCES machines(id),
    requested_by        BIGINT NOT NULL REFERENCES users(id),
    status              VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')) DEFAULT 'pending',
    notes               TEXT,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE reservation_schedules (
    id                       BIGSERIAL PRIMARY KEY,
    machine_reservation_id   BIGINT NOT NULL REFERENCES machine_reservations(id),
    date                     DATE NOT NULL,
    start_time               TIME NOT NULL,
    end_time                 TIME NOT NULL,
    created_at               TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE reservation_approvals (
    id                       BIGSERIAL PRIMARY KEY,
    machine_reservation_id   BIGINT NOT NULL REFERENCES machine_reservations(id),
    approved_by              BIGINT NOT NULL REFERENCES users(id),
    action                   VARCHAR(20) NOT NULL CHECK (action IN ('approved', 'rejected')),
    reason                   TEXT,
    acted_at                 TIMESTAMP NOT NULL,
    created_at               TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- DOMAIN: Mentoring
-- ============================================================

CREATE TABLE consultation_requests (
    id              BIGSERIAL PRIMARY KEY,
    umkm_id         BIGINT NOT NULL REFERENCES umkm(id),
    requested_by    BIGINT NOT NULL REFERENCES users(id),
    topic           VARCHAR(255) NOT NULL,
    description     TEXT NOT NULL,
    status          VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'assigned', 'ongoing', 'done', 'cancelled')) DEFAULT 'pending',
    department_id   BIGINT REFERENCES departments(id),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE mentor_assignments (
    id                          BIGSERIAL PRIMARY KEY,
    consultation_request_id     BIGINT NOT NULL REFERENCES consultation_requests(id),
    mentor_user_id              BIGINT NOT NULL REFERENCES users(id),
    assigned_by                 BIGINT NOT NULL REFERENCES users(id),
    assigned_at                 TIMESTAMP NOT NULL,
    created_at                  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE consultation_sessions (
    id                          BIGSERIAL PRIMARY KEY,
    consultation_request_id     BIGINT NOT NULL REFERENCES consultation_requests(id),
    scheduled_at                TIMESTAMP NOT NULL,
    duration_minutes            INTEGER,
    medium                      VARCHAR(20) NOT NULL CHECK (medium IN ('online', 'offline')),
    status                      VARCHAR(20) NOT NULL CHECK (status IN ('scheduled', 'done', 'cancelled')) DEFAULT 'scheduled',
    created_at                  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE consultation_notes (
    id                          BIGSERIAL PRIMARY KEY,
    consultation_session_id     BIGINT NOT NULL REFERENCES consultation_sessions(id),
    author_id                   BIGINT NOT NULL REFERENCES users(id),
    content                     TEXT NOT NULL,
    created_at                  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES — Performance optimization
-- ============================================================

-- users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NULL;

-- campuses
CREATE INDEX idx_campuses_slug ON campuses(slug);

-- campus_departments
CREATE INDEX idx_campus_departments_campus_id ON campus_departments(campus_id);

-- campus_user
CREATE INDEX idx_campus_user_campus_id ON campus_user(campus_id);
CREATE INDEX idx_campus_user_user_id ON campus_user(user_id);

-- upts
CREATE INDEX idx_upts_slug ON upts(slug);

-- upt_user
CREATE INDEX idx_upt_user_upt_id ON upt_user(upt_id);
CREATE INDEX idx_upt_user_user_id ON upt_user(user_id);

-- umkm_organizations
CREATE INDEX idx_umkm_organizations_slug ON umkm_organizations(slug);
CREATE INDEX idx_umkm_organizations_upt_id ON umkm_organizations(upt_id);

-- umkm
CREATE INDEX idx_umkm_organization_id ON umkm(umkm_organization_id);
CREATE INDEX idx_umkm_sector ON umkm(sector);

-- assessment_results
CREATE INDEX idx_assessment_results_umkm_id ON assessment_results(umkm_id);
CREATE INDEX idx_assessment_results_user_id ON assessment_results(user_id);
CREATE INDEX idx_assessment_results_status ON assessment_results(status);

-- answers
CREATE INDEX idx_answers_assessment_result_id ON answers(assessment_result_id);
CREATE INDEX idx_answers_question_id ON answers(question_id);

-- projects
CREATE INDEX idx_projects_umkm_id ON projects(umkm_id);
CREATE INDEX idx_projects_status ON projects(status);

-- machines
CREATE INDEX idx_machines_umkm_id ON machines(umkm_id);
CREATE INDEX idx_machines_code ON machines(code);
CREATE INDEX idx_machines_status ON machines(status);

-- production_events
CREATE INDEX idx_production_events_machine_id ON production_events(machine_id);
CREATE INDEX idx_production_events_recorded_at ON production_events(recorded_at);

-- machine_status_events
CREATE INDEX idx_machine_status_events_machine_id ON machine_status_events(machine_id);
CREATE INDEX idx_machine_status_events_recorded_at ON machine_status_events(recorded_at);

-- work_orders
CREATE INDEX idx_work_orders_umkm_id ON work_orders(umkm_id);
CREATE INDEX idx_work_orders_product_id ON work_orders(product_id);
CREATE INDEX idx_work_orders_status ON work_orders(status);

-- job_orders
CREATE INDEX idx_job_orders_work_order_id ON job_orders(work_order_id);
CREATE INDEX idx_job_orders_machine_id ON job_orders(machine_id);

-- production_logs
CREATE INDEX idx_production_logs_job_order_id ON production_logs(job_order_id);
CREATE INDEX idx_production_logs_logged_at ON production_logs(logged_at);

-- downtime_logs
CREATE INDEX idx_downtime_logs_machine_id ON downtime_logs(machine_id);
CREATE INDEX idx_downtime_logs_started_at ON downtime_logs(started_at);

-- analytics
CREATE INDEX idx_prod_daily_umkm_date ON production_daily_summaries(umkm_id, date);
CREATE INDEX idx_prod_daily_machine_date ON production_daily_summaries(machine_id, date);
CREATE INDEX idx_oee_summaries_machine_date ON oee_summaries(machine_id, date);

-- reservations
CREATE INDEX idx_machine_reservations_machine_id ON machine_reservations(machine_id);
CREATE INDEX idx_machine_reservations_status ON machine_reservations(status);

-- ============================================================
-- COMMENTS — Table documentation
-- ============================================================

COMMENT ON TABLE users IS 'Pengguna sistem MANGO (admin, mentor, operator, dll)';
COMMENT ON TABLE campuses IS 'Data kampus';
COMMENT ON TABLE campus_departments IS 'Divisi/departemen di dalam kampus';
COMMENT ON TABLE campus_user IS 'Relasi many-to-many antara user dan kampus';
COMMENT ON TABLE upts IS 'Data UPT pengelola binaan UMKM';
COMMENT ON TABLE upt_user IS 'Relasi many-to-many antara user dan UPT';
COMMENT ON TABLE umkm_organizations IS 'Organisasi UMKM binaan yang dikelola oleh UPT';
COMMENT ON TABLE umkm IS 'Data UMKM yang terdaftar pada organisasi UMKM di bawah UPT';
COMMENT ON TABLE business_profiles IS 'Profil bisnis lengkap UMKM';
COMMENT ON TABLE production_capacities IS 'Kapasitas produksi UMKM per produk';
COMMENT ON TABLE machine_manuals IS 'Daftar mesin manual (sebelum IoT) milik UMKM';
COMMENT ON TABLE assessment_categories IS 'Kategori penilaian UMKM (mis. keuangan, pemasaran, dll)';
COMMENT ON TABLE questions IS 'Daftar pertanyaan untuk asesmen';
COMMENT ON TABLE assessment_results IS 'Hasil asesmen UMKM';
COMMENT ON TABLE answers IS 'Jawaban per pertanyaan dalam satu sesi asesmen';
COMMENT ON TABLE recommendations IS 'Rekomendasi otomatis berdasarkan gap score asesmen';
COMMENT ON TABLE projects IS 'Proyek pendampingan UMKM (advisory / PBL)';
COMMENT ON TABLE iterations IS 'Sprint/iterasi di dalam proyek';
COMMENT ON TABLE action_plans IS 'Rencana aksi per iterasi';
COMMENT ON TABLE deliverables IS 'Output/deliverable per iterasi';
COMMENT ON TABLE project_notes IS 'Catatan selama proyek berlangsung';
COMMENT ON TABLE products IS 'Produk jadi UMKM';
COMMENT ON TABLE materials IS 'Bahan baku UMKM';
COMMENT ON TABLE inventories IS 'Stok produk atau bahan baku (polymorphic)';
COMMENT ON TABLE bill_of_materials IS 'Bill of Materials: kebutuhan bahan per produk';
COMMENT ON TABLE sales_orders IS 'Pesanan penjualan';
COMMENT ON TABLE sales_order_items IS 'Detail item pesanan penjualan';
COMMENT ON TABLE purchase_orders IS 'Pesanan pembelian bahan baku';
COMMENT ON TABLE purchase_order_items IS 'Detail item pesanan pembelian';
COMMENT ON TABLE machines IS 'Mesin produksi yang terdaftar dan terhubung IoT';
COMMENT ON TABLE machine_tokens IS 'Token autentikasi IoT per mesin';
COMMENT ON TABLE machine_parameters IS 'Parameter konfigurasi mesin';
COMMENT ON TABLE production_events IS 'Event real-time dari perangkat IoT mesin';
COMMENT ON TABLE machine_status_events IS 'Riwayat status mesin (running/idle/down)';
COMMENT ON TABLE shifts IS 'Definisi shift kerja UMKM';
COMMENT ON TABLE operators IS 'Operator mesin produksi';
COMMENT ON TABLE work_orders IS 'Perintah produksi (Work Order)';
COMMENT ON TABLE job_orders IS 'Job order: penugasan mesin+operator untuk WO';
COMMENT ON TABLE production_logs IS 'Log produksi harian per job order';
COMMENT ON TABLE downtime_logs IS 'Log downtime mesin';
COMMENT ON TABLE production_daily_summaries IS 'Ringkasan produksi harian (agregat)';
COMMENT ON TABLE production_monthly_summaries IS 'Ringkasan produksi bulanan (agregat)';
COMMENT ON TABLE oee_summaries IS 'OEE harian per mesin (Availability × Performance × Quality)';
COMMENT ON TABLE machine_reservations IS 'Permintaan peminjaman mesin antar UMKM';
COMMENT ON TABLE reservation_schedules IS 'Jadwal peminjaman mesin';
COMMENT ON TABLE reservation_approvals IS 'Riwayat persetujuan/penolakan reservasi';
COMMENT ON TABLE consultation_requests IS 'Permintaan konsultasi/mentoring dari UMKM';
COMMENT ON TABLE mentor_assignments IS 'Penugasan mentor ke permintaan konsultasi';
COMMENT ON TABLE consultation_sessions IS 'Sesi konsultasi (jadwal & status)';
COMMENT ON TABLE consultation_notes IS 'Catatan sesi konsultasi';

-- ============================================================
-- End of MANGO DDL
-- Total: 42 tables | 8 domains
-- ============================================================
