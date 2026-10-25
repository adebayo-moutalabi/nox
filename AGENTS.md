# AGENTS.md — Spécification de Nox

Ce fichier est lu automatiquement par Codex (AGENTS.md). Il décrit le produit, les règles et les critères d'acceptation. La direction design et UX (prioritaire) est dans `DESIGN.md`. La liste priorisée des tâches est dans `TASKS.md`.

## 1. Le produit en une phrase
Un compagnon de bureau vivant et bienveillant, qui **te parle en premier**, t'aide à **démarrer**, **rester** et **reprendre** une tâche, une seule micro-étape à la fois. Cible : personnes TDAH, et toute personne qui procrastine ou travaille sans manager.

Contexte : OpenAI DevDay Community Hackathon Paris, piste Impact / Disability inclusion. Rendu : dimanche 25 octobre 2026 avant minuit (vidéo de 2 min obligatoire, dépôt GitHub optionnel).

## 2. Principes non négociables
1. **Voix d'abord, mains libres.** On parle à la mascotte comme à ChatGPT en mode vocal : conversation fluide, on peut l'interrompre, pas de bouton à maintenir.
2. **Proactive.** Elle engage la conversation (accueil, relance, reprise). L'utilisateur n'a jamais besoin d'écrire en premier.
3. **Vivante.** Elle n'est jamais figée : elle cligne des yeux, regarde le curseur, bouge la bouche quand elle parle, réagit au survol et au clic.
4. **Une seule étape à la fois**, faisable en 2 à 10 minutes. Jamais de longue liste.
5. **Jamais culpabilisante.** Ton chaleureux, tutoiement, phrases courtes.
6. **Respect de la vie privée.** Rien n'est observé sans accord explicite. Mode Repos = elle dort et se tait.
7. **Installation la plus simple possible** pour l'utilisateur final : un `.exe`, aucune clé API à saisir (en version finale).

## 3. Identité visuelle
- Mascotte : robot jaune (tête jaune arrondie, oreilles latérales, visière noire, yeux bleus lumineux, sourire, antenne à boule bleue, corps moutarde, bras et jambes fins). Dessin vectoriel dans `mascot.js`. **Aucun rendu pixelisé.**
- Style : mignon et bienveillant, mais cool et futuriste (lueurs, transitions douces).
- Humeurs : `idle` (dort), `listening` (écoute), `thinking` (réfléchit), `speaking` (parle), `focus`, `happy`, `worried`, `proud`. La couleur lumineuse (`--glow`) suit l'humeur.

