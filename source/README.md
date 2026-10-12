# Beacoder Frontend

The Beacoder frontend is a React single-page application for an online learning platform. It provides public authentication pages, learner course and curriculum experiences, assignment submission, discussions, notifications, and instructor workflows for reviewing assignments and managing discussions.

This README describes the frontend source application in this directory. The application expects the Beacoder backend API to be running separately.

## Features

- User registration and JWT-based login.
- Protected learner and instructor routes.
- Course catalogue, enrolment, enrolled-course overview, and learner progress.
- Curriculum roadmap and course/topic/subtopic navigation.
- Subtopic review selections and course review-coverage tracking.
- Assignment listing, filtering, submission, and learner statistics.
- Learner discussions, replies, and pair-programming requests.
- Instructor assignment review with accept/reject feedback.
- Instructor discussion replies and close actions.
- Instructor pair-programming request management.
- Admin/instructor course content editing with a link to preview saved lessons.
- In-app unread notification count, notification list, read state, and navigation.
- Candidate/Admin recruiter management with company and person referral details, creator-owned application status, and premium Kyrox Recruitment Partners listings.

## Technology stack

| Area | Technology |
| --- | --- |
| UI | React 19 |
| Build tool and dev server | Vite 7 |
| Routing | React Router DOM 7 |
| HTTP requests | Axios and browser `fetch` |
| Animations | Framer Motion |
| Icons | React Icons |
| PDF generation | jsPDF |
| Code quality | ESLint 9 with React Hooks and React Refresh plugins |
| Runtime | Node.js and npm |

The backend is a separate Express API. The frontend does not contain the database or backend server.

## Prerequisites

- Node.js 18 or newer is recommended.
- npm.
- A running Beacoder backend API, normally at `http://localhost:3000`.
- A database and backend configuration supported by the backend repository when using real data.

## Run locally

1. Open a terminal in this directory:

	```text
	cd beacoder-frontend/source
	```

2. Create or update `.env`:

	```env
	VITE_BASE_URL=http://localhost:3000
	```

3. Install dependencies:

	```text
	npm install
	```

4. Start the Vite development server:

	```text
	npm run dev
	```

	Vite prints the local URL, usually `http://localhost:5173`.

5. Start the backend separately and open the Vite URL in a browser. The frontend sends requests to `${VITE_BASE_URL}/api/v1/...`.

Do not use `npm start`; this project defines `npm run dev`, not an `npm start` script.

## Environment variables

The frontend currently requires one Vite environment variable:

| Variable | Required | Example | Description |
| --- | --- | --- | --- |
| `VITE_BASE_URL` | Yes | `http://localhost:3000` | Base URL of the Beacoder backend. The frontend appends `/api/v1` and the resource path. |

Vite exposes only variables prefixed with `VITE_` to browser code. Restart the development server after changing `.env`. Do not put database passwords, JWT secrets, or other private credentials in this file.

## Available npm scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Starts the Vite development server. |
| `npm run build` | Creates the production bundle in `dist/`. |
| `npm run preview` | Serves the production bundle locally. Run `npm run build` first. |
| `npm run lint` | Runs ESLint against the frontend source. |

## Pages and routes

### Public pages

| Route | Page | Functionality | API calls |
| --- | --- | --- | --- |
| `/landing-page` | Landing page | Public introduction and entry points to the application. Unknown routes also fall back here. | None. |
| `/login` | Login | Authenticates an existing user and stores the returned JWT and role in browser local storage. | `POST /api/v1/auth/login` with `{ email, password }`. |
| `/signup` | Sign up | Creates a new user account using name, college, phone, address, email, and password. | `POST /api/v1/auth/signup`. |

### Learner pages

All learner routes below require `localStorage.authToken` and are wrapped by `ProtectedRoute`.

