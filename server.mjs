import { createServer } from "node:https";
import { readFileSync, existsSync } from "node:fs";
import { parse } from "node:url";
import next from "next";
import { networkInterfaces } from "node:os";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

function getLanIp() {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return "localhost";
}

const certDir = new URL("./certs/", import.meta.url);
const certPath = new URL("cert.pem", certDir);
const keyPath = new URL("key.pem", certDir);

if (!existsSync(certPath) || !existsSync(keyPath)) {
  console.error(
    "\n  Missing HTTPS certificates!\n" +
      "  Run the following to generate them:\n\n" +
      "    brew install mkcert\n" +
      "    mkcert -install\n" +
      `    cd certs && mkcert localhost ${getLanIp()}\n` +
      "    mv localhost+1.pem cert.pem && mv localhost+1-key.pem key.pem\n"
  );
  process.exit(1);
}

const httpsOptions = {
  key: readFileSync(keyPath),
  cert: readFileSync(certPath),
};

const port = parseInt(process.env.PORT || "3000", 10);

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, "0.0.0.0", () => {
    const lanIp = getLanIp();
    console.log(`\n  kzscScanner ready:\n`);
    console.log(`    Local:   https://localhost:${port}`);
    console.log(`    Network: https://${lanIp}:${port}`);
    console.log(`\n  Open the Network URL on your iPhone to scan CDs\n`);
  });
});