### Critères « vivante » (acceptation)
- Clignement des yeux aléatoire toutes les 3 à 6 s.
- Les pupilles suivent le curseur de la souris dans la visière.
- Pendant qu'elle parle, la bouche s'ouvre selon le volume réel de l'audio (analyseur Web Audio).
- Pendant l'écoute : antenne qui pulse + petites ondes. Pendant la réflexion : yeux qui tournent ou points de suspension.
- Survol : elle se tourne vers le curseur et sourit. Clic : petit saut. Glisser : légère déformation (squash & stretch).
- Animations idle variées (regarde autour, s'étire, bâille) quand rien ne se passe.

## 4. Expérience utilisateur

### 4.1 Premier lancement (onboarding parlé, pas un formulaire)
1. La mascotte apparaît avec une petite animation d'entrée et **se présente à voix haute**.
2. Elle demande le prénom de l'utilisateur, puis ce qui le bloque le plus (démarrer, rester concentré, oublier).
3. Elle demande l'autorisation de voir l'appli active, avec une explication en une phrase. Réponse à la voix ou par un bouton Oui / Non.
4. Elle demande le ton souhaité (doux, normal, coach).
5. Elle conclut : « Sur quoi tu bosses maintenant ? »
Durée totale : moins d'une minute. Tout est rattrapable dans le panneau.

### 4.2 Conversation
- Clic sur la mascotte ou mot d'activation ou raccourci global (ex. `Ctrl+Alt+K`) : elle écoute.
- Détection de fin de parole automatique, réponse vocale immédiate, interruption possible.
- Le texte reste possible (champ de saisie) mais secondaire.
- Sous-titres de ce qu'elle dit dans la bulle.

### 4.3 Panneau (clic droit ou double-clic sur la mascotte)
Petite fenêtre propre, design moderne (pas une page web séparée) :
- Tâche du moment, micro-étape actuelle, étapes faites (cases cochées).
- Minuteur.
- Historique de la journée (« 3 étapes faites, 52 min de concentration »).
- Réglages : prénom, mode (Travail, Études, Repos, Off), ton, permissions, horaires actifs, voix.

## 5. Scénarios et critères d'acceptation

| # | Scénario | Déclencheur | Comportement attendu |
|---|---|---|---|
| S1 | Mur du démarrage | L'utilisateur annonce une tâche, ou la mascotte propose d'en choisir une au démarrage du PC | Découpe en 3 à 6 micro-étapes, annonce **seulement** la première, propose de lancer un minuteur et peut ouvrir l'appli utile |
| S2 | Décrochage | Fenêtre distrayante (YouTube, réseaux…) pendant une tâche, au-delà de N secondes | Humeur `worried`, relance douce à voix haute, propose de garder ça pour la pause |
| S3 | Interruption | Inactivité de plus de N secondes pendant une tâche | Sauvegarde du contexte (tâche, étape, fenêtre). Au retour : « Tu en étais à… », et rouvre l'appli |
| S4 | Hyperfocus | Session de plus de X minutes sans pause | Propose une pause et garantit de garder la place |
| S5 | Repos | Mode Repos ou hors des horaires actifs | Dort, ne dit rien, répond seulement si on l'appelle |
| S6 | Fin d'étape | Fin du minuteur ou « c'est fait » | Humeur `proud`, félicitation brève, étape suivante |

## 6. Architecture

- **Electron** (Windows d'abord). Fenêtre transparente, sans bordure, toujours au premier plan, déplaçable.
- `main.js` : état, surveillance (fenêtre active via PowerShell, inactivité via `powerMonitor`), actions système, émission des événements proactifs, création du jeton éphémère pour la voix.
- `renderer.js` + `index.html` + `mascot.js` : mascotte, animations, audio, bulle, panneau.
- **Voix temps réel : API Realtime d'OpenAI via WebRTC.**
  - Le processus principal crée une session et obtient un **jeton éphémère** avec la clé du `.env` ; le renderer ne voit jamais la clé.
  - Le renderer ouvre la connexion WebRTC (micro en entrée, audio en sortie), détection de fin de parole côté serveur.
  - Les actions passent par **function calling** : `start_timer(minutes)`, `set_task(title, steps)`, `complete_step()`, `open_app(name)`, `open_url(url)`, `save_context()`, `set_mood(mood)`.
  - Les événements proactifs (S2 à S6) sont injectés dans la session comme messages système, et la mascotte parle d'elle-même.
  - **Vérifier les noms de modèles et les endpoints actuels dans la documentation officielle OpenAI avant d'implémenter**, ils évoluent.
- Repli si Realtime échoue : transcription + chat + synthèse vocale (déjà codé).
- État persistant : JSON dans `%APPDATA%`.

## 7. Vision élargie et suite (détail dans `docs/VISION.md`)
Nox fait le premier pas face à l'ordinateur. Après les personnes TDAH, il vise **tous ceux que l'ordinateur laisse de côté** :
- **Démarches administratives** : expliquer chaque champ d'un formulaire, le remplir avec la personne (extension Chrome), lister les pièces, rappeler les échéances. **La personne relit et envoie elle-même.**
- **Personnes malvoyantes** : tout à la voix, lecture et description de l'écran, gros textes, fort contraste.
- **Personnes âgées ou peu à l'aise** : mode simple, pas à pas, patience, alerte anti-arnaque, aide d'un proche avec accord.
- **Partout** : téléphone (Telegram puis appli), Mac, outils via MCP, serveur qui détient la clé, apprentissage des schémas.

Règle ajoutée aux principes : **rien de définitif (envoi, paiement, signature) sans accord explicite de la personne.**

## 8. Règles pour l'agent de code
- Travailler par petites étapes testables. Après chaque tâche : `npm.cmd start` doit fonctionner.
- Ne jamais committer `.env`.
- Sous Windows avec PowerShell restreint : utiliser `npm.cmd`.
- Garder le code lisible et commenté en français.
- Mettre à jour `TASKS.md` (cocher) à chaque tâche terminée.
