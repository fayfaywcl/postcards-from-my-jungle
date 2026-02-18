const http = require("http");
const fs = require("fs");
const path = require("path");

const rootDir = __dirname;
const port = 5173;

function loadApiKey() {
  try {
    const envPath = path.join(rootDir, ".env");
    const content = fs.readFileSync(envPath, "utf8");
    const line = content
      .split(/\r?\n/)
      .find((entry) => entry.startsWith("OPENAI_API_KEY="));
    if (!line) return "";
    return line.split("=").slice(1).join("=").trim();
  } catch (error) {
    return "";
  }
}

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".wav": "audio/wav",
};

function serveFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
    res.end(data);
  });
}

async function handleAnimal(req, res) {
  const apiKey = loadApiKey();
  if (!apiKey) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Missing OPENAI_API_KEY in .env" }));
    return;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1",
        input: [
          {
            role: "system",
            content:
              "You generate 3-5 word fictional animal language phrases. Use soft, lo-fi jungle rhythm, no punctuation.",
          },
          {
            role: "user",
            content: "Generate one 3-5 word phrase for a mythical jungle animal call.",
          },
        ],
        max_output_tokens: 12,
      }),
    });

    if (!response.ok) {
      throw new Error("OpenAI API error");
    }

    const data = await response.json();
    const text = data.output?.[0]?.content?.[0]?.text?.trim() || "";
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ text }));
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Failed to generate text" }));
  }
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname === "/api/animal" && req.method === "POST") {
    handleAnimal(req, res);
    return;
  }

  const safePath = path.normalize(url.pathname).replace(/^(\.\.[/\\])+/, "");
  const filePath =
    safePath === "/" ? path.join(rootDir, "index.html") : path.join(rootDir, safePath);

  serveFile(res, filePath);
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
