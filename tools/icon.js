// Genere l'icone de l'appli (build/icon.png, 512x512, fond transparent) a partir du dessin de mascot.js.
// Usage : node tools/icon.js
const { _electron: electron } = require('playwright-core');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.join(__dirname, '..');
(async () => {
  const data = fs.mkdtempSync(path.join(os.tmpdir(), 'nox-icon-'));
  const app = await electron.launch({ args: ['--force-device-scale-factor=1', '.'], cwd: ROOT, env: { ...process.env, NOX_FAKE_AI: '1', NOX_USER_DATA: data, REALTIME: 'off' } });
  await app.firstWindow();
  // Carre creme plein (la capture Windows ne garde pas la transparence), sans barres de defilement
  const html = `<!doctype html><style>html,body{margin:0;overflow:hidden;background:radial-gradient(circle at 50% 40%,#FFF6E3,#F3DFB8)}svg{display:block;width:512px;height:512px}
    .eye{fill:#4A9CF0}.eye-line{fill:none;stroke:#4A9CF0;stroke-width:2.6;stroke-linecap:round}.eye-line.thin{stroke-width:1.8}
    .led,.core{fill:#4A9CF0}.shadow,.dots,.wave,.mouth-o,#mouthOpen,g.face{display:none}g.f-focus{display:inline}</style>
    <svg viewBox="4 4 92 92"></svg><script>${fs.readFileSync(path.join(ROOT, 'mascot.js'), 'utf8')};document.querySelector('svg').innerHTML=buildMascot()</script>`;
  const file = path.join(data, 'icon.html');
  fs.writeFileSync(file, html);
  const png = await app.evaluate(async ({ BrowserWindow }, f) => {
    const w = new BrowserWindow({ width: 512, height: 512, show: false, transparent: true, frame: false, useContentSize: true });
    await w.loadFile(f);
    await new Promise((r) => setTimeout(r, 500));
    const img = await w.webContents.capturePage();
    w.destroy();
    return img.resize({ width: 512, height: 512 }).toPNG().toString('base64');
  }, file);
  fs.mkdirSync(path.join(ROOT, 'build'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'build', 'icon.png'), Buffer.from(png, 'base64'));
  await app.close();
  fs.rmSync(data, { recursive: true, force: true });
  console.log('OK build/icon.png');
})().catch((e) => { console.error(e); process.exit(1); });
