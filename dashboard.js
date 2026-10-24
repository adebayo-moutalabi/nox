// Tableau de bord : suivi des taches, stats du jour, methodes et memoire.
// Se met a jour tout seul a chaque sauvegarde de l'etat (evenement nox:state).
const $ = (id) => document.getElementById(id);
let methods = {}, onboarding = [];

function el(tag, props = {}, ...kids) {
  const e = document.createElement(tag);
  Object.assign(e, props);
  for (const k of kids) e.append(k);
  return e;
}
const dayKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function renderHeader(st) {
  const h = new Date().getHours();
  const hi = h < 5 ? 'Bonne nuit' : h < 18 ? 'Bonjour' : 'Bonsoir';
  $('hello').textContent = st.profile?.name ? `${hi}, ${st.profile.name}` : hi;
  $('date').textContent = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  const m = methods[st.method];
  $('methodChip').textContent = m ? `${m.emoji}  ${m.name}` : 'Aucune méthode choisie';
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
    const bar = el('div', { className: 'progress', role: 'img', ariaLabel: `Étape ${t.current + 1} sur ${t.steps.length}` });
    t.steps.forEach((_, i) => bar.append(el('i', { className: i < t.current ? 'done' : i === t.current ? 'cur' : '' })));
    body.append(bar);
    const done = el('button', { className: 'btn primary', id: 'doneBtn', textContent: "✓  C'est fait" });
    done.onclick = () => window.nox.completeStep();
    const timer = el('button', { className: 'btn secondary', id: 'timerBtn', textContent: `⏱  Lancer ${st.timerMin} min` });
    timer.onclick = () => window.nox.startTimer(st.timerMin);
    body.append(el('div', { className: 'actions' }, done, timer));
  } else {
    body.append(el('p', { className: 'step-now', textContent: 'Sur quoi tu bosses ?' }));
    body.append(el('p', { className: 'empty-hint', textContent: 'Écris ta tâche telle qu\'elle te vient. Nox la découpe en petites étapes et te donne la première.' }));
    const input = el('input', { id: 'newTask', placeholder: 'Ex. rédiger mon rapport de stage', maxLength: 200 });
    const go = el('button', { className: 'btn primary', id: 'newTaskBtn', textContent: 'Découper avec Nox' });
    const submit = async () => {
      const v = input.value.trim(); if (!v) return;
      go.disabled = true; go.textContent = 'Nox réfléchit…';
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
    const name = d.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '');
    const b = el('div', { className: 'bar' });
    b.append(el('span', { className: 'tip', textContent: `${name} : ${vals[i]} min` }));
    const fill = el('i'); fill.style.height = `${(vals[i] / max) * 100}%`;
    b.append(fill);
    bars.append(b);
    labels.append(el('span', { textContent: i === 6 ? 'auj.' : name }));
    table.insertAdjacentHTML('beforeend', `<tr><td>${name}</td><td>${vals[i]}</td></tr>`);
  });
}

function renderSteps(st) {
  const list = $('steps');
  list.innerHTML = '';
  if (!st.task) { list.append(el('li', { className: 'muted', textContent: 'Pas de tâche en cours.' })); return; }
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
  const rows = [['Prénom', p.name], ['Frein', p.blocker && label('blocker')], ['Énergie', p.energy && label('energy')],
    ['Focus confortable', p.focusMin && `${p.focusMin} min`], ['Ton', p.tone && label('tone')]];
  for (const [k, v] of rows) if (v) prof.append(el('span', {}, el('b', { textContent: `${k} : ` }), v));
  if (!prof.children.length) prof.append(el('span', { className: 'muted', textContent: 'Fais l\'onboarding pour que Nox te connaisse.' }));
  const facts = $('facts');
  facts.innerHTML = '';
  if (!st.facts.length) facts.append(el('li', { className: 'muted', textContent: 'Nox retiendra ici ce qu\'il apprend en parlant avec toi.' }));
  for (const f of [...st.facts].reverse()) {
    const x = el('button', { textContent: '×', title: 'Oublier', ariaLabel: `Oublier : ${f.text}` });
    x.onclick = () => window.nox.forgetFact(f.id);
    facts.append(el('li', {}, el('span', { textContent: f.text }), x));
  }
}

function renderMethods(st) {
  const box = $('methods');
  box.innerHTML = '';
  for (const [id, m] of Object.entries(methods)) {
    const b = el('button', { className: 'method' + (st.method === id ? ' on' : ''), ariaPressed: String(st.method === id) },
      el('span', { className: 'e', textContent: m.emoji }), el('b', { textContent: m.name }), el('small', { textContent: m.short }),
      el('span', { className: 'tag', textContent: st.method === id ? '● Active' : m.focusMin ? `${m.focusMin} min` : '' }));
    b.dataset.method = id;
    b.onclick = () => window.nox.setSettings({ method: id });
    box.append(b);
  }
}

function renderHistory(st) {
  const list = $('history');
  list.innerHTML = '';
  const items = [...st.journal].reverse().slice(0, 8);
  if (!items.length) { list.append(el('li', { className: 'muted', textContent: 'Tes tâches apparaîtront ici.' })); return; }
  for (const j of items) {
    const when = new Date(j.startedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    const s = j.completedAt ? el('span', { className: 'state ok', textContent: `terminée · ${when}` }) : el('span', { className: 'state', textContent: `${j.done}/${j.steps.length} étapes · ${when}` });
    list.append(el('li', {}, el('span', { textContent: j.title }), s));
  }
}

function render(st) {
  renderHeader(st); renderNow(st); renderToday(st); renderSteps(st); renderMemory(st); renderMethods(st); renderHistory(st);
}

(async () => {
  ({ methods, onboarding } = await window.nox.getCatalog());
  render(await window.nox.getState());
  window.nox.onState(render);
})();
