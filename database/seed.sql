INSERT INTO profiles (full_name, email, password_hash, role, roll_number, department, semester)
VALUES
    ('Aarav Nair', 'aarav@campus.edu', 'demo_hash_1', 'STUDENT', 'AM.EN.U4CSE23001', 'CSE', 6),
    ('Meera Iyer', 'meera@campus.edu', 'demo_hash_2', 'STUDENT', 'AM.EN.U4ECE23014', 'ECE', 5),
    ('Rohan Verma', 'rohan@campus.edu', 'demo_hash_3', 'CLUB_COMMITTEE', 'AM.EN.U4CSE22009', 'CSE', 7),
    ('Dr. Priya Saran', 'priya.faculty@campus.edu', 'demo_hash_4', 'FACULTY', 'FAC-101', 'CSE', NULL),
    ('Aisha Khan', 'aisha.admin@campus.edu', 'demo_hash_5', 'ADMIN', 'ADMIN-01', 'Administration', NULL);

INSERT INTO clubs (name, category, description, faculty_coordinator_id)
VALUES
    ('Coding Club', 'Technology', 'Peer-led programming club focused on problem solving and projects.', 4),
    ('Robotics Club', 'Innovation', 'Build robots and participate in competitions across disciplines.', 4),
    ('Debate Society', 'Communication', 'Discuss ideas, sharpen public speaking, and organize debates.', 4);

INSERT INTO club_members (club_id, student_id, role)
VALUES
    (1, 1, 'MEMBER'),
    (1, 3, 'PRESIDENT'),
    (2, 2, 'MEMBER'),
    (3, 1, 'MEMBER');

INSERT INTO membership_applications (club_id, student_id, status)
VALUES
    (2, 1, 'APPROVED'),
    (3, 2, 'PENDING');

INSERT INTO events (club_id, title, description, venue, event_date, status, capacity, created_by)
VALUES
    (1, 'Git & GitHub Basics', 'Hands-on session on version control and collaborative coding workflows.', 'Lab 3', '2026-10-12 14:00:00+05:30', 'APPROVED', 45, 3),
    (2, 'Drone Racing Demo', 'Interactive demonstration of autonomous flight and controls.', 'Main Ground', '2026-10-15 16:30:00+05:30', 'APPROVED', 20, 3),
    (3, 'Campus Debate Finals', 'Final stage debate among college teams.', 'Auditorium', '2026-10-20 18:00:00+05:30', 'PENDING', 80, 3);

INSERT INTO event_registrations (event_id, student_id, registration_status)
VALUES
    (1, 1, 'REGISTERED'),
    (1, 2, 'REGISTERED'),
    (2, 1, 'REGISTERED');

INSERT INTO attendance (event_id, student_id, marked_by, present)
VALUES
    (1, 1, 4, true),
    (1, 2, 4, true),
    (2, 1, 4, true);

INSERT INTO equipment (club_id, name, category, quantity, condition_status)
VALUES
    (1, 'Laptop Kit', 'Electronics', 5, 'GOOD'),
    (2, '3D Printer', 'Maker', 1, 'UNDER_MAINTENANCE'),
    (3, 'Debate Mics', 'Audio', 4, 'GOOD');

INSERT INTO equipment_borrow (equipment_id, student_id, borrowed_from, borrowed_to, status, reason)
VALUES
    (1, 1, '2026-10-01 09:00:00+05:30', '2026-10-03 13:00:00+05:30', 'RETURNED', 'Project presentation setup');

INSERT INTO club_budgets (club_id, total_budget)
VALUES
    (1, 25000.00),
    (2, 18000.00),
    (3, 9000.00);

INSERT INTO funding_requests (club_id, requested_by, title, amount, purpose, status)
VALUES
    (1, 3, 'Hackathon Travel Kit', 12000.00, 'Purchase of components and marker boards for inter-college hackathon participation.', 'APPROVED'),
    (2, 3, 'Robotics Competition Parts', 8500.00, 'Additional sensors and chassis parts for the national robotics challenge.', 'PENDING');

INSERT INTO budget_transactions (club_id, funding_request_id, amount, transaction_type, description)
VALUES
    (1, 1, 12000.00, 'DEBIT', 'Hackathon equipment purchase'),
    (1, NULL, 5000.00, 'CREDIT', 'Semester budget allocation');

INSERT INTO announcements (club_id, created_by, title, content, is_pinned)
VALUES
    (1, 3, 'Hackathon Team Forming', 'Students can now register for the internal hackathon team formation round.', true),
    (2, 3, 'Robotics Workshop', 'A drone robotics workshop is scheduled next week. Bring your laptops.', false),
    (NULL, 5, 'Campus System Update', 'New club event approval workflow is available from today.', true);
