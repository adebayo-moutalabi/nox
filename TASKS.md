# TASKS.md — Plan de travail (rendu dimanche 25 oct. avant minuit)

Lire `AGENTS.md` et `DESIGN.md` avant de commencer. Une tâche à la fois, dans l'ordre. Cocher quand c'est fait et testé.

## P0 — Cette nuit (ce qui fait gagner la démo)

- [x] **T0. Préparer le design**
  Lire `DESIGN.md`. Installer les skills design listés en section 6 (relire chaque SKILL.md avant). Produire une courte charte (couleurs, polices, rayons, durées d'animation) dans `design-tokens.css`.
  *Fait quand :* `design-tokens.css` existe et toute l'interface l'utilise.
  *Reste :* skills design non installés. Polices Nunito et Inter embarquées dans `assets/fonts/`.

- [ ] **T1. Voix temps réel mains libres**
  Remplacer le cycle micro → transcription → chat → synthèse par l'API Realtime d'OpenAI en WebRTC (jeton éphémère créé dans `main.js`). Détection de fin de parole automatique, interruption possible, sous-titres dans la bulle.
  *Fait quand :* je clique une fois sur la mascotte, je parle, elle répond en moins d'une seconde et demie, et je peux lui couper la parole.

- [ ] **T2. Outils (function calling)**
  Brancher `set_task`, `complete_step`, `start_timer`, `open_app`, `open_url`, `save_context`, `set_mood` sur la session Realtime.
  *Fait quand :* « Je dois rédiger mon rapport, ouvre Word » ouvre Word, affiche la première micro-étape et lance le minuteur.

- [ ] **T3. Mascotte vivante**
  Clignement aléatoire, pupilles qui suivent le curseur, bouche synchronisée sur le volume audio, états `listening` / `thinking` / `speaking`, réactions au survol, au clic et au glisser, animations idle variées. Vectoriel net, aucune pixellisation.
  *Fait quand :* sans rien toucher pendant 30 s, elle fait au moins 3 choses différentes ; quand elle parle, sa bouche bouge en rythme.

- [x] **T4. Elle parle en premier**
  Au lancement : animation d'entrée puis salutation vocale personnalisée (prénom, heure de la journée, tâche en cours éventuelle).
  *Fait quand :* au démarrage, elle dit bonjour et pose une question sans que j'aie rien fait.

- [x] **T5. Onboarding parlé**
  Remplacer le formulaire par la conversation décrite en 4.1 d'`AGENTS.md`, avec boutons Oui / Non en secours.
  *Fait quand :* un inconnu la configure en moins d'une minute sans lire de texte.

## P1 — Dimanche matin et après-midi

- [x] **T6. Panneau** (tableau de bord, bouton ▦) : tâche, étapes cochées, minuteur, stats du jour, réglages. Design soigné.
- [ ] **T7. Polir S2, S3, S4** avec la voix temps réel (relances parlées naturelles).
- [ ] **T8. Installeur** : `npm.cmd run dist`, tester le `.exe` sur une session propre.
- [ ] **T9. Dépôt GitHub public** : README avec GIF, captures, instructions.

## P2 — Dimanche soir (non négociable)

- [ ] **T10. Vidéo de 2 min**
  0-15 s : le problème (écran, document vide, onglets ouverts et fermés).
  15-90 s : démo réelle S1, puis S2, puis S3.
  90-120 s : impact, vision (téléphone, outils, MCP), lien GitHub.
- [ ] **T11. Soumission** via le formulaire (email et Luma) avant minuit, posts avec @borvibe @openaidevs #parisdevdayhack.

## Plus tard (ne pas toucher ce week-end)
Serveur de clé, bot Telegram, extension Chrome, MCP (agenda, Notion), apprentissage des schémas.
