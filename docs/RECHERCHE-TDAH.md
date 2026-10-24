# Recherche : TDAH, onboarding et méthodes — ce que Nox en retient

Synthèse courte, orientée décisions de design. Les preuves sont de force inégale : c'est indiqué à chaque fois.

## 1. Principes de fond

| Principe | D'où ça vient | Force de la preuve | Ce que Nox en fait |
|---|---|---|---|
| **Le TDAH est un trouble de la *performance*, pas du savoir** : aider *au moment d'agir* (« point of performance »), pas donner plus de conseils | Modèle de Russell Barkley (fonctions exécutives) | Modèle clinique de référence, résumés secondaires consultés | Nox est **sur le bureau**, au moment où on travaille, et parle en premier |
| **Externaliser le temps** (time blindness) : rendre le temps visible | Barkley | Idem | Anneau de minuteur autour de la mascotte, minuteur dans le tableau |
| **Externaliser l'information** (mémoire de travail) : l'étape en cours doit rester visible | Barkley | Idem | Étape courante affichée en permanence (bulle + tableau) |
| **Petites unités, récompense immédiate** : la motivation différée est le point faible | Barkley ; étude de 2001 : une motivation renforcée améliore la gestion du temps chez les enfants TDAH | Modèle + petite étude | Micro-étapes de 2 à 10 min, célébration à chaque étape, stats du jour |
| **Organisation et planification + découpage des tâches** | TCC de Safren et al. (essai randomisé, 86 adultes) : environ 4 fois plus de répondeurs que le groupe contrôle, effet maintenu à 12 mois. Module 1 : calendrier, liste de tâches, découper en étapes | **Essai randomisé** | `set_task` découpe toujours en 3 à 6 étapes ; historique des tâches |
| **Plans « si… alors… »** (implementation intentions) | Méta-analyse Gollwitzer & Sheeran (2006) : 94 tests, d ≈ 0,65 sur l'atteinte des objectifs. Pas d'étude spécifique TDAH trouvée | **Méta-analyse** (population générale) | Méthode « Si… alors… » ; Nox propose « Si je reviens de pause, alors je relis la dernière phrase » |
| **Body doubling** (travailler en présence de quelqu'un) | Préprint 2025 (12 participants, VR) : plus rapide avec un « double », humain ou IA. CHADD : peu de recherche solide | **Faible** (prometteur) | Méthode « Body doubling » : Nox reste présent et prend des nouvelles régulièrement |
| **Le paramétrage épuise l'énergie avant même de commencer** | Revues d'applis, retours d'usagers | Faible (pratique) | Onboarding en 5 questions max, une à la fois, toujours « Passer » |
| **Valeur immédiate avant de demander des données** | Bonnes pratiques d'onboarding en santé mentale | Faible (pratique) | Fin d'onboarding = « Sur quoi tu bosses maintenant ? » |

## 2. Onboarding retenu (moins d'une minute)

Une question par écran, posée à voix haute, réponse en un clic (grosses pastilles) ou au clavier. Toujours « Passer ».

1. **Comment je t'appelle ?** (prénom, facultatif)
2. **Qu'est-ce qui te freine le plus ?** Démarrer · Rester concentré·e · Reprendre après une interruption · Je ne fais pas de pauses · Je veux juste être plus efficace
3. **Quand as-tu le plus d'énergie ?** Le matin · L'après-midi · Le soir · Ça varie
4. **Combien de temps tu tiens concentré·e sans souffrir ?** 10 · 15 · 25 · 45 min (sert de durée par défaut du minuteur)
5. **Je te parle comment ?** Tout doux · Normal · Coach

Ensuite Nox **propose une méthode** adaptée aux réponses (voir 3), et enchaîne sur la première vraie tâche.
L'accès à la fenêtre active est demandé **au lancement de la première tâche** (le moment où il devient utile), pas pendant l'onboarding.

## 3. Méthodes proposées (et quand)

| Méthode | Proposée si… | Comportement de Nox |
|---|---|---|
| **Règle des 5 minutes** | frein = démarrer | Minuteur de 5 min : « juste 5 minutes, ensuite tu as le droit d'arrêter » |
| **Pomodoro** (25/5, ajustable) | frein = rester concentré·e, ou envie d'efficacité | Minuteur de focus, puis pause proposée |
| **Body doubling** | frein = rester concentré·e, ou reprendre | Nox prend des nouvelles toutes les 10 min, sans juger |
| **Si… alors…** | frein = reprendre | Nox formule un plan « si… alors… » pour chaque étape |
| **Time-boxing** | pas de pauses / hyperfocus | Durée fixée à l'avance, rappel ferme à la fin |
| **Manger la grenouille** | énergie le matin | La tâche la plus redoutée en premier |
| **Règle des 2 minutes** | beaucoup de petites tâches | Si c'est faisable en 2 min, on le fait tout de suite |

## 4. Mémoire

Nox retient (fichier local, consultable et effaçable dans le tableau « Ce que Nox sait de toi ») :
le profil d'onboarding, la méthode choisie, des faits courts qu'il apprend en parlant (« bosse mieux avec de la musique »), l'historique des tâches et les stats par jour.
Transparence et contrôle : chaque souvenir peut être supprimé.

## Sources

- Barkley, principes du « point of performance » (résumés) : [Simply Psychology](https://www.simplypsychology.org/adhd-future-blindness.html), [résumé vidéo](https://youtubesummary.com/summary/_tpB-B8BXk0)
- Motivation et gestion du temps chez l'enfant TDAH (2001) : [UVic](https://dspace.library.uvic.ca/items/35e86bac-ae30-4898-9118-7aee9d81d4a4)
- TCC de Safren et al. pour l'adulte TDAH : [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC3874265), [CHADD — Mastering Your Adult ADHD](https://chadd.org/attention-article/mastering-your-adult-adhd/)
- Implementation intentions (Gollwitzer & Sheeran, 2006) : [Stafforini](https://stafforini.com/works/gollwitzer-2006-implementation-intentions-and/), [Prestwich et al. 2015 (PDF)](https://bpb-us-e1.wpmucdn.com/wp.nyu.edu/dist/c/6235/files/2019/02/prestwich-et-al-2015-implementation-intentions.pdf)
- Body doubling : [arXiv 2509.12153](https://arxiv.org/abs/2509.12153), [CHADD](https://chadd.org/adhd-news/adhd-news-adults/could-a-body-double-help-you-increase-your-productivity/)
- Design pour le TDAH : [Frontiers in Computer Science 2025 (ParentCoach)](https://www.frontiersin.org/journals/computer-science/articles/10.3389/fcomp.2025.1694747/abstract), [revue d'applis de planification](https://affine.pro/blog/best-adhd-planner-apps)
- Tiimo (planification inclusive) : [tiimoapp.com](https://tiimoapp.com/resource-hub/inclusive-planning)
