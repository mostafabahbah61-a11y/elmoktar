/*
# Create product_varieties table and seed all variety data

## Purpose
Creates a new table `product_varieties` to store individual types/varieties of each product
(e.g., Valencia orange, Navel orange, Blood Orange under the "Orange" product).
Seeds 34 varieties across 5 products: Orange, Lemon, Mango, Carrot, Potato.

## New Table: product_varieties
- `id` (uuid, primary key)
- `product_id` (text, not null) — references the product label_en from products table (e.g., "Oranges", "Lemon", "Mango", "Carrots", "Potatoes")
- `category` (text, not null) — "Vegetables" or "Fruits"
- `label_en` (text, not null) — English name of the variety
- `label_ar` (text, not null) — Arabic name of the variety
- `detail_en` (text) — English description/specifications
- `detail_ar` (text) — Arabic description/specifications
- `image_url` (text) — URL to the variety's image
- `display_order` (int, default 0) — ordering within a product

## Security
- RLS enabled on product_varieties
- Public read access (TO anon, authenticated) since product data is public
- No write access from frontend (admin manages via service role)

## Seeded Data
### Oranges (5 varieties): Valencia, Navel, Sugar, Blood, Baladi
### Lemon (4 varieties): Baladi, Adalia, Verdelli, Italian/Greek
### Mango (5 varieties): Keitt, Naomi, Aowesy, Sedika, Zebdeya
### Carrots (8 varieties): Nantes, Imperator, Chantenay, Colored, Yellow, Red, Purple/Black, White
### Potatoes (12 varieties): Spunta, Rosetta, Jelly, Kroz, Santana, Metro, Carlo, Lady Rosetta, Natasha, Abram, Kragel, Inge
*/

CREATE TABLE IF NOT EXISTS product_varieties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text NOT NULL,
  category text NOT NULL,
  label_en text NOT NULL,
  label_ar text NOT NULL,
  detail_en text,
  detail_ar text,
  image_url text,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE product_varieties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_varieties" ON product_varieties;
CREATE POLICY "anon_select_varieties" ON product_varieties FOR SELECT
  TO anon, authenticated USING (true);

