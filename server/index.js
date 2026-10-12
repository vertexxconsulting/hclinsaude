const express = require("express");
const { google } = require("googleapis");
const path = require("path");

const app = express();

// Serviço de leitura da Google Sheet
class SheetsReader {
  constructor() {
    const keyFile = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (!keyFile) {
      throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON não definida");
    }
    this.auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(keyFile),
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });
  }

  async getTestimonials() {
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    if (!spreadsheetId) {
      throw new Error("GOOGLE_SPREADSHEET_ID não definida");
    }
    const sheets = google.sheets({ version: "v4", auth: await this.auth.getClient() });

    const range = "Depoimentos!A1:H100";
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values || [];
    // Headera: ID, Orden, Depoimento, Categoria, Autor, Data, Publicado, Status
    const testimonials = rows
      .filter((row) => row[2] && row[2].trim()) // com depoimento
      .map((row, index) => ({
        id: row[0] ? String(row[0]) : index + 1,
        order: row[1] ? Number(row[1]) : index + 1,
        text: row[2],
        category: row[3] || "",
        author: row[4] || "",
        date: row[5] || "",
        published: row[6] === "true" || row[6] === true,
        status: row[7] || "pendente",
      }))
      .filter((t) => t.status !== "rejeitado") // só aceitos e pendentes
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    return testimonials;
  }
}

app.get("/api/testimonials", async (req, res) => {
  try {
    const reader = new SheetsReader();
    const testimonials = await reader.getTestimonials();
    res.json(testimonials);
  } catch (err) {
    console.error("Erro ao ler planilha:", err);
    res.status(500).json({ error: "Falha ao carregar depoimentos" });
  }
});

app.use(express.static(path.resolve(__dirname, "..", "dist", "public")));

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "..", "dist", "public", "index.html"));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}/`);
});
