const { db, initSchema } = require('./db');

function seedDatabase() {
  console.log('🌱 Inicializando banco de dados e gerando 1 ano de histórico de vendas...');
  initSchema();

  // Clear existing data
  db.exec('DELETE FROM sales;');
  db.exec('DELETE FROM goals;');
  db.exec('DELETE FROM campaigns;');
  db.exec('DELETE FROM categories;');
  db.exec('DELETE FROM sellers;');

  // 1. Inserir Categorias de Moda
  const categories = [
    { name: 'Vestidos & Festas', icon: '👗', standard_bonus_rate: 0.5 },
    { name: 'Alfaiataria & Camisaria', icon: '👔', standard_bonus_rate: 0.5 },
    { name: 'Jeans & Casual Chic', icon: '👖', standard_bonus_rate: 0.0 },
    { name: 'Casacos & Tricot', icon: '🧥', standard_bonus_rate: 1.0 },
    { name: 'Moda Praia & Resort', icon: '👙', standard_bonus_rate: 0.0 },
    { name: 'Calçados & Bolsas de Couro', icon: '👠', standard_bonus_rate: 0.5 },
    { name: 'Acessórios & Semijoias', icon: '💍', standard_bonus_rate: 1.0 }
  ];

  const insertCategory = db.prepare('INSERT INTO categories (name, icon, standard_bonus_rate) VALUES (?, ?, ?)');
  for (const cat of categories) {
    insertCategory.run(cat.name, cat.icon, cat.standard_bonus_rate);
  }

  // 2. Inserir Vendedores da Loja de Roupas
  const sellers = [
    {
      name: 'Camila Rossi',
      nickname: 'Musa do Luxo',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      email: 'camila.rossi@atelievest.com.br',
      phone: '(11) 98765-4321',
      hire_date: '2023-02-15',
      base_commission_rate: 4.5,
      color_theme: '#f59e0b',
      current_level: 'Ícone Diamante',
      badge: '👑 Rainha do Vestido'
    },
    {
      name: 'Lucas Silveira',
      nickname: 'Foguete Casual',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
      email: 'lucas.silveira@atelievest.com.br',
      phone: '(11) 97654-3210',
      hire_date: '2023-08-10',
      base_commission_rate: 4.0,
      color_theme: '#3b82f6',
      current_level: 'Chic Ouro',
      badge: '⚡ Foguete de Vendas'
    },
    {
      name: 'Mariana Prado',
      nickname: 'Chic Diamante',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80',
      email: 'mariana.prado@atelievest.com.br',
      phone: '(11) 96543-2109',
      hire_date: '2024-01-20',
      base_commission_rate: 4.2,
      color_theme: '#ec4899',
      current_level: 'Ícone Diamante',
      badge: '💎 Rainha dos Acessórios'
    },
    {
      name: 'Beatriz Lima',
      nickname: 'Alta-Costura',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=250&q=80',
      email: 'beatriz.lima@atelievest.com.br',
      phone: '(11) 95432-1098',
      hire_date: '2024-03-01',
      base_commission_rate: 4.0,
      color_theme: '#10b981',
      current_level: 'Chic Ouro',
      badge: '🎯 Precisão de Meta'
    },
    {
      name: 'Rodrigo Mendes',
      nickname: 'Mestre da Alfaiataria',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
      email: 'rodrigo.mendes@atelievest.com.br',
      phone: '(11) 94321-0987',
      hire_date: '2024-06-15',
      base_commission_rate: 3.8,
      color_theme: '#8b5cf6',
      current_level: 'Estilo Prata',
      badge: '👔 Fidelizador VIP'
    },
    {
      name: 'Sofia Nogueira',
      nickname: 'Revelação Fashion',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80',
      email: 'sofia.nogueira@atelievest.com.br',
      phone: '(11) 93210-9876',
      hire_date: '2025-01-10',
      base_commission_rate: 3.5,
      color_theme: '#06b6d4',
      current_level: 'Estilo Prata',
      badge: '🚀 Estrela Revelação'
    }
  ];

  const insertSeller = db.prepare(`
    INSERT INTO sellers (name, nickname, avatar, email, phone, hire_date, base_commission_rate, color_theme, current_level, badge)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const sellerIds = [];
  for (const s of sellers) {
    const res = insertSeller.run(
      s.name, s.nickname, s.avatar, s.email, s.phone, s.hire_date,
      s.base_commission_rate, s.color_theme, s.current_level, s.badge
    );
    sellerIds.push(Number(res.lastInsertRowid));
  }

  // 3. Inserir Campanhas Sazonais (Passadas e Ativa)
  const campaigns = [
    {
      title: 'Black Friday Fashion Glam',
      description: 'Super comissão em todas as peças para liquidar a coleção de fim de ano!',
      start_date: '2025-11-20',
      end_date: '2025-11-30',
      bonus_rate: 2.0,
      category_target: 'TODAS',
      is_active: 0,
      color: '#111827',
      icon: '🖤'
    },
    {
      title: 'Natal de Gala & Festas',
      description: 'Campanha de vestidos e ternos para eventos de fim de ano com bônus dobrado.',
      start_date: '2025-12-01',
      end_date: '2025-12-25',
      bonus_rate: 2.5,
      category_target: 'Vestidos & Festas',
      is_active: 0,
      color: '#dc2626',
      icon: '🎄'
    },
    {
      title: 'Festival de Inverno & Tricot',
      description: 'Acelere as vendas de casacos, jaquetas de couro e peças em lã com +1.5%.',
      start_date: '2026-06-01',
      end_date: '2026-07-31',
      bonus_rate: 1.5,
      category_target: 'Casacos & Tricot',
      is_active: 0,
      color: '#2563eb',
      icon: '❄️'
    },
    {
      title: 'Primavera-Verão Alto Luxo 2027',
      description: 'Campanha ativa atual! Bônus de 2% para toda a nova coleção e vestidos.',
      start_date: '2026-09-15',
      end_date: '2026-10-31',
      bonus_rate: 2.0,
      category_target: 'TODAS',
      is_active: 1,
      color: '#ec4899',
      icon: '🌸'
    }
  ];

  const insertCampaign = db.prepare(`
    INSERT INTO campaigns (title, description, start_date, end_date, bonus_rate, category_target, is_active, color, icon)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const campaignIds = [];
  for (const c of campaigns) {
    const res = insertCampaign.run(
      c.title, c.description, c.start_date, c.end_date, c.bonus_rate,
      c.category_target, c.is_active, c.color, c.icon
    );
    campaignIds.push(Number(res.lastInsertRowid));
  }

  // 4. Inserir Metas Mensais para os últimos 13 meses (2025-10 até 2026-10)
  const periods = [
    '2025-10', '2025-11', '2025-12',
    '2026-01', '2026-02', '2026-03', '2026-04',
    '2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10'
  ];

  const insertGoal = db.prepare(`
    INSERT INTO goals (period, seller_id, target_amount, super_target_amount, bonus_multiplier)
    VALUES (?, ?, ?, ?, ?)
  `);

  // Metas individuais típicas de moda
  const sellerBaseGoals = [35000, 32000, 30000, 28000, 25000, 22000];

  for (const period of periods) {
    let multiplier = 1.0;
    if (period.endsWith('-11')) multiplier = 1.4; // Black Friday
    if (period.endsWith('-12')) multiplier = 1.6; // Natal
    if (period.endsWith('-05')) multiplier = 1.25; // Dia das Mães

    const companyTarget = Math.round(180000 * multiplier);
    const companySuperTarget = Math.round(companyTarget * 1.25);

    // Meta geral da empresa
    insertGoal.run(period, null, companyTarget, companySuperTarget, 1.3);

    // Metas de cada vendedor
    sellerIds.forEach((sellerId, idx) => {
      const target = Math.round(sellerBaseGoals[idx] * multiplier);
      const superTarget = Math.round(target * 1.2);
      insertGoal.run(period, sellerId, target, superTarget, 1.25);
    });
  }

  // 5. Gerar Vendas com 1 Ano de Dados
  const customers = [
    'Fernanda Medeiros', 'Cláudia Alencar', 'Thiago Silveira', 'Juliana Paiva',
    'Rafael Cortez', 'Marina Ruy', 'Patrícia Poeta', 'Bruno Gagliasso',
    'Camila Pitanga', 'Luciana Gimenez', 'Ana Hickmann', 'Rodrigo Hilbert',
    'Isabella Fiorentino', 'Grazi Massafera', 'Caio Castro', 'Deborah Secco',
    'Cauã Reymond', 'Sabrina Sato', 'Mariana Ximenes', 'Marcos Mion',
    'Bárbara Paz', 'Paolla Oliveira', 'Alice Wegmann', 'Chay Suede'
  ];

  const itemsPool = [
    { cat: 'Vestidos & Festas', min: 450, max: 2800, items: [1, 2, 3] },
    { cat: 'Alfaiataria & Camisaria', min: 380, max: 2200, items: [1, 2, 3, 4] },
    { cat: 'Jeans & Casual Chic', min: 180, max: 950, items: [1, 2, 4, 5] },
    { cat: 'Casacos & Tricot', min: 320, max: 2400, items: [1, 2, 3] },
    { cat: 'Moda Praia & Resort', min: 220, max: 1100, items: [1, 2, 3] },
    { cat: 'Calçados & Bolsas de Couro', min: 350, max: 2900, items: [1, 2] },
    { cat: 'Acessórios & Semijoias', min: 120, max: 750, items: [2, 3, 5] }
  ];

  const paymentMethods = ['Cartão Crédito (3x)', 'Cartão Crédito (6x)', 'Pix (À vista)', 'Cartão Débito'];

  const insertSale = db.prepare(`
    INSERT INTO sales (
      code, seller_id, customer_name, category, items_count, total_amount,
      base_commission_rate, campaign_id, campaign_bonus_rate, total_commission_rate,
      commission_amount, payment_method, sale_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let saleCounter = 1000;
  const now = new Date('2026-10-03T17:50:00');
  let totalSalesInserted = 0;

  // Gerar vendas para cada mês dos últimos 12 meses
  for (let monthOffset = 12; monthOffset >= 0; monthOffset--) {
    const d = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    const daysInMonth = (monthOffset === 0) ? now.getDate() : new Date(year, month + 1, 0).getDate();

    // Sazonalidade de volume
    let monthlyVolumeFactor = 1.0;
    if (month === 10) monthlyVolumeFactor = 1.5; // Nov (Black Friday)
    if (month === 11) monthlyVolumeFactor = 1.8; // Dez (Natal)
    if (month === 4) monthlyVolumeFactor = 1.3;  // Mai (Mães)
    if (month === 6) monthlyVolumeFactor = 1.2;  // Jul (Inverno)

    const salesInThisMonth = Math.round((55 + Math.random() * 25) * monthlyVolumeFactor);

    for (let i = 0; i < salesInThisMonth; i++) {
      saleCounter++;
      const day = Math.min(daysInMonth, Math.max(1, Math.floor(Math.random() * daysInMonth) + 1));
      const hour = Math.floor(Math.random() * 11) + 10; // 10h as 21h (loja aberta)
      const min = Math.floor(Math.random() * 60);
      const sec = Math.floor(Math.random() * 60);

      const saleDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
      
      // Escolha do vendedor com pesos (Camila e Lucas vendem mais)
      const sellerWeights = [0.24, 0.22, 0.18, 0.15, 0.12, 0.09];
      let r = Math.random();
      let sellerIdx = 0;
      let accum = 0;
      for (let s = 0; s < sellerWeights.length; s++) {
        accum += sellerWeights[s];
        if (r <= accum) {
          sellerIdx = s;
          break;
        }
      }
      const sellerId = sellerIds[sellerIdx];
      const sellerObj = sellers[sellerIdx];

      // Item & categoria
      const catConfig = itemsPool[Math.floor(Math.random() * itemsPool.length)];
      const itemsCount = catConfig.items[Math.floor(Math.random() * catConfig.items.length)];
      const totalAmount = Math.round((catConfig.min + Math.random() * (catConfig.max - catConfig.min)) * 100) / 100;
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const payMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

      // Verificar campanha ativa no período da venda
      let campaignId = null;
      let campaignBonus = 0;

      const datePart = saleDateStr.split(' ')[0];
      for (let cIdx = 0; cIdx < campaigns.length; cIdx++) {
        const camp = campaigns[cIdx];
        if (datePart >= camp.start_date && datePart <= camp.end_date) {
          if (camp.category_target === 'TODAS' || camp.category_target === catConfig.cat) {
            campaignId = campaignIds[cIdx];
            campaignBonus = camp.bonus_rate;
            break;
          }
        }
      }

      const baseRate = sellerObj.base_commission_rate;
      const totalRate = Math.round((baseRate + campaignBonus) * 10) / 10;
      const commissionAmount = Math.round((totalAmount * (totalRate / 100)) * 100) / 100;
      const saleCode = `VND-${year}-${String(saleCounter).padStart(5, '0')}`;

      insertSale.run(
        saleCode, sellerId, customer, catConfig.cat, itemsCount, totalAmount,
        baseRate, campaignId, campaignBonus, totalRate, commissionAmount,
        payMethod, saleDateStr
      );
      totalSalesInserted++;
    }
  }

  console.log(`✅ Sucesso! Inseridos:
  - ${sellers.length} Vendedores cadastrados com perfis e avatares
  - ${categories.length} Categorias de moda com ícones
  - ${campaigns.length} Campanhas sazonais configuradas
  - ${periods.length} Períodos com metas individuais e corporativas
  - ${totalSalesInserted} Vendas realistas geradas ao longo de 1 ano!`);
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
