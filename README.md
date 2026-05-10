# Mai Am Gia Dinh Viet

<p align="center">
  <img src="./assets/images/logo.webp" alt="Mai Am Gia Dinh Viet" width="260" />
</p>

<p align="center">
  <strong>A mobile platform that connects the community with verified families in need from the Mai Am Gia Dinh Viet program.</strong>
</p>

<p align="center">
  <img alt="Expo" src="https://img.shields.io/badge/Expo-54-000020?style=for-the-badge&logo=expo&logoColor=white" />
  <img alt="React Native" src="https://img.shields.io/badge/React%20Native-0.81-61DAFB?style=for-the-badge&logo=react&logoColor=111111" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img alt="FastAPI" src="https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img alt="NativeWind" src="https://img.shields.io/badge/NativeWind-UI-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white" />
</p>

<p align="center">
  <a href="#overview">Overview</a>
  &nbsp;|&nbsp;
  <a href="#features">Features</a>
  &nbsp;|&nbsp;
  <a href="#tech-stack">Tech Stack</a>
  &nbsp;|&nbsp;
  <a href="./docs/system-architecture.md">Architecture</a>
  &nbsp;|&nbsp;
  <a href="#getting-started">Getting Started</a>
  &nbsp;|&nbsp;
  <a href="#project-structure">Project Structure</a>
</p>

---

## Overview

**Mai Am Gia Dinh Viet** is an Expo/React Native application designed to help users follow broadcast episodes, read updates, discover verified family stories, and ask an AI assistant for quick information about families, donations, and program content.

The project includes two main parts:

- **Mobile app**: Expo Router, React Native, NativeWind, Google Sign-In, and AsyncStorage-based sessions.
- **Backend API**: FastAPI, SQLModel, PostgreSQL, JWT authentication, Google Auth, and Gemini-powered chatbot/RAG support.

The app also includes local fallback data so core screens can still render when the backend is unavailable during development.

## Features

| Area | Description |
| --- | --- |
| Home | Highlights the latest episode, featured stories, verified families, and news updates. |
| Episodes | Lists broadcast episodes with dates, descriptions, and related content. |
| Family Profiles | Shows each family's story, location, support status, and verified donation details. |
| News | Provides a news feed and detailed update pages. |
| Ask & Find | AI assistant for questions about families, episodes, donations, and program information. |
| Account | Email/password login, registration, Google Sign-In, and profile updates. |
| Admin | Role management, family review, payment verification, content operations, and report actions. |

## Brand Colors

| Token | Color | Value |
| --- | --- | --- |
| Primary | <span style="display:inline-block;width:18px;height:18px;background:#8B1D1D;border-radius:4px;border:1px solid #ddd;"></span> | `#8B1D1D` |
| Cream | <span style="display:inline-block;width:18px;height:18px;background:#FAF7F2;border-radius:4px;border:1px solid #ddd;"></span> | `#FAF7F2` |
| Mustard | <span style="display:inline-block;width:18px;height:18px;background:#D6A84A;border-radius:4px;border:1px solid #ddd;"></span> | `#D6A84A` |
| Success | <span style="display:inline-block;width:18px;height:18px;background:#1F8B4C;border-radius:4px;border:1px solid #ddd;"></span> | `#1F8B4C` |
| Danger | <span style="display:inline-block;width:18px;height:18px;background:#B3261E;border-radius:4px;border:1px solid #ddd;"></span> | `#B3261E` |

## System Architecture

Architecture diagrams are available here:

- [Simple Technology Architecture](./docs/system-architecture-simple.md)
- [Detailed System Architecture](./docs/system-architecture.md)

## Tech Stack

### Mobile

- Expo `~54.0.33`
- React `19.1.0`
- React Native `0.81.5`
- Expo Router `~6.0.23`
- NativeWind `^4.2.3`
- TypeScript `~5.9.2`
- Be Vietnam Pro font
- Google Sign-In

### Backend

- Python `>= 3.9`
- FastAPI
- SQLModel
- PostgreSQL with `psycopg`
- JWT with `python-jose`
- Google Auth
- Gemini API for chatbot and embeddings
- Pandas for CSV data import

## Getting Started

### Prerequisites

- Node.js LTS
- npm
- Expo CLI/EAS CLI for builds
- Python 3.9+
- PostgreSQL
- Android Studio, Expo Go, or a development build for device testing

### 1. Clone and install frontend dependencies

```bash
git clone <repository-url>
cd MaiAmGiaDinhViet_Expo
npm install
```

### 2. Configure frontend environment variables

Create `.env` from the example file:

```bash
cp .env.example .env
```

Update the values:

```env
EXPO_PUBLIC_API_URL=http://<your-local-ip>:8000
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=
```

When testing on a physical phone, `EXPO_PUBLIC_API_URL` should use your computer's LAN IP address instead of `localhost`.

### 3. Install backend dependencies

```bash
cd MaiAmGiaDinh_BackEnd
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -e .
```

Create the backend `.env` file:

```bash
cp .env.example .env
```

Example configuration:

