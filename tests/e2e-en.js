// Test du parcours en anglais : langue detectee, onboarding, reponses de Nox, tableau de bord,
// puis passage au francais depuis les reglages. Cerveau de test, dossier temporaire.
// Usage : node tests/e2e-en.js (lance aussi par npm test)
const { _electron: electron } = require('playwright-core');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = fs.mkdtempSync(path.join(os.tmpdir(), 'nox-test-en-'));
const results = [];
function check(name, ok, detail = '') { results.push({ name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`); }
const text = (page, sel) => page.locator(sel).innerText();

(async () => {
  const app = await electron.launch({ args: ['.'], cwd: ROOT,
    env: { ...process.env, NOX_FAKE_AI: '1', NOX_USER_DATA: DATA, NOX_LANG: 'en', REALTIME: 'off', IDLE_SECONDS: '100000' } });
  try {
    const mascot = await app.firstWindow();
    await mascot.waitForSelector('#bubble.card .q', { timeout: 8000 });
    check('EN : choix de la langue en anglais', (await text(mascot, '#bubble .q')).includes('Which language'));
    check('EN : interface traduite (champ de saisie)', (await mascot.getAttribute('#input', 'placeholder')).startsWith('Tell me'));
    await mascot.click('#bubble .pill:has-text("English")');
    await mascot.click('text=Let\'s go');
    await mascot.fill('#bubble .answer input', 'Sam');
    await mascot.click('#bubble .answer button');
    await mascot.waitForSelector('text=what holds you back');
    check('EN : questions d\'onboarding en anglais', true);
    await mascot.screenshot({ path: path.join(ROOT, 'docs', 'screenshots', 'en-onboarding.png'), omitBackground: true });
    await mascot.click('#bubble .pill:has-text("Getting started")');
    await mascot.click('#bubble .pill:has-text("Morning")');
    await mascot.click('#bubble .pill:has-text("15 min")');
    await mascot.click('#bubble .pill:has-text("Gentle")');
    await mascot.waitForFunction(() => document.querySelector('#bubble').innerText.includes('What are you working on'), null, { timeout: 5000 });
    check('EN : Nox repond en anglais', true);
    await mascot.click('#write');
    await mascot.fill('#input', 'I need to write my internship report');
    await mascot.press('#input', 'Enter');
    await mascot.waitForFunction(() => document.querySelector('#bubble').innerText.includes('Open the document'), null, { timeout: 5000 });
    check('EN : tache decoupee en anglais', true);
    await mascot.waitForSelector('#bubble.card >> text=Can I see which app', { timeout: 9000 });
    await mascot.click('#bubble .pill:has-text("No thanks")');

    const [dash] = await Promise.all([app.waitForEvent('window'), mascot.click('#dashboard')]);
    await dash.waitForSelector('#stepNow');
    check('EN : tableau de bord en anglais', (await text(dash, '#nowTitle')).toLowerCase() === 'right now' && (await text(dash, '#doneBtn')).includes('Done'));
    check('EN : methode et grade traduits', (await text(dash, '#methodChip')).includes('5-minute rule') && (await text(dash, '#lvGrade')) === 'Spark');

    // Passage au francais depuis les reglages : mascotte et tableau suivent
    await mascot.click('#settings');
    await mascot.selectOption('#pLang', 'fr');
    await mascot.click('#pSave');
    await mascot.waitForFunction(() => document.querySelector('#input').placeholder.startsWith('Dis-moi'), null, { timeout: 5000 });
    check('Langue changee : mascotte en francais', true);
    await dash.waitForFunction(() => document.querySelector('#nowTitle').innerText.toLowerCase() === 'maintenant', null, { timeout: 5000 });
    check('Langue changee : tableau en francais', true);
    check('Langue enregistree', (await mascot.evaluate(() => window.nox.getState())).lang === 'fr');
  } catch (e) {
    check('Parcours anglais sans erreur', false, e.message.split('\n')[0]);
  } finally {
    await app.close().catch(() => {});
    fs.rmSync(DATA, { recursive: true, force: true });
  }
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - failed}/${results.length} verifications reussies (anglais)`);
  process.exit(failed ? 1 : 0);
})();
