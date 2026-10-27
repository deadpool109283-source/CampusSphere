// v2MockData.js — Full dataset and mock store for CampusSphere v2 features
// Powers all 10 domain views with realistic campus data and instant reactivity

const STORAGE_KEY = 'campussphere_v2_store_v1';

export const INITIAL_V2_DATA = {
  // 1. Applications for club membership
  applications: [
    {
      _id: 'app-1',
      clubId: { _id: 'club-msft', name: 'Microsoft Student Community' },
      profileId: {
        _id: 'usr-aarav',
        name: 'Aarav Nair',
        email: 'aarav.nair@am.students.amrita.edu',
        registerNumber: 'AM.EN.U4CSE23101',
        department: 'CSE',
        phone: '+91 98401 23456',
      },
      requestedPosition: 'member',
      yearOfStudy: '2nd Year',
      applicantPhone: '+91 98401 23456',
      domain: 'Cloud & AI',
      reason: 'Eager to contribute to Azure cloud workshops and coordinate hackathons for our campus batch.',
      status: 'pending',
      appliedDate: '2026-10-10T10:30:00.000Z',
      reviewHistory: [],
    },
    {
      _id: 'app-2',
      clubId: { _id: 'club-code', name: 'Coding Club Amrita' },
      profileId: {
        _id: 'usr-kavya',
        name: 'Kavya Rajesh',
        email: 'kavya.r@am.students.amrita.edu',
        registerNumber: 'AM.EN.U4AIE23045',
        department: 'AIE',
        phone: '+91 94452 87654',
      },
      requestedPosition: 'executive',
      yearOfStudy: '3rd Year',
      applicantPhone: '+91 94452 87654',
      domain: 'Competitive Programming',
      reason: 'Led multiple ACM ICPC qualifiers and want to run algorithmic training for junior semesters.',
      status: 'approved',
      appliedDate: '2026-10-02T14:15:00.000Z',
      reviewHistory: [
        { status: 'approved', reviewer: 'Dr. Priya Saran (Mentor)', date: '2026-10-04T09:00:00.000Z' }
      ],
    },
    {
      _id: 'app-3',
      clubId: { _id: 'club-design', name: 'Design & Media Guild' },
      profileId: {
        _id: 'usr-siddharth',
        name: 'Siddharth Menon',
        email: 'siddharth.m@am.students.amrita.edu',
        registerNumber: 'AM.EN.U4ECE24012',
        department: 'ECE',
        phone: '+91 91234 56789',
      },
      requestedPosition: 'member',
      yearOfStudy: '1st Year',
      applicantPhone: '+91 91234 56789',
      domain: 'UI/UX & Branding',
      reason: 'Experienced with Figma, motion systems, and editorial design; want to build graphics for campus events.',
      status: 'pending',
      appliedDate: '2026-10-11T16:45:00.000Z',
      reviewHistory: [],
    },
  ],

  // 2. Position invitations for leadership roles
  memberships: [
    {
      _id: 'mem-inv-1',
      clubId: { _id: 'club-msft', name: 'Microsoft Student Community' },
      profileId: { _id: 'usr-me', name: 'Student Leader' },
      position: 'vice_president',
      membershipStatus: 'pending',
      joinedDate: '2026-10-08T10:00:00.000Z',
    },
    {
      _id: 'mem-act-1',
      clubId: { _id: 'club-code', name: 'Coding Club Amrita' },
      profileId: { _id: 'usr-me', name: 'Student Leader' },
      position: 'president',
      membershipStatus: 'active',
      joinedDate: '2026-08-15T10:00:00.000Z',
    },
  ],

  // 3. Club Members list (roster)
  members: [
    {
      _id: 'mbr-1',
      clubId: 'club-msft',
      profileId: {
        _id: 'usr-rohan',
        name: 'Rohan Verma',
        email: 'rohan.v@am.students.amrita.edu',
      },
      position: 'president',
      officeBearerGroup: true,
      membershipStatus: 'active',
      joinedDate: '2025-08-01T00:00:00.000Z',
    },
    {
      _id: 'mbr-2',
      clubId: 'club-msft',
      profileId: {
        _id: 'usr-aarav',
        name: 'Aarav Nair',
        email: 'aarav.nair@am.students.amrita.edu',
      },
      position: 'vice_president',
      officeBearerGroup: true,
      membershipStatus: 'active',
      joinedDate: '2025-09-15T00:00:00.000Z',
    },
    {
      _id: 'mbr-3',
      clubId: 'club-msft',
      profileId: {
        _id: 'usr-neha',
        name: 'Neha Kapoor',
        email: 'neha.k@am.students.amrita.edu',
      },
      position: 'secretary',
      officeBearerGroup: true,
      membershipStatus: 'active',
      joinedDate: '2025-10-01T00:00:00.000Z',
    },
    {
      _id: 'mbr-4',
      clubId: 'club-msft',
      profileId: {
        _id: 'usr-kiran',
        name: 'Kiran Rao',
        email: 'kiran.r@am.students.amrita.edu',
      },
      position: 'treasurer',
      officeBearerGroup: true,
      membershipStatus: 'active',
      joinedDate: '2025-10-05T00:00:00.000Z',
    },
    {
      _id: 'mbr-5',
      clubId: 'club-msft',
      profileId: {
        _id: 'usr-divya',
        name: 'Divya Sundar',
        email: 'divya.s@am.students.amrita.edu',
      },
      position: 'member',
      officeBearerGroup: false,
      membershipStatus: 'active',
      joinedDate: '2026-01-20T00:00:00.000Z',
    },
    {
      _id: 'mbr-6',
      clubId: 'club-msft',
      profileId: {
        _id: 'usr-alumni-tarun',
        name: 'Tarun Chandran',
        email: 'tarun.c@alumni.amrita.edu',
      },
      position: 'member',
      officeBearerGroup: false,
      membershipStatus: 'ended',
      joinedDate: '2024-08-01T00:00:00.000Z',
      endedAt: '2026-05-30T00:00:00.000Z',
      endedBy: { name: 'Student Affairs' },
    },
  ],

  // 4. Student participation records (keepsakes)
  participation: [
    {
      _id: 'part-1',
      eventId: {
        _id: 'evt-code-jam',
        title: 'Campus Code Jam & Algorithmic Sprint',
        clubId: { name: 'Coding Club Amrita' },
        eventDate: '2026-09-24T10:00:00.000Z',
      },
      status: 'attended',
    },
    {
      _id: 'part-2',
      eventId: {
        _id: 'evt-azure-ai',
        title: 'Azure OpenAI & Cognitive Services Workshop',
        clubId: { name: 'Microsoft Student Community' },
        eventDate: '2026-10-04T14:00:00.000Z',
      },
      status: 'attended',
    },
  ],

  // 5. Equipment Inventory
  equipment: [
    {
      _id: 'eq-1',
      name: 'Sony 4K Live Broadcast Camcorder & Tripod Kit',
      description: 'Studio-grade video recording unit with XLR microphone input and fluid head tripod for auditorium sessions.',
      clubId: { _id: 'club-design', name: 'Design & Media Guild' },
      condition: 'Excellent',
      totalQuantity: 3,
      availableQuantity: 2,
    },
    {
      _id: 'eq-2',
      name: 'Sennheiser Wireless Dual Handheld Mic System',
      description: 'UHF diversity dual microphone receiver with cardioid capsules for guest speakers and ceremonies.',
      clubId: { _id: 'club-msft', name: 'Microsoft Student Community' },
      condition: 'Good',
      totalQuantity: 4,
      availableQuantity: 3,
    },
    {
      _id: 'eq-3',
      name: 'Anker Nebula 4K High-Lumen Laser Projector',
      description: 'Portable HDR presentation unit with HDMI and USB-C pass-through for outdoor amphitheatre hackathons.',
      clubId: { _id: 'club-code', name: 'Coding Club Amrita' },
      condition: 'Good',
      totalQuantity: 2,
      availableQuantity: 1,
    },
    {
      _id: 'eq-4',
      name: 'Arduino & Raspberry Pi 5 Embedded Edge Lab Kits',
      description: 'Pack of 10 prototyping trays complete with sensors, OLED shields, breadboards, and power banks.',
      clubId: { _id: 'club-robotics', name: 'Robotics & Automation Society' },
      condition: 'Fair',
      totalQuantity: 10,
      availableQuantity: 8,
    },
  ],

  // 6. Equipment Loans (Borrows)
  borrows: [
    {
      _id: 'brw-1',
      equipmentId: { _id: 'eq-1', name: 'Sony 4K Live Broadcast Camcorder & Tripod Kit' },
      clubId: { _id: 'club-msft', name: 'Microsoft Student Community' },
      eventId: { _id: 'evt-azure-ai', title: 'Azure Cloud National Hackathon 2026' },
      profileId: { _id: 'usr-rohan', name: 'Rohan Verma (President)' },
      dueDate: '2026-10-25T18:00:00.000Z',
      purpose: 'Documenting the 36-hour hackathon keynotes and live student product demos.',
      status: 'mentor_pending',
      reviewHistory: [],
    },
    {
      _id: 'brw-2',
      equipmentId: { _id: 'eq-3', name: 'Anker Nebula 4K High-Lumen Laser Projector' },
      clubId: { _id: 'club-code', name: 'Coding Club Amrita' },
      eventId: { _id: 'evt-code-jam', title: 'Open Source Community Sprint' },
      profileId: { _id: 'usr-kavya', name: 'Kavya Rajesh' },
      dueDate: '2026-10-18T17:00:00.000Z',
      purpose: 'Live coding walkthrough and PR reviews in Central Courtyard.',
      status: 'approved',
      reviewHistory: [
        { status: 'approved', reviewer: 'Dr. Priya Saran (Mentor)', date: '2026-10-09T11:00:00.000Z' },
        { status: 'approved', reviewer: 'Student Affairs Directorate', date: '2026-10-10T14:30:00.000Z' }
      ],
    },
  ],

  // 7. Funding Requests
  funding: [
    {
      _id: 'fnd-1',
      clubId: { _id: 'club-msft', name: 'Microsoft Student Community' },
      eventId: { _id: 'evt-azure-ai', title: 'Azure Cloud National Hackathon 2026' },
      requestedAmount: 45000,
      purpose: 'Prizes, cloud compute credits, participant refreshments, and event badges.',
      status: 'student_affairs_pending',
      requestDate: '2026-10-05T09:00:00.000Z',
      createdBy: { name: 'Rohan Verma' },
      reviewHistory: [
        { status: 'approved', reviewer: 'Dr. Ramesh Kumar (Mentor)', date: '2026-10-06T12:00:00.000Z' }
      ],
    },
    {
      _id: 'fnd-2',
      clubId: { _id: 'club-code', name: 'Coding Club Amrita' },
      eventId: { _id: 'evt-code-jam', title: 'Algorithmic Bootcamp S4' },
      requestedAmount: 18500,
      purpose: 'Guest speaker honorarium and workshop printed training workbooks.',
      status: 'approved',
      requestDate: '2026-09-28T10:00:00.000Z',
      createdBy: { name: 'Kavya Rajesh' },
      reviewHistory: [
        { status: 'approved', reviewer: 'Dr. Priya Saran (Mentor)', date: '2026-09-30T10:00:00.000Z' },
        { status: 'approved', reviewer: 'Student Affairs Directorate', date: '2026-10-01T15:00:00.000Z' }
      ],
    },
    {
      _id: 'fnd-3',
      clubId: { _id: 'club-design', name: 'Design & Media Guild' },
      eventId: null,
      requestedAmount: 12000,
      purpose: 'Annual typography and print design exhibition stationery and display easels.',
      status: 'mentor_pending',
      requestDate: '2026-10-11T14:00:00.000Z',
      createdBy: { name: 'Siddharth Menon' },
      reviewHistory: [],
    },
  ],

  // 8. Recorded Transactions (Expenses)
  transactions: [
    {
      _id: 'txn-1',
      clubId: { _id: 'club-msft', name: 'Microsoft Student Community' },
      amount: 14500,
      type: 'debit',
      description: 'Hackathon participant welcome kits & lanyards',
      date: '2026-09-15T00:00:00.000Z',
    },
    {
      _id: 'txn-2',
      clubId: { _id: 'club-code', name: 'Coding Club Amrita' },
      amount: 12000,
      type: 'debit',
      description: 'Guest speaker travel & mementos',
      date: '2026-09-22T00:00:00.000Z',
    },
    {
      _id: 'txn-3',
      clubId: { _id: 'club-msft', name: 'Microsoft Student Community' },
      amount: 9800,
      type: 'debit',
      description: 'Cloud track prize vouchers',
      date: '2026-10-02T00:00:00.000Z',
    },
    {
      _id: 'txn-4',
      clubId: { _id: 'club-design', name: 'Design & Media Guild' },
      amount: 6500,
      type: 'debit',
      description: 'High-res poster prints & mountings',
      date: '2026-09-29T00:00:00.000Z',
    },
    {
      _id: 'txn-5',
      clubId: { _id: 'club-robotics', name: 'Robotics & Automation Society' },
      amount: 16000,
      type: 'debit',
      description: 'LiPo batteries & drone carbon-fiber spares',
      date: '2026-10-05T00:00:00.000Z',
    },
  ],

  // 9. Post-Event Completion Reports
  eventReports: [
    {
      _id: 'rep-1',
      eventId: { _id: 'evt-1', title: 'Azure Cloud National Hackathon 2026' },
      clubId: { _id: 'club-msft', name: 'Microsoft Student Community' },
      submittedBy: { name: 'Rohan Verma (President)' },
      status: 'mentor_pending',
      summary: 'A 36-hour multi-track technical hackathon focused on Azure OpenAI, Edge IoT, and Microservices.',
      activities: 'Keynote by Microsoft Azure Architect, 4 mentoring sprint checkpoints, live judging by alumni and faculty.',
      outcomes: '42 working prototypes deployed to Azure App Service; 14 teams shortlisted for national accelerator track.',
      issues: 'Campus network bandwidth throttled during morning container pulls; resolved by local docker registry cache.',
      budgetSpent: 38400,
      attendeeCount: 168,
      rosterFileName: 'azure-hackathon-2026-od-roster.csv',
      reportDetails: {
        promotion: {
          selected: ['LinkedIn Page/URL', 'Link to photos and videos'],
          remark: 'https://linkedin.com/company/amrita-msft-community · Over 12k impressions recorded.'
        },
        eventCategory: {
          selected: ['Flagship'],
          remark: 'Flagship annual hackathon approved in Academic Calendar.'
        },
        programType: {
          selected: ['Level 4: Hackathons'],
          remark: 'Continuous 36-hour sprint with midnight checkpoints.'
        },
        programTheme: {
          selected: ['Leadership & Management'],
          remark: 'Collaborative development and product pitch delivery.'
        },
        sdgAlignment: {
          selected: ['SDG 4 — Quality Education', 'SDG 9 — Industry, Innovation and Infrastructure'],
          remark: 'Projects addressed inclusive digital learning tools and sensorized industrial monitoring.'
        },
        sessionMode: {
          selected: ['Hybrid'],
          remark: 'Keynotes streamed live to Amritapuri & Bengaluru campuses.'
        },
        resourcePerson: {
          selected: ['External', 'Alumni'],
          remark: 'Srihari Venkatesh (Principal Solution Architect, Microsoft India) and 3 alumni mentors.'
        },
        participants: {
          selected: ['internal', 'external'],
          internalCount: 142,
          externalCount: 26,
          remark: 'All 168 participants verified via RFID scan at registration desk.'
        },
        activityCompletion: {
          duration: { value: '36 hours continuous', remark: 'Friday 6:00 PM to Sunday 6:00 AM' },
          startDate: { value: '2026-10-02', remark: '' },
          endDate: { value: '2026-10-04', remark: '' },
          expenditure: { value: 'INR 38,400 (Thirty Eight Thousand Four Hundred Only)', remark: 'Reconciled with Finance Desk' },
          resourcePersonDetails: { value: 'Srihari Venkatesh, Microsoft India; Priya Ramanathan, AWS Alumni Network.', remark: '' },
          discussionHighlights: { value: 'Industrial AI migration strategies, vector search implementations, and Responsible AI guardrails.', remark: '' },
          objectiveAchieved: { value: 'Students demonstrated practical deployment capabilities using enterprise cloud services.', remark: '' },
          skillsAcquired: { value: 'Azure Kubernetes Service, LangChain orchestration, Git team branching, and product pitch presentations.', remark: '' },
          detailedReport: { value: 'The Microsoft Student Community hosted its flagship Azure Cloud National Hackathon on October 2-4, 2026. Attracting 168 participants across undergraduate engineering branches, the hackathon provided enterprise-grade sandbox environments. Mentors provided continuous technical guidance across four evaluation rounds. The top three winning projects built decentralized healthcare record tools and adaptive learning assistants for visually impaired students. Student feedback commended the technical mentorship and seamless event logistics.', remark: '' },
          impactAnalysis: { value: '14 prototypes are advancing to student patent filings, and two startups registered with Amrita TBI incubation cell.', remark: '' },
          brochure: { image: '', remark: 'Circulated campus-wide via digital signage.' },
          photograph1: { image: '', remark: 'Inaugural lighting of lamp and keynote session.' },
          photograph2: { image: '', remark: 'Midnight coding sprint in Innovation Centre.' },
          photograph3: { image: '', remark: 'Finalist prototype presentations to external judges.' },
          photograph4: { image: '', remark: 'Valedictory ceremony and prize distribution.' },
        }
      },
      reviewHistory: [],
    },
    {
      _id: 'rep-2',
      eventId: { _id: 'evt-2', title: 'Open Source Community Sprint' },
      clubId: { _id: 'club-code', name: 'Coding Club Amrita' },
      submittedBy: { name: 'Kavya Rajesh (Executive)' },
      status: 'approved',
      summary: 'Hands-on sprint introducing Git contribution workflows and pull request etiquette for open-source repositories.',
      activities: 'Live branch demonstrations, bug bounty triage on GitHub, and merge certification.',
      outcomes: '78 merged pull requests across designated campus repositories and Hacktoberfest partners.',
      issues: 'None. Lab 3 workstations operated without friction.',
      budgetSpent: 7200,
      attendeeCount: 94,
      rosterFileName: 'open-source-sprint-od-roster.csv',
      reportDetails: {
        promotion: { selected: ['LinkedIn Page/URL'], remark: '' },
        eventCategory: { selected: ['Independent'], remark: '' },
        programType: { selected: ['Level 2: Workshop'], remark: '' },
        programTheme: { selected: ['Literary & Communication'], remark: '' },
        sdgAlignment: { selected: ['SDG 4 — Quality Education'], remark: '' },
        sessionMode: { selected: ['Offline'], remark: '' },
        resourcePerson: { selected: ['Internal'], remark: 'Student Executive Team' },
        participants: { selected: ['internal'], internalCount: 94, externalCount: 0, remark: '' },
        activityCompletion: {
          duration: { value: '4 hours', remark: '' },
          startDate: { value: '2026-09-24', remark: '' },
          endDate: { value: '2026-09-24', remark: '' },
          expenditure: { value: 'INR 7,200', remark: '' },
          resourcePersonDetails: { value: 'Student core council', remark: '' },
          discussionHighlights: { value: 'License compliance, issue reproduction, and clean commit history.', remark: '' },
          objectiveAchieved: { value: 'All attendees successfully submitted a verified pull request.', remark: '' },
          skillsAcquired: { value: 'Git rebase, GitHub Actions, Markdown documentation, semantic versioning.', remark: '' },
          detailedReport: { value: 'Workshop introduced version control to 94 students.', remark: '' },
          impactAnalysis: { value: 'Marked increase in student participation in international open source competitions.', remark: '' },
        }
      },
      reviewHistory: [
        { status: 'approved', reviewer: 'Dr. Priya Saran (Mentor)', date: '2026-09-26T10:00:00.000Z' },
        { status: 'approved', reviewer: 'Student Affairs Directorate', date: '2026-09-27T16:00:00.000Z' }
      ],
    },
  ],

  // 10. Announcements
  announcements: [
    {
      _id: 'ann-1',
      title: 'Annual Amrita Kalotsav 2026 Stage Registrations Open',
      content: 'Club coordinators and student teams may now submit stage requirements and audio cues for the university cultural week at the Student Affairs desk.',
      clubId: { name: 'Office of Student Affairs' },
      priority: 'high',
      postedDate: '2026-10-12T08:00:00.000Z',
    },
    {
      _id: 'ann-2',
      title: 'Lab 3 & Central Auditorium Equipment Upgrade Notice',
      content: 'New 4K presentation switchers and wireless stage boundary microphones are now online and available for club event reservations.',
      clubId: { name: 'ICTS Directorate' },
      priority: 'normal',
      postedDate: '2026-10-11T11:30:00.000Z',
    },
    {
      _id: 'ann-3',
      title: 'Recruitment Drive: Fall 2026 Junior Cohort Induction',
      content: 'Technical and cultural clubs have commenced intake interviews for 1st and 2nd year students. Check the Explore Clubs portal to submit applications.',
      clubId: { name: 'Campus Club Council' },
      priority: 'normal',
      postedDate: '2026-10-09T14:00:00.000Z',
    },
  ],

  // 11. Club Credential & Login Change Requests (ICTS Desk)
  credentialRequests: [
    {
      _id: 'cred-1',
      clubId: { _id: 'club-msft', name: 'Microsoft Student Community' },
      requestedBy: { name: 'ICTS Helpdesk', email: 'icts@am.amrita.edu' },
      clubLoginEmail: 'msft.community@am.amrita.edu',
      passwordChangeRequested: true,
      status: 'pending',
    },
    {
      _id: 'cred-2',
      clubId: { _id: 'club-design', name: 'Design & Media Guild' },
      requestedBy: { name: 'Prof. Ananya V. (Mentor)', email: 'ananya@am.amrita.edu' },
      clubLoginEmail: 'designguild@am.amrita.edu',
      passwordChangeRequested: false,
      status: 'approved',
    },
  ],

  // 12. Chat Messages
  chats: [
    {
      _id: 'msg-1',
      clubId: 'club-msft',
      group: 'members',
      senderId: { name: 'Rohan Verma (President)' },
      content: 'Welcome to all newly inducted Microsoft Student Community members! Check out the GitHub repository for our upcoming Azure workshops.',
      createdAt: '2026-10-11T09:15:00.000Z',
    },
    {
      _id: 'msg-2',
      clubId: 'club-msft',
      group: 'members',
      senderId: { name: 'Aarav Nair (Vice President)' },
      content: 'Our cloud sandbox vouchers have arrived. Everyone attending Wednesday’s lab session should register by 5 PM.',
      createdAt: '2026-10-11T11:45:00.000Z',
    },
    {
      _id: 'msg-3',
      clubId: 'club-msft',
      group: 'office_bearers',
      senderId: { name: 'Rohan Verma (President)' },
      content: 'Confidential OB Notice: Mentor Dr. Ramesh Kumar approved the 45k hackathon budget request. It is now awaiting Student Affairs sign-off.',
      createdAt: '2026-10-12T08:30:00.000Z',
    },
    {
      _id: 'msg-4',
      clubId: 'club-code',
      group: 'members',
      senderId: { name: 'Kavya Rajesh' },
      content: 'Great turnout at yesterday’s competitive programming mock contest! Leaderboard is live on the Amrita portal.',
      createdAt: '2026-10-10T17:00:00.000Z',
    },
  ],

  // 13. Reports KPI Summary
  summary: {
    clubs: 14,
    events: 28,
    members: 412,
    pendingApplications: 5,
    reportsSubmitted: 18,
    allocated: 350000,
    spent: 218500,
    clubReports: [
      {
        _id: 'club-msft',
        name: 'Microsoft Student Community',
        category: 'Technology',
        members: 142,
        events: 7,
        reportsSubmitted: 6,
        announcements: 8,
        allocated: 95000,
        spent: 68400,
      },
      {
        _id: 'club-code',
        name: 'Coding Club Amrita',
        category: 'Technology',
        members: 98,
        events: 9,
        reportsSubmitted: 8,
        announcements: 11,
        allocated: 75000,
        spent: 54200,
      },
      {
        _id: 'club-design',
        name: 'Design & Media Guild',
        category: 'Design & Arts',
        members: 65,
        events: 5,
        reportsSubmitted: 3,
        announcements: 4,
        allocated: 50000,
        spent: 31500,
      },
      {
        _id: 'club-robotics',
        name: 'Robotics & Automation Society',
        category: 'Engineering',
        members: 74,
        events: 4,
        reportsSubmitted: 3,
        announcements: 6,
        allocated: 80000,
        spent: 52000,
      },
      {
        _id: 'club-acm',
        name: 'ACM Student Chapter',
        category: 'Technology',
        members: 33,
        events: 3,
        reportsSubmitted: 2,
        announcements: 3,
        allocated: 50000,
        spent: 12400,
      },
    ],
  },
};

export function getV2Store() {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Could not read session storage for v2 store:', err);
  }
  return { ...INITIAL_V2_DATA };
}

export function saveV2Store(data) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('Could not write session storage for v2 store:', err);
  }
}
