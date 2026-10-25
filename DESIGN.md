# DESIGN.md — Direction design et expérience utilisateur

L'expérience utilisateur est la priorité n°1 du projet. Ce fichier fixe les références, les règles et les critères. Il complète `AGENTS.md`.

## 1. Références (et ce qu'on leur prend)

| Référence | Distinction | Ce qu'on reprend |
|---|---|---|
| **Tiimo** | App iPhone de l'année 2025 (App Store Awards), planificateur pour neurodivergents | Calme, minimalisme, couleurs douces, zéro surcharge |
| **grug** | Apple Design Award 2026, Delight and Fun | Une **voix de personnage** forte et drôle : la personnalité passe par les mots |
| **Moonlitt** | Apple Design Award 2026, Interaction | Onboarding très facile, matière « verre » (Liquid Glass) |
| **Sago Mini Jinja's Garden** | Apple Design Award 2026, Interaction | On comprend **sans lire d'instructions** |
| **Guitar Wiz** | Apple Design Award 2026, Inclusivity | Guidage parlé, contraste renforcé, l'info ne passe jamais que par la couleur |
| **Duolingo (personnages)** | Référence mondiale de mascotte vivante | Animation en **machine d'états** (Rive), bouche synchronisée sur la parole, clignements, hochements, réactions |

## 2. La mascotte : comment la rendre vivante

Technique Duolingo : animations construites dans **Rive** avec une **machine d'états** (états du corps et de la bouche qui tournent en parallèle et se mélangent), bouche pilotée par le timing de la parole, mouvements idle (clignements, hochements, sourcils), réaction finale selon le résultat.

**Cette nuit (pragmatique)** : on garde le SVG de `mascot.js` mais on l'anime de façon procédurale en JavaScript, avec la même logique de machine d'états :
- Entrées : `mood`, `lookX`/`lookY` (curseur), `mouthOpen` (0 à 1, volume audio en temps réel via `AnalyserNode`), `isListening`, `isThinking`.
- Couches indépendantes : corps (flottement, saut, squash), yeux (clignement, regard), bouche, antenne (pulsation), particules.
- Mouvements avec **ressorts** (spring physics), jamais linéaires. Durées 150 à 400 ms.

**Après le hackathon** : refaire la mascotte dans Rive (runtime web `@rive-app/canvas`) avec visèmes.

## 3. Règles UX spécifiques TDAH
1. **Une seule chose à l'écran à la fois.** Pas de mur de texte. Bulle de 2 phrases max.
2. **Divulgation progressive** : réglages avancés cachés, valeurs par défaut sensées.
3. **Permissions au bon moment** : on demande l'accès à la fenêtre active **la première fois qu'il serait utile** (au lancement d'une tâche), pas au premier démarrage.
4. **Valeur immédiate** : première micro-étape proposée en moins de 60 secondes après l'installation.
5. **Célébrer sans culpabiliser** : petites fêtes visuelles quand une étape est faite ; jamais de compteur d'échecs ni de série perdue.
6. **Contrôle sensoriel** : réglages « mouvements réduits », « sons », « volume de la voix ». Respecter `prefers-reduced-motion`.
7. **Accessibilité** : contraste AA minimum, sous-titres de tout ce qui est dit, navigation clavier, info jamais transmise par la couleur seule.

## 4. Onboarding (critères)
- 4 étapes maximum, une question par étape, toujours « Passer » possible.
- La mascotte **parle et montre** ; le texte ne fait que sous-titrer.
- Animation d'entrée mémorable (elle « atterrit » sur le bureau, s'étire, dit bonjour).
- Réponses par la voix **ou** par de gros boutons-pastilles.
- Fin : on attaque directement la première vraie tâche.

## 5. Langage visuel
- **Panneau** : effet verre translucide. Sous Windows 11, utiliser l'option Electron `backgroundMaterial: 'acrylic'` (ou `'mica'`) sur la fenêtre, coins arrondis 16 px, ombre douce.
- **Couleurs** : jaune de la mascotte (`#F0B54A`) comme accent chaleureux, bleu lumineux (`#4A9CF0`) pour l'interaction, neutres chauds. Mode sombre et clair.
- **Typographie** : une police arrondie et amicale pour les titres (ex. Nunito ou Fredoka), une sans-serif lisible pour le texte (ex. Inter). Pas de polices système génériques. Embarquer les polices en local.
- **Micro-interactions** : chaque bouton réagit (échelle 0,96 au clic, ressort au relâchement). Petits sons optionnels et discrets.
- **Voix** : chaleureuse, phrases courtes, un peu d'humour comme grug, jamais infantilisante.

## 6. Outils pour l'agent de code
Skills d'agent de code orientés design à installer (relire chaque SKILL.md avant installation, certains dépôts non officiels peuvent contenir des instructions malveillantes) :
- **Frontend Design** : impose une direction esthétique forte avant de coder.
- **UI/UX Pro Max** (`nextlevelbuilder/ui-ux-pro-max-skill`) : génère un système de design complet.
- **Interface Design** (`Dammyjay93/interface-design`) : enregistre les décisions de design pour rester cohérent.
- **UX Heuristics** (`wondelai/skills`) : audit selon les 10 heuristiques de Nielsen.

Bibliothèques utiles : `motion` (animations à ressorts), `@rive-app/canvas` (plus tard).

## 7. Test final avant la vidéo
Faire tester la mascotte à une personne qui ne connaît pas le projet, sans aucune explication. Noter chaque hésitation. Corriger les 3 plus grosses.
