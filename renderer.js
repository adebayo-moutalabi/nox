// ---------- Mascotte (voir mascot.js) ----------
document.getElementById('mascot').innerHTML = buildMascot();

// ---------- Etat UI ----------
const $ = (id) => document.getElementById(id);
const appEl = $('app'), bubble = $('bubble'), input = $('input'), bar = $('bar'), stage = $('stage');
const lookEl = $('look'), mouthEl = $('mouthOpen'), mascotEl = $('mascot');
let voiceOn = true, hideTimer = null, timer = null, recorder = null, chunks = [], audio = null;
const MOODS = ['idle', 'focus', 'happy', 'worried', 'proud'];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let mood = 'focus', act = ''; // act : '' | listening | thinking | speaking
let lang = 'fr';               // langue de l'interface et de la conversation (voir i18n.js)
const T = (key, vars) => t(lang, key, vars);

// Humeur (visage, couleur) et activite (ecoute, reflexion, parole) sont independantes
function setMood(m) {
  if (!MOODS.includes(m)) m = 'focus';
  MOODS.forEach((x) => appEl.classList.remove(x));
  appEl.classList.add(m);
  mood = m;
}
function setAct(a) { act = a || ''; appEl.dataset.act = act; }
// Petite animation ponctuelle : ajoute une classe sur #app pendant `ms`
function flash(cls, ms) { appEl.classList.add(cls); setTimeout(() => appEl.classList.remove(cls), ms); }

function say(text, step) {
  if (card) return; // une question (onboarding, permission) est affichee : on ne l'ecrase pas
  bubble.classList.remove('card');
  bubble.innerHTML = '';
  bubble.append(document.createTextNode(text));
  if (step) { const s = document.createElement('span'); s.className = 'step'; s.textContent = '→ ' + step; bubble.append(s); }
  bubble.classList.add('show');
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => bubble.classList.remove('show'), 25000);
}

// ---------- Voix + synchronisation de la bouche ----------
let actx = null, analyser = null, samples = null;
function audioGraph() {
  if (!actx) {
    actx = new AudioContext();
    analyser = actx.createAnalyser();
    analyser.fftSize = 512;
    samples = new Uint8Array(analyser.fftSize);
    analyser.connect(actx.destination);
  }
  if (actx.state === 'suspended') actx.resume();
}
function stopSpeaking() { if (audio) { audio.pause(); audio = null; } if (act === 'speaking') setAct(''); }
async function talk(text) {
  if (!voiceOn || !text) return;
  const b64 = await window.nox.speak(text);
  if (!b64) return;
  stopSpeaking();
  const a = new Audio('data:audio/mp3;base64,' + b64);
  audio = a;
  try { audioGraph(); actx.createMediaElementSource(a).connect(analyser); } catch {}
  a.onplay = () => setAct('speaking');
  a.onended = a.onpause = () => { if (audio === a && act === 'speaking') setAct(''); };
  a.play().catch(() => {});
}
// Volume instantane de la voix (0 a 1) : flux temps reel s'il est ouvert, sinon synthese classique
let rtAnalyser = null;
function voiceLevel() {
  const an = Realtime.open && rtAnalyser ? rtAnalyser : act === 'speaking' ? analyser : null;
  if (!an) return 0;
  an.getByteTimeDomainData(samples);
  let sum = 0;
  for (const v of samples) sum += ((v - 128) / 128) ** 2;
  return Math.min(1, Math.max(0, (Math.sqrt(sum / samples.length) - 0.02) * 7));
}

async function handle(out) {
  if (!out) return;
  setMood(out.mood);
  setAct('');
  const st = await window.nox.getState();
  const step = st.task ? st.task.steps?.[st.task.current] : null;
  say(out.reply, step);
  talk(out.reply);
  if (out.taskDone) { stopTimer(); flash('jump', 500); }
  if (out.action?.type === 'start_timer') startTimer(Number(out.action.value) || st.timerMin);
  if (out.action?.type === 'pause') stopTimer();
}

async function ask(text) {
  if (!text.trim()) return;
  if (pendingAnswer) { pendingAnswer(text.trim()); return; } // reponse parlee/ecrite a une question
  if (mood === 'idle') setMood('focus');
  if (mood === 'idle') setMood('focus');
  setAct('thinking');
  say('…');
  handle(await window.nox.ask(text));
}

