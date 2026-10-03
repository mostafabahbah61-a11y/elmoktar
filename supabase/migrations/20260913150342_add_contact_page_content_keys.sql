/*
# Add contact page content keys

Adds site_content entries for all hardcoded text on the Contact page so
the admin can edit every piece of text on that page.
*/

INSERT INTO site_content (key, value) VALUES
  ('contact_page_title_ar', 'تواصل معنا'),
  ('contact_page_title_en', 'Contact us'),
  ('contact_page_eyebrow_ar', 'نحن هنا من أجلك'),
  ('contact_page_eyebrow_en', 'We are here for you'),
  ('contact_page_text_ar', 'ابدأ شراكتك التجارية معنا. اختر طريقة التواصل المناسبة وسيصلك فريق المختار بسرعة.'),
  ('contact_page_text_en', 'Start your trade partnership with us. Choose the channel that suits you and our team will respond quickly.'),
  ('contact_email_label_ar', 'البريد الإلكتروني'),
  ('contact_email_label_en', 'Email'),
  ('contact_email_desc_ar', 'اضغط لفتح Gmail وإرسال رسالة مباشرة'),
  ('contact_email_desc_en', 'Open Gmail and send us a direct message'),
  ('contact_whatsapp_label_ar', 'واتساب'),
  ('contact_whatsapp_label_en', 'WhatsApp'),
  ('contact_whatsapp_desc_ar', 'اختر رقم التواصل المناسب لك'),
  ('contact_whatsapp_desc_en', 'Choose the contact number that suits you'),
  ('contact_facebook_label_ar', 'فيسبوك'),
  ('contact_facebook_label_en', 'Facebook'),
  ('contact_facebook_desc_ar', 'تابع صفحة المختار على فيسبوك'),
  ('contact_facebook_desc_en', 'Follow Al-Mokhtar on Facebook'),
  ('contact_facebook_name_ar', 'المختار للاستيراد والتصدير'),
  ('contact_facebook_name_en', 'Al-Mokhtar Import & Export'),
  ('contact_choose_number_ar', 'اختار رقم واتساب'),
  ('contact_choose_number_en', 'Choose WhatsApp number'),
  ('contact_close_ar', 'إغلاق'),
  ('contact_close_en', 'Close'),
  ('contact_response_ar', 'نرد عليك بسرعة وباهتمام'),
  ('contact_response_en', 'Fast, personal responses')
ON CONFLICT (key) DO NOTHING;
