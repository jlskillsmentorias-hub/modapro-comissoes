# AGENTS.md — Documentação Técnica & Guia de Desenvolvimento

Bem-vindo ao **ATELIER VESTT**, a plataforma gamificada de gestão de comissões, metas corporativas e ranking para lojas de moda e vestuário.

Este documento serve como referência de arquitetura, modelo de dados, regras de negócio e rotinas de manutenção para desenvolvedores e agentes autônomos.

---

## 1. Visão Geral do Sistema

- **Nome Comercial**: ATELIER VESTT
- **Segmento**: Varejo de Moda Feminina/Masculina e Alta-Costura (Roupas, Calçados e Acessórios)
- **Objetivo Principal**: Aumentar o engajamento e faturamento da equipe de consultores de moda por meio de gamificação (pódio 3D, badges, níveis de carreira fashion), transparência no cálculo de comissões e simuladores de vendas em tempo real.
- **Localização do Projeto**: `C:\Users\lsaqu\.gemini\antigravity-ide\scratch\modapro-comissoes`

---

## 2. Pilha Tecnológica (Tech Stack)

| Camada | Tecnologia | Detalhes |
|---|---|---|
| **Runtime** | Node.js (v24+) | Execução assíncrona de alta performance |
| **Backend Framework** | Express.js | API RESTful limpa e modular |
| **Banco de Dados** | SQLite (`node:sqlite`) | Armazenamento local leve e sem dependências externas (`modaflow.db`) |
| **Frontend** | Vanilla HTML5 & CSS3 | Design system luxuoso (obsidian & dourado champanhe, glassmorphism) |
| **Gráficos** | Chart.js (v4.4.x via CDN) | Gráficos de linha de 12 meses, donut de categorias e barras comparativas |
| **Gamificação Visual** | Canvas-Confetti | Efeitos de confetes e partículas ao bater metas |
| **Efeitos Sonoros** | Web Audio API | Sintetizador de áudio nativo (sem dependência de MP3 externos) |

---

## 3. Modelo de Dados (SQLite Schema)

Arquivo de configuração: `db.js` | Banco de dados: `modaflow.db`

### 3.1. Tabela `sellers` (Consultores de Moda)
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
- `name` (TEXT NOT NULL): Nome completo do vendedor
- `nickname` (TEXT NOT NULL): Apelido carismático no pódio (Ex: "Musa do Luxo", "Foguete Casual")
- `avatar` (TEXT NOT NULL): URL da foto do consultor
- `email`, `phone`, `hire_date` (TEXT)
- `base_commission_rate` (REAL DEFAULT 4.0): Taxa base de comissão (ex: 4.5 = 4.5%)
- `color_theme` (TEXT): Cor de destaque no ranking
- `current_level` (TEXT): Patente fashion inicial ('Novato', 'Estilo Prata', 'Chic Ouro', 'Ícone Diamante')
- `badge` (TEXT): Distintivo principal

### 3.2. Tabela `categories` (Categorias de Moda)
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
- `name` (TEXT NOT NULL UNIQUE): Ex: 'Vestidos & Festas', 'Alfaiataria & Camisaria', 'Jeans & Casual Chic', 'Casacos & Tricot', 'Moda Praia & Resort', 'Calçados & Bolsas de Couro', 'Acessórios & Semijoias'
- `icon` (TEXT NOT NULL): Emote ou ícone visual
- `standard_bonus_rate` (REAL DEFAULT 0.0)

### 3.3. Tabela `campaigns` (Campanhas Sazonais)
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
- `title` (TEXT NOT NULL): Nome da campanha (Ex: "Primavera-Verão Alto Luxo 2027", "Black Friday Fashion")
- `description` (TEXT)
- `start_date`, `end_date` (TEXT NOT NULL): Formato YYYY-MM-DD
- `bonus_rate` (REAL NOT NULL): Percentual extra de comissão (ex: 2.0 = +2%)
- `category_target` (TEXT DEFAULT 'TODAS'): 'TODAS' ou categoria específica
- `is_active` (INTEGER DEFAULT 1): 1 ativa, 0 inativa
- `color` (TEXT), `icon` (TEXT)

### 3.4. Tabela `goals` (Metas Corporativas e Individuais)
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
- `period` (TEXT NOT NULL): Formato 'YYYY-MM'
- `seller_id` (INTEGER NULL): `NULL` indica Meta Geral da Loja; valor preenchido indica meta individual do vendedor
- `target_amount` (REAL NOT NULL): Valor alvo da meta (R$)
- `super_target_amount` (REAL NOT NULL): Super Meta (+20% a +25%)
- `bonus_multiplier` (REAL DEFAULT 1.25)

### 3.5. Tabela `sales` (Registro de Vendas)
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
- `code` (TEXT NOT NULL UNIQUE): Código da venda (Ex: 'VND-2026-01234')
- `seller_id` (INTEGER NOT NULL REFERENCES sellers(id))
- `customer_name` (TEXT)
- `category` (TEXT NOT NULL)
- `items_count` (INTEGER DEFAULT 1)
- `total_amount` (REAL NOT NULL): Valor total da compra
- `base_commission_rate` (REAL NOT NULL)
- `campaign_id` (INTEGER NULL REFERENCES campaigns(id))
- `campaign_bonus_rate` (REAL DEFAULT 0)
- `total_commission_rate` (REAL NOT NULL): Base + Bônus
- `commission_amount` (REAL NOT NULL): Valor calculado em R$
- `payment_method` (TEXT)
- `sale_date` (TEXT NOT NULL): Data/hora YYYY-MM-DD HH:MM:SS