// ---------- Minuteur visible ----------
function startTimer(min) {
  stopTimer();
  const total = min * 60; let left = total;
  const ring = $('ringBar'), label = $('timerLabel');
  label.style.display = 'block';
  const draw = () => {
    ring.style.strokeDashoffset = 377 * (left / total);
    label.textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
  };
  draw();
  timer = setInterval(() => {
    left--; draw();
    if (left <= 0) {
      stopTimer();
      setMood('proud');
      window.nox.timerDone();
      const m = methods[currentMethod];
      const pause = m?.breakMin ? ` Methode ${m.name} : propose une vraie pause de ${m.breakMin} min.` : '';
      systemEvent(`Le minuteur de ${min} min est termine. Demande gentiment si l'etape est faite et propose la suite.${pause}`);
    }
  }, 1000);
}
window.nox.onStartTimer((min) => startTimer(min));
function stopTimer() { clearInterval(timer); timer = null; $('ringBar').style.strokeDashoffset = 377; $('timerLabel').style.display = 'none'; }

// ---------- Texte ----------
$('write').onclick = () => { bar.classList.toggle('typing'); if (bar.classList.contains('typing')) input.focus(); };
input.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return;
  const t = input.value.trim(); input.value = ''; bar.classList.remove('typing');
  if (!t) return;
  if (Realtime.open) { window.nox.remember('user', t); setAct('thinking'); Realtime.sendText(t); } else ask(t);
});

// Evenement systeme : injecte dans la session vocale si elle est ouverte, sinon via le chat
function systemEvent(text) {
  if (Realtime.open) Realtime.inject(text);
  else ask(`[EVENEMENT SYSTEME] ${text}`);
}

// ---------- Voix temps reel (secours : ancien micro ci-dessous) ----------
let currentStep = null, lastVoiceAt = 0;
const RT_IDLE_MS = 3 * 60 * 1000; // sans parole pendant 3 min, on coupe la session (cout + vie privee)
async function refreshStep() {
  const st = await window.nox.getState();
  currentStep = st.task ? st.task.steps?.[st.task.current] : null;
}
async function toggleVoice() {
  if (Realtime.open) { Realtime.close(); return; }
  // Pendant une question, la reponse parlee passe par le micro classique (transcription)
  if (pendingAnswer || (recorder && recorder.state === 'recording')) { toggleMic(); return; }
  stopSpeaking();
  if (mood === 'idle') setMood('focus');
  setAct('thinking');
  say(T('say.connecting'));
  try {
    await Realtime.connect();
    await refreshStep();
    lastVoiceAt = Date.now();
    $('mic').classList.add('rec');
    setAct('listening');
    say(T('say.listening'), currentStep);
  } catch (e) {
    console.warn('Temps reel indisponible, ancien systeme :', e.message);
    Realtime.close();
    setAct('');
    toggleMic();
  }
}
Realtime.on = {
  stream(s) {
    audioGraph();
    rtAnalyser = actx.createAnalyser();
    rtAnalyser.fftSize = 512;
    actx.createMediaStreamSource(s).connect(rtAnalyser); // mesure seulement : l'element audio joue deja la voix
  },
  listening() { lastVoiceAt = Date.now(); stopSpeaking(); if (mood === 'idle') setMood('focus'); setAct('listening'); },
  thinking() { setAct('thinking'); },
  userText(t) { window.nox.remember('user', t); },
  caption(text) { say(text, currentStep); },
  speakingStart() { lastVoiceAt = Date.now(); setAct('speaking'); },
  speakingStop() { if (act === 'speaking') setAct('listening'); },
  async tool(name, args, userText) {
    if (name === 'start_timer') { startTimer(Number(args.minutes) || 5); return { ok: true }; }
    if (name === 'set_mood') { setMood(args.mood); return { ok: true }; }
    const r = await window.nox.tool(name, args, userText);
    await refreshStep();
    if (r?.tache_terminee) { stopTimer(); setMood('proud'); flash('jump', 500); }
    return r;
  },
  error(m) { say(T('say.oops') + m); },
  closed() { $('mic').classList.remove('rec'); rtAnalyser = null; setAct(''); say(T('say.micOff')); }
};
setInterval(() => { if (Realtime.open && act !== 'speaking' && Date.now() - lastVoiceAt > RT_IDLE_MS) Realtime.close(); }, 15000);

