# ✨ ATELIER VESTT — Sistema de Gestão de Comissões, Metas & Gamificação Fashion

> Plataforma gamificada, interativa e visualmente elegante para motivar equipes de vendas de moda a superarem suas metas de vendas e comissões.

---

## 🌟 Visão Geral do Sistema

O **ATELIER VESTT** foi projetado sob medida para lojas de roupas e moda contemporânea que desejam transformar o acompanhamento de metas em uma experiência vibrante e divertida para seus consultores de vendas.

### Principais Funcionalidades:
1. 🏆 **Arena do Ranking & Pódio Gamificado**:
   - Pódio das estrelas de vendas (1º Lugar Ouro com coroa brilhante, 2º Lugar Prata e 3º Lugar Bronze).
   - Tabela geral com posições, níveis fashion (*Ícone Diamante*, *Chic Ouro*, etc.), medalhas e selos de conquistas (*"Rei do Ticket Médio"*, *"Foguete de Vendas"*, *"Meta Batida"*).
   - Indicador dinâmico de desafio: mostra quantos reais faltam para o vendedor ultrapassar o colega à frente!

2. 🎯 **Metômetro da Loja (Metas Corporativas e Individuais)**:
   - Barra de progresso com glow em tempo real da meta total da empresa.
   - Marcador especial de **Super Meta (125%)**, ativando bônus coletivo comemorativo.
   - Metas mensais individuais para cada consultor(a).

3. ⚡ **Simulador de Comissão "E se eu vender mais?"**:
   - Controle deslizante (slider) interativo: o vendedor escolhe um valor adicional e visualiza em tempo real:
     - Quanto a mais vai cair no seu bolso de comissão.
     - Nova porcentagem da meta pessoal.
     - Projeção de salto no ranking geral (ex: *"Com essa venda você assume o 1º Lugar!"*).

4. ✨ **Gestor de Campanhas Sazonais**:
   - Criação e ativação de campanhas temáticas da moda (ex: *Black Friday Fashion*, *Natal de Gala*, *Festival de Inverno & Tricot*, *Primavera-Verão Alto Luxo*).
   - Acelerador com bônus de comissão extra (ex: +2.0%) para categorias específicas ou toda a loja.
   - Cálculo automático do bônus em cada venda.

5. 📊 **Gráficos & Analytics (Chart.js)**:
   - **Evolução de 12 Meses**: Faturamento vs Comissões pagas ao longo do ano com sazonalidades.
   - **Mix de Categorias de Roupas**: Distribuição de vendas por departamento (Vestidos de Festa, Alfaiataria, Jeans, Calçados, Bolsas, Acessórios).
   - **Comparativo de Desempenho da Equipe**.

6. 🛍️ **Lançador Rápido de Vendas com Celebração**:
   - Modal com cálculo instantâneo da comissão (taxa base + bônus de campanha ativa).
   - Chuva de confetes (`canvas-confetti`) e efeitos sonoros sintetizados (`Web Audio API`) ao bater metas.

---

## 🗄️ Banco de Dados SQLite & Dados Pré-Carregados

O sistema utiliza o banco de dados nativo SQLite (`modaflow.db`), já populado com:
- **1 ano completo de histórico de vendas** (+1.000 vendas realistas com valores, clientes e peças).
- **6 Vendedores de moda** com perfis, avatares, fotos e metas calculadas.
- **7 Categorias de roupas e acessórios**.
- **4 Campanhas sazonais** (históricas e a campanha atual ativa).
- **13 Meses de metas** corporativas e individuais.

---

## 🚀 Como Executar

O servidor já está ativo no seu computador em:
👉 **[http://localhost:3000](http://localhost:3000)**

Para reiniciar ou executar novamente no futuro:
```bash
# 1. Acesse a pasta do projeto
cd C:\Users\lsaqu\.gemini\antigravity-ide\scratch\modapro-comissoes

# 2. Inicie o servidor
node server.js
```

Abra o seu navegador de preferência (Chrome, Edge, Firefox, Brave) e acesse:
```
http://localhost:3000
```
