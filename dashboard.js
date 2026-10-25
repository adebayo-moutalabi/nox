// Tableau de bord : suivi des taches, stats du jour, methodes et memoire.
// Se met a jour tout seul a chaque sauvegarde de l'etat (evenement nox:state).
const $ = (id) => document.getElementById(id);
let methods = {}, onboarding = [], lang = 'fr';
const T = (key, vars) => t(lang, key, vars);
const locale = () => (lang === 'en' ? 'en-US' : 'fr-FR');

function el(tag, props = {}, ...kids) {
  const e = document.createElement(tag);
  Object.assign(e, props);
  for (const k of kids) e.append(k);
  return e;
}
const dayKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function renderHeader(st) {
  const h = new Date().getHours();
  const hi = T(h < 5 ? 'dash.hello.night' : h < 18 ? 'dash.hello.day' : 'dash.hello.evening');
  $('hello').textContent = st.profile?.name ? `${hi}, ${st.profile.name}` : hi;
  $('date').textContent = new Date().toLocaleDateString(locale(), { weekday: 'long', day: 'numeric', month: 'long' });
  const m = methods[st.method];
  $('methodChip').textContent = m ? `${m.emoji}  ${m.name}` : T('dash.noMethod');
}

function renderNow(st) {
  const body = $('nowBody');
  // Un rafraichissement ne doit pas effacer ce qu'on est en train d'ecrire
  const typing = !st.task && $('newTask');
  if (typing && !typing.disabled && document.activeElement === typing) return;
  body.innerHTML = '';
  if (st.task) {
    const t = st.task;
    body.append(el('p', { className: 'task-title', textContent: t.title }));
    body.append(el('p', { className: 'step-now', id: 'stepNow', textContent: t.steps[t.current] }));
    const bar = el('div', { className: 'progress', role: 'img', ariaLabel: T('dash.stepOf', { i: t.current + 1, n: t.steps.length }) });
    t.steps.forEach((_, i) => bar.append(el('i', { className: i < t.current ? 'done' : i === t.current ? 'cur' : '' })));
    body.append(bar);
    const done = el('button', { className: 'btn primary', id: 'doneBtn', textContent: T('dash.done') });
    done.onclick = () => window.nox.completeStep();
    const timer = el('button', { className: 'btn secondary', id: 'timerBtn', textContent: T('dash.timer', { min: st.timerMin }) });
    timer.onclick = () => window.nox.startTimer(st.timerMin);
    body.append(el('div', { className: 'actions' }, done, timer));
  } else {
    body.append(el('p', { className: 'step-now', textContent: T('dash.empty.title') }));
    body.append(el('p', { className: 'empty-hint', textContent: T('dash.empty.hint') }));
    const input = el('input', { id: 'newTask', placeholder: T('dash.empty.ph'), maxLength: 200 });
    const go = el('button', { className: 'btn primary', id: 'newTaskBtn', textContent: T('dash.empty.btn') });
    const submit = async () => {
      const v = input.value.trim(); if (!v) return;
      go.disabled = true; go.textContent = T('dash.thinking');
      await window.nox.newTask(v);
    };
    go.onclick = submit;
    input.onkeydown = (e) => { if (e.key === 'Enter') submit(); };
    body.append(el('div', { className: 'new' }, input, go));
  }
}

function renderToday(st) {
  const t = st.today;
  $('sSteps').textContent = t.steps;
  $('sFocus').textContent = Math.round(t.focusMs / 60000);
  $('sTasks').textContent = t.tasksDone;
  // 7 derniers jours : une seule serie (minutes), une seule teinte, survol = valeur exacte
  const days = [];
  for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); days.push(d); }
  const vals = days.map((d) => Math.round((st.stats[dayKey(d)]?.focusMs || 0) / 60000));
  const max = Math.max(10, ...vals);
  const bars = $('bars'), labels = $('barLabels'), table = $('chartTable');
  bars.innerHTML = ''; labels.innerHTML = ''; table.innerHTML = '<tr><th>Jour</th><th>Minutes</th></tr>';
  days.forEach((d, i) => {
    const name = d.toLocaleDateString(locale(), { weekday: 'short' }).replace('.', '');
    const b = el('div', { className: 'bar' });
    b.append(el('span', { className: 'tip', textContent: `${name} : ${vals[i]} min` }));
    const fill = el('i'); fill.style.height = `${(vals[i] / max) * 100}%`;
    b.append(fill);
    bars.append(b);
    labels.append(el('span', { textContent: i === 6 ? T('dash.today.short') : name }));
    table.insertAdjacentHTML('beforeend', `<tr><td>${name}</td><td>${vals[i]}</td></tr>`);
  });
}

