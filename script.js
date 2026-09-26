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
tiger.className = 'rs-tiger is-grooming';
tiger.setAttribute('aria-label', 'Открыть чат с ИИ-помощником');
tiger.setAttribute('title', 'Поговорить с ИИ-помощником');
const tigerCanvas = document.createElement('canvas');
tigerCanvas.className = 'rs-tiger-canvas';
tigerCanvas.width = 284;
tigerCanvas.height = 340;
tiger.appendChild(tigerCanvas);
document.body.appendChild(tiger);

const tigerLick = new Image();
tigerLick.src = 'assets/mascot/tiger-lick.png?v=2';
const tigerContext = tigerCanvas.getContext('2d');
function drawTiger() {
  tigerContext.clearRect(0, 0, tigerCanvas.width, tigerCanvas.height);
  if (tigerLick.complete && tigerLick.naturalWidth) {
    const scale = Math.min((tigerCanvas.width - 10) / tigerLick.naturalWidth, (tigerCanvas.height - 8) / tigerLick.naturalHeight);
    const width = tigerLick.naturalWidth * scale;
    const height = tigerLick.naturalHeight * scale;
    tigerContext.drawImage(tigerLick, (tigerCanvas.width - width) / 2, tigerCanvas.height - height, width, height);
  }
}
tigerLick.addEventListener('load', drawTiger);
drawTiger();

tiger.addEventListener('click', () => {
  const assistantToggle = document.querySelector('#rsbot-toggle');
  if (assistantToggle) {
    assistantToggle.click();
  } else {
    window.setTimeout(() => document.querySelector('#rsbot-toggle')?.click(), 400);
  }
});
