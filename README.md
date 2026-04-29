# UTS_P.WEB

# WebSocket Live Sensor Dashboard

Eksperimen implementasi protokol **WebSocket** menggunakan Node.js sebagai server dan HTML/JavaScript murni sebagai klien. Dashboard menampilkan data simulasi sensor lingkungan (suhu, kelembaban, tekanan udara) secara real-time tanpa polling HTTP.

> Dibuat sebagai bagian dari tugas UTS Pemrograman Web — artikel dipublikasikan di [Kompasiana](#).

---

## Tampilan Dashboard

Dashboard menampilkan tiga metrik sensor secara live, grafik suhu real-time (50 titik terakhir), status sistem, dan log koneksi WebSocket.

---

## Teknologi

| Komponen | Teknologi |
|----------|-----------|
| Server | Node.js + library `ws` |
| Klien | HTML / CSS / JavaScript (Vanilla) |
| Protokol | WebSocket (RFC 6455) |
| Visualisasi | Canvas API (grafik garis) |

---

## Struktur File

```
websocket-sensor-dashboard/
├── server.js       # WebSocket server (Node.js) — simulasi data sensor
├── index.html      # Dashboard klien berbasis browser
├── package.json    # Konfigurasi dependensi Node.js
└── README.md       # Dokumentasi proyek
```

---

## Cara Menjalankan

### Prasyarat
- [Node.js](https://nodejs.org/) versi 14 ke atas
- npm (sudah termasuk dalam instalasi Node.js)

### Langkah-langkah

**1. Clone repository**
```bash
git clone https://github.com/USERNAME/websocket-sensor-dashboard.git
cd websocket-sensor-dashboard
```

**2. Install dependensi**
```bash
npm install ws
```

**3. Jalankan WebSocket server** (Terminal 1 — jangan ditutup)
```bash
node server.js
```

Output yang muncul:
```
✅ WebSocket Server berjalan di ws://localhost:8080
📡 Menunggu koneksi klien...
```

**4. Jalankan HTTP server** (Terminal 2)
```bash
npx serve .
```

**5. Buka di browser**
```
http://localhost:3000
```

---

## Cara Kerja

```
Browser (Klien)                    Node.js (Server)
      |                                  |
      |--- HTTP Upgrade Request -------->|
      |<-- 101 Switching Protocols ------|
      |                                  |
      |<-- sensor data (tiap 1 detik) ---|  ← server push, tanpa polling
      |<-- sensor data ------------------|
      |                                  |
      |--- { action: "reset" } -------->|  ← klien bisa kirim balik
      |<-- { type: "info", ... } --------|
```

Setelah handshake awal, koneksi TCP tetap terbuka. Server mendorong data sensor ke semua klien yang terhubung setiap 1 detik menggunakan `setInterval()`. Klien juga dapat mengirimkan perintah kembali ke server (komunikasi dua arah / bidirectional).

---

## Data Sensor yang Disimulasikan

| Parameter | Satuan | Rentang | Status |
|-----------|--------|---------|--------|
| Suhu | °Celsius | 15 – 45 | NORMAL / PERINGATAN / BAHAYA |
| Kelembaban | % RH | 30 – 90 | — |
| Tekanan Udara | hPa | 995 – 1030 | — |

Status sistem:
- `NORMAL` — suhu ≤ 32°C
- `PERINGATAN` — suhu 32°C – 38°C  
- `BAHAYA` — suhu > 38°C

---

## Catatan

- Eksperimen ini menggunakan `ws://` (tidak terenkripsi) untuk lingkungan lokal. Untuk produksi, gunakan `wss://` (WebSocket Secure) di atas TLS/SSL.
- Jika browser menolak koneksi, nonaktifkan flag `block-insecure-private-network-requests` di `chrome://flags`.

---
