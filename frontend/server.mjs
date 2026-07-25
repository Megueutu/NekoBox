import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("./dist/", import.meta.url));
const port = Number(process.env.PORT || 8080);
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  const relativePath = normalize(pathname).replace(/^(\.\.(\/|\\|$))+/, "").replace(/^[/\\]+/, "");
  const requestedFile = join(root, relativePath);
  const filePath = existsSync(requestedFile) && statSync(requestedFile).isFile()
    ? requestedFile
    : join(root, "index.html");
  const extension = extname(filePath);

  response.setHeader("Content-Type", mimeTypes[extension] || "application/octet-stream");
  response.setHeader(
    "Cache-Control",
    extension === ".html" ? "no-cache" : "public, max-age=31536000, immutable",
  );
  createReadStream(filePath)
    .on("error", () => {
      response.statusCode = 500;
      response.end("Falha ao carregar a aplicação.");
    })
    .pipe(response);
}).listen(port, "0.0.0.0", () => {
  console.log(`NekoBox frontend disponível na porta ${port}.`);
});
