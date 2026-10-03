import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { supabase } from '@/lib/supabase';
import { BarChart3, Check, FileText, ImagePlus, LayoutDashboard, LogOut, Package, Pencil, Plus, Save, ShoppingBag, Truck, Users, Bot, X, Upload, Trash2, ListChecks, MessageCircle, ChevronUp, ChevronDown, Sprout, Images } from 'lucide-react';

type ProductRow = { id: string; category: string; label_en: string; label_ar: string; detail_en: string | null; detail_ar: string | null; image_url: string | null; display_order: number };
type VarietyRow = { id: string; product_id: string; category: string; label_en: string; label_ar: string; detail_en: string | null; detail_ar: string | null; image_url: string | null; display_order: number };
type VarietyPhotoRow = { id: string; variety_id: string; image_url: string; display_order: number };
type OrderRow = { id: string; customer_name: string; customer_phone: string; product_name: string; quantity: string; status: string; created_at: string };
type ContentRow = { key: string; value: string | null };
type MediaRow = { id: string; media_key: string; url: string; alt_en: string; alt_ar: string };
type BotRow = { id: string; enabled: boolean; system_prompt_ar: string; system_prompt_en: string };
type UserRow = { id: string; email: string | null; created_at: string; last_sign_in_at: string | null };
type ProductDetailRow = {
  product_id: string;
  description_ar: string | null;
  description_en: string | null;
  features_ar: string[] | null;
  features_en: string[] | null;
  uses_ar: string | null;
  uses_en: string | null;
  detail_image_url: string | null;
};
type AdminDashboardProps = { onExit: () => void };

const categories = ['Vegetables', 'Fruits', 'Packaging', 'Shipping'];
const contentGroups: Record<string, string[]> = {
  'نصوص الصفحة الرئيسية': ['hero_kicker', 'hero_title', 'hero_text', 'hero_explore', 'hero_order', 'hero_trusted', 'categories_title', 'categories_text', 'products_title', 'promise_title', 'promise_text', 'contact_title', 'contact_text', 'footer_note'],
  'صفحة تواصل معنا': ['contact_email', 'contact_whatsapp_1', 'contact_whatsapp_2', 'contact_facebook'],
  'تفاصيل الشحن': ['shipping_land_detail', 'shipping_sea_detail'],
};

const ADMIN_SESSION_KEY = 'almokhtar_admin_creds';

