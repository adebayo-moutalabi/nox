# Nox — tout ce qu'il reste à faire

Mis à jour le 25 octobre 2026 (après la vidéo v1). Priorités : 🔴 aujourd'hui, avant le rendu · 🟠 juste après · 🟢 la suite (voir [VISION.md](VISION.md)).
Cocher `[x]` quand c'est fait **et testé**.

---

## 1. Rendu du hackathon 🔴 (avant 22 h)

- [ ] **Release v1.4.0 sur GitHub** (toi) : tag `v1.4.0`, titre `Nox 1.4.0`, fichier `dist/Nox Setup 1.4.0.exe`, description = section v1.4.0 de CHANGELOG.md. La v1.3.0 n'a jamais été publiée : inutile, la 1.4.0 contient tout.
- [ ] **Soumission** : réponses prêtes champ par champ en haut de [SUBMISSION.md](SUBMISSION.md) (lien vidéo public : https://get-nox.github.io/video/nox-demo.mp4).
- [ ] Décider : présence à la finale (lundi 26, Hexa, 18 h–22 h) et accord pour l'usage de la vidéo.
- [x] **Textes de soumission en anglais** : [SUBMISSION.md](SUBMISSION.md) (titre, accroche, descriptions courte et longue, piste, technologies OpenAI, liens, e-mail).
- [x] Vidéo de 2 min v1 (anglais, sous-titres, narration OpenAI, vraie démo) : `video/Nox-demo-v1.mp4` + `.srt`.
- [x] Vidéo intégrée au site (`docs/video/nox-demo.mp4`, version web).
- [x] Section **Vision** sur le site (TDAH → paperasse, malvoyants, seniors, partout).

## 2. Vidéo : prochaine version 🟠

Tes retours d'abord (ce que tu veux ajouter, améliorer, mettre en avant). Pistes déjà notées :
- [ ] Montrer la **voix temps réel** (parler à Nox, l'interrompre) : le cœur du produit, absent de la v1.
- [ ] Montrer le **retour après une pause** (« Tu en étais à… ») et la **note express**.
- [ ] Un plan sur la **vision** (formulaire, malvoyant, senior) à la fin.
- [ ] Éviter la pub YouTube à l'écran ; finir la phrase coupée « Let's start small… ».
- [ ] À chaque nouvelle version : garder l'ancienne (`video/Nox-demo-vN.mp4`) et mettre à jour `docs/video/nox-demo.mp4` + le dépôt du site.

## 3. Corrections et finitions de l'appli 🟠

- [ ] **Raccourci pour parler** `Ctrl+Alt+K`, sans cliquer (spécification 4.2).
- [ ] **Rouvrir l'appli au retour** d'une absence (scénario S3).
- [ ] **Horaires actifs** : Nox dort en dehors des heures choisies (S5).
- [ ] **Panneau au double-clic** sur la mascotte (4.3).
- [ ] **Tableau de bord plus simple** : hiérarchie plus claire, retours visuels à chaque clic ; vérifier toutes les tailles d'écran.
- [ ] **Carte « compétence débloquée »** : elle reste parfois affichée après le clic (vu pendant le tournage).
- [ ] **Préfixe d'étape trop répétitif** : Nox redit souvent la même étape mot pour mot (vu pendant le tournage).
- [ ] **Bulle de sous-titre** : sur les longues réponses, n'afficher que la phrase en cours.

## 4. À vérifier en vrai 🟠

- [ ] Voix temps réel avec ta clé : parler, couper la parole, délai, en français et en anglais.
- [x] Ouverture réelle de Google Docs depuis la carte « Tu veux que je l'ouvre ? » (vidéo).
- [x] Détection réelle de YouTube et relance (vidéo).
- [ ] Connexions réelles : Google Agenda, Gmail, Telegram.
- [ ] Installeur sur un autre PC ou une session Windows vierge.

## 5. Vision : la suite 🟢 (détail dans [VISION.md](VISION.md))

### Démarches administratives
- [ ] **Extension Chrome** qui laisse Nox lire la page ouverte, avec permission.
- [ ] **« Aide-moi à remplir ce formulaire »** : explication de chaque champ en mots simples, remplissage avec la personne ; **elle relit et envoie elle-même**.
- [ ] **Dossiers** : pièces à fournir, échéances, courriers préparés, suivi des réponses.
- [ ] **Lire le contenu à la demande** : « Résume cette page », « Qu'est-ce que dit ce mail ? ».

### Accessibilité
- [ ] **Mode malvoyant** : tout à la voix, description de l'écran (vision), très gros textes, fort contraste, sans souris.
- [ ] **Mode simple seniors** : interface minimale, pas à pas (« le bouton bleu en haut à droite »), patience, **alerte anti-arnaque**.
- [ ] **Aide d'un proche**, avec accord : résumé ou guidage à distance.

### Partout et sans réglage
- [ ] **Serveur qui détient la clé** : plus aucune clé à saisir.
- [ ] **Téléphone** (Telegram public, puis appli), **Mac**.
- [ ] **Outils via MCP** : Notion, Slack, agenda…
- [ ] **Apprentissage des schémas** de procrastination.
- [ ] **Signature de l'installeur** (plus d'alerte SmartScreen).
- [ ] **Version macOS** : plan complet dans [MACOS.md](MACOS.md) (adaptations du code, GitHub Actions, signature Apple, tests sur un vrai Mac).

## 6. Communication 🟢

- [ ] Second post LinkedIn avec la vidéo v2 : texte prêt dans `docs/linkedin/en/POST-2-VIDEO-EN.txt` (anglais), puis version française.
- [ ] **Post « histoire »** : vidéo verticale `video/Nox-story-v3.mp4` (HD, 20 Mo) et `video/Nox-story-v3-light.mp4` (WhatsApp, 12,7 Mo) ; textes EN, FR et WhatsApp prêts ; v1 et v2 gardées + texte `docs/linkedin/en/POST-3-STORY-EN.txt`.
- [ ] Mettre à jour le texte du premier post avec la v3.
- [ ] Régénérer le PDF français du carrousel (`node tools/linkedin.js`).

---

## Fait (historique)

Notes façon Keep, émotions, bonne appli selon la tâche (Word, VS Code, Google Docs…), méthodes animées, taille de Nox, mode discret, placement visible, conversation naturelle (gpt-6.1-sol), onglet actif, minuteur pilotable (voix, clic, tableau), pauses Pomodoro, cartes qui n'avalent plus les messages ni ne coupent Nox, barres de défilement discrètes, site bilingue avec FAQ et SEO, scénario de démo automatique (`npm run demo`, 11/11), vidéo v1.
