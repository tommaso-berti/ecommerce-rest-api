-- Drop tables if they exist (useful during development)

DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS carts;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;

-- USERS

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- PRODUCTS

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CARTS

CREATE TABLE carts (
   id SERIAL PRIMARY KEY,
   user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
   status VARCHAR(20) NOT NULL DEFAULT 'active'
       CHECK (status IN ('active','checked_out','abandoned')),
   created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CART ITEMS

CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    cart_id INT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0),
    CONSTRAINT unique_cart_product UNIQUE (cart_id, product_id)
);

-- ORDERS

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending','paid','shipped','cancelled')),
    total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ORDER ITEMS

CREATE TABLE order_items (
     id SERIAL PRIMARY KEY,
     order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
     product_id INT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
     quantity INT NOT NULL CHECK (quantity > 0),
     price_at_purchase NUMERIC(10,2) NOT NULL CHECK (price_at_purchase >= 0),
     CONSTRAINT unique_order_product UNIQUE (order_id, product_id)
);

-- INDEXES

CREATE INDEX idx_carts_user_id ON carts(user_id);
CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Only one active cart per user

CREATE UNIQUE INDEX unique_active_cart_per_user
    ON carts(user_id)
    WHERE status = 'active';