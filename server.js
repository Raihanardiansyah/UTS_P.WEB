// server.js - WebSocket Server untuk Simulasi Sensor Suhu Real-Time
// Jalankan: node server.js
// Requires: npm install ws

const WebSocket = require('ws');
const http = require('http');

const PORT = 8080;

// Buat HTTP server biasa
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('WebSocket Server aktif. Buka index.html di browser.\n');
});

// Buat WebSocket server di atas HTTP server
const wss = new WebSocket.Server({ server });

// State simulasi sensor
let sensorState = {
  suhu: 25.0,
  kelembaban: 60.0,
  tekanan: 1013.25,
};

// Fungsi untuk menghasilkan perubahan data sensor yang realistis
function simulateSensorData() {
  // Suhu berfluktuasi ±0.5°C per tick
  sensorState.suhu += (Math.random() - 0.5) * 1.0;
  sensorState.suhu = Math.max(15, Math.min(45, sensorState.suhu)); // clamp 15–45°C

  // Kelembaban berfluktuasi ±1% per tick
  sensorState.kelembaban += (Math.random() - 0.5) * 2.0;
  sensorState.kelembaban = Math.max(30, Math.min(90, sensorState.kelembaban));

  // Tekanan udara berfluktuasi kecil
  sensorState.tekanan += (Math.random() - 0.5) * 0.5;
  sensorState.tekanan = Math.max(995, Math.min(1030, sensorState.tekanan));

  return {
    timestamp: new Date().toISOString(),
    suhu: parseFloat(sensorState.suhu.toFixed(2)),
    kelembaban: parseFloat(sensorState.kelembaban.toFixed(2)),
    tekanan: parseFloat(sensorState.tekanan.toFixed(2)),
    status: sensorState.suhu > 38 ? 'BAHAYA' : sensorState.suhu > 32 ? 'PERINGATAN' : 'NORMAL',
  };
}

// Tracking koneksi klien
let clientCount = 0;

wss.on('connection', (ws, req) => {
  clientCount++;
  const clientId = clientCount;
  console.log(`[+] Klien #${clientId} terhubung. Total aktif: ${wss.clients.size}`);

  // Kirim pesan selamat datang
  ws.send(JSON.stringify({
    type: 'welcome',
    message: `Selamat datang, Klien #${clientId}! Anda terhubung ke sensor real-time.`,
    clientId,
  }));

  // Broadcast data sensor ke semua klien setiap 1 detik
  const interval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      const data = simulateSensorData();
      ws.send(JSON.stringify({ type: 'sensor_data', ...data }));
    }
  }, 1000);

  // Handle pesan dari klien
  ws.on('message', (message) => {
    try {
      const parsed = JSON.parse(message);
      console.log(`[Klien #${clientId}] Pesan masuk:`, parsed);

      // Klien bisa request reset simulasi
      if (parsed.action === 'reset') {
        sensorState = { suhu: 25.0, kelembaban: 60.0, tekanan: 1013.25 };
        ws.send(JSON.stringify({ type: 'info', message: 'Sensor direset ke kondisi awal.' }));
      }
    } catch (e) {
      console.error('Pesan tidak valid dari klien:', e.message);
    }
  });

  // Handle disconnect
  ws.on('close', () => {
    clearInterval(interval);
    console.log(`[-] Klien #${clientId} terputus. Total aktif: ${wss.clients.size}`);
  });

  ws.on('error', (err) => {
    console.error(`[Error] Klien #${clientId}:`, err.message);
    clearInterval(interval);
  });
});

server.listen(PORT, () => {
  console.log(`✅ WebSocket Server berjalan di ws://localhost:${PORT}`);
  console.log(`📡 Menunggu koneksi klien...`);
});