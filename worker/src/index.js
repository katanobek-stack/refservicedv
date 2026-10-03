const SYSTEM_PROMPT = `Ты — ИИ-помощник RefServiceDV во Владивостоке. Помогаешь с ремонтом и монтажом холодильных систем, рефрижераторов, рефконтейнеров, автокондиционеров, морозильных камер, мониторингом и GPS-трекерами. Отвечай кратко и по делу. Не придумывай цены, адреса, сроки, наличие, гарантии и выполненные проекты. Собери имя, телефон, марку оборудования или автомобиля и описание проблемы. Предложи желаемую дату и время только как пожелание, которое инженер должен подтвердить. Когда данных достаточно, верни JSON внутри <BOOKING_READY>...</BOOKING_READY> с полями name, phone, brand, plate, serviceType, problem.`;
const ALLOWED_MODELS = new Set(['claude-3-5-sonnet-20241022', 'claude-3-7-sonnet-20250219', 'claude-sonnet-4-5']);

function originAllowed(request, env) {
  const origin = request.headers.get('Origin');
  const allowed = String(env.ALLOWED_ORIGINS || 'https://refservicedv.ru').split(',').map((item) => item.trim()).filter(Boolean);
  return !origin || allowed.includes(origin);
}

function corsHeaders(request, env) {
  const origin = request.headers.get('Origin');
  const allowed = String(env.ALLOWED_ORIGINS || 'https://refservicedv.ru').split(',').map((item) => item.trim());
  const headers = { Vary: 'Origin', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, X-Turnstile-Token, X-Idempotency-Key', 'Access-Control-Max-Age': '86400' };
  if (origin && allowed.includes(origin)) headers['Access-Control-Allow-Origin'] = origin;
  return headers;
}

function json(data, status, request, env) { return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders(request, env) } }); }
function clean(value, max = 2000) { return typeof value === 'string' ? value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max) : ''; }
function redact(value) { return clean(value).replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, '[email скрыт]').replace(/(?:\+?7|8)[\s()-]*\d[\s()-]*\d[\s()-]*\d[\s()-]*\d[\s()-]*\d[\s()-]*\d[\s()-]*\d[\s()-]*\d/g, '[телефон скрыт]'); }

async function limited(request, env) {
  if (!env.RATE_LIMIT_KV) return false;
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const window = Math.floor(Date.now() / ((Number(env.WINDOW_SECONDS) || 300) * 1000));
  const key = `rate:${ip}:${window}`;
  const current = Number(await env.RATE_LIMIT_KV.get(key) || 0);
  if (current >= (Number(env.MAX_REQUESTS_PER_WINDOW) || 20)) return true;
  await env.RATE_LIMIT_KV.put(key, String(current + 1), { expirationTtl: (Number(env.WINDOW_SECONDS) || 300) + 60 });
  return false;
}

async function verifyTurnstile(request, env, token) {
  if (!env.TURNSTILE_SECRET) return true;
  if (!token) return false;
  const body = new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: token, remoteip: request.headers.get('CF-Connecting-IP') || '' });
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
  return Boolean((await response.json()).success);
}

async function handleAssistant(request, env, body) {
  const model = String(env.ANTHROPIC_MODEL || '');
  if (!env.ANTHROPIC_API_KEY || !ALLOWED_MODELS.has(model)) return json({ error: 'assistant_not_configured' }, 503, request, env);
  const messages = Array.isArray(body.messages) ? body.messages.slice(-20).map((item) => ({ role: item?.role === 'assistant' ? 'assistant' : 'user', content: redact(item?.content) })).filter((item) => item.content) : [];
  if (!messages.length || messages.some((item) => item.content.length > 2000)) return json({ error: 'invalid_messages' }, 400, request, env);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', signal: controller.signal, headers: { 'content-type': 'application/json', 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' }, body: JSON.stringify({ model, max_tokens: 700, system: SYSTEM_PROMPT, messages }) });
    if (!response.ok) return json({ error: 'upstream_unavailable' }, 502, request, env);
    const data = await response.json();
    return json({ answer: data.content?.[0]?.text || '' }, 200, request, env);
  } catch { return json({ error: 'upstream_timeout' }, 504, request, env); }
  finally { clearTimeout(timeout); }
}

async function handleInquiry(request, env, body) {
  const idempotency = clean(request.headers.get('X-Idempotency-Key') || body.idempotencyKey, 100);
  if (idempotency && env.RATE_LIMIT_KV) {
    const key = `dedupe:${idempotency}`;
    if (await env.RATE_LIMIT_KV.get(key)) return json({ accepted: true, duplicate: true }, 200, request, env);
    await env.RATE_LIMIT_KV.put(key, '1', { expirationTtl: 86400 });
  }
  const inquiry = { name: clean(body.name, 120), phone: clean(body.phone, 40), brand: clean(body.brand, 120), plate: clean(body.plate, 40), serviceType: clean(body.serviceType, 40), problem: clean(body.problem, 2000), desiredDate: clean(body.desiredDate, 20), desiredTime: clean(body.desiredTime, 10), timeZone: 'Asia/Vladivostok', source: 'website' };
  if (!inquiry.name || !inquiry.phone || !inquiry.problem) return json({ error: 'required_fields' }, 400, request, env);
  if (!env.INQUIRY_WEBHOOK_URL) return json({ error: 'inquiry_not_configured' }, 503, request, env);
  const response = await fetch(env.INQUIRY_WEBHOOK_URL, { method: 'POST', headers: { 'content-type': 'application/json', ...(env.INQUIRY_WEBHOOK_TOKEN ? { Authorization: `Bearer ${env.INQUIRY_WEBHOOK_TOKEN}` } : {}) }, body: JSON.stringify(inquiry) });
  if (!response.ok) return json({ error: 'inquiry_delivery_failed' }, 502, request, env);
  return json({ accepted: true }, 202, request, env);
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return originAllowed(request, env) ? new Response(null, { status: 204, headers: corsHeaders(request, env) }) : new Response('Forbidden', { status: 403 });
    if (!originAllowed(request, env)) return new Response('Forbidden', { status: 403 });
    if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405, request, env);
    if (await limited(request, env)) return json({ error: 'rate_limited' }, 429, request, env);
    if (!await verifyTurnstile(request, env, request.headers.get('X-Turnstile-Token'))) return json({ error: 'captcha_failed' }, 403, request, env);
    const length = Number(request.headers.get('Content-Length') || 0);
    if (length > 20000) return json({ error: 'payload_too_large' }, 413, request, env);
    let rawBody;
    try { rawBody = await request.text(); } catch { return json({ error: 'invalid_body' }, 400, request, env); }
    if (rawBody.length > 20000) return json({ error: 'payload_too_large' }, 413, request, env);
    let body;
    try { body = JSON.parse(rawBody); } catch { return json({ error: 'invalid_json' }, 400, request, env); }
    const path = new URL(request.url).pathname;
    if (path === '/assistant') return handleAssistant(request, env, body);
    if (path === '/inquiries') return handleInquiry(request, env, body);
    return json({ error: 'not_found' }, 404, request, env);
  }
};
