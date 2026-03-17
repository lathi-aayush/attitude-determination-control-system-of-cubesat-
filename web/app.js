/**
 * AarambhSat ADCS – Web UI
 * Connects to backend via WebSocket; displays telemetry and sends commands.
 */

const WS_URL = (() => {
  const u = new URL(window.location.href);
  u.protocol = u.protocol === 'https:' ? 'wss:' : 'ws:';
  u.pathname = '/ws';
  return u.toString();
})();

const API_BASE = window.location.origin;

let ws = null;
let reconnectTimer = null;
let currentSequence = [];
let currentStep = 0;

// ----- DOM -----
const portSelect = document.getElementById('portSelect');
const btnRefreshPorts = document.getElementById('btnRefreshPorts');
const btnConnect = document.getElementById('btnConnect');
const btnDisconnect = document.getElementById('btnDisconnect');
const connectionStatus = document.getElementById('connectionStatus');
const wsStatus = document.getElementById('wsStatus');
const angleEl = document.getElementById('angle');
const modeEl = document.getElementById('mode');
const systemStatusEl = document.getElementById('systemStatus');
const commandInput = document.getElementById('commandInput');
const btnSend = document.getElementById('btnSend');
const btnStop = document.getElementById('btnStop');
const sequenceSummary = document.getElementById('sequenceSummary');
const sequenceList = document.getElementById('sequenceList');
const executingStep = document.getElementById('executingStep');

// ----- Port list -----
async function refreshPorts() {
  try {
    const res = await fetch(API_BASE + '/api/ports');
    const list = await res.json();
    const selected = portSelect.value;
    portSelect.innerHTML = '<option value="">Select port…</option>';
    list.forEach((p) => {
      const opt = document.createElement('option');
      opt.value = p.path;
      opt.textContent = p.path + (p.manufacturer ? ' (' + p.manufacturer + ')' : '');
      portSelect.appendChild(opt);
    });
    if (selected) portSelect.value = selected;
  } catch (e) {
    connectionStatus.textContent = 'Error listing ports: ' + e.message;
    connectionStatus.className = 'status error';
  }
}

async function connectSerial() {
  const port = portSelect.value?.trim();
  if (!port) {
    connectionStatus.textContent = 'Select a port first.';
    connectionStatus.className = 'status error';
    return;
  }
  connectionStatus.textContent = 'Connecting…';
  connectionStatus.className = 'status connecting';
  try {
    const res = await fetch(API_BASE + '/api/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ port }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Connect failed');
    connectionStatus.textContent = 'Connected to ' + port;
    connectionStatus.className = 'status connected';
  } catch (e) {
    connectionStatus.textContent = 'Error: ' + e.message;
    connectionStatus.className = 'status error';
  }
}

async function disconnectSerial() {
  try {
    await fetch(API_BASE + '/api/disconnect', { method: 'POST' });
    connectionStatus.textContent = 'Disconnected';
    connectionStatus.className = 'status';
  } catch (_) {}
}

// ----- WebSocket -----
function connectWs() {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;
  ws = new WebSocket(WS_URL);
  wsStatus.textContent = 'Connecting…';

  ws.onopen = () => {
    wsStatus.textContent = 'Connected';
    if (reconnectTimer) clearTimeout(reconnectTimer);
    reconnectTimer = null;
  };

  ws.onmessage = (ev) => {
    try {
      const data = JSON.parse(ev.data);
      if (data.type === 'connection') {
        if (data.serialConnected !== undefined) {
          connectionStatus.textContent = data.serialConnected ? 'Serial connected' : (data.error || 'Serial disconnected');
          connectionStatus.className = 'status ' + (data.serialConnected ? 'connected' : (data.error ? 'error' : ''));
        }
      } else if (data.type === 'telemetry') {
        if (data.angle !== undefined) angleEl.textContent = data.angle + '°';
        if (data.mode !== undefined) modeEl.textContent = data.mode;
        if (data.status !== undefined) systemStatusEl.textContent = data.status;
        if (data.step !== undefined) {
          currentStep = data.step;
          renderSequence();
        }
        if (data.cmd !== undefined && data.step !== undefined) {
          executingStep.textContent = data.step ? 'Executing: Step ' + data.step + ' — ' + (data.cmd || '') : '';
        }
      } else if (data.type === 'error') {
        systemStatusEl.textContent = 'Error: ' + (data.message || 'Unknown');
      }
    } catch (_) {}
  };

  ws.onclose = () => {
    wsStatus.textContent = 'Disconnected';
    ws = null;
    if (!reconnectTimer) reconnectTimer = setTimeout(connectWs, 3000);
  };

  ws.onerror = () => {
    wsStatus.textContent = 'Error';
  };
}

function sendCommand(cmd) {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    systemStatusEl.textContent = 'Not connected';
    return;
  }
  const payload = typeof cmd === 'string' ? cmd : (cmd.payload || cmd.command || '');
  if (!payload.trim()) return;
  ws.send(JSON.stringify({ type: 'command', payload: payload.trim() }));
  const parts = payload.split(',').map((s) => s.trim()).filter(Boolean);
  currentSequence = parts;
  currentStep = 0;
  renderSequence();
}

function renderSequence() {
  if (currentSequence.length === 0) {
    sequenceSummary.textContent = 'No sequence running.';
    sequenceList.innerHTML = '';
    executingStep.textContent = '';
    return;
  }
  sequenceSummary.textContent = 'Current sequence:';
  sequenceList.innerHTML = currentSequence
    .map((c, i) => {
      const active = i + 1 === currentStep;
      return '<li class="' + (active ? 'active' : '') + '">' + (i + 1) + ' ' + c + '</li>';
    })
    .join('');
}

// ----- Buttons -----
btnRefreshPorts.addEventListener('click', refreshPorts);
btnConnect.addEventListener('click', connectSerial);
btnDisconnect.addEventListener('click', disconnectSerial);
btnSend.addEventListener('click', () => sendCommand(commandInput.value));
btnStop.addEventListener('click', () => sendCommand('stop'));

commandInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendCommand(commandInput.value);
});

// ----- Init -----
refreshPorts();
connectWs();
setInterval(() => {
  if (ws && ws.readyState !== WebSocket.OPEN) connectWs();
}, 5000);
