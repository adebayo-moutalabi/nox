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

// Donnees d'exemple (une semaine d'utilisation), ecrites dans chaque langue
const DEMO = {
  fr: {
    name: 'Adebayo', task: 'Préparer la démo du hackathon',
    steps: ['Lister les 3 scénarios à montrer', 'Écrire le texte de la vidéo', 'Enregistrer la démo', 'Publier sur LinkedIn'],
    facts: ['bosse mieux avec de la musique lo-fi', 'préfère les tâches courtes le matin', 'pause café vers 16 h'],
    history: ['Rédiger le rapport de stage', 'Répondre aux mails en retard', 'Réviser le chapitre 4'],
    bubble: ['Super, étape 1 faite ! On enchaîne, je reste avec toi.', 'Écrire le texte de la vidéo'],
    hello: 'Bonjour, Adebayo', langPill: 'Français', go: "C'est parti", blocker: "qu'est-ce qui te freine"
  },
  en: {
    name: 'Adebayo', task: 'Prepare the hackathon demo',
    steps: ['List the 3 scenarios to show', 'Write the video script', 'Record the demo', 'Post it on LinkedIn'],
    facts: ['works better with lo-fi music', 'prefers short tasks in the morning', 'coffee break around 4 pm'],
    history: ['Write the internship report', 'Answer overdue emails', 'Review chapter 4'],
    bubble: ["Nice, step 1 done! Let's keep going, I'm right here with you.", 'Write the video script'],
    hello: 'Hello, Adebayo', langPill: 'English', go: "Let's go", blocker: 'what holds you back'
  }
};

function demoState(lang) {
  const d = DEMO[lang];
  const now = Date.now();
  const mins = [35, 52, 18, 64, 41, 27, 46];
  const stats = {};
  mins.forEach((m, i) => { stats[key(now - (6 - i) * DAY)] = { steps: Math.round(m / 6), tasksDone: i % 2 ? 1 : 2, focusMs: m * 60000 }; });
  const task = { id: 'demo', title: d.task, steps: d.steps, current: 1, startedAt: now - 40 * 60000 };
  return {
    lang, mode: 'travail', firmness: 'douce', watchWindows: true, watchAsked: true, method: 'body_doubling', task, history: [],
    profile: { name: d.name, blocker: 'start', energy: 'morning', focusMin: 15, tone: 'douce', onboardedAt: now - 6 * DAY },
    facts: d.facts.map((text, i) => ({ id: 'f' + i, text, at: now - (5 - i * 2) * DAY })),
    journal: [
      ...d.history.map((title, i) => ({ id: 'j' + i, title, steps: [1, 2, 3, 4], done: 4, startedAt: now - (5 - i * 2) * DAY, completedAt: now - (5 - i * 2) * DAY })),
      { id: 'demo', title: task.title, steps: task.steps, done: 1, startedAt: task.startedAt, completedAt: null }
    ],
    stats,
    // Une semaine de jeu : niveau 4, 5 competences
    game: { xp: 365, skills: { first_step: now - 6 * DAY, starter: now - 4 * DAY, finisher: now - 3 * DAY, early_bird: now - 2 * DAY, steady: now - 2 * DAY },
      counters: { steps: 34, started: 6, done: 4, resumes: 2, early: 3 } }
  };
}

// Captures haute resolution de l'appli dans une langue (mascotte, tableau de bord, onboarding)
async function captures(lang = 'fr', outDir = OUT) {
  const d = DEMO[lang];
  fs.mkdirSync(outDir, { recursive: true });
  const data = fs.mkdtempSync(path.join(os.tmpdir(), 'nox-demo-'));
  fs.writeFileSync(path.join(data, 'nox-state.json'), JSON.stringify(demoState(lang)));
  const env = { ...process.env, NOX_FAKE_AI: '1', NOX_USER_DATA: data, NOX_LANG: lang, REALTIME: 'off', IDLE_SECONDS: '100000' };
  const app = await electron.launch({ args: ['--force-device-scale-factor=2', '.'], cwd: ROOT, env });
  const mascot = await app.firstWindow();
  await mascot.waitForFunction((n) => document.querySelector('#bubble').innerText.includes(n), d.name, { timeout: 8000 });
  // Bulle de la demo : la phrase et l'etape en cours
  await mascot.evaluate(([text, step]) => { say(text, step); startTimer(15); setMood('happy'); }, d.bubble);
  await mascot.waitForTimeout(1500);
  await mascot.screenshot({ path: path.join(outDir, 'mascot.png'), omitBackground: true });
  const [dash] = await Promise.all([app.waitForEvent('window'), mascot.click('#dashboard')]);
  await dash.waitForSelector('#stepNow');
  // Capture de demo : salutation de journee et pas de barre de defilement
  await dash.evaluate((hello) => {
    window.scrollTo(0, 0);
    document.getElementById('hello').textContent = hello;
    document.head.insertAdjacentHTML('beforeend', '<style>::-webkit-scrollbar{display:none}</style>');
  }, d.hello);
  await dash.waitForTimeout(800);
  await dash.screenshot({ path: path.join(outDir, 'dashboard.png') });
  // Onboarding (nouvelle installation)
  await app.close();
  const fresh = fs.mkdtempSync(path.join(os.tmpdir(), 'nox-demo-'));
  const app2 = await electron.launch({ args: ['--force-device-scale-factor=2', '.'], cwd: ROOT, env: { ...env, NOX_USER_DATA: fresh } });
  const m2 = await app2.firstWindow();
  await m2.click(`#bubble .pill:has-text("${d.langPill}")`, { timeout: 10000 });
  await m2.click(`text=${d.go}`);
  await m2.fill('#bubble .answer input', d.name);
  await m2.click('#bubble .answer button');
  await m2.waitForSelector(`text=${d.blocker}`);
  await m2.waitForTimeout(700);
  await m2.screenshot({ path: path.join(outDir, 'onboarding.png'), omitBackground: true });
  await app2.close();
  for (const dir of [data, fresh]) fs.rmSync(dir, { recursive: true, force: true });
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
  if (process.argv[2] !== 'en') await captures('fr', OUT);
  await captures('en', path.join(OUT, 'en'));
  // `node tools/linkedin.js en` : seulement la version anglaise
  if (process.argv[2] !== 'en') {
    const pngs = await slides();
    console.log('OK FR', pngs.map((p) => path.basename(p)).join(', '), '+ nox-carrousel.pdf');
  }
  // Version anglaise (meme captures, textes ecrits pour un public anglophone)
  const en = await slides({ html: 'slides-en.html', outDir: path.join(OUT, 'en'), pdfName: 'nox-carousel-en.pdf', variants: false });
  console.log('OK EN', en.map((p) => path.basename(p)).join(', '), '+ en/nox-carousel-en.pdf');
})().catch((e) => { console.error(e); process.exit(1); });
