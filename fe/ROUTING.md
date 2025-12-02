# Frontend Routing Structure

This document maps all user stories to their corresponding routes in the Next.js App Router structure.

## Route Structure Overview

```
app/
├── (auth)/                    # Authentication routes (public)
│   ├── login/
│   │   └── page.tsx          # US-AUTH-001: Login
│   └── register/
│       └── page.tsx          # US-AUTH-002: Register
│
├── (student)/                 # Student routes (protected)
│   ├── layout.tsx            # Student layout with navigation
│   ├── profile/
│   │   └── page.tsx          # US-S-001: View Profile
│   │   └── edit/
│   │       └── page.tsx      # US-S-002: Update Profile
│   │
│   ├── rooms/
│   │   ├── page.tsx          # US-S-003: View Available Rooms
│   │   ├── join/
│   │   │   └── page.tsx      # US-S-004: Join Room by Code
│   │   └── [roomId]/
│   │       ├── page.tsx      # Room Dashboard (with timer - US-S-009)
│   │       ├── exams/
│   │       │   ├── page.tsx  # US-S-005: View Exams in Room
│   │       │   └── [questionId]/
│   │       │       └── page.tsx  # US-S-006, US-S-007, US-S-008: Code, Test, Submit
│   │       └── results/
│   │           └── page.tsx  # US-S-010: View Score and Solved Questions
│   │
│   └── dashboard/
│       └── page.tsx          # Student dashboard/home
│
└── (admin)/                   # Admin routes (protected, admin only)
    ├── layout.tsx            # Admin layout with navigation
    ├── dashboard/
    │   └── page.tsx          # Admin dashboard/home
    │
    ├── rooms/
    │   ├── page.tsx          # US-A-003: List All Rooms
    │   ├── create/
    │   │   └── page.tsx      # US-A-001: Create Exam Room
    │   └── [roomId]/
    │       ├── page.tsx      # US-A-002: Get Room Details
    │       ├── edit/
    │       │   └── page.tsx  # US-A-004: Update Exam Room
    │       ├── leaderboard/
    │       │   └── page.tsx  # US-A-020: View Room Leaderboard
    │       └── notifications/
    │           └── page.tsx  # US-A-019: Schedule Email Notification
    │
    ├── questions/
    │   ├── page.tsx          # US-A-008: List All Questions
    │   ├── create/
    │   │   └── page.tsx      # US-A-006: Create Question
    │   └── [questionId]/
    │       ├── page.tsx      # US-A-007: Get Question Details
    │       ├── edit/
    │       │   └── page.tsx  # US-A-009: Update Question
    │       └── testcases/
    │           └── page.tsx  # US-A-011, US-A-012, US-A-013, US-A-014: Test Case Management
    │
    └── users/
        ├── page.tsx          # US-A-015: List All Students
        ├── [userId]/
        │   ├── page.tsx      # US-A-016: Get Student by Name / View Student
        │   └── edit/
        │       └── page.tsx  # US-A-017: Update Student Information
        └── ban/
            └── page.tsx      # US-A-018: Ban Student from Exam Room
```

## Detailed Route Mapping

### Authentication Routes (Public)

| Route       | User Story  | Description                               |
| ----------- | ----------- | ----------------------------------------- |
| `/login`    | US-AUTH-001 | Login page                                |
| `/register` | US-AUTH-002 | Registration page                         |
| Logout      | US-AUTH-003 | Logout action (button/API call, no route) |

### Student Routes (Protected)

| Route                                        | User Story                   | Description                     |
| -------------------------------------------- | ---------------------------- | ------------------------------- |
| `/student/profile`                           | US-S-001                     | View student profile            |
| `/student/profile/edit`                      | US-S-002                     | Update student profile          |
| `/student/rooms`                             | US-S-003                     | View available exam rooms       |
| `/student/rooms/join`                        | US-S-004                     | Join exam room by code          |
| `/student/rooms/[roomId]`                    | US-S-009                     | Room dashboard with timer       |
| `/student/rooms/[roomId]/exams`              | US-S-005                     | View exams (questions) in room  |
| `/student/rooms/[roomId]/exams/[questionId]` | US-S-006, US-S-007, US-S-008 | Code editor, test, and submit   |
| `/student/rooms/[roomId]/results`            | US-S-010                     | View score and solved questions |

### Admin Routes (Protected, Admin Only)

#### Room Management

| Route                            | User Story | Description               |
| -------------------------------- | ---------- | ------------------------- |
| `/admin/rooms`                   | US-A-003   | List all exam rooms       |
| `/admin/rooms/create`            | US-A-001   | Create exam room          |
| `/admin/rooms/[roomId]`          | US-A-002   | Get room details          |
| `/admin/rooms/[roomId]/edit`     | US-A-004   | Update exam room          |
| `/admin/rooms/[roomId]` (DELETE) | US-A-005   | Delete exam room (action) |

#### Question Management

