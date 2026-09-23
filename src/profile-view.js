// Activity is private to the current account on this computer; never copy guest history into an account.
function activityKey() { return `hunterActivity.v1:${profileState.authenticated ? profileState.profile.id : 'guest'}`; }
function readActivity() {
  try { const rows = JSON.parse(localStorage.getItem(activityKey()) || '[]'); return Array.isArray(rows) ? rows.slice(0, 100) : []; } catch { return []; }
}
function recordActivity(kind, title, target, detail = '') {
  if (!profileReady) return;
  const rows = readActivity();
  if (rows[0]?.kind === kind && rows[0]?.target === target && Date.now() - rows[0].time < 30000) return;
  rows.unshift({ kind, title, target, detail, time: Date.now() });
  try { localStorage.setItem(activityKey(), JSON.stringify(rows.slice(0, 100))); } catch { /* History must not block navigation. */ }
}
function profilePortrait(profile, className) {
  const avatar = profile?.avatar;
  return `<div class="${className}">${avatar && /^data:image\/(png|jpeg|webp|gif);base64,/.test(avatar) ? `<img src="${escapeHtml(avatar)}" alt="Foto do caçador" />` : escapeHtml((profile?.displayName || 'NomeCaçador').charAt(0))}</div>`;
}
function activityThumbnail(entry) {
  if (entry.kind === 'view') {
    const nav = [...document.querySelectorAll('.main-nav [data-view]')].find(el => el.dataset.view === entry.target);
    if (nav?.querySelector('svg')) return nav.querySelector('svg').outerHTML;
  }
  const monster = entry.kind === 'monster' && monsters.find(m => m.id === entry.target);
  const art = monster && (monster.render || monster.icon || monster.iconFallbackAsset);
  return art ? `<img src="${escapeHtml(art)}" alt="" loading="lazy">` : `<svg viewBox="0 0 64 64" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><path d="${['build', 'build-view'].includes(entry.kind) ? 'M10 8 54 52 49 57 5 13ZM54 8 10 52 15 57 59 13ZM6 44 22 60M42 4 58 20' : 'M32 4 38 26 60 32 38 38 32 60 26 38 4 32 26 26Z'}"/></svg>`;
}
function renderSettings() {
  if (!profileState.authenticated) return renderAccountSettings();
  clearDetailHeader();
  viewRoot.classList.add('hunter-profile-page');
  viewTitle.textContent = 'PERFIL DO CAÇADOR';
  const p = profileState.profile;
  const history = readActivity();
  viewRoot.innerHTML = `<div class="profile-view-root">
    <section class="profile-hero-card">${profilePortrait(p, 'profile-hero-avatar')}<div class="profile-hero-copy"><h2>${escapeHtml(p.displayName)}</h2><p>● Perfil conectado</p><div class="profile-actions"><button id="edit-profile" class="primary-button">✎ Editar perfil</button><button id="profile-signout" class="ghost-button">⇥ Sair da conta</button></div></div><p class="profile-motto">CAÇADORES FAZEM<br>UM MUNDO MAIS RICO</p></section>
    <div class="profile-panels"><section class="settings-card"><h2>✥ Identidade de caça</h2><div class="profile-connection-list">
      <div><strong>Perfil da Steam</strong>${p.steamUrl ? `<a href="${escapeHtml(p.steamUrl)}" target="_blank" rel="noopener noreferrer">Abrir perfil ↗</a>` : '<button class="profile-text-action" data-edit-field="steam-url">Adicionar link ›</button>'}</div>
      <div><strong>Código de amizade — Monster Hunter Wilds</strong><button class="profile-text-action" data-edit-field="wilds-code">${escapeHtml(p.wildsCode || 'Adicionar código')}</button><button id="copy-wilds" class="ghost-button" aria-label="Copiar código de amizade" ${p.wildsCode ? '' : 'disabled'}>▣</button></div>
      <div><strong>Jogos acompanhados</strong><button class="profile-text-action profile-game-chips" data-edit-field="followed-games">${(p.followedGames ?? ['World / Iceborne','Rise / Sunbreak','Wilds']).map(g => `<span>${escapeHtml(g)}</span>`).join('') || 'Selecionar jogos'}</button></div>
      <div><strong>Título do caçador</strong><button class="profile-text-action" data-edit-field="hunter-title">${escapeHtml(p.hunterTitle || 'Rastreador de monstros')} ✥</button></div>
    </div><p class="profile-quote">“Conhecimento hoje. Novas caçadas amanhã.”</p></section>
    <section class="settings-card profile-activity-card"><h2>✥ Atividade recente</h2><div class="profile-history">${history.length ? history.map((e, i) => `<button class="profile-history-row" data-history-index="${i}"><span class="history-symbol">${e.kind === 'monster' ? '◇' : ['build', 'build-view'].includes(e.kind) ? '⚒' : '✥'}</span><span><small>${e.kind === 'monster' ? 'Monstro acessado' : e.kind === 'build' ? 'Build criada' : e.kind === 'build-view' ? 'Build aberta' : 'Tela acessada'}</small><strong>${escapeHtml(e.title)}</strong><small>${escapeHtml(e.detail)} · ${escapeHtml(new Date(e.time).toLocaleString('pt-BR'))}</small></span><span>›</span></button>`).join('') : '<p class="profile-empty-activity">Seu histórico aparecerá aqui ao acessar telas, consultar monstros e criar builds.</p>'}</div><small class="history-note">Histórico desta conta neste computador.</small></section></div><div id="profile-feedback" role="status"></div></div>`;
  document.querySelector('#edit-profile').onclick = () => renderProfileEditor();
  document.querySelectorAll('.history-symbol').forEach((el, i) => { el.innerHTML = activityThumbnail(history[i]); });
  document.querySelectorAll('[data-edit-field]').forEach(b => b.onclick = () => renderProfileEditor(b.dataset.editField));
  document.querySelector('#copy-wilds').onclick = async () => { try { await navigator.clipboard.writeText(p.wildsCode); document.querySelector('#profile-feedback').textContent = 'Código copiado.'; } catch { document.querySelector('#profile-feedback').textContent = 'Não foi possível copiar o código.'; } };
  document.querySelector('#profile-signout').onclick = async () => { try { applyProfileState(await window.hunterOverlay.profile.logout()); renderSettings(); } catch (e) { document.querySelector('#profile-feedback').textContent = e.message; } };
  document.querySelectorAll('[data-history-index]').forEach(b => b.onclick = () => {
    const e = history[Number(b.dataset.historyIndex)];
    if (e.kind === 'monster') { const m = monsters.find(m => m.id === e.target); if (m) { clearDetailHeader(); renderMonsterDetail(m); } }
    else { clearDetailHeader(); renderView(e.kind === 'build' ? 'saved-builds' : e.target); }
  });
}
function renderProfileEditor(focusId = 'name-input') {
  const p = profileState.profile;
  viewRoot.innerHTML = `<section class="settings-card profile-editor"><h2>Editar perfil</h2><button id="edit-avatar" class="profile-avatar-edit" title="Alterar foto">${profilePortrait(p, 'profile-hero-avatar')}<span>✎ Alterar foto</span></button><form id="profile-edit-form">
  <label class="field">Nome do caçador<input id="name-input" class="text-input" maxlength="32" value="${escapeHtml(p.displayName)}"></label>
  <label class="field">Perfil da Steam<input id="steam-url" class="text-input" type="url" value="${escapeHtml(p.steamUrl || '')}" placeholder="https://steamcommunity.com/id/seu-perfil"></label>
  <label class="field">Código de amizade — Monster Hunter Wilds<input id="wilds-code" class="text-input" maxlength="64" value="${escapeHtml(p.wildsCode || '')}"></label>
  <label class="field">Título do caçador<input id="hunter-title" class="text-input" maxlength="64" value="${escapeHtml(p.hunterTitle || 'Rastreador de monstros')}"></label>
  <fieldset id="followed-games" tabindex="-1"><legend>Jogos acompanhados</legend>${['World / Iceborne','Rise / Sunbreak','Wilds','Generations Ultimate'].map(g => `<label><input type="checkbox" name="followed-game" value="${g}" ${(p.followedGames ?? ['World / Iceborne','Rise / Sunbreak','Wilds']).includes(g) ? 'checked' : ''}> ${g}</label>`).join('')}</fieldset>
  <div class="profile-actions"><button class="primary-button" type="submit">Salvar alterações</button><button id="cancel-profile-edit" class="ghost-button" type="button">Cancelar</button></div><div id="profile-feedback" role="status"></div></form></section>`;
  document.querySelector('#edit-avatar').onclick = () => avatarInput.click();
  document.querySelector('#cancel-profile-edit').onclick = renderSettings;
  document.querySelector('#profile-edit-form').onsubmit = async e => { e.preventDefault(); const button = e.submitter; button.disabled = true; try {
    applyProfileState(await window.hunterOverlay.profile.update({ displayName: document.querySelector('#name-input').value, steamUrl: document.querySelector('#steam-url').value, wildsCode: document.querySelector('#wilds-code').value, hunterTitle: document.querySelector('#hunter-title').value, followedGames: [...document.querySelectorAll('[name="followed-game"]:checked')].map(el => el.value) })); renderSettings();
  } catch (error) { document.querySelector('#profile-feedback').textContent = error.message; button.disabled = false; } };
  document.getElementById(focusId)?.focus();
}
