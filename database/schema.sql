CREATE TABLE profiles (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(30) NOT NULL CHECK (role IN ('STUDENT', 'CLUB_COMMITTEE', 'FACULTY', 'ADMIN')),
    roll_number VARCHAR(60),
    department VARCHAR(80),
    semester SMALLINT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE clubs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) UNIQUE NOT NULL,
    category VARCHAR(80),
    description TEXT,
    faculty_coordinator_id INT REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE club_members (
    id SERIAL PRIMARY KEY,
    club_id INT NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    student_id INT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role VARCHAR(30) NOT NULL DEFAULT 'MEMBER' CHECK (role IN ('MEMBER', 'SECRETARY', 'TREASURER', 'PRESIDENT')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (club_id, student_id)
);

CREATE TABLE membership_applications (
    id SERIAL PRIMARY KEY,
    club_id INT NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    student_id INT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (club_id, student_id)
);

CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    club_id INT NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    title VARCHAR(160) NOT NULL,
    description TEXT,
    venue VARCHAR(120),
    event_date TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'COMPLETED')),
    capacity INT NOT NULL DEFAULT 50,
    created_by INT NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE event_registrations (
    id SERIAL PRIMARY KEY,
    event_id INT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    student_id INT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    registration_status VARCHAR(20) NOT NULL DEFAULT 'REGISTERED' CHECK (registration_status IN ('REGISTERED', 'ATTENDED', 'NO_SHOW')),
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (event_id, student_id)
);

CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    event_id INT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    student_id INT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    marked_by INT REFERENCES profiles(id),
    marked_at TIMESTAMPTZ DEFAULT NOW(),
    present BOOLEAN NOT NULL DEFAULT true,
    UNIQUE (event_id, student_id)
);

CREATE TABLE equipment (
    id SERIAL PRIMARY KEY,
    club_id INT NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    category VARCHAR(80),
    quantity INT NOT NULL DEFAULT 1,
    condition_status VARCHAR(20) NOT NULL DEFAULT 'GOOD' CHECK (condition_status IN ('GOOD', 'DAMAGED', 'UNDER_MAINTENANCE'))
);

CREATE TABLE equipment_borrow (
    id SERIAL PRIMARY KEY,
    equipment_id INT NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    student_id INT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    borrowed_from TIMESTAMPTZ NOT NULL,
    borrowed_to TIMESTAMPTZ,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'BORROWED', 'RETURNED', 'REJECTED')),
    reason TEXT
);

CREATE TABLE club_budgets (
    id SERIAL PRIMARY KEY,
    club_id INT NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    total_budget NUMERIC(12,2) NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE funding_requests (
    id SERIAL PRIMARY KEY,
    club_id INT NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    requested_by INT NOT NULL REFERENCES profiles(id),
    title VARCHAR(160) NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    purpose TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'PARTIALLY_APPROVED')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE budget_transactions (
    id SERIAL PRIMARY KEY,
    club_id INT NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    funding_request_id INT REFERENCES funding_requests(id),
    amount NUMERIC(12,2) NOT NULL,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('CREDIT', 'DEBIT')),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE announcements (
    id SERIAL PRIMARY KEY,
    club_id INT REFERENCES clubs(id) ON DELETE SET NULL,
    created_by INT NOT NULL REFERENCES profiles(id),
    title VARCHAR(160) NOT NULL,
    content TEXT NOT NULL,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    is_pinned BOOLEAN DEFAULT false
);

CREATE INDEX idx_membership_applications_status ON membership_applications(status);
CREATE INDEX idx_event_registrations_event ON event_registrations(event_id);
CREATE INDEX idx_events_club ON events(club_id);
CREATE INDEX idx_funding_requests_status ON funding_requests(status);
