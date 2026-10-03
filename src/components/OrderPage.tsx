import { useState, type FormEvent } from 'react';
import { ArrowLeft, Check, Globe2, Send, ShoppingBag } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Lang = 'en' | 'ar';
type Product = {
  id: string;
  label: string;
  ar: string;
  category: string;
};
type Variety = {
  id: string;
  productId: string;
  label: string;
  ar: string;
};

type OrderPageProps = {
  lang: Lang;
  onBack: () => void;
  products: Product[];
  varieties: Variety[];
  whatsapp1: string;
};

const COUNTRIES_EN = [
  'Egypt', 'Saudi Arabia', 'United Arab Emirates', 'Kuwait', 'Qatar', 'Bahrain', 'Oman',
  'Jordan', 'Iraq', 'Lebanon', 'Syria', 'Palestine', 'Yemen', 'Sudan', 'Libya',
  'Tunisia', 'Algeria', 'Morocco', 'Mauritania', 'Djibouti', 'Somalia', 'Comoros',
  'Turkey', 'Iran', 'Cyprus', 'Greece', 'Italy', 'Spain', 'France', 'Germany',
  'Netherlands', 'Belgium', 'United Kingdom', 'Russia', 'Ukraine', 'Poland',
  'Romania', 'Bulgaria', 'Serbia', 'Croatia', 'Slovenia', 'Bosnia and Herzegovina',
  'Albania', 'North Macedonia', 'Montenegro', 'Kosovo', 'Moldova', 'Belarus',
  'Lithuania', 'Latvia', 'Estonia', 'Finland', 'Sweden', 'Norway', 'Denmark',
  'Iceland', 'Ireland', 'Portugal', 'Switzerland', 'Austria', 'Czech Republic',
  'Slovakia', 'Hungary', 'Georgia', 'Armenia', 'Azerbaijan', 'Kazakhstan',
  'Uzbekistan', 'Turkmenistan', 'Kyrgyzstan', 'Tajikistan', 'Afghanistan',
  'Pakistan', 'India', 'Bangladesh', 'Sri Lanka', 'Maldives', 'Nepal', 'Bhutan',
  'China', 'Japan', 'South Korea', 'North Korea', 'Mongolia', 'Taiwan',
  'Philippines', 'Vietnam', 'Cambodia', 'Laos', 'Myanmar', 'Thailand', 'Malaysia',
  'Singapore', 'Indonesia', 'Brunei', 'Timor-Leste', 'Papua New Guinea',
  'Australia', 'New Zealand', 'Fiji', 'Solomon Islands', 'Vanuatu', 'Samoa',
  'Tonga', 'Micronesia', 'Palau', 'Marshall Islands', 'Kiribati', 'Nauru',
  'Tuvalu', 'Cook Islands', 'Niue', 'Nigeria', 'Ghana', 'Ivory Coast', 'Senegal',
  'Mali', 'Burkina Faso', 'Niger', 'Chad', 'Cameroon', 'Central African Republic',
  'Equatorial Guinea', 'Gabon', 'Congo', 'Democratic Republic of the Congo',
  'Rwanda', 'Burundi', 'Tanzania', 'Uganda', 'Kenya', 'Ethiopia', 'Eritrea',
  'South Sudan', 'Angola', 'Zambia', 'Zimbabwe', 'Malawi', 'Mozambique',
  'Madagascar', 'Mauritius', 'Seychelles', 'Comoros', 'Botswana', 'Namibia',
  'South Africa', 'Lesotho', 'Eswatini', 'Cape Verde', 'Guinea-Bissau',
  'Guinea', 'Sierra Leone', 'Liberia', 'Togo', 'Benin', 'The Gambia',
  'South Africa', 'United States', 'Canada', 'Mexico', 'Guatemala', 'Belize',
  'Honduras', 'El Salvador', 'Nicaragua', 'Costa Rica', 'Panama', 'Cuba',
  'Jamaica', 'Haiti', 'Dominican Republic', 'Bahamas', 'Barbados', 'Trinidad and Tobago',
  'Guyana', 'Suriname', 'Venezuela', 'Colombia', 'Ecuador', 'Peru', 'Bolivia',
  'Paraguay', 'Uruguay', 'Argentina', 'Brazil', 'Chile',
];

