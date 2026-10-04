const form = document.querySelector('#leadForm');
const toast = document.querySelector('.toast');

function normalizePhone(value) {
  return String(value || '').replace(/[^\d+]/g, '').replace(/^8/, '+7');
}

function showPreparedMessage(message, whatsappUrl) {
  if (!toast) return;
  toast.innerHTML = '';
  toast.append(document.createTextNode(message + ' '));
  const link = document.createElement('a');
  link.href = whatsappUrl;
  link.target = '_blank';
  link.rel = 'noopener';
  link.textContent = 'Открыть WhatsApp';
  link.style.color = 'inherit';
  link.style.textDecoration = 'underline';
  toast.append(link);
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 7000);
}

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const phone = normalizePhone(data.get('phone'));
  if (phone.replace(/\D/g, '').length < 10) {
    form.querySelector('[name="phone"]')?.focus();
    showPreparedMessage('Проверьте номер телефона.', '#contacts');
    return;
  }
  const text = `Здравствуйте! Меня зовут ${data.get('name')}. Телефон: ${data.get('phone')}. Задача: ${data.get('message') || 'нужна консультация по холодильному оборудованию'}`;
  const whatsappUrl = `https://wa.me/79025551200?text=${encodeURIComponent(text)}`;
  showPreparedMessage('Сообщение подготовлено. Если WhatsApp не открылся, нажмите ссылку:', whatsappUrl);
  const popup = window.open(whatsappUrl, '_blank', 'noopener');
  if (!popup) return;
  form.reset();
});

const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.desktop-nav');
if (menuToggle && nav) {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-controls', 'main-navigation');
  nav.id = 'main-navigation';
  const setMenu = (open) => {
    nav.classList.toggle('mobile-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  };
  menuToggle.addEventListener('click', () => setMenu(!nav.classList.contains('mobile-open')));
  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') setMenu(false); });
}

if (!document.querySelector('script[src="assistant.js"]')) {
  const assistantScript = document.createElement('script');
  assistantScript.type = 'module';
  assistantScript.src = 'assistant.js';
  document.body.appendChild(assistantScript);
}

const tiger = document.createElement('button');
tiger.type = 'button';
tiger.className = 'rs-tiger rs-refik';
tiger.setAttribute('aria-label', 'Открыть чат с ИИ-помощником');
tiger.setAttribute('title', 'Айси — открыть ИИ-помощника');
tiger.innerHTML = `
  <span class="refik-motion" aria-hidden="true">
    <img class="refik-image refik-image--open" src="assets/mascot/refik-open.png?v=1" alt="">
    <img class="refik-image refik-image--blink" src="assets/mascot/refik-blink-smile.png?v=1" alt="">
  </span>
  <span class="refik-message">Я Айси, чем могу помочь?</span>
`;
document.body.appendChild(tiger);

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const temperatureReading = document.querySelector('#temperatureReading');
if (temperatureReading && !reducedMotion.matches) {
  const temperatureValues = ['−18.4°C', '−18.2°C', '−18.5°C', '−18.3°C', '−18.4°C'];
  let temperatureIndex = 0;
  window.setInterval(() => {
    temperatureIndex = (temperatureIndex + 1) % temperatureValues.length;
    temperatureReading.textContent = temperatureValues[temperatureIndex];
  }, 3600);
}

function scheduleRefikBlink() {
  if (reducedMotion.matches) return;
  const delay = 3200 + Math.random() * 4300;
  window.setTimeout(() => {
    tiger.classList.add('is-blinking');
    window.setTimeout(() => {
      tiger.classList.remove('is-blinking');
      if (Math.random() < 0.24) {
        window.setTimeout(() => {
          tiger.classList.add('is-blinking');
          window.setTimeout(() => tiger.classList.remove('is-blinking'), 150);
        }, 210);
      }
    }, 170);
    scheduleRefikBlink();
  }, delay);
}
scheduleRefikBlink();

tiger.addEventListener('click', () => {
  const assistantToggle = document.querySelector('#rsbot-toggle');
  if (assistantToggle) assistantToggle.click();
  else window.setTimeout(() => document.querySelector('#rsbot-toggle')?.click(), 400);
});
