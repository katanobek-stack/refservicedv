const config = window.REFSERVICE_CONFIG || {};
const API_ENDPOINT = String(config.assistantEndpoint || '').replace(/\/$/, '');
const INQUIRY_ENDPOINT = String(config.inquiryEndpoint || API_ENDPOINT).replace(/\/$/, '');
const PHONE = '+7 902 555 12 00';
const SLOTS = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

const style = document.createElement('style');
style.textContent = `
#rsbot-toggle{position:fixed;right:24px;bottom:26px;width:60px;height:60px;border:0;border-radius:50%;background:linear-gradient(135deg,#1499d5,#53d4e9);color:#fff;font-size:26px;cursor:pointer;box-shadow:0 8px 28px #1499d566;z-index:9999}
#rsbot-box{position:fixed;right:24px;bottom:98px;width:370px;max-width:calc(100vw - 32px);height:480px;background:#0b1b2d;border:1px solid #53d4e944;border-radius:18px;box-shadow:0 18px 60px #0009;z-index:9998;display:none;flex-direction:column;overflow:hidden;font-family:Manrope,Arial,sans-serif}
#rsbot-box.open{display:flex}#rsbot-hdr{padding:16px;background:linear-gradient(135deg,#123b52,#10263b);color:#fff;font-size:14px;font-weight:700}#rsbot-hdr small{display:block;color:#9fc8d4;font-size:10px;font-weight:500;margin-top:3px}
#rsbot-msgs{flex:1;overflow:auto;padding:14px;display:flex;flex-direction:column;gap:9px}.rsbot-msg{max-width:86%;padding:10px 13px;border-radius:13px;font-size:12px;line-height:1.55;white-space:pre-wrap}.rsbot-msg.bot{background:#53d4e91a;border:1px solid #53d4e922;color:#e6f1f4;align-self:flex-start}.rsbot-msg.user{background:#1499d5;color:#fff;align-self:flex-end}.rsbot-msg.system{background:#53e39a1a;color:#53e39a;align-self:center;font-size:11px}.rsbot-link{color:#53d4e9}.rsbot-picker{padding:12px;border-top:1px solid #53d4e922}.rsbot-picker-title{color:#d9edf1;font-size:12px;text-align:center;margin-bottom:8px}.rsbot-dates,.rsbot-slots{display:flex;gap:6px;overflow:auto;margin-bottom:8px}.rsbot-slots{display:grid;grid-template-columns:repeat(4,1fr)}.rsbot-date-btn,.rsbot-slot-btn,.rsbot-confirm-btn{border:1px solid #53d4e944;border-radius:8px;background:#53d4e90d;color:#cfe4e8;padding:8px 5px;font-size:11px;cursor:pointer}.rsbot-date-btn.sel,.rsbot-slot-btn.sel,.rsbot-confirm-btn{background:#1499d5;color:#fff;border-color:#1499d5}.rsbot-confirm-btn{width:100%}#rsbot-input-row{display:flex;gap:8px;padding:10px;border-top:1px solid #53d4e922}#rsbot-input{flex:1;resize:none;border:1px solid #ffffff22;border-radius:9px;background:#ffffff0d;color:#fff;padding:10px;font:12px Manrope}#rsbot-send{border:0;border-radius:9px;background:#ff754d;color:#1b1513;width:42px;cursor:pointer;font-size:16px}
@media(max-width:480px){#rsbot-box{right:16px;bottom:96px;height:min(520px,calc(100dvh - 116px))}#rsbot-toggle{right:16px}}
`;
document.head.appendChild(style);

const toggle = document.createElement('button');
toggle.id = 'rsbot-toggle';
toggle.type = 'button';
toggle.setAttribute('aria-label', 'Открыть ИИ-помощника');
toggle.setAttribute('aria-expanded', 'false');
toggle.textContent = '❄';
document.body.appendChild(toggle);

const box = document.createElement('div');
box.id = 'rsbot-box';
box.setAttribute('role', 'dialog');
box.setAttribute('aria-label', 'ИИ-помощник RefServiceDV');
box.innerHTML = '<div id="rsbot-hdr">RefService AI<small>Консультация по холодильным системам</small></div><div id="rsbot-msgs"></div><div id="rsbot-input-row"><textarea id="rsbot-input" rows="1" maxlength="2000" placeholder="Напишите, что случилось..."></textarea><button id="rsbot-send" type="button" aria-label="Отправить сообщение">➤</button></div>';
document.body.appendChild(box);

const msgs = box.querySelector('#rsbot-msgs');
const input = box.querySelector('#rsbot-input');
const send = box.querySelector('#rsbot-send');
let history = [];
let loading = false;
let booking = null;
let booked = false;

function add(text, kind) {
  const element = document.createElement('div');
  element.className = `rsbot-msg ${kind}`;
  element.textContent = text;
  msgs.appendChild(element);
  msgs.scrollTop = msgs.scrollHeight;
  return element;
}

function showFallback(message = 'ИИ-помощник сейчас недоступен. Заявку можно передать инженеру напрямую.') {
  const element = add(`${message}\n${PHONE}\nWhatsApp: https://wa.me/79025551200`, 'bot');
  element.innerHTML = element.textContent.replace(/(https:\/\/wa\.me\/[^\s]+)/g, '<a class="rsbot-link" href="$1" target="_blank" rel="noopener">открыть WhatsApp</a>');
}

