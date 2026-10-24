# Nox — ta mascotte anti-procrastination

Une petite mascotte qui vit sur ton bureau et t'aide à **démarrer**, **rester concentré** et **reprendre** après une interruption. Pensée pour les personnes TDAH, utile à tous ceux qui procrastinent.

## Lancer en développement (Windows)

1. Installe Node.js LTS : https://nodejs.org (uniquement pour toi, développeur).
2. Dans ce dossier :
   ```
   npm install
   copy .env.example .env
   ```
3. Ouvre `.env` et colle ta clé OpenAI.
4. `npm start` : Nox apparaît en bas à droite de l'écran.

## Créer l'installeur pour les utilisateurs

```
npm run dist
```
Le fichier `Nox Setup x.x.x.exe` est dans `dist/`. Double-clic : installé, et Nox démarre avec Windows.

## Changer de nom ou de mascotte

- Nom : `MASCOT_NAME=Atom` dans `.env`.
- Ton propre dessin : mets un PNG transparent carré dans `assets/mascot.png` ; il remplace automatiquement le sprite par défaut.

## Ce qui marche

| Scénario | Comment le tester |
|---|---|
| 1. Démarrer | « Je dois rédiger mon rapport » → une micro-étape + minuteur visible |
| 2. Décrochage | Réglages → cocher « Voir l'appli active », ouvrir YouTube 20 s pendant une tâche |
| 3. Reprise | Ne touche plus au PC 60 s, puis reviens : Nox te dit où tu en étais |
| 4. Hyperfocus | Après 90 min de tâche, Nox propose une pause |
| 5. Repos | Réglages → mode Repos : Nox dort et se tait |

Délais réglables dans `.env` : `DRIFT_SECONDS`, `IDLE_SECONDS`, `HYPERFOCUS_MIN`.

## Architecture

- `main.js` : fenêtre transparente toujours visible, appels OpenAI (chat JSON, transcription, synthèse vocale), surveillance douce (fenêtre active, inactivité, durée), actions (ouvrir une appli ou un lien).
- `realtime.js` : voix temps réel (API Realtime d'OpenAI en WebRTC, jeton éphémère créé par `main.js`, outils `set_task`, `complete_step`, `start_timer`, `open_app`, `open_url`, `save_context`, `set_mood`). Si la connexion échoue, Nox repasse automatiquement en mode classique (transcription + chat + synthèse). `REALTIME=off` dans `.env` force le mode classique.
- `renderer.js` + `index.html` : mascotte vectorielle (`mascot.js`), bulle, minuteur, micro, réglages, premier lancement.
- L'état (tâche, étapes, contexte sauvegardé) est dans un JSON local (`%APPDATA%/nox-desktop/nox-state.json`). Au premier lancement, l'ancien état `%APPDATA%/kip-desktop/kip-state.json` est repris automatiquement.

## Suite (après le hackathon)

Serveur qui détient la clé (aucune clé côté utilisateur), bot Telegram pour suivre sur le téléphone, extension Chrome, apprentissage des schémas de procrastination.
