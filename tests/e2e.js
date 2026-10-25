// Test de bout en bout : lance la vraie appli Electron avec le cerveau de test
// (NOX_FAKE_AI=1, aucun appel a OpenAI) dans un dossier de donnees temporaire,
// puis joue le parcours complet. Captures dans docs/screenshots/.
// Usage : npm test
const { _electron: electron } = require('playwright-core');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SHOTS = path.join(ROOT, 'docs', 'screenshots');
const DATA = fs.mkdtempSync(path.join(os.tmpdir(), 'nox-test-'));
const results = [];
function check(name, ok, detail = '') { results.push({ name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`); }

async function launch() {
  const app = await electron.launch({
    args: ['.'], cwd: ROOT,
    env: { ...process.env, NOX_FAKE_AI: '1', NOX_USER_DATA: DATA, NOX_LANG: process.env.NOX_LANG || 'fr', REALTIME: 'off', IDLE_SECONDS: '100000' }
  });
  const mascot = await app.firstWindow();
  await mascot.waitForLoadState('domcontentloaded');
  return { app, mascot };
}
const state = (page) => page.evaluate(() => window.nox.getState());
const bubbleText = (page) => page.locator('#bubble').innerText();

(async () => {
  fs.mkdirSync(SHOTS, { recursive: true });
  let { app, mascot } = await launch();
  try {
    // 1) Onboarding : une question a la fois
    await mascot.waitForSelector('#bubble.card .q', { timeout: 8000 });
    check('Onboarding affiche au premier lancement', true);
    await mascot.screenshot({ path: path.join(SHOTS, '01-onboarding-intro.png'), omitBackground: true });
    await mascot.click('#bubble .pill:has-text("Français")');
    await mascot.click('text=C\'est parti');
    await mascot.fill('#bubble .answer input', 'Habib');
    await mascot.click('#bubble .answer button');
    await mascot.waitForSelector('text=qu\'est-ce qui te freine');
    await mascot.screenshot({ path: path.join(SHOTS, '02-onboarding-question.png'), omitBackground: true });
    await mascot.click('#bubble .pill:has-text("Démarrer")');
    await mascot.click('#bubble .pill:has-text("Le matin")');
    await mascot.click('#bubble .pill:has-text("15 min")');
    await mascot.click('#bubble .pill:has-text("Tout doux")');
    await mascot.waitForFunction(() => document.querySelector('#bubble').innerText.includes('Sur quoi tu bosses'), null, { timeout: 5000 });
    let st = await state(mascot);
    check('Profil enregistre', st.profile.name === 'Habib' && st.profile.blocker === 'start' && st.profile.focusMin === 15, JSON.stringify(st.profile));
    check('Methode suggeree selon le frein (demarrer -> 5 minutes)', st.method === 'five_minutes', st.method);

    // 2) Annoncer une tache : decoupage + minuteur
    await mascot.click('#write');
    await mascot.fill('#input', 'Je dois rédiger mon rapport de stage');
    await mascot.press('#input', 'Enter');
    await mascot.waitForFunction(() => document.querySelector('#bubble').innerText.includes('Ouvre le document'), null, { timeout: 5000 });
    check('Tache decoupee, premiere etape affichee', true);
    const timer = await mascot.locator('#timerLabel').innerText();
    check('Minuteur lance a la duree de la methode (5 min)', /^[45]:\d\d$/.test(timer), timer);
    await mascot.screenshot({ path: path.join(SHOTS, '03-premiere-etape.png'), omitBackground: true });

    // 3) Permission demandee au lancement de la premiere tache
    // 3a) Appli utile : "rapport" -> Nox propose Word (le test refuse, pour ne rien ouvrir)
    await mascot.waitForSelector('#bubble.card >> text=Ça se fait dans Word', { timeout: 6000 });
    check('Appli proposee selon la tache (rapport -> Word)', (await state(mascot)).task.app === 'word');
    await mascot.click('#bubble .pill:has-text("Pas besoin")');
    await mascot.waitForSelector('#bubble.card >> text=Je peux voir quelle appli', { timeout: 9000 });
    check('Acces a la fenetre demande au bon moment', true);
    await mascot.click('#bubble .pill:has-text("Non merci")');
    st = await state(mascot);
    check('Refus respecte', st.watchWindows === false && st.watchAsked === true);

    // 4) Memoire : un fait appris en parlant
    await mascot.click('#write');
    await mascot.fill('#input', 'je bosse mieux avec de la musique lo-fi');
    await mascot.press('#input', 'Enter');
    await mascot.waitForFunction(async () => (await window.nox.getState()).facts.length === 1, null, { timeout: 5000 });
    check('Souvenir enregistre', true);

    // 4b) Note facon Keep, dictee a Nox
    await mascot.click('#write');
    await mascot.fill('#input', 'note que je dois rappeler Marie demain');
    await mascot.press('#input', 'Enter');
    await mascot.waitForFunction(async () => (await window.nox.getState()).notes.length === 1, null, { timeout: 5000 });
    check('Note dictee enregistree', (await state(mascot)).notes[0].text === 'je dois rappeler Marie demain');

    // 4c) Reaction emotionnelle : un compliment fait rougir Nox
    await mascot.click('#write');
    await mascot.fill('#input', "t'es trop mignon");
    await mascot.press('#input', 'Enter');
    const shy = await mascot.waitForFunction(() => document.getElementById('app').classList.contains('shy'), null, { timeout: 5000 }).then(() => true, () => false);
    check('Compliment : Nox rougit (humeur shy)', shy && (await bubbleText(mascot)).includes('rougir'));

    // 5) Tableau de bord
    const [dash] = await Promise.all([app.waitForEvent('window'), mascot.click('#dashboard')]);
    await dash.waitForSelector('#stepNow');
    check('Tableau : etape courante', (await dash.locator('#stepNow').innerText()) === 'Ouvre le document');
    check('Tableau : souvenir visible', (await dash.locator('#facts').innerText()).includes('musique'));
    check('Tableau : note visible', (await dash.locator('#notes').innerText()).includes('rappeler Marie'));
    await dash.fill('#noteInput', 'Acheter du café');
    await dash.press('#noteInput', 'Enter');
    await dash.waitForFunction(() => document.querySelectorAll('#notes .note').length === 2, null, { timeout: 5000 });
    check('Tableau : ajouter une note', true);
    await dash.click('#notes .note button');
    await dash.waitForFunction(() => document.querySelectorAll('#notes .note').length === 1, null, { timeout: 5000 });
    check('Tableau : supprimer une note', true);
    await dash.screenshot({ path: path.join(SHOTS, '04-tableau-de-bord.png') });
    await dash.click('#doneBtn');
    await dash.waitForFunction(() => document.querySelector('#stepNow')?.innerText === 'Écris le plan en 3 points', null, { timeout: 5000 });
    check('Cocher une etape depuis le tableau', (await dash.locator('#sSteps').innerText()) === '1');
    await mascot.waitForFunction(() => document.querySelector('#bubble').innerText.includes('Bravo'), null, { timeout: 5000 });
    check('Nox felicite quand on coche dans le tableau', true);
    await mascot.waitForSelector('#bubble.card >> text=Compétence débloquée', { timeout: 9000 });
    check('Nox fete la competence', true);
    await mascot.click('#bubble .pill:has-text("Trop bien")');
    await dash.click('.method[data-method="pomodoro"]');
    await dash.waitForFunction(() => document.querySelector('#methodChip').innerText.includes('Pomodoro'));
    check('Changer de methode', (await state(mascot)).method === 'pomodoro');
    const announced = await mascot.waitForFunction(() => document.querySelector('#bubble').innerText.includes('Pomodoro'), null, { timeout: 5000 }).then(() => true, () => false);
    check('Nox annonce la methode choisie', announced, announced ? '' : await bubbleText(mascot));
    check('Bouton minuteur sur la methode active', (await dash.locator('.method.on .start').count()) === 1);
    await dash.click('#doneBtn');
    await dash.waitForFunction(() => document.querySelector('#stepNow')?.innerText === 'Rédige la première partie');
    await dash.click('#doneBtn');
    await dash.waitForSelector('#newTask');
    check('Tache terminee -> historique', (await dash.locator('#history').innerText()).includes('terminée'));
    await dash.screenshot({ path: path.join(SHOTS, '05-tableau-tache-terminee.png') });
    st = await state(mascot);
    check('Stats du jour', st.today.steps === 3 && st.today.tasksDone === 1, JSON.stringify(st.today));

    // 5b) Mode jeu : 5 (tache lancee) + 3 x 10 (etapes) + 50 (tache finie) = 85 XP -> niveau 2
    check('Mode jeu : XP et grade', st.game.xp === 85 && st.level.level === 2 && st.level.grade === 'Démarreur', `${st.game.xp} XP, ${st.level.grade}`);
    check('Mode jeu : competence debloquee', Boolean(st.game.skills.first_step));
    await dash.waitForFunction(() => document.querySelector('#lvGrade').innerText === 'Démarreur');
    check('Tableau : progression affichee', (await dash.locator('.skill.on').count()) >= 1);

    // 5c) Agenda : un evenement dans 55 min -> rappel "60 min avant"
    const start = new Date(Date.now() + 55 * 60000);
    const ics = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    // (l'appli n'accepte que des adresses https : on teste l'analyse du fichier directement)
    const { parseIcs, upcoming, matchWatch, looksImportant } = require('../integrations');
    const evs = upcoming(parseIcs(`BEGIN:VEVENT\r\nUID:a\r\nDTSTART:${ics(start)}\r\nSUMMARY:Point avec Marie\r\nEND:VEVENT\r\nBEGIN:VEVENT\r\nDTSTART;VALUE=DATE:20200101\r\nSUMMARY:Ancien\r\nEND:VEVENT`));
    check('Agenda : lecture iCal (evenement a venir seulement)', evs.length === 1 && evs[0].title === 'Point avec Marie', JSON.stringify(evs.map((e) => e.title)));
    check('Agenda : adresse invalide refusee', (await dash.evaluate(() => window.nox.setCalendar('pas une url'))).ok === false);

    // 5d) Mails : attente d'un mail precis + tri sans IA
    check('Mail attendu reconnu', matchWatch({ query: 'mail de la CAF' }, { from: 'CAF <noreply@caf.fr>', subject: 'Votre attestation' }));
    check('Mail sans rapport ignore', !matchWatch({ query: 'Marie Dupont' }, { from: 'Newsletter <news@x.fr>', subject: 'Promo' }));
    const { detectApp } = require('../apps');
    check('Detection d\'appli : presentation -> PowerPoint, appli -> VS Code, GitHub cite -> GitHub',
      detectApp('Préparer la présentation du client') === 'powerpoint' && detectApp('Développer l\'application mobile') === 'vscode' && detectApp('Mettre à jour mon rapport sur GitHub') === 'github');
    check('Detection d\'appli : rien de force quand ce n\'est pas evident', detectApp('Ranger mon bureau') === null);
    check('Mail urgent repere', looksImportant({ subject: 'Rappel : facture à régler', text: '' }) && !looksImportant({ subject: 'Les nouveautés de la semaine', text: '' }));

    // 5e) Fenetre de Nox : visible en entier, taille reglable, mode discret
    const bounds = () => app.evaluate(({ BrowserWindow, screen }) => {
      const w = BrowserWindow.getAllWindows().find((x) => x.webContents.getURL().endsWith('index.html'));
      const b = w.getBounds(), wa = screen.getDisplayMatching(b).workArea;
      return { ...b, visible: w.isVisible(), inside: b.x >= wa.x && b.y >= wa.y && b.x + b.width <= wa.x + wa.width && b.y + b.height <= wa.y + wa.height };
    });
    let b = await bounds();
    check('Nox entierement dans la zone visible', b.inside && b.visible, JSON.stringify(b));
    await mascot.evaluate(() => window.nox.setSettings({ size: 'l' }));
    await mascot.waitForTimeout(400);
    b = await bounds();
    check('Taille grand : fenetre agrandie et toujours visible', b.width === 390 && b.inside, `${b.width}x${b.height}`);
    await mascot.evaluate(() => window.nox.setSettings({ size: 'm' }));
    await mascot.evaluate(() => window.nox.hide());
    await mascot.waitForTimeout(400);
    check('Mode discret : Nox cache', !(await bounds()).visible);
    await mascot.evaluate(() => window.nox.show());
    await mascot.waitForTimeout(400);
    check('Mode discret : Nox rappele', (await bounds()).visible);

    // 6) Relance : Nox se souvient
    await app.close();
    ({ app, mascot } = await launch());
    await mascot.waitForFunction(() => document.querySelector('#bubble').innerText.includes('Habib'), null, { timeout: 8000 });
    const hasCard = await mascot.locator('#bubble.card').count();
    check('Apres relance : pas de nouvel onboarding, il connait le prenom', hasCard === 0, await bubbleText(mascot));
    st = await state(mascot);
    check('Apres relance : souvenirs et historique conserves', st.facts.length === 1 && st.journal.length === 1 && st.method === 'pomodoro');
    await mascot.screenshot({ path: path.join(SHOTS, '06-relance-memoire.png'), omitBackground: true });
  } catch (e) {
    check('Parcours sans erreur', false, e.message.split('\n')[0]);
  } finally {
    await app.close().catch(() => {});
    fs.rmSync(DATA, { recursive: true, force: true });
  }
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - failed}/${results.length} verifications reussies`);
  process.exit(failed ? 1 : 0);
})();
