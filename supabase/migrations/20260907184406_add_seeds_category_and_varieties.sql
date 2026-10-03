/*
# Add Seeds category and seed varieties

## Purpose
Adds a new "Seeds" product under a new "Seeds" category, plus 7 seed varieties
(Scottish, Dutch, French, German, Danish, Irish, Italian & Cypriot) to the
product_varieties table.

## Changes
1. Inserts a new product row "Seeds" into the products table with category "Seeds".
2. Inserts 7 seed variety rows into product_varieties table.
3. No schema changes — uses existing products and product_varieties tables.

## Security
- No new tables. Existing RLS policies on products and product_varieties
  (anon read access) cover the new rows automatically.
*/

-- Add "Seeds" as a new product in the products table
INSERT INTO products (category, label_en, label_ar, detail_en, detail_ar, image_url, display_order)
VALUES (
  'Seeds',
  'Seeds',
  'تقاوي',
  'Premium imported seeds from renowned European origins — Scotland, Netherlands, France, Germany, Denmark, Ireland, and Italy/Cyprus.',
  'تقاوي مستوردة فاخرة من مصادر أوروبية معروفة — اسكتلندا، هولندا، فرنسا، ألمانيا، الدنمارك، أيرلندا، وإيطاليا/قبرص.',
  'https://images.pexels.com/photos/15182672/pexels-photo-15182672.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  100
)
ON CONFLICT DO NOTHING;

-- Add 7 seed varieties to product_varieties
INSERT INTO product_varieties (product_id, category, label_en, label_ar, detail_en, detail_ar, image_url, display_order) VALUES
('Seeds', 'Seeds', 'Scottish Seeds', 'التقاوي الاسكتلندية',
'High-quality seeds sourced from Scotland, known for their cold-climate resilience and high germination rates. Ideal for potato and vegetable cultivation.',
'تقاوي عالية الجودة من اسكتلندا، معروفة بمقاومتها للمناخ البارد ونسبة إنبات عالية. مثالية لزراعة البطاطس والخضروات.',
'https://images.pexels.com/photos/28845714/pexels-photo-28845714.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),

('Seeds', 'Seeds', 'Dutch Seeds', 'التقاوي الهولندية',
'Premium seeds from the Netherlands, a global leader in agricultural technology. Excellent for potato, onion, and flower cultivation with consistent yields.',
'تقاوي فاخرة من هولندا، الرائدة عالمياً في التكنولوجيا الزراعية. ممتازة لزراعة البطاطس والبصل والزهور بإنتاجية ثابتة.',
'https://images.pexels.com/photos/8910574/pexels-photo-8910574.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 2),

('Seeds', 'Seeds', 'French Seeds', 'التقاوي الفرنسية',
'Seeds from France, renowned for their superior genetics and disease resistance. Suitable for a wide range of vegetables and aromatic crops.',
'تقاوي من فرنسا، معروفة بجيناتها الفائقة ومقاومتها للأمراض. مناسبة لمجموعة واسعة من الخضروات والمحاصيل العطرية.',
'https://images.pexels.com/photos/11670834/pexels-photo-11670834.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 3),

('Seeds', 'Seeds', 'German Seeds', 'التقاوي الألمانية',
'Seeds from Germany, engineered for precision agriculture. High productivity, excellent storage quality, and strong disease resistance.',
'تقاوي من ألمانيا، مصممة للزراعة الدقيقة. إنتاجية عالية وجودة تخزين ممتازة ومقاومة قوية للأمراض.',
'https://images.pexels.com/photos/541670/pexels-photo-541670.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 4),

('Seeds', 'Seeds', 'Danish Seeds', 'التقاوي الدنماركية',
'Seeds from Denmark, bred for Nordic climates with exceptional cold tolerance. High-yielding varieties suitable for commercial farming.',
'تقاوي من الدنمارك، مُهجَّنة للمناخات النوردية بتحمل استثنائي للبرد. أصناف عالية الإنتاجية مناسبة للزراعة التجارية.',
'https://images.pexels.com/photos/13799518/pexels-photo-13799518.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 5),

('Seeds', 'Seeds', 'Irish Seeds', 'التقاوي الأيرلندية',
'Seeds from Ireland, valued for their purity and adaptability. Excellent for root vegetables and grass crops in temperate regions.',
'تقاوي من أيرلندا، تُقدَّر لنقائها وقابليتها للتكيّف. ممتازة للخضروات الجذرية ومحاصيل العشب في المناطق المعتدلة.',
'https://images.pexels.com/photos/4350780/pexels-photo-4350780.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 6),

('Seeds', 'Seeds', 'Italian & Cypriot Seeds', 'التقاوي الإيطالية والسيبرانية',
'Seeds from Italy and Cyprus, combining Mediterranean heritage with modern breeding. Ideal for tomatoes, peppers, and warm-climate vegetables.',
'تقاوي من إيطاليا وقبرص، تجمع بين التراث المتوسطي والتهجين الحديث. مثالية للطماطم والفلفل وخضروات المناخ الدافئ.',
'https://images.pexels.com/photos/27115138/pexels-photo-27115138.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 7)
ON CONFLICT DO NOTHING;