| Route | Page | Functionality | API calls |
| --- | --- | --- | --- |
| `/homepage` | Learner homepage | Shows the learner's profile, enrolled courses, progress-related information, and assignment statistics. | `GET /api/v1/user/profile`; `GET /api/v1/user/my-courses`; `GET /api/v1/assignments/my-assignments/stats`. |
| `/courses` | Course catalogue | Lists available courses, shows course cards, and lets a learner enrol. | `GET /api/v1/courses`; `GET /api/v1/user/profile`; `POST /api/v1/user/:courseId/enroll`. |
| `/dashboard` | Dashboard route | Currently renders the course list/catalogue component. | Same APIs as `/courses`. |
| `/curriculum` | Curriculum | Displays the curriculum structure and roadmap for navigating learning content. | `GET /api/v1/curriculum`; `GET /api/v1/curriculum/roadmap`. |
| `/courses/:id` | Course detail | Shows course information, topics, and subtopics. | `GET /api/v1/courses/:id`; `GET /api/v1/courses/:id/topics`; `GET /api/v1/courses/:id/topics/:topicId/subtopics`. |
| `/courses/:id/topics` | Course topics | Alias route for the course detail view. | Same APIs as `/courses/:id`. |
| `/course/:cId/topic/:tId/sub/:sId` | Subtopic content | Reads content blocks and lets the learner select one of three review responses at the end of the subtopic. | `GET /api/v1/courses/:courseId/topics/:topicId/subtopics/:subtopicId/contents`; `GET` and `POST /api/v1/user/subtopics/:subtopicId/review`. |
| `/assignments` | Assignments | Lists assignments, filters by status, displays submission state, and submits a URL or text answer. | `GET /api/v1/assignments/my-assignments`; `POST /api/v1/assignments/:id/submit`; `GET /api/v1/user/profile`. The list can use a `status` query parameter. |
| `/discussions` | Discussions | Lists learner discussions, creates a discussion, requests pair programming, and replies to discussions. | `GET /api/v1/user/my-courses`; `GET /api/v1/assignments/my-assignments`; `GET /api/v1/discussions?scope=...`; `POST /api/v1/discussions`; `POST /api/v1/discussions/pair-programming/:discussionId`; `POST /api/v1/discussions/:discussionId/replies`. |
| `/discussions/:discussionId` | Discussion detail | Opens a selected discussion and displays or adds replies. | `GET /api/v1/discussions/:discussionId`; `POST /api/v1/discussions/:discussionId/replies`. |
| `/recruiters` | Recruiters | Candidate/Admin-only **My Recruiter** and **Kyrox Recruitment Partners** tabs with searchable, filterable, sortable tables. Candidates manage their own recruiter records and statuses; partner listings hide other candidates' statuses and require premium access. | `GET /api/v1/recruiters?view=mine`; `GET /api/v1/recruiters`; `POST /api/v1/recruiters`; `PUT /api/v1/recruiters/:id`; `DELETE /api/v1/recruiters/:id`. |

The recruiter tables combine search with Type, Location, and (where visible) Status filters. Location options come from the current tab's records and match without regard to case or surrounding whitespace. Switching recruiter tabs resets filters, closes the form, and loads a fresh list without displaying the previous tab's records.

The shared learner top bar also loads notifications on authenticated pages:

- `GET /api/v1/notifications/me/unread-count`
- `GET /api/v1/notifications/me`
- `PATCH /api/v1/notifications/me/mark-read` with `{ notificationIds: [...] }`

### Admin/instructor tools

The `/content-editor` route and API are restricted to `admin` and `instructor` roles. After a successful save, select **View saved lesson** to open the lesson page in a new tab while keeping the editor available. That page fetches the current content from `GET /api/v1/courses/:courseId/topics/:topicId/subtopics/:subtopicId/contents`.

### Instructor pages

Instructor routes require both `localStorage.authToken` and `localStorage.userRole === "instructor"`.