function renderSteps(st) {
  const list = $('steps');
  list.innerHTML = '';
  if (!st.task) { list.append(el('li', { className: 'muted', textContent: T('dash.noTask') })); return; }
  st.task.steps.forEach((s, i) => {
    const cls = i < st.task.current ? 'done' : i === st.task.current ? 'cur' : '';
    list.append(el('li', { className: cls }, el('span', { className: 'box', textContent: i < st.task.current ? '✓' : '' }), el('span', { textContent: s })));
  });
}

function renderMemory(st) {
  const p = st.profile || {}, prof = $('profile');
  prof.innerHTML = '';
  const label = (key) => {
    const q = onboarding.find((o) => o.key === key);
    const opt = q?.options?.find(([v]) => String(v) === String(p[key]));
    return opt ? opt[1] : p[key];
  };
  const rows = [[T('prof.name'), p.name], [T('prof.blocker'), p.blocker && label('blocker')], [T('prof.energy'), p.energy && label('energy')],
    [T('prof.focus'), p.focusMin && `${p.focusMin} min`], [T('prof.tone'), p.tone && label('tone')], [T('prof.lang'), (st.lang || '').toUpperCase()]];
  for (const [k, v] of rows) if (v) prof.append(el('span', {}, el('b', { textContent: `${k} : ` }), v));
  if (!prof.children.length) prof.append(el('span', { className: 'muted', textContent: T('dash.noProfile') }));
  const facts = $('facts');
  facts.innerHTML = '';
  if (!st.facts.length) facts.append(el('li', { className: 'muted', textContent: T('dash.noFacts') }));
  for (const f of [...st.facts].reverse()) {
    const x = el('button', { textContent: '×', title: T('dash.forget'), ariaLabel: `${T('dash.forget')} : ${f.text}` });
    x.onclick = () => window.nox.forgetFact(f.id);
    facts.append(el('li', {}, el('span', { textContent: f.text }), x));
  }
}

// Notes facon Keep : les plus recentes d'abord, supprimables d'un clic
function renderNotes(st) {
  const box = $('notes');
  box.innerHTML = '';
  if (!st.notes?.length) { box.append(el('p', { className: 'muted', textContent: T('dash.notes.empty') })); return; }
  for (const n of [...st.notes].reverse()) {
    const x = el('button', { textContent: '×', title: T('dash.forget'), ariaLabel: `${T('dash.forget')} : ${n.text}` });
    x.onclick = () => window.nox.removeNote(n.id);
    const when = new Date(n.at).toLocaleString(locale(), { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    box.append(el('div', { className: 'note' }, el('p', { textContent: n.text }), el('time', { textContent: when }), x));
  }
}
$('noteForm').onsubmit = async (e) => {
  e.preventDefault();
  const v = $('noteInput').value.trim();
  if (!v) return;
  $('noteInput').value = '';
  await window.nox.addNote(v);
};

// Methodes : un clic active la methode, Nox l'annonce, et la carte active propose le minuteur
let justChosen = null;
function renderMethods(st) {
  const box = $('methods');
  box.innerHTML = '';
  for (const [id, m] of Object.entries(methods)) {
    const active = st.method === id;
    const card = el('div', { className: 'method' + (active ? ' on' : '') + (active && justChosen === id ? ' pop' : ''), role: 'button', tabIndex: 0, ariaPressed: String(active) },
      el('span', { className: 'e', textContent: m.emoji }), el('b', { textContent: m.name }), el('small', { textContent: m.short }),
      el('span', { className: 'tag', textContent: active ? T('dash.active') : m.focusMin ? `${m.focusMin} min` : '' }));
    card.dataset.method = id;
    const choose = () => { if (active) return; justChosen = id; card.classList.add('on', 'pop'); window.nox.setSettings({ method: id }); };
    card.onclick = choose;
    card.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(); } };
    if (active) {
      const start = el('button', { className: 'start', textContent: T('dash.timer', { min: st.timerMin }) });
      start.onclick = (e) => { e.stopPropagation(); window.nox.startTimer(st.timerMin); start.textContent = '✓'; };
      card.append(start);
    }
    box.append(card);
  }
}

function renderHistory(st) {
  const list = $('history');
  list.innerHTML = '';
  const items = [...st.journal].reverse().slice(0, 8);
  if (!items.length) { list.append(el('li', { className: 'muted', textContent: T('dash.noHistory') })); return; }
  for (const j of items) {
    const when = new Date(j.startedAt).toLocaleDateString(locale(), { day: 'numeric', month: 'short' });
    const s = j.completedAt ? el('span', { className: 'state ok', textContent: T('dash.histDone', { when }) }) : el('span', { className: 'state', textContent: T('dash.histSteps', { done: j.done, n: j.steps.length, when }) });
    list.append(el('li', {}, el('span', { textContent: j.title }), s));
  }
}

