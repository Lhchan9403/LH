# 🎴 KUJIGACHA · Kuji Club — Demon Slayer Edition

An interactive **Ichiban Kuji / Gacha lottery** web prototype, styled after a Korean kiosk machine and powered up with **Demon Slayer breathing-style effects**.

Built with plain HTML / CSS / JS — no build step, no dependencies. Just open and play.

---

## 🔗 Open it right now

**Permanent link (GitHub Pages — always on, works on any device):**
```
https://lhchan-kuji.github.io/kuji-ui/
```
> Repo: https://github.com/lhchan-kuji/kuji-ui

**Dev link (temporary tunnel, only while the hub runs):**
run `start-kuji-hub.bat` → it prints the current `trycloudflare.com` URL, plus `http://127.0.0.1:8123` on the host itself.

---

## 🎮 What's inside

### 🏠 Home
- **Cinematic hero banner** (MyVideo-style) featuring the hottest box, with breadcrumb, fire glow and a "立即開抽 ◆ START" button
- **Trending poster strip** — swipe through every series
- **Live box list** — kiosk-faithful banner cards with remaining-ticket counts, price badges, and yellow Start buttons

### 🎁 Box page (Ichiban Kuji)
- **Prize lineup** with gold A–F rank badges, per-prize remaining bars, SOLD OUT stamps
- **LAST ONE prize** row + Double Chance entry
- **Draw flow:** pick ticket numbers on the board (or 🎲 Lucky Dip) → payment panel → **tap-to-flip reveal** → results + confetti on rare pulls

### 🎰 Gacha machines
- Capsule machine animation: shake → capsule drop → crack open → SSR/SR/R reveal

### 🎫 Wallet
- Everything you've won, points system, draw history (saved in your browser)

---

## 🔥 The fun part — Demon Slayer effects

- **13 breathing styles trigger randomly on every click:**
  炎 Flame · 日 Sun · 水 Water · 雷 Thunder · 風 Wind · 岩 Stone · 蟲 Insect · 花 Flower · 霞 Mist · 音 Sound · 戀 Love · 蛇 Serpent · 獸 Beast
- Fire tongues, water crescents, lightning bolts, tornado blades, butterflies, petals, mist, music notes, hearts, snakes, saw shards…
- **Cursor trail** — your mouse leaves breathing-style particles (style rotates every few seconds)
- **Kanji flashes** — 「炎ノ呼吸」「大当たり！」on payments and rare pulls
- **Sound effects** — WebAudio blips, win chimes, rare fanfare (toggle in Settings)
- Ambient floating glow motes + animated water waves (Infinity Castle poster vibe)

### 📖✨ Two themes
Use the top-bar button or ⚙ Settings:
- **✨ Anime Dark** — Infinity Castle: deep navy, fire glow, water waves
- **📖 Manga Ink** — hand-drawn comic: paper, ink borders, halftone, "残り少！" bursts

---

## ⚙️ Settings (top-right ⚙ button)

| Setting | Options |
|---|---|
| Theme | Anime Dark / Manga Ink |
| Effects | Full / Lite / Off |
| Sound | On / Muted |
| Motion | Standard / Reduced |

☰ Menu: Home · Gacha · Wallet · How to Play · Settings · Reset demo

---

## 🖥️ Run it yourself (Windows)

1. Double-click **`start-kuji-hub.bat`**
   - Starts the local server (`http://127.0.0.1:8123`)
   - Starts the public tunnel and prints your share link
2. Double-click **`stop-kuji-hub.bat`** to shut everything down

> The public URL changes every time the tunnel restarts — send friends the new link each time.

### File map
```
kuji-redesign/
├─ index.html      → page shell
├─ styles.css      → all themes (anime + manga)
├─ app.js          → app logic + FX engine + sound
├─ data.js         → live data snapshot (8 boxes)
├─ assets/         → series artwork (SVG)
├─ start-kuji-hub.bat / stop-kuji-hub.bat
```

---

## 📝 Notes

- Demo project — no real payments; data is a snapshot from a test environment
- Works on desktop and mobile (bottom tab bar on phones)
- Currency shown in SGD
