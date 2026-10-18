# Far From Home – International Student Support Platform
> **Course:** INT257 – Modern Web Application Development  
> **Project P11:** Far From Home  
> **Tagline:** *"Your new home starts here."*

---

## 1. Project Overview

**Far From Home** is a centralized, personalized support web application designed to empower international students as they transition to life and study in a new country. International students frequently experience language barriers, unfamiliar grocery and food options, confusing documentation requirements, bureaucratic banking and SIM card setups, and social isolation.

Far From Home solves these challenges through a unified workflow:
```
Student Profile  ──►  Personalised Information  ──►  Administrative Tasks  ──►  Buddy Matching  ──►  Community Engagement
```

### Primary Objectives:
1. **Region-Specific Intelligence**: Provide accurate, categorized survival handbooks and guides for destination countries.
2. **Dynamic Personalisation**: Automatically personalize checklists, recommended guides, and peer connections using destination and interest profiles.
3. **Milestone & Task Tracking**: Automatically provision destination-specific administrative checklists with deadline tracking and overdue derivations.
4. **Transparent Peer Mentorship**: Connect incoming international students with verified peer buddies through a weighted matching algorithm.
5. **Campus & Community Integration**: Facilitate student discovery and RSVP for orientation sessions, cultural mixers, and social gatherings.
6. **Administrative Governance**: Offer university administrators tools to curate verified content, inspect analytics, manage task templates, and moderate accounts.

---

## 2. Key Features

### Module 1: International Student Information Centre
- **8 Core Categories**:
  1. Food and groceries
  2. Banking and financial services
  3. SIM cards and mobile connectivity
  4. Documentation and immigration requirements
  5. University and campus services
  6. Accommodation and transportation
  7. Healthcare and emergency contacts
  8. Local culture, language, and daily life
- **Search & Filters**: Instant full-text search, category tabs, and destination country filters.
- **Verification Metadata**: Clear indicators (`verified`, `unverified`, `outdated`), last-verified dates, and links to official university/government resources.
- **Bookmarks**: Save important survival guides for offline and quick-access reference.

### Module 2: Documentation & Administrative Task Tracking
- **Automated Task Provisioning**: Completing onboarding automatically matches active `TaskTemplate` records against the student's destination country and generates a personalized checklist.
- **Relative Deadlines**: Due dates are dynamically offset against the student's arrival date (e.g. 60 days before arrival, 7 days post-arrival).
- **Status Management**: Track progress across `not-started`, `in-progress`, and `completed`. Overdue status is computed dynamically from real dates.
- **Dashboard Metrics**: Real-time KPI counters (Total, Completed, Pending, Overdue) and donut progress visualization.
- **Custom Tasks**: Students can add personal tasks with custom priorities, categories, and deadlines.

### Module 3: Peer Buddy Matching & Community Hub
- **Transparent Matching Algorithm**: Calculates a weighted compatibility score out of 100%:
  - **Shared Spoken Languages**: 30% weight
  - **Same University / Campus**: 25% weight
  - **Shared Extracurricular Interests**: 20% weight
  - **Requested Support Areas Alignment**: 15% weight
  - **Active Mentor Availability**: 10% base weight
- **Request State Machine**: Full request lifecycle (`pending` ➔ `accepted`, `rejected`, or `cancelled`). Prevents self-requests and duplicate pending invitations.
- **Community Events**: Browse campus orientations, language exchange meetups, and food tours. Live attendee counters with capacity enforcement and instant RSVP toggle.

### Module 4: Administrative Dashboard & Oversight
- **System KPIs**: Overview of registered students, active checklists, published guides, events, and pending buddy applications.
- **Visual Analytics**: Interactive Recharts graphs for student growth trends, task status breakdown, and events distribution.
- **Content Management**: Create, edit, verify, and soft-archive survival guides and task templates.
- **User & Mentor Moderation**: Review student applications for peer buddy status; suspend or activate user accounts.

---

## 3. Technology Stack

### Frontend
- **Framework**: Next.js 16 (App Router architecture with React 19)
- **Language**: TypeScript 5 (Strict Mode)
- **Styling**: Tailwind CSS v4 with custom dark navy and teal design tokens
- **UI Components**: Accessible primitives built on `@radix-ui` and `class-variance-authority`
- **Icons**: Lucide React
- **Forms & Validation**: React Hook Form with `@hookform/resolvers` and Zod
- **Data Visualizations**: Recharts
- **Toast Notifications**: Sonner

### Backend & API
- **Runtime**: Node.js runtime inside Next.js App Router Route Handlers (`src/app/api/*`)
- **Database**: MongoDB Atlas via Mongoose 9 ODM
- **Authentication**: NextAuth.js v5 (Auth.js beta) using credentials provider with bcryptjs password hashing
- **Session Management**: Secure, stateless JWT strategy carrying role and onboarding flags
- **Authorization**: Server-side role-based access control (`requireAuth()`, `requireAdmin()`)

---

## 4. Architecture & Directory Structure