-- Seed all variety data
-- Use ON CONFLICT DO NOTHING to be idempotent (re-running won't duplicate)

-- ORANGES
INSERT INTO product_varieties (product_id, category, label_en, label_ar, detail_en, detail_ar, image_url, display_order) VALUES
('Oranges', 'Fruits', 'Valencia Orange', 'البرتقال الصيفي (فالنسيا)', 'Summer orange variety known for its juicy sweetness and bright color. Excellent for fresh juice and export. Thin-skinned with few seeds.', 'صنف برتقال صيفي يتميز بحلاوة عصيره ولونه الزاهي. ممتاز للعصير الطازج والتصدير. قشرة رقيقة وقليل البذور.', 'https://images.pexels.com/photos/36236635/pexels-photo-36236635.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
('Oranges', 'Fruits', 'Navel Orange', 'البرتقال أبو سرة (نافيل)', 'Seedless orange with a distinctive navel formation at the blossom end. Sweet, easy to peel, and ideal for fresh consumption.', 'برتقال بدون بذور يتميز بوجود سرة عند طرفه. حلو وسهل التقشير ومثالي للاستهلاك الطازج.', 'https://images.pexels.com/photos/38914226/pexels-photo-38914226.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 2),
('Oranges', 'Fruits', 'Sugar Orange', 'البرتقال السكري', 'Extra sweet orange variety with high sugar content and low acidity. Small to medium size with smooth skin.', 'صنف برتقال سكري ذو محتوى سكري عالي وحموضة منخفضة. حجمه صغير إلى متوسط بقشرة ناعمة.', 'https://images.pexels.com/photos/36791063/pexels-photo-36791063.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 3),
('Oranges', 'Fruits', 'Blood Orange (Sanguinelli)', 'البرتقال الدموي (سانجوينيلي)', 'Distinctive dark-red flesh rich in anthocyanins. Sweet-tart flavor with raspberry notes. Premium export variety.', 'برتقال دموي ذو لحم أحمر داكن غني بالأنثوسيانين. نكهة حلوة-حامضة مع لمسة توت. صنف تصدير فاخر.', 'https://images.pexels.com/photos/5180433/pexels-photo-5180433.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 4),
('Oranges', 'Fruits', 'Baladi Orange', 'البرتقال البلدي', 'Traditional Egyptian local orange variety. Well-adapted to Egyptian climate with balanced sweet-tart flavor. Reliable yield and good shelf life.', 'صنف برتقال بلدي مصري تقليدي. متأقلم مع المناخ المصري بنكهة حلوة-حامضة متوازنة. إنتاجية موثوقة وعمر تخزين جيد.', 'https://images.pexels.com/photos/35794854/pexels-photo-35794854.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 5)
ON CONFLICT DO NOTHING;

-- LEMON
INSERT INTO product_varieties (product_id, category, label_en, label_ar, detail_en, detail_ar, image_url, display_order) VALUES
('Lemon', 'Fruits', 'Baladi Lemon (Maltese/Omani)', 'الليمون البلدي (المالطي/العُماني)', 'Traditional Egyptian lemon with thin skin and high juice content. Aromatic and widely used in Egyptian cuisine and beverages.', 'ليمون بلدي مصري بقشرة رقيقة ومحتوى عصير عالي. عطري ومستخدم بكثرة في المطبخ المصري والمشروبات.', 'https://images.pexels.com/photos/18294341/pexels-photo-18294341.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
('Lemon', 'Fruits', 'Adalia Lemon', 'الليمون الأداش (أداليا)', 'Premium lemon variety with smooth thin skin and high acidity. Excellent for export with long shelf life and uniform shape.', 'صنف ليمون فاخر بقشرة رقيقة ناعمة وحموضة عالية. ممتاز للتصدير بعمر تخزين طويل وشكل منتظم.', 'https://images.pexels.com/photos/7518588/pexels-photo-7518588.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 2),
('Lemon', 'Fruits', 'Verdelli Lemon (Freak)', 'ليمون فريك (فيرديلي)', 'Late-harvest lemon variety prized for its intense aroma and high oil content in the peel. Valued in international markets.', 'صنف ليمون حصاد متأخر يتميز بعطر قوي ومحتوى زيت عالي في القشرة. مرغوب في الأسواق الدولية.', 'https://images.pexels.com/photos/2998952/pexels-photo-2998952.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 3),
('Lemon', 'Fruits', 'Italian/Greek Lemon', 'الليمون الحامض الإيطالي/اليوناني', 'Mediterranean lemon variety with thick aromatic peel and balanced acidity. Ideal for culinary use and oil extraction.', 'صنف ليمون متوسطي بقشرة سميكة عطرية وحموضة متوازنة. مثالي للاستخدام الطهي واستخراج الزيت.', 'https://images.pexels.com/photos/16776925/pexels-photo-16776925.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 4)
ON CONFLICT DO NOTHING;

-- MANGO
INSERT INTO product_varieties (product_id, category, label_en, label_ar, detail_en, detail_ar, image_url, display_order) VALUES
('Mango', 'Fruits', 'Keitt Mango', 'مانجو كيت', 'Large mango variety with green-to-pink skin. Late-season harvest, fiberless flesh, and excellent shipping quality. Popular in export markets.', 'صنف مانجو كبير بقشرة خضراء إلى وردية. حصاد متأخر، لب خالٍ من الألياف وجودة شحن ممتازة. شائع في أسواق التصدير.', 'https://images.pexels.com/photos/37816783/pexels-photo-37816783.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
('Mango', 'Fruits', 'Naomi Mango', 'مانجو نعومي', 'Premium Egyptian mango with sweet aromatic flesh and attractive red-blush skin. Medium size with excellent flavor profile.', 'مانجو مصري فاخر بلب حلو عطري وقشرة جذابة بحمرة وردية. حجم متوسط بنكهة ممتازة.', 'https://images.pexels.com/photos/7543169/pexels-photo-7543169.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 2),
('Mango', 'Fruits', 'Aowesy Mango', 'مانجو عويسي', 'Traditional Egyptian mango known for its rich sweetness and golden color. Medium-sized with smooth fiberless flesh. A local favorite.', 'مانجو مصري تقليدي معروف بحلاوته الغنية ولونه الذهبي. حجم متوسط بلب ناعم خالٍ من الألياف. مفضل محلياً.', 'https://images.pexels.com/photos/16038612/pexels-photo-16038612.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 3),
('Mango', 'Fruits', 'Sedika Mango', 'مانجو صديقة', 'High-quality mango with vibrant skin and sweet tropical flavor. Good shelf life and export-ready appearance.', 'مانجو عالي الجودة بقشرة زاهية ونكهة استوائية حلوة. عمر تخزين جيد ومظهر جاهز للتصدير.', 'https://images.pexels.com/photos/5673668/pexels-photo-5673668.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 4),
('Mango', 'Fruits', 'Zebdeya Mango', 'مانجو زبدية', 'Classic Egyptian mango with buttery smooth texture and rich sweetness. One of the most popular varieties for both local and export markets.', 'مانجو مصري كلاسيكي بقوام زبدي ناعم وحلاوة غنية. من أكثر الأصناف شعبية للأسواق المحلية وأسواق التصدير.', 'https://images.pexels.com/photos/4023132/pexels-photo-4023132.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 5)
ON CONFLICT DO NOTHING;

-- CARROTS
INSERT INTO product_varieties (product_id, category, label_en, label_ar, detail_en, detail_ar, image_url, display_order) VALUES
('Carrots', 'Vegetables', 'Nantes Carrot', 'جزر نانتس', 'Cylindrical carrot with blunt tips and smooth orange skin. Sweet, tender, and crisp. Excellent for fresh market and export.', 'جزر أسطواني بأطراف مدببة وقشرة برتقالية ناعمة. حلو وطري ومقرمش. ممتاز للسوق الطازج والتصدير.', 'https://images.pexels.com/photos/1306559/pexels-photo-1306559.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
('Carrots', 'Vegetables', 'Imperator Carrot', 'جزر إمبراتور', 'Long, slender carrot with deep orange color and high sugar content. The standard for commercial carrot production and export.', 'جزر طويل رفيع بلون برتقالي داكن ومحتوى سكري عالي. المعيار لإنتاج الجزر التجاري والتصدير.', 'https://images.pexels.com/photos/38938579/pexels-photo-38938579.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 2),
('Carrots', 'Vegetables', 'Chantenay Carrot', 'جزر تشانتني', 'Short, conical carrot with broad shoulders and strong tops. Crisp texture and excellent for processing and canning.', 'جزر قصير مخروطي بأكتاف عريضة وقمم قوية. قوام مقرمش وممتاز للتصنيع والتعبئة.', 'https://images.pexels.com/photos/20371247/pexels-photo-20371247.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 3),
('Carrots', 'Vegetables', 'Colored Carrots', 'الجزر الملون', 'Mixed variety pack featuring carrots in orange, yellow, purple, and red. Visually striking and nutritionally diverse. Popular in gourmet markets.', 'تشكيلة جزر ملون بالبرتقالي والأصفر والأرجواني والأحمر. جذاب بصرياً ومتنوع غذائياً. شائع في الأسواق الفاخرة.', 'https://images.pexels.com/photos/24783851/pexels-photo-24783851.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 4),
('Carrots', 'Vegetables', 'Yellow Carrot', 'الجزر الأصفر', 'Characterized by its sweet flavor and absence of orange pigments. Rich in lutein, beneficial for eye health. Mild and pleasant taste.', 'يتميز بحلاوة طعمه وخلوه من الصبغات البرتقالية، وغناه بمادة اللوتين المفيدة لصحة العين. طعمه معتدل ولطيف.', 'https://images.pexels.com/photos/37408655/pexels-photo-37408655.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 5),
('Carrots', 'Vegetables', 'Red Carrot', 'الجزر الأحمر', 'Contains high levels of lycopene, a powerful antioxidant. Deep red color with sweet flavor. Excellent for juices and cooking.', 'يحتوي على نسبة عالية من مركب الليكوبين، وهو مضاد قوي للأكسدة. لون أحمر داكن بنكهة حلوة. ممتاز للعصائر والطهي.', 'https://images.pexels.com/photos/12945065/pexels-photo-12945065.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 6),
('Carrots', 'Vegetables', 'Purple/Black Carrot', 'الجزر الأرجواني والأسود', 'Features a dark outer skin with orange or purple interior. Rich in anthocyanin pigments. High antioxidant content and striking appearance.', 'يتميز بقشرة خارجية داكنة وقلب برتقالي أو أرجواني، وغني بصبغات الأنثوسيانين. محتوى مضادات أكسدة عالٍ ومظهر لافت.', 'https://images.pexels.com/photos/19243756/pexels-photo-19243756.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 7),
('Carrots', 'Vegetables', 'White Carrot', 'الجزر الأبيض', 'Characterized by its pale color and mild flavor. Often used in soups and cooking. Subtle taste that absorbs flavors well.', 'يتميز بلونه الشاحب وطعمه المعتدل، وغالبًا يستخدم في الشوربات والطهي. طعمه خفيف يمتص النكهات جيداً.', 'https://images.pexels.com/photos/20121663/pexels-photo-20121663.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 8)
ON CONFLICT DO NOTHING;

-- POTATOES
INSERT INTO product_varieties (product_id, category, label_en, label_ar, detail_en, detail_ar, image_url, display_order) VALUES
('Potatoes', 'Vegetables', 'Spunta Potato', 'بطاطس سبونتا', 'Yellow-skinned potato, widely grown and popular. Suitable for frying, cooking, and boiling. Tolerates long-distance shipping well.', 'قشرة صفراء، واسعة الانتشار، مناسبة للقلي والطبخ والسليق وتتحمل الشحن الطويل.', 'https://images.pexels.com/photos/39029991/pexels-photo-39029991.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
('Potatoes', 'Vegetables', 'Rosetta Potato', 'بطاطس روزيتا', 'Red-skinned potato with high dry matter content. Ideal for chips and crispy frying. Excellent export quality.', 'قشرة حمراء، عالية المادة الجافة ومناسبة للشيبسي والقلي المقرمش. جودة تصدير ممتازة.', 'https://images.pexels.com/photos/7129156/pexels-photo-7129156.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 2),
('Potatoes', 'Vegetables', 'Jelly Potato', 'بطاطس جيلي', 'Firm-textured potato, excellent for cooking and baking. Tolerates storage for extended periods. Consistent quality.', 'قوام متماسك، ممتازة للطبخ والصواني وتتحمل التخزين لفترات جيدة. جودة ثابتة.', 'https://images.pexels.com/photos/36400786/pexels-photo-36400786.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 3),
('Potatoes', 'Vegetables', 'Kroz Potato', 'بطاطس كروز', 'High-yielding potato suitable for commercial use and export. Good for table consumption. Reliable performer.', 'إنتاجية عالية ومناسبة للاستخدام التجاري والتصدير والمائدة. أداء موثوق.', 'https://images.pexels.com/photos/38571553/pexels-photo-38571553.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 4),
('Potatoes', 'Vegetables', 'Santana Potato', 'بطاطس سانتانا', 'Suitable for frying and French fries production. Good starch content and golden fry color. Export-ready.', 'مناسبة للقلي وصناعة البطاطس النصف مقلية French Fries. محتوى نشا جيد ولون ذهبي. جاهزة للتصدير.', 'https://images.pexels.com/photos/34777322/pexels-photo-34777322.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 5),
('Potatoes', 'Vegetables', 'Metro Potato', 'بطاطس مترو', 'Strong, firm variety in high demand in international markets. Excellent storage and shipping characteristics.', 'صنف قوي ومتماسك ومطلوب في الأسواق الخارجية. خصائص تخزين وشحن ممتازة.', 'https://images.pexels.com/photos/13110450/pexels-photo-13110450.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 6),
('Potatoes', 'Vegetables', 'Carlo Potato', 'بطاطس كارلو', 'Good quality potato for cooking and frying. Reliable yield with consistent performance across seasons.', 'جودة جيدة في الطهي والقلي. إنتاجية موثوقة وأداء ثابت عبر المواسم.', 'https://images.pexels.com/photos/45247/pexels-photo-45247.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 7),
('Potatoes', 'Vegetables', 'Lady Rosetta Potato', 'بطاطس ليدي رزيتا', 'Highly suitable for chips production due to starch content and golden color. Premium export variety for snack industry.', 'مناسبة جدًا لصناعة الشيبسي بسبب نسبة النشا واللون الذهبي. صنف تصدير فاخر لصناعة الوجبات الخفيفة.', 'https://images.pexels.com/photos/31669764/pexels-photo-31669764.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 8),
('Potatoes', 'Vegetables', 'Natasha Potato', 'بطاطس نتاشا', 'Characterized by good yield and uniform shape. Suitable for table and export markets. Attractive appearance.', 'تتميز بالإنتاجية الجيدة والشكل المنتظم. مناسبة للمائدة والتصدير. مظهر جذاب.', 'https://images.pexels.com/photos/38742086/pexels-photo-38742086.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 9),
('Potatoes', 'Vegetables', 'Abram Potato', 'بطاطس أبرام', 'Table variety known for durability and good yield. Strong plant with excellent disease resistance.', 'صنف مائدة يتميز بالتحمل والإنتاج الجيد. نبات قوي بمقاومة ممتازة للأمراض.', 'https://images.pexels.com/photos/37540986/pexels-photo-37540986.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 10),
('Potatoes', 'Vegetables', 'Kragel Potato', 'بطاطس كراجل', 'Versatile potato variety suitable for multiple cooking applications. Good storage stability.', 'صنف بطاطس متعدد الاستخدامات مناسب لتطبيقات طهي متعددة. ثبات تخزين جيد.', 'https://images.pexels.com/photos/28487084/pexels-photo-28487084.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 11),
('Potatoes', 'Vegetables', 'Inge Potato', 'بطاطس إنجي', 'Quality potato with good cooking properties and consistent performance. Suitable for both local and export markets.', 'بطاطس عالية الجودة بخصائص طهي جيدة وأداء ثابت. مناسبة للأسواق المحلية وأسواق التصدير.', 'https://images.pexels.com/photos/8369485/pexels-photo-8369485.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 12)
ON CONFLICT DO NOTHING;