function renderGame(st) {
  const lv = st.level, xp = st.game.xp;
  $('lvNum').textContent = lv.level;
  $('lvGrade').textContent = levels[lv.level - 1]?.[1] || lv.grade;
  $('lvNext').textContent = lv.next ? T('dash.xpNext', { xp, left: lv.next - xp, grade: levels[lv.level]?.[1] || lv.nextGrade }) : T('dash.xpMax', { xp });
  const pct = lv.next ? ((xp - lv.floor) / (lv.next - lv.floor)) * 100 : 100;
  $('xpFill').style.width = `${Math.max(3, pct)}%`;
  $('xpBar').ariaLabel = T('dash.xpAria', { pct: Math.round(pct) });
  const box = $('skills');
  box.innerHTML = '';
  for (const [id, s] of Object.entries(skills)) {
    const on = Boolean(st.game.skills[id]);
    box.append(el('div', { className: 'skill' + (on ? ' on' : ''), title: s.desc }, el('span', { className: 'e', textContent: s.emoji }), s.name));
  }
}

function renderAgenda(st) {
  const list = $('agenda');
  list.innerHTML = '';
  if (!st.connections.calendar) { list.append(el('li', { className: 'muted', textContent: T('dash.agenda.none') })); return; }
  if (!st.events.length) { list.append(el('li', { className: 'muted', textContent: T('dash.agenda.empty') })); return; }
  for (const e of st.events) {
    const t = e.allDay ? T('dash.allDay') : new Date(e.start).toLocaleTimeString(locale(), { hour: '2-digit', minute: '2-digit' });
    list.append(el('li', {}, el('time', { textContent: t }), el('span', { textContent: e.title || T('dash.untitled') })));
  }
}

// Etat d'une connexion : ok, erreur ou a faire
function connState(id, ok, err, okText) {
  const s = $(id);
  s.className = 'state' + (err ? ' err' : ok ? ' ok' : '');
  s.textContent = err ? err : ok ? okText : T('conn.none');
}
function renderConnections(st) {
  connState('sOpenai', st.hasKey, '', T('conn.keySaved'));
  if (!st.hasKey) $('sOpenai').textContent = T(st.demoMode || st.testMode ? 'conn.demo' : 'conn.noKey');
  connState('sAgenda', st.connections.calendar, st.errors.calendar, T('conn.calOk', { n: st.events.length }));
  connState('sGmail', st.connections.gmail, st.errors.gmail, T('conn.gmailOk', { user: st.mail.user }));
  connState('sTelegram', st.telegram.chatId, st.errors.telegram, T('conn.tgOk', { bot: st.telegram.botName }));
  if (st.connections.telegram && !st.telegram.chatId) { $('sTelegram').textContent = T('conn.scan'); showQr(); }
  if (st.telegram.chatId) $('qr').hidden = true;
  const w = $('watches');
  w.innerHTML = '';
  for (const x of st.mail.watches) {
    const b = el('button', { textContent: '×', ariaLabel: T('conn.unwatch', { q: x.query }) });
    b.onclick = () => window.nox.unwatch(x.id);
    w.append(el('li', {}, el('span', { textContent: T('conn.waiting', { q: x.query }) }), b));
  }
}
async function showQr(data) {
  const q = data || await window.nox.telegramQr();
  if (q?.qr) { $('qr').src = q.qr; $('qr').hidden = false; }
}
// Formulaires : un message d'etat a la place du bouton pendant l'envoi
function wire(formId, action) {
  $(formId).onsubmit = async (e) => {
    e.preventDefault();
    const btn = $(formId).querySelector('button'), label = btn.textContent;
    btn.disabled = true; btn.textContent = '…';
    const r = await action();
    btn.disabled = false; btn.textContent = r?.ok ? '✓' : label;
    if (r && !r.ok) alert(r.error);
    for (const i of $(formId).querySelectorAll('input[type=password]')) i.value = '';
    setTimeout(() => { btn.textContent = label; }, 2000);
  };
}
wire('fOpenai', () => window.nox.setApiKey($('iOpenai').value));
wire('fAgenda', () => window.nox.setCalendar($('iAgenda').value));
wire('fGmail', () => window.nox.setGmail($('iGmailUser').value, $('iGmailPass').value));
wire('fTelegram', async () => { const r = await window.nox.setTelegram($('iTelegram').value); if (r.ok) showQr(r); return r; });

let skills = {}, levels = [];
// Change la langue : textes statiques + catalogue traduit
async function setLang(l) {
  lang = l;
  applyI18n(lang);
  document.title = `Nox — ${T('dash.title')}`;
  $('qr').alt = T('conn.qrAlt');
  ({ methods, onboarding, skills, levels } = await window.nox.getCatalog());
}
async function render(st) {
  if (st.lang && st.lang !== lang) await setLang(st.lang);
  renderHeader(st); renderNow(st); renderToday(st); renderGame(st); renderAgenda(st); renderSteps(st); renderMemory(st); renderNotes(st); renderMethods(st); renderConnections(st); renderHistory(st);
}

(async () => {
  const st = await window.nox.getState();
  await setLang(st.lang || 'fr');
  render(st);
  window.nox.onState(render);
})();
