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
| GET | `/api/products` | Restituisce tutti i prodotti | No |
| GET | `/api/products/:productId` | Restituisce un prodotto per id | No |
| GET | `/api/cart/:cartId` | Restituisce un carrello per id | No |
| POST | `/api/cart` | Crea un nuovo carrello (`user_id`, `status` opzionale) | No |
| PUT | `/api/cart/:cartId` | Aggiorna un carrello (`user_id`, `status`) | No |
| DELETE | `/api/cart/:cartId` | Elimina un carrello | No |
| POST | `/api/checkout` | Esegue checkout del carrello attivo dell'utente autenticato | Yes (session cookie) |
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

### Product routes examples (Postman)

`GET /api/products`
- No JSON body.

Example response `200`:
```json
{
  "products": [
    {
      "id": 1,
      "name": "Luna Lamp",
      "description": "Compact table lamp with warm light and minimal design.",
      "price": "49.90",
      "stock": 30,
      "created_at": "2026-03-12T11:30:31.450Z"
    }
  ]
}
```

`GET /api/products/:productId`
- No JSON body.

Example request:
- `GET /api/products/1`

Example response `200`:
```json
{
  "product": {
    "id": 1,
    "name": "Luna Lamp",
    "description": "Compact table lamp with warm light and minimal design.",
    "price": "49.90",
    "stock": 30,
    "created_at": "2026-03-12T11:30:31.450Z"
  }
}
```

Example response `400` (invalid id):
```json
{
  "message": "invalid product id"
}
```

Example response `404` (not found):
```json
{
  "message": "product not found"
}
```

### Cart routes examples (Postman)

`POST /api/cart`
```json
{
  "user_id": 1,
  "status": "active"
}
```

Notes:
- `status` is optional on create. If omitted, default is `active`.
- allowed status values: `active`, `checked_out`, `abandoned`.

Example response `201`:
```json
{
  "cart": {
    "id": 1,
    "user_id": 1,
    "status": "active",
    "created_at": "2026-03-12T12:00:00.000Z"
  }
}
```

`GET /api/cart/:cartId`
- No JSON body.

Example request:
- `GET /api/cart/1`

Example response `200`:
```json
{
  "cart": {
    "id": 1,
    "user_id": 1,
    "status": "active",
    "created_at": "2026-03-12T12:00:00.000Z"
  }
}
```

`PUT /api/cart/:cartId`
```json
{
  "user_id": 1,
  "status": "checked_out"
}
```

Example response `200`:
```json
{
  "cart": {
    "id": 1,
    "user_id": 1,
    "status": "checked_out",
    "created_at": "2026-03-12T12:00:00.000Z"
  }
}
```

`DELETE /api/cart/:cartId`
- No JSON body.

Example response `200`:
```json
{
  "message": "cart deleted",
  "cart": {
    "id": 1,
    "user_id": 1,
    "status": "checked_out",
    "created_at": "2026-03-12T12:00:00.000Z"
  }
}
```

Common cart errors:
```json
{ "message": "invalid cart id" }
```
```json
{ "message": "cart not found" }
```
```json
{ "message": "user_id is required and must be a positive integer" }
```
```json
{ "message": "status must be one of: active, checked_out, abandoned" }
```

### Checkout route example (Postman)

`POST /api/checkout`
- No JSON body.
- Requires authenticated session cookie (`connect.sid`) from `POST /api/login`.
- Uses the authenticated user context (`req.user.id`) and checks out the user active cart.

Example response `200`:
```json
{
  "order": {
    "id": 1,
    "user_id": 1,
    "status": "pending",
    "total_amount": "178.90",
    "created_at": "2026-03-12T13:00:00.000Z"
  },
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "price_at_purchase": "49.90"
    },
    {
      "product_id": 4,
      "quantity": 1,
      "price_at_purchase": "79.10"
    }
  ],
  "cart": {
    "id": 3,
    "status": "checked_out"
  }
}
```

Common checkout errors:
```json
{ "message": "invalid request context" }
```
```json
{ "message": "cart not found" }
```
```json
{ "message": "cart is empty" }
```
```json
{ "message": "insufficient stock for product 2" }
```
