// Connexions de Nox : Google Agenda (lien iCal secret), Gmail (IMAP + mot de passe
// d'application) et Telegram (bot appaire par QR code). Chaque connexion est optionnelle
// et ne tourne que si l'utilisateur l'a configuree dans le tableau de bord.
// Les contenus externes (agenda, mails, messages) sont des donnees, jamais des consignes.
const { ImapFlow } = require('imapflow');
const QRCode = require('qrcode');

// ---------- Google Agenda (format iCal) ----------
// Lit les evenements simples (sans regle de repetition) a partir de l'"adresse secrete
// au format iCal" de Google Agenda : aucun compte Google a configurer.
function parseIcsDate(v, params = '') {
  const m = v.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?/);
  if (!m) return null;
  const [, y, mo, d, h = '00', mi = '00', s = '00', z] = m;
  const allDay = !m[4] || /VALUE=DATE(?!-)/.test(params);
  if (z) return { at: Date.UTC(+y, +mo - 1, +d, +h, +mi, +s), allDay: false };
  return { at: new Date(+y, +mo - 1, +d, +h, +mi, +s).getTime(), allDay }; // TZID : heure locale du PC
}
function parseIcs(text) {
  const lines = text.replace(/\r?\n[ \t]/g, '').split(/\r?\n/);
  const events = [];
  let ev = null;
  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') ev = {};
    else if (line === 'END:VEVENT') { if (ev?.start) events.push(ev); ev = null; }
    else if (ev) {
      const i = line.indexOf(':'); if (i < 0) continue;
      const [name, ...params] = line.slice(0, i).split(';');
      const value = line.slice(i + 1);
      if (name === 'SUMMARY') ev.title = value.replace(/\\([,;\\])/g, '$1').replace(/\\n/gi, ' ').slice(0, 140);
      if (name === 'UID') ev.uid = value;
      if (name === 'LOCATION') ev.location = value.replace(/\\([,;\\])/g, '$1').slice(0, 120);
      if (name === 'DTSTART') { const d = parseIcsDate(value, params.join(';')); if (d) { ev.start = d.at; ev.allDay = d.allDay; } }
      if (name === 'RRULE') ev.recurring = true;
    }
  }
  return events;
}

async function fetchCalendar(url) {
  const res = await fetch(url.replace(/^webcal:/, 'https:'));
  if (!res.ok) throw new Error(`Agenda ${res.status}`);
  return parseIcs(await res.text());
}

// Evenements a venir dans les prochaines `hours` heures
function upcoming(events, now = Date.now(), hours = 24) {
  return events.filter((e) => !e.recurring && e.start >= now - 60000 && e.start <= now + hours * 3600000)
    .sort((a, b) => a.start - b.start);
}

// ---------- Gmail (IMAP) ----------
function textFromSource(src) {
  let s = src.toString('utf8');
  const cut = s.indexOf('\r\n\r\n'); if (cut > 0) s = s.slice(cut + 4);
  s = s.replace(/=\r?\n/g, '').replace(/=([0-9A-F]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
  s = s.replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
  s = s.replace(/^--.*$/gm, ' ').replace(/^Content-[\w-]+:.*$/gim, ' ').replace(/\s+/g, ' ').trim();
  try { s = Buffer.from(s, 'latin1').toString('utf8'); } catch {}
  return s.slice(0, 1500);
}

// Nouveaux mails depuis lastUid (le premier passage ne fait que memoriser la position)
async function fetchNewMail({ user, pass, lastUid }) {
  const client = new ImapFlow({ host: 'imap.gmail.com', port: 993, secure: true, auth: { user, pass }, logger: false });
  await client.connect();
  const out = [];
  let uidNext;
  try {
    const box = await client.mailboxOpen('INBOX', { readOnly: true });
    uidNext = box.uidNext;
    if (lastUid && uidNext - 1 > lastUid) {
      const from = Math.max(lastUid + 1, uidNext - 10); // au plus 10 mails par passage
      for await (const m of client.fetch(`${from}:*`, { uid: true, envelope: true, source: { maxLength: 30000 } }, { uid: true })) {
        if (m.uid <= lastUid) continue;
        const f = m.envelope.from?.[0] || {};
        out.push({ id: String(m.uid), from: f.name ? `${f.name} <${f.address}>` : f.address || 'inconnu', subject: (m.envelope.subject || '(sans objet)').slice(0, 160),
          date: m.envelope.date ? new Date(m.envelope.date).getTime() : Date.now(), text: m.source ? textFromSource(m.source) : '' });
      }
    }
  } finally { await client.logout().catch(() => {}); }
  return { mails: out, lastUid: (uidNext || 1) - 1 };
}

// "Previens-moi si je recois un mail de Marie" : tous les mots de la demande dans l'expediteur ou l'objet
function matchWatch(watch, mail) {
  const hay = `${mail.from} ${mail.subject}`.toLowerCase();
  const words = watch.query.toLowerCase().split(/\s+/).filter((w) => w.length > 2 && !['mail', 'email', 'de', 'des', 'du', 'la', 'le', 'les', 'une', 'qui', 'pour'].includes(w));
  return words.length > 0 && words.every((w) => hay.includes(w));
}
// Heuristique sans IA (mode demo) : mots qui signalent souvent un mail a ne pas rater
const URGENT = /(urgent|important|rappel|relance|échéance|echeance|facture|paiement|rendez-vous|rdv|entretien|convocation|délai|delai|impots|impôts|caf|ameli|urssaf)/i;
function looksImportant(mail) { return URGENT.test(`${mail.subject} ${mail.text.slice(0, 300)}`); }

// ---------- Telegram ----------
async function tg(token, method, params = {}) {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(params)
  });
  const data = await res.json();
  if (!data.ok) throw new Error(`Telegram : ${data.description || res.status}`);
  return data.result;
}
function pairingQr(botName, code) {
  const url = `https://t.me/${botName}?start=${code}`;
  return QRCode.toDataURL(url, { margin: 1, width: 360, color: { dark: '#2A2118', light: '#FFFAF2' } }).then((qr) => ({ url, qr }));
}

module.exports = { parseIcs, fetchCalendar, upcoming, fetchNewMail, matchWatch, looksImportant, tg, pairingQr };
