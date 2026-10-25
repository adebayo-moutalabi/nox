// Traductions de Nox (francais / anglais), partagees par la mascotte, le tableau de bord
// et le processus principal. t(lang, cle, {variables}) ; les textes HTML statiques portent
// data-i18n (texte), data-i18n-title, data-i18n-aria et data-i18n-ph (placeholder).
const LANGS = { fr: 'Français', en: 'English' };

const STRINGS = {
  fr: {
    // Mascotte
    'stage.title': 'Clique pour me parler, glisse-moi où tu veux',
    'stage.aria': 'Parler à la mascotte',
    'input.ph': 'Dis-moi ce que tu dois faire…',
    'btn.write': 'Écrire un message', 'btn.mic': 'Parler', 'btn.voiceOff': 'Couper la voix', 'btn.voiceOn': 'Activer la voix',
    'btn.dashboard': 'Ouvrir le tableau de bord', 'btn.settings': 'Réglages',
    'prefs.title': 'Réglages', 'prefs.lang': 'Langue', 'prefs.mode': 'Mode', 'prefs.firm': 'Ton',
    'mode.travail': 'Travail', 'mode.etudes': 'Études', 'mode.repos': 'Repos (je dors)', 'mode.off': 'Off',
    'firm.douce': 'Tout doux', 'firm.normale': 'Normal', 'firm.stricte': 'Coach',
    'prefs.watch': "Voir l'appli / l'onglet actif", 'prefs.dash': 'Ouvrir le tableau de bord', 'prefs.onboard': "Refaire l'onboarding",
    'prefs.reset': 'Terminer la tâche en cours', 'prefs.quit': 'Quitter Nox', 'prefs.ok': 'OK',
    'prefs.size': 'Taille', 'size.s': 'Petit', 'size.m': 'Moyen', 'size.l': 'Grand', 'prefs.hide': 'Cacher Nox · Ctrl+Alt+N',
    'tray.show': 'Afficher Nox', 'tray.hide': 'Cacher Nox', 'tray.dashboard': 'Tableau de bord', 'tray.quit': 'Quitter',
    'say.connecting': 'Je me connecte…', 'say.listening': "Je t'écoute, vas-y !", 'say.listeningShort': "Je t'écoute…",
    'say.oops': 'Oups : ', 'say.micOff': 'Micro coupé. Clique sur moi pour reparler.', 'say.notHeard': "Je n'ai pas bien entendu, tu peux répéter ?",
    'say.noMic': "Je n'ai pas accès au micro.", 'say.taskDone': 'Tâche terminée. Bravo !',
    'say.watchYes': 'Merci ! Je veille, sans juger.', 'say.watchNo': 'Pas de souci, je ne regarde rien.',
    'card.skip': 'Passer', 'card.write': 'Écris ici…', 'card.ok': 'OK', 'card.progress': 'Question {step} sur {total}',
    'card.lang': 'Dans quelle langue on se parle ?',
    'ob.hello': "Salut, je suis {name} ! {n} petites questions et on s'y met. Tu peux répondre en cliquant, en écrivant, ou en me parlant.",
    'ob.go': "C'est parti",
    'ob.key': 'Pour te parler avec ma vraie voix, colle ta clé OpenAI. Elle reste chiffrée sur ton PC.', 'ob.demo': 'Essayer sans clé',
    'ob.blockerNamed': "{name}, qu'est-ce qui te freine le plus ?",
    'watch.ask': 'Je peux voir quelle appli est ouverte, pour te ramener doucement si tu décroches ? Seul le titre de la fenêtre est utilisé.',
    'watch.yes': 'Oui', 'watch.no': 'Non merci',
    'reward.level': 'Niveau {level} : {grade} !', 'reward.skill': 'Compétence débloquée : {emoji} {name}', 'reward.ok': 'Trop bien',
    'mail.watched': 'Le mail que tu attendais est arrivé', 'mail.important': 'Mail important', 'mail.from': 'de',
    'mail.ask': '{kind} {from} {who} : « {subject} ». Je te le lis ?', 'mail.read': 'Lis-le', 'mail.later': 'Plus tard',
    // Tableau de bord
    'dash.title': 'Tableau de bord', 'dash.hello.night': 'Bonne nuit', 'dash.hello.day': 'Bonjour', 'dash.hello.evening': 'Bonsoir',
    'dash.noMethod': 'Aucune méthode choisie', 'dash.now': 'Maintenant', 'dash.today': "Aujourd'hui",
    'dash.stepsDone': 'étapes faites', 'dash.focusMin': 'min de focus', 'dash.tasksDone': 'tâches finies',
    'dash.chart': 'Minutes de concentration, 7 derniers jours', 'dash.today.short': 'auj.',
    'dash.progress': 'Progression', 'dash.agenda': 'Agenda des prochaines 24 h', 'dash.steps': 'Étapes', 'dash.memory': 'Ce que Nox sait de toi',
    'dash.methods': 'Méthodes de travail', 'dash.connections': 'Connexions', 'dash.history': 'Historique',
    'dash.foot': "Tout reste sur ton PC. Supprime un souvenir d'un clic sur ×.",
    'dash.done': "✓  C'est fait", 'dash.timer': '⏱  Lancer {min} min', 'dash.stepOf': 'Étape {i} sur {n}',
    'dash.empty.title': 'Sur quoi tu bosses ?', 'dash.empty.hint': "Écris ta tâche telle qu'elle te vient. Nox la découpe en petites étapes et te donne la première.",
    'dash.empty.ph': 'Ex. rédiger mon rapport de stage', 'dash.empty.btn': 'Découper avec Nox', 'dash.thinking': 'Nox réfléchit…',
    'dash.noTask': 'Pas de tâche en cours.', 'dash.noProfile': "Fais l'onboarding pour que Nox te connaisse.",
    'dash.noFacts': "Nox retiendra ici ce qu'il apprend en parlant avec toi.", 'dash.forget': 'Oublier', 'dash.active': '● Active',
    'dash.noHistory': 'Tes tâches apparaîtront ici.', 'dash.histDone': 'terminée · {when}', 'dash.histSteps': '{done}/{n} étapes · {when}',
    'dash.xpNext': '{xp} XP · encore {left} XP pour « {grade} »', 'dash.xpMax': '{xp} XP · grade maximal', 'dash.xpAria': '{pct} % vers le niveau suivant',
    'dash.agenda.none': 'Relie ton Google Agenda dans Connexions : Nox te prévient avant chaque rendez-vous.',
    'dash.agenda.empty': 'Rien de prévu dans les prochaines 24 h.', 'dash.allDay': 'jour', 'dash.untitled': '(sans titre)',
    'prof.name': 'Prénom', 'prof.blocker': 'Frein', 'prof.energy': 'Énergie', 'prof.focus': 'Focus confortable', 'prof.tone': 'Ton', 'prof.lang': 'Langue',
    'conn.openai': '🎙 Voix OpenAI', 'conn.openai.help': 'Ta clé reste chiffrée sur ton PC. Sans clé, Nox tourne en mode démo.',
    'conn.calendar': '📅 Google Agenda', 'conn.calendar.help': "Google Agenda → Paramètres → ton agenda → « Adresse secrète au format iCal ». Rappels 60 et 30 min avant.",
    'conn.gmail': '📬 Gmail', 'conn.gmail.help': "Crée un « mot de passe d'application » sur myaccount.google.com/apppasswords. Nox signale les mails importants et ceux que tu attends.",
    'conn.telegram': '📱 Telegram', 'conn.telegram.help': 'Crée ton bot avec @BotFather, colle son jeton, puis scanne le QR code avec ton téléphone.',
    'conn.save': 'Enregistrer', 'conn.link': 'Relier', 'conn.ph.gmailPass': "mot de passe d'application", 'conn.ph.bot': 'jeton du bot',
    'conn.keySaved': 'Clé enregistrée', 'conn.demo': 'Mode démo', 'conn.noKey': 'Non reliée', 'conn.none': 'Non relié',
    'conn.calOk': 'Relié · {n} à venir', 'conn.gmailOk': 'Relié · {user}', 'conn.tgOk': 'Relié à @{bot}', 'conn.scan': 'Scanne le QR code',
    'conn.waiting': "⏳ J'attends : {q}", 'conn.unwatch': 'Ne plus attendre : {q}', 'conn.qrAlt': 'QR code pour relier Telegram',
    // Processus principal
    'err.key.format': 'Ça ne ressemble pas à une clé OpenAI (elle commence par sk-).', 'err.key.refused': 'Clé refusée par OpenAI.',
    'err.key.status': 'OpenAI répond {status}.', 'err.key.network': 'Pas de connexion à OpenAI.',
    'err.noKey': 'Aucune clé OpenAI : ajoute-la dans le tableau de bord (Connexions).',
    'err.cal.url': "Colle l'adresse qui commence par https:// (format iCal).", 'err.gmail': 'Connexion refusée : {msg}',
    'tg.welcome': "Salut{name} ! C'est {nox} 👋\nOn est reliés. Quand tu n'es pas devant ton PC, je te préviens ici (agenda, mails importants, reprise de tâche). Tu peux aussi m'écrire : « où j'en étais ? », « je dois faire X ».",
    'tg.mail': '📬 {kind} : {from}\n« {subject} »\n{summary}'
  },
  en: {
    'stage.title': 'Click to talk to me, drag me anywhere',
    'stage.aria': 'Talk to the mascot',
    'input.ph': 'Tell me what you need to do…',
    'btn.write': 'Write a message', 'btn.mic': 'Talk', 'btn.voiceOff': 'Mute voice', 'btn.voiceOn': 'Turn voice on',
    'btn.dashboard': 'Open the dashboard', 'btn.settings': 'Settings',
    'prefs.title': 'Settings', 'prefs.lang': 'Language', 'prefs.mode': 'Mode', 'prefs.firm': 'Tone',
    'mode.travail': 'Work', 'mode.etudes': 'Study', 'mode.repos': 'Rest (I sleep)', 'mode.off': 'Off',
    'firm.douce': 'Gentle', 'firm.normale': 'Normal', 'firm.stricte': 'Coach',
    'prefs.watch': 'See the active app / tab', 'prefs.dash': 'Open the dashboard', 'prefs.onboard': 'Redo onboarding',
    'prefs.reset': 'Finish the current task', 'prefs.quit': 'Quit Nox', 'prefs.ok': 'OK',
    'prefs.size': 'Size', 'size.s': 'Small', 'size.m': 'Medium', 'size.l': 'Large', 'prefs.hide': 'Hide Nox · Ctrl+Alt+N',
    'tray.show': 'Show Nox', 'tray.hide': 'Hide Nox', 'tray.dashboard': 'Dashboard', 'tray.quit': 'Quit',
    'say.connecting': 'Connecting…', 'say.listening': "I'm listening, go ahead!", 'say.listeningShort': "I'm listening…",
    'say.oops': 'Oops: ', 'say.micOff': 'Mic off. Click me to talk again.', 'say.notHeard': "I didn't quite catch that, can you say it again?",
    'say.noMic': "I can't access the microphone.", 'say.taskDone': 'Task done. Well done!',
    'say.watchYes': "Thanks! I'll keep an eye out, no judgment.", 'say.watchNo': "No problem, I won't look at anything.",
    'card.skip': 'Skip', 'card.write': 'Type here…', 'card.ok': 'OK', 'card.progress': 'Question {step} of {total}',
    'card.lang': 'Which language shall we speak?',
    'ob.hello': "Hi, I'm {name}! {n} quick questions and we're off. You can answer by clicking, typing, or talking to me.",
    'ob.go': "Let's go",
    'ob.key': 'To talk to you with my real voice, paste your OpenAI key. It stays encrypted on your PC.', 'ob.demo': 'Try without a key',
    'ob.blockerNamed': '{name}, what holds you back the most?',
    'watch.ask': 'Can I see which app is open, so I can gently bring you back if you drift? Only the window title is used.',
    'watch.yes': 'Yes', 'watch.no': 'No thanks',
    'reward.level': 'Level {level}: {grade}!', 'reward.skill': 'Skill unlocked: {emoji} {name}', 'reward.ok': 'Awesome',
    'mail.watched': 'The email you were waiting for is here', 'mail.important': 'Important email', 'mail.from': 'from',
    'mail.ask': '{kind} {from} {who}: "{subject}". Want me to read it?', 'mail.read': 'Read it', 'mail.later': 'Later',
    'dash.title': 'Dashboard', 'dash.hello.night': 'Good night', 'dash.hello.day': 'Hello', 'dash.hello.evening': 'Good evening',
    'dash.noMethod': 'No method chosen', 'dash.now': 'Right now', 'dash.today': 'Today',
    'dash.stepsDone': 'steps done', 'dash.focusMin': 'focus min', 'dash.tasksDone': 'tasks done',
    'dash.chart': 'Focus minutes, last 7 days', 'dash.today.short': 'today',
    'dash.progress': 'Progress', 'dash.agenda': 'Calendar, next 24 h', 'dash.steps': 'Steps', 'dash.memory': 'What Nox knows about you',
    'dash.methods': 'Work methods', 'dash.connections': 'Connections', 'dash.history': 'History',
    'dash.foot': 'Everything stays on your PC. Delete a memory with one click on ×.',
    'dash.done': '✓  Done', 'dash.timer': '⏱  Start {min} min', 'dash.stepOf': 'Step {i} of {n}',
    'dash.empty.title': 'What are you working on?', 'dash.empty.hint': 'Type your task the way it comes to you. Nox breaks it into small steps and gives you the first one.',
    'dash.empty.ph': 'e.g. write my internship report', 'dash.empty.btn': 'Break it down with Nox', 'dash.thinking': 'Nox is thinking…',
    'dash.noTask': 'No task in progress.', 'dash.noProfile': 'Do the onboarding so Nox gets to know you.',
    'dash.noFacts': 'Nox will remember here what it learns while talking with you.', 'dash.forget': 'Forget', 'dash.active': '● Active',
    'dash.noHistory': 'Your tasks will show up here.', 'dash.histDone': 'done · {when}', 'dash.histSteps': '{done}/{n} steps · {when}',
    'dash.xpNext': '{xp} XP · {left} XP to "{grade}"', 'dash.xpMax': '{xp} XP · top rank', 'dash.xpAria': '{pct}% to the next level',
    'dash.agenda.none': 'Connect your Google Calendar in Connections: Nox gives you a heads-up before each meeting.',
    'dash.agenda.empty': 'Nothing planned in the next 24 hours.', 'dash.allDay': 'all day', 'dash.untitled': '(untitled)',
    'prof.name': 'Name', 'prof.blocker': 'Blocker', 'prof.energy': 'Energy', 'prof.focus': 'Comfortable focus', 'prof.tone': 'Tone', 'prof.lang': 'Language',
    'conn.openai': '🎙 OpenAI voice', 'conn.openai.help': 'Your key stays encrypted on your PC. Without a key, Nox runs in demo mode.',
    'conn.calendar': '📅 Google Calendar', 'conn.calendar.help': 'Google Calendar → Settings → your calendar → "Secret address in iCal format". Reminders 60 and 30 min before.',
    'conn.gmail': '📬 Gmail', 'conn.gmail.help': 'Create an "app password" at myaccount.google.com/apppasswords. Nox flags important emails and the ones you are waiting for.',
    'conn.telegram': '📱 Telegram', 'conn.telegram.help': 'Create your bot with @BotFather, paste its token, then scan the QR code with your phone.',
    'conn.save': 'Save', 'conn.link': 'Connect', 'conn.ph.gmailPass': 'app password', 'conn.ph.bot': 'bot token',
    'conn.keySaved': 'Key saved', 'conn.demo': 'Demo mode', 'conn.noKey': 'Not connected', 'conn.none': 'Not connected',
    'conn.calOk': 'Connected · {n} upcoming', 'conn.gmailOk': 'Connected · {user}', 'conn.tgOk': 'Connected to @{bot}', 'conn.scan': 'Scan the QR code',
    'conn.waiting': '⏳ Waiting for: {q}', 'conn.unwatch': 'Stop waiting for: {q}', 'conn.qrAlt': 'QR code to connect Telegram',
    'err.key.format': "That doesn't look like an OpenAI key (it starts with sk-).", 'err.key.refused': 'Key rejected by OpenAI.',
    'err.key.status': 'OpenAI replied {status}.', 'err.key.network': 'No connection to OpenAI.',
    'err.noKey': 'No OpenAI key: add it in the dashboard (Connections).',
    'err.cal.url': 'Paste the address that starts with https:// (iCal format).', 'err.gmail': 'Connection refused: {msg}',
    'tg.welcome': "Hi{name}! It's {nox} 👋\nWe're connected. When you're away from your PC, I'll ping you here (calendar, important emails, getting back to your task). You can also write to me: \"where was I?\", \"I need to do X\".",
    'tg.mail': '📬 {kind}: {from}\n"{subject}"\n{summary}'
  }
};

