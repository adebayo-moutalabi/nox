# Nox sur macOS — plan

*Rédigé le 25 octobre 2026. Rien n'est encore fait : c'est la marche à suivre.*

## Ce qui marche déjà tel quel sur Mac
Electron est multiplateforme : fenêtre transparente toujours devant, mascotte, voix temps réel (WebRTC), chat, mémoire, chiffrement des secrets (Trousseau macOS au lieu de Windows), raccourci (`Cmd+Option+N`), icône de barre de menus, lancement à l'ouverture de session, agenda, Gmail, Telegram.

## Ce qu'il faut adapter dans le code (≈ une demi-journée)

| Fonction | Aujourd'hui (Windows) | Sur Mac |
|---|---|---|
| Fenêtre active (décrochage YouTube) | PowerShell + `user32.dll` (`main.js`, `startWindowWatcher`) | `osascript` : nom de l'appli au premier plan + titre de sa fenêtre via System Events. Demande la permission **Accessibilité** (`systemPreferences.isTrustedAccessibilityClient(true)`). |
| Ouvrir la bonne appli | `reg query` + `where` + `cmd start` (`apps.js`, `runAction`) | Chercher `/Applications/Microsoft Word.app`, `Visual Studio Code.app`… et ouvrir avec `open -a`. Sinon la version web (déjà en place). |
| Micro | Autorisé d'office | `NSMicrophoneUsageDescription` dans l'Info.plist + `systemPreferences.askForMediaAccess('microphone')` avant la première écoute. |
| Fenêtre | `setAlwaysOnTop('floating')` | En plus : `setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })`, pour que Nox suive d'un bureau à l'autre. |
| Icône près de l'horloge | Zone de notification | Barre de menus : icône « template » noir et blanc 16/32 px (`iconTemplate.png`). Option : masquer l'icône du Dock. |
| Textes | « Windows », « SmartScreen », « barre des tâches » | Variantes Mac dans `i18n.js` et sur le site. |

## Fabriquer l'appli Mac (impossible depuis un PC Windows)
electron-builder ne sait pas produire une appli Mac depuis Windows. Solution gratuite pour un dépôt public : **GitHub Actions** avec une machine `macos-latest`.

- Un fichier `.github/workflows/release.yml` : à chaque tag `v*`, il construit `Nox-x.y.z-arm64.dmg` (Mac Apple Silicon) et `Nox-x.y.z-x64.dmg` (Mac Intel), et l'installeur Windows, puis les joint automatiquement à la Release.
- Dans `package.json` : une section `"mac"` (cibles `dmg` et `zip`, architectures `arm64` et `x64`, catégorie `public.app-category.productivity`, `extendInfo` avec le texte d'autorisation du micro, `hardenedRuntime`, fichier d'entitlements avec `com.apple.security.device.audio-input`).

## Signature Apple : la vraie différence entre « ça marche » et « ça marche pour tout le monde »

| | Sans compte Apple (gratuit) | Avec compte Apple Developer (99 $/an) |
|---|---|---|
| Ce que voit l'utilisateur | « Nox ne peut pas être ouvert » ou « Nox est endommagé » | Ouverture normale, comme n'importe quelle appli |
| Contournement | Clic droit → Ouvrir, ou Réglages → Confidentialité et sécurité → « Ouvrir quand même ». Si « endommagé » : `xattr -cr /Applications/Nox.app` dans le Terminal | Aucun |
| Ce qu'il faut | Une signature ad hoc (à vérifier sur un vrai Mac Apple Silicon) | Certificat « Developer ID Application » + notarisation Apple, faites automatiquement par GitHub Actions avec 5 secrets : `CSC_LINK`, `CSC_KEY_PASSWORD`, `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, `APPLE_TEAM_ID` |

Pour une version **vraiment** téléchargeable par le grand public (seniors, personnes peu à l'aise), la signature et la notarisation sont indispensables : le contournement par le Terminal n'est pas envisageable pour eux.

## Tester (indispensable avant d'annoncer la version Mac)
Il faut un vrai Mac (le tien, celui d'un proche, ou un Mac loué en ligne à l'heure) :
1. Installer depuis la Release, ouvrir, accepter le micro et l'Accessibilité.
2. Onboarding parlé, tâche, ouverture de Google Docs, décrochage sur YouTube détecté, minuteur, tableau de bord.
3. Mac Apple Silicon **et** Mac Intel si possible.

## Ordre conseillé
1. Adapter le code (tableau ci-dessus), tests Windows toujours verts.
2. Workflow GitHub Actions et section `mac` du `package.json`, tag `v1.5.0` → DMG non signés.
3. Test sur un vrai Mac, corrections.
4. Compte Apple Developer, signature et notarisation, puis bouton « Télécharger pour Mac » sur le site.
