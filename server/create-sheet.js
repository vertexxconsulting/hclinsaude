// Script para criar a Google Sheet com os depoimentos da HCLIN

// Credenciais da conta de serviço (service account)
const SERVICE_ACCOUNT_FILE = process.env.GOOGLE_SERVICE_ACCOUNT_FILE || "";

// ID da planilha (opcional - se não informado, será criada)
const SPREADSHEET_TITLE = "HCLIN Saúde Integrada - Depoimentos";
const SHEET_NAME = "Depoimentos";

// Cabeçalho das colunas
const HEADERS = [
  "ID",
  "Posicao",
  "Depoimento",
  "Categoria",
  "Autor",
  "Data",
  "Publicado",
  "Status",
];

// Os 13 depoimentos fornecidos
const TESTIMONIALS = [
  {
    id: "1",
    position: 1,
    text: "Uma clínica acolhedora, com profissionais extremamente dedicados, qualificados e um atendimento feito com muito carinho, respeito e profissionalismo. Um ambiente onde cada paciente é tratado de forma individual e especial. Recomendo de coração!",
    category: "Paciente",
    author: "Paciente",
    date: "2026-10-05",
    published: true,
    status: "aceito",
  },
  {
    id: "2",
    position: 2,
    text: "Uma clínica excelente, com profissionais qualificados, atenciosos e acolhedores. O ambiente é confortável e agradável, e os atendimentos são sempre claros, cuidadosos e humanizados. Recomendo de olhos fechados! ❤️",
    category: "Paciente",
    author: "Paciente",
    date: "2026-10-05",
    published: true,
    status: "aceito",
  },
  {
    id: "3",
    position: 3,
    text: "Fui muito bem recebida desde o primeiro contato. A equipe é atenciosa, acolhedora e demonstra muito profissionalismo. Me senti segura e confortável durante todo o atendimento.",
    category: "Paciente",
    author: "Paciente",
    date: "2026-10-05",
    published: true,
    status: "aceito",
  },
  {
    id: "4",
    position: 4,
    text: "A H+ é uma clínica diferenciada. O ambiente é muito agradável, organizado e todos os profissionais são muito cuidadosos. Dá para perceber que existe preocupação genuína com o paciente.",
    category: "Paciente",
    author: "Paciente",
    date: "2026-10-05",
    published: true,
    status: "aceito",
  },
  {
    id: "5",
    position: 5,
    text: "Minha experiência foi excelente! Desde a recepção até o atendimento com o profissional, fui tratada com muito respeito e atenção. Com certeza recomendo a clínica.",
    category: "Paciente",
    author: "Paciente",
    date: "2026-10-05",
    published: true,
    status: "aceito",
  },
  {
    id: "6",
    position: 6,
    text: "Um lugar acolhedor, com profissionais preparados e atendimento humanizado. Gostei muito da experiência e me senti realmente ouvida e respeitada.",
    category: "Paciente",
    author: "Paciente",
    date: "2026-10-05",
    published: true,
    status: "aceito",
  },
  {
    id: "7",
    position: 7,
    text: "Procurei a H+ em um momento em que precisava de ajuda e fui recebida com muito carinho. O atendimento fez toda a diferença para mim. Sou muito grata por todo cuidado.",
    category: "Paciente",
    author: "Paciente",
    date: "2026-10-05",
    published: true,
    status: "aceito",
  },
  {
    id: "8",
    position: 8,
    text: "Clínica linda, organizada e com uma equipe maravilhosa. O atendimento é pontual, profissional e, ao mesmo tempo, muito humano. Recomendo de olhos fechados.",
    category: "Paciente",
    author: "Paciente",
    date: "2026-10-05",
    published: true,
    status: "aceito",
  },
  {
    id: "9",
    position: 9,
    text: "Desde o primeiro atendimento percebi o quanto a equipe é comprometida. Tudo muito organizado e os profissionais demonstram conhecimento e atenção em cada detalhe.",
    category: "Paciente",
    author: "Paciente",
    date: "2026-10-05",
    published: true,
    status: "aceito",
  },
  {
    id: "10",
    position: 10,
    text: "Estou muito satisfeita com meu acompanhamento na H+. Além da qualidade dos profissionais, o ambiente transmite tranquilidade e acolhimento. É um lugar onde realmente me sinto cuidada.",
    category: "Paciente",
    author: "Paciente",
    date: "2026-10-05",
    published: true,
    status: "aceito",
  },
  {
    id: "11",
    position: 11,
    text: "Excelente experiência! A equipe foi muito atenciosa e explicou tudo com clareza. É muito bom encontrar uma clínica que une profissionalismo, acolhimento e respeito ao paciente.",
    category: "Paciente",
    author: "Paciente",
    date: "2026-10-05",
    published: true,
    status: "aceito",
  },
  {
    id: "12",
    position: 12,
    text: "A H+ se tornou uma referência para mim quando penso em cuidado e saúde. O atendimento é humanizado, os profissionais são excelentes e o ambiente é muito agradável. Recomendo para toda a família.",
    category: "Paciente",
    author: "Paciente",
    date: "2026-10-05",
    published: true,
    status: "aceito",
  },
  {
    id: "13",
    position: 13,
    text: "Trabalhar na clínica tem sido uma experiência muito positiva e enriquecedora. É um ambiente acolhedor, organizado e que valoriza o cuidado com os pacientes e a qualidade do trabalho dos profissionais. Tenho muito carinho pela equipe e pela forma como todos trabalham, sempre buscando oferecer um atendimento humanizado, ético e de qualidade. A clínica proporciona um ambiente agradável tanto para os pacientes quanto para os profissionais, favorecendo o desenvolvimento e a realização de um trabalho cada vez melhor.",
    category: "Profissional",
    author: "Colaborador",
    date: "2026-10-05",
    published: true,
    status: "aceito",
  },
];

