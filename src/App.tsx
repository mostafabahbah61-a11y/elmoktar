import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { supabase } from '@/lib/supabase';
import { AdminDashboard } from '@/components/AdminDashboard';
import { ContactPage } from '@/components/ContactPage';
import { OrderPage } from '@/components/OrderPage';
import {
  Anchor, ArrowUp, ArrowUpRight, Bot, Check, Globe2, LogIn, LogOut,
  Menu, MessageCircle, Moon, Package, Phone, Search, Send, Ship, Sprout, Sun, Truck, UserRound, X, CheckCircle2,
} from 'lucide-react';

type Lang = 'en' | 'ar';
type AppRoute = {
  page: 'home' | 'category' | 'varieties' | 'variety-detail' | 'product-detail' | 'contact' | 'admin' | 'order';
  category?: string;
  productId?: string;
  varietyId?: string;
};

type ProductDetail = {
  productId: string;
  descriptionAr: string;
  descriptionEn: string;
  featuresAr: string[];
  featuresEn: string[];
  usesAr: string;
  usesEn: string;
  detailImage: string | null;
};

type DbProductDetail = {
  product_id: string;
  description_ar: string | null;
  description_en: string | null;
  features_ar: string[] | null;
  features_en: string[] | null;
  uses_ar: string | null;
  uses_en: string | null;
  detail_image_url: string | null;
};
type Product = {
  id: string;
  label: string;
  ar: string;
  detail: string;
  arDetail: string;
  category: string;
  icon: string;
  image: string;
};

type DbProduct = {
  id: string;
  category: string;
  label_en: string;
  label_ar: string;
  detail_en: string | null;
  detail_ar: string | null;
  image_url: string | null;
  display_order: number;
};

type Variety = {
  id: string;
  productId: string;
  category: string;
  label: string;
  ar: string;
  detail: string;
  arDetail: string;
  image: string;
  order: number;
};

type DbVariety = {
  id: string;
  product_id: string;
  category: string;
  label_en: string;
  label_ar: string;
  detail_en: string | null;
  detail_ar: string | null;
  image_url: string | null;
  display_order: number;
};

const PRODUCTS_WITH_VARIETIES = ['Carrots', 'Potatoes', 'Oranges', 'Lemon', 'Mango', 'Seeds'];
// Note: Lemon is now included above

const HERO_BG = '/large_background_.png';
type SiteMedia = { media_key: string; url: string; alt_en: string; alt_ar: string };

type BotQuestion = {
  id: string;
  question_ar: string;
  question_en: string;
  answer_ar: string;
  answer_en: string;
  display_order: number;
};

