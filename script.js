const form = document.querySelector('#leadForm');
const toast = document.querySelector('.toast');
form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const text = `Здравствуйте! Меня зовут ${data.get('name')}. Телефон: ${data.get('phone')}. Задача: ${data.get('message') || 'нужна консультация по холодильному оборудованию'}`;
  toast.classList.add('show');
  window.open(`https://wa.me/79025551200?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  setTimeout(() => toast.classList.remove('show'), 5000);
});

document.querySelector('.menu-toggle')?.addEventListener('click', () => {
  document.querySelector('.desktop-nav')?.classList.toggle('mobile-open');
});

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
tiger.setAttribute('title', 'Рефик — открыть ИИ-помощника');
tiger.innerHTML = `
  <span class="refik-motion" aria-hidden="true">
    <img class="refik-image refik-image--open" src="assets/mascot/refik-open.png?v=1" alt="">
    <img class="refik-image refik-image--blink" src="assets/mascot/refik-blink-smile.png?v=1" alt="">
  </span>
  <span class="refik-message">Чем могу помочь?</span>
`;
document.body.appendChild(tiger);

// Редкое живое моргание: два согласованных изображения, без деформации исходного PNG.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const temperatureReading = document.querySelector('#temperatureReading');
if (temperatureReading) {
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
  if (assistantToggle) {
    assistantToggle.click();
  } else {
    window.setTimeout(() => document.querySelector('#rsbot-toggle')?.click(), 400);
  }
});