---

## 4. Endpoints da API REST

O servidor Express roda por padrão na porta `3000` (`server.js`).

### Dashboard & Metas
- `GET /api/dashboard?period=YYYY-MM`: Retorna faturamento total, comissões pagas, ticket médio, status da meta corporativa (base e super meta), líder do mês e campanhas ativas.
- `GET /api/ranking?period=YYYY-MM`: Retorna os consultores ordenados por faturamento, incluindo posições (1º a 6º), pódio, badges, cálculo de distância para ultrapassar o líder e percentuais de meta.

### Consultores & Raio-X
- `GET /api/sellers`: Lista geral de consultores.
- `GET /api/sellers/:id?period=YYYY-MM`: Detalhamento completo do vendedor: histórico recente de comissões, vendas por categoria e progresso.

### Campanhas Sazonais
- `GET /api/campaigns`: Lista todas as campanhas e métricas de faturamento gerado por cada uma.
- `POST /api/campaigns`: Cadastra uma nova campanha sazonal.
- `PATCH /api/campaigns/:id/toggle`: Ativa ou pausa uma campanha existente.

### Vendas & Lançamento
- `GET /api/sales?period=YYYY-MM&seller_id=X&category=Y&limit=35`: Feed filtrável de vendas.
- `POST /api/sales`: Lança uma nova venda. Calcula a comissão automaticamente com base na taxa do vendedor e campanhas ativas, verificando se a meta mensal foi atingida.

### Analytics & Gráficos
- `GET /api/analytics`: Retorna a evolução mensal de vendas e comissões dos últimos 12 meses, mix de categorias e formas de pagamento.

### Manutenção
- `POST /api/reset-seed`: Recria o banco de dados e repopula 1 ano de vendas e consultores de teste.

---

## 5. Regras de Negócio e Gamificação

1. **Cálculo da Comissão**:
   $$\text{Taxa Total (\%)} = \text{Taxa Base do Consultor (\%)} + \text{Bônus da Campanha Ativa (\% prob)}$$
   $$\text{Comissão (R\$)} = \text{Valor da Peça (R\$)} \times \left(\frac{\text{Taxa Total}}{100}\right)$$

2. **Níveis de Carreira Fashion**:
   - `< 50% da Meta`: 🥉 *Novato Promissor*
   - `50% - 74% da Meta`: 🥈 *Estilo Prata*
   - `75% - 99% da Meta`: ✨ *Chic Ouro*
   - `100% - 119% da Meta`: 💎 *Ícone Diamante*
   - `≥ 120% (Super Meta)`: 👑 *Lenda da Moda*

3. **Badges Automáticos**:
   - `🎯 Meta Batida`: Faturou $\ge 100\%$ da meta individual.
   - `🚀 Super Meta (+Bônus)`: Faturou $\ge 120\%$ da meta individual.
   - `💎 Ticket Alto`: Média de ticket individual $> \text{R\$} 1.200,00$.
   - `⚡ Máquina de Vendas`: $\ge 15$ vendas registradas no mês.
   - `🌟 Mestre da Campanha`: Aproveitou o acelerador sazonal e acumulou $> \text{R\$} 200,00$ em bônus.

4. **Simulador de Próxima Venda**:
   - O vendedor move o slider de R$ 500 a R$ 25.000 para projetar ganhos e simular ultrapassagens no ranking em tempo real antes de fechar negócios no salão da loja.

---

## 6. Estrutura de Diretórios

```
modapro-comissoes/
├── AGENTS.md                  # Este documento de referência
├── README.md                  # Manual de uso rápido
├── package.json               # Dependências do Node (express, cors)
├── db.js                      # Inicialização do banco SQLite nativo
├── seed.js                    # Gerador de 1 ano de vendas realistas
├── server.js                  # Servidor Express com API REST
├── modaflow.db                # Arquivo SQLite gerado
└── public/                    # Frontend SPA
    ├── index.html             # Estrutura da interface
    ├── css/
    │   └── style.css          # Design system de moda (glassmorphism e luxo)
    └── js/
        ├── app.js             # Controlador principal e eventos
        ├── charts.js          # Configurações do Chart.js
        └── gamification.js    # Sintetizador sonoro, confetes e toasts
```

---

## 7. Instruções para Execução e Testes

Para inicializar a aplicação em ambiente local:
```bash
# Navegar até a pasta do projeto
cd C:\Users\lsaqu\.gemini\antigravity-ide\scratch\modapro-comissoes

# Instalar dependências (se necessário)
npm install

# Rodar o seeder caso queira restaurar os dados de 1 ano
node seed.js

# Iniciar o servidor
node server.js
```
Acesse no navegador: **`http://localhost:3000`**.
