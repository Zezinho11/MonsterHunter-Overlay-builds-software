const root = document.querySelector('#overlay-root');
const partsList = document.querySelector('#parts-list');
const hunterList = document.querySelector('#hunter-list');
const healthBar = document.querySelector('#monster-health');
const healthText = document.querySelector('#monster-health-text');
const healthPercent = document.querySelector('#monster-health-percent');
const staminaBar = document.querySelector('#stamina-bar');
const staminaText = document.querySelector('#stamina-text');
const weaknessList = document.querySelector('#weakness-list');
const ailmentsList = document.querySelector('#ailments-list');
const clock = document.querySelector('#session-clock');
const canvas = document.querySelector('#damage-chart');
const context = canvas.getContext('2d');
const monsterWidget = document.querySelector('#monster-widget');
const damageWidget = document.querySelector('#damage-widget');

function formatNumber(value) { return Math.round(value).toLocaleString('pt-BR'); }
function formatTime(seconds) { return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`; }

function renderParts(parts) {
  partsList.innerHTML = parts.map((part) => {
    const bars = part.bars.map((bar) => {
      const fillClass = part.state === 'Quebrado' ? 'broken' : bar.kind.toLowerCase();
      return `<div class="health-track part segmented"><div class="health-fill part-fill ${fillClass}" style="width:${(bar.current / bar.max) * 100}%"></div></div>`;
    }).join('');
    const values = part.bars.map((bar) => `${formatNumber(bar.current)} / ${formatNumber(bar.max)}`).join(' · ');
    return `<div class="part-row"><span class="part-index">${part.index}</span><span class="part-name">${part.name}</span><div class="part-bars">${bars}</div><span class="part-value">${part.state === 'Quebrado' ? 'QUEBRADO · ' : ''}${values}</span></div>`;
  }).join('');
}

function renderMonsterDetails(monster) {
  document.querySelector('#monster-icon').textContent = monster.icon || '◉';
  document.querySelector('#monster-type').textContent = monster.type || 'Tipo indisponível';
  weaknessList.innerHTML = (monster.weaknesses || []).map((weakness) => `<span class="weakness-icon" title="${weakness.label}">${weakness.icon}</span>`).join('');
  const stamina = monster.stamina;
  staminaText.textContent = `${formatNumber(stamina.current)} / ${formatNumber(stamina.max)}`;
  staminaBar.style.width = `${Math.min(100, (stamina.current / stamina.max) * 100)}%`;
  ailmentsList.innerHTML = (monster.ailments || []).map((ailment) => `<div class="ailment"><span class="ailment-ring" style="--ailment-color:${ailment.color}">${ailment.count}</span><span class="ailment-copy"><strong>${ailment.name}</strong><small>${ailment.timer || `${ailment.progress}%`}</small></span></div>`).join('');
}

function renderHunters(hunters) {
  const total = hunters.reduce((sum, hunter) => sum + hunter.totalDamage, 0);
  hunterList.innerHTML = hunters.map((hunter) => {
    const share = total ? (hunter.totalDamage / total) * 100 : 0;
    return `<div class="hunter-row"><span class="hunter-name"><span class="hunter-icon" style="background:${hunter.color}">${hunter.icon}</span>${hunter.name}</span><span class="hunter-share">${share.toFixed(2)}%</span><span class="hunter-dps">${hunter.dps.toFixed(2)}<small>DPS · ${formatNumber(hunter.totalDamage)}</small></span></div>`;
  }).join('');
}

function drawChart(chart, hunters) {
  const width = canvas.width;
  const height = canvas.height;
  context.clearRect(0, 0, width, height);
  context.strokeStyle = 'rgba(255,255,255,.1)';
  context.lineWidth = 1;
  for (let row = 1; row <= 3; row += 1) {
    const y = (height / 4) * row;
    context.beginPath(); context.moveTo(0, y); context.lineTo(width, y); context.stroke();
  }
  const maxValue = Math.max(120, ...chart.flatMap((point) => point.values));
  hunters.forEach((hunter, index) => {
    context.strokeStyle = hunter.color;
    context.lineWidth = 2;
    context.beginPath();
    chart.forEach((point, pointIndex) => {
      const x = chart.length === 1 ? 0 : (pointIndex / (chart.length - 1)) * width;
      const y = height - (point.values[index] / maxValue) * (height - 8) - 4;
      if (pointIndex === 0) context.moveTo(x, y); else context.lineTo(x, y);
    });
    context.stroke();
  });
}

function render(payload) {
  const { state, settings } = payload;
  const health = state.monster.maxHealth ? (state.monster.currentHealth / state.monster.maxHealth) * 100 : 0;
  healthBar.style.width = `${Math.max(0, Math.min(100, health))}%`;
  healthText.textContent = `${formatNumber(state.monster.currentHealth)} / ${formatNumber(state.monster.maxHealth)}`;
  healthPercent.textContent = `${health.toFixed(1).replace('.', ',')}%`;
  document.querySelector('#monster-name').textContent = state.monster.name;
  document.querySelector('#monster-state').textContent = state.monster.enraged ? 'ENFURECIDO' : 'NORMAL';
  renderMonsterDetails(state.monster);
  clock.textContent = formatTime(state.elapsedSeconds);
  root.style.opacity = settings.opacity;
  root.classList.toggle('edit-mode', settings.editMode);
  monsterWidget.hidden = settings.widgets?.monster === false;
  damageWidget.hidden = settings.widgets?.damage === false;
  renderParts(state.monster.parts);
  renderHunters(state.hunters);
  drawChart(state.chart, state.hunters);
}

window.hunterOverlay.onState(render);
