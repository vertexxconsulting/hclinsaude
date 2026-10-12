import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { google } from "googleapis";
import { GoogleAuth } from "google-auth-library";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serviço de leitura da Google Sheet
class SheetsReader {
  private auth: GoogleAuth;

  constructor() {
    const keyFile = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (!keyFile) {
      throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON não definida");
    }
    this.auth = new GoogleAuth({
      credentials: JSON.parse(keyFile),
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });
  }

  async getTestimonials() {
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    if (!spreadsheetId) {
      throw new Error("GOOGLE_SPREADSHEET_ID não definida");
    }
    const authClient = await this.auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: authClient as any });

    const range = "Depoimentos!A1:H100";
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values || [];
    // Header: ID, Posicao, Depoimento, Categoria, Autor, Data, Publicado, Status
    const testimonials = rows
      .filter((row) => row[2] && row[2].trim()) // só com depoimento
      .map((row, index) => ({
        id: row[0] ? String(row[0]) : index + 1,
        position: row[1] ? Number(row[1]) : index + 1,
        text: row[2],
        category: row[3] || "",
        author: row[4] || "",
        date: row[5] || "",
        published: row[6] === "TRUE" || row[6] === "true" || row[6] === true,
        status: row[7] || "pendente",
      }))
      .filter((t) => t.status !== "rejeitado") // só aceitos e pendentes
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

    return testimonials;
  }
}

interface Testimonial {
  id: string;
  position: number;
  text: string;
  category: string;
  author: string;
  date: string;
  published: boolean;
  status: string;
}

export const createApp = () => {
  const app = express();

  app.use(express.json());
  app.use(express.static(path.resolve(__dirname, "..", "dist", "public")));

  // API para buscar depoimentos
  app.get("/api/testimonials", async (_req, res) => {
    try {
      const reader = new SheetsReader();
      const testimonials = await reader.getTestimonials();
      res.json(testimonials);
    } catch (err) {
      console.error("Erro ao ler planilha:", err);
      res.status(500).json({ error: "Falha ao carregar depoimentos" });
    }
  });

  // Rotas de cliente (SPA)
  app.get("*", (_req, res) => {
    res.sendFile(path.resolve(__dirname, "..", "dist", "public", "index.html"));
  });

  const port = process.env.PORT || 3000;
  return { app, port };
};

// Só executa se rodar diretamente
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { app, port } = createApp();
  createServer(app).listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