export function AdminDashboard({ onExit }: AdminDashboardProps) {
  const [creds, setCreds] = useState<{ username: string; password: string } | null>(() => {
    const saved = sessionStorage.getItem(ADMIN_SESSION_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [tab, setTab] = useState('overview');
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [content, setContent] = useState<ContentRow[]>([]);
  const [media, setMedia] = useState<MediaRow[]>([]);
  const [bot, setBot] = useState<BotRow | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [productDetails, setProductDetails] = useState<ProductDetailRow[]>([]);
  const [varieties, setVarieties] = useState<VarietyRow[]>([]);
  const [editingDetail, setEditingDetail] = useState<{ product: ProductRow; detail: ProductDetailRow | null } | null>(null);
  const [notice, setNotice] = useState('');

  useEffect(() => { if (creds) void loadData(); }, [creds]);

  const loadData = async () => {
    const [productsResult, ordersResult, contentResult, mediaResult, botResult, detailsResult, varietiesResult] = await Promise.all([
      supabase.from('products').select('*').order('category').order('display_order'),
      supabase.from('orders').select('id, customer_name, customer_phone, product_name, quantity, status, created_at').order('created_at', { ascending: false }),
      supabase.from('site_content').select('key, value').order('key'),
      supabase.from('site_media').select('*').order('media_key'),
      supabase.from('bot_settings').select('id, enabled, system_prompt_ar, system_prompt_en').maybeSingle(),
      supabase.from('product_details').select('*'),
      supabase.from('product_varieties').select('*').order('product_id').order('display_order'),
    ]);
    if (productsResult.data) setProducts(productsResult.data as ProductRow[]);
    if (ordersResult.data) setOrders(ordersResult.data as OrderRow[]);
    if (contentResult.data) setContent(contentResult.data as ContentRow[]);
    if (mediaResult.data) setMedia(mediaResult.data as MediaRow[]);
    if (botResult.data) setBot(botResult.data as BotRow);
    if (detailsResult.data) setProductDetails(detailsResult.data as ProductDetailRow[]);
    if (varietiesResult.data) setVarieties(varietiesResult.data as VarietyRow[]);
  };

  const signIn = async (event: FormEvent) => {
    event.preventDefault();
    setLoginError('');
    const { data, error } = await supabase.rpc('check_admin_credentials', {
      p_username: 'admin',
      p_password: loginPassword,
    });
    if (error || !data) {
      setLoginError('كلمة المرور غير صحيحة');
      return;
    }
    const value = { username: 'admin', password: loginPassword };
    sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(value));
    setCreds(value);
    setLoginPassword('');
  };

  const logout = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setCreds(null);
  };

  const refreshUsers = async () => {
    if (!creds) return;
    const { data } = await supabase.rpc('list_registered_users', {
      p_username: creds.username,
      p_password: creds.password,
    });
    setUsers((data ?? []) as UserRow[]);
  };

  if (!creds) return <AdminLogin password={loginPassword} setPassword={setLoginPassword} error={loginError} onSubmit={signIn} onExit={onExit} />;

  const nav = [
    { id: 'overview', label: 'الرئيسية', icon: <LayoutDashboard size={18} /> },
    { id: 'products', label: 'المنتجات', icon: <Package size={18} /> },
    { id: 'varieties', label: 'الأنواع الفرعية', icon: <Sprout size={18} /> },
    { id: 'packaging', label: 'التغليف والأوزان', icon: <Package size={18} /> },
    { id: 'shipping', label: 'الشحن البري والبحري', icon: <Truck size={18} /> },
    { id: 'contact-page', label: 'صفحة تواصل معنا', icon: <FileText size={18} /> },
    { id: 'texts', label: 'كل النصوص', icon: <FileText size={18} /> },
    { id: 'images', label: 'كل صور الموقع', icon: <ImagePlus size={18} /> },
    { id: 'users', label: 'المستخدمون', icon: <Users size={18} /> },
    { id: 'bot', label: 'إعدادات البوت', icon: <Bot size={18} /> },
    { id: 'bot-questions', label: 'أسئلة البوت', icon: <MessageCircle size={18} /> },
    { id: 'orders', label: 'الطلبات', icon: <ShoppingBag size={18} /> },
    { id: 'product-details', label: 'تفاصيل المنتجات', icon: <ListChecks size={18} /> },
  ];

  return <div className="admin-shell" dir="rtl">
    <aside className="admin-sidebar"><div className="admin-brand"><img src="/logo.jpeg" alt="Al-Mokhtar" /><div>AL-MOKHTAR<small>CONTROL CENTER</small></div></div><nav>{nav.map((item) => <button className={tab === item.id ? 'active' : ''} key={item.id} onClick={() => { setTab(item.id); if (item.id === 'users') void refreshUsers(); }}>{item.icon}{item.label}</button>)}</nav><div className="admin-side-bottom"><button onClick={onExit}><LogOut size={17} /> الموقع</button><button onClick={logout}><LogOut size={17} /> تسجيل الخروج</button></div></aside>
    <main className="admin-main"><header className="admin-topbar"><div><span>لوحة التحكم</span><h1>{nav.find((item) => item.id === tab)?.label}</h1></div><div className="admin-user"><span className="admin-avatar">A</span><span>Admin</span></div></header>{notice && <div className="admin-notice"><Check size={17} /> {notice}<button onClick={() => setNotice('')}><X size={15} /></button></div>}
      {tab === 'overview' && <Overview products={products} orders={orders} media={media} onTab={setTab} />}
      {(tab === 'products' || tab === 'packaging' || tab === 'shipping') && <ProductsManager title={nav.find((item) => item.id === tab)?.label ?? ''} category={tab === 'products' ? undefined : tab === 'packaging' ? 'Packaging' : 'Shipping'} products={products} editing={editing} setEditing={setEditing} onReload={loadData} onNotice={setNotice} creds={creds} />}
      {tab === 'varieties' && <VarietiesManager products={products} varieties={varieties} onReload={loadData} onNotice={setNotice} creds={creds} />}
      {(tab === 'contact-page' || tab === 'texts') && <ContentManager title={tab === 'contact-page' ? 'صفحة تواصل معنا' : 'كل النصوص بالعربي والإنجليزي'} content={content} setContent={setContent} onNotice={setNotice} creds={creds} group={tab === 'contact-page' ? 'صفحة تواصل معنا' : undefined} />}
      {tab === 'images' && <AllImagesManager media={media} setMedia={setMedia} products={products} varieties={varieties} productDetails={productDetails} onReload={loadData} onNotice={setNotice} creds={creds} />}
      {tab === 'users' && <UsersManager users={users} />}
      {tab === 'bot' && <BotManager bot={bot} onNotice={setNotice} onSaved={loadData} creds={creds} />}
      {tab === 'bot-questions' && <BotQuestionsManager onNotice={setNotice} creds={creds} />}
      {tab === 'product-details' && <ProductDetailsManager products={products} productDetails={productDetails} onEdit={setEditingDetail} onReload={loadData} />}
      {tab === 'orders' && <OrdersManager orders={orders} />}
      {editingDetail && <ProductDetailEditor product={editingDetail.product} detail={editingDetail.detail} onClose={() => setEditingDetail(null)} onReload={loadData} onNotice={setNotice} creds={creds} />}
    </main>
  </div>;
}

function AdminLogin({ password, setPassword, error, onSubmit, onExit }: { password: string; setPassword: (value: string) => void; error: string; onSubmit: (event: FormEvent) => void; onExit: () => void }) {
  return <div className="admin-login" dir="rtl"><div className="admin-login-card"><button className="admin-back" onClick={onExit}>العودة للموقع</button><img src="/logo.jpeg" alt="Al-Mokhtar" /><div className="section-label">CONTROL CENTER</div><h1>لوحة الإدارة</h1><p>أدخل كلمة المرور للدخول.</p><form onSubmit={onSubmit}><label>كلمة المرور<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>{error && <div className="admin-error">{error}</div>}<button className="admin-primary" type="submit">دخول لوحة التحكم</button></form></div></div>;
}

async function uploadImage(file: File, creds: { username: string; password: string }, bucket = 'site-images'): Promise<string | null> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('username', creds.username);
  formData.append('password', creds.password);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const response = await fetch(`${supabaseUrl}/functions/v1/admin-upload?bucket=${bucket}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
    body: formData,
  });
  if (!response.ok) return null;
  const data = await response.json();
  return data.url ?? null;
}

function Overview({ products, orders, media, onTab }: { products: ProductRow[]; orders: OrderRow[]; media: MediaRow[]; onTab: (tab: string) => void }) {
  return <div className="admin-view"><div className="admin-welcome"><div><span>مرحبًا بك في مركز التحكم</span><h2>إدارة المختار من مكان واحد.</h2><p>أي تعديل تحفظه هنا يظهر للزوار مباشرة.</p></div><BarChart3 size={90} /></div><div className="stats-grid"><button onClick={() => onTab('products')}><Package /><b>{products.length}</b><span>إجمالي المنتجات والتغليف والشحن</span></button><button onClick={() => onTab('orders')}><ShoppingBag /><b>{orders.length}</b><span>إجمالي الطلبات</span></button><button onClick={() => onTab('images')}><ImagePlus /><b>{media.length}</b><span>صور الموقع</span></button></div><div className="admin-section-card"><div className="admin-card-title"><h3>آخر الطلبات</h3><button onClick={() => onTab('orders')}>عرض الكل</button></div>{orders.slice(0, 5).map((order) => <div className="mini-order" key={order.id}><span>{order.customer_name}</span><b>{order.product_name}</b><small>{order.quantity}</small></div>)}</div></div>;
}

function ProductsManager({ title, category, products, editing, setEditing, onReload, onNotice, creds }: { title: string; category?: string; products: ProductRow[]; editing: ProductRow | null; setEditing: (product: ProductRow | null) => void; onReload: () => Promise<void>; onNotice: (value: string) => void; creds: { username: string; password: string } }) {
  const [filter, setFilter] = useState(category ?? 'All');
  const visible = useMemo(() => category ? products.filter((p) => p.category === category) : filter === 'All' ? products : products.filter((p) => p.category === filter), [category, filter, products]);
  const create = () => setEditing({ id: '', category: category ?? 'Vegetables', label_en: '', label_ar: '', detail_en: '', detail_ar: '', image_url: '', display_order: products.length + 1 });
  return <div className="admin-view"><div className="admin-section-intro"><h2>{title}</h2><p>عدّل الاسم والوصف والوزن والصورة، ثم احفظ ليظهر التعديل مباشرة.</p></div><div className="admin-toolbar">{!category && <div className="filter-pills">{['All', ...categories].map((item) => <button className={filter === item ? 'active' : ''} key={item} onClick={() => setFilter(item)}>{item === 'All' ? 'الكل' : item}</button>)}</div>}<button className="admin-primary compact" onClick={create}><Plus size={17} /> إضافة</button></div><div className="admin-products-grid">{visible.map((product) => <div className="admin-product-card" key={product.id}><div className="admin-product-image" style={{ backgroundImage: `url(${product.image_url || '/logo.jpeg'})` }} /><div><span>{product.category}</span><h3>{product.label_ar}</h3><small>{product.label_en}</small></div><div className="admin-product-actions"><button onClick={() => setEditing(product)}><Pencil size={15} /></button><button onClick={async () => { if (window.confirm('حذف هذا العنصر؟')) { const { error } = await supabase.rpc('admin_delete_product', { p_username: creds.username, p_password: creds.password, p_product_id: product.id }); if (error) { onNotice('تعذر الحذف'); return; } onNotice('تم الحذف'); await onReload(); } }}><Trash2 size={15} /></button></div></div>)}</div>{editing && <ProductEditor product={editing} onClose={() => setEditing(null)} onReload={onReload} onNotice={onNotice} creds={creds} />}</div>;
}

function ProductEditor({ product, onClose, onReload, onNotice, creds }: { product: ProductRow; onClose: () => void; onReload: () => Promise<void>; onNotice: (value: string) => void; creds: { username: string; password: string } }) {
  const [form, setForm] = useState(product);
  const [uploading, setUploading] = useState(false);
  const save = async (event: FormEvent) => {
    event.preventDefault();
    const { error } = await supabase.rpc('admin_save_product', {
      p_username: creds.username,
      p_password: creds.password,
      p_product: form,
    });
    if (error) { onNotice('تعذر حفظ التعديل'); return; }
    onNotice('تم الحفظ ويظهر الآن في الموقع');
    onClose();
    await onReload();
  };
  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadImage(file, creds);
    setUploading(false);
    if (!url) { onNotice('تعذر رفع الصورة'); return; }
    setForm({ ...form, image_url: url });
  };
  return <div className="editor-overlay"><div className="editor-card"><button className="editor-close" onClick={onClose}><X /></button><h2>{form.id ? 'تعديل' : 'إضافة'} {form.category}</h2><form onSubmit={save}><div className="editor-image-preview" style={{ backgroundImage: `url(${form.image_url || '/logo.jpeg'})` }}><label><Upload size={18} /> {uploading ? 'جاري الرفع...' : 'رفع صورة من الجهاز'}<input type="file" accept="image/*" onChange={upload} /></label></div><div className="editor-grid"><label>القسم<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{categories.map((v) => <option key={v}>{v}</option>)}</select></label><label>الترتيب<input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} /></label><label>الاسم بالعربي<input value={form.label_ar} onChange={(e) => setForm({ ...form, label_ar: e.target.value })} required /></label><label>الاسم بالإنجليزي<input value={form.label_en} onChange={(e) => setForm({ ...form, label_en: e.target.value })} required /></label><label>التفاصيل بالعربي<textarea value={form.detail_ar ?? ''} onChange={(e) => setForm({ ...form, detail_ar: e.target.value })} /></label><label>التفاصيل بالإنجليزي<textarea value={form.detail_en ?? ''} onChange={(e) => setForm({ ...form, detail_en: e.target.value })} /></label></div><button className="admin-primary full" type="submit"><Save size={17} /> حفظ</button></form></div></div>;
}

const VARIETY_CATEGORIES = [
  { key: 'Vegetables', label: 'خضار', label_en: 'Vegetables' },
  { key: 'Fruits', label: 'فاكهة', label_en: 'Fruits' },
  { key: 'Seeds', label: 'تقاوي', label_en: 'Seeds' },
];

function VarietiesManager({ products, varieties, onReload, onNotice, creds }: { products: ProductRow[]; varieties: VarietyRow[]; onReload: () => Promise<void>; onNotice: (value: string) => void; creds: { username: string; password: string } }) {
  const [expandedCat, setExpandedCat] = useState<string | null>('Vegetables');
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [editing, setEditing] = useState<VarietyRow | null>(null);

  const productsByCat = (cat: string) => products.filter((p) => p.category === cat).sort((a, b) => a.display_order - b.display_order);
  const varietiesByProduct = (pid: string, labelEn: string) => varieties.filter((v) => v.product_id === pid || v.product_id === labelEn).sort((a, b) => a.display_order - b.display_order);

  const create = (product: ProductRow) => {
    setEditing({
      id: '', product_id: product.label_en, category: product.category,
      label_en: '', label_ar: '', detail_en: '', detail_ar: '', image_url: '',
      display_order: varietiesByProduct(product.id, product.label_en).length + 1,
    });
  };

  const remove = async (v: VarietyRow) => {
    if (!window.confirm('حذف هذا النوع؟')) return;
    const { error } = await supabase.rpc('admin_delete_variety', { p_username: creds.username, p_password: creds.password, p_variety_id: v.id });
    if (error) { onNotice('تعذر الحذف'); return; }
    onNotice('تم حذف النوع');
    await onReload();
  };

  return <div className="admin-view"><div className="admin-section-intro"><h2>الأنواع الفرعية</h2><p>إدارة كاملة لكل الأنواع داخل كل منتج — اختر القسم ثم المنتج لتضيف أو تعدّل أو تحذف أي نوع.</p></div>
    {VARIETY_CATEGORIES.map((cat) => {
      const catProducts = productsByCat(cat.key);
      return <div key={cat.key} style={{ marginBottom: 28 }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: 14, color: 'var(--gold)', borderBottom: '1px solid rgba(201,169,97,.2)', paddingBottom: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
          onClick={() => setExpandedCat(expandedCat === cat.key ? null : cat.key)}>
          {expandedCat === cat.key ? '▼' : '▶'} {cat.label}
          <span style={{ fontSize: '.8rem', fontWeight: 400, color: 'var(--text-muted)' }}>({catProducts.length} منتجات)</span>
        </h3>
        {expandedCat === cat.key && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {catProducts.map((product) => {
              const productVarieties = varietiesByProduct(product.id, product.label_en);
              const isProductOpen = expandedProduct === product.id;
              return (
                <div key={product.id} style={{ border: '1px solid rgba(201,169,97,.15)', borderRadius: 12, padding: 16, background: 'rgba(0,0,0,.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: isProductOpen ? 12 : 0, borderBottom: isProductOpen ? '1px solid rgba(201,169,97,.1)' : 'none' }}>
                    <button style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                      onClick={() => setExpandedProduct(isProductOpen ? null : product.id)}>
                      {isProductOpen ? '▼' : '▶'} {product.label_ar} <span style={{ fontSize: '.8rem', fontWeight: 400, color: 'var(--text-muted)' }}>— {product.label_en}</span>
                      <span style={{ fontSize: '.75rem', color: 'var(--gold)', marginRight: 8 }}>({productVarieties.length})</span>
                    </button>
                    {isProductOpen && <button className="admin-primary compact" style={{ fontSize: '.8rem', padding: '4px 12px' }} onClick={() => create(product)}><Plus size={15} /> إضافة نوع</button>}
                  </div>
                  {isProductOpen && (
                    <div className="admin-products-grid" style={{ marginTop: 14 }}>
                      {productVarieties.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '.85rem', padding: 8 }}>لا توجد أنواع بعد. اضغط "إضافة نوع" لإضافة نوع جديد.</p>}
                      {productVarieties.map((v) => (
                        <div className="admin-product-card" key={v.id}>
                          <div className="admin-product-image" style={{ backgroundImage: `url(${v.image_url || '/logo.jpeg'})` }} />
                          <div><h3 style={{ fontSize: '.95rem' }}>{v.label_ar}</h3><small>{v.label_en}</small></div>
                          <div className="admin-product-actions">
                            <button onClick={() => setEditing(v)}><Pencil size={15} /></button>
                            <button onClick={() => void remove(v)}><Trash2 size={15} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>;
    })}
    {editing && <VarietyEditor variety={editing} products={products} onClose={() => setEditing(null)} onReload={onReload} onNotice={onNotice} creds={creds} />}
  </div>;
}

function VarietyEditor({ variety, products, onClose, onReload, onNotice, creds }: { variety: VarietyRow; products: ProductRow[]; onClose: () => void; onReload: () => Promise<void>; onNotice: (value: string) => void; creds: { username: string; password: string } }) {
  const [form, setForm] = useState(variety);
  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState<VarietyPhotoRow[]>([]);
  const [photoUploading, setPhotoUploading] = useState(false);

  useEffect(() => {
    if (form.id) void loadPhotos();
  }, [form.id]);

  const loadPhotos = async () => {
    const { data } = await supabase.from('variety_photos').select('*').eq('variety_id', form.id).order('display_order');
    if (data) setPhotos(data as VarietyPhotoRow[]);
  };

  const addPhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    const url = await uploadImage(file, creds);
    setPhotoUploading(false);
    if (!url) { onNotice('تعذر رفع الصورة'); return; }
    const { error } = await supabase.rpc('admin_add_variety_photo', {
      p_username: creds.username, p_password: creds.password,
      p_variety_id: form.id, p_image_url: url,
    });
    if (error) { onNotice('تعذر حفظ الصورة في المعرض'); return; }
    onNotice('تمت إضافة الصورة للمعرض');
    await loadPhotos();
    event.target.value = '';
  };

  const deletePhoto = async (photoId: string) => {
    const { error } = await supabase.rpc('admin_delete_variety_photo', {
      p_username: creds.username, p_password: creds.password, p_photo_id: photoId,
    });
    if (error) { onNotice('تعذر حذف الصورة'); return; }
    onNotice('تم حذف الصورة');
    await loadPhotos();
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    const { error } = await supabase.rpc('admin_save_variety', {
      p_username: creds.username,
      p_password: creds.password,
      p_variety: form,
    });
    if (error) { onNotice('تعذر حفظ النوع'); return; }
    onNotice('تم حفظ النوع ويظهر الآن في الموقع');
    onClose();
    await onReload();
  };
  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadImage(file, creds);
    setUploading(false);
    if (!url) { onNotice('تعذر رفع الصورة'); return; }
    setForm({ ...form, image_url: url });
  };
  return <div className="editor-overlay"><div className="editor-card" style={{ maxWidth: 680 }}><button className="editor-close" onClick={onClose}><X /></button><h2>{form.id ? 'تعديل نوع' : 'إضافة نوع'}</h2><form onSubmit={save}><div className="editor-image-preview" style={{ backgroundImage: `url(${form.image_url || '/logo.jpeg'})` }}><label><Upload size={18} /> {uploading ? 'جاري الرفع...' : 'رفع صورة من الجهاز'}<input type="file" accept="image/*" onChange={upload} /></label></div><div className="editor-grid"><label>المنتج الأب<select value={products.find((p) => p.label_en === form.product_id)?.id ?? ''} onChange={(e) => { const product = products.find((p) => p.id === e.target.value); if (product) setForm({ ...form, product_id: product.label_en, category: product.category }); }}>{products.map((p) => <option key={p.id} value={p.id}>{p.label_ar} — {p.label_en}</option>)}</select></label><label>الترتيب<input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} /></label><label>الاسم بالعربي<input value={form.label_ar} onChange={(e) => setForm({ ...form, label_ar: e.target.value })} required /></label><label>الاسم بالإنجليزي<input value={form.label_en} onChange={(e) => setForm({ ...form, label_en: e.target.value })} required /></label><label>الوصف بالعربي<textarea value={form.detail_ar ?? ''} onChange={(e) => setForm({ ...form, detail_ar: e.target.value })} /></label><label>الوصف بالإنجليزي<textarea value={form.detail_en ?? ''} onChange={(e) => setForm({ ...form, detail_en: e.target.value })} /></label></div><button className="admin-primary full" type="submit"><Save size={17} /> حفظ</button></form>
    {form.id && (
      <div style={{ marginTop: 28, borderTop: '1px solid rgba(201,169,97,.2)', paddingTop: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Images size={20} style={{ color: 'var(--gold)' }} />
          <h3 style={{ fontSize: '1rem', color: 'var(--gold)', margin: 0 }}>معرض الصور</h3>
          <span style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>({photos.length} صور)</span>
        </div>
        <p style={{ fontSize: '.85rem', color: 'var(--text-muted)', marginBottom: 14 }}>ارفع أكتر من صورة للعميل يشوفها. الصورة الرئيسية فوق، الصور الإضافية تظهر هنا.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12, marginBottom: 14 }}>
          {photos.map((photo) => (
            <div key={photo.id} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', aspectRatio: '1', border: '1px solid rgba(201,169,97,.15)' }}>
              <div style={{ width: '100%', height: '100%', backgroundImage: `url(${photo.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
              <button type="button" onClick={() => void deletePhoto(photo.id)} style={{ position: 'absolute', top: 4, left: 4, width: 26, height: 26, borderRadius: '50%', border: 'none', background: 'rgba(197,82,63,.9)', color: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><Trash2 size={13} /></button>
            </div>
          ))}
          {photos.length === 0 && <p style={{ fontSize: '.8rem', color: 'var(--text-muted)', gridColumn: '1 / -1' }}>لا توجد صور في المعرض بعد.</p>}
        </div>
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', border: '2px dashed rgba(201,169,97,.3)', borderRadius: 8, cursor: 'pointer', color: 'var(--gold)', fontSize: '.85rem', fontWeight: 600, transition: 'all .2s' }}>
          <Upload size={18} /> {photoUploading ? 'جاري الرفع...' : 'إضافة صورة للمعرض'}
          <input type="file" accept="image/*" onChange={addPhoto} style={{ display: 'none' }} disabled={photoUploading} />
        </label>
      </div>
    )}
  </div></div>;
}

