// Joue le scenario de docs/DEMO.md tout seul, en anglais, avec le cerveau de demo (sans cle,
// sans ouvrir Word ni YouTube), et verifie chacun des 7 moments (preuve que le parcours marche).
// Usage : node tools/demo-run.js
const { _electron: electron } = require('playwright-core');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const steps = [];
function step(name, ok) { steps.push({ name, ok }); console.log(`${ok ? 'OK ' : 'RATE'}  ${name}`); }
const pause = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {

  const data = fs.mkdtempSync(path.join(os.tmpdir(), 'nox-demo-run-'));
  fs.writeFileSync(path.join(data, 'nox-state.json'), JSON.stringify({
    lang: 'en', method: 'pomodoro', watchWindows: true, watchAsked: true,
    profile: { name: 'Adebayo', blocker: 'start', energy: 'morning', focusMin: 15, tone: 'douce', onboardedAt: Date.now() }
  }));
  const app = await electron.launch({
    args: ['--force-device-scale-factor=2', '.'], cwd: ROOT,
    env: { ...process.env, NOX_FAKE_AI: '1', NOX_USER_DATA: data, NOX_NO_WATCHER: '1', REALTIME: 'off', DRIFT_SECONDS: '4', IDLE_SECONDS: '100000' }
  });
  const nox = await app.firstWindow();
  const bubble = () => nox.locator('#bubble').innerText();
  const waitBubble = (re, ms = 8000) => nox.waitForFunction((src) => new RegExp(src, 'i').test(document.getElementById('bubble').innerText), re.source, { timeout: ms }).then(() => true, () => false);
  const tell = async (text) => { await nox.click('#write'); await pause(300); await nox.type('#input', text, { delay: 35 }); await pause(300); await nox.press('#input', 'Enter'); };

  // 1. Lancement : atterrissage + salutation
  step('1. Nox greets you by name', await waitBubble(/Hi Adebayo/, 10000));
  await pause(1500);

  // 2. Annoncer la tache : micro-etapes, minuteur, proposition de Word
  await tell('I need to write my internship report');
  step('2. Task broken down, first step shown', await waitBubble(/Open the document/));
  step('2. Word is suggested', await nox.waitForSelector('#bubble.card >> text=This happens in Word', { timeout: 6000 }).then(() => true, () => false));
  await pause(1500);
  await nox.click('#bubble .pill:has-text("No need")'); // (en direct : "Open it")

  // 3. Minuteur de 25 min a la voix
  await tell('Start a 25 minute timer');
  step('3. 25-minute timer running', await nox.waitForFunction(() => document.getElementById('timerLabel').innerText.startsWith('2'), null, { timeout: 5000 }).then(() => true, () => false));
  await pause(1500);

  // 4. Decrochage sur YouTube (titre de fenetre simule)
  await nox.evaluate(() => window.nox.testWindow('Funny cats compilation - YouTube - Google Chrome'));
  step('4. Nox brings you back from YouTube', await waitBubble(/YouTube can wait/, 15000));
  await nox.evaluate(() => window.nox.testWindow('Internship report - Word'));
  await pause(2000);

  // 5. Etape faite : felicitations, etape suivante, competence debloquee
  await tell('Done!');
  step('5. Next step after "Done"', await waitBubble(/Nice/));
  step('5. Skill unlocked', await nox.waitForSelector('#bubble.card >> text=Skill unlocked', { timeout: 9000 }).then(() => true, () => false));
  await pause(2000);
  await nox.click('#bubble .pill:has-text("Awesome")');

  // 6. Note express puis compliment
  await tell('Note that I need to email my tutor');
  step('6. Note saved', await waitBubble(/noted/));
  await pause(1200);
  await tell("You're so cute");
  step('6. Nox blushes', await nox.waitForFunction(() => document.getElementById('app').classList.contains('shy'), null, { timeout: 5000 }).then(() => true, () => false));
  await pause(2500);

  // 7. Tableau de bord, puis arreter le minuteur a la voix
  const [dash] = await Promise.all([app.waitForEvent('window'), nox.click('#dashboard')]);
  await dash.waitForSelector('#stepNow');
  step('7. Dashboard shows the step, the note and the progress',
    (await dash.locator('#notes').innerText()).includes('email my tutor') && (await dash.locator('#lvGrade').innerText()).length > 0);
  await pause(2500);
  await dash.evaluate(() => document.getElementById('notes').scrollIntoView({ behavior: 'smooth' }));
  await pause(2000);
  await tell('Stop the timer');
  step('7. Timer stopped by voice', await nox.waitForFunction(() => document.getElementById('timerLabel').style.display === 'none', null, { timeout: 5000 }).then(() => true, () => false));
  await pause(1500);
  void bubble;

  await app.close();
  fs.rmSync(data, { recursive: true, force: true });
  const failed = steps.filter((s) => !s.ok).length;
  console.log(`\n${steps.length - failed}/${steps.length} moments reussis.`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error('ECHEC', e.message.split('\n')[0]); process.exit(1); });
