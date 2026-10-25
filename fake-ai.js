// Cerveau de test et mode demo (sans cle) : repond comme le modele, sans appeler OpenAI,
// dans la langue choisie (francais ou anglais).
const R = {
  fr: {
    hello: (n, step) => `Salut${n} ! ${step ? `On reprend : ${step} ?` : 'Sur quoi tu bosses ?'}`,
    timer: "Ding ! C'est fait ? Si oui, dis « c'est fait ».",
    back: (n, step) => `Re${n} ! Tu en étais à : ${step || 'ta tâche'}.`,
    checkIn: 'Je suis là. Ça avance ?',
    agenda: (ev) => `📅 Bientôt : ${ev || 'un rendez-vous'}. On s'y prépare ?`,
    taskDone: 'Tâche terminée, bravo ! 🎉',
    stepDone: (step) => `Bravo ! Maintenant : ${step}.`,
    onboarding: (n) => `Parfait${n}, je retiens tout ça. Sur quoi tu bosses maintenant ?`,
    method: (m, min) => `C'est parti pour ${m} ! Je t'accompagne étape par étape. On lance ${min} min ?`,
    here: 'Je suis là.',
    bravo: 'Bravo ! Étape suivante.',
    noted: 'Noté, je retiens.',
    noteSaved: "C'est noté 📝",
    shy: "Oh… merci 🙈 Tu vas me faire rougir. Bon, on s'y remet ?",
    love: "Ooh, ça me touche ! 💛 Je suis là pour toi.",
    tired: "Je te comprends… 🥱 Et si on faisait une vraie pause de 5 min ? Je garde ta place.",
    split: 'Ok, on découpe. Première étape, et je lance le minuteur.',
    steps: ['Ouvre le document', 'Écris le plan en 3 points', 'Rédige la première partie'],
    more: "Dis-m'en un peu plus ?",
    noWatch: "Je ne vois pas tes fenêtres : tu ne m'as pas donné la permission. Tu peux l'activer dans Réglages → « Voir l'appli / l'onglet actif ».",
    window: (w) => `Tu es sur « ${w} ». C'est bien là que tu voulais être ?`,
    can: "Je découpe tes tâches en petites étapes, je lance ou j'arrête un minuteur, j'ouvre la bonne appli, je prends tes notes et je te ramène quand tu décroches. Je ne lis pas encore le contenu de tes pages.",
    timerStopped: 'Minuteur arrêté. On reprend quand tu veux.',
    drift: 'Hé, YouTube peut attendre ta pause 😉 On revient sur ton étape ?',
    timerStarted: (m) => `C'est parti pour ${m} minutes ⏱`,
    chat: ["Je t'écoute 🙂 Tu bosses sur quoi en ce moment ?", "Ah, raconte ! Et côté travail, ça avance ?", "Je suis là. Si tu as une tâche qui traîne, dis-la moi, on la découpe ensemble."]
  },
  en: {
    hello: (n, step) => `Hi${n}! ${step ? `Shall we pick up: ${step}?` : 'What are you working on?'}`,
    timer: 'Ding! Done? If so, just say "done".',
    back: (n, step) => `Welcome back${n}! You were at: ${step || 'your task'}.`,
    checkIn: "I'm here. How's it going?",
    agenda: (ev) => `📅 Coming up: ${ev || 'a meeting'}. Want to get ready?`,
    taskDone: 'Task complete, well done! 🎉',
    stepDone: (step) => `Nice! Next up: ${step}.`,
    onboarding: (n) => `Perfect${n}, got it all. What are you working on right now?`,
    method: (m, min) => `${m} it is! I'll walk you through it step by step. Start ${min} min?`,
    here: "I'm here.",
    bravo: 'Nice! Next step.',
    noted: "Noted, I'll remember that.",
    noteSaved: 'Got it, noted 📝',
    shy: "Oh… thank you 🙈 You're making me blush. Shall we get back to it?",
    love: "Aww, that means a lot! 💛 I'm here for you.",
    tired: "I get it… 🥱 How about a real 5-minute break? I'll save your spot.",
    split: "Ok, let's break it down. Here's step one, and I'm starting the timer.",
    steps: ['Open the document', 'Write a 3-point outline', 'Draft the first part'],
    more: 'Tell me a bit more?',
    noWatch: "I can't see your windows: you haven't given me permission. You can turn it on in Settings → \"See the active app / tab\".",
    window: (w) => `You're on "${w}". Is that where you meant to be?`,
    can: "I break your tasks into tiny steps, start or stop a timer, open the right app, take your notes and bring you back when you drift. I can't read the content of your pages yet.",
    timerStopped: 'Timer stopped. We can pick up whenever you like.',
    drift: "Hey, YouTube can wait for your break 😉 Shall we get back to your step?",
    timerStarted: (m) => `${m} minutes, here we go ⏱`,
    chat: ["I'm listening 🙂 What are you working on right now?", 'Oh, tell me more! And how is work going?', "I'm here. Got a task that keeps slipping? Tell me and we'll break it down together."]
  }
};