function ContentManager({ title, content, setContent, onNotice, creds, group }: { title: string; content: ContentRow[]; setContent: (content: ContentRow[]) => void; onNotice: (value: string) => void; creds: { username: string; password: string }; group?: string }) {
  const rows = group ? content.filter((row) => contentGroups[group].some((key) => row.key.startsWith(key))) : content;
  const save = async (row: ContentRow) => {
    const { error } = await supabase.rpc('admin_save_content', {
      p_username: creds.username,
      p_password: creds.password,
      p_key: row.key,
      p_value: row.value ?? '',
    });
    if (error) { onNotice('تعذر الحفظ'); return; }
    onNotice('تم الحفظ ويظهر الآن في الموقع');
  };
  return <div className="admin-view"><div className="admin-section-intro"><h2>{title}</h2><p>تقدر تعدّل النص العربي والإنجليزي من هنا.</p></div><div className="content-editor-list">{rows.map((row) => <div className="content-row" key={row.key}><label>{row.key}<textarea value={row.value ?? ''} onChange={(e) => setContent(content.map((item) => item.key === row.key ? { ...item, value: e.target.value } : item))} /></label><button onClick={() => save(row)}><Save size={16} /> حفظ</button></div>)}</div></div>;
}

function MediaManager({ media, setMedia, onNotice, creds }: { media: MediaRow[]; setMedia: (media: MediaRow[]) => void; onNotice: (value: string) => void; creds: { username: string; password: string } }) {
  const [editing, setEditing] = useState<MediaRow | null>(null);
  const [uploading, setUploading] = useState(false);
  const save = async (row: MediaRow) => {
    const { error } = await supabase.rpc('admin_save_media', {
      p_username: creds.username,
      p_password: creds.password,
      p_media: { media_key: row.media_key, url: row.url, alt_en: row.alt_en, alt_ar: row.alt_ar },
    });
    if (error) { onNotice('تعذر حفظ الصورة'); return; }
    onNotice('تم حفظ الصورة');
    setEditing(null);
    const { data } = await supabase.from('site_media').select('*').order('media_key');
    if (data) setMedia(data as MediaRow[]);
  };
  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editing) return;
    setUploading(true);
    const url = await uploadImage(file, creds);
    setUploading(false);
    if (!url) { onNotice('تعذر رفع الصورة'); return; }
    setEditing({ ...editing, url });
  };
  return <div className="admin-view"><div className="admin-section-intro"><h2>كل صور الموقع</h2><p>غيّر صورة الخلفية والشعار وأي صورة مرتبطة بالموقع من الجهاز مباشرة.</p></div><div className="admin-products-grid">{media.map((row) => <div className="admin-product-card" key={row.id}><div className="admin-product-image" style={{ backgroundImage: `url(${row.url})` }} /><div><span>{row.media_key}</span><h3>{row.alt_ar || 'صورة الموقع'}</h3><small>{row.alt_en}</small></div><button className="admin-primary compact" onClick={() => setEditing(row)}><Pencil size={15} /> تعديل</button></div>)}</div>{editing && <div className="editor-overlay"><div className="editor-card"><button className="editor-close" onClick={() => setEditing(null)}><X /></button><h2>تعديل الصورة</h2><div className="editor-image-preview" style={{ backgroundImage: `url(${editing.url || '/logo.jpeg'})` }}><label><Upload size={18} /> {uploading ? 'جاري الرفع...' : 'رفع من الجهاز'}<input type="file" accept="image/*" onChange={upload} /></label></div><label>رابط الصورة<input value={editing.url} onChange={(e) => setEditing({ ...editing, url: e.target.value })} /></label><label>الوصف بالعربي<input value={editing.alt_ar} onChange={(e) => setEditing({ ...editing, alt_ar: e.target.value })} /></label><label>الوصف بالإنجليزي<input value={editing.alt_en} onChange={(e) => setEditing({ ...editing, alt_en: e.target.value })} /></label><button className="admin-primary full" onClick={() => void save(editing)}><Save size={17} /> حفظ</button></div></div>}</div>;
}

