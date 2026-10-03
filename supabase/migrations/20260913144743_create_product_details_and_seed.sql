/*
# Create product_details table and seed shipping/packaging/onion data

1. New Tables
- `product_details`
  - `id` uuid primary key
  - `product_id` uuid references products(id) ON DELETE CASCADE, unique
  - `description_ar` text — full Arabic description shown on the detail page
  - `description_en` text — full English description
  - `features_ar` text[] — array of Arabic feature bullet points
  - `features_en` text[] — array of English feature bullet points
  - `uses_ar` text — Arabic text for "suitable uses" section
  - `uses_en` text — English text for "suitable uses" section
  - `detail_image_url` text — large hero image for the detail page (nullable, falls back to product image)
  - `updated_at` timestamptz

2. Security
- RLS enabled, SELECT open to anon+authenticated (public content).
- No direct writes from the client — writes go through `admin_save_product_detail` SECURITY DEFINER function.

3. Admin function
- `admin_save_product_detail(p_username, p_password, p_detail jsonb)` — upserts a product_details row after verifying admin credentials.

4. Seed data
- Seeds details for: Land Shipping, Sea Shipping, all 7 packaging types, White Onion, Red Onion.
*/

CREATE TABLE IF NOT EXISTS product_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
  description_ar text,
  description_en text,
  features_ar text[],
  features_en text[],
  uses_ar text,
  uses_en text,
  detail_image_url text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE product_details ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_product_details" ON product_details;
CREATE POLICY "anon_select_product_details"
ON product_details FOR SELECT
TO anon, authenticated USING (true);

