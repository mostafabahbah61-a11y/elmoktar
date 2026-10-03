import React, { useState } from 'react';
import { ArrowLeft, Facebook, Globe2, Mail, MessageCircle, Phone, Send } from 'lucide-react';

type ContactPageProps = {
  lang: 'ar' | 'en';
  onBack: () => void;
  content: Record<string, string>;
};

export function ContactPage({ lang, onBack, content }: ContactPageProps) {
  const isAr = lang === 'ar';
  const [showNumbers, setShowNumbers] = useState(false);

  const t = {
    back: isAr ? 'العودة للموقع' : 'Back to website',
    title: isAr ? (content.contact_page_title_ar || 'تواصل معنا') : (content.contact_page_title_en || 'Contact us'),
    eyebrow: isAr ? (content.contact_page_eyebrow_ar || 'نحن هنا من أجلك') : (content.contact_page_eyebrow_en || 'We are here for you'),
    text: isAr ? (content.contact_page_text_ar || 'ابدأ شراكتك التجارية معنا.') : (content.contact_page_text_en || 'Start your trade partnership with us.'),
    emailLabel: isAr ? (content.contact_email_label_ar || 'البريد الإلكتروني') : (content.contact_email_label_en || 'Email'),
    emailDesc: isAr ? (content.contact_email_desc_ar || 'اضغط لفتح Gmail وإرسال رسالة مباشرة') : (content.contact_email_desc_en || 'Open Gmail and send us a direct message'),
    whatsappLabel: isAr ? (content.contact_whatsapp_label_ar || 'واتساب') : (content.contact_whatsapp_label_en || 'WhatsApp'),
    whatsappDesc: isAr ? (content.contact_whatsapp_desc_ar || 'اختر رقم التواصل المناسب لك') : (content.contact_whatsapp_desc_en || 'Choose the contact number that suits you'),
    facebookLabel: isAr ? (content.contact_facebook_label_ar || 'فيسبوك') : (content.contact_facebook_label_en || 'Facebook'),
    facebookDesc: isAr ? (content.contact_facebook_desc_ar || 'تابع صفحة المختار على فيسبوك') : (content.contact_facebook_desc_en || 'Follow Al-Mokhtar on Facebook'),
    facebookName: isAr ? (content.contact_facebook_name_ar || 'المختار للاستيراد والتصدير') : (content.contact_facebook_name_en || 'Al-Mokhtar Import & Export'),
    choose: isAr ? (content.contact_choose_number_ar || 'اختار رقم واتساب') : (content.contact_choose_number_en || 'Choose WhatsApp number'),
    close: isAr ? (content.contact_close_ar || 'إغلاق') : (content.contact_close_en || 'Close'),
    cairo: isAr ? (content.contact_address_ar || 'القاهرة · مصر') : (content.contact_address_en || 'Cairo · Egypt'),
    response: isAr ? (content.contact_response_ar || 'نرد عليك بسرعة وباهتمام') : (content.contact_response_en || 'Fast, personal responses'),
  };

  const email = content.contact_email || 'almokhtarimportexport02@gmail.com';
  const whatsapp1 = content.contact_whatsapp_1 || '201090903681';
  const whatsapp2 = content.contact_whatsapp_2 || '201276785117';
  const facebookUrl = content.contact_facebook || 'https://www.facebook.com/share/1Dk6EGYJrn/?mibextid=wwXIfr';

  return (
    <div className="contact-page" dir={isAr ? 'rtl' : 'ltr'}>
      <header className="contact-page-header">
        <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> {t.back}</button>
        <div className="contact-brand"><img src="/logo.jpeg" alt="Al-Mokhtar" /><span>AL-MOKHTAR <small>IMPORT & EXPORT</small></span></div>
        <span className="contact-country"><Globe2 size={15} /> {t.cairo}</span>
      </header>
      <main className="contact-page-main">
        <div className="contact-page-intro"><div className="section-label"><span>05</span> {t.eyebrow}</div><h1>{t.title}</h1><p>{t.text}</p></div>
        <div className="contact-page-grid">
          <a className="contact-tile email-tile" href={`mailto:${email}`}><div className="tile-icon gmail-icon"><Mail size={34} /></div><div><small>{t.emailLabel}</small><h2>Gmail</h2><p>{t.emailDesc}</p><strong>{email} <Send size={17} /></strong></div></a>
          <button className="contact-tile whatsapp-tile" onClick={() => setShowNumbers(true)}><div className="tile-icon"><MessageCircle size={34} /></div><div><small>{t.whatsappLabel}</small><h2>WhatsApp</h2><p>{t.whatsappDesc}</p><strong>{t.choose} <Phone size={17} /></strong></div></button>
          <a className="contact-tile facebook-tile" href={facebookUrl} target="_blank" rel="noreferrer"><div className="tile-icon"><Facebook size={34} /></div><div><small>{t.facebookLabel}</small><h2>Facebook</h2><p>{t.facebookDesc}</p><strong>{t.facebookName} <Send size={17} /></strong></div></a>
        </div>
        <div className="contact-page-footer"><span><span className="status-dot" /> {t.response}</span><span>{t.cairo}</span></div>
      </main>
      {showNumbers && <div className="number-overlay" onClick={() => setShowNumbers(false)}><div className="number-card" onClick={(e) => e.stopPropagation()}><button className="number-close" onClick={() => setShowNumbers(false)}>×</button><MessageCircle size={30} /><h2>{t.choose}</h2><a href={`https://wa.me/${whatsapp1}`} target="_blank" rel="noreferrer">+{whatsapp1} <ArrowLeft size={17} /></a><a href={`https://wa.me/${whatsapp2}`} target="_blank" rel="noreferrer">+{whatsapp2} <ArrowLeft size={17} /></a><button className="close-number" onClick={() => setShowNumbers(false)}>{t.close}</button></div></div>}
    </div>
  );
}