function UsersManager({ users }: { users: UserRow[] }) {
  return <div className="admin-view"><div className="admin-section-intro"><h2>المستخدمون المسجلون</h2><p>كل الحسابات التي أنشأها العملاء في الموقع.</p></div><div className="orders-table-wrap"><table><thead><tr><th>البريد الإلكتروني</th><th>تاريخ التسجيل</th><th>آخر دخول</th></tr></thead><tbody>{users.map((user) => <tr key={user.id}><td>{user.email ?? '—'}</td><td>{new Date(user.created_at).toLocaleDateString('ar-EG')}</td><td>{user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('ar-EG') : '—'}</td></tr>)}</tbody></table></div></div>;
}

function BotManager({ bot, onNotice, onSaved, creds }: { bot: BotRow | null; onNotice: (value: string) => void; onSaved: () => Promise<void>; creds: { username: string; password: string } }) {
  const [form, setForm] = useState(bot ?? { id: '', enabled: true, system_prompt_ar: '', system_prompt_en: '' });
  useEffect(() => { if (bot) setForm(bot); }, [bot]);
  const save = async (event: FormEvent) => {
    event.preventDefault();
    const { error } = await supabase.rpc('admin_save_bot', {
      p_username: creds.username,
      p_password: creds.password,
      p_enabled: form.enabled,
      p_prompt_ar: form.system_prompt_ar,
      p_prompt_en: form.system_prompt_en,
    });
    if (error) { onNotice('تعذر حفظ إعدادات البوت'); return; }
    onNotice('تم حفظ إعدادات البوت');
    await onSaved();
  };
  return <div className="admin-view"><div className="admin-section-intro"><h2>إعدادات البوت</h2><p>اكتب التعليمات التي يستخدمها البوت عند الرد على أي رسالة.</p></div><form className="settings-card" onSubmit={save}><label className="toggle-label"><input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} /> البوت يعمل</label><label>تعليمات البوت بالعربي<textarea rows={9} value={form.system_prompt_ar} onChange={(e) => setForm({ ...form, system_prompt_ar: e.target.value })} /></label><label>Bot instructions in English<textarea rows={9} value={form.system_prompt_en} onChange={(e) => setForm({ ...form, system_prompt_en: e.target.value })} /></label><button className="admin-primary" type="submit"><Save size={17} /> حفظ إعدادات البوت</button></form></div>;
}