| Route                                    | User Story | Description              |
| ---------------------------------------- | ---------- | ------------------------ |
| `/admin/questions`                       | US-A-008   | List all questions       |
| `/admin/questions/create`                | US-A-006   | Create question          |
| `/admin/questions/[questionId]`          | US-A-007   | Get question details     |
| `/admin/questions/[questionId]/edit`     | US-A-009   | Update question          |
| `/admin/questions/[questionId]` (DELETE) | US-A-010   | Delete question (action) |

#### Test Case Management

| Route                                              | User Story         | Description                |
| -------------------------------------------------- | ------------------ | -------------------------- |
| `/admin/questions/[questionId]/testcases`          | US-A-011, US-A-012 | Create and view test cases |
| `/admin/questions/[questionId]/testcases` (PUT)    | US-A-013           | Update test case (action)  |
| `/admin/questions/[questionId]/testcases` (DELETE) | US-A-014           | Delete test case (action)  |

#### User Management

| Route                        | User Story | Description                      |
| ---------------------------- | ---------- | -------------------------------- |
| `/admin/users`               | US-A-015   | List all students                |
| `/admin/users/[userId]`      | US-A-016   | Get student by name/view student |
| `/admin/users/[userId]/edit` | US-A-017   | Update student information       |
| `/admin/users/ban`           | US-A-018   | Ban student from exam room       |

#### Events & Analytics

| Route                                 | User Story | Description                 |
| ------------------------------------- | ---------- | --------------------------- |
| `/admin/rooms/[roomId]/notifications` | US-A-019   | Schedule email notification |
| `/admin/rooms/[roomId]/leaderboard`   | US-A-020   | View room leaderboard       |

## Route Groups

Next.js route groups `(auth)`, `(student)`, and `(admin)` allow:

- Shared layouts per group
- Route organization without affecting URL structure
- Separate authentication/authorization middleware

## Implementation Notes

### 1. Route Protection

- All routes except `/login` and `/register` should be protected
- Student routes require student role
- Admin routes require admin role
- Use middleware or layout-level checks

### 2. Dynamic Routes

- `[roomId]` - Room identifier
- `[questionId]` - Question identifier
- `[userId]` - User/Student identifier

### 3. Layout Structure

- `(auth)/layout.tsx` - Public layout (minimal)
- `(student)/layout.tsx` - Student layout with navigation, timer component
- `(admin)/layout.tsx` - Admin layout with admin navigation

### 4. Navigation Flow

**Student Flow:**

```
Login → Dashboard → Rooms → Join Room → Room Dashboard → Exams → Question → Submit → Results
```

**Admin Flow:**

```
Login → Dashboard → Rooms/Questions/Users → Create/Edit/View → Manage
```

### 5. Timer Component

- Timer (US-S-009) should be included in `(student)/layout.tsx` or room-specific pages
- Syncs with server time from join room API

### 6. Redirects

- Unauthenticated users → `/login`
- Authenticated students → `/student/dashboard` or `/student/rooms`
- Authenticated admins → `/admin/dashboard` or `/admin/rooms`
- Root `/` → Redirect based on role or show landing page

## File Structure Example

```
app/
├── (auth)/
│   ├── layout.tsx
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
│
├── (student)/
│   ├── layout.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── profile/
│   │   ├── page.tsx
│   │   └── edit/
│   │       └── page.tsx
│   └── rooms/
│       ├── page.tsx
│       ├── join/
│       │   └── page.tsx
│       └── [roomId]/
│           ├── page.tsx
│           ├── exams/
│           │   ├── page.tsx
│           │   └── [questionId]/
│           │       └── page.tsx
│           └── results/
│               └── page.tsx
│
├── (admin)/
│   ├── layout.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── rooms/
│   │   ├── page.tsx
│   │   ├── create/
│   │   │   └── page.tsx
│   │   └── [roomId]/
│   │       ├── page.tsx
│   │       ├── edit/
│   │       │   └── page.tsx
│   │       ├── leaderboard/
│   │       │   └── page.tsx
│   │       └── notifications/
│   │           └── page.tsx
│   ├── questions/
│   │   ├── page.tsx
│   │   ├── create/
│   │   │   └── page.tsx
│   │   └── [questionId]/
│   │       ├── page.tsx
│   │       ├── edit/
│   │       │   └── page.tsx
│   │       └── testcases/
│   │           └── page.tsx
│   └── users/
│       ├── page.tsx
│       ├── [userId]/
│       │   ├── page.tsx
│       │   └── edit/
│       │       └── page.tsx
│       └── ban/
│           └── page.tsx
│
├── layout.tsx
├── page.tsx
└── globals.css
```

## Next Steps

1. Create route group directories: `(auth)`, `(student)`, `(admin)`
2. Implement layout files for each route group
3. Create page components for each route
4. Add authentication/authorization middleware
5. Implement navigation components
6. Add route protection logic
