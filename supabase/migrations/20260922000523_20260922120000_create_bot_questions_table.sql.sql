/*
# Create bot_questions table

1. New Tables
- `bot_questions`: stores predefined Q&A pairs shown in the website chatbot.
  - `id` (uuid, primary key)
  - `question_en` (text, not null) — English question text
  - `question_ar` (text, not null) — Arabic question text
  - `answer_en` (text, not null) — English answer text
  - `answer_ar` (text, not null) — Arabic answer text
  - `display_order` (int, not null, default 0) — ordering for display
  - `is_active` (boolean, not null, default true) — whether the question is shown to visitors
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `bot_questions`.
- SELECT: public (anon + authenticated) so visitors can see active questions.
- INSERT/UPDATE/DELETE: authenticated only (admin manages questions).

3. Seed Data
- Inserts 10 default questions covering vegetables, fruits, seeds, packaging, shipping,
  pricing, minimum order, delivery time, payment, quality, contact, and company info.
*/

CREATE TABLE IF NOT EXISTS bot_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_en text NOT NULL,
  question_ar text NOT NULL,
  answer_en text NOT NULL,
  answer_ar text NOT NULL,
  display_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bot_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_bot_questions" ON bot_questions;
CREATE POLICY "public_select_bot_questions" ON bot_questions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_bot_questions" ON bot_questions;
CREATE POLICY "auth_insert_bot_questions" ON bot_questions FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_bot_questions" ON bot_questions;
CREATE POLICY "auth_update_bot_questions" ON bot_questions FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_bot_questions" ON bot_questions;
CREATE POLICY "auth_delete_bot_questions" ON bot_questions FOR DELETE
  TO authenticated USING (true);

INSERT INTO bot_questions (question_en, question_ar, answer_en, answer_ar, display_order) VALUES
('Vegetables', 'الخضار', 'We offer carrots, white and red onions, and potatoes — all graded for export. You can request any product from the Vegetables section.', 'نقدم جزر وبصل أبيض وأحمر وبطاطس — كلها مفرزة بجودة تصدير. يمكنك طلب أي منتج مباشرة من قسم الخضار.', 1),
('Fruits', 'الفاكهة', 'We offer oranges in multiple sizes, several mango varieties, and lemons. Visit the Fruits section for details.', 'نقدم برتقال بأحجام مختلفة ومانجا بأنواع متعددة وليمون. ادخل قسم الفاكهة للاطلاع على التفاصيل.', 2),
('Seeds', 'التقاوي', 'We offer high-quality seeds for planting. Visit the Seeds section to see available varieties.', 'نقدم تقاوي عالية الجودة للزراعة. ادخل قسم التقاوي للاطلاع على الأنواع المتاحة.', 3),
('Packaging', 'التغليف', 'Packaging is available in 5, 10, 15, 20, 25, 30 kg sacks, 1-1.5 ton jumbo bags, wooden/plastic crates, and net bags. Choose from the Packaging section.', 'التغليف متوفر بمقاسات: 5، 10، 15، 20، 25، 30 كجم، وكذلك جامبوهات 1-1.5 طن، وصناديق خشبية/بلاستيك، وأكياس شبكية. اختر ما يناسبك من قسم التغليف.', 4),
('Shipping', 'الشحن', 'We provide land and containerized sea shipping to international destinations. Visit the Shipping section.', 'نوفر شحنًا بريًا وبحريًا بالحاويات لوجهات دولية. ادخل قسم الشحن للتفاصيل.', 5),
('Pricing', 'الأسعار', 'Prices vary by product, quantity, and season. Contact us via WhatsApp or email for a custom quote.', 'الأسعار تختلف حسب المنتج والكمية وموسم التوريد. تواصل معنا عبر واتساب أو البريد للحصول على عرض سعر مخصص.', 6),
('Minimum order', 'الحد الأدنى للطلب', 'Minimum order varies by product — typically starting from one ton for containers. Contact us for specifics.', 'الحد الأدنى للطلب يختلف حسب المنتج — عادة ما يبدأ من طن واحد للحاويات. تواصل معنا لتفاصيل أدق.', 7),
('Delivery time', 'مدة التسليم', 'Delivery time depends on destination and shipping type. Land freight is typically faster regionally; sea freight takes longer. Contact us for a specific timeline.', 'مدة التسليم تعتمد على الوجهة ونوع الشحن. الشحن البري عادة أسرع داخل المنطقة، والبحري قد يستغرق أطول. تواصل معنا لجدول زمني محدد.', 8),
('Quality', 'الجودة', 'All our products are export-graded with careful inspection before shipping. We guarantee the highest standards.', 'كل منتجاتنا مفرزة بجودة تصدير مع فحص دقيق قبل الشحن. نضمن لك أعلى المعايير.', 9),
('Contact', 'التواصل', 'Contact us via WhatsApp: +20 109 090 3681 or +20 127 678 5117, or email: almokhtarimportexport02@gmail.com', 'تواصل معنا عبر واتساب: +20 109 090 3681 أو +20 127 678 5117، أو بالبريد: almokhtarimportexport02@gmail.com', 10)
ON CONFLICT DO NOTHING;
