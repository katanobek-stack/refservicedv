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
tiger.className = 'rs-tiger is-sitting';
tiger.setAttribute('aria-label', 'Открыть чат с ИИ-помощником');
tiger.setAttribute('title', 'Поговорить с ИИ-помощником');
const tigerCanvas = document.createElement('canvas');
tigerCanvas.className = 'rs-tiger-canvas';
tigerCanvas.width = 284;
tigerCanvas.height = 340;
tiger.appendChild(tigerCanvas);
document.body.appendChild(tiger);

const tigerState = 'is-sitting';

const tigerWalk = new Image();
const tigerPoses = new Image();
tigerWalk.src = 'assets/mascot/white-tiger-walk.png?v=2';
tigerPoses.src = 'assets/mascot/white-tiger-sprite.png?v=3';
const walkFrames = [[14,258,257,199],[271,260,271,199],[555,258,259,199],[814,262,267,197],[1096,262,261,197],[1357,262,271,197],[1629,264,271,197],[1900,260,261,195]];
const poseFrames = [[38,228,323,323],[362,216,361,321],[724,214,317,345],[1120,178,295,395],[1448,218,335,353],[1818,172,325,405]];
const poseByState = {'is-sitting':2,'is-stretching':3,'is-shaking':4,'is-alert':5};
const tigerContext = tigerCanvas.getContext('2d');
function drawTiger(now) {
  const moving = tigerState === 'is-walking' || tigerState === 'is-running';
  const source = moving ? tigerWalk : tigerPoses;
  const frame = moving
    ? walkFrames[Math.floor(now / (tigerState === 'is-running' ? 75 : 135)) % walkFrames.length]
    : poseFrames[poseByState[tigerState] ?? 0];
  tigerContext.clearRect(0, 0, tigerCanvas.width, tigerCanvas.height);
  if (source.complete && source.naturalWidth) {
    const [sx, sy, sw, sh] = frame;
    const scale = Math.min((tigerCanvas.width - 12) / sw, (tigerCanvas.height - 8) / sh);
    const width = sw * scale;
    const height = sh * scale;
    let yShift = 0;
    let angle = 0;
    tigerContext.save();
    tigerContext.translate(tigerCanvas.width / 2, tigerCanvas.height / 2 + yShift);
    tigerContext.rotate(angle);
    tigerContext.drawImage(source, sx, sy, sw, sh, -width / 2, -height / 2, width, height);
    tigerContext.restore();
  }
  window.requestAnimationFrame(drawTiger);
}
window.requestAnimationFrame(drawTiger);

tiger.addEventListener('click', () => {
  const assistantToggle = document.querySelector('#rsbot-toggle');
  if (assistantToggle) {
    assistantToggle.click();
  } else {
    window.setTimeout(() => document.querySelector('#rsbot-toggle')?.click(), 400);
  }
});