const COUNTRIES_AR: Record<string, string> = {
  'Egypt': 'مصر', 'Saudi Arabia': 'السعودية', 'United Arab Emirates': 'الإمارات',
  'Kuwait': 'الكويت', 'Qatar': 'قطر', 'Bahrain': 'البحرين', 'Oman': 'عمان',
  'Jordan': 'الأردن', 'Iraq': 'العراق', 'Lebanon': 'لبنان', 'Syria': 'سوريا',
  'Palestine': 'فلسطين', 'Yemen': 'اليمن', 'Sudan': 'السودان', 'Libya': 'ليبيا',
  'Tunisia': 'تونس', 'Algeria': 'الجزائر', 'Morocco': 'المغرب', 'Mauritania': 'موريتانيا',
  'Djibouti': 'جيبوتي', 'Somalia': 'الصومال', 'Comoros': 'جزر القمر',
  'Turkey': 'تركيا', 'Iran': 'إيران', 'Cyprus': 'قبرص', 'Greece': 'اليونان',
  'Italy': 'إيطاليا', 'Spain': 'إسبانيا', 'France': 'فرنسا', 'Germany': 'ألمانيا',
  'Netherlands': 'هولندا', 'Belgium': 'بلجيكا', 'United Kingdom': 'بريطانيا',
  'Russia': 'روسيا', 'Ukraine': 'أوكرانيا', 'Poland': 'بولندا', 'Romania': 'رومانيا',
  'Bulgaria': 'بلغاريا', 'Serbia': 'صربيا', 'Croatia': 'كرواتيا', 'Slovenia': 'سلوفينيا',
  'Bosnia and Herzegovina': 'البوسنة والهرسك', 'Albania': 'ألبانيا',
  'North Macedonia': 'مقدونيا الشمالية', 'Montenegro': 'الجبل الأسود', 'Kosovo': 'كوسوفو',
  'Moldova': 'مولدوفا', 'Belarus': 'بيلاروسيا', 'Lithuania': 'ليتوانيا',
  'Latvia': 'لاتفيا', 'Estonia': 'إستونيا', 'Finland': 'فنلندا', 'Sweden': 'السويد',
  'Norway': 'النرويج', 'Denmark': 'الدنمارك', 'Iceland': 'آيسلندا',
  'Ireland': 'أيرلندا', 'Portugal': 'البرتغال', 'Switzerland': 'سويسرا',
  'Austria': 'النمسا', 'Czech Republic': 'التشيك', 'Slovakia': 'سلوفاكيا',
  'Hungary': 'المجر', 'Georgia': 'جورجيا', 'Armenia': 'أرمينيا',
  'Azerbaijan': 'أذربيجان', 'Kazakhstan': 'كازاخستان', 'Uzbekistan': 'أوزبكستان',
  'Turkmenistan': 'تركمانستان', 'Kyrgyzstan': 'قيرغيزستان', 'Tajikistan': 'طاجيكستان',
  'Afghanistan': 'أفغانستان', 'Pakistan': 'باكستان', 'India': 'الهند',
  'Bangladesh': 'بنغلاديش', 'Sri Lanka': 'سريلانكا', 'Maldives': 'جزر المالديف',
  'Nepal': 'نيبال', 'Bhutan': 'بوتان', 'China': 'الصين', 'Japan': 'اليابان',
  'South Korea': 'كوريا الجنوبية', 'North Korea': 'كوريا الشمالية',
  'Mongolia': 'منغوليا', 'Taiwan': 'تايوان', 'Philippines': 'الفلبين',
  'Vietnam': 'فيتنام', 'Cambodia': 'كمبوديا', 'Laos': 'لاوس', 'Myanmar': 'ميانمار',
  'Thailand': 'تايلاند', 'Malaysia': 'ماليزيا', 'Singapore': 'سنغافورة',
  'Indonesia': 'إندونيسيا', 'Brunei': 'بروناي', 'Timor-Leste': 'تيمور الشرقية',
  'Papua New Guinea': 'بابوا غينيا الجديدة', 'Australia': 'أستراليا',
  'New Zealand': 'نيوزيلندا', 'Fiji': 'فيجي', 'Solomon Islands': 'جزر سليمان',
  'Vanuatu': 'فانواتو', 'Samoa': 'ساموا', 'Tonga': 'تونغا',
  'Micronesia': 'ميكرونيسيا', 'Palau': 'بالاو', 'Marshall Islands': 'جزر مارشال',
  'Kiribati': 'كيريباتي', 'Nauru': 'ناورو', 'Tuvalu': 'توفالو',
  'Cook Islands': 'جزر كوك', 'Niue': 'نيوي', 'Nigeria': 'نيجيريا',
  'Ghana': 'غانا', 'Ivory Coast': 'ساحل العاج', 'Senegal': 'السنغال',
  'Mali': 'مالي', 'Burkina Faso': 'بوركينا فاسو', 'Niger': 'النيجر',
  'Chad': 'تشاد', 'Cameroon': 'الكاميرون', 'Central African Republic': 'جمهورية أفريقيا الوسطى',
  'Equatorial Guinea': 'غينيا الاستوائية', 'Gabon': 'الغابون', 'Congo': 'الكونغو',
  'Democratic Republic of the Congo': 'جمهورية الكونغو الديمقراطية',
  'Rwanda': 'رواندا', 'Burundi': 'بوروندي', 'Tanzania': 'تنزانيا',
  'Uganda': 'أوغندا', 'Kenya': 'كينيا', 'Ethiopia': 'إثيوبيا',
  'Eritrea': 'إريتريا', 'South Sudan': 'جنوب السودان', 'Angola': 'أنغولا',
  'Zambia': 'زامبيا', 'Zimbabwe': 'زيمبابوي', 'Malawi': 'مالاوي',
  'Mozambique': 'موزمبيق', 'Madagascar': 'مدغشقر', 'Mauritius': 'موريشيوس',
  'Seychelles': 'سيشل', 'Botswana': 'بوتسوانا', 'Namibia': 'ناميبيا',
  'South Africa': 'جنوب أفريقيا', 'Lesotho': 'ليسوتو', 'Eswatini': 'إسواتيني',
  'Cape Verde': 'الرأس الأخضر', 'Guinea-Bissau': 'غينيا بيساو',
  'Guinea': 'غينيا', 'Sierra Leone': 'سيراليون', 'Liberia': 'ليبيريا',
  'Togo': 'توغو', 'Benin': 'بنين', 'The Gambia': 'غامبيا',
  'United States': 'الولايات المتحدة', 'Canada': 'كندا', 'Mexico': 'المكسيك',
  'Guatemala': 'غواتيمالا', 'Belize': 'بليز', 'Honduras': 'هندوراس',
  'El Salvador': 'السلفادور', 'Nicaragua': 'نيكاراغوا', 'Costa Rica': 'كوستاريكا',
  'Panama': 'بنما', 'Cuba': 'كوبا', 'Jamaica': 'جامايكا', 'Haiti': 'هايتي',
  'Dominican Republic': 'جمهورية الدومينيكان', 'Bahamas': 'الباهاماس',
  'Barbados': 'بربادوس', 'Trinidad and Tobago': 'ترينيداد وتوباغو',
  'Guyana': 'غيانا', 'Suriname': 'سورينام', 'Venezuela': 'فنزويلا',
  'Colombia': 'كولومبيا', 'Ecuador': 'الإكوادور', 'Peru': 'بيرو',
  'Bolivia': 'بوليفيا', 'Paraguay': 'باراغواي', 'Uruguay': 'أوروغواي',
  'Argentina': 'الأرجنتين', 'Brazil': 'البرازيل', 'Chile': 'تشيلي',
};