const FALLBACK_PRODUCTS: Product[] = [
  { id: 'carrot', label: 'Carrots', ar: 'جزر', detail: 'Fresh, crisp carrots sorted and graded for export quality.', arDetail: 'جزر طازج مقرمش، مفرز ومرتب بجودة تصدير.', category: 'Vegetables', icon: '01', image: 'https://images.pexels.com/photos/33622710/pexels-photo-33622710.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'onion-white', label: 'White Onion', ar: 'بصل أبيض', detail: 'Clean, firm white onions with excellent shelf life.', arDetail: 'بصل أبيض نظيف وصلب بعمر تخزين ممتاز.', category: 'Vegetables', icon: '02', image: 'https://images.pexels.com/photos/32986487/pexels-photo-32986487.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'onion-red', label: 'Red Onion', ar: 'بصل أحمر', detail: 'Deep-colored red onions with a balanced, rich flavor.', arDetail: 'بصل أحمر بلون غني ونكهة متوازنة.', category: 'Vegetables', icon: '03', image: 'https://images.pexels.com/photos/10159434/pexels-photo-10159434.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'potato', label: 'Potatoes', ar: 'بطاطس', detail: 'Carefully graded potatoes for retail and foodservice.', arDetail: 'بطاطس مفرزة بعناية للبيع بالتجزئة والخدمات الغذائية.', category: 'Vegetables', icon: '04', image: 'https://images.pexels.com/photos/15428958/pexels-photo-15428958.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'orange', label: 'Oranges', ar: 'برتقال', detail: 'Selected citrus in multiple sizes and specifications.', arDetail: 'حمضيات مختارة بأحجام ومواصفات متعددة.', category: 'Fruits', icon: '05', image: 'https://images.pexels.com/photos/37543950/pexels-photo-37543950.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'mango', label: 'Mango', ar: 'مانجا', detail: 'Premium mango varieties, prepared for international markets.', arDetail: 'أنواع مانجا فاخرة معدة للأسواق العالمية.', category: 'Fruits', icon: '06', image: 'https://images.pexels.com/photos/30542312/pexels-photo-30542312.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'pack-5', label: '5 kg Sacks', ar: 'شكاير 5 كجم', detail: 'Sacks available in 5 kg weight. Color per customer choice.', arDetail: 'شكاير متوفرة بوزن 5 كجم. اللون حسب اختيار العميل.', category: 'Packaging', icon: '07', image: 'https://images.pexels.com/photos/38352190/pexels-photo-38352190.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'pack-10', label: '10 kg Sacks', ar: 'شكاير 10 كجم', detail: 'Sacks available in 10 kg weight. Color per customer choice.', arDetail: 'شكاير متوفرة بوزن 10 كجم. اللون حسب اختيار العميل.', category: 'Packaging', icon: '08', image: 'https://images.pexels.com/photos/21958122/pexels-photo-21958122.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'pack-15', label: '15 kg Sacks', ar: 'شكاير 15 كجم', detail: 'Sacks available in 15 kg weight. Color per customer choice.', arDetail: 'شكاير متوفرة بوزن 15 كجم. اللون حسب اختيار العميل.', category: 'Packaging', icon: '09', image: 'https://images.pexels.com/photos/10778111/pexels-photo-10778111.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'pack-1530', label: '15-30 kg Sacks', ar: 'شكاير 15-30 كجم', detail: 'Sacks adjustable from 15 kg to 30 kg. Color per customer choice.', arDetail: 'شكاير قابلة للتعديل من 15 كجم إلى 30 كجم. اللون حسب اختيار العميل.', category: 'Packaging', icon: '10', image: 'https://images.pexels.com/photos/21958122/pexels-photo-21958122.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'pack-jumbo', label: 'Big Bags (1-1.5 ton)', ar: 'جامبوهات (1-1.5 طن)', detail: 'Jumbo bags used for onions and potatoes, 1 to 1.5 tons.', arDetail: 'جامبوهات تستخدم للبصل والبطاطس، من 1 إلى 1.5 طن.', category: 'Packaging', icon: '11', image: 'https://images.pexels.com/photos/21958122/pexels-photo-21958122.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'pack-crates', label: 'Wooden/Plastic Crates', ar: 'صناديق خشبية/بلاستيك', detail: 'Wooden or plastic crates for fruits. Weight per agreement: 10 kg, 15 kg.', arDetail: 'صناديق خشبية أو بلاستيك للفاكهة. الوزن حسب الاتفاق: 10 كجم، 15 كجم.', category: 'Packaging', icon: '12', image: 'https://images.pexels.com/photos/38352190/pexels-photo-38352190.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'pack-net', label: 'Net Bags', ar: 'أكياس شبكية', detail: 'Net bags for fruits, breathable and export-ready.', arDetail: 'أكياس شبكية للفاكهة، تسمح بالتهوية وجاهزة للتصدير.', category: 'Packaging', icon: '13', image: 'https://images.pexels.com/photos/10778111/pexels-photo-10778111.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'land', label: 'Land Shipping', ar: 'شحن بري', detail: 'Organized land freight with clear delivery coordination.', arDetail: 'شحن بري منظم بتنسيق تسليم واضح.', category: 'Shipping', icon: '14', image: 'https://images.pexels.com/photos/9754798/pexels-photo-9754798.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'sea', label: 'Sea Shipping', ar: 'شحن بحري', detail: 'Containerized sea freight for international destinations.', arDetail: 'شحن بحري بحاويات لوجهات دولية.', category: 'Shipping', icon: '15', image: 'https://images.pexels.com/photos/20581299/pexels-photo-20581299.jpeg?auto=compress&cs=tinysrgb&w=800' },
];

const copy = {
  en: {
    nav: ['Vegetables', 'Fruits', 'Seeds', 'Packaging', 'Shipping', 'Order Now', 'Contact'],
    heroKicker: 'Freshness in motion',
    heroTitle: 'From Egyptian soil\nto global markets.',
    heroText: 'Al-Mokhtar Import & Export connects carefully selected vegetables and fruits with partners across the world.',
    explore: 'Explore products',
    order: 'Request an order',
    trusted: 'Built for dependable trade',
    categories: 'Our categories',
    categoriesTitle: 'Everything you need for global trade.',
    categoriesText: 'The products, packaging and logistics your business needs — handled with precision.',
    vegetables: 'Vegetables', fruits: 'Fruits', seeds: 'Seeds', packaging: 'Packaging', shipping: 'Shipping',
    productsTitle: '',
    details: 'View details',
    contact: 'Contact us', contactTitle: "Let's start a partnership.",
    contactText: 'Tell us what you need and our team will respond with the right export solution.',
    land: 'Land shipping', sea: 'Sea shipping',
    landDesc: 'Reliable routes · Clear coordination', seaDesc: 'Container-ready · Global destinations',
    search: 'Search products...',
    login: 'Sign in', logout: 'Sign out', account: 'My account',
    chat: 'How can we help?', chatWelcome: 'Welcome. Ask me about products, packaging, shipping, varieties, pricing, minimum order, delivery time, payment, or contact.',
    send: 'Send', request: 'Request product',
    name: 'Full name', phone: 'Phone number', email: 'Email address',
    quantity: 'Quantity', shippingType: 'Shipping type', notes: 'Additional details',
    submit: 'Send request', required: 'Please sign in to send an order request.',
    noResults: 'No products match your search.',
    authTitle: 'Your trade desk', authText: 'Sign in to save your requests and keep every order detail close at hand.',
    signUp: 'Create account', password: 'Password', confirmPassword: 'Confirm password',
    haveAccount: 'Already have an account?', newAccount: 'New here?',
    signUpNow: 'Sign up now',
    passwordMismatch: 'Passwords do not match.',
    passwordTooShort: 'Password must be at least 6 characters.',
    accountExists: 'This email is already registered. Try signing in.',
    success: 'Your request is ready. We saved it and opened WhatsApp for you.',
    whatsapp: 'WhatsApp us', emailUs: 'Email us',
    promiseTitle: 'Coordination that protects quality.',
    promiseText: 'From first selection to final arrival, we coordinate packaging and land or sea shipping with care.',
    fromField: 'From field to container',
    product: 'Product', packagingLabel: 'Packaging',
    callMe: 'Call Me', callMeTitle: 'Call Me', callMeText: 'Enter your name and number, and we will contact you right away.', callMeName: 'Full Name', callMePhone: 'Mobile Number', callMeSend: 'Send',
    exploreTitle: 'Explore Products', exploreText: 'Choose a category to browse.',
  },
  ar: {
    nav: ['الخضار', 'الفاكهة', 'التقاوي', 'التغليف', 'الشحن', 'اطلب الآن', 'تواصل معنا'],
    heroKicker: 'الطزاجة في حركة',
    heroTitle: 'من أرض مصر\nإلى الأسواق العالمية.',
    heroText: 'المختار للاستيراد والتصدير يربط أجود الخضار والفاكهة بشركاء حول العالم.',
    explore: 'اكتشف المنتجات',
    order: 'اطلب الآن',
    trusted: 'تجارة موثوقة من المصدر',
    categories: 'أقسامنا',
    categoriesTitle: 'كل ما تحتاجه للتجارة العالمية.',
    categoriesText: 'المنتجات والتغليف والخدمات اللوجستية التي يحتاجها عملك — بدقة واحتراف.',
    vegetables: 'الخضار', fruits: 'الفاكهة', seeds: 'التقاوي', packaging: 'التغليف', shipping: 'الشحن',
    productsTitle: '',
    details: 'التفاصيل',
    contact: 'تواصل معنا', contactTitle: 'خلّينا نبدأ شراكة.',
    contactText: 'أخبرنا بما تحتاجه وسيقدم لك فريقنا الحل التصديري المناسب.',
    land: 'شحن بري', sea: 'شحن بحري',
    landDesc: 'طرق موثوقة · تنسيق واضح', seaDesc: 'جاهز للحاويات · وجهات عالمية',
    search: 'ابحث عن منتج...',
    login: 'تسجيل الدخول', logout: 'تسجيل الخروج', account: 'حسابي',
    chat: 'كيف يمكننا مساعدتك؟', chatWelcome: 'أهلًا بك. اسألني عن المنتجات أو التغليف أو الشحن أو الأنواع أو الأسعار أو الحد الأدنى للطلب أو مدة التسليم أو الدفع أو التواصل.',
    send: 'إرسال', request: 'طلب منتج',
    name: 'الاسم بالكامل', phone: 'رقم الهاتف', email: 'البريد الإلكتروني',
    quantity: 'الكمية', shippingType: 'طريقة الشحن', notes: 'تفاصيل إضافية',
    submit: 'إرسال الطلب', required: 'يرجى تسجيل الدخول لإرسال طلب.',
    noResults: 'لا توجد منتجات مطابقة للبحث.',
    authTitle: 'مكتب تجارتك', authText: 'سجل الدخول لحفظ طلباتك والاحتفاظ بكل تفاصيل تجارتك.',
    signUp: 'إنشاء حساب', password: 'كلمة المرور', confirmPassword: 'تأكيد كلمة المرور',
    haveAccount: 'لديك حساب بالفعل؟', newAccount: 'جديد هنا؟',
    signUpNow: 'سجل الآن',
    passwordMismatch: 'كلمتا المرور غير متطابقتين.',
    passwordTooShort: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.',
    accountExists: 'هذا البريد مسجل بالفعل. حاول تسجيل الدخول.',
    success: 'تم حفظ طلبك وفتح واتساب لإرساله.',
    whatsapp: 'راسلنا واتساب', emailUs: 'راسلنا بالبريد',
    promiseTitle: 'التنسيق الذي يحافظ على الجودة.',
    promiseText: 'من أول اختيار المنتج وحتى وصوله، ننسق التغليف والشحن البري والبحري بعناية.',
    fromField: 'من الحقل إلى الحاوية',
    product: 'المنتج', packagingLabel: 'التغليف',
    callMe: 'اتصل بي', callMeTitle: 'اتصل بي', callMeText: 'أدخل اسمك ورقمك وسنتواصل معك فورًا.', callMeName: 'الاسم بالكامل', callMePhone: 'رقم الموبايل', callMeSend: 'إرسال',
    exploreTitle: 'اكتشف المنتجات', exploreText: 'اختر قسم للتصفح.',
  },
};

function useScrollReveal(pageKey: string) {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));
    if (elements.length === 0) return;

    const revealVisible = (element: HTMLElement) => {
      const bounds = element.getBoundingClientRect();
      if (bounds.top < window.innerHeight && bounds.bottom > 0) element.classList.add('visible');
    };
    elements.forEach(revealVisible);

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add('visible')),
      { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
    );
    elements.forEach((element) => observer.observe(element));

    const revealFallback = window.setTimeout(() => elements.forEach((element) => element.classList.add('visible')), 1400);
    return () => {
      observer.disconnect();
      window.clearTimeout(revealFallback);
    };
  }, [pageKey]);
}

function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? (scrolled / max) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return <div className="scroll-progress" style={{ width: `${progress}%` }} />;
}

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="logo-3d-wrap">
        <div className="logo-3d">
          <div className="logo-face front"><img src="/logo.jpeg" alt="Al-Mokhtar" /></div>
          <div className="logo-face back"><img src="/logo.jpeg" alt="Al-Mokhtar" /></div>
          <div className="logo-face left"><img src="/logo.jpeg" alt="Al-Mokhtar" /></div>
          <div className="logo-face right"><img src="/logo.jpeg" alt="Al-Mokhtar" /></div>
          <div className="logo-face top"><img src="/logo.jpeg" alt="Al-Mokhtar" /></div>
          <div className="logo-face bottom"><img src="/logo.jpeg" alt="Al-Mokhtar" /></div>
        </div>
      </div>
      <div className="loading-text">AL-MOKHTAR<small>IMPORT & EXPORT</small></div>
      <div className="loading-bar"><div className="loading-bar-fill" /></div>
    </div>
  );
}

