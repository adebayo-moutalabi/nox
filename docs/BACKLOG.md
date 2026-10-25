# Nox — tout ce qu'il reste à faire

Mis à jour le 25 octobre 2026. Priorités : 🔴 maintenant · 🟠 avant le rendu du hackathon · 🟢 ensuite.
Cocher `[x]` quand c'est fait **et testé**.

---

## 1. Publication 🔴

- [ ] **Release v1.2.0** (appli bilingue + corrections) sur GitHub, avec `dist/Nox Setup 1.2.0.exe`. Sans elle, le bouton « Télécharger » donne l'ancienne version, uniquement en français.
- [x] **Post LinkedIn en anglais** (publié, voir linkedin/PUBLISHED.md ; mettre à jour le texte avec la v3) : texte `docs/linkedin/en/POST-FINAL-EN.txt` + `docs/linkedin/en/nox-carousel-en.pdf`, puis premier commentaire avec les liens.
- [ ] Régénérer le **PDF français** (`node tools/linkedin.js`, PDF fermé dans la visionneuse).
- [ ] Second post LinkedIn plus tard (vidéo, ou version française).

## 2. Bugs et ergonomie de l'appli 🟠

- [x] **Barre de saisie coupée** : quand on clique sur ✎, le champ est en partie caché (débordement dans la fenêtre de 300 px). Agrandir la barre ou faire passer le champ au-dessus des boutons.
- [x] **Méthodes sans effet visible** : cliquer sur Pomodoro, Body doubling, Règle des 5 minutes… change bien la méthode, mais rien ne le montre. À faire : Nox annonce la méthode à voix haute, explique en une phrase, propose de lancer le minuteur ; animation sur la carte choisie.
- [x] **Taille de Nox fixe** : pouvoir l'agrandir ou le réduire (petit / moyen / grand dans les réglages, ou molette sur la mascotte).
- [x] **Mode discret** : réduire Nox en petite bulle, ou le cacher dans la zone de notification de Windows (icône près de l'horloge), avec un raccourci pour le rappeler.
- [x] **Nox parfois à moitié caché au lancement** : toujours le placer entièrement dans la zone visible, au premier plan.
- [ ] **Responsive** : la fenêtre de Nox ne s'agrandit pas ; vérifier aussi le tableau de bord à toutes les tailles (petit écran, plein écran).
- [ ] **Tableau de bord plus simple** : hiérarchie plus claire, actions plus visibles, retours visuels à chaque clic.

## 3. Nouvelles fonctionnalités

### 🟠 Rapides et impressionnantes
- [ ] **Notes (façon Google Keep)** : « Nox, note que je dois rappeler Marie » → la note est enregistrée, visible et effaçable dans le tableau de bord, relue à la demande.
- [ ] **Réactions émotionnelles** : « t'es mignon », « merci », « je suis fatigué »… → Nox rougit, sourit timidement, fait un câlin virtuel, s'inquiète. Nouvelles expressions (gêné, ému, fatigué) dans `mascot.js`.
- [ ] **Ouvrir la bonne appli selon la tâche** : « je dois travailler sur mon Word » → propose d'ouvrir Word ; « développer l'appli » → VS Code ; « mon rapport sur GitHub » → GitHub. Liste d'applis étendue + proposition au lancement de la tâche.

### 🟢 Plus longues
- [ ] **Suivi de l'appli de travail** : vérifier, avec permission, que la personne est bien sur l'appli prévue (VS Code, Word…) et la ramener doucement sinon.
- [ ] **Version web** de Nox (dans le navigateur) et **extension Chrome**, pour communiquer avec les pages ouvertes.
- [ ] **Assistant démarches administratives** : guidage pas à pas, liste des pièces à fournir, recherche web.
- [ ] **Notion, Slack** et autres outils via MCP.
- [ ] **Telegram public** : un serveur pour que chacun relie son téléphone sans créer de bot.
- [ ] **Serveur qui détient la clé OpenAI** : plus aucune clé à saisir pour l'utilisateur.
- [ ] Apprentissage des schémas de procrastination.

## 4. Site get-nox.github.io 🟠

- [x] Tous les liens externes dans un nouvel onglet.
- [x] SEO complet : titre et description, aperçus LinkedIn et X, adresse canonique, données structurées, sitemap, robots.txt, textes alternatifs.
- [x] Auteur affiché « Adebayo MOUTALABI », avec liens vers le portfolio (https://adebayo-moutalabi.github.io/) et LinkedIn (https://www.linkedin.com/in/adebayo-moutalabi/).
- [x] Français et anglais selon la langue du navigateur, avec un bouton pour changer.
- [x] Captures en anglais pour la version anglaise.
- [x] **Copywriting retravaillé** (récit 14 h / 14 h 41, bénéfices, 3 étapes).
- [x] **FAQ** (9 questions) : « C'est gratuit ? », « Il me faut une clé OpenAI ? », « Mes données vont où ? », « Ça marche sur Mac ? », « Pourquoi Windows dit que l'appli n'est pas signée ? », « Je n'ai pas de TDAH, c'est pour moi ? »…
- [ ] Intégrer la vidéo quand elle sera prête (`video/nox-demo.mp4`).

## 5. Vidéo de 2 minutes 🟠

Voir le plan détaillé dans la section 7.

## 6. Hackathon 🟠

- [ ] Soumission (formulaire, e-mail et Luma) avant minuit, avec la vidéo, le site et le code.
- [ ] Textes de soumission en anglais.

---

## 7. Plan de la vidéo (motion design, faite par Claude)

**Principe** : je fabrique la vidéo entièrement par programme, sans prendre le contrôle de ta souris :
- les scènes animées (titres, mascotte, textes qui apparaissent) sont des pages HTML animées ;
- les démos sont filmées **automatiquement** dans la vraie appli, pilotée par le même outil que les tests, en mode démo, donc sans consommer de tokens ;
- tout est assemblé en MP4 avec FFmpeg.

**Ce qu'il te faut installer** : seulement FFmpeg (`winget install Gyan.FFmpeg`).

**Voix** : au choix :
- (a) sans voix, avec des sous-titres animés, la version la plus sûre ;
- (b) la voix de Nox générée par OpenAI, quelques centimes avec ta clé ;
- (c) ta propre voix, enregistrée à part.

**Storyboard (≈ 2 min, en anglais, sous-titres) :**

| Temps | Scène | Contenu |
|---|---|---|
| 0:00–0:12 | Accroche | Écran noir, texte qui tape : « 2:00 pm. You open your doc to "just start". » → « 2:40 pm. You're on YouTube. » → « Your ADHD brain isn't lazy. » |
| 0:12–0:20 | Arrivée de Nox | La mascotte atterrit sur un bureau, cligne des yeux, sourit : « Hi, I'm Nox. » |
| 0:20–0:40 | Onboarding | Les 5 questions défilent vite, réponses cliquées, méthode choisie. Texte : « 5 questions. Under a minute. » |
| 0:40–1:05 | S1 — Démarrer | « I need to write my report » → découpage en micro-étapes, minuteur qui démarre, Word qui s'ouvre. |
| 1:05–1:20 | S2 — Décrochage | Une fenêtre YouTube apparaît → Nox devient inquiet : « Let's save that for your break. » |
| 1:20–1:35 | S3 — Reprise | Écran qui s'éteint (absence) → retour : « Welcome back! You were at: write the intro. » |
| 1:35–1:50 | Tableau de bord + mode jeu | Étape cochée, XP qui monte, compétence débloquée 🎉, souvenirs, connexions Agenda / Gmail / Telegram. |
| 1:50–2:00 | Fin | « Free · Windows · English & French » + **get-nox.github.io** + « by Adebayo MOUTALABI · Built with the OpenAI Realtime API ». |

## 8. Démos courtes et impressionnantes (tests, vidéo, réseaux)

1. **« Démarrer en 10 secondes »** : dire une tâche floue (« I have to deal with my taxes ») → 4 micro-étapes concrètes, la première affichée, minuteur lancé.
2. **Lui couper la parole** : Nox explique, on l'interrompt, il s'arrête net et répond.
3. **Le retour après pause** : partir 60 s, revenir → « You were at… ».
4. **Le décrochage** : ouvrir YouTube pendant une tâche → relance douce au bout de 20 s.
5. **La mémoire** : « I work better with music » → relancer l'appli → Nox s'en souvient.
6. **Changer de langue en direct** : passer de l'anglais au français, et Nox continue la conversation dans l'autre langue.
7. **Le mode jeu** : finir une tâche → niveau gagné, compétence débloquée, fête animée.
8. **L'agenda** : un rendez-vous dans 30 min → Nox prévient et propose de préparer.
9. *(après développement)* **La note express** : « Note that I need to call Marie » → note visible dans le tableau de bord.
10. *(après développement)* **Le compliment** : « You're cute » → Nox rougit et remercie.
