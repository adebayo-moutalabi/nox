// Voix temps reel : session OpenAI Realtime en WebRTC.
// Le micro part directement vers OpenAI, la voix revient en flux audio,
// et les evenements (sous-titres, appels d'outils) passent par le canal "oai-events".
// Le renderer branche ses reactions via Realtime.on = { ... }.
const Realtime = {
  pc: null, dc: null, mic: null, el: null, stream: null,
  open: false, caption: '', lastUserText: '',
  on: {}, // listening, thinking, caption, speakingStart, speakingStop, userText, tool, error, closed

  async connect() {
    const tok = await window.nox.realtimeToken();
    if (!tok || tok.error || !tok.value) throw new Error(tok?.error || 'jeton temps reel indisponible');

    const pc = new RTCPeerConnection();
    this.pc = pc;
    // Voix de Nox : l'element audio la joue, le renderer la mesure pour la bouche
    this.el = new Audio();
    this.el.autoplay = true;
    pc.ontrack = (e) => { this.stream = e.streams[0]; this.el.srcObject = this.stream; this.on.stream?.(this.stream); };

    this.mic = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    pc.addTrack(this.mic.getTracks()[0]);

    const dc = pc.createDataChannel('oai-events');
    this.dc = dc;
    dc.onmessage = (e) => { try { this.handle(JSON.parse(e.data)); } catch (err) { console.error(err); } };
    const ready = new Promise((resolve, reject) => {
      dc.onopen = resolve;
      setTimeout(() => reject(new Error('connexion temps reel trop longue')), 10000);
    });
    ready.catch(() => {}); // evite un rejet non gere si on echoue avant de l'attendre

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    const res = await fetch('https://api.openai.com/v1/realtime/calls', {
      method: 'POST', body: offer.sdp,
      headers: { Authorization: `Bearer ${tok.value}`, 'Content-Type': 'application/sdp' }
    });
    if (!res.ok) throw new Error(`Realtime ${res.status}: ${await res.text()}`);
    await pc.setRemoteDescription({ type: 'answer', sdp: await res.text() });
    await ready;

    pc.onconnectionstatechange = () => { if (['failed', 'closed', 'disconnected'].includes(pc.connectionState)) this.close(); };
    dc.onclose = () => this.close();
    this.open = true;
    window.nox.setRealtimeActive(true);
  },

  close() {
    if (!this.pc) return;
    const wasOpen = this.open;
    this.open = false;
    window.nox.setRealtimeActive(false);
    try { this.dc?.close(); } catch {}
    try { this.pc.close(); } catch {}
    this.mic?.getTracks().forEach((t) => t.stop());
    if (this.el) this.el.srcObject = null;
    this.pc = this.dc = this.mic = this.stream = null;
    if (wasOpen) this.on.closed?.();
  },

  send(evt) { if (this.dc?.readyState === 'open') this.dc.send(JSON.stringify(evt)); },

  // Evenement systeme (absence, decrochage, minuteur...) : elle reagit a voix haute
  inject(text) {
    this.send({ type: 'conversation.item.create', item: { type: 'message', role: 'system', content: [{ type: 'input_text', text }] } });
    this.send({ type: 'response.create' });
  },

  // Message ecrit dans le champ de saisie
  sendText(text) {
    this.lastUserText = text;
    this.send({ type: 'conversation.item.create', item: { type: 'message', role: 'user', content: [{ type: 'input_text', text }] } });
    this.send({ type: 'response.create' });
  },

  async refreshInstructions() {
    this.send({ type: 'session.update', session: { type: 'realtime', instructions: await window.nox.realtimeInstructions() } });
  },

  async handle(e) {
    switch (e.type) {
      case 'input_audio_buffer.speech_started': this.on.listening?.(); break; // coupe la parole : le serveur tronque sa voix
      case 'input_audio_buffer.speech_stopped': this.on.thinking?.(); break;
      case 'conversation.item.input_audio_transcription.completed':
        this.lastUserText = e.transcript || '';
        this.on.userText?.(this.lastUserText);
        break;
      case 'response.created': this.caption = ''; break;
      case 'response.output_audio_transcript.delta':
        this.caption += e.delta || '';
        this.on.caption?.(this.caption);
        break;
      case 'response.output_audio_transcript.done':
        window.nox.remember('assistant', e.transcript || this.caption);
        break;
      case 'output_audio_buffer.started': this.on.speakingStart?.(); break;
      case 'output_audio_buffer.stopped': case 'output_audio_buffer.cleared': this.on.speakingStop?.(); break;
      case 'response.done': {
        const calls = (e.response?.output || []).filter((o) => o.type === 'function_call');
        if (!calls.length) break;
        for (const c of calls) {
          let args = {};
          try { args = JSON.parse(c.arguments || '{}'); } catch {}
          const result = await this.on.tool?.(c.name, args, this.lastUserText);
          this.send({ type: 'conversation.item.create', item: { type: 'function_call_output', call_id: c.call_id, output: JSON.stringify(result ?? { ok: true }) } });
        }
        await this.refreshInstructions(); // la tache a pu changer
        this.send({ type: 'response.create' });
        break;
      }
      case 'error': console.error('Realtime', e.error); this.on.error?.(e.error?.message || 'erreur temps reel'); break;
    }
  }
};
