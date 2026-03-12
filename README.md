# E-commerce REST API Monorepo

Project structure:

```text
.
├── client/   # React + Vite frontend
└── server/   # Node.js + Express + PostgreSQL backend
```

## Run Commands

From repository root:

- `npm run dev:client`
- `npm run build:client`
- `npm run dev:server`
- `npm run start:server`

Direct package commands:

- `cd client && npm run dev`
- `cd server && npm run dev`

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
| GET | `/api/orders` | Restituisce gli ordini dell'utente autenticato | Yes (session cookie) |
| GET | `/api/orders/:orderId` | Restituisce un ordine dell'utente con i relativi items | Yes (session cookie) |
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

### Orders routes examples (Postman)

`GET /api/orders`
- No JSON body.
- Requires authenticated session cookie (`connect.sid`) from `POST /api/login`.

Example response `200`:
```json
{
  "orders": [
    {
      "id": 2,
      "user_id": 1,
      "status": "pending",
      "total_amount": "178.90",
      "created_at": "2026-03-12T13:20:00.000Z"
    },
    {
      "id": 1,
      "user_id": 1,
      "status": "paid",
      "total_amount": "59.00",
      "created_at": "2026-03-11T10:00:00.000Z"
    }
  ]
}
```

`GET /api/orders/:orderId`
- No JSON body.
- Requires authenticated session cookie (`connect.sid`) from `POST /api/login`.

Example request:
- `GET /api/orders/2`

Example response `200`:
```json
{
  "order": {
    "id": 2,
    "user_id": 1,
    "status": "pending",
    "total_amount": "178.90",
    "created_at": "2026-03-12T13:20:00.000Z"
  },
  "items": [
    {
      "id": 3,
      "order_id": 2,
      "product_id": 1,
      "quantity": 2,
      "price_at_purchase": "49.90"
    },
    {
      "id": 4,
      "order_id": 2,
      "product_id": 4,
      "quantity": 1,
      "price_at_purchase": "79.10"
    }
  ]
}
```

Common order errors:
```json
{ "message": "invalid request context" }
```
```json
{ "message": "invalid order id" }
```
```json
{ "message": "order not found" }
```
