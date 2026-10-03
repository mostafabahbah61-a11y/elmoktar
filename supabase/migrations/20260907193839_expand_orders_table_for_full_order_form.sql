/*
# Expand orders table for full order form

1. Modified Tables
- `orders`
  - Add `whatsapp` (text) — WhatsApp number
  - Add `company_name` (text) — optional company name
  - Add `country` (text) — customer's country
  - Add `product_variety` (text) — specific variety of the product
  - Add `weight` (text) — requested weight
  - Add `destination_country` (text) — shipping destination country
  - Make `user_id` nullable so non-authenticated users can submit orders
  - Make `product_category` and `product_name` nullable for flexibility

2. Security
- Add anon INSERT policy so non-authenticated users can submit orders
- Keep existing authenticated policies for owner-scoped access
*/

ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE orders ALTER COLUMN product_category DROP NOT NULL;
ALTER TABLE orders ALTER COLUMN product_name DROP NOT NULL;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'whatsapp') THEN
    ALTER TABLE orders ADD COLUMN whatsapp text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'company_name') THEN
    ALTER TABLE orders ADD COLUMN company_name text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'country') THEN
    ALTER TABLE orders ADD COLUMN country text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'product_variety') THEN
    ALTER TABLE orders ADD COLUMN product_variety text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'weight') THEN
    ALTER TABLE orders ADD COLUMN weight text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'destination_country') THEN
    ALTER TABLE orders ADD COLUMN destination_country text;
  END IF;
END $$;

-- Allow anon to insert orders (for non-authenticated users)
DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
CREATE POLICY "anon_insert_orders" ON orders
  FOR INSERT TO anon, authenticated WITH CHECK (true);