-- Admin save function
CREATE OR REPLACE FUNCTION public.admin_save_product_detail(p_username text, p_password text, p_detail jsonb)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_product_id uuid;
BEGIN
  IF NOT public.check_admin_credentials(p_username, p_password) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  v_product_id := (p_detail->>'product_id')::uuid;

  INSERT INTO product_details (product_id, description_ar, description_en, features_ar, features_en, uses_ar, uses_en, detail_image_url, updated_at)
  VALUES (
    v_product_id,
    p_detail->>'description_ar',
    p_detail->>'description_en',
    ARRAY(SELECT jsonb_array_elements_text(p_detail->'features_ar')),
    ARRAY(SELECT jsonb_array_elements_text(p_detail->'features_en')),
    p_detail->>'uses_ar',
    p_detail->>'uses_en',
    p_detail->>'detail_image_url',
    now()
  )
  ON CONFLICT (product_id) DO UPDATE SET
    description_ar = EXCLUDED.description_ar,
    description_en = EXCLUDED.description_en,
    features_ar = EXCLUDED.features_ar,
    features_en = EXCLUDED.features_en,
    uses_ar = EXCLUDED.uses_ar,
    uses_en = EXCLUDED.uses_en,
    detail_image_url = EXCLUDED.detail_image_url,
    updated_at = now();
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_save_product_detail(text, text, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_save_product_detail(text, text, jsonb) TO anon, authenticated;

-- Seed data using a DO block with product lookups
DO $$
DECLARE
  v_land uuid;
  v_sea uuid;
  v_pack5 uuid;
  v_pack10 uuid;
  v_pack15 uuid;
  v_pack1530 uuid;
  v_jumbo uuid;
  v_crates uuid;
  v_net uuid;
  v_onion_white uuid;
  v_onion_red uuid;
BEGIN
  SELECT id INTO v_land FROM products WHERE label_en ILIKE 'Land Shipping%';
  SELECT id INTO v_sea FROM products WHERE label_en ILIKE 'Sea Shipping%';
  SELECT id INTO v_pack5 FROM products WHERE label_en = '5 kg Sacks';
  SELECT id INTO v_pack10 FROM products WHERE label_en = '10 kg Sacks';
  SELECT id INTO v_pack15 FROM products WHERE label_en = '15 kg Sacks';
  SELECT id INTO v_pack1530 FROM products WHERE label_en = '15-30 kg Sacks';
  SELECT id INTO v_jumbo FROM products WHERE label_en ILIKE 'Big Bags%';
  SELECT id INTO v_crates FROM products WHERE label_en ILIKE 'Wooden%Plastic%';
  SELECT id INTO v_net FROM products WHERE label_en = 'Net Bags';
  SELECT id INTO v_onion_white FROM products WHERE label_en = 'White Onion';
  SELECT id INTO v_onion_red FROM products WHERE label_en = 'Red Onion';

  -- Land Shipping
  IF v_land IS NOT NULL THEN
    INSERT INTO product_details (product_id, description_ar, description_en, features_ar, features_en, uses_ar, uses_en, detail_image_url)
    VALUES (v_land,
      'نوفر حلول الشحن البري المناسبة لنقل المنتجات الزراعية والكميات التجارية، مع تنظيم عمليات التحميل والنقل بما يتناسب مع طبيعة الشحنة ووجهة التسليم.',
      'We provide land shipping solutions tailored for transporting agricultural products and commercial quantities, with loading and transport operations organized to suit the nature of the shipment and delivery destination.',
      ARRAY['مناسب للشحن داخل الدول وإلى الأسواق القريبة','مناسب للخضروات والفاكهة والمنتجات الزراعية','إمكانية نقل كميات مختلفة حسب حجم الطلب','إمكانية اختيار وسيلة النقل المناسبة لحجم ووزن الشحنة','مرونة في نقاط التحميل والتسليم','مناسب للنقل من المزرعة أو المخزن إلى وجهة التسليم','تنظيم عملية تحميل وترتيب المنتجات داخل وسيلة النقل','مناسب للشحنات الصغيرة والمتوسطة والكبيرة','إمكانية استخدام التغليف المناسب حسب طبيعة المنتج','تنظيم مواعيد التحميل والشحن حسب الاتفاق مع العميل'],
      ARRAY['Suitable for domestic shipping and nearby markets','Suitable for vegetables, fruits, and agricultural products','Ability to transport various quantities based on order size','Option to choose the appropriate transport vehicle for shipment weight and size','Flexible loading and delivery points','Suitable for transport from farm or warehouse to delivery destination','Organized loading and product arrangement inside the vehicle','Suitable for small, medium, and large shipments','Option to use appropriate packaging based on product type','Loading and shipping schedules organized per client agreement'],
      'الشحن البري مناسب للنقل داخل الدولة أو إلى الدول المجاورة، ونقل المنتجات الزراعية من المزرعة أو المخزن إلى وجهة التسليم، وللشحنات الصغيرة والمتوسطة والكبيرة.',
      'Land shipping is suitable for domestic transport or to neighboring countries, moving agricultural products from farm or warehouse to delivery destination, and for small, medium, and large shipments.',
      'https://images.pexels.com/photos/9754798/pexels-photo-9754798.jpeg?auto=compress&cs=tinysrgb&w=1600')
    ON CONFLICT (product_id) DO NOTHING;
  END IF;

  -- Sea Shipping
  IF v_sea IS NOT NULL THEN
    INSERT INTO product_details (product_id, description_ar, description_en, features_ar, features_en, uses_ar, uses_en, detail_image_url)
    VALUES (v_sea,
      'نوفر حلول الشحن البحري المناسبة للكميات التجارية الكبيرة وعمليات التصدير إلى الأسواق الدولية، مع تجهيز المنتجات وترتيبها داخل الحاويات بالطريقة المناسبة لطبيعة الشحنة.',
      'We provide sea shipping solutions for large commercial quantities and export operations to international markets, with products prepared and arranged inside containers in a manner suited to the nature of the shipment.',
      ARRAY['مناسب للتصدير الدولي والمسافات الطويلة','مناسب للكميات التجارية الكبيرة','إمكانية الشحن باستخدام الحاويات','مناسب للخضروات والفاكهة والمنتجات الزراعية المعدة للتصدير','تنظيم المنتجات داخل الحاويات بطريقة مناسبة','إمكانية اختيار نوع الحاوية المناسب لطبيعة الشحنة عند الحاجة','مناسب للشحن بالجملة','تنظيم عمليات التحميل والتجهيز قبل الشحن','مناسب لعمليات الاستيراد والتصدير الدولية','يساعد على نقل الكميات الكبيرة بكفاءة أفضل'],
      ARRAY['Suitable for international export and long distances','Suitable for large commercial quantities','Containerized shipping available','Suitable for vegetables, fruits, and export-ready agricultural products','Products organized inside containers appropriately','Option to choose container type based on shipment needs','Suitable for bulk shipping','Organized loading and preparation before shipping','Suitable for international import and export operations','Helps transport large quantities more efficiently'],
      'الشحن البحري مناسب للتصدير الدولي والمسافات الطويرة والكميات التجارية الكبيرة، وعمليات الاستيراد والتصدير الدولية.',
      'Sea shipping is suitable for international export, long distances, large commercial quantities, and international import and export operations.',
      'https://images.pexels.com/photos/20581299/pexels-photo-20581299.jpeg?auto=compress&cs=tinysrgb&w=1600')
    ON CONFLICT (product_id) DO NOTHING;
  END IF;

  -- 5 kg Sacks
  IF v_pack5 IS NOT NULL THEN
    INSERT INTO product_details (product_id, description_ar, description_en, features_ar, features_en, uses_ar, uses_en, detail_image_url)
    VALUES (v_pack5,
      'شكاير بتغليف بوزن 5 كجم، مناسبة للكميات الصغيرة والتوزيع السهل، بمظهر عملي وسهل في الحمل والنقل والتخزين.',
      '5 kg packaging sacks, suitable for small quantities and easy distribution, with a practical design that is easy to carry, transport, and store.',
      ARRAY['مناسبة للكميات الصغيرة','سهلة الحمل والتداول','مناسبة للتوزيع والطلبات الصغيرة','مناسبة لعدد من المنتجات الزراعية حسب طبيعة المنتج','تساعد على سهولة الفرز والتوزيع','حجم عملي وسهل في النقل والتخزين'],
      ARRAY['Suitable for small quantities','Easy to carry and handle','Suitable for distribution and small orders','Suitable for various agricultural products based on product type','Helps with easy sorting and distribution','Practical size, easy to transport and store'],
      'مناسبة للتوزيع المحلي والطلبات الصغيرة والأسواق والمتاجر، ولتعبئة الخضروات والمنتجات الزراعية الصغيرة.',
      'Suitable for local distribution, small orders, markets and stores, and for packaging vegetables and small agricultural products.',
      'https://images.pexels.com/photos/38352190/pexels-photo-38352190.jpeg?auto=compress&cs=tinysrgb&w=1600')
    ON CONFLICT (product_id) DO NOTHING;
  END IF;

  -- 10 kg Sacks
  IF v_pack10 IS NOT NULL THEN
    INSERT INTO product_details (product_id, description_ar, description_en, features_ar, features_en, uses_ar, uses_en, detail_image_url)
    VALUES (v_pack10,
      'شكاير بتغليف بوزن 10 كجم، مناسبة للطلبات الصغيرة والمتوسطة، تجمع بين السعة العملية وسهولة الحمل والنقل.',
      '10 kg packaging sacks, suitable for small to medium orders, combining practical capacity with easy carrying and transport.',
      ARRAY['مناسبة للطلبات الصغيرة والمتوسطة','سهلة الحمل والنقل','مناسبة للأسواق والمتاجر','تساعد على تنظيم المنتجات أثناء النقل','سهلة الترصيص والتخزين','يمكن استخدامها لعدد من أنواع الخضروات والمنتجات الزراعية'],
      ARRAY['Suitable for small to medium orders','Easy to carry and transport','Suitable for markets and stores','Helps organize products during transport','Easy to stack and store','Can be used for various vegetables and agricultural products'],
      'مناسبة للأسواق والمتاجر والطلبات الصغيرة والمتوسطة، ولتعبئة الخضروات والمنتجات الزراعية المختلفة.',
      'Suitable for markets, stores, small to medium orders, and for packaging various vegetables and agricultural products.',
      'https://images.pexels.com/photos/21958122/pexels-photo-21958122.jpeg?auto=compress&cs=tinysrgb&w=1600')
    ON CONFLICT (product_id) DO NOTHING;
  END IF;

  -- 15 kg Sacks
  IF v_pack15 IS NOT NULL THEN
    INSERT INTO product_details (product_id, description_ar, description_en, features_ar, features_en, uses_ar, uses_en, detail_image_url)
    VALUES (v_pack15,
      'شكاير بتغليف بوزن 15 كجم، مناسبة للتوريد التجاري، توفر سعة جيدة مع سهولة التداول والنقل.',
      '15 kg packaging sacks, suitable for commercial supply, offering good capacity with easy handling and transport.',
      ARRAY['مناسبة للتوريد التجاري','توفر سعة جيدة مع سهولة التداول','مناسبة للشحن الداخلي والتصدير','تساعد على تنظيم الكميات أثناء النقل','مناسبة لمجموعة من المنتجات الزراعية','يمكن استخدامها حسب متطلبات العميل وطبيعة المنتج'],
      ARRAY['Suitable for commercial supply','Good capacity with easy handling','Suitable for domestic shipping and export','Helps organize quantities during transport','Suitable for a range of agricultural products','Can be used based on client requirements and product type'],
      'مناسبة للتوريد التجاري والشحن الداخلي والتصدير، ولتعبئة الخضروات والمنتجات الزراعية بمقاسات متوسطة.',
      'Suitable for commercial supply, domestic shipping and export, and for packaging vegetables and agricultural products in medium sizes.',
      'https://images.pexels.com/photos/10778111/pexels-photo-10778111.jpeg?auto=compress&cs=tinysrgb&w=1600')
    ON CONFLICT (product_id) DO NOTHING;
  END IF;

  -- 15-30 kg Sacks
  IF v_pack1530 IS NOT NULL THEN
    INSERT INTO product_details (product_id, description_ar, description_en, features_ar, features_en, uses_ar, uses_en, detail_image_url)
    VALUES (v_pack1530,
      'شكاير بتغليف بوزن من 15 إلى 30 كجم، مناسبة للكميات التجارية الأكبر، مع إمكانية اختيار الوزن المناسب حسب طلب العميل.',
      '15-30 kg adjustable packaging sacks, suitable for larger commercial quantities, with the option to choose the appropriate weight per client request.',
      ARRAY['مناسبة للكميات التجارية الأكبر','إمكانية اختيار الوزن المناسب حسب طلب العميل','مناسبة للشحن والتخزين','مناسبة خصوصًا للبطاطس والبصل ومنتجات مشابهة','تقلل عدد العبوات المستخدمة في الكميات الكبيرة','مناسبة للتحميل داخل الشاحنات والحاويات'],
      ARRAY['Suitable for larger commercial quantities','Option to choose weight per client request','Suitable for shipping and storage','Especially suitable for potatoes, onions, and similar products','Reduces the number of packages for large quantities','Suitable for loading inside trucks and containers'],
      'مناسبة خصوصًا للبطاطس والبصل والمنتجات المشابهة، وللشحنات التجارية المتوسطة والكبيرة داخل الشاحنات والحاويات.',
      'Especially suitable for potatoes, onions, and similar products, and for medium to large commercial shipments inside trucks and containers.',
      'https://images.pexels.com/photos/21958122/pexels-photo-21958122.jpeg?auto=compress&cs=tinysrgb&w=1600')
    ON CONFLICT (product_id) DO NOTHING;
  END IF;

  -- Jumbo Bags
  IF v_jumbo IS NOT NULL THEN
    INSERT INTO product_details (product_id, description_ar, description_en, features_ar, features_en, uses_ar, uses_en, detail_image_url)
    VALUES (v_jumbo,
      'جامبوهات بتغليف بوزن 1 إلى 1.5 طن، مخصصة للتجارة والشحن بالجملة، مناسبة خصوصًا للبطاطس والبصل والكميات التجارية الكبيرة.',
      '1 to 1.5 ton jumbo bags, designed for wholesale trade and shipping, especially suitable for potatoes, onions, and large commercial quantities.',
      ARRAY['مناسبة للكميات الكبيرة جدًا','مخصصة للتجارة والشحن بالجملة','مناسبة خصوصًا للبطاطس والبصل','مناسبة للمخازن والحاويات','تساعد على التعامل مع الكميات التجارية الكبيرة','يمكن تحميلها وتفريغها باستخدام معدات الرفع المناسبة','تقلل عدد وحدات التعبئة المستخدمة في الشحنات الكبيرة'],
      ARRAY['Suitable for very large quantities','Designed for wholesale trade and shipping','Especially suitable for potatoes and onions','Suitable for warehouses and containers','Helps handle large commercial quantities','Can be loaded and unloaded using appropriate lifting equipment','Reduces the number of packaging units in large shipments'],
      'مناسبة خصوصًا للبطاطس والبصل، وللمخازن والحاويات، وللشحنات التجارية الكبيرة جدًا.',
      'Especially suitable for potatoes and onions, warehouses and containers, and for very large commercial shipments.',
      'https://images.pexels.com/photos/21958122/pexels-photo-21958122.jpeg?auto=compress&cs=tinysrgb&w=1600')
    ON CONFLICT (product_id) DO NOTHING;
  END IF;

  -- Crates
  IF v_crates IS NOT NULL THEN
    INSERT INTO product_details (product_id, description_ar, description_en, features_ar, features_en, uses_ar, uses_en, detail_image_url)
    VALUES (v_crates,
      'صناديق خشبية أو بلاستيك للتغليف، مناسبة للفاكهة والمنتجات التي تحتاج حماية أكبر أثناء التداول والنقل.',
      'Wooden or plastic crates for packaging, suitable for fruits and products that need extra protection during handling and transport.',
      ARRAY['مناسبة للفاكهة والمنتجات التي تحتاج حماية أكبر','تساعد على حماية المنتج أثناء التداول والنقل','تقلل الضغط المباشر على المنتجات','سهلة الترصيص داخل وسائل النقل والحاويات','مناسبة للتوريد المحلي والتصدير','يمكن استخدامها حسب نوع المنتج واحتياجات العميل'],
      ARRAY['Suitable for fruits and products needing extra protection','Helps protect products during handling and transport','Reduces direct pressure on products','Easy to stack inside transport vehicles and containers','Suitable for local supply and export','Can be used based on product type and client needs'],
      'مناسبة للفاكهة والمنتجات التي تحتاج حماية أكبر، وللتوريد المحلي والتصدير، وللترصيص داخل وسائل النقل والحاويات.',
      'Suitable for fruits and products needing extra protection, local supply and export, and for stacking inside transport vehicles and containers.',
      'https://images.pexels.com/photos/38352190/pexels-photo-38352190.jpeg?auto=compress&cs=tinysrgb&w=1600')
    ON CONFLICT (product_id) DO NOTHING;
  END IF;

  -- Net Bags
  IF v_net IS NOT NULL THEN
    INSERT INTO product_details (product_id, description_ar, description_en, features_ar, features_en, uses_ar, uses_en, detail_image_url)
    VALUES (v_net,
      'أكياس شبكية للتغليف، تسمح بمرور الهواء حول المنتجات، مناسبة للبصل والبطاطس ومنتجات مشابهة، خفيفة وسهلة الحمل والتداول.',
      'Net bags for packaging, allowing air circulation around products, suitable for onions, potatoes, and similar products, lightweight and easy to carry and handle.',
      ARRAY['تسمح بمرور الهواء حول المنتجات','مناسبة للبصل والبطاطس ومنتجات مشابهة','تساعد على رؤية المنتج من الخارج','خفيفة وسهلة الحمل والتداول','مناسبة للتعبئة والنقل والتوزيع','عملية للاستخدام في الشحنات التجارية'],
      ARRAY['Allows air circulation around products','Suitable for onions, potatoes, and similar products','Allows product visibility from outside','Lightweight, easy to carry and handle','Suitable for packaging, transport, and distribution','Practical for use in commercial shipments'],
      'مناسبة للبصل والبطاطس والمنتجات المشابهة، وللتعبئة والنقل والتوزيع والشحنات التجارية.',
      'Suitable for onions, potatoes, and similar products, and for packaging, transport, distribution, and commercial shipments.',
      'https://images.pexels.com/photos/10778111/pexels-photo-10778111.jpeg?auto=compress&cs=tinysrgb&w=1600')
    ON CONFLICT (product_id) DO NOTHING;
  END IF;

  -- White Onion
  IF v_onion_white IS NOT NULL THEN
    INSERT INTO product_details (product_id, description_ar, description_en, features_ar, features_en, uses_ar, uses_en, detail_image_url)
    VALUES (v_onion_white,
      'البصل الأبيض من المنتجات الزراعية المميزة بلونه الفاتح ومظهره النظيف، ويستخدم في العديد من أنواع الطعام والأسواق المختلفة.',
      'White onion is a distinctive agricultural product known for its light color and clean appearance, used in many types of cuisine and various markets.',
      ARRAY['يتميز بلونه الأبيض ومظهره الجذاب','يستخدم في الطهي والسلطات والعديد من الأطعمة','مناسب للأسواق المحلية والتصدير','يمكن فرزه حسب الحجم والجودة وفقًا لمتطلبات العميل','يمكن تجهيزه في أوزان وتعبئات مختلفة','يتم الاهتمام بالشكل الخارجي وجودة المنتج أثناء التجهيز','مناسب للتعبئة في الشكاير أو الأكياس الشبكية حسب الطلب','يمكن تجهيزه للشحن البري أو البحري حسب وجهة العميل'],
      ARRAY['Characterized by white color and attractive appearance','Used in cooking, salads, and many dishes','Suitable for local markets and export','Can be sorted by size and quality per client requirements','Available in various weights and packaging options','External appearance and product quality carefully maintained during preparation','Suitable for packaging in sacks or net bags per request','Can be prepared for land or sea shipping per client destination'],
      'مناسب للأسواق المحلية والتصدير، وللتعبئة في الشكاير أو الأكياس الشبكية، وللشحن البري أو البحري.',
      'Suitable for local markets and export, packaging in sacks or net bags, and land or sea shipping.',
      'https://images.pexels.com/photos/32986487/pexels-photo-32986487.jpeg?auto=compress&cs=tinysrgb&w=1600')
    ON CONFLICT (product_id) DO NOTHING;
  END IF;

  -- Red Onion
  IF v_onion_red IS NOT NULL THEN
    INSERT INTO product_details (product_id, description_ar, description_en, features_ar, features_en, uses_ar, uses_en, detail_image_url)
    VALUES (v_onion_red,
      'البصل الأحمر يتميز بلونه الأحمر أو الأرجواني المميز، ويعد من المنتجات المطلوبة في العديد من الأسواق للاستخدام المنزلي والتجاري.',
      'Red onion is characterized by its distinctive red or purple color, and is a popular product in many markets for both household and commercial use.',
      ARRAY['لون أحمر أو أرجواني مميز','مظهر جذاب ومناسب للعرض التجاري','يستخدم في السلطات والطهي والمطاعم','مناسب للأسواق المحلية والتصدير','يمكن فرزه حسب الأحجام والجودة المطلوبة','متاح بخيارات تعبئة مختلفة حسب طلب العميل','مناسب للشكاير والأكياس الشبكية وطرق التغليف المناسبة','يمكن تجهيزه للشحن البري أو البحري حسب متطلبات الطلب'],
      ARRAY['Distinctive red or purple color','Attractive appearance suitable for commercial display','Used in salads, cooking, and restaurants','Suitable for local markets and export','Can be sorted by size and quality as required','Available with various packaging options per client request','Suitable for sacks, net bags, and appropriate packaging methods','Can be prepared for land or sea shipping per order requirements'],
      'مناسب للأسواق المحلية والتصدير، وللاستخدام المنزلي والتجاري والمطاعم، وللتعبئة في الشكاير أو الأكياس الشبكية.',
      'Suitable for local markets and export, household and commercial use and restaurants, and packaging in sacks or net bags.',
      'https://images.pexels.com/photos/10159434/pexels-photo-10159434.jpeg?auto=compress&cs=tinysrgb&w=1600')
    ON CONFLICT (product_id) DO NOTHING;
  END IF;
END $$;
