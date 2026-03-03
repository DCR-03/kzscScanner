# kzscScanner

A mobile-first web app that scans CD barcodes with your phone camera, looks up album metadata, and integrates with your self-hosted music stack (Navidrome/Subsonic, Soulseek via slskd). Installable as a PWA on iOS — launches full-screen from your home screen, no App Store needed.

## What it does

1. **Scan** a CD barcode using your phone's camera (or upload a photo of one)
2. **Look up** the album on MusicBrainz (with Discogs as a fallback) — pulls title, artist, year, label, tracklist, and cover art
3. **Search Soulseek** for the album via your slskd instance and queue downloads directly
4. **Trigger a Navidrome/Subsonic library rescan** so the new files appear in your music server
5. **Export to CSV** for CLZ or other cataloging tools
6. **History** of everything you've scanned, stored locally in your browser

## Prerequisites

You need a machine on your local network (Mac, Linux, or Windows with WSL) to run the dev server. Your iPhone connects to it over your LAN.

- **Node.js** >= 18 (recommend latest LTS)
- **npm** (comes with Node)
- **mkcert** — for generating trusted local HTTPS certificates (camera access requires HTTPS)
- **A self-hosted music server** (optional but that's the whole point):
  - [Navidrome](https://www.navidrome.org/) or any Subsonic-compatible server
  - [slskd](https://github.com/slskd/slskd) for Soulseek downloads

## Setup from scratch

### 1. Clone the repo

```bash
git clone https://github.com/DCR-03/kzscScanner.git
cd kzscScanner
```

### 2. Install dependencies

```bash
npm install
```

### 3. Generate PNG icons

The app icon is an SVG in `public/icon.svg`. This renders it into the PNGs needed by the PWA manifest and iOS:

```bash
npm run generate-icons
```

This creates `public/icon-192.png`, `public/icon-512.png`, and `public/apple-touch-icon.png`.

### 4. Set up HTTPS certificates

The phone camera API (`getUserMedia`) only works over HTTPS (or localhost). You'll generate locally-trusted certs with mkcert so Safari on your iPhone trusts the connection.

**Install mkcert** (one-time):

```bash
# macOS
brew install mkcert
mkcert -install

# Linux (Debian/Ubuntu)
sudo apt install libnss3-tools
curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64"
chmod +x mkcert-v*-linux-amd64
sudo mv mkcert-v*-linux-amd64 /usr/local/bin/mkcert
mkcert -install
```

**Find your Mac's LAN IP:**

```bash
# macOS
ipconfig getifaddr en0

# Linux
hostname -I | awk '{print $1}'
```

Take note of the IP (e.g. `192.168.1.42`).

**Generate the certificates:**

```bash
mkdir -p certs
cd certs
mkcert localhost <YOUR_LAN_IP>
# e.g. mkcert localhost 192.168.1.42

# Rename to what the server expects
mv localhost+1.pem cert.pem
mv localhost+1-key.pem key.pem
cd ..
```

**Trust the CA on your iPhone** (required for HTTPS to work without warnings):

1. Find the root CA cert mkcert created:
   ```bash
   mkcert -CAROOT
   # prints something like /Users/you/Library/Application Support/mkcert
   ```
2. Get `rootCA.pem` from that folder onto your iPhone. Easiest ways:
   - AirDrop it to yourself
   - Email it to yourself and open the attachment on iPhone
   - Host it temporarily: `python3 -m http.server 8080` then open `http://<LAN_IP>:8080/rootCA.pem` on iPhone Safari
3. On your iPhone:
   - **Settings → General → VPN & Device Management** — tap the downloaded profile and install it
   - **Settings → General → About → Certificate Trust Settings** — enable full trust for the mkcert root CA

### 5. Start the server

```bash
npm run dev:https
```

You'll see output like:

```
  kzscScanner ready:

    Local:   https://localhost:3000
    Network: https://192.168.1.42:3000

  Open the Network URL on your iPhone to scan CDs
```

### 6. Open on your iPhone

Open Safari and go to `https://<YOUR_LAN_IP>:3000`.

### 7. Install as a PWA (Add to Home Screen)

1. In Safari, tap the **Share** button (box with arrow)
2. Tap **"Add to Home Screen"**
3. The name "kzscScanner" and the app icon will be pre-filled — tap **Add**
4. Open it from your home screen — it launches full-screen with no browser UI

## Configuring services

All service configuration is done inside the app on the **Settings** page (tap the gear icon in the header). Nothing needs to go in `.env` files.

### Navidrome / Subsonic

This lets the app trigger a library rescan after you download new music.

| Field | What to enter |
|-------|---------------|
| **Server URL** | Your Navidrome/Subsonic URL, e.g. `http://192.168.1.42:4533` |
| **Username** | Your Navidrome username |
| **Password** | Your Navidrome password |

The app authenticates using the Subsonic API's token method (MD5 hash — your password is never sent in plain text over the wire).

Use the **"Test Connection"** button to verify.

### slskd (Soulseek)

This lets you search Soulseek and queue downloads from within the app.

| Field | What to enter |
|-------|---------------|
| **slskd URL** | Your slskd instance URL, e.g. `http://192.168.1.42:5030` |
| **API Key** | Your slskd API key |

**Where to find your slskd API key:**

1. Open your slskd web UI
2. Go to **Settings** (or check your `slskd.yml` config file)
3. The API key is under `web.authentication.api_keys` in your slskd config, or you can set one like:
   ```yaml
   # slskd.yml
   web:
     authentication:
       api_keys:
         my-key:
           key: your-api-key-here
           role: readwrite
   ```
4. Restart slskd if you changed the config

Use the **"Test Connection"** button to verify.

### Discogs (optional)

Provides fallback album lookups when MusicBrainz doesn't have a result for a barcode. Works without a token (anonymous), but adding one increases rate limits.

| Field | What to enter |
|-------|---------------|
| **Personal Access Token** | A Discogs API token |

**To get a token:**

1. Go to [discogs.com/settings/developers](https://www.discogs.com/settings/developers)
2. Click **"Generate new token"**
3. Copy the token into the app

### MusicBrainz

No configuration needed — the MusicBrainz API is public. It's the primary source for all barcode lookups.

## Project structure

```
kzscScanner/
├── public/
│   ├── icon.svg              # App icon source
│   ├── icon-192.png          # Generated PWA icon
│   ├── icon-512.png          # Generated PWA icon
│   ├── apple-touch-icon.png  # Generated iOS icon
│   ├── manifest.webmanifest  # PWA manifest
│   └── sw.js                 # Service worker
├── scripts/
│   └── generate-icons.mjs    # SVG → PNG icon generator
├── server.mjs                # HTTPS dev server (wraps Next.js)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── discogs/route.ts
│   │   │   ├── musicbrainz/route.ts
│   │   │   ├── slskd/search/route.ts
│   │   │   ├── slskd/download/route.ts
│   │   │   ├── subsonic/scan/route.ts
│   │   │   └── subsonic/status/route.ts
│   │   ├── history/page.tsx
│   │   ├── settings/page.tsx
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── AlbumActions.tsx
│   │   ├── AlbumResult.tsx
│   │   ├── FileUploadScanner.tsx
│   │   ├── Header.tsx
│   │   ├── Scanner.tsx
│   │   ├── SlskdSearchModal.tsx
│   │   └── TrackList.tsx
│   ├── hooks/
│   │   ├── useAlbumLookup.ts
│   │   ├── useScanHistory.ts
│   │   ├── useScanner.ts
│   │   └── useSettings.ts
│   ├── lib/
│   │   ├── barcode.ts
│   │   ├── csv.ts
│   │   ├── discogs.ts
│   │   ├── musicbrainz.ts
│   │   ├── quagga-config.ts
│   │   ├── rate-limiter.ts
│   │   ├── settings.ts
│   │   ├── slskd.ts
│   │   └── subsonic.ts
│   └── types/
│       ├── discogs.ts
│       ├── index.ts
│       ├── musicbrainz.ts
│       ├── slskd.ts
│       └── subsonic.ts
├── package.json
├── tsconfig.json
├── next.config.ts
└── postcss.config.mjs
```

## npm scripts

| Script | Command | What it does |
|--------|---------|--------------|
| `dev` | `npm run dev` | Standard Next.js dev server (HTTP, localhost only) |
| `dev:https` | `npm run dev:https` | HTTPS server accessible over LAN — **use this one** |
| `build` | `npm run build` | Production build |
| `start` | `npm start` | Production server |
| `generate-icons` | `npm run generate-icons` | Render SVG icon into PNGs |

## Troubleshooting

**Camera doesn't work / "Permission denied"**
- You must use HTTPS. Make sure you're using `npm run dev:https` and accessing via `https://`.
- Make sure the mkcert root CA is trusted on your iPhone (Settings → General → About → Certificate Trust Settings).

**"Add to Home Screen" doesn't show the icon/name**
- Make sure you ran `npm run generate-icons` and the PNGs exist in `public/`.
- Hard-refresh the page in Safari before adding.

**slskd connection fails**
- Make sure slskd is running and accessible from your phone (try opening the slskd URL directly in Safari).
- Check that the API key is correct and has `readwrite` permissions.
- If slskd is on the same machine as the Next.js server, use the machine's LAN IP, not `localhost` (since the API calls are proxied through the Next.js server).

**Subsonic connection fails**
- Same as above — use the LAN IP, not `localhost`.
- Make sure the username/password are correct. The app uses Subsonic API token authentication (v1.16.1).

**LAN IP changed**
- If your Mac gets a new IP (e.g. after a router restart), you'll need to regenerate the HTTPS certs for the new IP and restart the server.
