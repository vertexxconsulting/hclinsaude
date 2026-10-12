# HCLIN Saúde Integrada – Depoimentos via Google Sheets

Plana os 14 depoimentos fornecidos.

## Como configurar

1. Crie uma planilha no Google Sheets com 8 colunas:
   - A: ID
   - B: Orden
   - C: Depoimento
   - D: Categoria
   - E: Autor
   - F: Data
   - G: Publicado (true/false)
   - H: Status (aceito / pendente / rejeitado)

2. Ordene os depoimentos na coluna B. Quem alimenta a planilha determina a ordem de exibição.

3. No Google Cloud Console:
   - Crie um **Service Account**.
   - Dê permissão **Editor** à planilha para o e-mail do service account.
   - Exporte as credenciais como **JSON**.

4. Instale a env vars no ambiente (ou .env):
   - `GOOGLE_SERVICE_ACCOUNT_JSON`: conteúdo do JSON do service account (ou caminho para o arquivo)
   - `GOOGLE_SPREADSHEET_ID`: ID da planilha (no URL: `docs.google.com/spreadsheets/d/<ID>/...`)

5. Reinicie o servidor. A API `/api/testimonials` retornará os depoimentos.

## Exemplo de valores

```json
{
  "type": "service_account",
  "project_id": "hclin-saude-integrada",
  "private_key_id": "abc123",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",
  "client_email": "hclin@hclin-saude-integrada.iam.gserviceaccount.com",
  "client_id": "123456",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/hclin%40hclin-saude-integrada.iam.gserviceaccount.com"
}
```

## Credenciais

> **Atenção:** Não versione o JSON de credenciais na repositório.
> Adicione `server/.env` ao `.gitignore` e configure via variável de ambiente.

## Endpoints da API

| Método | Rota               | Descrição                    |
|--------|--------------------|------------------------------|
| GET    | `/api/testimonials`| Retorna todos os depoimentos |