// ---------- Micro classique (secours) ----------
async function toggleMic() {
  if (recorder && recorder.state === 'recording') { recorder.stop(); return; }
  stopSpeaking(); // on peut couper la parole a Nox
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    chunks = [];
    recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = async () => {
      $('mic').classList.remove('rec');
      stream.getTracks().forEach((t) => t.stop());
      setAct('thinking');
      if (!card) say(T('say.listeningShort'));
      const buf = await new Blob(chunks, { type: 'audio/webm' }).arrayBuffer();
      const text = await window.nox.transcribe(buf);
      if (text) ask(text); else { setAct(''); if (!card) say(T('say.notHeard')); }
    };
    recorder.start();
    $('mic').classList.add('rec');
    if (mood === 'idle') setMood('focus');
    setAct('listening');
  } catch { setAct(''); say(T('say.noMic')); }
}
$('mic').onclick = toggleVoice;
$('voice').onclick = () => {
  voiceOn = !voiceOn;
  $('voice').classList.toggle('muted', !voiceOn);
  $('voice').setAttribute('aria-label', T(voiceOn ? 'btn.voiceOff' : 'btn.voiceOn'));
  if (!voiceOn) stopSpeaking();
};

// ---------- Mascotte : glisser, clic, survol ----------
// Deplacement a la main (une zone -webkit-app-region:drag avalerait clics et survol)
let drag = null;
stage.addEventListener('pointerdown', (e) => {
  if (e.button !== 0) return;
  drag = { sx: e.screenX, sy: e.screenY, wx: window.screenX, wy: window.screenY, moved: false };
  stage.setPointerCapture(e.pointerId);
});
stage.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const dx = e.screenX - drag.sx, dy = e.screenY - drag.sy;
  if (!drag.moved && Math.hypot(dx, dy) < 4) return;
  drag.moved = true;
  appEl.classList.add('drag');
  window.nox.moveTo(drag.wx + dx, drag.wy + dy);
});
stage.addEventListener('pointerup', () => {
  if (!drag) return;
  const wasClick = !drag.moved;
  drag = null;
  appEl.classList.remove('drag');
  if (wasClick) { flash('jump', 450); toggleVoice(); } // clic : petit saut, puis elle ecoute
  else flash('squash', 260);                      // lache : elle s'ecrase un peu en atterrissant
});
stage.addEventListener('pointerenter', () => appEl.classList.add('hover'));
stage.addEventListener('pointerleave', () => appEl.classList.remove('hover'));

// ---------- Mascotte vivante : regard, bouche, clignements ----------
// Ressort amorti : jamais de mouvement lineaire
function spring(s, target, dt, k = 140, c = 16) {
  s.v += (k * (target - s.x) - c * s.v) * dt;
  s.x += s.v * dt;
}
const lookX = { x: 0, v: 0 }, lookY = { x: 0, v: 0 }, mouth = { x: 0, v: 0 };
let cursor = null, cursorMovedAt = 0, gaze = null, yawnUntil = 0;

// Position du curseur sur tout l'ecran (la fenetre est petite)
setInterval(async () => {
  const p = await window.nox.cursor();
  if (!cursor || p.x !== cursor.x || p.y !== cursor.y) cursorMovedAt = Date.now();
  cursor = p;
}, 80);