```text
far-from-home/
├── public/                     # Static media and assets
├── scripts/
│   └── seed.ts                 # Database seeding script with realistic sample dataset
├── src/
│   ├── app/
│   │   ├── (public)/           # Public landing, about, features, contact, privacy, terms
│   │   ├── (auth)/             # Login and registration flows
│   │   ├── (student)/          # Protected student portal (Dashboard, Guides, Tasks, Buddies, Community)
│   │   │   ├── dashboard/
│   │   │   ├── guides/
│   │   │   ├── tasks/
│   │   │   ├── buddies/
│   │   │   ├── community/
│   │   │   ├── profile/
│   │   │   ├── notifications/
│   │   │   └── settings/
│   │   ├── admin/              # Protected admin control center
│   │   │   ├── users/
│   │   │   ├── guides/
│   │   │   ├── templates/
│   │   │   ├── events/
│   │   │   └── buddies/
│   │   ├── api/                # 24 RESTful Next.js Route Handlers
│   │   │   ├── auth/
│   │   │   ├── profile/
│   │   │   ├── onboarding/
│   │   │   ├── guides/
│   │   │   ├── tasks/
│   │   │   ├── buddies/
│   │   │   ├── buddy-requests/
│   │   │   ├── events/
│   │   │   ├── notifications/
│   │   │   └── admin/
│   │   ├── layout.tsx          # Root HTML layout with providers and Sonner toaster
│   │   └── globals.css         # Tailwind CSS v4 theme design tokens
│   ├── components/
│   │   ├── ui/                 # 18 reusable shadcn/ui components (button, card, dialog, etc.)
│   │   ├── layout/             # Navbar, Footer, and DashboardLayout sidebar
│   │   └── providers/          # NextAuth session context provider
│   ├── lib/
│   │   ├── db.ts               # Cached Mongoose connection singleton
│   │   ├── auth.ts             # NextAuth v5 configuration and callbacks
│   │   ├── api-helpers.ts      # Standardized JSON response and error handling
│   │   ├── utils.ts            # Scoring algorithm, date math, overdue calculations
│   │   └── validation/         # Comprehensive Zod schemas
│   ├── models/                 # 10 Mongoose schemas & TypeScript interfaces
│   └── types/                  # Global shared TypeScript interfaces
├── tests/
│   ├── unit/                   # Unit test suites (buddy matching, task status, schemas, permissions)
│   └── integration/            # API workflow and business rule integration tests
├── .env.example                # Environment variable template
├── package.json
├── tsconfig.json
└── vitest.config.ts            # Vitest unit & integration test configuration
```

---

## 5. Prerequisites

Before installing the application, ensure your environment meets the following requirements:
- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **Package Manager**: `npm` (v10+ or v11+)
- **MongoDB**: A free MongoDB Atlas cluster connection string, or a local MongoDB instance running on `mongodb://localhost:27017`

---

## 6. Installation & Quickstart

1. **Clone or Navigate to the Repository**:
   ```bash
   cd "d:/INT 257 project/far-from-home"
   ```

2. **Install Dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the project root (see section 7 for details):
   ```bash
   cp .env.example .env.local
   ```

4. **Seed the Database with Sample Data**:
   Populate the database with verified sample guides, task templates, sample students, buddies, and events:
   ```bash
   npm run seed
   ```

5. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 7. Environment Variables

Create `.env.local` with your configuration:

```env
# MongoDB Connection String (MongoDB Atlas or local)
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/farfromhome?retryWrites=true&w=majority

# NextAuth.js Secret & Base URL
AUTH_SECRET=your-32-character-random-secret-key-here
AUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true

# Optional: Seed configuration overrides
ADMIN_EMAIL=admin@farfromhome.com
ADMIN_PASSWORD=Admin123!
```

> [!NOTE]
> Generate a secure `AUTH_SECRET` using OpenSSL:
> ```bash
> openssl rand -base64 32
> ```

---

## 8. Database Seeding & Sample Credentials

Run the seeder anytime to populate initial data:
```bash
npm run seed
```

### Pre-configured Sample Accounts:

| Role | Email | Password | Details |
|------|-------|----------|---------|
| **Admin** | `admin@farfromhome.com` | `Admin123!` | Full administrative access to `/admin` |
| **Student** | `priya@example.com` | `Student123!` | India ➔ USA (Stanford University), Computer Science |
| **Student** | `carlos@example.com` | `Student123!` | Mexico ➔ UK (Oxford University), International Relations |
| **Student** | `yuki@example.com` | `Student123!` | Japan ➔ Australia (University of Melbourne), Design |
| **Student** | `ahmed@example.com` | `Student123!` | Egypt ➔ Canada (University of Toronto), Engineering |
| **Student** | `sophie@example.com` | `Student123!` | Germany ➔ USA (MIT), Physics |

---

## 9. Testing & Quality Assurance

Far From Home includes automated unit and integration tests powered by **Vitest**:

### Run All Tests:
```bash
npm run test
```

### Watch Mode:
```bash
npm run test:watch
```

