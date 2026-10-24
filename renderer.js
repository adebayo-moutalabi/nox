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
  if (out.action?.type === 'start_timer') startTimer(Number(out.action.value) || 5);
  if (out.action?.type === 'pause') stopTimer();
}

async function ask(text) {
  if (!text.trim()) return;
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
      systemEvent(`Le minuteur de ${min} min est termine. Demande gentiment si l'etape est faite et propose la suite.`);
    }
  }, 1000);
}
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
  if (recorder && recorder.state === 'recording') { toggleMic(); return; }
  stopSpeaking();
  if (mood === 'idle') setMood('focus');
  setAct('thinking');
  say('Je me connecte…');
  try {
    await Realtime.connect();
    await refreshStep();
    lastVoiceAt = Date.now();
    $('mic').classList.add('rec');
    setAct('listening');
    say('Je t\'écoute, vas-y !', currentStep);
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
  error(m) { say('Oups : ' + m); },
  closed() { $('mic').classList.remove('rec'); rtAnalyser = null; setAct(''); say('Micro coupé. Clique sur moi pour reparler.'); }
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
      say('Je t\'écoute…');
      const buf = await new Blob(chunks, { type: 'audio/webm' }).arrayBuffer();
      const text = await window.nox.transcribe(buf);
      if (text) ask(text); else { setAct(''); say('Je n\'ai pas bien entendu, tu peux répéter ?'); }
    };
    recorder.start();
    $('mic').classList.add('rec');
    if (mood === 'idle') setMood('focus');
    setAct('listening');
  } catch { setAct(''); say('Je n\'ai pas accès au micro.'); }
}
$('mic').onclick = toggleVoice;
$('voice').onclick = () => {
  voiceOn = !voiceOn;
  $('voice').textContent = voiceOn ? '🔊' : '🔈';
  $('voice').setAttribute('aria-label', voiceOn ? 'Couper la voix' : 'Activer la voix');
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

// ---------- Reglages ----------
$('settings').onclick = async () => {
  const st = await window.nox.getState();
  $('pMode').value = st.mode; $('pFirm').value = st.firmness; $('pWatch').checked = st.watchWindows;
  $('prefs').classList.add('show');
};
$('pSave').onclick = async () => {
  const st = await window.nox.setSettings({ mode: $('pMode').value, firmness: $('pFirm').value, watchWindows: $('pWatch').checked });
  $('prefs').classList.remove('show');
  setMood(st.mode === 'repos' || st.mode === 'off' ? 'idle' : 'focus');
};
$('pReset').onclick = async () => { await window.nox.resetTask(); stopTimer(); $('prefs').classList.remove('show'); say('Tâche terminée. Bravo !'); setMood('proud'); };
$('pQuit').onclick = () => window.nox.quit();

// ---------- Evenements proactifs ----------
window.nox.onProactive(handle);
window.nox.onMood(setMood);
window.nox.onError((m) => { setAct(''); say('Oups : ' + m); });
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
  $('hello').textContent = `Salut, je suis ${st.name} 👋`;
  document.title = st.name;
  const sleeping = st.onboarded && (st.mode === 'repos' || st.mode === 'off');
  setMood(sleeping ? 'idle' : 'happy');
  if (!reducedMotion) flash('enter', 1000);
  await new Promise((r) => setTimeout(r, reducedMotion ? 0 : 1000));

  if (!st.onboarded) {
    $('onboard').classList.add('show');
    const intro = `Salut, je suis ${st.name} ! Je t'aide à démarrer, une petite étape à la fois. Dis-moi juste ton prénom.`;
    say(intro); talk(intro);
    $('obGo').onclick = async () => {
      const userName = $('obName').value.trim();
      await window.nox.setSettings({ onboarded: true, userName, watchWindows: $('obWatch').checked, firmness: $('obFirm').value });
      $('onboard').classList.remove('show');
      setMood('happy');
      const hi = `${userName ? userName + ', sur' : 'Sur'} quoi tu bosses aujourd'hui ? Dis-le moi, on commence petit.`;
      say(hi); talk(hi);
    };
  } else if (sleeping) {
    setMood('idle');
  } else {
    setAct('thinking');
    window.nox.greet(); // la reponse arrive par onProactive
  }
})();
