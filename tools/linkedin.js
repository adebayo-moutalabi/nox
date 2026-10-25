// Genere les visuels LinkedIn (docs/linkedin) a partir de la vraie appli :
// 1) captures haute resolution avec des donnees d'exemple (cerveau de test, aucun appel OpenAI)
// 2) rendu des 6 slides en PNG 1080x1350 + un PDF (format carrousel LinkedIn)
// Usage : node tools/linkedin.js
const { _electron: electron } = require('playwright-core');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'docs', 'linkedin');
const DAY = 86400000;
const key = (t) => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

// Donnees d'exemple (une semaine d'utilisation)
function demoState() {
  const now = Date.now();
  const mins = [35, 52, 18, 64, 41, 27, 46];
  const stats = {};
  mins.forEach((m, i) => { stats[key(now - (6 - i) * DAY)] = { steps: Math.round(m / 6), tasksDone: i % 2 ? 1 : 2, focusMs: m * 60000 }; });
  const task = { id: 'demo', title: 'Préparer la démo du hackathon', steps: ['Lister les 3 scénarios à montrer', 'Écrire le texte de la vidéo', 'Enregistrer la démo', 'Publier sur LinkedIn'], current: 1, startedAt: now - 40 * 60000 };
  return {
    mode: 'travail', firmness: 'douce', watchWindows: true, watchAsked: true, method: 'body_doubling', task, history: [],
    profile: { name: 'Habib', blocker: 'start', energy: 'morning', focusMin: 15, tone: 'douce', onboardedAt: now - 6 * DAY },
    facts: [
      { id: 'a', text: 'bosse mieux avec de la musique lo-fi', at: now - 5 * DAY },
      { id: 'b', text: 'préfère les tâches courtes le matin', at: now - 3 * DAY },
      { id: 'c', text: 'pause café vers 16 h', at: now - DAY }
    ],
    journal: [
      { id: 'j1', title: 'Rédiger le rapport de stage', steps: [1, 2, 3, 4], done: 4, startedAt: now - 5 * DAY, completedAt: now - 5 * DAY },
      { id: 'j2', title: 'Répondre aux mails en retard', steps: [1, 2, 3], done: 3, startedAt: now - 3 * DAY, completedAt: now - 3 * DAY },
      { id: 'j3', title: 'Réviser le chapitre 4', steps: [1, 2, 3, 4, 5], done: 5, startedAt: now - DAY, completedAt: now - DAY },
      { id: 'demo', title: task.title, steps: task.steps, done: 1, startedAt: task.startedAt, completedAt: null }
    ],
    stats,
    // Une semaine de jeu : niveau 4 (Batisseur), 5 competences
    game: { xp: 365, skills: { first_step: now - 6 * DAY, starter: now - 4 * DAY, finisher: now - 3 * DAY, early_bird: now - 2 * DAY, steady: now - 2 * DAY },
      counters: { steps: 34, started: 6, done: 4, resumes: 2, early: 3 } }
  };
}