function lookTarget(t) {
  if (mood === 'idle') return [0, 0];
  if (act === 'thinking') return [Math.cos(t * 3) * 2.6, -1.4 + Math.sin(t * 3) * 1];
  if (gaze) return gaze;
  if (!cursor) return [0, 0];
  const r = mascotEl.getBoundingClientRect();
  const dx = cursor.x - (window.screenX + r.left + r.width / 2);
  const dy = cursor.y - (window.screenY + r.top + r.height * 0.45);
  const clamp = (v) => Math.max(-1, Math.min(1, v));
  return [clamp(dx / 260) * 3.6, clamp(dy / 260) * 2.4];
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  const [tx, ty] = lookTarget(now / 1000);
  spring(lookX, tx, dt); spring(lookY, ty, dt);
  const yawn = Date.now() < yawnUntil ? Math.sin(Math.PI * (1 - (yawnUntil - Date.now()) / 1400)) * 0.9 : 0;
  spring(mouth, Math.max(voiceLevel(), yawn), dt, 400, 28);
  const open = Math.max(0, mouth.x);
  lookEl.setAttribute('transform', `translate(${lookX.x.toFixed(2)} ${lookY.x.toFixed(2)})`);
  mouthEl.setAttribute('ry', (open * 4.6).toFixed(2));
  appEl.classList.toggle('talking', open > 0.08);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Clignement aleatoire toutes les 3 a 6 s (parfois double)
(function blink() {
  setTimeout(() => {
    if (mood !== 'idle') {
      flash('blink', 130);
      if (Math.random() < 0.2) setTimeout(() => flash('blink', 130), 260);
    }
    blink();
  }, 3000 + Math.random() * 3000);
})();

// Animations idle variees quand rien ne se passe
const idleMoves = {
  lookAround() {
    const side = Math.random() < 0.5 ? -1 : 1;
    gaze = [3.4 * side, -0.6];
    setTimeout(() => { gaze = [-3.4 * side, 0.4]; }, 1100);
    setTimeout(() => { gaze = null; }, 2200);
  },
  stretch() { flash('stretch', 900); },
  yawn() { yawnUntil = Date.now() + 1400; flash('yawn', 1400); },
  wiggle() { flash('wiggle', 900); }
};
let lastMove = '';
(function idleLoop() {
  setTimeout(() => {
    const calm = !act && !drag && mood !== 'idle' && !reducedMotion && Date.now() - cursorMovedAt > 2500;
    if (calm) {
      const names = Object.keys(idleMoves).filter((n) => n !== lastMove);
      lastMove = names[Math.floor(Math.random() * names.length)];
      idleMoves[lastMove]();
    }
    idleLoop();
  }, 6000 + Math.random() * 4000);
})();

// ---------- Cartes de question (onboarding, permissions) ----------
// Une question a la fois, grosses pastilles, toujours "Passer". Elle est aussi dite a voix haute,
// et on peut repondre en parlant (clic sur la mascotte) ou en ecrivant.
let card = null, pendingAnswer = null, methods = {}, currentMethod = null;
// Une seule carte a la fois : les suivantes (mail, recompense) attendent leur tour
let cardQueue = Promise.resolve();
function showCardQueued(opts) { const p = cardQueue.then(() => showCard(opts)); cardQueue = p.catch(() => {}); return p; }
function showCard({ text, options = [], input = false, secret = false, error = '', step = 0, total = 0, skip = T('card.skip') }) {
  return new Promise((resolve) => {
    card = true;
    clearTimeout(hideTimer);
    bubble.innerHTML = '';
    bubble.classList.add('show', 'card');
    if (total) {
      const dots = document.createElement('div'); dots.className = 'dots-progress';
      dots.setAttribute('aria-label', T('card.progress', { step, total }));
      for (let i = 1; i <= total; i++) { const d = document.createElement('i'); if (i < step) d.className = 'on'; if (i === step) d.className = 'cur'; dots.append(d); }
      const count = document.createElement('span'); count.textContent = `${step} / ${total}`; dots.append(count);
      bubble.append(dots);
    }
    const q = document.createElement('p'); q.className = 'q'; q.textContent = text; bubble.append(q);
    if (error) { const er = document.createElement('p'); er.className = 'err'; er.textContent = error; bubble.append(er); }
    const finish = (v) => { card = null; pendingAnswer = null; bubble.classList.remove('card'); resolve(v); };
    const pills = document.createElement('div'); pills.className = 'pills';
    for (const [value, label] of options) {
      const b = document.createElement('button'); b.className = 'pill'; b.textContent = label;
      b.onclick = () => finish(value);
      pills.append(b);
    }
    if (input) {
      const row = document.createElement('form'); row.className = 'answer';
      const f = document.createElement('input'); f.placeholder = secret ? 'sk-…' : T('card.write'); f.maxLength = secret ? 300 : 40;
      if (secret) { f.type = 'password'; f.autocomplete = 'off'; f.spellcheck = false; }
      const ok = document.createElement('button'); ok.className = 'pill on'; ok.textContent = T('card.ok');
      row.onsubmit = (e) => { e.preventDefault(); if (f.value.trim()) finish(f.value.trim()); };
      row.append(f, ok); bubble.append(row);
      setTimeout(() => f.focus(), 50);
    }
    if (options.length) bubble.append(pills);
    if (skip) { const s = document.createElement('button'); s.className = 'skip'; s.textContent = skip; s.onclick = () => finish(null); bubble.append(s); }
    // Reponse parlee ou ecrite dans la barre : on la rapproche d'une pastille
    pendingAnswer = (said) => {
      const low = said.toLowerCase();
      const hit = options.find(([v, l]) => low.includes(String(l).toLowerCase().split(' ')[0]) || low.includes(String(v)));
      if (hit) finish(hit[0]); else if (input) finish(said.replace(/^(je m'appelle|moi c'est|c'est)\s*/i, '').replace(/[.!]$/, ''));
    };
    talk(text);
  });
}

// Change la langue de toute l'interface (textes statiques + catalogue)
async function setLang(l) {
  lang = l;
  applyI18n(lang);
  ({ methods } = await window.nox.getCatalog());
}

async function runOnboarding(st) {
  setMood('happy');
  // 1) Langue : pre-reglee sur celle de Windows, l'utilisateur confirme ou change
  const chosen = await showCard({ text: T('card.lang'), options: [['fr', 'Français'], ['en', 'English']], skip: null });
  await window.nox.setSettings({ lang: chosen });
  await setLang(chosen);
  const { onboarding } = await window.nox.getCatalog();
  await showCard({ text: T('ob.hello', { name: st.name, n: onboarding.length }), options: [['go', T('ob.go')]], skip: null });
  // 2) Cle OpenAI de l'utilisateur (chiffree sur son PC), ou mode demo sans cle
  if (!st.hasKey && !st.testMode && !st.demoMode) {
    let error = '';
    for (;;) {
      const v = await showCard({ text: T('ob.key'), input: true, secret: true, error, options: [['demo', T('ob.demo')]], skip: null });
      if (v === 'demo' || v === null) { await window.nox.setDemo(true); break; }
      const r = await window.nox.setApiKey(v);
      if (r.ok) break;
      error = r.error;
    }
  }
  // 3) Les 5 questions
  const answers = {};
  for (let i = 0; i < onboarding.length; i++) {
    const q = onboarding[i];
    const text = q.key === 'blocker' && answers.name ? T('ob.blockerNamed', { name: answers.name }) : q.ask;
    flash('jump', 450);
    const v = await showCard({ text, options: q.options || [], input: q.input, step: i + 1, total: onboarding.length });
    if (v !== null) answers[q.key] = v;
  }
  await window.nox.saveProfile(answers);
  setMood('proud'); flash('jump', 500);
  setAct('thinking');
  window.nox.onboardingDone(); // Nox annonce la methode choisie et demande sur quoi on bosse
}

// Acces a la fenetre active : demande au lancement de la premiere tache (le moment ou il sert)
window.nox.onAskWatch(async () => {
  await new Promise((r) => setTimeout(r, 5000)); // laisse le temps de lire la premiere etape
  const v = await showCard({ text: T('watch.ask'), options: [['yes', T('watch.yes')], ['no', T('watch.no')]], skip: null });
  await window.nox.setSettings({ watchWindows: v === 'yes', watchAsked: true });
  const st = await window.nox.getState();
  say(T(v === 'yes' ? 'say.watchYes' : 'say.watchNo'), st.task?.steps?.[st.task.current]);
});

// ---------- Mode jeu : niveau gagne, competence debloquee ----------
window.nox.onReward(async (r) => {
  await new Promise((res) => setTimeout(res, 3500)); // laisse d'abord lire la reponse de Nox
  const { skills, levels } = await window.nox.getCatalog();
  const parts = [];
  if (r.levelUp) parts.push(T('reward.level', { level: r.levelUp.level, grade: levels[r.levelUp.level - 1]?.[1] || r.levelUp.grade }));
  for (const s of r.skills) parts.push(T('reward.skill', { emoji: s.emoji, name: skills[s.id]?.name || s.name }));
  setMood('proud'); flash('jump', 500);
  showCardQueued({ text: `🎉 ${parts.join(' · ')}`, options: [['ok', T('reward.ok')]], skip: null });
});

// ---------- Mail important ou attendu ----------
window.nox.onMail(async (m) => {
  const who = m.from.replace(/\s*<.*>/, '');
  setMood('happy');
  const v = await showCardQueued({ text: `📬 ${T('mail.ask', { kind: T(m.watched ? 'mail.watched' : 'mail.important'), from: T('mail.from'), who, subject: m.subject })}`,
    options: [['read', T('mail.read')], ['later', T('mail.later')]], skip: null });
  if (v !== 'read') return;
  const r = await window.nox.readMail(m.id);
  if (!r) return;
  say(r.summary, r.subject);
  talk(`${r.summary}. ${r.text.slice(0, 500)}`);
});

// ---------- Reglages ----------
$('settings').onclick = async () => {
  const st = await window.nox.getState();
  $('pLang').value = st.lang; $('pSize').value = st.size || 'm'; $('pMode').value = st.mode; $('pFirm').value = st.firmness; $('pWatch').checked = st.watchWindows;
  $('prefs').classList.add('show');
};
$('pSave').onclick = async () => {
  const changed = $('pLang').value !== lang;
  const st = await window.nox.setSettings({ lang: $('pLang').value, size: $('pSize').value, mode: $('pMode').value, firmness: $('pFirm').value, watchWindows: $('pWatch').checked, watchAsked: true });
  $('prefs').classList.remove('show');
  if (changed) { await setLang(st.lang); if (Realtime.open) Realtime.close(); } // la voix reprend dans la nouvelle langue au prochain clic
  setMood(st.mode === 'repos' || st.mode === 'off' ? 'idle' : 'focus');
};
$('pReset').onclick = async () => { await window.nox.resetTask(); stopTimer(); $('prefs').classList.remove('show'); say(T('say.taskDone')); setMood('proud'); };
$('pOnboard').onclick = async () => { $('prefs').classList.remove('show'); await window.nox.resetOnboarding(); runOnboarding(await window.nox.getState()); };
$('pQuit').onclick = () => window.nox.quit();
$('pHide').onclick = () => { $('prefs').classList.remove('show'); window.nox.hide(); };
$('dashboard').onclick = () => window.nox.openDashboard();
$('pDash').onclick = () => { $('prefs').classList.remove('show'); window.nox.openDashboard(); };

// ---------- Evenements proactifs ----------
window.nox.onProactive(handle);
window.nox.onMood(setMood);
window.nox.onError((m) => { setAct(''); say(T('say.oops') + m); });
window.nox.onState((st) => { currentMethod = st.method; if (st.lang && st.lang !== lang) setLang(st.lang); });
// Evenement proactif pendant une session vocale ouverte (absence, decrochage, hyperfocus)
window.nox.onEvent(({ reason, mood: m }) => {
  if (m) setMood(m);
  if (Realtime.open) Realtime.inject(reason);
  else ask(`[EVENEMENT SYSTEME, pas un message de l'utilisateur] ${reason}`);
});
window.nox.setRealtimeActive(false); // au rechargement, aucune session n'est ouverte

// ---------- Demarrage : elle atterrit, puis parle en premier ----------
(async () => {
  const st = await window.nox.getState();
  await setLang(st.lang || 'fr');
  currentMethod = st.method;
  document.title = st.name;
  const onboarded = Boolean(st.profile?.onboardedAt);
  const sleeping = onboarded && (st.mode === 'repos' || st.mode === 'off');
  setMood(sleeping ? 'idle' : 'happy');
  if (!reducedMotion) flash('enter', 1000);
  await new Promise((r) => setTimeout(r, reducedMotion ? 0 : 1000));

  if (!onboarded) runOnboarding(st);
  else if (sleeping) setMood('idle');
  else {
    setAct('thinking');
    window.nox.greet(); // la reponse arrive par onProactive
  }
})();
