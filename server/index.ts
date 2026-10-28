import { createServer, Server } from "node:http";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createApp, query, pool } from "./app";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3001;

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { app, port, start } = createApp();
  const server: Server = createServer(app);

  start().then(() => {
    app.listen(port, () => {
      console.log(`🚀 Server rodando em http://localhost:${port}/`);
    });
  });

  process.on("SIGTERM", () => {
    console.log("🛑 Recebido SIGTERM, encerrando servidor...");
    server.close(() => {
      console.log("✅ Servidor encerrado.");
      process.exit(0);
    });
  });

  process.on("SIGINT", () => {
    console.log("\n🛑 Recebido SIGINT, encerrando servidor...");
    server.close(() => {
      console.log("✅ Servidor encerrado.");
      process.exit(0);
    });
  });
}

export { createApp, query, pool };
