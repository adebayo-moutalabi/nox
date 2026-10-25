// Appli utile selon la tache : "je dois rediger mon rapport" -> Word, "developper l'appli" -> VS Code.
// Nox ne fait que PROPOSER ; il ouvre l'appli installee, sinon sa version web.
const { execFile } = require('child_process');

const APPS = {
  word: { name: 'Word', exe: 'winword', web: 'https://www.office.com/launch/word' },
  excel: { name: 'Excel', exe: 'excel', web: 'https://www.office.com/launch/excel' },
  powerpoint: { name: 'PowerPoint', exe: 'powerpnt', web: 'https://www.office.com/launch/powerpoint' },
  vscode: { name: 'VS Code', exe: 'code', web: 'https://vscode.dev' },
  github: { name: 'GitHub', web: 'https://github.com' },
  notion: { name: 'Notion', exe: 'notion', web: 'https://www.notion.so' },
  gmail: { name: 'Gmail', web: 'https://mail.google.com' },
  gdocs: { name: 'Google Docs', web: 'https://docs.google.com/document/create', hl: true },
  gslides: { name: 'Google Slides', web: 'https://docs.google.com/presentation/create', hl: true },
  gsheets: { name: 'Google Sheets', web: 'https://docs.google.com/spreadsheets/create', hl: true }
};

// D'abord les noms d'outils cites explicitement, puis les mots qui evoquent un type de travail
const EXPLICIT = [
  ['gdocs', /\bgoogle ?docs?\b/i], ['gslides', /\bgoogle ?slides?\b/i], ['gsheets', /\bgoogle ?sheets?\b/i],
  ['github', /\bgit ?hub\b/i], ['notion', /\bnotion\b/i], ['gmail', /\bgmail\b/i],
  ['powerpoint', /\b(power ?point|ppt)\b/i], ['excel', /\bexcel\b/i], ['word', /\bword\b/i],
  ['vscode', /\b(vs ?code|visual studio code)\b/i]
];
const GENERIC = [
  ['powerpoint', /(pr[ée]sentation|diapo|slides?\b|\bdeck\b|pitch)/i],
  ['excel', /(tableur|budget|spreadsheet|comptab|factur|tableau de chiffres)/i],
  ['vscode', /(d[ée]velopp|programm|\bcoder\b|\bcode\b|\bbug\b|\bscript\b|site web|website|\bapi\b|\bapp(li(cation)?)?\b|develop)/i],
  ['gmail', /(r[ée]pondre aux? (mails?|e-?mails?)|\bmails?\b|e-?mails?|inbox|bo[îi]te de r[ée]ception)/i],
  ['word', /(rapport|m[ée]moire|dissertation|lettre|\bcv\b|courrier|r[ée]diger|[ée]crire (un|mon|le|la|ma)|\breport\b|\bessay\b|\bletter\b|\bresume\b|write (a|my|the))/i]
];

function detectApp(text) {
  const t = String(text || '');
  for (const [id, re] of EXPLICIT) if (re.test(t)) return id;
  for (const [id, re] of GENERIC) if (re.test(t)) return id;
  return null;
}

function run(cmd, args) {
  return new Promise((resolve) => execFile(cmd, args, { windowsHide: true }, (err) => resolve(!err)));
}
// L'appli est-elle installee ? (raccourcis "App Paths" de Windows, puis le PATH)
async function installed(exe) {
  if (!exe || process.platform !== 'win32') return false;
  for (const hive of ['HKCU', 'HKLM']) {
    if (await run('reg', ['query', `${hive}\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\${exe}.exe`])) return true;
  }
  return run('where', [exe]);
}

// Ouvre l'appli installee, sinon sa version web. Renvoie comment elle a ete ouverte.
async function openApp(id, shell, lang) {
  const app = APPS[id];
  if (!app) return { ok: false, how: 'none' };
  if (app.exe && await installed(app.exe)) {
    const ok = await run('cmd.exe', ['/c', 'start', '""', app.exe]);
    if (ok) return { ok: true, how: 'app', name: app.name };
  }
  // Appli 100 % web (Google Docs…) : rien a signaler ; sinon on precise que c'est la version web.
  // Les outils Google s'ouvrent dans la langue de Nox.
  if (app.web) {
    await shell.openExternal(app.hl && lang ? `${app.web}?hl=${lang}` : app.web);
    return { ok: true, how: app.exe ? 'web' : 'app', name: app.name };
  }
  return { ok: false, how: 'none', name: app.name };
}

module.exports = { APPS, detectApp, openApp };