function OrdersManager({ orders }: { orders: OrderRow[] }) {
  return <div className="admin-view"><div className="admin-section-intro"><h2>طلبات العملاء</h2><p>كل الطلبات المحفوظة من نماذج الموقع.</p></div><div className="orders-table-wrap"><table><thead><tr><th>العميل</th><th>الهاتف</th><th>المنتج</th><th>الكمية</th><th>الحالة</th><th>التاريخ</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id}><td>{order.customer_name}</td><td dir="ltr">{order.customer_phone}</td><td>{order.product_name}</td><td>{order.quantity}</td><td><span className="order-status">{order.status}</span></td><td>{new Date(order.created_at).toLocaleDateString('ar-EG')}</td></tr>)}</tbody></table></div></div>;
}

function ProductDetailsManager({ products, productDetails, onEdit, onReload }: { products: ProductRow[]; productDetails: ProductDetailRow[]; onEdit: (value: { product: ProductRow; detail: ProductDetailRow | null } | null) => void; onReload: () => Promise<void> }) {
  const detailProducts = products.filter((p) => p.category === 'Shipping' || p.category === 'Packaging' || p.label_en === 'White Onion' || p.label_en === 'Red Onion');
  const detailsMap = new Map(productDetails.map((d) => [d.product_id, d]));
  return <div className="admin-view"><div className="admin-section-intro"><h2>تفاصيل المنتجات</h2><p>أضف وعدّل الوصف والمميزات والاستخدامات والصور الكبيرة لكل منتج — بالعربي والإنجليزي.</p></div><div className="admin-products-grid">{detailProducts.map((product) => {const detail = detailsMap.get(product.id) ?? null; return <div className="admin-product-card" key={product.id}><div className="admin-product-image" style={{ backgroundImage: `url(${detail?.detail_image_url || product.image_url || '/logo.jpeg'})` }} /><div><span>{product.category}</span><h3>{product.label_ar}</h3><small>{product.label_en}</small></div><div className="admin-product-actions"><button onClick={() => onEdit({ product, detail })}><Pencil size={15} /></button></div></div>})}</div></div>;
}