function fakeThink(state, text, ctx = {}) {
  const r = R[state.lang] || R.fr;
  const t = text.toLowerCase();
  const name = state.profile?.name ? ` ${state.profile.name}` : '';
  const step = state.task ? state.task.steps[state.task.current] : null;

  if (t.startsWith('[evenement systeme')) {
    if (t.includes('vient de se lancer')) return { reply: r.hello(name, step), mood: 'happy' };
    // (avant "minuteur" : l'annonce d'une methode propose aussi un minuteur)
    if (t.includes('choisir la methode')) { const m = text.match(/"([^"]+)"/); const min = (text.match(/(\d+) min/) || [])[1]; return { reply: r.method(m ? m[1] : '', min), mood: 'happy' }; }
    if (t.includes('minuteur')) return { reply: r.timer, mood: 'proud' };
    if (t.includes('revient')) return { reply: r.back(name, step), mood: 'happy' };
    if (t.includes('nouvelles')) return { reply: r.checkIn, mood: 'focus' };
    if (t.includes('ramene-le')) return { reply: r.drift, mood: 'worried' };
    if (t.includes('agenda')) { const ev = text.match(/"([^"]+)"/); return { reply: r.agenda(ev && ev[1]), mood: 'worried' }; }
    if (t.includes('derniere etape')) return { reply: r.taskDone, mood: 'proud' };
    if (t.includes('coche une etape')) return { reply: r.stepDone(step), mood: 'proud' };
    if (t.includes('onboarding')) return { reply: r.onboarding(name), mood: 'happy' };
    return { reply: r.here, mood: 'focus' };
  }
  if (state.task && /(c'est fait|fini|termin|c'est bon|done|finished)/.test(t)) {
    return { reply: r.bravo, mood: 'proud', action: { type: 'done_step' } };
  }
  // Emotions : compliment -> gene, affection -> touche, fatigue -> compatit
  if (/(t'es (trop )?(mignon|beau|chou|adorable|cool)|tu es (trop )?(mignon|beau|adorable)|you'?re (so )?(cute|adorable|awesome)|so cute)/i.test(t)) return { reply: r.shy, mood: 'shy' };
  if (/(je t'adore|je t'aime|t'es le meilleur|tu es le meilleur|merci beaucoup|love you|you'?re the best|thank you so much)/i.test(t)) return { reply: r.love, mood: 'love' };
  if (/(je suis (trop |tellement )?(fatigu|crev|épuis|epuis)|i'?m (so |really )?(tired|exhausted|drained))/i.test(t)) return { reply: r.tired, mood: 'tired' };
  // Note dictee : "note que…", "rappelle-moi de…", "note that…", "remind me to…"
  const note = text.match(/^\s*(?:nox,?\s*)?(?:note que|note :|prends note que|rappelle-moi de|note that|take a note:?|remind me to)\s*(.+)/i);
  if (note) return { reply: r.noteSaved, mood: 'happy', action: { type: 'note', value: note[1].trim() } };
  const fact = text.match(/(je bosse mieux|je préfère|je prefere|j'aime|i work better|i prefer|i like)(.*)/i);
  if (fact) return { reply: r.noted, mood: 'happy', action: { type: 'remember', value: fact[0] } };
  // Questions : appli active, ce que Nox sait faire
  if (/(quel onglet|quelle appli|quelle fen[eê]tre|sur quoi je suis|tu vois (quoi|mon [ée]cran)|which tab|what app|which app|what window|what am i (on|looking at))/i.test(t)) {
    return { reply: ctx.windowTitle === null ? r.noWatch : r.window(ctx.windowTitle || '?'), mood: 'focus' };
  }
  if (/(qu'est-ce que tu (sais|peux) faire|tu sais faire quoi|tu peux faire quoi|what can you do|what do you do)/i.test(t)) return { reply: r.can, mood: 'happy' };
  // Minuteur a la voix
  if (/(arr[eê]te|stoppe|coupe|stop|cancel)\b.*(minuteur|timer|chrono)/i.test(t)) return { reply: r.timerStopped, mood: 'focus', action: { type: 'stop_timer' } };
  const tm = t.match(/(lance|d[ée]marre|mets|start|set)\b.*?(\d+)\s*(min|minutes)/i);
  if (tm) return { reply: r.timerStarted(tm[2]), mood: 'focus', action: { type: 'start_timer', value: tm[2] } };
  // Une tache seulement quand la phrase en decrit une
  if (/^(je dois|il faut|faut que|je vais|j'ai (un|une|des|mon|ma|mes)|aide-moi|i need to|i have to|i must|i'm going to|help me|i've got to)\b/i.test(text.trim())) {
    const title = text.replace(/^(je dois|il faut que je|faut que je|je vais|i need to|i have to|i must|i'm going to|help me)\s*/i, '').trim();
    return {
      reply: r.split, mood: 'focus',
      task: { title: title.charAt(0).toUpperCase() + title.slice(1), steps: r.steps, current: 0 },
      action: { type: 'start_timer', value: '' }
    };
  }
  return { reply: r.chat[Math.floor(Math.random() * r.chat.length)], mood: 'happy' };
}

module.exports = { fakeThink };