```env
DATABASE_URL=postgresql+psycopg://postgres:password@localhost:5432/maiam
SECRET_KEY=change-this-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
GEMINI_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_IOS_CLIENT_ID=
GOOGLE_ANDROID_CLIENT_ID=
ADMIN_EMAIL=admin@maiam.dev
ADMIN_PASSWORD=Admin123
ADMIN_FULL_NAME=Mai Am Admin
ADMIN_PHONE_NUMBER=0900000001
```

### 4. Run the backend

```bash
cd MaiAmGiaDinh_BackEnd
.\.venv\Scripts\Activate.ps1
fastapi dev app/main.py --host 0.0.0.0 --port 8000
```

Check the API:

```bash
curl http://localhost:8000/
```

Default Swagger UI:

```text
http://localhost:8000/docs
```

### 5. Import sample data

The backend includes CSV source files in `MaiAmGiaDinh_BackEnd/app/data`.

```bash
cd MaiAmGiaDinh_BackEnd
.\.venv\Scripts\Activate.ps1
python -m app.db.import_clean_data
```

To generate embedding data for the chatbot/RAG flow:

```bash
python -m app.seed_data
```

This command requires a valid `GEMINI_API_KEY` and may take some time because it calls the embedding API.

### 6. Run the Expo app

```bash
cd MaiAmGiaDinhViet_Expo
npm run start
```

Run directly by platform:

```bash
npm run android
npm run ios
npm run web
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run start` | Starts the Expo development server. |
| `npm run android` | Opens the app on an Android emulator or device. |
| `npm run ios` | Opens the app on an iOS simulator or device. |
| `npm run web` | Runs the Expo web build locally. |
| `npm run lint` | Runs Expo lint checks. |
| `npm run reset-project` | Resets the project to the Expo starter structure. Use only when intentionally restarting the app structure. |

## Project Structure

```text
MaiAmGiaDinhViet_Expo/
├── app/                         # Expo Router screens and layouts
│   ├── (tabs)/                  # Home, Episodes, News, Ask, Families
│   ├── family/[id].tsx          # Family detail page
│   ├── update/[id].tsx          # News/update detail page
│   ├── admin.tsx                # Admin workspace
│   ├── login.tsx                # Login screen
│   └── sign-up.tsx              # Registration screen
├── assets/images/               # Logo, icon, splash, and app imagery
├── components/                  # Shared UI components
├── constants/                   # API config and design tokens
├── data/                        # API adapters, session helpers, fallback mock data
├── MaiAmGiaDinh_BackEnd/        # FastAPI backend
│   ├── app/routers/             # API endpoints
│   ├── app/models/              # SQLModel models
│   ├── app/schemas/             # Pydantic schemas
│   ├── app/db/                  # DB session, import scripts, admin seed
│   └── app/data/                # CSV and knowledge data
├── app.json                     # Expo app configuration
├── eas.json                     # EAS build profiles
├── package.json                 # Frontend dependencies and scripts
└── README.md
```

## Main API Endpoints

| Endpoint | Purpose |
| --- | --- |
| `POST /auth/register` | Register a new account. |
| `POST /auth/login` | Log in with email and password. |
| `POST /auth/google` | Log in with a Google ID token. |
| `GET /users/me` | Fetch the current user profile. |
| `GET /episodes/` | List broadcast episodes. |
| `GET /cases/` | List support cases. |
| `GET /families/` | List family records. |
| `GET /news/` | List news updates. |
| `POST /chatbot/` | Ask the AI assistant. |
| `GET /user-actions/me` | Fetch saved user actions. |
| `GET /episode-actions/me` | Fetch saved episode actions. |

## Build and Release

The project includes EAS build profiles in `eas.json`.

```bash
npx eas build --profile development --platform android
npx eas build --profile preview --platform android
npx eas build --profile production --platform android
```

For iOS:

```bash
npx eas build --profile production --platform ios
```

Before a production build, make sure:

- `.env` points to the production API.
- Google Client IDs are configured for each target platform.
- Icon, splash screen, and package identifiers are verified.
- `SECRET_KEY`, database credentials, and signing keys are never committed.

## Quality Checks

```bash
npm run lint
```

Quick backend database check:

```bash
cd MaiAmGiaDinh_BackEnd
.\.venv\Scripts\Activate.ps1
python -m app.test_db
```

## Security Notes

- Do not commit `.env` files, tokens, production database URLs, Gemini API keys, Google client secrets, or keystores.
- Replace `SECRET_KEY` before deployment.
- Use a dedicated admin account for production.
- Restrict database permissions by environment.
- Review CORS before deploying the backend. The current configuration allows all origins for development convenience.

## Development Notes

- The app uses Expo Router file-based routing inside the `app` directory.
- Design tokens live in `constants/design.ts` and `tailwind.config.js`.
- API helpers are centralized in `constants/api.ts` and `data/backend.ts`.
- If the backend fails or has no data yet, the app falls back to local mock data in `data/mock.ts`.
- Login sessions are persisted with AsyncStorage in `data/session.ts`.

## License

This project belongs to the **Mai Am Gia Dinh Viet** development team. Please update this section with an official license before making the repository public.
