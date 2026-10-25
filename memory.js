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
    prompt: 'Methode Pomodoro : seances de 25 min de focus, puis une vraie pause de 5 min.' },
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

// ---------- Mode jeu ----------
// Gagner de l'XP, monter de grade, debloquer des competences. Jamais de serie perdue
// ni de compteur d'echecs (DESIGN.md : celebrer sans culpabiliser).
const LEVELS = [
  [0, 'Étincelle'], [50, 'Démarreur'], [150, 'Explorateur'], [300, 'Bâtisseur'], [500, 'Pilote'],
  [800, 'Stratège'], [1200, 'Maître du focus'], [1800, 'Légende']
];
const XP = { task_started: 5, step: 10, task_done: 50, resume: 15, focus_15: 5, timer_done: 5 };
const SKILLS = {
  first_step: { name: 'Premier pas', emoji: '👣', desc: 'Ta toute première étape.', test: (c) => c.steps >= 1 },
  starter: { name: 'Démarreur', emoji: '🚀', desc: '5 tâches lancées.', test: (c) => c.started >= 5 },
  finisher: { name: 'Finisseur', emoji: '🏁', desc: '3 tâches terminées.', test: (c) => c.done >= 3 },
  comeback: { name: 'Retour gagnant', emoji: '🔁', desc: '3 reprises après une pause.', test: (c) => c.resumes >= 3 },
  deep_focus: { name: 'Plongée', emoji: '🌊', desc: '60 min de focus dans la journée.', test: (c, s) => (todayStats(s).focusMs || 0) >= 3600000 },
  early_bird: { name: 'Lève-tôt', emoji: '🌅', desc: 'Une étape faite avant 9 h.', test: (c) => c.early >= 1 },
  steady: { name: 'Constance', emoji: '🌱', desc: 'Des étapes faites sur 3 jours différents.', test: (c, s) => Object.values(s.stats).filter((d) => d.steps > 0).length >= 3 },
  hundred: { name: 'Centurion', emoji: '💯', desc: '100 étapes faites.', test: (c) => c.steps >= 100 }
};
function levelOf(xp) {
  let i = 0;
  while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1][0]) i++;
  const next = LEVELS[i + 1];
  return { level: i + 1, grade: LEVELS[i][1], floor: LEVELS[i][0], next: next ? next[0] : null, nextGrade: next ? next[1] : null };
}
// Ajoute l'XP d'un evenement et renvoie ce qu'il faut celebrer
function award(state, event) {
  const g = state.game;
  const before = levelOf(g.xp).level;
  g.xp += XP[event] || 0;
  const c = g.counters;
  if (event === 'step') { c.steps++; if (new Date().getHours() < 9) c.early++; }
  if (event === 'task_started') c.started++;
  if (event === 'task_done') c.done++;
  if (event === 'resume') c.resumes++;
  const skills = [];
  for (const [id, s] of Object.entries(SKILLS)) if (!g.skills[id] && s.test(c, state)) { g.skills[id] = Date.now(); skills.push({ id, name: s.name, emoji: s.emoji }); }
  const lv = levelOf(g.xp);
  return { xp: XP[event] || 0, total: g.xp, levelUp: lv.level > before ? lv : null, skills };
}
// Fusionne plusieurs recompenses (une etape qui termine aussi la tache)
function mergeRewards(a, b) {
  return { xp: a.xp + b.xp, total: b.total, levelUp: b.levelUp || a.levelUp, skills: [...a.skills, ...b.skills] };
}

function ensure(state) {
  state.profile = state.profile || {};
  state.facts = Array.isArray(state.facts) ? state.facts : [];
  state.notes = Array.isArray(state.notes) ? state.notes : [];
  state.journal = Array.isArray(state.journal) ? state.journal : [];
  state.stats = state.stats || {};
  state.game = state.game || {};
  state.game.xp = Number(state.game.xp) || 0;
  state.game.skills = state.game.skills || {};
  state.game.counters = { steps: 0, started: 0, done: 0, resumes: 0, early: 0, ...(state.game.counters || {}) };
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

// Notes facon Keep : ce que l'utilisateur dicte ("note que je dois rappeler Marie")
function addNote(state, text) {
  const t = String(text || '').trim().slice(0, 300);
  if (!t) return null;
  const note = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), text: t, at: Date.now() };
  state.notes.push(note);
  state.notes = state.notes.slice(-100);
  return note;
}
function removeNote(state, id) { state.notes = state.notes.filter((n) => n.id !== id); }