const PACKAGING_OPTIONS_EN = [
  '5 kg Sacks', '10 kg Sacks', '15 kg Sacks', '15-30 kg Sacks',
  'Big Bags (1-1.5 ton)', 'Wooden/Plastic Crates', 'Net Bags', 'Custom',
];
const PACKAGING_OPTIONS_AR = [
  'شكاير 5 كجم', 'شكاير 10 كجم', 'شكاير 15 كجم', 'شكاير 15-30 كجم',
  'جامبوهات (1-1.5 طن)', 'صناديق خشبية/بلاستيك', 'أكياس شبكية', 'حسب الطلب',
];

const copy = {
  ar: {
    back: 'العودة للموقع', title: 'اطلب الآن', eyebrow: 'طلب جديد',
    text: 'املأ النموذج التالي بالكامل وسنرسل طلبك مباشرة إلى فريق المختار على واتساب، وسنحفظه أيضًا في نظامنا.',
    fullName: 'الاسم بالكامل', mobile: 'رقم الموبايل', whatsapp: 'واتساب',
    email: 'البريد الإلكتروني', company: 'اسم الشركة (إن وجد)', country: 'الدولة',
    product: 'المنتج المطلوب', variety: 'النوع', quantity: 'الكمية',
    packagingType: 'نوع التغليف', weight: 'الوزن المطلوب',
    shippingMethod: 'طريقة الشحن', land: 'بري', sea: 'بحري',
    destinationCountry: 'دولة الوصول', notes: 'أي ملاحظات أو تفاصيل إضافية',
    submit: 'إرسال الطلب', selectProduct: 'اختر المنتج', selectVariety: 'اختر النوع',
    selectCountry: 'اختر الدولة', selectPackaging: 'اختر نوع التغليف',
    selectShipping: 'اختر طريقة الشحن', selectDestination: 'اختر دولة الوصول',
    noVariety: 'لا توجد أنواع لهذا المنتج', none: 'بدون نوع محدد',
    success: 'تم إرسال طلبك بنجاح! تم فتح واتساب لإتمام الإرسال.',
    errorRequired: 'يرجى ملء الحقول المطلوبة: الاسم، الموبايل، المنتج، الكمية.',
    errorSave: 'تعذر حفظ الطلب. حاول مرة أخرى.', sending: 'جاري الإرسال...',
    cairo: 'القاهرة · مصر', required: 'مطلوب', optional: 'اختياري',
    orderSummary: 'ملخص الطلب', whatsappSent: 'تم فتح واتساب لإرسال طلبك',
  },
  en: {
    back: 'Back to website', title: 'Order Now', eyebrow: 'New Order',
    text: 'Fill out the form below and we will send your order directly to the Al-Mokhtar team via WhatsApp, and save it in our system.',
    fullName: 'Full Name', mobile: 'Mobile Number', whatsapp: 'WhatsApp',
    email: 'Email Address', company: 'Company Name (if any)', country: 'Country',
    product: 'Requested Product', variety: 'Variety', quantity: 'Quantity',
    packagingType: 'Packaging Type', weight: 'Requested Weight',
    shippingMethod: 'Shipping Method', land: 'Land', sea: 'Sea',
    destinationCountry: 'Destination Country', notes: 'Any additional notes or details',
    submit: 'Send Order', selectProduct: 'Select product', selectVariety: 'Select variety',
    selectCountry: 'Select country', selectPackaging: 'Select packaging type',
    selectShipping: 'Select shipping method', selectDestination: 'Select destination country',
    noVariety: 'No varieties for this product', none: 'No specific variety',
    success: 'Your order has been sent! WhatsApp opened to complete delivery.',
    errorRequired: 'Please fill required fields: Name, Mobile, Product, Quantity.',
    errorSave: 'Could not save the order. Please try again.', sending: 'Sending...',
    cairo: 'Cairo · Egypt', required: 'required', optional: 'optional',
    orderSummary: 'Order Summary', whatsappSent: 'WhatsApp opened to send your order',
  },
};

