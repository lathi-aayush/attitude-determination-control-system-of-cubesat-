/**
 * AarambhSat ADCS – Backend Server
 *
 * - Serves the web UI (static files from ../web)
 * - WebSocket server for browser clients (telemetry down, commands up)
 * - Connects to Arduino via Bluetooth serial (COM port)
 * - Parses telemetry lines (key:value) and forwards as JSON to all clients
 * - Forwards commands from browser to serial (one line per send)
 * - Connection status and optional anti-flood
 */

const http = require('http');
const path = require('path');
const fs = require('fs');
const express = require('express');
const { WebSocketServer } = require('ws');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

// ----- Configuration -----
const HTTP_PORT = process.env.PORT || 3080;
const SERIAL_BAUD = 9600;
const SERIAL_PORT_PATH = process.env.SERIAL_PORT || null; // e.g. 'COM3' on Windows, '/dev/ttyHC-05' on Linux
const WEB_ROOT = path.join(__dirname, '..', 'web');
const CMD_RATE_LIMIT_MS = 500; // Min time between commands (anti-flood)

const app = express();
app.use(express.static(WEB_ROOT));
app.use(express.json());

const server = http.createServer(app);

// ----- State -----
let serialPort = null;
let lastCommandTime = 0;
const telemetry = { angle: 0, mode: 'command', status: 'ok', step: 0, cmd: '' };

// ----- WebSocket -----
const wss = new WebSocketServer({ server, path: '/ws' });

function broadcast(obj) {
  const msg = JSON.stringify(obj);
  wss.clients.forEach((client) => {
    if (client.readyState === 1) client.send(msg);
  });
}

function sendConnectionStatus(connected, errorMessage = null) {
  broadcast({
    type: 'connection',
    serialConnected: connected,
    error: errorMessage || undefined,
  });
}

// ----- Serial: open and read -----
function openSerial(portPath) {
  if (serialPort && serialPort.isOpen) {
    try { serialPort.close(); } catch (_) {}
    serialPort = null;
  }

  return new Promise((resolve, reject) => {
    const port = new SerialPort(
      { path: portPath, baudRate: SERIAL_BAUD, autoOpen: false },
      (err) => (err ? reject(err) : resolve(port))
    );

    port.open((err) => {
      if (err) {
        reject(err);
        return;
      }
      sendConnectionStatus(true);

      // Line-based parser: one line = one telemetry message
      const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));
      parser.on('data', (line) => {
        const s = String(line).replace(/\r$/, '').trim();
        const idx = s.indexOf(':');
        if (idx >= 0) {
          const key = s.slice(0, idx).trim();
          const value = s.slice(idx + 1).trim();
          if (key === 'angle') telemetry.angle = parseInt(value, 10) || 0;
          else if (key === 'mode') telemetry.mode = value;
          else if (key === 'status') telemetry.status = value;
          else if (key === 'step') telemetry.step = parseInt(value, 10) || 0;
          else if (key === 'cmd') telemetry.cmd = value;
          else if (key === 'error') telemetry.error = value;
          broadcast({ type: 'telemetry', ...telemetry });
        }
      });

      port.on('close', () => {
        sendConnectionStatus(false, 'Serial port closed');
      });
      port.on('error', (err) => {
        sendConnectionStatus(false, err.message || 'Serial error');
      });

      serialPort = port;
      resolve(port);
    });
  });
}

// ----- Send command to Arduino -----
function sendCommand(payload) {
  const now = Date.now();
  if (now - lastCommandTime < CMD_RATE_LIMIT_MS) {
    return { ok: false, error: 'Rate limit; wait a moment.' };
  }
  if (!serialPort || !serialPort.isOpen) {
    return { ok: false, error: 'Serial not connected.' };
  }
  const line = (typeof payload === 'string' ? payload : (payload.payload || '')).trim();
  if (!line) return { ok: false, error: 'Empty command.' };
  try {
    serialPort.write(line + '\n', (err) => {
      if (err) broadcast({ type: 'connection', serialConnected: false, error: err.message });
    });
    lastCommandTime = now;
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// ----- HTTP: list serial ports (for UI "Connect" flow) -----
app.get('/api/ports', async (_req, res) => {
  try {
    const list = await SerialPort.list();
    res.json(list.map((p) => ({ path: p.path, manufacturer: p.manufacturer || '' })));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ----- HTTP: connect to a serial port -----
app.post('/api/connect', express.json(), async (req, res) => {
  const portPath = (req.body && req.body.port) || SERIAL_PORT_PATH;
  if (!portPath) {
    return res.status(400).json({ error: 'Port not specified. Set body.port or SERIAL_PORT.' });
  }
  try {
    await openSerial(portPath);
    res.json({ ok: true, port: portPath });
  } catch (e) {
    sendConnectionStatus(false, e.message);
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ----- HTTP: disconnect -----
app.post('/api/disconnect', (_req, res) => {
  if (serialPort && serialPort.isOpen) {
    serialPort.close();
    serialPort = null;
  }
  sendConnectionStatus(false);
  res.json({ ok: true });
});

// ----- WebSocket: handle client -----
wss.on('connection', (ws) => {
  // Send current connection status and latest telemetry
  ws.send(JSON.stringify({
    type: 'connection',
    serialConnected: !!(serialPort && serialPort.isOpen),
  }));
  ws.send(JSON.stringify({ type: 'telemetry', ...telemetry }));

  ws.on('message', (data) => {
    let payload;
    try {
      payload = typeof data === 'string' ? JSON.parse(data) : { payload: String(data) };
    } catch (_) {
      payload = { payload: String(data) };
    }
    const cmd = payload.payload || payload.command || (typeof payload === 'string' ? payload : '');
    if (!cmd) return;
    const result = sendCommand(cmd);
    if (!result.ok && ws.readyState === 1) {
      ws.send(JSON.stringify({ type: 'error', message: result.error }));
    }
  });
});

// ----- Start server -----
server.listen(HTTP_PORT, () => {
  console.log(`AarambhSat ADCS backend: http://localhost:${HTTP_PORT}`);
  console.log('WebSocket: ws://localhost:' + HTTP_PORT + '/ws');
  if (SERIAL_PORT_PATH) {
    openSerial(SERIAL_PORT_PATH).then(
      () => console.log('Serial connected to', SERIAL_PORT_PATH),
      (e) => console.warn('Serial auto-connect failed:', e.message)
    );
  } else {
    console.log('Set SERIAL_PORT (or use /api/connect with body.port) to connect to Arduino.');
    sendConnectionStatus(false);
  }
});