function startTask(state, title, steps) {
  const id = Date.now().toString(36);
  state.task = { id, title: String(title).slice(0, 120), steps: steps.map((s) => String(s).slice(0, 160)), current: 0, startedAt: Date.now() };
  state.journal.push({ id, title: state.task.title, steps: state.task.steps, done: 0, startedAt: state.task.startedAt, completedAt: null });
  state.journal = state.journal.slice(-60);
  state.lastReward = award(state, 'task_started');
  return state.task;
}

// Etape courante faite : renvoie l'etape suivante ou la fin de la tache
function completeStep(state) {
  if (!state.task) return { ok: false, error: 'aucune tache en cours' };
  const entry = state.journal.find((j) => j.id === state.task.id);
  bump(state, 'steps');
  let reward = award(state, 'step');
  if (entry) entry.done = Math.min(entry.steps.length, state.task.current + 1);
  if (state.task.current >= state.task.steps.length - 1) {
    if (entry) entry.completedAt = Date.now();
    bump(state, 'tasksDone');
    reward = mergeRewards(reward, award(state, 'task_done'));
    const title = state.task.title;
    state.task = null; state.saved = null;
    return { ok: true, tache_terminee: true, titre: title, xp_gagne: reward.xp, reward };
  }
  state.task.current++;
  return { ok: true, etape_suivante: state.task.steps[state.task.current], xp_gagne: reward.xp, reward };
}

function todayStats(state) { return state.stats[dayKey()] || { steps: 0, tasksDone: 0, focusMs: 0 }; }

// Resume injecte dans chaque conversation (chat et voix temps reel)
function summary(state) {
  const p = state.profile, m = METHODS[state.method];
  const lines = [];
  if (p.name) lines.push(`Prenom : ${p.name}.`);
  if (p.blocker) lines.push(`Il ${LABELS.blocker[p.blocker] || p.blocker}.`);
  if (p.energy) lines.push(`Energie : ${LABELS.energy[p.energy] || p.energy}.`);
  if (p.focusMin) lines.push(`Concentration confortable : ${p.focusMin} min.`);
  if (m) lines.push(`Methode choisie : ${m.name}. ${m.prompt}`);
  if (state.facts.length) lines.push(`Ce que tu sais de lui : ${state.facts.slice(-12).map((f) => f.text).join(' ; ')}.`);
  if (state.notes.length) lines.push(`Ses notes (les plus recentes, a relire s'il le demande) : ${state.notes.slice(-8).map((n) => `"${n.text}"`).join(' ; ')}.`);
  const recent = state.journal.slice(-5).map((j) => `"${j.title}" (${j.completedAt ? 'terminee' : `${j.done}/${j.steps.length} etapes`})`);
  if (recent.length) lines.push(`Taches recentes : ${recent.join(', ')}.`);
  const t = todayStats(state);
  lines.push(`Aujourd'hui : ${t.steps} etapes faites, ${Math.round(t.focusMs / 60000)} min de concentration, ${t.tasksDone} taches terminees.`);
  const lv = levelOf(state.game.xp);
  lines.push(`Mode jeu : niveau ${lv.level} (${lv.grade}), ${state.game.xp} XP.`);
  return lines.join('\n');
}

// Duree du minuteur : celle de la methode choisie (Pomodoro = 25 min), sinon la duree confortable du profil
function timerMinutes(state) {
  const m = METHODS[state.method];
  return m?.focusMin || Number(state.profile.focusMin) || 15;
}

module.exports = { METHODS, ONBOARDING, LEVELS, SKILLS, XP, suggestMethod, ensure, dayKey, bump, addFact, removeFact, addNote, removeNote, startTask, completeStep, todayStats, summary, timerMinutes, levelOf, award };