// Catalogue traduit : questions d'onboarding, methodes, competences, grades
const CATALOG = {
  fr: {
    onboarding: {
      name: { ask: "Comment je t'appelle ?" },
      blocker: { ask: "Qu'est-ce qui te freine le plus ?", options: { start: 'Démarrer', focus: 'Rester concentré·e', resume: 'Reprendre après une pause', breaks: 'Je ne fais pas de pauses', productive: 'Juste être plus efficace' } },
      energy: { ask: "Quand as-tu le plus d'énergie ?", options: { morning: 'Le matin', afternoon: "L'après-midi", evening: 'Le soir', varies: 'Ça varie' } },
      focusMin: { ask: 'Combien de temps tu tiens concentré·e sans souffrir ?', options: { 10: '10 min', 15: '15 min', 25: '25 min', 45: '45 min' } },
      tone: { ask: 'Je te parle comment ?', options: { douce: 'Tout doux', normale: 'Normal', stricte: 'Coach' } }
    },
    methods: {
      five_minutes: ['Règle des 5 minutes', "Juste 5 minutes. Ensuite tu as le droit d'arrêter."],
      pomodoro: ['Pomodoro', '25 min de focus, 5 min de pause. On répète.'],
      body_doubling: ['Body doubling', 'Je reste avec toi et je prends des nouvelles.'],
      if_then: ['Si… alors…', 'Un plan précis : « Si X arrive, alors je fais Y ».'],
      timeboxing: ['Time-boxing', "Une durée fixée d'avance, puis on s'arrête vraiment."],
      frog: ['Manger la grenouille', 'La tâche la plus redoutée en premier.'],
      two_minutes: ['Règle des 2 minutes', 'Si ça prend moins de 2 minutes, on le fait maintenant.']
    },
    skills: {
      first_step: ['Premier pas', 'Ta toute première étape.'], starter: ['Démarreur', '5 tâches lancées.'], finisher: ['Finisseur', '3 tâches terminées.'],
      comeback: ['Retour gagnant', '3 reprises après une pause.'], deep_focus: ['Plongée', '60 min de focus dans la journée.'], early_bird: ['Lève-tôt', 'Une étape faite avant 9 h.'],
      steady: ['Constance', 'Des étapes faites sur 3 jours différents.'], hundred: ['Centurion', '100 étapes faites.']
    },
    levels: ['Étincelle', 'Démarreur', 'Explorateur', 'Bâtisseur', 'Pilote', 'Stratège', 'Maître du focus', 'Légende']
  },
  en: {
    onboarding: {
      name: { ask: 'What should I call you?' },
      blocker: { ask: 'What holds you back the most?', options: { start: 'Getting started', focus: 'Staying focused', resume: 'Getting back after a break', breaks: "I don't take breaks", productive: 'Just being more productive' } },
      energy: { ask: 'When do you have the most energy?', options: { morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening', varies: 'It varies' } },
      focusMin: { ask: 'How long can you focus without it hurting?', options: { 10: '10 min', 15: '15 min', 25: '25 min', 45: '45 min' } },
      tone: { ask: 'How should I talk to you?', options: { douce: 'Gentle', normale: 'Normal', stricte: 'Coach' } }
    },
    methods: {
      five_minutes: ['5-minute rule', 'Just 5 minutes. After that, you are allowed to stop.'],
      pomodoro: ['Pomodoro', '25 min of focus, 5 min break. Repeat.'],
      body_doubling: ['Body doubling', 'I stay with you and check in on you.'],
      if_then: ['If… then…', 'A precise plan: "If X happens, then I do Y".'],
      timeboxing: ['Time-boxing', 'A time limit set in advance, then you really stop.'],
      frog: ['Eat the frog', 'The task you dread the most, first.'],
      two_minutes: ['2-minute rule', 'If it takes less than 2 minutes, do it now.']
    },
    skills: {
      first_step: ['First step', 'Your very first step.'], starter: ['Starter', '5 tasks started.'], finisher: ['Finisher', '3 tasks completed.'],
      comeback: ['Comeback', '3 restarts after a break.'], deep_focus: ['Deep dive', '60 focus minutes in a day.'], early_bird: ['Early bird', 'A step done before 9 am.'],
      steady: ['Steady', 'Steps done on 3 different days.'], hundred: ['Centurion', '100 steps done.']
    },
    levels: ['Spark', 'Starter', 'Explorer', 'Builder', 'Pilot', 'Strategist', 'Focus master', 'Legend']
  }
};

// Langue par defaut a partir de la langue du systeme ("fr-FR" -> fr, sinon en)
function pickLang(locale) { return String(locale || '').toLowerCase().startsWith('fr') ? 'fr' : 'en'; }

function t(lang, key, vars = {}) {
  const s = (STRINGS[lang] && STRINGS[lang][key]) ?? STRINGS.fr[key] ?? key;
  return s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : `{${k}}`));
}

// Applique les traductions aux elements HTML marques
function applyI18n(lang, root = document) {
  for (const el of root.querySelectorAll('[data-i18n]')) el.textContent = t(lang, el.dataset.i18n);
  for (const el of root.querySelectorAll('[data-i18n-title]')) el.title = t(lang, el.dataset.i18nTitle);
  for (const el of root.querySelectorAll('[data-i18n-aria]')) el.setAttribute('aria-label', t(lang, el.dataset.i18nAria));
  for (const el of root.querySelectorAll('[data-i18n-ph]')) el.placeholder = t(lang, el.dataset.i18nPh);
  document.documentElement.lang = lang;
}

if (typeof module !== 'undefined') module.exports = { LANGS, STRINGS, CATALOG, pickLang, t };
