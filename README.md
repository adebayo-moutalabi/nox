# Nox — un compagnon de bureau pour les cerveaux TDAH

Nox est une petite mascotte qui vit sur ton bureau. Elle **te parle en premier**, découpe ta tâche en **micro-étapes de 2 à 10 minutes**, lance un minuteur visible et t'aide à **démarrer**, **rester concentré·e** et **reprendre** après une interruption. Pensée pour les personnes TDAH, utile à toute personne qui veut avancer sans manager.

Projet réalisé pour l'**OpenAI DevDay Community Hackathon Paris** (piste Impact / inclusion). Propulsé par l'**API Realtime d'OpenAI** (`gpt-realtime-2.1`, voix temps réel en WebRTC) et `gpt-4o-mini`.

<p align="center">
  <img src="docs/linkedin/slide-1.png" width="32%" alt="Nox">
  <img src="docs/linkedin/slide-4.png" width="32%" alt="Onboarding">
  <img src="docs/linkedin/slide-5.png" width="32%" alt="Tableau de bord">
</p>

## Ce qu'elle fait

| | |
|---|---|
| **Onboarding parlé** | 5 questions, une à la fois, en moins d'une minute (prénom, ce qui te freine, moment d'énergie, durée de concentration, ton). Réponse au clic, au clavier ou à la voix, toujours « Passer ». |
| **Voix temps réel** | Clic sur la mascotte : on parle librement, on peut lui couper la parole. Outils : `set_task`, `complete_step`, `start_timer`, `open_app`, `open_url`, `save_context`, `remember`, `set_mood`. Repli automatique sur transcription + chat + synthèse. |
| **Mémoire** | Profil, souvenirs appris en parlant, historique des tâches, stats par jour. Réinjectés dans chaque conversation. Tout reste en local, consultable et effaçable. |
| **Tableau de bord** | Étape en cours, étapes cochées, minuteur, minutes de focus sur 7 jours, ce que Nox sait de toi, historique. |
| **7 méthodes** | Règle des 5 minutes, Pomodoro, body doubling, Si… alors…, time-boxing, manger la grenouille, règle des 2 minutes. Méthode suggérée selon ton profil. |
| **Surveillance douce, avec accord** | Décrochage (YouTube, réseaux…), absence (contexte sauvegardé puis « tu en étais à… »), hyperfocus (pause proposée). L'accès à la fenêtre active est demandé au lancement de la première tâche. |
| **Vivante** | Clignements, regard qui suit le curseur, bouche synchronisée sur la voix, écoute, réflexion, animations au repos. |

Les choix de design s'appuient sur la recherche : [docs/RECHERCHE-TDAH.md](docs/RECHERCHE-TDAH.md) (Barkley, TCC de Safren, implementation intentions de Gollwitzer, body doubling).

## Lancer (Windows)

1. Installe Node.js LTS : https://nodejs.org
2. Dans ce dossier :
   ```
   npm install
   copy .env.example .env
   ```
3. Ouvre `.env` et colle ta clé OpenAI.
4. `npm start` : Nox atterrit en bas à droite de l'écran.

Sans clé (ou pour une démo gratuite) : `set NOX_FAKE_AI=1 && npm start` utilise un cerveau de test local, sans aucun appel à OpenAI.

## Tests

```
npm test
```

Lance la vraie appli Electron avec le cerveau de test, dans un dossier de données temporaire, et joue tout le parcours : onboarding, découpage d'une tâche, minuteur, permission, mémoire, tableau de bord, changement de méthode, fin de tâche, puis relance pour vérifier que Nox se souvient. 17 vérifications, captures dans `docs/screenshots/`.

`node tools/linkedin.js` régénère les visuels de présentation (`docs/linkedin/`, avec des données d'exemple).

## Architecture

- `main.js` : fenêtres (mascotte transparente toujours visible, tableau de bord), appels OpenAI, jeton éphémère pour la voix temps réel, outils, surveillance douce, IPC.
- `memory.js` : profil, souvenirs, journal, stats, méthodes et questions d'onboarding (fonctions pures).
- `realtime.js` : client WebRTC de l'API Realtime (sous-titres, appels d'outils, interruption).
- `renderer.js` + `index.html` + `mascot.js` : mascotte vectorielle animée, bulle, cartes de question, minuteur.
- `dashboard.html` + `dashboard.js` : tableau de bord.
- `design-tokens.css` : charte (couleurs, polices Nunito et Inter embarquées, rayons, durées). Mode sombre automatique.
- `fake-ai.js` : cerveau de test (`NOX_FAKE_AI=1`).
- État local : `%APPDATA%/nox-desktop/nox-state.json`.

Réglages dans `.env` : `DRIFT_SECONDS`, `IDLE_SECONDS`, `HYPERFOCUS_MIN`, `REALTIME=off` (force le mode classique), modèles et voix.

## Suite

Serveur qui détient la clé (aucune clé côté utilisateur), version téléphone, extension Chrome, connexion à l'agenda via MCP, apprentissage des schémas de procrastination.

Polices Nunito et Inter : SIL Open Font License 1.1 (`assets/fonts/`).
