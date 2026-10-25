// Cerveau de test (NOX_FAKE_AI=1) : repond comme le modele, sans appeler OpenAI.
// Sert aux tests automatiques et aux demos sans consommer de tokens.
function fakeThink(state, text) {
  const t = text.toLowerCase();
  const name = state.profile?.name ? ` ${state.profile.name}` : '';
  const step = state.task ? state.task.steps[state.task.current] : null;

  if (t.startsWith('[evenement systeme')) {
    if (t.includes('vient de se lancer')) return { reply: `Salut${name} ! ${step ? `On reprend : ${step} ?` : 'Sur quoi tu bosses ?'}`, mood: 'happy' };
    if (t.includes('minuteur')) return { reply: "Ding ! C'est fait ? Si oui, dis « c'est fait ».", mood: 'proud' };
    if (t.includes('revient')) return { reply: `Re${name} ! Tu en étais à : ${step || 'ta tâche'}.`, mood: 'happy' };
    if (t.includes('nouvelles')) return { reply: 'Je suis là. Ça avance ?', mood: 'focus' };
    if (t.includes('agenda')) { const ev = text.match(/"([^"]+)"/); return { reply: `📅 Bientôt : ${ev ? ev[1] : 'un rendez-vous'}. On s'y prépare ?`, mood: 'worried' }; }
    if (t.includes('derniere etape')) return { reply: 'Tâche terminée, bravo ! 🎉', mood: 'proud' };
    if (t.includes('coche une etape')) return { reply: `Bravo ! Maintenant : ${step}.`, mood: 'proud' };
    if (t.includes('onboarding')) return { reply: `Parfait${name}, je retiens tout ça. Sur quoi tu bosses maintenant ?`, mood: 'happy' };
    return { reply: 'Je suis là.', mood: 'focus' };
  }
  if (state.task && /(c'est fait|fini|termin|c'est bon|done)/.test(t)) {
    return { reply: 'Bravo ! Étape suivante.', mood: 'proud', action: { type: 'done_step' } };
  }
  const fact = text.match(/(je bosse mieux|je préfère|je prefere|j'aime)(.*)/i);
  if (fact) return { reply: 'Noté, je retiens.', mood: 'happy', action: { type: 'remember', value: fact[0] } };
  if (text.trim().length > 6) {
    const title = text.replace(/^(je dois|il faut que je|faut que je|je vais)\s*/i, '').trim();
    return {
      reply: 'Ok, on découpe. Première étape, et je lance le minuteur.', mood: 'focus',
      task: { title: title.charAt(0).toUpperCase() + title.slice(1), steps: ['Ouvre le document', 'Écris le plan en 3 points', 'Rédige la première partie'], current: 0 },
      action: { type: 'start_timer', value: '' }
    };
  }
  return { reply: 'Dis-m\'en un peu plus ?', mood: 'focus' };
}

module.exports = { fakeThink };
