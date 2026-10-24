// Memoire de Nox : profil (onboarding), souvenirs courts, journal des taches,
// stats par jour et methodes de productivite. Fonctions pures sur l'objet `state`
// (sauvegarde dans main.js), pour pouvoir les tester sans Electron.

// Methodes proposees (voir docs/RECHERCHE-TDAH.md)
const METHODS = {
  five_minutes: { name: 'Règle des 5 minutes', emoji: '⏱️', focusMin: 5, breakMin: 0, checkInMin: 0,
    short: "Juste 5 minutes. Ensuite tu as le droit d'arrêter.",
    prompt: "Methode regle des 5 minutes : propose toujours un minuteur de 5 min ; a la fin, demande s'il veut continuer, sans pression." },
  pomodoro: { name: 'Pomodoro', emoji: '🍅', focusMin: 25, breakMin: 5, checkInMin: 0,
    short: '25 min de focus, 5 min de pause. On répète.',
    prompt: 'Methode Pomodoro : minuteur de focus a la duree preferee, puis propose une vraie pause de 5 min.' },
  body_doubling: { name: 'Body doubling', emoji: '👥', focusMin: 25, breakMin: 5, checkInMin: 10,
    short: 'Je reste avec toi et je prends des nouvelles.',
    prompt: 'Methode body doubling : tu travailles "a cote" de lui ; prends des nouvelles regulierement, tres brievement, sans juger.' },
  if_then: { name: 'Si… alors…', emoji: '🔀', focusMin: 15, breakMin: 5, checkInMin: 0,
    short: 'Un plan précis : « Si X arrive, alors je fais Y ».',
    prompt: 'Methode si-alors (implementation intentions) : pour chaque etape, formule un plan "Si [declencheur], alors [action]".' },
  timeboxing: { name: 'Time-boxing', emoji: '📦', focusMin: 45, breakMin: 10, checkInMin: 0,
    short: "Une durée fixée d'avance, puis on s'arrête vraiment.",
    prompt: "Methode time-boxing : fixe une duree d'avance ; a la fin, rappelle fermement mais gentiment de s'arreter et de faire une pause." },
  frog: { name: 'Manger la grenouille', emoji: '🐸', focusMin: 25, breakMin: 5, checkInMin: 0,
    short: 'La tâche la plus redoutée en premier.',
    prompt: 'Methode manger la grenouille : aide-le a commencer par la tache la plus redoutee, tot dans la journee.' },
  two_minutes: { name: 'Règle des 2 minutes', emoji: '⚡', focusMin: 2, breakMin: 0, checkInMin: 0,
    short: 'Si ça prend moins de 2 minutes, on le fait maintenant.',
    prompt: 'Methode regle des 2 minutes : si une action prend moins de 2 min, pousse a la faire tout de suite.' }
};

// Questions d'onboarding : une a la fois, toujours "Passer"
const ONBOARDING = [
  { key: 'name', ask: 'Comment je t\'appelle ?', input: true },
  { key: 'blocker', ask: 'Qu\'est-ce qui te freine le plus ?', options: [
    ['start', 'Démarrer'], ['focus', 'Rester concentré·e'], ['resume', 'Reprendre après une pause'],
    ['breaks', 'Je ne fais pas de pauses'], ['productive', 'Juste être plus efficace']] },
  { key: 'energy', ask: 'Quand as-tu le plus d\'énergie ?', options: [
    ['morning', 'Le matin'], ['afternoon', 'L\'après-midi'], ['evening', 'Le soir'], ['varies', 'Ça varie']] },
  { key: 'focusMin', ask: 'Combien de temps tu tiens concentré·e sans souffrir ?', options: [
    [10, '10 min'], [15, '15 min'], [25, '25 min'], [45, '45 min']] },
  { key: 'tone', ask: 'Je te parle comment ?', options: [
    ['douce', 'Tout doux'], ['normale', 'Normal'], ['stricte', 'Coach']] }
];

const LABELS = {
  blocker: { start: 'a du mal a demarrer', focus: 'a du mal a rester concentre', resume: 'a du mal a reprendre apres une interruption',
    breaks: 'oublie de faire des pauses (hyperfocus)', productive: 'veut surtout etre plus efficace' },
  energy: { morning: 'le matin', afternoon: "l'apres-midi", evening: 'le soir', varies: 'variable' }
};

