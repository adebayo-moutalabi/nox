# Scénario de démo — 90 secondes, 7 moments

Un seul scénario, toujours le même, pour montrer que Nox fait exactement ce qu'on attend de lui.
Les phrases à dire sont en anglais (vidéo pour le jury) ; la version française est entre parenthèses.

**Avant de commencer**
- Nox installé, clé OpenAI enregistrée (ou mode démo), langue **English**, méthode **Pomodoro**.
- Réglages → « See the active app / tab » **coché** (pour le moment 4).
- Word installé (sinon Nox ouvrira Word en ligne : c'est prévu).
- Écran propre : seulement le bureau, Chrome fermé.

| # | Tu fais / tu dis | Nox doit… | Ce qu'on voit |
|---|---|---|---|
| 1 | Tu lances Nox | atterrir en bas à droite et te saluer par ton prénom | animation d'atterrissage, bulle « Hi Adebayo! What are you working on? » |
| 2 | *« I need to write my internship report »* (« Je dois rédiger mon rapport de stage ») | découper en micro-étapes, n'afficher que la première, proposer le minuteur, puis proposer Word | bulle avec « → première étape », carte « This happens in Word. Want me to open it? » |
| 3 | Clic **Open it** (« Ouvre-le »), puis *« Start a 25-minute timer »* | ouvrir Word, lancer l'anneau de 25 min | Word s'ouvre, anneau jaune autour de Nox |
| 4 | Tu ouvres YouTube dans Chrome et tu restes 20 s | te ramener gentiment | Nox inquiet, « Let's keep that for your break » |
| 5 | Retour sur Word : *« Done! »* (« C'est fait ! ») | féliciter, donner l'étape suivante, faire monter l'XP | Nox fier, étape suivante, carte « Skill unlocked 🎉 » |
| 6 | *« Note that I need to email my tutor »* puis *« You're so cute »* | enregistrer la note ; rougir | « Got it, noted 📝 » ; joues roses, « You're making me blush » |
| 7 | Bouton ▦ (tableau de bord), puis *« Stop the timer »* | montrer l'étape en cours, la note, la progression ; arrêter le minuteur | tableau de bord complet ; l'anneau disparaît |

**À ne pas montrer** (pas encore prêt ou trop long) : lecture du contenu d'une page, Telegram, Gmail en direct.

**Si quelque chose rate en direct** : clic sur la mascotte pour couper le micro, *« Let's start over »*, et reprendre au moment qui a raté.

## Version automatique

`node tools/demo-run.js` joue ce scénario tout seul, en anglais (cerveau de démo, sans clé, sans ouvrir Word ni YouTube : la fenêtre YouTube est simulée) et vérifie chacun des 7 moments. Résultat attendu : « 11/11 moments réussis ».
