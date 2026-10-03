/*
# Create orders table for Al-Mokhtar Import & Export

1. New Tables
- `orders`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users, defaults to authenticated user)
  - `customer_name` (text, not null) — full name of the customer
  - `customer_phone` (text, not null) — phone number
  - `customer_email` (text) — optional email
  - `product_category` (text, not null) — Vegetables / Fruits / Packaging / Shipping
  - `product_name` (text, not null) — specific product name (e.g. "White Onion")
  - `quantity` (text, not null) — quantity requested
  - `packaging` (text) — packaging size if applicable
  - `shipping_type` (text) — sea / land if applicable
  - `notes` (text) — any additional details
  - `status` (text, default 'pending') — order status
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `orders`.
- Owner-scoped CRUD: each authenticated user can only access their own orders.
- user_id defaults to auth.uid() so inserts without explicit user_id succeed.
*/

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text,
  product_category text NOT NULL,
  product_name text NOT NULL,
  quantity text NOT NULL,
  packaging text,
  shipping_type text,
  notes text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_orders" ON orders;
CREATE POLICY "select_own_orders" ON orders FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_orders" ON orders;
CREATE POLICY "insert_own_orders" ON orders
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_orders" ON orders;
CREATE POLICY "update_own_orders" ON orders FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_orders" ON orders;
CREATE POLICY "delete_own_orders" ON orders FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders(user_id);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders(created_at DESC);
