import bcrypt from "bcryptjs";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";
import pg from "pg";
import fs from "node:fs";
import path from "node:path";

const { Pool } = pg;
const rootDir = process.cwd();

// Load .env (support both server/.env and root .env)
dotenv.config({ path: path.resolve(rootDir, "server", ".env") });
dotenv.config({ path: path.resolve(rootDir, ".env") });

// ─── Database Connection (Neon) ──────────────────────────────────────────────
const pool = new Pool({
  connectionString: (process.env.DATABASE_URL || "").trim() || undefined,
  ssl: { rejectUnauthorized: false },
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on("error", err => {
  console.warn(
    "⚠️ Conexão ociosa com o Neon encerrada (reconectará automaticamente):",
    err.message
  );
});

export const port = process.env.PORT || 3001;

// ─── Types ───────────────────────────────────────────────────────────────────
interface Professional {
  id: string;
  name: string;
  role: string;
  specialties: string;
  bio: string;
  schedule: string;
  image_url: string | null;
  object_position: string | null;
  registration: string | null;
  order_index: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface Testimonial {
  id: string;
  position: number;
  text: string;
  author: string;
  role: string;
  category: "Paciente" | "Profissional";
  tag: string;
  rating: number;
  published: boolean;
  status: "aceito" | "pendente" | "rejeitado";
  created_at: string;
  updated_at: string;
}

// ─── Auth Middleware ─────────────────────────────────────────────────────────
const DEFAULT_ADMIN_HASH =
  "$2a$10$Day5RQAArBe10c/HA9CtT.mh4dLcatitfomc8WzFb1n3L4VLxwHsK";
const SESSION_SECRET =
  process.env.SESSION_SECRET || "hclin-admin-session-secret-2026";
const ADMIN_PASSWORD_HASH =
  process.env.ADMIN_PASSWORD_HASH || DEFAULT_ADMIN_HASH;

function authenticateToken(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const authHeader = req.headers["authorization"] as string | undefined;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token de acesso necessário" });
  }

  jwt.verify(token, SESSION_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: "Token inválido ou expirado" });
    }
    (req as any).user = user;
    next();
  });
}

// ─── Database Helpers ────────────────────────────────────────────────────────
async function query(text: string, params: any[] = []) {
  return pool.query(text, params);
}

