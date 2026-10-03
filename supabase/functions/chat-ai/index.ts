import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ProductRow {
  category: string;
  label_en: string;
  label_ar: string;
  detail_en: string;
  detail_ar: string;
}

function detectLang(text: string): "ar" | "en" {
  return /[\u0600-\u06FF]/.test(text) ? "ar" : "en";
}

function buildContext(lang: "ar" | "en", products: ProductRow[]): string {
  const isAr = lang === "ar";
  const lines = products.map((p) =>
    isAr
      ? `- ${p.label_ar} (${p.category}): ${p.detail_ar}`
      : `- ${p.label_en} (${p.category}): ${p.detail_en}`
  );
  return lines.join("\n");
}

function buildSystemPrompt(lang: "ar" | "en", products: ProductRow[]): string {
  const isAr = lang === "ar";
  const productContext = buildContext(lang, products);

  if (isAr) {
    return `أنت مساعد ودود لموقع "المختار للاستيراد والتصدير" — شركة مصرية لتصدير الخضار والفاكهة.
مهمتك: الرد على أي رسالة من العميل بلباقة واحترام، سواء كانت عن الموقع أو عن أي موضوع آخر.

قواعد الرد:
- إذا قال العميل "السلام عليكم" رد بـ "وعليكم السلام ورحمة الله وبركاته".
- إذا قال "ازيك" أو "عامل ايه" رد بتحية ودودة.
- رد دائمًا بالعربية إذا كتب العميل بالعربية، وبالإنجليزية إذا كتب بالإنجليزية.
- إذا سأل عن منتجاتنا، استخدم المعلومات التالية:
${productContext}
- إذا سأل عن التغليف: لدينا شكاير بوزن 5/10/15/15-30 كجم بألوان حسب اختيار العميل، جامبوهات للبصل والبطاطس من 1 إلى 1.5 طن، صناديق خشبية/بلاستيك للفاكهة (10-15 كجم)، وأكياس شبكية.
- إذا سأل عن الشحن: نوفر شحن بري وبحري بالحاويات لوجهات دولية.
- إذا سأل عن التواصل: واتساب +20 109 090 3681 و +20 127 678 5117، البريد almokhtarimportexport02@gmail.com، فيسبوك متاح.
- إذا كان الكلام غير متعلق بالموقع، رد بود ولباقة واحاول مساعدة العميل بأي سؤال.
- اجعل الردود قصيرة وودودة.`;
  }

  return `You are a friendly assistant for "Al-Mokhtar Import & Export" — an Egyptian company exporting vegetables and fruits.
Your task: respond to any message from the customer politely and respectfully, whether it's about the website or any other topic.

Response rules:
- If the customer says "Salam Alaikum" or "Assalamu Alaikum", respond with "Wa Alaikum Assalam wa Rahmatullah wa Barakatuh".
- If they say "How are you", respond warmly.
- Always respond in the same language the customer uses.
- If asked about our products, use this information:
${productContext}
- If asked about packaging: We offer sacks in 5/10/15/15-30 kg weights with colors per customer choice, jumbo bags for onions and potatoes (1-1.5 tons), wooden/plastic crates for fruits (10-15 kg), and net bags.
- If asked about shipping: We provide land and containerized sea shipping to international destinations.
- If asked about contact: WhatsApp +20 109 090 3681 and +20 127 678 5117, email almokhtarimportexport02@gmail.com, Facebook available.
- If the message is unrelated to the website, respond warmly and try to help with any question.
- Keep responses short and friendly.`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const lang = detectLang(message);

    const { data: products } = await supabase
      .from("products")
      .select("category, label_en, label_ar, detail_en, detail_ar");

    const productList: ProductRow[] = products ?? [];

    const { data: content } = await supabase
      .from("site_content")
      .select("key, value");

    const contentMap: Record<string, string> = {};
    if (content) {
      for (const row of content) {
        contentMap[row.key] = row.value;
      }
    }

    const { data: botSettings } = await supabase
      .from("bot_settings")
      .select("enabled, system_prompt_ar, system_prompt_en")
      .maybeSingle();

    const botEnabled = botSettings?.enabled ?? true;
    const customPrompt = lang === "ar"
      ? botSettings?.system_prompt_ar
      : botSettings?.system_prompt_en;

    const systemPrompt = customPrompt?.trim()
      ? `${customPrompt}\n\nبيانات الموقع:\n${buildContext(lang, productList)}`
      : buildSystemPrompt(lang, productList);

    const openaiKey = Deno.env.get("OPENAI_API_KEY");

    let reply: string;

    if (!botEnabled) {
      reply = lang === "ar"
        ? "البوت غير مفعّل حاليًا. للاستفسار تواصل معنا عبر واتساب أو البريد الإلكتروني."
        : "The assistant is currently disabled. For inquiries, contact us via WhatsApp or email.";
    } else if (openaiKey) {
      const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message },
          ],
          max_tokens: 300,
          temperature: 0.7,
        }),
      });

      if (!aiResponse.ok) {
        throw new Error(`AI service error: ${aiResponse.status}`);
      }

      const aiData = await aiResponse.json();
      reply = aiData.choices?.[0]?.message?.content ?? "I'm sorry, I couldn't process that.";
    } else {
      // Fallback: simple keyword-based responses
      reply = fallbackReply(message, lang, productList, contentMap);
    }

    return new Response(
      JSON.stringify({ reply, lang }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function fallbackReply(
  message: string,
  lang: "ar" | "en",
  products: ProductRow[],
  content: Record<string, string>
): string {
  const q = message.toLowerCase().trim();
  const isAr = lang === "ar";

  // Greetings
  if (q.includes("سلام عليكم") || q.includes("السلام عليكم") || q.includes("salam") || q.includes("assalam")) {
    return isAr ? "وعليكم السلام ورحمة الله وبركاته" : "Wa Alaikum Assalam wa Rahmatullah wa Barakatuh";
  }
  if (q.includes("ازيك") || q.includes("عامل ايه") || q.includes("how are you") || q.includes("how r u")) {
    return isAr ? "الحمد لله تمام، شكرًا لسؤالك! أنا هنا لمساعدتك في أي حاجة تخص المختار للاستيراد والتصدير." : "I'm doing great, thank you for asking! I'm here to help you with anything about Al-Mokhtar Import & Export.";
  }
  if (q.includes("مرحبا") || q.includes("اهلا") || q.includes("أهلا") || q.includes("hello") || q.includes("hi") || q.includes("hey")) {
    return isAr ? "أهلًا بك في المختار للاستيراد والتصدير! كيف أقدر أساعدك اليوم؟" : "Welcome to Al-Mokhtar Import & Export! How can I help you today?";
  }
  if (q.includes("شكر") || q.includes("thank")) {
    return isAr ? "العفو! أي وقت تحتاج مساعدة أنا هنا." : "You're welcome! I'm here whenever you need help.";
  }

  // Product queries
  if (q.includes("خضار") || q.includes("vegetable") || q.includes("جزر") || q.includes("carrot") || q.includes("بصل") || q.includes("onion") || q.includes("بطاطس") || q.includes("potato")) {
    const vegProducts = products.filter((p) => p.category === "Vegetables");
    const list = vegProducts.map((p) => isAr ? p.label_ar : p.label_en).join("، ");
    return isAr
      ? `نقدم: ${list}. كلها مفرزة بجودة تصدير. تقدر تطلب أي منتج من قسم الخضار.`
      : `We offer: ${list}. All graded for export quality. You can request any from the Vegetables section.`;
  }
  if (q.includes("فاكهة") || q.includes("fruit") || q.includes("برتقال") || q.includes("orange") || q.includes("مانجا") || q.includes("mango")) {
    const fruitProducts = products.filter((p) => p.category === "Fruits");
    const list = fruitProducts.map((p) => isAr ? p.label_ar : p.label_en).join("، ");
    return isAr
      ? `نقدم: ${list}. ادخل قسم الفاكهة للاطلاع على التفاصيل.`
      : `We offer: ${list}. Visit the Fruits section for details.`;
  }

  // Packaging queries
  if (q.includes("تغليف") || q.includes("pack") || q.includes("شكاير") || q.includes("sack") || q.includes("جامبو") || q.includes("jumbo") || q.includes("صندوق") || q.includes("crate") || q.includes("شبكية") || q.includes("net")) {
    return isAr
      ? "التغليف لدينا: شكاير بوزن 5/10/15/15-30 كجم بألوان حسب اختيارك، جامبوهات للبصل والبطاطس من 1 إلى 1.5 طن، صناديق خشبية/بلاستيك للفاكهة (10-15 كجم)، وأكياس شبكية. اختر ما يناسبك من قسم التغليف."
      : "Our packaging: sacks in 5/10/15/15-30 kg with colors per your choice, jumbo bags for onions and potatoes (1-1.5 tons), wooden/plastic crates for fruits (10-15 kg), and net bags. Choose from the Packaging section.";
  }

  // Shipping queries
  if (q.includes("شحن") || q.includes("ship") || q.includes("بحري") || q.includes("sea") || q.includes("بري") || q.includes("land")) {
    return isAr
      ? "نوفر شحنًا بريًا وبحريًا بالحاويات لوجهات دولية. ادخل قسم الشحن للتفاصيل."
      : "We provide land and containerized sea shipping to international destinations. Visit the Shipping section for details.";
  }

  // Contact queries
  if (q.includes("تواصل") || q.includes("contact") || q.includes("واتساب") || q.includes("whatsapp") || q.includes("ايميل") || q.includes("email") || q.includes("فيس") || q.includes("facebook")) {
    const wa1 = content["contact_whatsapp_1"] ?? "201090903681";
    const wa2 = content["contact_whatsapp_2"] ?? "201276785117";
    const email = content["contact_email"] ?? "almokhtarimportexport02@gmail.com";
    return isAr
      ? `تواصل معنا عبر واتساب: +${wa1} أو +${wa2}، أو بالبريد: ${email}`
      : `Contact us via WhatsApp: +${wa1} or +${wa2}, or email: ${email}`;
  }

  // Order queries
  if (q.includes("طلب") || q.includes("order") || q.includes("شراء") || q.includes("buy") || q.includes("كمية") || q.includes("quantity")) {
    return isAr
      ? "تقدر تطلب أي منتج من خلال زر «طلب منتج» — هيملا بياناته ويبعت الطلب على واتساب الشركة مباشرة."
      : "You can request any product via the 'Request product' button — fill in your details and it sends the order directly to the company WhatsApp.";
  }

  // Default conversational response
  const conversationalRepliesAr = [
    "سعيد بمحادثتك! أنا هنا لمساعدتك في أي حاجة تخص المختار للاستيراد والتصدير. تقدر تسألني عن المنتجات أو التغليف أو الشحن أو التواصل.",
    "فهمت رسالتك. أنا تحت أمرك في أي سؤال — المنتجات، التغليف، الشحن، أو أي حاجة تانية.",
    "أهلًا بك! اسألني عن أي حاجة وأنا أرد عليك. عندنا خضار وفاكهة وتغليف وشحن — كله متاح.",
  ];
  const conversationalRepliesEn = [
    "Happy to chat with you! I'm here to help with anything about Al-Mokhtar Import & Export. Ask me about products, packaging, shipping, or contact.",
    "I understand your message. I'm available for any question — products, packaging, shipping, or anything else.",
    "Welcome! Ask me anything and I'll respond. We have vegetables, fruits, packaging, and shipping — all available.",
  ];

  const replies = isAr ? conversationalRepliesAr : conversationalRepliesEn;
  return replies[Math.floor(Math.random() * replies.length)];
}
// chat-ai edge function
