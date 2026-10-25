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
    split: 'Ok, on découpe. Première étape, et je lance le minuteur.',
    steps: ['Ouvre le document', 'Écris le plan en 3 points', 'Rédige la première partie'],
    more: "Dis-m'en un peu plus ?"
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
    split: "Ok, let's break it down. Here's step one, and I'm starting the timer.",
    steps: ['Open the document', 'Write a 3-point outline', 'Draft the first part'],
    more: 'Tell me a bit more?'
  }
};

function fakeThink(state, text) {
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
    if (t.includes('agenda')) { const ev = text.match(/"([^"]+)"/); return { reply: r.agenda(ev && ev[1]), mood: 'worried' }; }
    if (t.includes('derniere etape')) return { reply: r.taskDone, mood: 'proud' };
    if (t.includes('coche une etape')) return { reply: r.stepDone(step), mood: 'proud' };
    if (t.includes('onboarding')) return { reply: r.onboarding(name), mood: 'happy' };
    return { reply: r.here, mood: 'focus' };
  }
  if (state.task && /(c'est fait|fini|termin|c'est bon|done|finished)/.test(t)) {
    return { reply: r.bravo, mood: 'proud', action: { type: 'done_step' } };
  }
  // Note dictee : "note que…", "rappelle-moi de…", "note that…", "remind me to…"
  const note = text.match(/^\s*(?:nox,?\s*)?(?:note que|note :|prends note que|rappelle-moi de|note that|take a note:?|remind me to)\s*(.+)/i);
  if (note) return { reply: r.noteSaved, mood: 'happy', action: { type: 'note', value: note[1].trim() } };
  const fact = text.match(/(je bosse mieux|je préfère|je prefere|j'aime|i work better|i prefer|i like)(.*)/i);
  if (fact) return { reply: r.noted, mood: 'happy', action: { type: 'remember', value: fact[0] } };
  if (text.trim().length > 6) {
    const title = text.replace(/^(je dois|il faut que je|faut que je|je vais|i need to|i have to|i must|i'm going to)\s*/i, '').trim();
    return {
      reply: r.split, mood: 'focus',
      task: { title: title.charAt(0).toUpperCase() + title.slice(1), steps: r.steps, current: 0 },
      action: { type: 'start_timer', value: '' }
    };
  }
  return { reply: r.more, mood: 'focus' };
}

module.exports = { fakeThink };