function ProductDetailEditor({ product, detail, onClose, onReload, onNotice, creds }: { product: ProductRow; detail: ProductDetailRow | null; onClose: () => void; onReload: () => Promise<void>; onNotice: (value: string) => void; creds: { username: string; password: string } }) {
  const [form, setForm] = useState({
    description_ar: detail?.description_ar ?? '',
    description_en: detail?.description_en ?? '',
    features_ar: (detail?.features_ar ?? []).join('\n'),
    features_en: (detail?.features_en ?? []).join('\n'),
    uses_ar: detail?.uses_ar ?? '',
    uses_en: detail?.uses_en ?? '',
    detail_image_url: detail?.detail_image_url ?? product.image_url ?? '',
  });
  const [uploading, setUploading] = useState(false);
  const save = async (event: FormEvent) => {
    event.preventDefault();
    const featuresAr = form.features_ar.split('\n').map((s) => s.trim()).filter(Boolean);
    const featuresEn = form.features_en.split('\n').map((s) => s.trim()).filter(Boolean);
    const { error } = await supabase.rpc('admin_save_product_detail', {
      p_username: creds.username,
      p_password: creds.password,
      p_detail: {
        product_id: product.id,
        description_ar: form.description_ar,
        description_en: form.description_en,
        features_ar: featuresAr,
        features_en: featuresEn,
        uses_ar: form.uses_ar,
        uses_en: form.uses_en,
        detail_image_url: form.detail_image_url,
      },
    });
    if (error) { onNotice('تعذر حفظ التفاصيل'); return; }
    onNotice('تم حفظ التفاصيل ويظهر الآن في الموقع');
    onClose();
    await onReload();
  };
  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadImage(file, creds);
    setUploading(false);
    if (!url) { onNotice('تعذر رفع الصورة'); return; }
    setForm({ ...form, detail_image_url: url });
  };
  return <div className="editor-overlay"><div className="editor-card" style={{ maxWidth: 720 }}><button className="editor-close" onClick={onClose}><X /></button><h2>تفاصيل: {product.label_ar} — {product.label_en}</h2><form onSubmit={save}><div className="editor-image-preview" style={{ backgroundImage: `url(${form.detail_image_url || '/logo.jpeg'})` }}><label><Upload size={18} /> {uploading ? 'جاري الرفع...' : 'رفع صورة كبيرة من الجهاز'}<input type="file" accept="image/*" onChange={upload} /></label></div><label>رابط الصورة الكبيرة<input value={form.detail_image_url} onChange={(e) => setForm({ ...form, detail_image_url: e.target.value })} /></label><div className="editor-grid"><label>الوصف بالعربي<textarea rows={4} value={form.description_ar} onChange={(e) => setForm({ ...form, description_ar: e.target.value })} /></label><label>الوصف بالإنجليزي<textarea rows={4} value={form.description_en} onChange={(e) => setForm({ ...form, description_en: e.target.value })} /></label></div><div className="editor-grid"><label>المميزات بالعربي (كل ميزة في سطر)<textarea rows={8} value={form.features_ar} onChange={(e) => setForm({ ...form, features_ar: e.target.value })} /></label><label>المميزات بالإنجليزي (كل ميزة في سطر)<textarea rows={8} value={form.features_en} onChange={(e) => setForm({ ...form, features_en: e.target.value })} /></label></div><div className="editor-grid"><label>الاستخدامات بالعربي<textarea rows={3} value={form.uses_ar} onChange={(e) => setForm({ ...form, uses_ar: e.target.value })} /></label><label>الاستخدامات بالإنجليزي<textarea rows={3} value={form.uses_en} onChange={(e) => setForm({ ...form, uses_en: e.target.value })} /></label></div><button className="admin-primary full" type="submit"><Save size={17} /> حفظ التفاصيل</button></form></div></div>;
}

type ImageItem = {
  key: string;
  label: string;
  sublabel?: string;
  url: string | null;
  kind: 'site' | 'product' | 'variety' | 'detail';
  productId?: string;
  varietyId?: string;
};

const CATEGORY_LABELS_AR: Record<string, string> = {
  Vegetables: 'صور الخضار',
  Fruits: 'صور الفاكهة',
  Seeds: 'صور التقاوي',
  Packaging: 'صور التغليف',
  Shipping: 'صور الشحن',
};

const CATEGORY_ORDER = ['Vegetables', 'Fruits', 'Seeds', 'Packaging', 'Shipping'];

