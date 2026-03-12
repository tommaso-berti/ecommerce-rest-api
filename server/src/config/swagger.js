import path from 'node:path'
import { fileURLToPath } from 'node:url'
import swaggerJSDoc from 'swagger-jsdoc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'E-commerce REST API',
      version: '1.0.0',
      description: 'Swagger documentation for the e-commerce backend API.',
    },
    servers: [
      {
        url: 'http://localhost:3001',
      },
    ],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Users', description: 'Current authenticated user endpoints' },
      { name: 'Products', description: 'Product catalog endpoints' },
      { name: 'Cart', description: 'Cart management endpoints' },
      { name: 'Checkout', description: 'Checkout business action endpoint' },
      { name: 'Orders', description: 'Order read endpoints' },
      { name: 'System', description: 'System and health endpoints' },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'connect.sid',
        },
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'invalid request context' },
          },
          required: ['message'],
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            username: { type: 'string', example: 'mario' },
            email: { type: 'string', format: 'email', example: 'mario@example.com' },
            created_at: { type: 'string', format: 'date-time' },
          },
          required: ['id', 'username', 'email', 'created_at'],
        },
        AuthRegisterRequest: {
          type: 'object',
          properties: {
            username: { type: 'string', example: 'mario' },
            email: { type: 'string', format: 'email', example: 'mario@example.com' },
            password: { type: 'string', example: 'Password123' },
          },
          required: ['username', 'email', 'password'],
        },
        AuthLoginRequest: {
          type: 'object',
          properties: {
            identifier: { type: 'string', example: 'mario@example.com' },
            password: { type: 'string', example: 'Password123' },
          },
          required: ['identifier', 'password'],
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Luna Lamp' },
            description: { type: 'string', example: 'Compact table lamp with warm light and minimal design.' },
            price: { type: 'string', example: '49.90' },
            stock: { type: 'integer', example: 30 },
            created_at: { type: 'string', format: 'date-time' },
          },
          required: ['id', 'name', 'price', 'stock', 'created_at'],
        },
        Cart: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            user_id: { type: 'integer', example: 1 },
            status: { type: 'string', enum: ['active', 'checked_out', 'abandoned'], example: 'active' },
            created_at: { type: 'string', format: 'date-time' },
          },
          required: ['id', 'user_id', 'status', 'created_at'],
        },
        CartCreateRequest: {
          type: 'object',
          properties: {
            user_id: { type: 'integer', example: 1 },
            status: { type: 'string', enum: ['active', 'checked_out', 'abandoned'], example: 'active' },
          },
          required: ['user_id'],
        },
        CartUpdateRequest: {
          type: 'object',
          properties: {
            user_id: { type: 'integer', example: 1 },
            status: { type: 'string', enum: ['active', 'checked_out', 'abandoned'], example: 'checked_out' },
          },
          required: ['user_id', 'status'],
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            user_id: { type: 'integer', example: 1 },
            status: { type: 'string', enum: ['pending', 'paid', 'shipped', 'cancelled'], example: 'pending' },
            total_amount: { type: 'string', example: '178.90' },
            created_at: { type: 'string', format: 'date-time' },
          },
          required: ['id', 'user_id', 'status', 'total_amount', 'created_at'],
        },
        OrderItem: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            order_id: { type: 'integer', example: 1 },
            product_id: { type: 'integer', example: 1 },
            quantity: { type: 'integer', example: 2 },
            price_at_purchase: { type: 'string', example: '49.90' },
          },
          required: ['id', 'order_id', 'product_id', 'quantity', 'price_at_purchase'],
        },
        CheckoutResponse: {
          type: 'object',
          properties: {
            order: { $ref: '#/components/schemas/Order' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  product_id: { type: 'integer', example: 1 },
                  quantity: { type: 'integer', example: 2 },
                  price_at_purchase: { type: 'string', example: '49.90' },
                },
                required: ['product_id', 'quantity', 'price_at_purchase'],
              },
            },
            cart: {
              type: 'object',
              properties: {
                id: { type: 'integer', example: 3 },
                status: { type: 'string', example: 'checked_out' },
              },
              required: ['id', 'status'],
            },
          },
          required: ['order', 'items', 'cart'],
        },
      },
    },
  },
  apis: [path.resolve(__dirname, '../routes/*.routes.js')],
}

const swaggerSpec = swaggerJSDoc(options)

export default swaggerSpec
