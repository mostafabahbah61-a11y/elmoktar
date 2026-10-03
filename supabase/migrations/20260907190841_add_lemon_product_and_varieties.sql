/*
# Add Lemon product and lemon varieties

## Purpose
Adds "Lemon" as a product under the Fruits category, plus 4 lemon varieties.

## Security
- No schema changes. Existing RLS policies cover new rows.
*/

-- Add "Lemon" as a new product in the Fruits category
INSERT INTO products (category, label_en, label_ar, detail_en, detail_ar, image_url, display_order)
VALUES (
  'Fruits',
  'Lemon',
  'ليمون',
  'Premium lemons in multiple varieties — Baladi, Adalia, Verdelli, and Italian/Greek sour.',
  'ليمون فاخر بأنواع متعددة — بلدي، أداش، فريك، وإيطالي/يوناني حامض.',
  'https://images.pexels.com/photos/28698837/pexels-photo-28698837.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  50
)
ON CONFLICT DO NOTHING;

-- Add 4 lemon varieties
INSERT INTO product_varieties (product_id, category, label_en, label_ar, detail_en, detail_ar, image_url, display_order) VALUES
('Lemon', 'Fruits', 'Baladi (Maltese/Omani)', 'ليمون بلدي (مالطي/عُماني)',
'The traditional local lemon, small to medium size with a thin skin and intense aroma. Widely used in Egyptian and Mediterranean cuisine for its distinctive tart flavor.',
'الليمون البلدي التقليدي، حجمه صغير إلى متوسط بقشرة رقيقة ونكهة قوية. يُستخدم على نطاق واسع في المطبخ المصري والمتوسطي لطعمه الحامض المميز.',
'https://images.pexels.com/photos/28698837/pexels-photo-28698837.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),

('Lemon', 'Fruits', 'Adalia', 'ليمون أداش',
'A premium Turkish lemon variety known for its high juice content, smooth thin skin, and bright golden color. Excellent for both fresh consumption and juice production.',
'صنف ليمون تركي فاخر معروف بمحتواه العالي من العصير وقشرته الرقيقة الناعمة ولونه الذهبي اللامع. ممتاز للاستهلاك الطازج وإنتاج العصير.',
'https://images.pexels.com/photos/36094857/pexels-photo-36094857.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 2),

('Lemon', 'Fruits', 'Verdelli', 'ليمون فريك (فيرديلي)',
'A green-skinned lemon variety prized for its fragrant oil and sharp acidity. The green rind is rich in essential oils, making it ideal for culinary and industrial uses.',
'صنف ليمون بقشرة خضراء يُقدَّر لزيوته العطرية وحموضته القوية. القشرة الخضراء غنية بالزيوت الأساسية، مما يجعله مثالياً للاستخدامات الغذائية والصناعية.',
'https://images.pexels.com/photos/37752147/pexels-photo-37752147.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 3),

('Lemon', 'Fruits', 'Italian/Greek Sour', 'ليمون إيطالي/يوناني حامض',
'A highly acidic lemon variety from Italy and Greece, featuring a thick textured rind and robust sour flavor. Perfect for sauces, dressings, and export markets.',
'صنف ليمون عالي الحموضة من إيطاليا واليونان، بقشرة سميكة ملمسية ونكهة حامضة قوية. مثالي للصلصات والتتبيلات وأسواق التصدير.',
'https://images.pexels.com/photos/32843567/pexels-photo-32843567.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 4)
ON CONFLICT DO NOTHING;