function AllImagesManager({ media, setMedia, products, varieties, productDetails, onReload, onNotice, creds }: {
  media: MediaRow[];
  setMedia: (media: MediaRow[]) => void;
  products: ProductRow[];
  varieties: VarietyRow[];
  productDetails: ProductDetailRow[];
  onReload: () => Promise<void>;
  onNotice: (value: string) => void;
  creds: { username: string; password: string };
}) {
  const [editing, setEditing] = useState<ImageItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set(['__site__', ...CATEGORY_ORDER]));

  const detailMap = new Map(productDetails.map((d) => [d.product_id, d]));

  const toggleCat = (cat: string) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat); else next.add(cat);
      return next;
    });
  };

  const save = async () => {
    if (!editing) return;
    if (editing.kind === 'site') {
      const row = media.find((m) => m.media_key === editing.key);
      if (row) {
        const { error } = await supabase.rpc('admin_save_media', {
          p_username: creds.username, p_password: creds.password,
          p_media: { media_key: row.media_key, url: editing.url ?? '', alt_en: row.alt_en, alt_ar: row.alt_ar },
        });
        if (error) { onNotice('تعذر حفظ الصورة'); return; }
        onNotice('تم حفظ الصورة');
        const { data } = await supabase.from('site_media').select('*').order('media_key');
        if (data) setMedia(data as MediaRow[]);
      }
    } else if (editing.kind === 'product' && editing.productId) {
      const product = products.find((p) => p.id === editing.productId);
      if (product) {
        const { error } = await supabase.rpc('admin_save_product', {
          p_username: creds.username, p_password: creds.password,
          p_product: { ...product, image_url: editing.url ?? '' },
        });
        if (error) { onNotice('تعذر حفظ الصورة'); return; }
        onNotice('تم حفظ صورة المنتج');
        await onReload();
      }
    } else if (editing.kind === 'variety' && editing.varietyId) {
      const variety = varieties.find((v) => v.id === editing.varietyId);
      if (variety) {
        const { error } = await supabase.rpc('admin_save_variety', {
          p_username: creds.username, p_password: creds.password,
          p_variety: { ...variety, image_url: editing.url ?? '' },
        });
        if (error) { onNotice('تعذر حفظ الصورة'); return; }
        onNotice('تم حفظ صورة الصنف');
        await onReload();
      }
    } else if (editing.kind === 'detail' && editing.productId) {
      const detail = detailMap.get(editing.productId);
      if (detail) {
        const { error } = await supabase.rpc('admin_save_product_detail', {
          p_username: creds.username, p_password: creds.password,
          p_detail: { ...detail, detail_image_url: editing.url ?? '' },
        });
        if (error) { onNotice('تعذر حفظ الصورة'); return; }
        onNotice('تم حفظ الصورة الكبيرة');
        await onReload();
      }
    }
    setEditing(null);
  };

  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editing) return;
    setUploading(true);
    const url = await uploadImage(file, creds);
    setUploading(false);
    if (!url) { onNotice('تعذر رفع الصورة'); return; }
    setEditing({ ...editing, url });
  };

  const renderImageCard = (item: ImageItem, badge: string) => (
    <div className="admin-product-card" key={item.key}>
      <div className="admin-product-image" style={{ backgroundImage: `url(${item.url || '/logo.jpeg'})` }} />
      <div><span>{badge}</span><h3>{item.label}</h3>{item.sublabel && <small>{item.sublabel}</small>}</div>
      <button className="admin-primary compact" onClick={() => setEditing(item)}><Pencil size={15} /> تعديل</button>
    </div>
  );

  const siteItems: ImageItem[] = media.map((m) => ({
    key: m.media_key, label: m.alt_ar || m.media_key, sublabel: m.alt_en, url: m.url, kind: 'site',
  }));

  const productsByCat = (cat: string) => products.filter((p) => p.category === cat).sort((a, b) => a.display_order - b.display_order);
  const varietiesByProduct = (pid: string, productLabelEn?: string) => varieties.filter((v) => v.product_id === pid || v.product_id === productLabelEn);

  return <div className="admin-view"><div className="admin-section-intro"><h2>كل صور الموقع بالكامل</h2><p>غيّر أي صورة في الموقع من مكان واحد — صور الموقع العامة، صور المنتجات، صور الأصناف، والصور الكبيرة لصفحات التفاصيل. ارفع من جهازك مباشرة أو الصق رابط.</p></div>

    <div style={{ marginBottom: 32 }}>
      <h3 style={{ fontSize: '1.05rem', marginBottom: 14, color: 'var(--gold)', borderBottom: '1px solid rgba(201,169,97,.2)', paddingBottom: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => toggleCat('__site__')}>
        {expandedCats.has('__site__') ? '▼' : '▶'} صور الصفحة الرئيسية والعناصر العامة
      </h3>
      {expandedCats.has('__site__') && (
        <div className="admin-products-grid">
          {siteItems.map((item) => renderImageCard(item, 'صورة عامة'))}
        </div>
      )}
    </div>

    {CATEGORY_ORDER.map((cat) => {
      const catProducts = productsByCat(cat);
      if (catProducts.length === 0) return null;
      const catLabel = CATEGORY_LABELS_AR[cat] ?? cat;
      return (
        <div key={cat} style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: '1.05rem', marginBottom: 14, color: 'var(--gold)', borderBottom: '1px solid rgba(201,169,97,.2)', paddingBottom: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => toggleCat(cat)}>
            {expandedCats.has(cat) ? '▼' : '▶'} {catLabel}
          </h3>
          {expandedCats.has(cat) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {catProducts.map((product) => {
                const productVarieties = varietiesByProduct(product.id, product.label_en);
                const hasDetail = detailMap.has(product.id);
                const productItem: ImageItem = { key: `product:${product.id}`, label: product.label_ar, sublabel: product.label_en, url: product.image_url, kind: 'product', productId: product.id };
                const detailItem: ImageItem | null = hasDetail
                  ? { key: `detail:${product.id}`, label: `${product.label_ar} (صورة كبيرة)`, sublabel: product.label_en, url: detailMap.get(product.id)?.detail_image_url ?? null, kind: 'detail', productId: product.id }
                  : null;
                return (
                  <div key={product.id} style={{ border: '1px solid rgba(201,169,97,.15)', borderRadius: 12, padding: 16, background: 'rgba(0,0,0,.02)' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid rgba(201,169,97,.1)' }}>
                      {product.label_ar} <span style={{ fontSize: '.8rem', fontWeight: 400, color: 'var(--text-muted)' }}>— {product.label_en}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div>
                        <div style={{ fontSize: '.85rem', color: 'var(--gold)', marginBottom: 8 }}>صورة المنتج الرئيسية</div>
                        <div className="admin-products-grid">
                          {renderImageCard(productItem, 'صورة المنتج')}
                        </div>
                      </div>
                      {detailItem && (
                        <div>
                          <div style={{ fontSize: '.85rem', color: 'var(--gold)', marginBottom: 8 }}>صورة صفحة التفاصيل الكبيرة</div>
                          <div className="admin-products-grid">
                            {renderImageCard(detailItem, 'صفحة تفاصيل')}
                          </div>
                        </div>
                      )}
                      {productVarieties.length > 0 && (
                        <div>
                          <div style={{ fontSize: '.85rem', color: 'var(--gold)', marginBottom: 8 }}>صور الأنواع ({productVarieties.length})</div>
                          <div className="admin-products-grid">
                            {productVarieties.map((v) => {
                              const vItem: ImageItem = { key: `variety:${v.id}`, label: v.label_ar, sublabel: v.label_en, url: v.image_url, kind: 'variety', varietyId: v.id };
                              return renderImageCard(vItem, 'صنف');
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    })}

    {editing && <div className="editor-overlay"><div className="editor-card"><button className="editor-close" onClick={() => setEditing(null)}><X /></button><h2>تعديل الصورة</h2><div className="editor-image-preview" style={{ backgroundImage: `url(${editing.url || '/logo.jpeg'})` }}><label><Upload size={18} /> {uploading ? 'جاري الرفع...' : 'رفع من الجهاز'}<input type="file" accept="image/*" onChange={upload} /></label></div><label>رابط الصورة<input value={editing.url ?? ''} onChange={(e) => setEditing({ ...editing, url: e.target.value })} /></label><div style={{ marginTop: 8 }}><strong style={{ fontSize: '.85rem', color: 'var(--text-muted)' }}>{editing.label}{editing.sublabel ? ` — ${editing.sublabel}` : ''}</strong></div><button className="admin-primary full" onClick={() => void save()}><Save size={17} /> حفظ</button></div></div>}
  </div>;
}

type BotQuestionRow = {
  id: string;
  question_en: string;
  question_ar: string;
  answer_en: string;
  answer_ar: string;
  display_order: number;
  is_active: boolean;
};

function BotQuestionsManager({ onNotice, creds }: { onNotice: (value: string) => void; creds: { username: string; password: string } }) {
  const [questions, setQuestions] = useState<BotQuestionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<BotQuestionRow | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('bot_questions').select('*').order('display_order');
    setQuestions((data ?? []) as BotQuestionRow[]);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    const { error } = await supabase.rpc('admin_save_bot_question', {
      p_password: creds.password,
      p_question: editing,
    });
    if (error) { onNotice('تعذر حفظ السؤال'); return; }
    onNotice(editing.id ? 'تم حفظ السؤال' : 'تم إضافة السؤال');
    setEditing(null);
    await load();
  };

  const remove = async (id: string) => {
    if (!window.confirm('حذف هذا السؤال؟')) return;
    const { error } = await supabase.rpc('admin_delete_bot_question', {
      p_password: creds.password,
      p_question_id: id,
    });
    if (error) { onNotice('تعذر الحذف'); return; }
    onNotice('تم حذف السؤال');
    await load();
  };

  const moveOrder = async (id: string, direction: 'up' | 'down') => {
    const sorted = [...questions].sort((a, b) => a.display_order - b.display_order);
    const index = sorted.findIndex((q) => q.id === id);
    if (index < 0) return;
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= sorted.length) return;
    const a = sorted[index];
    const b = sorted[swapIndex];
    await Promise.all([
      supabase.rpc('admin_reorder_bot_question', { p_password: creds.password, p_question_id: a.id, p_new_order: b.display_order }),
      supabase.rpc('admin_reorder_bot_question', { p_password: creds.password, p_question_id: b.id, p_new_order: a.display_order }),
    ]);
    await load();
  };

  const toggleActive = async (q: BotQuestionRow) => {
    const { error } = await supabase.rpc('admin_toggle_bot_question', {
      p_password: creds.password,
      p_question_id: q.id,
      p_is_active: !q.is_active,
    });
    if (error) { onNotice('تعذر تغيير الحالة'); return; }
    await load();
  };

  const create = () => setEditing({
    id: '', question_en: '', question_ar: '', answer_en: '', answer_ar: '',
    display_order: questions.length + 1, is_active: true,
  });

  return <div className="admin-view">
    <div className="admin-section-intro"><h2>أسئلة البوت</h2><p>أضف وعدّل ورتّب الأسئلة الجاهزة اللي تظهر للعملاء في الـChatbot.</p></div>
    <div className="admin-toolbar"><button className="admin-primary compact" onClick={create}><Plus size={17} /> إضافة سؤال</button></div>
    {loading ? <p style={{ color: 'var(--text-muted)', padding: 24 }}>جاري التحميل...</p> : (
      <div className="admin-products-grid">
        {questions.map((q) => (
          <div className="admin-product-card" key={q.id}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: '.7rem', color: 'var(--text-muted)' }}>#{q.display_order}</span>
              <h3 style={{ fontSize: '.95rem', margin: '4px 0' }}>{q.question_ar || q.question_en}</h3>
              <small style={{ display: 'block', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q.question_en}</small>
              <div style={{ marginTop: 6, display: 'flex', gap: 6, alignItems: 'center' }}>
                <button className="admin-primary compact" style={{ padding: '2px 8px', fontSize: '.7rem' }} onClick={() => toggleActive(q)}>
                  {q.is_active ? 'مفعّل' : 'متوقف'}
                </button>
              </div>
            </div>
            <div className="admin-product-actions" style={{ flexDirection: 'column', gap: 4 }}>
              <button onClick={() => moveOrder(q.id, 'up')} title="تحريك لأعلى"><ChevronUp size={15} /></button>
              <button onClick={() => moveOrder(q.id, 'down')} title="تحريك لأسفل"><ChevronDown size={15} /></button>
              <button onClick={() => setEditing(q)}><Pencil size={15} /></button>
              <button onClick={() => void remove(q.id)}><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
      </div>
    )}
    {editing && (
      <div className="editor-overlay"><div className="editor-card" style={{ maxWidth: 640 }}>
        <button className="editor-close" onClick={() => setEditing(null)}><X /></button>
        <h2>{editing.id ? 'تعديل السؤال' : 'إضافة سؤال'}</h2>
        <form onSubmit={save}>
          <div className="editor-grid">
            <label>السؤال بالعربي<input value={editing.question_ar} onChange={(e) => setEditing({ ...editing, question_ar: e.target.value })} required /></label>
            <label>السؤال بالإنجليزي<input value={editing.question_en} onChange={(e) => setEditing({ ...editing, question_en: e.target.value })} required /></label>
            <label>الإجابة بالعربي<textarea rows={4} value={editing.answer_ar} onChange={(e) => setEditing({ ...editing, answer_ar: e.target.value })} required /></label>
            <label>الإجابة بالإنجليزي<textarea rows={4} value={editing.answer_en} onChange={(e) => setEditing({ ...editing, answer_en: e.target.value })} required /></label>
            <label>الترتيب<input type="number" value={editing.display_order} onChange={(e) => setEditing({ ...editing, display_order: Number(e.target.value) })} required /></label>
            <label className="toggle-label"><input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} /> السؤال مفعّل</label>
          </div>
          <button className="admin-primary full" type="submit"><Save size={17} /> حفظ</button>
        </form>
      </div></div>
    )}
  </div>;
}