export function OrderPage({ lang, onBack, products, varieties, whatsapp1 }: OrderPageProps) {
  const t = copy[lang];
  const isAr = lang === 'ar';
  const [form, setForm] = useState({
    name: '', mobile: '', whatsapp: '', email: '', company: '',
    country: '', product: '', variety: '', quantity: '', packaging: '',
    weight: '', shipping: '', destination: '', notes: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const productVarieties = form.product
    ? varieties.filter((v) => v.productId === products.find((p) => p.id === form.product)?.label)
    : [];

  const countries = isAr
    ? COUNTRIES_EN.map((c) => ({ value: c, label: COUNTRIES_AR[c] ?? c }))
    : COUNTRIES_EN.map((c) => ({ value: c, label: c }));

  const packagingOptions = isAr
    ? PACKAGING_OPTIONS_AR.map((label, i) => ({ value: PACKAGING_OPTIONS_EN[i], label }))
    : PACKAGING_OPTIONS_EN.map((label) => ({ value: label, label }));

  const productOptions = products
    .filter((p) => p.category === 'Vegetables' || p.category === 'Fruits' || p.category === 'Seeds')
    .map((p) => ({
      value: p.id,
      label: isAr ? p.ar : p.label,
    }));

  const set = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.name || !form.mobile || !form.product || !form.quantity) {
      setError(t.errorRequired);
      return;
    }
    setError('');
    setSubmitting(true);

    const product = products.find((p) => p.id === form.product);
    const productLabel = product ? (isAr ? product.ar : product.label) : form.product;
    const varietyLabel = form.variety
      ? (() => {
          const v = varieties.find((vv) => vv.id === form.variety);
          return v ? (isAr ? v.ar : v.label) : form.variety;
        })()
      : null;
    const countryLabel = form.country ? (isAr ? (COUNTRIES_AR[form.country] ?? form.country) : form.country) : null;
    const destLabel = form.destination ? (isAr ? (COUNTRIES_AR[form.destination] ?? form.destination) : form.destination) : null;
    const packagingLabel = form.packaging
      ? (isAr ? (PACKAGING_OPTIONS_AR[PACKAGING_OPTIONS_EN.indexOf(form.packaging)] ?? form.packaging) : form.packaging)
      : null;

    const { error: insertError } = await supabase.from('orders').insert({
      customer_name: form.name,
      customer_phone: form.mobile,
      customer_email: form.email || null,
      whatsapp: form.whatsapp || null,
      company_name: form.company || null,
      country: form.country || null,
      product_category: product?.category ?? null,
      product_name: productLabel,
      product_variety: varietyLabel,
      quantity: form.quantity,
      packaging: packagingLabel,
      weight: form.weight || null,
      shipping_type: form.shipping || null,
      destination_country: destLabel,
      notes: form.notes || null,
    });

    if (insertError) {
      setError(t.errorSave);
      setSubmitting(false);
      return;
    }

    const lines: string[] = [];
    lines.push(isAr ? '🛒 طلب جديد من موقع المختار' : '🛒 New Order from Al-Mokhtar Website');
    lines.push('');
    lines.push(`${isAr ? '👤 الاسم' : '👤 Name'}: ${form.name}`);
    lines.push(`${isAr ? '📱 الموبايل' : '📱 Mobile'}: ${form.mobile}`);
    if (form.whatsapp) lines.push(`${isAr ? '💬 واتساب' : '💬 WhatsApp'}: ${form.whatsapp}`);
    if (form.email) lines.push(`${isAr ? '📧 البريد' : '📧 Email'}: ${form.email}`);
    if (form.company) lines.push(`${isAr ? '🏢 الشركة' : '🏢 Company'}: ${form.company}`);
    if (form.country) lines.push(`${isAr ? '🌍 الدولة' : '🌍 Country'}: ${countryLabel}`);
    lines.push('');
    lines.push(`${isAr ? '📦 المنتج' : '📦 Product'}: ${productLabel}`);
    if (varietyLabel) lines.push(`${isAr ? '🏷️ النوع' : '🏷️ Variety'}: ${varietyLabel}`);
    lines.push(`${isAr ? '📊 الكمية' : '📊 Quantity'}: ${form.quantity}`);
    if (packagingLabel) lines.push(`${isAr ? '🎁 التغليف' : '🎁 Packaging'}: ${packagingLabel}`);
    if (form.weight) lines.push(`${isAr ? '⚖️ الوزن' : '⚖️ Weight'}: ${form.weight}`);
    if (form.shipping) lines.push(`${isAr ? '🚚 الشحن' : '🚚 Shipping'}: ${form.shipping === 'land' ? (isAr ? 'بري' : 'Land') : (isAr ? 'بحري' : 'Sea')}`);
    if (destLabel) lines.push(`${isAr ? '🎯 دولة الوصول' : '🎯 Destination'}: ${destLabel}`);
    if (form.notes) lines.push(`${isAr ? '📝 ملاحظات' : '📝 Notes'}: ${form.notes}`);

    const text = encodeURIComponent(lines.join('\n'));
    const waNumber = whatsapp1 || '201090903681';
    window.open(`https://wa.me/${waNumber}?text=${text}`, '_blank');

    setSuccess(true);
    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="order-page" dir={isAr ? 'rtl' : 'ltr'}>
        <header className="order-page-header">
          <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> {t.back}</button>
          <div className="order-brand"><img src="/logo.jpeg" alt="Al-Mokhtar" /><span>AL-MOKHTAR <small>IMPORT & EXPORT</small></span></div>
          <span className="order-country"><Globe2 size={15} /> {t.cairo}</span>
        </header>
        <main className="order-page-main">
          <div className="order-success">
            <div className="order-success-icon"><Check size={64} /></div>
            <h1>{t.success}</h1>
            <p>{t.whatsappSent}</p>
            <button className="button button-gold" onClick={onBack}>
              {isAr ? 'العودة للموقع' : 'Back to website'} <ArrowLeft size={18} />
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="order-page" dir={isAr ? 'rtl' : 'ltr'}>
      <header className="order-page-header">
        <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> {t.back}</button>
        <div className="order-brand"><img src="/logo.jpeg" alt="Al-Mokhtar" /><span>AL-MOKHTAR <small>IMPORT & EXPORT</small></span></div>
        <span className="order-country"><Globe2 size={15} /> {t.cairo}</span>
      </header>
      <main className="order-page-main">
        <div className="order-intro">
          <div className="section-label"><span><ShoppingBag size={14} /></span> {t.eyebrow}</div>
          <h1>{t.title}</h1>
          <p>{t.text}</p>
        </div>
        <form className="order-form" onSubmit={handleSubmit}>
          <div className="order-form-section">
            <div className="order-section-title">{isAr ? 'بيانات العميل' : 'Customer Details'}</div>
            <div className="order-form-grid">
              <label className="order-field">
                <span className="order-field-label">{t.fullName} <em>{t.required}</em></span>
                <input value={form.name} onChange={(e) => set('name', e.target.value)} required />
              </label>
              <label className="order-field">
                <span className="order-field-label">{t.mobile} <em>{t.required}</em></span>
                <input value={form.mobile} onChange={(e) => set('mobile', e.target.value)} required dir="ltr" />
              </label>
              <label className="order-field">
                <span className="order-field-label">{t.whatsapp} <em>{t.optional}</em></span>
                <input value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} dir="ltr" />
              </label>
              <label className="order-field">
                <span className="order-field-label">{t.email} <em>{t.optional}</em></span>
                <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} dir="ltr" />
              </label>
              <label className="order-field">
                <span className="order-field-label">{t.company} <em>{t.optional}</em></span>
                <input value={form.company} onChange={(e) => set('company', e.target.value)} />
              </label>
              <label className="order-field">
                <span className="order-field-label">{t.country} <em>{t.optional}</em></span>
                <select value={form.country} onChange={(e) => set('country', e.target.value)}>
                  <option value="">{t.selectCountry}</option>
                  {countries.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </label>
            </div>
          </div>

          <div className="order-form-section">
            <div className="order-section-title">{isAr ? 'تفاصيل المنتج' : 'Product Details'}</div>
            <div className="order-form-grid">
              <label className="order-field">
                <span className="order-field-label">{t.product} <em>{t.required}</em></span>
                <select value={form.product} onChange={(e) => { set('product', e.target.value); set('variety', ''); }} required>
                  <option value="">{t.selectProduct}</option>
                  {productOptions.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </label>
              <label className="order-field">
                <span className="order-field-label">{t.variety} <em>{t.optional}</em></span>
                <select value={form.variety} onChange={(e) => set('variety', e.target.value)} disabled={!form.product}>
                  <option value="">{form.product ? t.none : t.selectProduct}</option>
                  {productVarieties.length > 0
                    ? productVarieties.map((v) => <option key={v.id} value={v.id}>{isAr ? v.ar : v.label}</option>)
                    : form.product ? <option value="" disabled>{t.noVariety}</option> : null}
                </select>
              </label>
              <label className="order-field">
                <span className="order-field-label">{t.quantity} <em>{t.required}</em></span>
                <input value={form.quantity} onChange={(e) => set('quantity', e.target.value)} required />
              </label>
              <label className="order-field">
                <span className="order-field-label">{t.packagingType} <em>{t.optional}</em></span>
                <select value={form.packaging} onChange={(e) => set('packaging', e.target.value)}>
                  <option value="">{t.selectPackaging}</option>
                  {packagingOptions.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </label>
              <label className="order-field">
                <span className="order-field-label">{t.weight} <em>{t.optional}</em></span>
                <input value={form.weight} onChange={(e) => set('weight', e.target.value)} />
              </label>
            </div>
          </div>

          <div className="order-form-section">
            <div className="order-section-title">{isAr ? 'تفاصيل الشحن' : 'Shipping Details'}</div>
            <div className="order-form-grid">
              <label className="order-field">
                <span className="order-field-label">{t.shippingMethod} <em>{t.optional}</em></span>
                <select value={form.shipping} onChange={(e) => set('shipping', e.target.value)}>
                  <option value="">{t.selectShipping}</option>
                  <option value="land">{t.land}</option>
                  <option value="sea">{t.sea}</option>
                </select>
              </label>
              <label className="order-field">
                <span className="order-field-label">{t.destinationCountry} <em>{t.optional}</em></span>
                <select value={form.destination} onChange={(e) => set('destination', e.target.value)}>
                  <option value="">{t.selectDestination}</option>
                  {countries.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </label>
            </div>
          </div>

          <div className="order-form-section">
            <div className="order-section-title">{isAr ? 'ملاحظات إضافية' : 'Additional Notes'}</div>
            <label className="order-field order-field-full">
              <span className="order-field-label">{t.notes} <em>{t.optional}</em></span>
              <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={4} />
            </label>
          </div>

          {error && <div className="order-error">{error}</div>}

          <button className="order-submit-btn" type="submit" disabled={submitting}>
            {submitting ? <>{t.sending}</> : <>{t.submit} <Send size={18} /></>}
          </button>
        </form>
      </main>
      <footer className="order-page-footer">
        <span>© 2026 Al-Mokhtar Import & Export</span>
        <span>{t.cairo}</span>
      </footer>
    </div>
  );
}