async function callAI() {
  if (!API_ENDPOINT) throw new Error('assistant endpoint is not configured');
  const response = await fetch(`${API_ENDPOINT}/assistant`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'omit', body: JSON.stringify({ messages: history }) });
  if (!response.ok) throw new Error(`assistant request failed: ${response.status}`);
  const data = await response.json();
  return data.answer || data.content?.[0]?.text || '';
}

async function sendAI(text) {
  if (loading || booked) return;
  loading = true;
  add(text, 'user');
  history.push({ role: 'user', content: text });
  const typing = add('ИИ готовит ответ…', 'bot');
  try {
    const answer = await callAI();
    typing.remove();
    if (!answer) throw new Error('empty assistant response');
    history.push({ role: 'assistant', content: answer });
    const match = answer.match(/<BOOKING_READY>([\s\S]*?)<\/BOOKING_READY>/);
    add(match ? answer.replace(/<BOOKING_READY>[\s\S]*?<\/BOOKING_READY>/, '').trim() : answer, 'bot');
    if (match) {
      try { booking = JSON.parse(match[1].trim()); showPicker(); }
      catch { add('Данные заявки не распознаны. Оставьте номер телефона — инженер свяжется с вами.', 'bot'); }
    }
  } catch {
    typing.remove();
    showFallback();
  } finally {
    loading = false;
  }
}

function doSend() {
  const text = input.value.trim();
  if (!text || loading || booking) return;
  input.value = '';
  sendAI(text);
}

function datePartsInVladivostok(date) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Vladivostok', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  return Object.fromEntries(parts.filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]));
}

function dates() {
  const result = [];
  const cursor = new Date(Date.now() + 24 * 60 * 60 * 1000);
  while (result.length < 7) {
    const parts = datePartsInVladivostok(cursor);
    const weekday = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Vladivostok', weekday: 'short' }).format(cursor);
    if (weekday !== 'Sun' && weekday !== 'Sat') result.push({ key: `${parts.year}-${parts.month}-${parts.day}`, date: new Date(cursor) });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return result;
}

function fmt(date) { return new Intl.DateTimeFormat('ru-RU', { timeZone: 'Asia/Vladivostok', weekday: 'short', day: 'numeric', month: 'short' }).format(date); }

function showPicker() {
  box.querySelector('#rsbot-input-row').style.display = 'none';
  const wrap = document.createElement('div');
  wrap.className = 'rsbot-picker';
  wrap.innerHTML = '<div class="rsbot-picker-title">Желаемая дата и время — инженер подтвердит после заявки</div><div class="rsbot-dates"></div><div class="rsbot-slots"></div><button class="rsbot-confirm-btn" type="button" disabled>Выберите время</button>';
  const dateBox = wrap.children[1];
  const slotBox = wrap.children[2];
  const confirm = wrap.children[3];
  let date = null;
  let time = null;
  dates().forEach((item, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'rsbot-date-btn';
    button.textContent = fmt(item.date);
    button.onclick = () => { date = item.key; time = null; dateBox.querySelectorAll('button').forEach((element) => element.classList.remove('sel')); button.classList.add('sel'); confirm.disabled = true; confirm.textContent = 'Выберите время'; renderSlots(); };
    if (index === 0) { button.classList.add('sel'); date = item.key; }
    dateBox.appendChild(button);
  });
  function renderSlots() {
    slotBox.innerHTML = '';
    SLOTS.forEach((slot) => {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'rsbot-slot-btn'; button.textContent = slot;
      button.onclick = () => { time = slot; slotBox.querySelectorAll('button').forEach((element) => element.classList.remove('sel')); button.classList.add('sel'); confirm.disabled = false; confirm.textContent = 'Отправить пожелание'; };
      slotBox.appendChild(button);
    });
  }
  renderSlots();
  confirm.onclick = () => saveBooking(date, time, wrap);
  msgs.appendChild(wrap);
  msgs.scrollTop = msgs.scrollHeight;
}

async function saveBooking(date, time, wrap) {
  if (!booking) return;
  wrap.remove();
  add(`📅 Пожелание: ${date} · ${time}`, 'user');
  if (!INQUIRY_ENDPOINT) {
    showFallback('Заявка подготовлена, но автоматическая запись сейчас не подключена. Инженер примет её через мессенджер или по телефону.');
    return;
  }
  try {
    const response = await fetch(`${INQUIRY_ENDPOINT}/inquiries`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'omit', body: JSON.stringify({ ...booking, desiredDate: date, desiredTime: time, timeZone: 'Asia/Vladivostok', source: 'website-ai' }) });
    if (!response.ok) throw new Error('inquiry failed');
    booked = true;
    add('Заявка принята сервером. Желаемое время предварительное — инженер свяжется для подтверждения.', 'system');
  } catch {
    showFallback('Сервер заявки недоступен. Передайте пожелание инженеру напрямую:');
  }
  box.querySelector('#rsbot-input-row').style.display = 'flex';
}

toggle.onclick = () => {
  const open = box.classList.toggle('open');
  toggle.textContent = open ? '×' : '❄';
  toggle.setAttribute('aria-expanded', String(open));
  if (open && !history.length) { if (API_ENDPOINT) sendAI('Здравствуйте'); else showFallback(); }
};
send.onclick = doSend;
input.onkeydown = (event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); doSend(); } };
