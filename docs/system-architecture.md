# System Architecture

```mermaid
flowchart LR
  %% =========================
  %% Client Layer
  %% =========================
  subgraph Client["Client Layer"]
    User["End User"]
    Admin["Admin User"]

    subgraph MobileApp["Expo React Native App"]
      Router["Expo Router<br/>File-based Navigation"]
      Screens["Screens<br/>Home, Episodes, News, Families, Ask, Admin"]
      UI["UI Layer<br/>NativeWind, Shared Components, Be Vietnam Pro"]
      Session["Local Session<br/>AsyncStorage"]
      ApiClient["API Client<br/>constants/api.ts, data/backend.ts"]
      Fallback["Fallback Data<br/>data/mock.ts"]
    end
  end

  %% =========================
  %% External Identity
  %% =========================
  subgraph Identity["Identity Providers"]
    GoogleSignIn["Google Sign-In"]
  end

  %% =========================
  %% Backend Layer
  %% =========================
  subgraph Backend["Backend API Layer"]
    FastAPI["FastAPI Application<br/>app/main.py"]
    AuthRouter["Auth Router<br/>Register, Login, Google Auth"]
    UserRouter["Users Router<br/>Profile, Admin Role Management"]
    ContentRouters["Content Routers<br/>Episodes, Cases, Families, News"]
    ActionRouters["User Action Routers<br/>Saved Families, Saved Episodes"]
    ChatbotRouter["Chatbot Router<br/>Ask & Find"]
    JWT["JWT Auth<br/>Bearer Tokens"]
  end

  %% =========================
  %% Data Layer
  %% =========================
  subgraph Data["Data Layer"]
    Postgres["PostgreSQL Database"]
    Tables["SQLModel Tables<br/>Users, Episodes, Cases, Families, News, Actions, Documents"]
    CSV["CSV Source Data<br/>all_cases, all_episodes, all_news"]
    Importer["Import Scripts<br/>import_clean_data.py"]
    SeedAdmin["Admin Seed<br/>seed_admin.py"]
  end

  %% =========================
  %% AI Layer
  %% =========================
  subgraph AI["AI & Search Layer"]
    Gemini["Google Gemini API"]
    Embeddings["Embedding Pipeline<br/>seed_data.py"]
    Documents["Document Chunks<br/>General Info, Cases, Episodes, News"]
  end

  %% =========================
  %% Build/Release
  %% =========================
  subgraph Delivery["Build & Delivery"]
    ExpoDev["Expo Dev Server"]
    EAS["EAS Build<br/>development, preview, production"]
    Android["Android App"]
    IOS["iOS App"]
    Web["Expo Web"]
  end

  %% Client flows
  User --> MobileApp
  Admin --> MobileApp
  Router --> Screens
  Screens --> UI
  Screens --> Session
  Screens --> ApiClient
  ApiClient -. "uses fallback when API fails" .-> Fallback

  %% Auth flows
  Screens --> GoogleSignIn
  GoogleSignIn --> AuthRouter
  ApiClient -->|"HTTPS / REST JSON"| FastAPI
  FastAPI --> AuthRouter
  FastAPI --> UserRouter
  FastAPI --> ContentRouters
  FastAPI --> ActionRouters
  FastAPI --> ChatbotRouter
  AuthRouter --> JWT
  UserRouter --> JWT
  ActionRouters --> JWT

  %% Data flows
  AuthRouter --> Postgres
  UserRouter --> Postgres
  ContentRouters --> Postgres
  ActionRouters --> Postgres
  Postgres --> Tables
  CSV --> Importer
  Importer --> Postgres
  SeedAdmin --> Postgres

  %% AI/RAG flows
  CSV --> Documents
  Documents --> Embeddings
  Embeddings --> Gemini
  Embeddings --> Postgres
  ChatbotRouter --> Postgres
  ChatbotRouter --> Gemini
  Gemini --> ChatbotRouter

  %% Delivery flows
  MobileApp --> ExpoDev
  MobileApp --> EAS
  EAS --> Android
  EAS --> IOS
  ExpoDev --> Web

  %% Styling
  classDef client fill:#FAF7F2,stroke:#8B1D1D,stroke-width:1px,color:#261F1A;
  classDef backend fill:#E6F4FE,stroke:#2563EB,stroke-width:1px,color:#111827;
  classDef data fill:#ECFDF5,stroke:#1F8B4C,stroke-width:1px,color:#064E3B;
  classDef ai fill:#FFF7ED,stroke:#D6A84A,stroke-width:1px,color:#7C2D12;
  classDef delivery fill:#F5F3FF,stroke:#7C3AED,stroke-width:1px,color:#2E1065;

  class User,Admin,Router,Screens,UI,Session,ApiClient,Fallback,GoogleSignIn client;
  class FastAPI,AuthRouter,UserRouter,ContentRouters,ActionRouters,ChatbotRouter,JWT backend;
  class Postgres,Tables,CSV,Importer,SeedAdmin data;
  class Gemini,Embeddings,Documents ai;
  class ExpoDev,EAS,Android,IOS,Web delivery;
```

## Architecture Summary

The application is organized into five main layers:

| Layer | Responsibility |
| --- | --- |
| Client Layer | Mobile UI, navigation, local session persistence, API calls, and fallback data. |
| Backend API Layer | Authentication, role-based access, content APIs, user actions, and chatbot endpoint. |
| Data Layer | PostgreSQL persistence, SQLModel tables, CSV import scripts, and admin seed data. |
| AI & Search Layer | Gemini-powered assistant, embeddings, document chunks, and RAG-style retrieval. |
| Build & Delivery | Expo development workflow and EAS build profiles for Android, iOS, and web. |

## Key Request Flows

### Login Flow

```mermaid
sequenceDiagram
  participant U as User
  participant App as Expo App
  participant API as FastAPI
  participant DB as PostgreSQL
  participant G as Google Sign-In

  U->>App: Enter credentials or choose Google
  alt Email/password
    App->>API: POST /auth/login
    API->>DB: Validate user credentials
    DB-->>API: User record
  else Google Sign-In
    App->>G: Request Google ID token
    G-->>App: ID token
    App->>API: POST /auth/google
    API->>G: Verify token
    API->>DB: Find or create user
  end
  API-->>App: JWT access token
  App->>App: Save session in AsyncStorage
```

### Ask & Find Flow

```mermaid
sequenceDiagram
  participant U as User
  participant App as Ask & Find Screen
  participant API as Chatbot Router
  participant DB as PostgreSQL Documents
  participant Gemini as Gemini API

  U->>App: Ask a question
  App->>API: POST /chatbot/
  API->>DB: Retrieve relevant content chunks
  API->>Gemini: Generate answer with retrieved context
  Gemini-->>API: Assistant response
  API-->>App: Reply and context metadata
  App-->>U: Display answer
```