async function captures() {
  const data = fs.mkdtempSync(path.join(os.tmpdir(), 'nox-demo-'));
  fs.writeFileSync(path.join(data, 'nox-state.json'), JSON.stringify(demoState()));
  const app = await electron.launch({ args: ['--force-device-scale-factor=2', '.'], cwd: ROOT,
    env: { ...process.env, NOX_FAKE_AI: '1', NOX_USER_DATA: data, REALTIME: 'off', IDLE_SECONDS: '100000' } });
  const mascot = await app.firstWindow();
  await mascot.waitForFunction(() => document.querySelector('#bubble').innerText.includes('Habib'), null, { timeout: 8000 });
  // Bulle de la demo : la phrase et l'etape en cours
  await mascot.evaluate(() => { say('Super, étape 1 faite ! On enchaîne, je reste avec toi.', 'Écrire le texte de la vidéo'); startTimer(15); setMood('happy'); });
  await mascot.waitForTimeout(1500);
  await mascot.screenshot({ path: path.join(OUT, 'mascot.png'), omitBackground: true });
  const [dash] = await Promise.all([app.waitForEvent('window'), mascot.click('#dashboard')]);
  await dash.waitForSelector('#stepNow');
  // Capture de demo : salutation de journee et pas de barre de defilement
  await dash.evaluate(() => {
    window.scrollTo(0, 0);
    document.getElementById('hello').textContent = 'Bonjour, Habib';
    document.head.insertAdjacentHTML('beforeend', '<style>::-webkit-scrollbar{display:none}</style>');
  });
  await dash.waitForTimeout(800);
  await dash.screenshot({ path: path.join(OUT, 'dashboard.png') });
  // Onboarding (nouvelle installation)
  await app.close();
  const fresh = fs.mkdtempSync(path.join(os.tmpdir(), 'nox-demo-'));
  const app2 = await electron.launch({ args: ['--force-device-scale-factor=2', '.'], cwd: ROOT,
    env: { ...process.env, NOX_FAKE_AI: '1', NOX_USER_DATA: fresh, REALTIME: 'off' } });
  const m2 = await app2.firstWindow();
  await m2.waitForSelector('text=C\'est parti');
  await m2.click('text=C\'est parti');
  await m2.fill('#bubble .answer input', 'Habib');
  await m2.click('#bubble .answer button');
  await m2.waitForSelector('text=qu\'est-ce qui te freine');
  await m2.waitForTimeout(700);
  await m2.screenshot({ path: path.join(OUT, 'onboarding.png'), omitBackground: true });
  await app2.close();
  for (const d of [data, fresh]) fs.rmSync(d, { recursive: true, force: true });
}

