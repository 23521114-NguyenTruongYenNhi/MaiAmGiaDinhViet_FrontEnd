# Simple System Architecture

This simplified diagram focuses only on the main technologies used in the system.

![Simple System Architecture](./system-architecture-simple.svg)

## Main Technology Flow

```text
Expo React Native App -> FastAPI Backend -> PostgreSQL
                         |                 |
                         |                 -> CSV import data
                         -> Google Gemini
                         -> Google Sign-In
Expo/EAS -> Android + iOS builds
```