| Route | Page | Functionality | API calls |
| --- | --- | --- | --- |
| `/instructor-homepage` | Instructor entry route | Redirects to the instructor assignment page. | None. |
| `/instructor/assignments` | Submitted assignments | Lists learner submissions and filters by course or status. | `GET /api/v1/assignments/admin/submitted?courseId=...&status=...`; `GET /api/v1/courses`. |
| `/instructor/assignments/detail` | Assignment review | Reviews a submission and accepts or rejects it with feedback. Submission data is passed through router navigation state rather than a URL parameter. | `GET /api/v1/assignments/admin/submitted/:submissionId`; `POST /api/v1/assignments/admin/submitted/:submissionId` with `{ status, feedback }`. |
| `/instructor/discussions` | Instructor discussions | Lists discussions and filters them by course. | `GET /api/v1/discussions/admin?courseId=...`; `GET /api/v1/courses`. |
| `/instructor/discussions/:discussionId` | Instructor discussion detail | Views a discussion, replies, and closes it. | `GET /api/v1/discussions/admin/:discussionId`; `POST /api/v1/discussions/admin/:discussionId/replies`; `PATCH /api/v1/discussions/admin/:discussionId` with `{ status: "closed" }`. |
| `/instructor/pair-programming` | Pair programming | Lists pair-programming requests and marks requests complete. | `GET /api/v1/discussions/admin/pair-programming?courseId=...&status=...`; `PATCH /api/v1/discussions/admin/:discussionId/pair-programming-status`. |

## Authentication behavior

- Login stores the returned token in `localStorage.authToken` and the returned role in `localStorage.userRole`.
- Authenticated requests manually send `Authorization: Bearer <token>`.
- `ProtectedRoute` checks for the token. Instructor pages additionally check the stored role.
- The recruiter route is restricted to `student` and `admin` roles; the backend enforces the same restriction and creator ownership.
- There is currently no shared Axios interceptor, refresh-token flow, or authentication context.
- Logout handlers remove the authentication token; users should sign in again after logging out.

For local testing, use a backend account that has the appropriate role. An instructor account is required for the instructor routes.

## Source structure

```text
source/
├── public/                 Static assets
├── src/
│   ├── api/                API helper modules
│   ├── components/         Shared navigation, cards, loaders, and UI components
│   ├── pages/              Public, learner, and instructor page components
│   ├── utils/              Shared helpers, including course image handling
│   ├── App.jsx             Route definitions
│   └── main.jsx            React/Vite entry point
├── .env                    Local frontend environment variables
├── index.html              HTML entry point
├── package.json            Scripts and dependencies
└── vite.config.js          Vite configuration
```

## Production build

Build and locally verify the production bundle with:

```text
npm run build
npm run preview
```

The deployment infrastructure provisions an S3 bucket and CloudFront distribution, creates the frontend environment file from deployment configuration, builds the application, and uploads `dist/`. Set the production `VITE_BASE_URL` to the reachable backend URL before building; Vite embeds this value into the browser bundle at build time.

When deploying a browser SPA, configure the hosting layer to serve `index.html` for client-side routes such as `/courses/1` and `/discussions/10`. Otherwise, refreshing a deep link may return a hosting-layer 404 even though client-side navigation works.

## Troubleshooting

### API requests fail locally

Confirm that:

1. The backend is running.
2. `VITE_BASE_URL` points to the backend origin and does not already include `/api/v1`.
3. The backend allows requests from the Vite development origin.
4. The browser has a valid `authToken` for protected endpoints.

### The frontend does not start with `npm start`

Use `npm run dev`. There is no `start` script in `package.json`.

### Instructor pages redirect or remain inaccessible

Sign in with an instructor account and verify that the login response includes `role: "instructor"`. The frontend uses that value for the instructor route guard.

### A route works through navigation but not after refresh

This is a hosting configuration issue common to SPAs. Configure the development or production server to fall back to `index.html` for unknown application routes.

## Related repositories

- `beacoder-backend`: Express API, authentication, course data, assignments, discussions, notifications, and database integration.
- `beacoder-content`: Curriculum and learning-content source files and content-loading scripts.
