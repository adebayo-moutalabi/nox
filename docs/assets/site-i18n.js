// Traduction francaise du site. L'anglais est le texte d'origine de la page (meilleur pour le
// referencement) ; setSiteLang('fr') remplace chaque element [data-t], le titre, la description
// et les captures, setSiteLang('en') remet le texte d'origine.
const SITE_FR = {
  'nav.how': 'Comment ça marche', 'nav.vision': 'Vision', 'nav.features': 'Fonctionnalités', 'nav.methods': 'Méthodes', 'nav.install': 'Installer',
  'cta.short': 'Télécharger', 'cta.download': 'Télécharger pour Windows', 'cta.how': 'Voir comment ça marche',
  'hero.kicker': 'Gratuit · Windows · Français et anglais',
  'hero.title': 'Ton cerveau TDAH n\'est pas <span class="hl">paresseux</span>.',
  'hero.lead': 'Il lui manque juste un démarreur. Nox est un petit compagnon de bureau qui te parle en premier, découpe ta tâche en micro-étapes, et te ramène doucement quand tu décroches.',
  'hero.small': 'Pensé d\'abord pour le TDAH. Utile à tous ceux qui commencent mille choses sans les finir.',
  'badge.free': '✅ Gratuit', 'badge.minute': '⚡ Prêt en 1 minute', 'badge.local': '🔐 Tes données restent sur ton PC',
  'bubble.text': 'On découpe ça. Première étape :', 'bubble.step': '→ Ouvre le document',
  'scene.kicker': 'Ça te parle ?', 'scene.t1': '14 h 00', 'scene.t2': '14 h 03', 'scene.t3': '14 h 41',
  'scene.1': 'Tu ouvres ton document pour « juste commencer ».', 'scene.2': 'Une notification.', 'scene.3': 'Tu es sur YouTube. Le document est toujours vide.',
  'scene.punch': 'Tu sais exactement quoi faire. Tu n\'arrives juste pas à t\'y mettre. Et toutes les applis attendent que tu fasses le premier pas.',
  'scene.answer': 'Nox fait le premier pas pour toi.',
  'video.kicker': 'En 2 minutes', 'video.title': 'Nox en action',
  'video.lead': 'Filmé pour de vrai, sans trucage : l’onboarding, une tâche lancée dans Google Docs, un détour par YouTube que Nox remarque, et l’étape qui fait monter de niveau.',
  'video.soon': 'La vidéo arrive très bientôt', 'video.soonText': 'En attendant, télécharge Nox et essaie-le en mode démo, sans clé.',
  'how.kicker': 'Comment ça marche', 'how.title': 'Trois étapes. Pas de paramétrage interminable.',
  'how.1.t': 'Dis ce que tu dois faire', 'how.1.p': 'À voix haute ou par écrit, comme ça te vient : <span class="quote">« Je dois rédiger mon rapport. »</span>',
  'how.2.t': 'Nox découpe', 'how.2.p': 'En micro-étapes de 2 à 10 minutes. Tu ne vois que la prochaine, et un anneau de minuteur démarre autour de Nox.',
  'how.3.t': 'Tu fais juste la prochaine étape', 'how.3.p': 'Nox reste avec toi, fête chaque étape et te donne la suivante. Sans culpabilité, sans série à perdre.',
  'feat.kicker': 'Fonctionnalités', 'feat.title': 'Comme un ami assis à côté de toi. Un ami qui ne juge jamais.',
  'feat.1.t': 'Il te parle en premier', 'feat.1.p': 'Voix temps réel : tu lui parles comme à un ami, et tu peux lui couper la parole. Ou tu écris, si tu préfères.',
  'feat.2.t': 'Il te ramène, en douceur', 'feat.2.p': 'Tu pars sur YouTube ou les réseaux ? Un petit rappel bienveillant, seulement si tu l\'as autorisé.',
  'feat.3.t': '« Tu en étais à… »', 'feat.3.p': 'Tu t\'absentes : Nox garde ta place et te la rend à ton retour, en 5 secondes.',
  'feat.4.t': 'Il protège tes pauses', 'feat.4.p': 'En hyperfocus depuis trop longtemps ? Nox te propose une pause, et garde ta place.',
  'feat.5.t': 'Il se souvient de toi', 'feat.5.p': 'Ce qui te bloque, ton moment d\'énergie, ce qui t\'aide. Tout reste sur ton PC, effaçable d\'un clic.',
  'feat.6.t': 'Mode jeu', 'feat.6.p': 'De l\'XP à chaque étape, 8 grades, 8 compétences à débloquer. Des progrès visibles, jamais de série perdue.',
  'feat.7.t': 'Un tableau de bord clair', 'feat.7.p': 'Ton étape en cours, les étapes cochées, tes minutes de focus sur 7 jours, l\'historique de tes tâches.',
  'feat.8.t': 'Aussi grand ou discret que tu veux', 'feat.8.p': 'Petit, moyen ou grand. Cache-le près de l\'horloge, rappelle-le avec Ctrl+Alt+N.',
  'feat.9.t': 'Français ou anglais', 'feat.9.p': 'Nox suit la langue de Windows, et tu peux changer à tout moment. Il parle et t\'écoute dans ta langue.',
  'feat.10.t': 'Notes express', 'feat.10.p': '« Nox, note que je dois rappeler Sam. » Tes notes arrivent sur des post-it dans le tableau de bord, et Nox te les relit quand tu veux.',
  'feat.11.t': 'La bonne appli, au bon moment', 'feat.11.p': "Un rapport ? Nox propose d'ouvrir Word, ou Google Docs si tu le dis. Du code ? VS Code. Une présentation ? PowerPoint ou Google Slides. Pas installé ? Il ouvre la version web.",
  'feat.12.t': 'Il a des émotions', 'feat.12.p': "Dis-lui qu'il est mignon, il rougit. Dis merci, ses yeux deviennent des cœurs. Dis que tu es épuisé, il comprend et propose une pause.",
  'conn.kicker': 'Connexions', 'conn.title': 'Il veille sur toute ta journée.',
  'conn.1': 'Un rappel 60 et 30 minutes avant un rendez-vous, une proposition pour le préparer, et une revue de ta journée chaque matin.',
  'conn.2': 'Nox repère les mails importants et te propose de te les lire. Dis-lui « préviens-moi si les impôts m\'écrivent » : il guette.',
  'conn.3': 'Scanne un QR code : quand tu n\'es pas devant ton PC, Nox te prévient sur ton téléphone. Tu peux aussi lui écrire.',
  'meth.kicker': 'Fondé sur la recherche', 'meth.title': '5 questions. Moins d\'une minute. Puis la bonne méthode pour toi.',
  'meth.lead': 'L\'onboarding te demande ce qui te freine, quand tu as de l\'énergie et combien de temps tu tiens concentré·e. Nox choisit ensuite la méthode qui te correspond. Tu peux en changer quand tu veux.',
  'chip.1': '⏱️ Règle des 5 minutes <small>· pour démarrer</small>', 'chip.3': '👥 Body doubling <small>· Nox reste avec toi</small>',
  'chip.4': '🔀 Si… alors… <small>· pour reprendre</small>', 'chip.5': '📦 Time-boxing <small>· contre l\'hyperfocus</small>',
  'chip.6': '🐸 Manger la grenouille <small>· le matin</small>', 'chip.7': '⚡ Règle des 2 minutes',
  'res.1.t': 'Aider au moment d\'agir', 'res.1.p': 'Le modèle de Russell Barkley : le TDAH est un problème de faire, pas de savoir. Nox vit donc là où tu travailles, et rend le temps visible.',
  'res.2.t': 'Découper les tâches', 'res.2.p': 'Le cœur de la thérapie cognitivo-comportementale de Safren pour l\'adulte TDAH, évaluée par essai randomisé.',
  'res.3.t': 'Plans « si… alors… »', 'res.3.p': 'Les implementation intentions de Gollwitzer : un effet net sur l\'atteinte des objectifs dans une méta-analyse de 94 tests.',
  'res.more': 'Détails et sources :', 'res.link': 'la synthèse de recherche',
  'inst.kicker': 'Installation', 'inst.title': 'Installé en un double-clic.',
  'inst.1.t': 'Télécharge l\'installeur', 'inst.1.p': 'Le fichier <code>Nox.Setup.1.4.0.exe</code> (environ 80 Mo) se trouve sur la page des versions.', 'inst.1.btn': 'Télécharger la dernière version',
  'inst.2.t': 'Double-clique dessus', 'inst.2.p': 'Nox s\'installe tout seul, se lance, et démarrera avec Windows. Si Windows affiche « Windows a protégé votre ordinateur », clique sur <b>Informations complémentaires</b> puis <b>Exécuter quand même</b> : l\'installeur n\'est simplement pas encore signé.',
  'inst.3.t': 'Réponds à Nox', 'inst.3.p': 'Il atterrit en bas à droite de ton écran et se présente. Choisis ta langue, colle ta clé OpenAI pour sa vraie voix (chiffrée sur ton PC) ou choisis <b>Essayer sans clé</b>, puis 5 petites questions.',
  'inst.4.t': 'Relie tes outils (facultatif)', 'inst.4.p': 'Dans le tableau de bord, carte <b>Connexions</b> : ton Google Agenda (adresse secrète iCal), Gmail (mot de passe d\'application) et Telegram (QR code).',
  'inst.dev': 'Pour les développeurs : lancer depuis le code',
  'faq.title': 'Tes questions, nos réponses.',
  'faq.1.q': 'Nox est vraiment gratuit ?', 'faq.1.a': 'Oui. Nox est gratuit et open source. Sa voix temps réel utilise ta propre clé OpenAI : tu paies directement OpenAI pour ce que tu consommes. Le mode démo fonctionne sans aucune clé, gratuitement.',
  'faq.2.q': 'Il me faut une clé OpenAI ?', 'faq.2.a': 'Pas pour l\'essayer : choisis « Essayer sans clé ». Pour la voix temps réel naturelle, crée une clé sur platform.openai.com (page API keys) et colle-la pendant l\'onboarding ou dans le tableau de bord. Elle reste chiffrée sur ton PC.',
  'faq.3.q': 'Où vont mes données ?', 'faq.3.a': 'Ton profil, tes souvenirs, tes tâches et tes stats restent dans un fichier sur ton PC. Tes clés et mots de passe sont chiffrés par Windows. Ce que tu dis à Nox est envoyé à OpenAI pour générer ses réponses. Nox ne regarde le titre de la fenêtre active que si tu dis oui.',
  'faq.4.q': 'Je n\'ai pas de TDAH. C\'est pour moi ?', 'faq.4.a': 'Oui. Nox a été pensé d\'abord pour le TDAH, mais il aide tous ceux qui ont du mal à démarrer, se font interrompre sans arrêt ou perdent le fil après une pause.',
  'faq.5.q': 'Nox remplace-t-il un traitement ou un professionnel ?', 'faq.5.a': 'Non. Nox est un outil de productivité, pas un dispositif médical. Si le TDAH pèse sur ton quotidien, parles-en à un médecin ou à un spécialiste.',
  'faq.6.q': 'Pourquoi Windows dit que l\'appli n\'est pas signée ?', 'faq.6.a': 'Signer un installeur demande un certificat payant, que cette première version n\'a pas encore. Clique sur « Informations complémentaires » puis « Exécuter quand même ». Le code est open source : chacun peut vérifier ce qu\'il fait.',
  'faq.7.q': 'Ça marche sur Mac ou Linux ?', 'faq.7.a': 'Pas encore : Nox est pour Windows uniquement pour l\'instant (Windows 10 et 11, 64 bits). Une version Mac et une version web sont prévues.',
  'faq.8.q': 'Comment cacher Nox ou changer sa taille ?', 'faq.8.a': 'Appuie sur Ctrl+Alt+N, ou clique sur l\'icône Nox près de l\'horloge. La taille (petit, moyen, grand) est dans les Réglages ou dans le menu du clic droit sur l\'icône.',
  'faq.9.q': 'Comment mettre Nox à jour ?', 'faq.9.a': 'Télécharge le dernier installeur et lance-le. Ton profil, tes souvenirs et ton historique sont conservés.',
  'test.kicker': 'Qualité', 'test.title': 'Testé de bout en bout, sur la vraie appli.',
  'test.lead': 'Des tests automatiques lancent Nox dans un dossier vierge, font tout le parcours comme un vrai utilisateur, en français et en anglais, puis le relancent pour vérifier qu\'il se souvient.',
  'test.count': 'vérifications, toutes au vert',
  'test.1': 'Onboarding, choix de la langue et profil enregistré', 'test.2': 'Une tâche est découpée, le minuteur démarre',
  'test.3': 'Permission demandée au bon moment, un « non » respecté', 'test.4': 'Souvenirs enregistrés et visibles dans le tableau de bord',
  'test.5': 'Méthodes : Nox les annonce et propose le minuteur', 'test.6': 'Mode jeu : XP, grade, compétence débloquée',
  'test.7': 'Logique de l\'agenda et des mails', 'test.8': 'Fenêtre toujours visible en entier, taille et mode discret',
  'test.9': 'Passage français ↔ anglais, en direct', 'test.10': 'Après une relance : pas de nouvel onboarding, souvenirs conservés',
  'priv.kicker': 'Vie privée', 'priv.title': 'Rien n\'est observé sans ton accord.',
  'priv.1.t': 'Tes données restent chez toi', 'priv.1.p': 'Profil, souvenirs et historique sont dans un fichier sur ton PC. Clés et mots de passe sont chiffrés par Windows.',
  'priv.2.t': 'Permission explicite', 'priv.2.p': 'Nox ne regarde l\'appli ouverte que si tu dis oui, et seulement son titre.',
  'priv.3.t': 'Mode repos', 'priv.3.p': 'Un clic, et Nox dort et se tait.',
  'vis.kicker': 'Vision · Ce n’est que le début', 'vis.title': 'Aujourd’hui, le TDAH. Demain, tous ceux que l’ordinateur laisse de côté.',
  'vis.lead': 'Nox fait le premier pas pour toi. C’est ce dont ont besoin les personnes TDAH, et c’est aussi ce dont tout le monde a besoin face à un long formulaire, un écran qu’on voit mal, ou un ordinateur qu’on n’a jamais appris à utiliser.',
  'vis.1.t': 'La paperasse, sans galère', 'vis.1.p': '« Aide-moi à remplir ça. » Nox explique chaque champ avec des mots simples et remplit le formulaire avec toi. Tu relis, et c’est toi qui envoies, jamais Nox.',
  'vis.2.t': 'Pour les personnes malvoyantes', 'vis.2.p': 'Tout à la voix. Nox lit et décrit l’écran, avec de très gros textes et un fort contraste si besoin.',
  'vis.3.t': 'Pour les personnes âgées', 'vis.3.p': 'Un mode simple, une étape à la fois (« le bouton bleu, en haut à droite »), une patience infinie, et une alerte quand un mail ressemble à une arnaque.',
  'vis.4.t': 'Partout où tu es', 'vis.4.p': 'Sur ton téléphone, dans Chrome, sur Mac. Relié à ton agenda et à tes outils via MCP.',
  'vis.5.t': 'Zéro réglage', 'vis.5.p': 'Plus de clé à coller : un téléchargement, et Nox est prêt, pour tout le monde.',
  'vis.6.t': 'C’est toujours toi qui décides', 'vis.6.p': 'Nox prépare, explique et guide. Rien de définitif (envoi, paiement, signature) ne se fait sans ton oui.',
  'final.title': 'Prêt à enfin t\'y mettre ?', 'final.lead': 'Gratuit, open source, et prêt en une minute.', 'final.btn': 'Télécharger Nox',
  'foot.by': 'Créé par', 'foot.portfolio': 'Portfolio', 'foot.code': 'Code source',
  'foot.made': 'Réalisé pour l\'OpenAI DevDay Community Hackathon, Paris 2026 · Propulsé par l\'API Realtime d\'OpenAI'
};