### Test Coverage Highlights:
- **`buddy-matching.test.ts`**: Tests the 5-tier weighted scoring algorithm across full matches, partial overlaps, and edge cases.
- **`task-status.test.ts`**: Tests overdue status derivation and relative day offsets.
- **`validation-schemas.test.ts`**: Tests Zod schemas for registration, onboarding, tasks, buddy profiles, and events.
- **`permissions.test.ts`**: Tests `requireAuth()`, `requireAdmin()`, and HTTP error translation.
- **`personalisation.test.ts`**: Tests country-specific task template selection and arrival date math.
- **`api-workflows.test.ts`**: Tests cross-user access restrictions, buddy request state transitions, and event capacity enforcement.

### Linting & TypeScript Type Checking:
```bash
# Verify TypeScript strict type-checking
npx tsc --noEmit

# Run ESLint validation
npm run lint
```

---

## 10. Production Build

To verify and run the production build:

```bash
# Compile and optimize production bundle
npm run build

# Start the production Node server
npm run start
```

All 53 routes (public pages, authenticated student pages, administrative screens, and API endpoints) will compile with full type safety and static optimization.

---

## 11. Deployment to Vercel

1. Push your repository to GitHub.
2. Sign in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Set the **Framework Preset** to `Next.js`.
5. Under **Environment Variables**, provide:
   - `MONGODB_URI`: Your production MongoDB Atlas connection string.
   - `AUTH_SECRET`: A secure 32+ character string.
   - `AUTH_URL`: Your production domain (e.g. `https://far-from-home.vercel.app`).
   - `AUTH_TRUST_HOST`: `true`
6. Click **Deploy**. Vercel will automatically build and serve the application.

---

## 12. Complete API Reference

| Endpoint | Method | Role | Description |
|----------|--------|------|-------------|
| `/api/auth/register` | `POST` | Public | Register new student with bcrypt password hash |
| `/api/auth/[...nextauth]` | `GET/POST` | Public | NextAuth authentication handler |
| `/api/profile` | `GET/PATCH` | Student/Admin | Fetch or update authenticated user profile |
| `/api/onboarding` | `GET/POST` | Student | Progressive multi-step onboarding wizard |
| `/api/guides` | `GET` | Authenticated | List published guides (admins see all) with search & filters |
| `/api/guides` | `POST` | Admin | Create a new survival guide |
| `/api/guides/[id]` | `GET/PATCH/DELETE`| Mixed | Read guide, or update/archive (admin only) |
| `/api/guides/bookmarks` | `GET/POST` | Student | List or toggle saved bookmarks |
| `/api/tasks` | `GET/POST` | Student | List user tasks with dynamic overdue status, or create personal task |
| `/api/tasks/[id]` | `GET/PATCH/DELETE`| Student/Admin | Manage task lifecycle (strictly owner-protected) |
| `/api/tasks/stats` | `GET` | Student | Get task counts, completion rate, and upcoming 7-day deadlines |
| `/api/task-templates` | `GET/POST` | Admin | Manage reusable task templates |
| `/api/task-templates/[id]`| `GET/PATCH/DELETE`| Admin | Update or soft-deactivate templates |
| `/api/buddies` | `GET` | Student/Admin | List approved mentors sorted by compatibility score |
| `/api/buddies/[id]` | `GET` | Student/Admin | Get detailed mentor profile with score breakdown |
| `/api/buddies/profile` | `GET/POST` | Student | Manage authenticated user's mentor application |
| `/api/buddy-requests` | `GET/POST` | Student | List requests or send connection request |
| `/api/buddy-requests/[id]`| `PATCH/DELETE` | Student | Accept, reject, or cancel requests |
| `/api/events` | `GET` | Authenticated | List community events with search & category filters |
| `/api/events` | `POST` | Admin | Schedule a new community event |
| `/api/events/[id]` | `GET/PATCH/DELETE`| Mixed | View event or edit/cancel (admin only) |
| `/api/events/[id]/register` | `POST/DELETE` | Student | RSVP or cancel registration with capacity guards |
| `/api/notifications` | `GET/PATCH` | Student/Admin | List user notifications or mark all as read |
| `/api/notifications/[id]` | `PATCH/DELETE` | Student/Admin | Mark single notification as read |
| `/api/admin/stats` | `GET` | Admin | Platform metrics, growth curves, and activity log |
| `/api/admin/users` | `GET/PATCH` | Admin | Paginated user management and role assignment |
| `/api/admin/users/[id]` | `GET/PATCH` | Admin | User detail inspector and status modification |

---

## 13. Security & Privacy Safeguards

- **Password Hashing**: Salted bcrypt hashing with 10 rounds; passwords never stored in plaintext.
- **Server-Side Authorization**: Every protected mutation checks user authentication and resource ownership (`userId === session.user.id`).
- **NoSQL Injection Defense**: Strict Zod parsing on all client inputs strips unexpected operators.
- **Admin Elevation Protection**: Administrative APIs prevent self-demotion and block students from modifying their own roles.
- **State Transition Guards**: Peer buddy requests and event registrations enforce unidirectional state diagrams, preventing duplicate submissions and race conditions.
- **Privacy Controls**: Contact information is shielded until connection requests are mutually accepted. Students can adjust directory visibility in Settings.

---