function suggestMethod(profile = {}) {
  if (profile.blocker === 'start') return 'five_minutes';
  if (profile.blocker === 'focus') return 'body_doubling';
  if (profile.blocker === 'resume') return 'if_then';
  if (profile.blocker === 'breaks') return 'timeboxing';
  if (profile.energy === 'morning') return 'frog';
  return 'pomodoro';
}

function ensure(state) {
  state.profile = state.profile || {};
  state.facts = Array.isArray(state.facts) ? state.facts : [];
  state.journal = Array.isArray(state.journal) ? state.journal : [];
  state.stats = state.stats || {};
  if (!METHODS[state.method]) state.method = null;
  return state;
}

function dayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function bump(state, field, n = 1) {
  const k = dayKey();
  state.stats[k] = state.stats[k] || { steps: 0, tasksDone: 0, focusMs: 0 };
  state.stats[k][field] += n;
}

// Souvenir court appris en parlant ("bosse mieux avec de la musique")
function addFact(state, text) {
  const t = String(text || '').trim().slice(0, 160);
  if (!t || state.facts.some((f) => f.text.toLowerCase() === t.toLowerCase())) return null;
  const fact = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), text: t, at: Date.now() };
  state.facts.push(fact);
  state.facts = state.facts.slice(-40);
  return fact;
}
function removeFact(state, id) { state.facts = state.facts.filter((f) => f.id !== id); }

function startTask(state, title, steps) {
  const id = Date.now().toString(36);
  state.task = { id, title: String(title).slice(0, 120), steps: steps.map((s) => String(s).slice(0, 160)), current: 0, startedAt: Date.now() };
  state.journal.push({ id, title: state.task.title, steps: state.task.steps, done: 0, startedAt: state.task.startedAt, completedAt: null });
  state.journal = state.journal.slice(-60);
  return state.task;
}

// Etape courante faite : renvoie l'etape suivante ou la fin de la tache
function completeStep(state) {
  if (!state.task) return { ok: false, error: 'aucune tache en cours' };
  const entry = state.journal.find((j) => j.id === state.task.id);
  bump(state, 'steps');
  if (entry) entry.done = Math.min(entry.steps.length, state.task.current + 1);
  if (state.task.current >= state.task.steps.length - 1) {
    if (entry) entry.completedAt = Date.now();
    bump(state, 'tasksDone');
    const title = state.task.title;
    state.task = null; state.saved = null;
    return { ok: true, tache_terminee: true, titre: title };
  }
  state.task.current++;
  return { ok: true, etape_suivante: state.task.steps[state.task.current] };
}

function todayStats(state) { return state.stats[dayKey()] || { steps: 0, tasksDone: 0, focusMs: 0 }; }

// Resume injecte dans chaque conversation (chat et voix temps reel)
function summary(state) {
  const p = state.profile, m = METHODS[state.method];
  const lines = [];
  if (p.name) lines.push(`Prenom : ${p.name}.`);
  if (p.blocker) lines.push(`Il ${LABELS.blocker[p.blocker] || p.blocker}.`);
  if (p.energy) lines.push(`Energie : ${LABELS.energy[p.energy] || p.energy}.`);
  if (p.focusMin) lines.push(`Concentration confortable : ${p.focusMin} min (duree par defaut du minuteur).`);
  if (m) lines.push(`Methode choisie : ${m.name}. ${m.prompt}`);
  if (state.facts.length) lines.push(`Ce que tu sais de lui : ${state.facts.slice(-12).map((f) => f.text).join(' ; ')}.`);
  const recent = state.journal.slice(-5).map((j) => `"${j.title}" (${j.completedAt ? 'terminee' : `${j.done}/${j.steps.length} etapes`})`);
  if (recent.length) lines.push(`Taches recentes : ${recent.join(', ')}.`);
  const t = todayStats(state);
  lines.push(`Aujourd'hui : ${t.steps} etapes faites, ${Math.round(t.focusMs / 60000)} min de concentration, ${t.tasksDone} taches terminees.`);
  return lines.join('\n');
}

function timerMinutes(state) {
  const m = METHODS[state.method];
  if (m && m.focusMin <= 5) return m.focusMin;
  return Number(state.profile.focusMin) || m?.focusMin || 15;
}

module.exports = { METHODS, ONBOARDING, suggestMethod, ensure, dayKey, bump, addFact, removeFact, startTask, completeStep, todayStats, summary, timerMinutes };
