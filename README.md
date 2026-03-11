# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is currently not compatible with SWC. See [this issue](https://github.com/vitejs/vite-plugin-react/issues/428) for tracking the progress.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## API Routes (server)

Backend base URL: `http://localhost:3001`

| Method | Path | Description | Auth required |
| --- | --- | --- | --- |
| GET | `/api/health` | Health check API | No |
| POST | `/api/register` | Registrazione utente (`username`, `email`, `password`) | No |
| POST | `/api/login` | Login con `identifier` (username/email) + `password` | No |
| POST | `/api/logout` | Logout e distruzione sessione | Yes (session cookie) |
| GET | `/api/me` | Restituisce utente autenticato corrente | Yes (session cookie) |
| GET | `/api/error-test` | Endpoint di test per error handler | No |

### Example payloads (Postman)

Headers for JSON requests:
- `Content-Type: application/json`

`POST /api/register`
```json
{
  "username": "mario",
  "email": "mario@example.com",
  "password": "Password123"
}
```

`POST /api/login`
```json
{
  "identifier": "mario@example.com",
  "password": "Password123"
}
```

`GET /api/me`
- No JSON body.
- Requires session cookie returned by login (`connect.sid`).

`POST /api/logout`
- No JSON body.
- Requires session cookie returned by login (`connect.sid`).