// ─── App Factory ─────────────────────────────────────────────────────────────
export function createApp(options: { serveStatic?: boolean } = {}) {
  const { serveStatic = true } = options;
  const app = express();
  const publicDir = path.resolve(rootDir, "dist", "public");

  app.use(cors());
  app.use(express.json({ limit: "10mb" }));

  if (!serveStatic) {
    app.use((req, _res, next) => {
      if (!req.url.startsWith("/api/") && req.url !== "/api") {
        req.url = `/api${req.url.startsWith("/") ? "" : "/"}${req.url}`;
      }
      next();
    });
  }

  if (serveStatic) {
    app.use(express.static(publicDir));
  }

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Verify admin token
  app.get("/api/admin/me", authenticateToken, (_req, res) => {
    res.json({ authenticated: true, role: "admin" });
  });

  // ─── Public: Get published testimonials ─────────────────────────────────────
  app.get("/api/testimonials", async (_req, res) => {
    try {
      const result = await query(
        `SELECT id, position, text, author, role, category, tag, rating, published
         FROM testimonials
         WHERE published = true AND status = 'aceito'
         ORDER BY position ASC`
      );
      res.json(result.rows);
    } catch (err) {
      console.error("Erro ao buscar depoimentos:", err);
      res.status(500).json({ error: "Falha ao carregar depoimentos" });
    }
  });

  // ─── Public: Submit testimonial (goes to DB as 'pendente' for admin approval) ─
  app.post("/api/testimonials/submit", async (req, res) => {
    const { text, author, role, category, tag, rating } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "O texto do depoimento é obrigatório" });
    }

    try {
      const posRes = await query(
        "SELECT COALESCE(MAX(position), 0) + 1 AS next_pos FROM testimonials"
      );
      const nextPos = Number(posRes.rows[0]?.next_pos) || 1;

      const result = await query(
        `INSERT INTO testimonials
          (position, text, author, role, category, tag, rating, published, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          nextPos,
          text.trim(),
          (author && author.trim()) || "Paciente HCLIN",
          (role && role.trim()) || "Atendimento na clínica",
          category === "Profissional" ? "Profissional" : "Paciente",
          (tag && tag.trim()) || "Acolhimento & Cuidado",
          rating !== undefined ? Math.min(5, Math.max(1, Number(rating) || 5)) : 5,
          false,
          "pendente",
        ]
      );
      res.status(201).json({
        message: "Depoimento enviado com sucesso! Será revisado pela equipe.",
        testimonial: result.rows[0],
      });
    } catch (err) {
      console.error("Erro ao enviar depoimento:", err);
      res.status(500).json({ error: "Falha ao enviar depoimento" });
    }
  });

  // ─── Public: Get active professionals ───────────────────────────────────────
  app.get("/api/professionals", async (_req, res) => {
    try {
      const result = await query(
        `SELECT id, name, role, specialties, bio, schedule, image_url, object_position, registration, order_index
         FROM professionals
         WHERE active = true
         ORDER BY order_index ASC`
      );
      res.json(result.rows);
    } catch (err) {
      console.error("Erro ao buscar profissionais:", err);
      res.status(500).json({ error: "Falha ao carregar profissionais" });
    }
  });

  // ─── Auth: Login ───────────────────────────────────────────────────────────
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { password } = req.body || {};

      if (!password) {
        return res.status(400).json({ error: "Senha não fornecida" });
      }

      dotenv.config({
        path: path.resolve(rootDir, "server", ".env"),
        override: true,
      });

      const envHash = (process.env.ADMIN_PASSWORD_HASH || "").trim();
      const validHash =
        envHash.startsWith("$2") && envHash.length >= 59
          ? envHash
          : ADMIN_PASSWORD_HASH.startsWith("$2") &&
              ADMIN_PASSWORD_HASH.length >= 59
            ? ADMIN_PASSWORD_HASH
            : DEFAULT_ADMIN_HASH;

      let valid = false;
      if (
        process.env.ADMIN_PASSWORD &&
        password === process.env.ADMIN_PASSWORD
      ) {
        valid = true;
      } else {
        valid = await bcrypt.compare(password, validHash);
        if (!valid && validHash !== DEFAULT_ADMIN_HASH) {
          valid = await bcrypt.compare(password, DEFAULT_ADMIN_HASH);
        }
      }

      if (!valid) {
        return res.status(401).json({ error: "Senha incorreta" });
      }

      const token = jwt.sign({ role: "admin" }, SESSION_SECRET, {
        expiresIn: "7d",
      });

      res.json({ token });
    } catch (err) {
      console.error("Erro no login admin:", err);
      res.status(500).json({ error: "Erro interno ao validar login" });
    }
  });

  // ─── Admin: Professionals ──────────────────────────────────────────────────
  app.get("/api/admin/professionals", authenticateToken, async (_req, res) => {
    try {
      const result = await query(
        `SELECT * FROM professionals ORDER BY order_index ASC, name ASC`
      );
      res.json(result.rows);
    } catch (err) {
      console.error("Erro ao buscar profissionais (admin):", err);
      res.status(500).json({ error: "Falha ao carregar profissionais" });
    }
  });

  app.post("/api/admin/professionals", authenticateToken, async (req, res) => {
    const {
      name,
      role,
      specialties,
      bio,
      schedule,
      image_url,
      object_position,
      registration,
      order_index,
      active,
    } = req.body;

    try {
      const result = await query(
        `INSERT INTO professionals
          (name, role, specialties, bio, schedule, image_url, object_position, registration, order_index, active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [
          name,
          role || "",
          specialties || "",
          bio || "",
          schedule || "",
          image_url || null,
          object_position || null,
          registration || null,
          order_index !== undefined ? order_index : 0,
          active !== undefined ? active : true,
        ]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error("Erro ao criar profissional:", err);
      res.status(500).json({ error: "Falha ao criar profissional" });
    }
  });

  app.put(
    "/api/admin/professionals/:id",
    authenticateToken,
    async (req, res) => {
      const { id } = req.params;
      const {
        name,
        role,
        specialties,
        bio,
        schedule,
        image_url,
        object_position,
        registration,
        order_index,
        active,
      } = req.body;

      try {
        const result = await query(
          `UPDATE professionals
         SET name = $1, role = $2, specialties = $3, bio = $4, schedule = $5,
             image_url = $6, object_position = $7, registration = $8, order_index = $9, active = $10,
             updated_at = NOW()
         WHERE id = $11
         RETURNING *`,
          [
            name,
            role || "",
            specialties || "",
            bio || "",
            schedule || "",
            image_url || null,
            object_position || null,
            registration || null,
            order_index !== undefined ? order_index : 0,
            active !== undefined ? active : true,
            id,
          ]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({ error: "Profissional não encontrado" });
        }

        res.json(result.rows[0]);
      } catch (err) {
        console.error("Erro ao atualizar profissional:", err);
        res.status(500).json({ error: "Falha ao atualizar profissional" });
      }
    }
  );

  app.delete(
    "/api/admin/professionals/:id",
    authenticateToken,
    async (req, res) => {
      const { id } = req.params;

      try {
        await query("DELETE FROM professionals WHERE id = $1", [id]);
        res.status(204).send();
      } catch (err) {
        console.error("Erro ao deletar profissional:", err);
        res.status(500).json({ error: "Falha ao deletar profissional" });
      }
    }
  );

  // ─── Storage / Media Uploads (Neon DB + Local Assets) ───────────────────────
  async function ensureMediaTable() {
    await query(`
      CREATE TABLE IF NOT EXISTS media_uploads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        filename TEXT UNIQUE NOT NULL,
        mime_type TEXT NOT NULL DEFAULT 'image/webp',
        data TEXT NOT NULL,
        size_bytes INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
  }

  // Public: Serve uploaded image by filename
  app.get("/api/uploads/:filename", async (req, res) => {
    const { filename } = req.params;
    try {
      await ensureMediaTable();
      const result = await query(
        "SELECT mime_type, data FROM media_uploads WHERE filename = $1",
        [filename]
      );

      if (result.rows.length > 0) {
        const { mime_type, data } = result.rows[0];
        const buffer = (globalThis as any).Buffer.from(data, "base64");
        res.setHeader("Content-Type", mime_type || "image/webp");
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        return res.send(buffer);
      }

      // Fallback to local assets folder if file exists on disk
      const localPath = path.resolve(
        rootDir,
        "client",
        "public",
        "assets",
        "hclin",
        path.basename(filename)
      );
      if (fs.existsSync(localPath)) {
        return res.sendFile(localPath);
      }

      return res.status(404).json({ error: "Imagem não encontrada" });
    } catch (err) {
      console.error("Erro ao servir imagem:", err);
      return res.status(500).json({ error: "Erro ao carregar imagem" });
    }
  });

  // Admin: List all storage images (uploaded in DB + local assets)
  app.get("/api/admin/uploads", authenticateToken, async (_req, res) => {
    try {
      await ensureMediaTable();
      const dbResult = await query(
        "SELECT id, filename, mime_type, size_bytes, created_at FROM media_uploads ORDER BY created_at DESC"
      );

      const dbFiles = dbResult.rows.map((row: any) => ({
        id: row.id,
        filename: row.filename,
        url: `/api/uploads/${row.filename}`,
        size_bytes: row.size_bytes,
        source: "storage" as const,
        created_at: row.created_at,
      }));

      const localAssetsDir = path.resolve(
        rootDir,
        "client",
        "public",
        "assets",
        "hclin"
      );
      let localFiles: any[] = [];
      if (fs.existsSync(localAssetsDir)) {
        const files = fs.readdirSync(localAssetsDir);
        localFiles = files
          .filter(f => /\.(webp|png|jpe?g)$/i.test(f))
          .map(f => {
            const stat = fs.statSync(path.join(localAssetsDir, f));
            return {
              id: `local-${f}`,
              filename: f,
              url: `/assets/hclin/${f}`,
              size_bytes: stat.size,
              source: "local" as const,
              created_at: stat.mtime.toISOString(),
            };
          });
      }

      res.json({ uploads: dbFiles, localAssets: localFiles });
    } catch (err) {
      console.error("Erro ao listar storage:", err);
      res.status(500).json({ error: "Falha ao listar imagens do storage" });
    }
  });

  // Admin: Upload new photo to storage
  app.post("/api/admin/upload", authenticateToken, async (req, res) => {
    const { filename: rawFilename, dataUrl } = req.body;

    if (!dataUrl || typeof dataUrl !== "string") {
      return res.status(400).json({ error: "Imagem inválida ou ausente" });
    }

    const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!match) {
      return res
        .status(400)
        .json({ error: "Formato de imagem inválido (esperado base64 DataURL)" });
    }

    const mimeType = match[1];
    const base64Data = match[2];
    const buffer = (globalThis as any).Buffer.from(base64Data, "base64");

    const ext =
      mimeType === "image/webp"
        ? ".webp"
        : mimeType === "image/png"
          ? ".png"
          : ".jpg";

    const baseSlug = (rawFilename || "foto-profissional")
      .replace(/\.[^/.]+$/, "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48);

    const finalFilename = `${baseSlug || "foto"}-${Date.now()}${ext}`;

    try {
      await ensureMediaTable();
      const result = await query(
        `INSERT INTO media_uploads (filename, mime_type, data, size_bytes)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (filename) DO UPDATE
           SET mime_type = EXCLUDED.mime_type,
               data = EXCLUDED.data,
               size_bytes = EXCLUDED.size_bytes
         RETURNING id, filename, mime_type, size_bytes, created_at`,
        [finalFilename, mimeType, base64Data, buffer.length]
      );

      // Save a physical copy in client/public/assets/hclin and dist/public/assets/hclin when writable
      try {
        const clientAssetsDir = path.resolve(
          rootDir,
          "client",
          "public",
          "assets",
          "hclin"
        );
        if (fs.existsSync(clientAssetsDir)) {
          fs.writeFileSync(path.join(clientAssetsDir, finalFilename), buffer);
        }
        const distAssetsDir = path.resolve(publicDir, "assets", "hclin");
        if (fs.existsSync(distAssetsDir)) {
          fs.writeFileSync(path.join(distAssetsDir, finalFilename), buffer);
        }
      } catch {
        // Ignore filesystem write errors in read-only serverless environments
      }

      const row = result.rows[0];
      res.status(201).json({
        id: row.id,
        filename: row.filename,
        url: `/api/uploads/${row.filename}`,
        localUrl: `/assets/hclin/${row.filename}`,
        size_bytes: row.size_bytes,
      });
    } catch (err) {
      console.error("Erro ao salvar imagem no storage:", err);
      res.status(500).json({ error: "Falha ao salvar imagem no storage" });
    }
  });

  // Admin: Delete uploaded photo from storage
  app.delete(
    "/api/admin/uploads/:filename",
    authenticateToken,
    async (req, res) => {
      const { filename } = req.params;
      try {
        await ensureMediaTable();
        await query("DELETE FROM media_uploads WHERE filename = $1", [filename]);
        try {
          const clientFile = path.resolve(
            rootDir,
            "client",
            "public",
            "assets",
            "hclin",
            path.basename(filename)
          );
          if (fs.existsSync(clientFile)) {
            fs.unlinkSync(clientFile);
          }
        } catch {
          // Ignore fs errors
        }
        res.status(204).send();
      } catch (err) {
        console.error("Erro ao excluir imagem do storage:", err);
        res.status(500).json({ error: "Falha ao excluir imagem" });
      }
    }
  );

  // ─── Admin: Testimonials ───────────────────────────────────────────────────
  app.get("/api/admin/testimonials", authenticateToken, async (_req, res) => {
    try {
      const result = await query(
        `SELECT * FROM testimonials
         ORDER BY CASE WHEN status = 'pendente' THEN 0 ELSE 1 END, position ASC, created_at DESC`
      );
      res.json(result.rows);
    } catch (err) {
      console.error("Erro ao buscar depoimentos (admin):", err);
      res.status(500).json({ error: "Falha ao carregar depoimentos" });
    }
  });

  app.post("/api/admin/testimonials", authenticateToken, async (req, res) => {
    const {
      position,
      text,
      author,
      role,
      category,
      tag,
      rating,
      published,
      status,
    } = req.body;

    try {
      const result = await query(
        `INSERT INTO testimonials
          (position, text, author, role, category, tag, rating, published, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          position !== undefined ? position : 0,
          text,
          author || "",
          role || "",
          category || "Paciente",
          tag || "",
          rating !== undefined ? rating : 5,
          published !== undefined ? published : false,
          status || "pendente",
        ]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error("Erro ao criar depoimento:", err);
      res.status(500).json({ error: "Falha ao criar depoimento" });
    }
  });

  app.put(
    "/api/admin/testimonials/:id",
    authenticateToken,
    async (req, res) => {
      const { id } = req.params;
      const {
        position,
        text,
        author,
        role,
        category,
        tag,
        rating,
        published,
        status,
      } = req.body;

      try {
        const result = await query(
          `UPDATE testimonials
         SET position = $1, text = $2, author = $3, role = $4, category = $5,
             tag = $6, rating = $7, published = $8, status = $9,
             updated_at = NOW()
         WHERE id = $10
         RETURNING *`,
          [
            position !== undefined ? position : 0,
            text,
            author || "",
            role || "",
            category || "Paciente",
            tag || "",
            rating !== undefined ? rating : 5,
            published !== undefined ? published : false,
            status || "pendente",
            id,
          ]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({ error: "Depoimento não encontrado" });
        }

        res.json(result.rows[0]);
      } catch (err) {
        console.error("Erro ao atualizar depoimento:", err);
        res.status(500).json({ error: "Falha ao atualizar depoimento" });
      }
    }
  );

  app.delete(
    "/api/admin/testimonials/:id",
    authenticateToken,
    async (req, res) => {
      const { id } = req.params;

      try {
        await query("DELETE FROM testimonials WHERE id = $1", [id]);
        res.status(204).send();
      } catch (err) {
        console.error("Erro ao deletar depoimento:", err);
        res.status(500).json({ error: "Falha ao deletar depoimento" });
      }
    }
  );

  // ─── SPA Fallback (Production Static Server) ────────────────────────────────
  if (serveStatic) {
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api")) {
        return next();
      }
      res.sendFile(path.join(publicDir, "index.html"));
    });
  }

  // ─── Init DB: Seed default data if empty ───────────────────────────────────
  async function initDatabase() {
    try {
      await ensureMediaTable();
      await query(`
        CREATE TABLE IF NOT EXISTS professionals (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          role TEXT,
          specialties TEXT,
          bio TEXT,
          schedule TEXT,
          image_url TEXT,
          object_position TEXT,
          registration TEXT,
          order_index INTEGER DEFAULT 0,
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      await query(`
        CREATE TABLE IF NOT EXISTS testimonials (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          position INTEGER DEFAULT 0,
          text TEXT NOT NULL,
          author TEXT,
          role TEXT,
          category TEXT CHECK (category IN ('Paciente', 'Profissional')),
          tag TEXT,
          rating INTEGER DEFAULT 5,
          published BOOLEAN DEFAULT false,
          status TEXT CHECK (status IN ('aceito', 'pendente', 'rejeitado')) DEFAULT 'pendente',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      const testimonialCount = await query("SELECT COUNT(*) FROM testimonials");
      if (testimonialCount.rows[0].count === "0") {
        const seedTestimonials = [
          {
            position: 1,
            text: "Uma clínica acolhedora, com profissionais extremamente dedicados, qualificados e um atendimento feito com muito carinho, respeito e profissionalismo. Um ambiente onde cada paciente é tratado de forma individual e especial. Recomendo de coração! ♥️",
            author: "Paciente HCLIN",
            role: "Atendimento individualizado",
            category: "Paciente",
            tag: "Acolhimento & Respeito",
            rating: 5,
            published: true,
            status: "aceito",
          },
          {
            position: 2,
            text: "Uma clínica excelente, com profissionais qualificados, atenciosos e acolhedores. O ambiente é confortável e agradável, e os atendimentos são sempre claros, cuidadosos e humanizados. Recomendo de olhos fechados! ❤️",
            author: "Paciente HCLIN",
            role: "Acompanhamento humanizado",
            category: "Paciente",
            tag: "Conforto & Clareza",
            rating: 5,
            published: true,
            status: "aceito",
          },
          {
            position: 13,
            text: "Trabalhar na clínica tem sido uma experiência muito positiva e enriquecedora. É um ambiente acolhedor, organizado e que valoriza o cuidado com os pacientes e a qualidade do trabalho dos profissionais. Tenho muito carinho pela equipe e pela forma como todos trabalham, sempre buscando oferecer um atendimento humanizado, ético e de qualidade.",
            author: "Equipe HCLIN",
            role: "Profissional da clínica",
            category: "Profissional",
            tag: "Ambiente & Propósito",
            rating: 5,
            published: true,
            status: "aceito",
          },
        ];

        for (const t of seedTestimonials) {
          await query(
            `INSERT INTO testimonials (position, text, author, role, category, tag, rating, published, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
              t.position,
              t.text,
              t.author,
              t.role,
              t.category,
              t.tag,
              t.rating,
              t.published,
              t.status,
            ]
          );
        }
        console.log("Seed de depoimentos concluído.");
      }

      const profCount = await query("SELECT COUNT(*) FROM professionals");
      if (profCount.rows[0].count === "0") {
        const seedProfessionals = [
          {
            name: "Hellen Fernanda Teixeira",
            role: "Psicóloga · CRP 08/43808",
            specialties: "Neuropsicologia e TCC",
            bio: "Proprietária da clínica, atua em Neuropsicologia e TCC para TEA, altas habilidades, ansiedade, relacionamentos e perícia judicial.",
            schedule: "Horários a confirmar com a clínica.",
            image_url: "/assets/hclin/hellen.webp",
            object_position: "object-[5%_top]",
            registration: "CRP 08/43808",
            order_index: 0,
            active: true,
          },
          {
            name: "Andressa Rosa",
            role: "Nutricionista · CRN-18433",
            specialties: "Saúde metabólica e emagrecimento",
            bio: "Especializada em saúde metabólica e emagrecimento. Em um estúdio único, acolhedor e humanizado, o atendimento é totalmente individualizado e focado nas metas e na realidade de cada paciente.",
            schedule: "Horários a confirmar com a clínica.",
            image_url: "/assets/hclin/andressarosanutricionista.webp",
            object_position: null,
            registration: "CRN-18433",
            order_index: 1,
            active: true,
          },
        ];

        for (const p of seedProfessionals) {
          await query(
            `INSERT INTO professionals (name, role, specialties, bio, schedule, image_url, object_position, registration, order_index, active)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
              p.name,
              p.role,
              p.specialties,
              p.bio,
              p.schedule,
              p.image_url,
              p.object_position,
              p.registration,
              p.order_index,
              p.active,
            ]
          );
        }
        console.log("Seed de profissionais concluído.");
      }
    } catch (err) {
      console.error("❌ Erro ao inicializar banco:", err);
      throw err;
    }
  }

  // ─── Start ──────────────────────────────────────────────────────────────────
  async function start() {
    try {
      await initDatabase();
      console.log("✅ Banco de dados conectado e inicializado.");
    } catch (err) {
      console.error("❌ Erro ao inicializar banco:", err);
      process.exit(1);
    }
  }

  return { app, port, start, initDatabase };
}

export { pool, query };