function PageTransition({ active }: { active: boolean }) {
  if (!active) return null;
  return <div className="page-transition-overlay active"><div className="page-transition-spinner" /></div>;
}

function App() {
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [lang, setLang] = useState<Lang>('ar');
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Vegetables');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState('');
  const [authOpen, setAuthOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [callMeOpen, setCallMeOpen] = useState(false);
  const [whatsappChooserOpen, setWhatsappChooserOpen] = useState(false);
  const [callMeForm, setCallMeForm] = useState({ name: '', phone: '' });
  const [exploreOpen, setExploreOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [botQuestions, setBotQuestions] = useState<BotQuestion[]>([]);
  const [session, setSession] = useState<{ email?: string } | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authForm, setAuthForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [authError, setAuthError] = useState('');
  const [toast, setToast] = useState('');
  const [products, setProducts] = useState<Product[]>(FALLBACK_PRODUCTS);
  const [varieties, setVarieties] = useState<Variety[]>([]);
  const [siteContent, setSiteContent] = useState<Record<string, string>>({});
  const [siteMedia, setSiteMedia] = useState<Record<string, string>>({});
  const [productDetailsMap, setProductDetailsMap] = useState<Record<string, ProductDetail>>({});
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [view, setView] = useState<'main' | 'category' | 'varieties' | 'variety-detail' | 'product-detail'>('main');
  const [varietyProduct, setVarietyProduct] = useState<Product | null>(null);
  const [selectedVariety, setSelectedVariety] = useState<Variety | null>(null);
  const [route, setRoute] = useState(() => window.location.pathname.toLowerCase());
  const [dark, setDark] = useState(true);
  const [searchFocused, setSearchFocused] = useState(false);
  const isAr = lang === 'ar';
  const t = useMemo(() => {
    const base = copy[lang];
    const localized = (key: string, fallback: string) => siteContent[`${key}_${lang}`] ?? siteContent[key] ?? fallback;
    return {
      ...base,
      heroKicker: localized('hero_kicker', base.heroKicker), heroTitle: localized('hero_title', base.heroTitle), heroText: localized('hero_text', base.heroText),
      explore: localized('hero_explore', base.explore), order: localized('hero_order', base.order), trusted: localized('hero_trusted', base.trusted),
      categoriesTitle: localized('categories_title', base.categoriesTitle), categoriesText: localized('categories_text', base.categoriesText), productsTitle: localized('products_title', base.productsTitle),
      promiseTitle: localized('promise_title', base.promiseTitle), promiseText: localized('promise_text', base.promiseText), contactTitle: localized('contact_title', base.contactTitle), contactText: localized('contact_text', base.contactText),
      landDesc: localized('shipping_land_detail', base.landDesc), seaDesc: localized('shipping_sea_detail', base.seaDesc),
    };
  }, [lang, siteContent]);
  const heroBackground = siteMedia.hero_background ?? HERO_BG;

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 500);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    void (async () => {
      const { data } = await supabase.from('bot_questions').select('id, question_ar, question_en, answer_ar, answer_en, display_order').eq('is_active', true).order('display_order');
      if (data) setBotQuestions(data as BotQuestion[]);
    })();
    const channel = supabase.channel('bot_questions_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bot_questions' }, () => {
        void (async () => {
          const { data } = await supabase.from('bot_questions').select('id, question_ar, question_en, answer_ar, answer_en, display_order').eq('is_active', true).order('display_order');
          if (data) setBotQuestions(data as BotQuestion[]);
        })();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const sendCallMe = () => {
    const lines = isAr
      ? ['اتصل بي ضروري، أنا محتاج أتواصل معكم.', '', `الاسم: ${callMeForm.name}`, `رقم الموبايل: ${callMeForm.phone}`]
      : ['Call me please, I need to communicate with you.', '', `Name: ${callMeForm.name}`, `Mobile: ${callMeForm.phone}`];
    const text = encodeURIComponent(lines.join('\n'));
    const waNumber = siteContent.contact_whatsapp_1 ?? '201090903681';
    window.open(`https://wa.me/${waNumber}?text=${text}`, '_blank');
    setCallMeOpen(false);
    setCallMeForm({ name: '', phone: '' });
  };

  useEffect(() => {
    const initialRoute: AppRoute = window.history.state?.appRoute ?? { page: 'home' };
    window.history.replaceState({ appRoute: initialRoute }, '', window.location.pathname);
    const handlePopState = (event: PopStateEvent) => {
      const nextRoute: AppRoute = event.state?.appRoute ?? { page: 'home' };
      setRoute(window.location.pathname.toLowerCase());
      setMenuOpen(false);
      setSelectedProduct(null);
      setOrderOpen(false);
      setAuthOpen(false);
      if (nextRoute.page === 'category' && nextRoute.category) {
        setActiveCategory(nextRoute.category);
        setVarietyProduct(null);
        setSelectedVariety(null);
        setView('category');
      } else if (nextRoute.page === 'varieties' && nextRoute.productId) {
        const product = products.find((item) => item.id === nextRoute.productId);
        if (product) {
          setVarietyProduct(product);
          setSelectedVariety(null);
          setView('varieties');
        }
      } else if (nextRoute.page === 'product-detail' && nextRoute.productId) {
        const product = products.find((item) => item.id === nextRoute.productId);
        if (product) {
          setDetailProduct(product);
          setVarietyProduct(null);
          setSelectedVariety(null);
          setView('product-detail');
        } else {
          setView('main');
        }
      } else if (nextRoute.page === 'variety-detail' && nextRoute.productId && nextRoute.varietyId) {
        const product = products.find((item) => item.id === nextRoute.productId);
        const variety = varieties.find((item) => item.id === nextRoute.varietyId);
        if (product && variety) {
          setVarietyProduct(product);
          setSelectedVariety(variety);
          setView('variety-detail');
        } else {
          setView('main');
        }
      } else {
        setVarietyProduct(null);
        setSelectedVariety(null);
        setDetailProduct(null);
        setView('main');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [products, varieties]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session?.user ?? null);
      if (data.session?.user) {
        setToast(isAr ? 'أهلًا بعودتك.' : 'Welcome back.');
        setAuthOpen(false);
      }
    });
    const { data } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next?.user ?? null);
      if (event === 'SIGNED_IN' && next?.user) {
        setToast(isAr ? 'تم تسجيل الدخول.' : 'Signed in.');
        setAuthOpen(false);
      }
      if (event === 'SIGNED_OUT') {
        setSession(null);
      }
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  }, [lang, isAr, dark]);

  useEffect(() => {
    void (async () => {
      const [productsResult, contentResult, mediaResult, varietiesResult, detailsResult] = await Promise.all([
        supabase.from('products').select('*').order('category').order('display_order'),
        supabase.from('site_content').select('key, value'),
        supabase.from('site_media').select('media_key, url, alt_en, alt_ar'),
        supabase.from('product_varieties').select('*').order('product_id').order('display_order'),
        supabase.from('product_details').select('*'),
      ]);
      if (detailsResult.data) {
        const detailsMap: Record<string, ProductDetail> = {};
        (detailsResult.data as DbProductDetail[]).forEach((row) => {
          detailsMap[row.product_id] = {
            productId: row.product_id,
            descriptionAr: row.description_ar ?? '',
            descriptionEn: row.description_en ?? '',
            featuresAr: row.features_ar ?? [],
            featuresEn: row.features_en ?? [],
            usesAr: row.uses_ar ?? '',
            usesEn: row.uses_en ?? '',
            detailImage: row.detail_image_url,
          };
        });
        setProductDetailsMap(detailsMap);
      }
      const { data, error } = productsResult;
      if (contentResult.data) {
        const values: Record<string, string> = {};
        contentResult.data.forEach((row: { key: string; value: string | null }) => { if (row.value !== null) values[row.key] = row.value; });
        setSiteContent(values);
      }
      if (mediaResult.data) {
        const values: Record<string, string> = {};
        (mediaResult.data as SiteMedia[]).forEach((row) => { values[row.media_key] = row.url; });
        setSiteMedia(values);
      }
      if (!error && data && data.length > 0) {
        const mapped: Product[] = (data as DbProduct[]).map((row, index) => ({
          id: row.id,
          label: row.label_en,
          ar: row.label_ar,
          detail: row.detail_en ?? '',
          arDetail: row.detail_ar ?? '',
          category: row.category,
          icon: String(index + 1).padStart(2, '0'),
          image: row.image_url ?? '/logo.jpeg',
        }));
        setProducts(mapped);
      }
      if (varietiesResult.data) {
        const mappedVarieties: Variety[] = (varietiesResult.data as DbVariety[]).map((row) => ({
          id: row.id,
          productId: row.product_id,
          category: row.category,
          label: row.label_en,
          ar: row.label_ar,
          detail: row.detail_en ?? '',
          arDetail: row.detail_ar ?? '',
          image: row.image_url ?? '/logo.jpeg',
          order: row.display_order,
        }));
        setVarieties(mappedVarieties);
      }
    })();
  }, []);

  const filteredProducts = useMemo(
    () => search.trim()
      ? products.filter((p) =>
          `${p.label} ${p.ar} ${p.category}`.toLowerCase().includes(search.toLowerCase())
        )
      : products.filter((p) => p.category === activeCategory),
    [activeCategory, products, search]
  );

  const categoryImages: Record<string, string> = {
    Vegetables: 'https://images.pexels.com/photos/4669531/pexels-photo-4669531.jpeg?auto=compress&cs=tinysrgb&w=1200',
    Fruits: 'https://images.pexels.com/photos/18452311/pexels-photo-18452311.jpeg?auto=compress&cs=tinysrgb&w=1200',
    Seeds: 'https://images.pexels.com/photos/15182672/pexels-photo-15182672.jpeg?auto=compress&cs=tinysrgb&w=1200',
  };
  const categoryIcon: Record<string, React.ReactNode> = {
    Vegetables: <span className="produce-mark">01</span>,
    Fruits: <span className="produce-mark fruit">02</span>,
    Seeds: <Sprout size={28} />,
    Packaging: <Package size={28} />,
    Shipping: <Ship size={28} />,
  };

  const showOrder = (product?: Product) => {
    if (product) setSelectedProduct(product);
    setOrderOpen(true);
  };

  const pushRoute = (path: string, appRoute: AppRoute) => {
    setTransitioning(true);
    window.setTimeout(() => {
      window.history.pushState({ appRoute }, '', path);
      setRoute(path.toLowerCase());
      setTransitioning(false);
    }, 800);
  };

  const DETAIL_CATEGORIES = ['Shipping', 'Packaging'];
  const DETAIL_PRODUCT_LABELS = ['White Onion', 'Red Onion'];

  const openProduct = (product: Product) => {
    setTransitioning(true);
    window.setTimeout(() => {
      if (DETAIL_CATEGORIES.includes(product.category) || DETAIL_PRODUCT_LABELS.includes(product.label)) {
        setDetailProduct(product);
        setSelectedProduct(null);
        setVarietyProduct(null);
        setSelectedVariety(null);
        setView('product-detail');
        pushRoute(`/products/${encodeURIComponent(product.id)}/detail`, { page: 'product-detail', productId: product.id });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (PRODUCTS_WITH_VARIETIES.includes(product.label)) {
        setVarietyProduct(product);
        setSelectedVariety(null);
        setView('varieties');
        pushRoute(`/products/${encodeURIComponent(product.id)}`, { page: 'varieties', productId: product.id });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setSelectedProduct(product);
        pushRoute(`/products/${encodeURIComponent(product.id)}`, { page: 'home', productId: product.id });
      }
      setTransitioning(false);
    }, 800);
  };

  const openVariety = (variety: Variety) => {
    const productId = varietyProduct?.id ?? variety.productId;
    setTransitioning(true);
    window.setTimeout(() => {
      setSelectedVariety(variety);
      setView('variety-detail');
      pushRoute(`/products/${encodeURIComponent(productId)}/varieties/${encodeURIComponent(variety.id)}`, {
        page: 'variety-detail', productId, varietyId: variety.id,
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTransitioning(false);
    }, 800);
  };

  const backToMain = () => {
    setTransitioning(true);
    window.setTimeout(() => {
      if (window.history.state?.appRoute?.page !== 'home') {
        pushRoute('/', { page: 'home' });
      }
      setView('main');
      setSelectedProduct(null);
      setVarietyProduct(null);
      setSelectedVariety(null);
      setDetailProduct(null);
      setMenuOpen(false);
      setTransitioning(false);
    }, 800);
  };

  const backToVarieties = () => {
    setTransitioning(true);
    window.setTimeout(() => {
      if (varietyProduct) {
        pushRoute(`/products/${encodeURIComponent(varietyProduct.id)}`, { page: 'varieties', productId: varietyProduct.id });
      }
      setView('varieties');
      setSelectedVariety(null);
      setTransitioning(false);
    }, 800);
  };

  const navigate = (category: string) => {
    setTransitioning(true);
    window.setTimeout(() => {
      setActiveCategory(category);
      setMenuOpen(false);
      setVarietyProduct(null);
      setSelectedVariety(null);
      setView('category');
      pushRoute(`/category/${encodeURIComponent(category.toLowerCase())}`, { page: 'category', category });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTransitioning(false);
    }, 800);
  };

  const handleAuth = async (event: FormEvent) => {
    event.preventDefault();
    setAuthError('');
    if (authMode === 'signup' && authForm.password !== authForm.confirmPassword) {
      setAuthError(isAr ? t.passwordMismatch : t.passwordMismatch);
      return;
    }
    if (authMode === 'signup' && authForm.password.length < 6) {
      setAuthError(isAr ? t.passwordTooShort : t.passwordTooShort);
      return;
    }
    const result = authMode === 'login'
      ? await supabase.auth.signInWithPassword({ email: authForm.email, password: authForm.password })
      : await supabase.auth.signUp({ email: authForm.email, password: authForm.password });
    if (result.error) {
      const msg = result.error.message.toLowerCase();
      if (msg.includes('already') || msg.includes('registered') || msg.includes('exists')) {
        setAuthError(isAr ? t.accountExists : t.accountExists);
      } else {
        setAuthError(isAr ? 'تحقق من بياناتك وحاول مرة أخرى.' : 'Please check your details and try again.');
      }
    } else {
      setAuthOpen(false);
      setAuthForm({ email: '', password: '', confirmPassword: '' });
      setToast(authMode === 'login' ? (isAr ? 'أهلًا بعودتك.' : 'Welcome back.') : (isAr ? 'تم إنشاء حسابك.' : 'Your account is ready.'));
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setToast(isAr ? 'تم تسجيل الخروج.' : 'Signed out.');
  };

  const scrollContact = () => {
    setTransitioning(true);
    window.setTimeout(() => {
      pushRoute('/contact', { page: 'contact' });
      setTransitioning(false);
    }, 800);
  };

  const goToOrder = () => {
    setTransitioning(true);
    window.setTimeout(() => {
      pushRoute('/order', { page: 'order' });
      setTransitioning(false);
    }, 800);
  };

  useScrollReveal(`${loading}-${view}-${route}`);

  if (loading) return <LoadingScreen />;
  if (route === '/admin' || route.startsWith('/admin/')) return <><AdminDashboard onExit={backToMain} /><PageTransition active={transitioning} /></>;
  if (route === '/contact' || route.startsWith('/contact/')) return <><ContactPage lang={lang} onBack={backToMain} content={siteContent} /><PageTransition active={transitioning} /></>;
  if (route === '/order' || route.startsWith('/order/')) return <><OrderPage lang={lang} onBack={backToMain} products={products} varieties={varieties} whatsapp1={siteContent.contact_whatsapp_1 ?? '201090903681'} /><PageTransition active={transitioning} /></>;

  const navItems = ['Vegetables', 'Fruits', 'Seeds', 'Packaging', 'Shipping'];
  const sharedNav = (
    <nav className={menuOpen ? 'open' : ''}>
      <button className="nav-lang-switch" onClick={() => { setLang(isAr ? 'en' : 'ar'); setMenuOpen(false); }}>
        <Globe2 size={18} /> {isAr ? 'English' : 'العربية'}
      </button>
      {t.nav.map((item, index) => (
        <button key={item} onClick={() => index === 6 ? scrollContact() : index === 5 ? goToOrder() : navigate(navItems[index])}>
          {item}
        </button>
      ))}
    </nav>
  );
  const searchDropdown = search.trim() && searchFocused && (
    <div className="search-dropdown">
      {filteredProducts.slice(0, 6).map((p) => (
        <button key={p.id} onMouseDown={() => { openProduct(p); setSearch(''); }}>
          <img src={p.image} alt="" />
          <span>
            <b>{isAr ? p.ar : p.label}</b>
            <small>{p.category}</small>
          </span>
        </button>
      ))}
      {filteredProducts.length === 0 && <div className="search-empty">{t.noResults}</div>}
    </div>
  );
  const sharedHeaderActions = (
    <div className="header-actions">
      <div className="header-search">
        <Search size={16} />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); if (view !== 'main') backToMain(); }}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
          placeholder={t.search}
        />
        {searchDropdown}
      </div>
      <button className="theme-toggle" onClick={() => setDark(!dark)}>
        {dark ? <Sun size={16} /> : <Moon size={16} />}
      </button>
      <div className="header-search-mobile">
        <Search size={16} />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); if (view !== 'main') backToMain(); }}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
          placeholder={t.search}
        />
        {searchDropdown}
      </div>
      {session ? (
        <button className="account-btn" onClick={signOut}>
          <LogOut size={17} /> {t.logout}
        </button>
      ) : (
        <button className="account-btn" onClick={() => setAuthOpen(true)}>
          <UserRound size={17} /> {t.login}
        </button>
      )}
      <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? <X /> : <Menu />}
      </button>
    </div>
  );
  const sharedFooter = (
    <footer>
      <div className="brand footer-brand">
        <img src="/logo.jpeg" alt="Al-Mokhtar" />
        <span>AL-MOKHTAR <small>IMPORT & EXPORT</small></span>
      </div>
      <span>© 2026 Al-Mokhtar Import & Export</span>
      <span>CAIRO · EGYPT</span>
    </footer>
  );
  const sharedOverlays = (
    <>
      {orderOpen && (
        <OrderModal
          product={selectedProduct ?? varietyProduct}
          session={session}
          t={t}
          isAr={isAr}
          onClose={() => setOrderOpen(false)}
          onAuth={() => { setOrderOpen(false); setAuthOpen(true); }}
          onSuccess={(message) => { setOrderOpen(false); setToast(message); }}
          whatsapp={siteContent.contact_whatsapp_1 ?? '201090903681'}
        />
      )}
      {authOpen && (
        <AuthModal
          mode={authMode}
          setMode={setAuthMode}
          form={authForm}
          setForm={setAuthForm}
          error={authError}
          t={t}
          isAr={isAr}
          onClose={() => setAuthOpen(false)}
          onSubmit={handleAuth}
        />
      )}
      {whatsappChooserOpen && (
        <div className="modal-backdrop" onClick={() => setWhatsappChooserOpen(false)}>
          <div className="whatsapp-choice-modal" onClick={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setWhatsappChooserOpen(false)}><X /></button>
            <div className="section-label"><MessageCircle size={16} /> {isAr ? 'واتساب' : 'WhatsApp'}</div>
            <h2>{isAr ? 'اختار الرقم للتواصل' : 'Choose a WhatsApp number'}</h2>
            <p>{isAr ? 'اختار الرقم المناسب وسيتم فتح المحادثة مباشرة.' : 'Choose the number you want to contact.'}</p>
            <div className="whatsapp-choice-list">
              {[siteContent.contact_whatsapp_1 ?? '201090903681', siteContent.contact_whatsapp_2 ?? '201276785117'].map((number) => (
                <a key={number} href={`https://wa.me/${number}`} target="_blank" rel="noreferrer" onClick={() => setWhatsappChooserOpen(false)}>
                  <MessageCircle size={18} /> <span dir="ltr">+{number}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
      {toast && (
        <div className="toast">
          <Check size={17} /> {toast}
          <button onClick={() => setToast('')}><X size={15} /></button>
        </div>
      )}
    </>
  );

  if (view === 'category') {
    const categoryProducts = products.filter((p) => p.category === activeCategory);
    const categoryLabel = activeCategory === 'Seeds'
      ? (isAr ? 'التقاوي' : 'Seeds')
      : t[activeCategory.toLowerCase() as 'vegetables' | 'fruits' | 'packaging' | 'shipping'] ?? activeCategory;
    return (
      <div className="app-shell page-enter" style={{ direction: isAr ? 'rtl' : 'ltr' }}>
        <ScrollProgress />
        <div className="grain" />
        <PageTransition active={transitioning} />
        <header className="site-header">
          <a className="brand" href="#top" onClick={(e) => { e.preventDefault(); backToMain(); }}>
            <img src="/logo.jpeg" alt="Al-Mokhtar" />
            <span>AL-MOKHTAR <small>IMPORT & EXPORT</small></span>
          </a>
          {sharedNav}
          {sharedHeaderActions}
        </header>
        <main id="top">
          <section className="variety-page">
            <button className="variety-page-back" onClick={backToMain}>
              <ArrowUpRight size={16} style={{ transform: 'rotate(180deg)' }} />
              {isAr ? 'رجوع للرئيسية' : 'Back to home'}
            </button>
            <div className="variety-page-header reveal">
              <div className="section-label"><span>02</span> {categoryLabel}</div>
              <h2>{categoryLabel}</h2>
            </div>
            <div className="variety-grid">
              {categoryProducts.map((product) => (
                <article className="variety-card" key={product.id} onClick={() => openProduct(product)}>
                  <div className="variety-card-img" style={{ backgroundImage: `url(${product.image})` }} />
                  <div className="variety-card-body">
                    <span>{product.icon}</span>
                    <h4>{isAr ? product.ar : product.label}</h4>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </main>
        {sharedFooter}
        <button className="chat-trigger" onClick={() => setChatOpen(!chatOpen)}>
          {chatOpen ? <X /> : <Bot />}
          <span>{t.chat}</span>
        </button>
        {chatOpen && <ChatPanel t={t} isAr={isAr} onClose={() => setChatOpen(false)} botQuestions={botQuestions} />}
        {sharedOverlays}
      </div>
    );
  }

  if (view === 'variety-detail' && selectedVariety) {
    return (
      <div className="app-shell page-enter" style={{ direction: isAr ? 'rtl' : 'ltr' }}>
        <ScrollProgress />
        <div className="grain" />
        <PageTransition active={transitioning} />
        <header className="site-header">
          <a className="brand" href="#top" onClick={(e) => { e.preventDefault(); backToMain(); }}>
            <img src="/logo.jpeg" alt="Al-Mokhtar" />
            <span>AL-MOKHTAR <small>IMPORT & EXPORT</small></span>
          </a>
          {sharedNav}
          {sharedHeaderActions}
        </header>
        <main id="top">
          <section className="variety-detail">
            <button className="variety-detail-back" onClick={backToVarieties}>
              <ArrowUpRight size={16} style={{ transform: 'rotate(180deg)' }} />
              {isAr ? 'رجوع للأنواع' : 'Back to varieties'}
            </button>
            <div className="variety-detail-grid reveal">
              <div className="variety-detail-img" style={{ backgroundImage: `url(${selectedVariety.image})` }} />
              <div className="variety-detail-info">
                <div className="section-label"><span>★</span> {selectedVariety.category}</div>
                <h1>{isAr ? selectedVariety.ar : selectedVariety.label}</h1>
                <p>{isAr ? selectedVariety.arDetail : selectedVariety.detail}</p>
                <div className="variety-detail-specs">
                  <div><span>{isAr ? 'القسم' : 'Category'}</span><span>{selectedVariety.category}</span></div>
                  <div><span>{isAr ? 'المنتج' : 'Product'}</span><span>{varietyProduct ? (isAr ? varietyProduct.ar : varietyProduct.label) : '-'}</span></div>
                  <div><span>{isAr ? 'النوع' : 'Variety'}</span><span>{isAr ? selectedVariety.ar : selectedVariety.label}</span></div>
                </div>
                <button className="button button-gold full" style={{ marginTop: '30px' }} onClick={() => showOrder(varietyProduct ?? undefined)}>
                  {t.request} <ArrowUpRight size={18} />
                </button>
              </div>
            </div>
            <VarietyGallery varietyId={selectedVariety.id} mainImage={selectedVariety.image} isAr={isAr} />
          </section>
        </main>
        {sharedFooter}
        {sharedOverlays}
      </div>
    );
  }

  if (view === 'varieties' && varietyProduct) {
    const productVarieties = varieties.filter((v) => v.productId === varietyProduct.label);
    return (
      <div className="app-shell page-enter" style={{ direction: isAr ? 'rtl' : 'ltr' }}>
        <ScrollProgress />
        <div className="grain" />
        <PageTransition active={transitioning} />
        <header className="site-header">
          <a className="brand" href="#top" onClick={(e) => { e.preventDefault(); backToMain(); }}>
            <img src="/logo.jpeg" alt="Al-Mokhtar" />
            <span>AL-MOKHTAR <small>IMPORT & EXPORT</small></span>
          </a>
          {sharedNav}
          {sharedHeaderActions}
        </header>
        <main id="top">
          <section className="variety-page">
            <button className="variety-page-back" onClick={backToMain}>
              <ArrowUpRight size={16} style={{ transform: 'rotate(180deg)' }} />
              {isAr ? 'رجوع للمنتجات' : 'Back to products'}
            </button>
            <div className="variety-page-header reveal">
              <div className="section-label"><span>02</span> {varietyProduct.category}</div>
              <h2>{isAr ? varietyProduct.ar : varietyProduct.label}</h2>
              <p>{isAr ? varietyProduct.arDetail : varietyProduct.detail}</p>
            </div>
            <div className="variety-grid">
              {productVarieties.map((v) => (
                <article className="variety-card" key={v.id} onClick={() => openVariety(v)}>
                  <div className="variety-card-img" style={{ backgroundImage: `url(${v.image})` }} />
                  <div className="variety-card-body">
                    <span>{v.order.toString().padStart(2, '0')}</span>
                    <h4>{isAr ? v.ar : v.label}</h4>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </main>
        {sharedFooter}
        <button className="chat-trigger" onClick={() => setChatOpen(!chatOpen)}>
          {chatOpen ? <X /> : <Bot />}
          <span>{t.chat}</span>
        </button>
        {chatOpen && (
          <ChatPanel t={t} isAr={isAr} onClose={() => setChatOpen(false)} botQuestions={botQuestions} />
        )}
        {sharedOverlays}
      </div>
    );
  }

  if (view === 'product-detail' && detailProduct) {
    const detail = productDetailsMap[detailProduct.id];
    const detailImage = detail?.detailImage ?? detailProduct.image;
    const features = isAr ? (detail?.featuresAr ?? []) : (detail?.featuresEn ?? []);
    const description = isAr ? (detail?.descriptionAr ?? detailProduct.arDetail) : (detail?.descriptionEn ?? detailProduct.detail);
    const uses = isAr ? detail?.usesAr : detail?.usesEn;
    return (
      <div className="app-shell page-enter" style={{ direction: isAr ? 'rtl' : 'ltr' }}>
        <ScrollProgress />
        <div className="grain" />
        <PageTransition active={transitioning} />
        <header className="site-header">
          <a className="brand" href="#top" onClick={(e) => { e.preventDefault(); backToMain(); }}>
            <img src="/logo.jpeg" alt="Al-Mokhtar" />
            <span>AL-MOKHTAR <small>IMPORT & EXPORT</small></span>
          </a>
          {sharedNav}
          {sharedHeaderActions}
        </header>
        <main id="top">
          <section className="product-detail-page">
            <button className="variety-detail-back" onClick={() => { if (detailProduct.category === 'Shipping' || detailProduct.category === 'Packaging') { backToMain(); } else { backToMain(); } }}>
              <ArrowUpRight size={16} style={{ transform: 'rotate(180deg)' }} />
              {isAr ? 'رجوع' : 'Back'}
            </button>
            <div className="product-detail-hero reveal">
              <div className="product-detail-hero-img" style={{ backgroundImage: `url(${detailImage})` }}>
                <div className="product-detail-hero-overlay" />
              </div>
              <div className="product-detail-hero-info">
                <div className="section-label"><span>★</span> {detailProduct.category}</div>
                <h1>{isAr ? detailProduct.ar : detailProduct.label}</h1>
                <p>{description}</p>
              </div>
            </div>
            {features.length > 0 && (
              <div className="product-detail-features reveal reveal-delay-1">
                <div className="product-detail-section-title">{isAr ? 'المميزات' : 'Features'}</div>
                <div className="product-detail-features-grid">
                  {features.map((feature, i) => (
                    <div className="product-detail-feature-item" key={i}>
                      <CheckCircle2 size={20} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {uses && (
              <div className="product-detail-uses reveal reveal-delay-2">
                <div className="product-detail-section-title">{isAr ? 'الاستخدامات المناسبة' : 'Suitable Uses'}</div>
                <p>{uses}</p>
              </div>
            )}
            <div className="product-detail-cta reveal reveal-delay-3">
              <button className="button button-gold" onClick={() => showOrder(detailProduct)}>
                {t.request} <ArrowUpRight size={18} />
              </button>
            </div>
          </section>
        </main>
        {sharedFooter}
        <button className="chat-trigger" onClick={() => setChatOpen(!chatOpen)}>
          {chatOpen ? <X /> : <Bot />}
          <span>{t.chat}</span>
        </button>
        {chatOpen && <ChatPanel t={t} isAr={isAr} onClose={() => setChatOpen(false)} botQuestions={botQuestions} />}
        {sharedOverlays}
      </div>
    );
  }


  return (
    <div className="app-shell page-enter" style={{ direction: isAr ? 'rtl' : 'ltr' }}>
      <ScrollProgress />
      <div className="grain" />
      <PageTransition active={transitioning} />

      <header className="site-header">
        <a className="brand" href="#top">
          <img src="/logo.jpeg" alt="Al-Mokhtar" />
          <span>AL-MOKHTAR <small>IMPORT & EXPORT</small></span>
        </a>
        {sharedNav}
        {sharedHeaderActions}
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-image" style={{ backgroundImage: `url(${heroBackground})` }} />
          <div className="hero-overlay" />
          <div className="hero-content">
            <div className="eyebrow"><span /> {t.heroKicker}</div>
            <h1>{t.heroTitle.split(/\\n|\n/).map((line: string, i: number) => (
              <span key={i} style={{ display: 'block' }}>{line}</span>
            ))}</h1>
            <div className="hero-scroll">
              <span><br /></span>
              <div className="hero-scroll-line" />
            </div>
            <p>{t.heroText}</p>
            <div className="hero-cta">
              <button className="button button-gold" onClick={() => setExploreOpen(true)}>
                {t.explore} <ArrowUpRight size={18} />
              </button>
              <button className="button button-gold" onClick={() => goToOrder()}>
                {t.order}
              </button>
              <button className="button button-call" onClick={() => setCallMeOpen(true)}>
                <Phone size={17} /> {t.callMe}
              </button>
            </div>
            <div className="hero-note">
              <Anchor size={17} /> <span><br /></span>
            </div>
          </div>
        </section>

        <section className="ticker">
          <div>{isAr
            ? <>منتجات طازجة <span>✦</span> وصول عالمي <span>✦</span> تجارة مسؤولة <span>✦</span> منتجات طازجة <span>✦</span> وصول عالمي <span>✦</span> تجارة مسؤولة <span>✦</span></>
            : <>FRESH PRODUCE <span>✦</span> GLOBAL REACH <span>✦</span> RESPONSIBLE TRADE <span>✦</span> FRESH PRODUCE <span>✦</span> GLOBAL REACH <span>✦</span> RESPONSIBLE TRADE <span>✦</span></>
          }</div>
        </section>

        <section className="intro-section">
          <div className="section-label reveal"><span><br /></span> {t.categories}</div>
          <div className="intro-grid reveal reveal-delay-1">
            <div><h2>{t.categoriesTitle}</h2></div>
            <p>{t.categoriesText}</p>
          </div>
          <div className="cat-showcase">
            {(['Vegetables', 'Fruits', 'Seeds'] as const).map((category, i) => (
              <button
                className={`cat-tile ${activeCategory === category ? 'active' : ''}`}
                key={category}
                onClick={() => navigate(category)}
                style={{ '--cat-img': `url(${categoryImages[category]})` } as React.CSSProperties}
              >
                <div className="cat-tile-bg" />
                <div className="cat-tile-overlay" />
                <div className="cat-tile-content">
                  <div className="cat-tile-top">
                    <span className="cat-tile-num">{`0${i + 1}`}</span>
                    {categoryIcon[category]}
                  </div>
                  <div className="cat-tile-bottom">
                    <h3>{t[category.toLowerCase() as 'vegetables' | 'fruits' | 'seeds']}</h3>
                    <span className="cat-tile-arrow"><ArrowUpRight size={24} /></span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="promise-section">
          <div className="promise-image reveal" style={{ backgroundImage: `url(${siteMedia.promise_image ?? HERO_BG})` }}>
            <div className="promise-overlay" />
            <div className="promise-caption">
              <span>03</span>
              <strong>{t.fromField}</strong>
            </div>
          </div>
          <div className="promise-copy reveal reveal-delay-1">
            <div className="section-label"><span><br /></span> {t.shipping}</div>
            <h2>{t.promiseTitle}</h2>
            <p>{t.promiseText}</p>
            <div className="service-list">
              <button onClick={() => navigate('Shipping')}>
                <Truck size={24} />
                <span><b>{t.land}</b><small>{t.landDesc}</small></span>
                <ArrowUpRight size={18} />
              </button>
              <button onClick={() => navigate('Shipping')}>
                <Ship size={24} />
                <span><b>{t.sea}</b><small>{t.seaDesc}</small></span>
                <ArrowUpRight size={18} />
              </button>
            </div>
          </div>
        </section>

        <section id="contact" className="contact-section">
          <div className="section-label reveal"><span><br /></span> {t.contact}</div>
          <div className="contact-grid reveal reveal-delay-1">
            <div>
              <h2>{t.contactTitle}</h2>
              <p>{t.contactText}</p>
            </div>
            <div className="contact-links">
              <a href={`mailto:${siteContent.contact_email ?? 'almokhtarimportexport02@gmail.com'}`}>
                <span className="contact-icon"><Send size={19} /></span>
                <div>
                  <small>{t.emailUs}</small>
                  <b>{siteContent.contact_email ?? 'almokhtarimportexport02@gmail.com'}</b>
                </div>
              </a>
              <button className="contact-link-button" onClick={() => setWhatsappChooserOpen(true)}>
                <span className="contact-icon"><MessageCircle size={19} /></span>
                <div>
                  <small>{t.whatsapp}</small>
                  <b dir="ltr">+{siteContent.contact_whatsapp_1 ?? '201090903681'} · +{siteContent.contact_whatsapp_2 ?? '201276785117'}</b>
                </div>
              </button>
              <a href={siteContent.contact_facebook ?? 'https://www.facebook.com/share/1Dk6EGYJrn/?mibextid=wwXIfr'} target="_blank" rel="noreferrer">
                <span className="contact-icon"><span className="social-letter">f</span></span>
                <div>
                  <small>Facebook</small>
                  <b>Al-Mokhtar Import & Export</b>
                </div>
              </a>
            </div>
          </div>
        </section>
      </main>

      {sharedFooter}

      <button className="chat-trigger" onClick={() => setChatOpen(!chatOpen)}>
        {chatOpen ? <X /> : <Bot />}
        <span>{t.chat}</span>
      </button>
      {chatOpen && (
        <ChatPanel t={t} isAr={isAr} onClose={() => setChatOpen(false)} botQuestions={botQuestions} />
      )}

      {selectedProduct && !orderOpen && (
        <div className="modal-backdrop" onClick={() => setSelectedProduct(null)}>
          <div className="product-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedProduct(null)}><X /></button>
            <div className="modal-art" style={{ backgroundImage: `url(${selectedProduct.image})` }}>
              <div className="modal-art-overlay" />
              <span className="modal-art-num">{selectedProduct.icon}</span>
            </div>
            <div className="section-label">{selectedProduct.category}</div>
            <h2>{isAr ? selectedProduct.ar : selectedProduct.label}</h2>
            <p>{isAr ? selectedProduct.arDetail : selectedProduct.detail}</p>
            <button className="button button-gold full" onClick={() => showOrder(selectedProduct)}>
              {t.request} <ArrowUpRight size={18} />
            </button>
          </div>
        </div>
      )}

      {showScrollTop && (
        <button className="scroll-top-btn" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Scroll to top">
          <ArrowUp size={22} />
        </button>
      )}

      {exploreOpen && (
        <div className="modal-backdrop" onClick={() => setExploreOpen(false)}>
          <div className="explore-modal" onClick={(e) => e.stopPropagation()}>
            <div className="explore-modal-head">
              <div>
                <div className="section-label">{t.explore}</div>
                <h2>{t.exploreTitle}</h2>
              </div>
              <button className="explore-close-btn" onClick={() => setExploreOpen(false)} aria-label="Close"><X size={24} /></button>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: 15, marginBottom: 28 }}>{t.exploreText}</p>
            <div className="explore-cards">
              {(['Vegetables', 'Fruits', 'Seeds'] as const).map((category, i) => (
                <button
                  className="explore-card"
                  key={category}
                  onClick={() => { setExploreOpen(false); navigate(category); }}
                  style={{ '--cat-img': `url(${categoryImages[category]})` } as React.CSSProperties}
                >
                  <div className="cat-tile-bg" />
                  <div className="cat-tile-overlay" />
                  <div className="cat-tile-content">
                    <div className="cat-tile-top">
                      <span className="cat-tile-num">{`0${i + 1}`}</span>
                      {categoryIcon[category]}
                    </div>
                    <div className="cat-tile-bottom">
                      <h3>{t[category.toLowerCase() as 'vegetables' | 'fruits' | 'seeds']}</h3>
                      <span className="cat-tile-arrow"><ArrowUpRight size={22} /></span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {callMeOpen && (
        <div className="modal-backdrop" onClick={() => setCallMeOpen(false)}>
          <div className="callme-modal" onClick={(e) => e.stopPropagation()}>
            <div className="callme-modal-head">
              <div className="callme-icon"><Phone size={28} /></div>
              <h2>{t.callMeTitle}</h2>
              <button className="explore-close-btn" onClick={() => setCallMeOpen(false)} aria-label="Close"><X size={24} /></button>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>{t.callMeText}</p>
            <label className="callme-field">
              <span>{t.callMeName}</span>
              <input value={callMeForm.name} onChange={(e) => setCallMeForm({ ...callMeForm, name: e.target.value })} />
            </label>
            <label className="callme-field">
              <span>{t.callMePhone}</span>
              <input value={callMeForm.phone} onChange={(e) => setCallMeForm({ ...callMeForm, phone: e.target.value })} dir="ltr" />
            </label>
            <button
              className="button button-gold full"
              onClick={() => sendCallMe()}
              disabled={!callMeForm.name.trim() || !callMeForm.phone.trim()}
              style={{ opacity: (!callMeForm.name.trim() || !callMeForm.phone.trim()) ? .5 : 1 }}
            >
              <Phone size={17} /> {t.callMeSend}
            </button>
          </div>
        </div>
      )}

      {sharedOverlays}
    </div>
  );
}

function VarietyGallery({ varietyId, mainImage, isAr }: { varietyId: string; mainImage: string; isAr: boolean }) {
  const [photos, setPhotos] = useState<string[]>([]);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const { data } = await supabase.from('variety_photos').select('image_url').eq('variety_id', varietyId).order('display_order');
      if (data) setPhotos((data as { image_url: string }[]).map((r) => r.image_url));
    })();
  }, [varietyId]);

  const allImages = [mainImage, ...photos];
  if (photos.length === 0) return null;

  return (
    <div className="variety-gallery reveal reveal-delay-2">
      <div className="variety-gallery-title">{isAr ? 'معرض الصور' : 'Photo Gallery'}</div>
      <div className="variety-gallery-grid">
        {allImages.map((img, i) => (
          <button key={i} className="variety-gallery-item" onClick={() => setLightbox(img)}>
            <div style={{ backgroundImage: `url(${img})` }} />
          </button>
        ))}
      </div>
      {lightbox && (
        <div className="gallery-lightbox" onClick={() => setLightbox(null)}>
          <button className="gallery-lightbox-close"><X size={24} /></button>
          <div className="gallery-lightbox-img" style={{ backgroundImage: `url(${lightbox})` }} onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}

function ChatPanel({ t, isAr, onClose, botQuestions }: { t: typeof copy.en; isAr: boolean; onClose: () => void; botQuestions: BotQuestion[] }) {
  const [messages, setMessages] = useState<{ from: 'bot' | 'user'; text: string }[]>([
    { from: 'bot', text: t.chatWelcome },
  ]);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bodyRef.current?.scrollTo(0, bodyRef.current.scrollHeight);
  }, [messages]);

  const handleQuestion = (q: BotQuestion) => {
    const question = isAr ? q.question_ar : q.question_en;
    const answer = isAr ? q.answer_ar : q.answer_en;
    setMessages((prev) => [...prev, { from: 'user', text: question }]);
    setTimeout(() => setMessages((prev) => [...prev, { from: 'bot', text: answer }]), 300);
  };

  return (
    <div className="chat-panel">
      <div className="chat-head">
        <Bot size={21} />
        <div>
          <b>Al-Mokhtar Assistant</b>
          <small>Online · {isAr ? 'معلومات المنتجات' : 'Product information'}</small>
        </div>
        <button onClick={onClose}><X size={16} /></button>
      </div>
      <div className="chat-body" ref={bodyRef}>
        {messages.map((msg, i) => (
          <div key={i} className={msg.from === 'bot' ? 'bot-bubble' : 'user-bubble'}>
            {msg.text}
          </div>
        ))}
        <div className="chat-suggestions">
          {botQuestions.map((q) => (
            <button key={q.id} onClick={() => handleQuestion(q)}>
              {isAr ? q.question_ar : q.question_en}
            </button>
          ))}
          {botQuestions.length === 0 && (
            <div style={{ color: 'var(--muted)', fontSize: 13, padding: '8px 0' }}>
              {isAr ? 'لا توجد أسئلة متاحة حاليًا.' : 'No questions available right now.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function OrderModal({
  product, session, t, isAr, onClose, onAuth, onSuccess, whatsapp,
}: {
  product: Product | null;
  session: { email?: string } | null;
  t: typeof copy.en;
  isAr: boolean;
  onClose: () => void;
  onAuth: () => void;
  onSuccess: (message: string) => void;
  whatsapp: string;
}) {
  const [form, setForm] = useState({
    name: '', phone: '', email: session?.email ?? '',
    quantity: '', packaging: '', shipping: '', notes: '',
  });
  const [error, setError] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!session) { onAuth(); return; }
    if (!form.name || !form.phone || !form.quantity) {
      setError(isAr ? 'يرجى ملء الاسم والهاتف والكمية.' : 'Please fill in name, phone and quantity.');
      return;
    }
    const { error: insertError } = await supabase.from('orders').insert({
      customer_name: form.name,
      customer_phone: form.phone,
      customer_email: form.email || null,
      product_category: product?.category ?? 'General',
      product_name: product ? (isAr ? product.ar : product.label) : 'General inquiry',
      quantity: form.quantity,
      packaging: form.packaging || null,
      shipping_type: form.shipping || null,
      notes: form.notes || null,
    });
    if (insertError) {
      setError(isAr ? 'تعذر حفظ الطلب. حاول مرة أخرى.' : 'We could not save your request. Please try again.');
      return;
    }
    const text =
      `${isAr ? 'طلب جديد من الموقع' : 'New website order'}%0A%0A` +
      `${t.name}: ${form.name}%0A` +
      `${t.phone}: ${form.phone}%0A` +
      `${t.email}: ${form.email || '-'}%0A` +
      `${t.product}: ${product ? (isAr ? product.ar : product.label) : '-'}%0A` +
      `${t.quantity}: ${form.quantity}%0A` +
      `${t.packagingLabel}: ${form.packaging || '-'}%0A` +
      `${t.shippingType}: ${form.shipping || '-'}%0A` +
      `${t.notes}: ${form.notes || '-'}`;
    window.open(`https://wa.me/${whatsapp}?text=${text}`, '_blank');
    onSuccess(t.success);
  };

  return (
    <div className="modal-backdrop">
      <div className="form-modal">
        <button className="modal-close" onClick={onClose}><X /></button>
        <div className="section-label"><span>06</span> {t.request}</div>
        <h2>{product ? (isAr ? product.ar : product.label) : t.request}</h2>
        <p>{session ? t.contactText : t.required}</p>
        {!session ? (
          <button className="button button-gold full" onClick={onAuth}>
            {t.login} <LogIn size={18} />
          </button>
        ) : (
          <form onSubmit={submit}>
            <div className="form-grid">
              <label>{t.name}
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </label>
              <label>{t.phone}
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
              </label>
              <label>{t.email}
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </label>
              <label>{t.quantity}
                <input value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
              </label>
              <label>{t.packagingLabel}
                <input value={form.packaging} onChange={(e) => setForm({ ...form, packaging: e.target.value })} />
              </label>
              <label>{t.shippingType}
                <select value={form.shipping} onChange={(e) => setForm({ ...form, shipping: e.target.value })}>
                  <option value="">—</option>
                  <option>{t.land}</option>
                  <option>{t.sea}</option>
                </select>
              </label>
            </div>
            <label className="full-label">{t.notes}
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
            </label>
            {error && <div className="form-error">{error}</div>}
            <button className="button button-gold full" type="submit">
              {t.submit} <Send size={18} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function AuthModal({
  mode, setMode, form, setForm, error, t, isAr, onClose, onSubmit,
}: {
  mode: 'login' | 'signup';
  setMode: (mode: 'login' | 'signup') => void;
  form: { email: string; password: string; confirmPassword: string };
  setForm: (form: { email: string; password: string; confirmPassword: string }) => void;
  error: string;
  t: typeof copy.en;
  isAr: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
}) {
  return (
    <div className="modal-backdrop">
      <div className="auth-modal">
        <div className="auth-mark"><img src="/logo.jpeg" alt="Al-Mokhtar" /></div>
        <div className="section-label">{t.authTitle}</div>
        <h2>{mode === 'login' ? (isAr ? 'تسجيل الدخول' : 'Sign in') : (isAr ? 'إنشاء حساب' : 'Create account')}</h2>
        <button className="auth-back-link" onClick={onClose}>
          {isAr ? 'العودة للموقع' : 'Back to site'}
        </button>
        <p>{t.authText}</p>
        <form onSubmit={onSubmit}>
          <label>{t.email}
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </label>
          <label>{t.password}
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} minLength={6} required />
          </label>
          {mode === 'signup' && (
            <label>{t.confirmPassword}
              <input type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} minLength={6} required />
            </label>
          )}
          {error && <div className="form-error">{error}</div>}
          <button className="button button-gold full" type="submit">
            {mode === 'login' ? (isAr ? 'تسجيل الدخول' : 'Sign in') : (isAr ? 'إنشاء الحساب' : 'Create account')} <ArrowUpRight size={18} />
          </button>
        </form>
        <button className="text-switch" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setForm({ email: form.email, password: '', confirmPassword: '' }); }}>
          {mode === 'login'
            ? (isAr ? `${t.newAccount} ${t.signUpNow}` : `${t.newAccount} ${t.signUpNow}`)
            : (isAr ? `${t.haveAccount} ${t.login}` : `${t.haveAccount} ${t.login}`)}
        </button>
      </div>
    </div>
  );
}

export default App;