async function main() {
  const { google } = require("googleapis");
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });

  // Criar a planilha
  const resource = {
    properties: {
      title: SPREADSHEET_TITLE,
    },
    sheets: [
      {
        properties: {
          title: SHEET_NAME,
          gridProperties: {
            rowCount: TESTIMONIALS.length + 1,
            columnCount: HEADERS.length,
          },
        },
      },
    ],
  };

  console.log("Criando planilha...", SHEET_NAME);
  const created = await sheets.spreadsheets.create({
    requestBody: resource,
    fields: "spreadsheetId,properties.title",
  });

  const spreadsheetId = created.data.spreadsheetId;
  console.log("Planilha criada com ID:", spreadsheetId);
  console.log("URL: https://docs.google.com/spreadsheets/d/" + spreadsheetId);

  // Inserir dados
  const range =
    SHEET_NAME +
    "!A1:" +
    String(HEADERS.length) +
    String(TESTIMONIALS.length + 1);
  const values = [HEADERS];
  TESTIMONIALS.forEach(t => {
    values.push([
      t.id,
      t.position,
      t.text,
      t.category,
      t.author,
      t.date,
      t.published,
      t.status,
    ]);
  });

  console.log("Inserindo", values.length - 1, "depoimentos...");
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });

  console.log("Dados inseridos com sucesso!");
  console.log(
    "Para acessar: https://docs.google.com/spreadsheets/d/" + spreadsheetId
  );
  console.log("\nInstruções de configuração no site:");
  console.log("1. Compartilhe a planilha com a conta service account");
  console.log("2. Configure as variáveis de ambiente no servidor:");
  console.log(
    "   - GOOGLE_SERVICE_ACCOUNT_FILE=/caminho/para/service-account.json"
  );
  console.log("   - GOOGLE_SPREADSHEET_ID=" + spreadsheetId);
}

main().catch(err => {
  console.error("Erro:", err);
  process.exit(1);
});