const SITE_META = {
  en: { title: 'Nox — the desktop buddy for ADHD brains | Free for Windows',
    description: 'Nox talks to you first, breaks your task into tiny steps, starts a timer and gently brings you back when you drift. Free for Windows, in English and French.',
    locale: 'en_US', imgDir: 'linkedin/en/' },
  fr: { title: 'Nox — le compagnon de bureau des cerveaux TDAH | Gratuit pour Windows',
    description: 'Nox te parle en premier, découpe ta tâche en micro-étapes, lance un minuteur et te ramène doucement quand tu décroches. Gratuit pour Windows, en français et en anglais.',
    locale: 'fr_FR', imgDir: 'linkedin/' }
};

let siteOriginal = null; // texte anglais d'origine, garde au premier changement
function setSiteLang(lang) {
  if (!SITE_META[lang]) lang = 'en';
  const nodes = document.querySelectorAll('[data-t]');
  if (!siteOriginal) { siteOriginal = new Map(); for (const el of nodes) siteOriginal.set(el, el.innerHTML); }
  for (const el of nodes) {
    const fr = SITE_FR[el.dataset.t];
    el.innerHTML = lang === 'fr' && fr ? fr : siteOriginal.get(el);
  }
  const meta = SITE_META[lang];
  document.documentElement.lang = lang;
  document.title = meta.title;
  const set = (sel, attr, val) => { const m = document.querySelector(sel); if (m) m.setAttribute(attr, val); };
  set('meta[name="description"]', 'content', meta.description);
  set('meta[property="og:locale"]', 'content', meta.locale);
  // Captures de l'appli dans la meme langue que la page
  for (const img of document.querySelectorAll('img[data-img]')) img.src = meta.imgDir + img.dataset.img;
  for (const b of document.querySelectorAll('.lang button')) b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
}