// Une langue = un fichier de slides, un dossier de sortie et un nom de PDF
async function slides({ html = 'slides.html', outDir = OUT, pdfName = 'nox-carrousel.pdf', variants: withVariants = true } = {}) {
  fs.mkdirSync(outDir, { recursive: true });
  const data = fs.mkdtempSync(path.join(os.tmpdir(), 'nox-demo-'));
  // Windows limite une fenetre a la hauteur de l'ecran : chaque slide est capturee
  // en deux morceaux (haut, puis bas apres defilement) recolles dans un canvas 1080x1350
  const app = await electron.launch({ args: ['--force-device-scale-factor=1', '.'], cwd: ROOT,
    env: { ...process.env, NOX_FAKE_AI: '1', NOX_USER_DATA: data, REALTIME: 'off' } });
  await app.firstWindow();
  const file = path.join(OUT, html);
  // Une fenetre hors ecran par slide, capturee a 1080x1350
  // (pas de require dans evaluate : les images reviennent en base64 et sont ecrites ici)
  const result = await app.evaluate(async ({ BrowserWindow }, file) => {
    const w = new BrowserWindow({ width: 1080, height: 1350, show: false, useContentSize: true, frame: false });
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const images = [];
    for (let n = 1; n <= 6; n++) {
      await w.loadFile(file, { query: { n: String(n) } });
      await wait(700);
      const top = await w.webContents.capturePage();
      const h = top.getSize().height;
      const offset = Math.max(0, 1350 - h);
      await w.webContents.executeJavaScript(`window.scrollTo(0, ${offset})`);
      await wait(300);
      const bottom = await w.webContents.capturePage();
      const png = await w.webContents.executeJavaScript(`(async () => {
        const load = (src) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = src; });
        const [a, b] = await Promise.all([load('${top.toDataURL()}'), load('${bottom.toDataURL()}')]);
        const c = document.createElement('canvas'); c.width = 1080; c.height = 1350;
        const g = c.getContext('2d'); g.drawImage(b, 0, ${offset}); g.drawImage(a, 0, 0);
        return c.toDataURL('image/png').split(',')[1];
      })()`);
      images.push(png);
    }
    w.destroy();
    return { images };
  }, file);
  const pngs = result.images.map((b64, i) => {
    const p = path.join(outDir, `slide-${i + 1}.png`);
    fs.writeFileSync(p, Buffer.from(b64, 'base64'));
    return p;
  });
  // PDF : une image pleine page par slide, sans aucune marge (format document LinkedIn).
  // Fond a la couleur des slides : aucun liseré blanc aux arrondis de taille de page.
  const pdfHtml = path.join(outDir, '_pdf.html');
  fs.writeFileSync(pdfHtml, `<!doctype html><style>@page{size:1080px 1350px;margin:0}html,body{margin:0;padding:0;background:#F6EFE5}
    .p{width:1080px;height:1350px;overflow:hidden;break-after:page}.p:last-child{break-after:auto}.p img{display:block;width:1080px;height:1350px}</style>
    ${pngs.map((p) => `<div class="p"><img src="${path.basename(p)}"></div>`).join('')}`);
  const pdf = await app.evaluate(async ({ BrowserWindow }, f) => {
    const w = new BrowserWindow({ width: 1080, height: 1350, show: false });
    await w.loadFile(f);
    await new Promise((r) => setTimeout(r, 800));
    const out = await w.webContents.printToPDF({ printBackground: true, preferCSSPageSize: true, margins: { marginType: 'none' } });
    w.destroy();
    return out.toString('base64');
  }, pdfHtml);
  fs.writeFileSync(path.join(outDir, pdfName), Buffer.from(pdf, 'base64'));
  fs.rmSync(pdfHtml);
  if (!withVariants) { await app.close(); fs.rmSync(data, { recursive: true, force: true }); return pngs; }
  // Variantes d'accroche (slide 1) a comparer
  const variants = await app.evaluate(async ({ BrowserWindow }, file) => {
    const w = new BrowserWindow({ width: 1080, height: 1350, show: false, useContentSize: true, frame: false });
    const out = {};
    for (const hook of ['a', 'b', 'c']) {
      await w.loadFile(file, { query: { n: '1', hook } });
      await new Promise((r) => setTimeout(r, 600));
      const top = await w.webContents.capturePage();
      const offset = Math.max(0, 1350 - top.getSize().height);
      await w.webContents.executeJavaScript(`window.scrollTo(0, ${offset})`);
      await new Promise((r) => setTimeout(r, 300));
      const bottom = await w.webContents.capturePage();
      out[hook] = await w.webContents.executeJavaScript(`(async () => {
        const load = (src) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = src; });
        const [a, b] = await Promise.all([load('${top.toDataURL()}'), load('${bottom.toDataURL()}')]);
        const c = document.createElement('canvas'); c.width = 1080; c.height = 1350;
        const g = c.getContext('2d'); g.drawImage(b, 0, ${offset}); g.drawImage(a, 0, 0);
        return c.toDataURL('image/png').split(',')[1];
      })()`);
    }
    w.destroy();
    return out;
  }, file);
  fs.mkdirSync(path.join(OUT, 'accroches'), { recursive: true });
  for (const [k, b64] of Object.entries(variants)) fs.writeFileSync(path.join(OUT, 'accroches', `slide-1-${k}.png`), Buffer.from(b64, 'base64'));
  await app.close();
  fs.rmSync(data, { recursive: true, force: true });
  return pngs;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  await captures();
  // `node tools/linkedin.js en` : seulement la version anglaise
  if (process.argv[2] !== 'en') {
    const pngs = await slides();
    console.log('OK FR', pngs.map((p) => path.basename(p)).join(', '), '+ nox-carrousel.pdf');
  }
  // Version anglaise (meme captures, textes ecrits pour un public anglophone)
  const en = await slides({ html: 'slides-en.html', outDir: path.join(OUT, 'en'), pdfName: 'nox-carousel-en.pdf', variants: false });
  console.log('OK EN', en.map((p) => path.basename(p)).join(', '), '+ en/nox-carousel-en.pdf');
})().catch((e) => { console.error(e); process.exit(1); });
