const express = require('express');
const cors = require('cors');
const path = require('node:path');
const { db, initSchema } = require('./db');
const { seedDatabase } = require('./seed');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ensure schema is ready
initSchema();

// Helper to get default current period
function getCurrentPeriod() {
  const now = new Date('2026-10-03T17:50:00');
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

// 1. Dashboard Summary
app.get('/api/dashboard', (req, res) => {
  try {
    const period = req.query.period || getCurrentPeriod();

    // Summary stats for period
    const statsQuery = db.prepare(`
      SELECT 
        COALESCE(SUM(total_amount), 0) AS total_sales,
        COALESCE(SUM(commission_amount), 0) AS total_commission,
        COUNT(id) AS sales_count,
        COALESCE(AVG(total_amount), 0) AS avg_ticket
      FROM sales
      WHERE strftime('%Y-%m', sale_date) = ?
    `);
    const stats = statsQuery.get(period);

    // Company Goal for period
    const companyGoalQuery = db.prepare(`
      SELECT target_amount, super_target_amount, bonus_multiplier
      FROM goals
      WHERE period = ? AND seller_id IS NULL
    `);
    let companyGoal = companyGoalQuery.get(period);
    if (!companyGoal) {
      companyGoal = { target_amount: 180000, super_target_amount: 225000, bonus_multiplier: 1.25 };
    }

    const totalSales = Number(stats.total_sales);
    const targetAmount = Number(companyGoal.target_amount);
    const superTarget = Number(companyGoal.super_target_amount);
    const percentReached = targetAmount > 0 ? Math.round((totalSales / targetAmount) * 1000) / 10 : 0;
    const isSuperReached = totalSales >= superTarget;

    // Top seller this month
    const topSellerQuery = db.prepare(`
      SELECT 
        s.id, s.name, s.nickname, s.avatar, s.color_theme, s.badge,
        SUM(sa.total_amount) as seller_total,
        SUM(sa.commission_amount) as seller_commission
      FROM sellers s
      JOIN sales sa ON s.id = sa.seller_id
      WHERE strftime('%Y-%m', sa.sale_date) = ?
      GROUP BY s.id
      ORDER BY seller_total DESC
      LIMIT 1
    `);
    const topSeller = topSellerQuery.get(period) || null;

    // Active campaigns
    const activeCampaigns = db.prepare(`
      SELECT * FROM campaigns WHERE is_active = 1
    `).all();

    // All available periods in sales
    const availablePeriods = db.prepare(`
      SELECT DISTINCT strftime('%Y-%m', sale_date) AS period
      FROM sales
      ORDER BY period DESC
    `).all().map(r => r.period);

    res.json({
      period,
      total_sales: totalSales,
      total_commission: Number(stats.total_commission),
      sales_count: Number(stats.sales_count),
      avg_ticket: Math.round(Number(stats.avg_ticket) * 100) / 100,
      company_goal: {
        target: targetAmount,
        super_target: superTarget,
        percent: percentReached,
        is_reached: totalSales >= targetAmount,
        is_super_reached: isSuperReached,
        remaining_to_goal: Math.max(0, targetAmount - totalSales),
        remaining_to_super: Math.max(0, superTarget - totalSales)
      },
      top_seller: topSeller,
      active_campaigns: activeCampaigns,
      available_periods: availablePeriods
    });
  } catch (error) {
    console.error('Error in /api/dashboard:', error);
    res.status(500).json({ error: error.message });
  }
});

// 2. Gamified Ranking / Leaderboard
app.get('/api/ranking', (req, res) => {
  try {
    const period = req.query.period || getCurrentPeriod();

    const sellers = db.prepare('SELECT * FROM sellers ORDER BY id ASC').all();

    const ranking = sellers.map(seller => {
      // Sales stats for this seller in period
      const sStats = db.prepare(`
        SELECT 
          COALESCE(SUM(total_amount), 0) AS total_sales,
          COALESCE(SUM(commission_amount), 0) AS total_commission,
          COALESCE(SUM(campaign_bonus_rate * total_amount / 100), 0) AS campaign_bonus_total,
          COUNT(id) AS sales_count,
          COALESCE(AVG(total_amount), 0) AS avg_ticket
        FROM sales
        WHERE seller_id = ? AND strftime('%Y-%m', sale_date) = ?
      `).get(seller.id, period);

      // Goal for this seller
      const goal = db.prepare(`
        SELECT target_amount, super_target_amount, bonus_multiplier
        FROM goals
        WHERE period = ? AND seller_id = ?
      `).get(period, seller.id) || { target_amount: 30000, super_target_amount: 36000, bonus_multiplier: 1.25 };

      const totalSales = Number(sStats.total_sales);
      const target = Number(goal.target_amount);
      const superTarget = Number(goal.super_target_amount);
      const percent = target > 0 ? Math.round((totalSales / target) * 1000) / 10 : 0;
      const superPercent = superTarget > 0 ? Math.round((totalSales / superTarget) * 1000) / 10 : 0;

      // Dynamic Gamification level & badges
      let dynamicLevel = seller.current_level;
      if (percent >= 120) dynamicLevel = '👑 Lenda da Moda';
      else if (percent >= 100) dynamicLevel = '💎 Ícone Diamante';
      else if (percent >= 75) dynamicLevel = '✨ Chic Ouro';
      else if (percent >= 50) dynamicLevel = '🥈 Estilo Prata';
      else dynamicLevel = '🥉 Novato Promissor';

      const badges = [];
      if (percent >= 100) badges.push({ icon: '🎯', label: 'Meta Batida', color: '#10b981' });
      if (percent >= 120) badges.push({ icon: '🚀', label: 'Super Meta (+Bônus)', color: '#ec4899' });
      if (Number(sStats.avg_ticket) > 1200) badges.push({ icon: '💎', label: 'Ticket Alto', color: '#8b5cf6' });
      if (Number(sStats.sales_count) >= 15) badges.push({ icon: '⚡', label: 'Máquina de Vendas', color: '#f59e0b' });
      if (Number(sStats.campaign_bonus_total) > 200) badges.push({ icon: '🌟', label: 'Mestre da Campanha', color: '#06b6d4' });

      return {
        id: seller.id,
        name: seller.name,
        nickname: seller.nickname,
        avatar: seller.avatar,
        email: seller.email,
        phone: seller.phone,
        color_theme: seller.color_theme,
        base_commission_rate: seller.base_commission_rate,
        level: dynamicLevel,
        badge: seller.badge,
        badges,
        total_sales: totalSales,
        total_commission: Number(sStats.total_commission),
        campaign_bonus_total: Number(sStats.campaign_bonus_total),
        sales_count: Number(sStats.sales_count),
        avg_ticket: Math.round(Number(sStats.avg_ticket) * 100) / 100,
        goal: {
          target,
          super_target: superTarget,
          percent,
          super_percent: superPercent,
          is_reached: totalSales >= target,
          is_super_reached: totalSales >= superTarget,
          remaining: Math.max(0, target - totalSales)
        }
      };
    });

    // Sort descending by total_sales
    ranking.sort((a, b) => b.total_sales - a.total_sales);

    // Compute rank positions & distance to next
    ranking.forEach((item, index) => {
      item.position = index + 1;
      if (index === 0) {
        item.diff_to_next = 0; // Leader
        item.podium_title = '🥇 1º Lugar - Campeão do Mês';
      } else {
        const leader = ranking[index - 1];
        item.diff_to_next = Math.round((leader.total_sales - item.total_sales) * 100) / 100;
        item.ahead_name = leader.nickname;
        if (index === 1) item.podium_title = '🥈 2º Lugar - Vice-Campeão';
        else if (index === 2) item.podium_title = '🥉 3º Lugar - Pódio Fashion';
        else item.podium_title = `${item.position}º Lugar`;
      }
    });

    res.json({ period, ranking });
  } catch (error) {
    console.error('Error in /api/ranking:', error);
    res.status(500).json({ error: error.message });
  }
});

// 3. Single Seller Profile & Details
app.get('/api/sellers/:id', (req, res) => {
  try {
    const sellerId = req.params.id;
    const period = req.query.period || getCurrentPeriod();

    const seller = db.prepare('SELECT * FROM sellers WHERE id = ?').get(sellerId);
    if (!seller) return res.status(404).json({ error: 'Vendedor não encontrado' });

    // Period sales
    const sales = db.prepare(`
      SELECT * FROM sales
      WHERE seller_id = ? AND strftime('%Y-%m', sale_date) = ?
      ORDER BY sale_date DESC
    `).all(sellerId, period);

    // Categories breakdown
    const categoriesBreakdown = db.prepare(`
      SELECT 
        category,
        COUNT(id) as count,
        SUM(total_amount) as total,
        SUM(commission_amount) as commission
      FROM sales
      WHERE seller_id = ? AND strftime('%Y-%m', sale_date) = ?
      GROUP BY category
      ORDER BY total DESC
    `).all(sellerId, period);

    // Goal
    const goal = db.prepare(`
      SELECT * FROM goals
      WHERE seller_id = ? AND period = ?
    `).get(sellerId, period) || { target_amount: 30000, super_target_amount: 36000, bonus_multiplier: 1.25 };

    const totalSales = sales.reduce((acc, s) => acc + Number(s.total_amount), 0);
    const totalCommission = sales.reduce((acc, s) => acc + Number(s.commission_amount), 0);
    const target = Number(goal.target_amount);
    const percent = target > 0 ? Math.round((totalSales / target) * 1000) / 10 : 0;

    res.json({
      seller,
      period,
      total_sales: totalSales,
      total_commission: totalCommission,
      sales_count: sales.length,
      goal: {
        ...goal,
        percent,
        is_reached: totalSales >= target
      },
      categories_breakdown: categoriesBreakdown,
      recent_sales: sales.slice(0, 10)
    });
  } catch (error) {
    console.error('Error in /api/sellers/:id:', error);
    res.status(500).json({ error: error.message });
  }
});

// 4. Analytics: 12-month evolution & Categories
app.get('/api/analytics', (req, res) => {
  try {
    // 12-month evolution
    const monthlyHistory = db.prepare(`
      SELECT 
        strftime('%Y-%m', sale_date) AS month,
        COUNT(id) AS sales_count,
        ROUND(SUM(total_amount), 2) AS total_sales,
        ROUND(SUM(commission_amount), 2) AS total_commission
      FROM sales
      GROUP BY strftime('%Y-%m', sale_date)
      ORDER BY month ASC
    `).all();

    // Sales by Category
    const categoryStats = db.prepare(`
      SELECT 
        category,
        COUNT(id) AS sales_count,
        ROUND(SUM(total_amount), 2) AS total_amount,
        ROUND(SUM(commission_amount), 2) AS total_commission
      FROM sales
      GROUP BY category
      ORDER BY total_amount DESC
    `).all();

    // Sales by Payment Method
    const paymentStats = db.prepare(`
      SELECT 
        payment_method,
        COUNT(id) AS count,
        ROUND(SUM(total_amount), 2) AS total
      FROM sales
      GROUP BY payment_method
      ORDER BY total DESC
    `).all();

    res.json({
      monthly_history: monthlyHistory,
      categories: categoryStats,
      payments: paymentStats
    });
  } catch (error) {
    console.error('Error in /api/analytics:', error);
    res.status(500).json({ error: error.message });
  }
});

// 5. Campaigns
app.get('/api/campaigns', (req, res) => {
  try {
    const campaigns = db.prepare('SELECT * FROM campaigns ORDER BY start_date DESC').all();

    // Augment with sales metrics
    const enhanced = campaigns.map(c => {
      const metrics = db.prepare(`
        SELECT 
          COUNT(id) AS sales_count,
          COALESCE(SUM(total_amount), 0) AS total_sales,
          COALESCE(SUM(campaign_bonus_rate * total_amount / 100), 0) AS total_bonus_paid
        FROM sales
        WHERE campaign_id = ?
      `).get(c.id);

      return {
        ...c,
        sales_count: Number(metrics.sales_count),
        total_sales: Number(metrics.total_sales),
        total_bonus_paid: Number(metrics.total_bonus_paid)
      };
    });

    res.json(enhanced);
  } catch (error) {
    console.error('Error in /api/campaigns:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/campaigns', (req, res) => {
  try {
    const { title, description, start_date, end_date, bonus_rate, category_target, color, icon } = req.body;
    if (!title || !start_date || !end_date || bonus_rate === undefined) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
    }

    const insert = db.prepare(`
      INSERT INTO campaigns (title, description, start_date, end_date, bonus_rate, category_target, is_active, color, icon)
      VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)
    `);

    const result = insert.run(
      title,
      description || '',
      start_date,
      end_date,
      Number(bonus_rate),
      category_target || 'TODAS',
      color || '#ec4899',
      icon || '✨'
    );

    res.status(201).json({ id: Number(result.lastInsertRowid), success: true });
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/campaigns/:id/toggle', (req, res) => {
  try {
    const campaignId = req.params.id;
    const campaign = db.prepare('SELECT is_active FROM campaigns WHERE id = ?').get(campaignId);
    if (!campaign) return res.status(404).json({ error: 'Campanha não encontrada' });

    const newStatus = campaign.is_active ? 0 : 1;
    db.prepare('UPDATE campaigns SET is_active = ? WHERE id = ?').run(newStatus, campaignId);

    res.json({ id: campaignId, is_active: newStatus });
  } catch (error) {
    console.error('Error toggling campaign:', error);
    res.status(500).json({ error: error.message });
  }
});

// 6. Sales Management
app.get('/api/sales', (req, res) => {
  try {
    const { period, seller_id, category, limit = 50 } = req.query;

    let query = `
      SELECT 
        s.*,
        sel.name AS seller_name,
        sel.nickname AS seller_nickname,
        sel.avatar AS seller_avatar,
        c.title AS campaign_title
      FROM sales s
      JOIN sellers sel ON s.seller_id = sel.id
      LEFT JOIN campaigns c ON s.campaign_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (period) {
      query += ` AND strftime('%Y-%m', s.sale_date) = ?`;
      params.push(period);
    }
    if (seller_id) {
      query += ` AND s.seller_id = ?`;
      params.push(seller_id);
    }
    if (category) {
      query += ` AND s.category = ?`;
      params.push(category);
    }

    query += ` ORDER BY s.sale_date DESC LIMIT ?`;
    params.push(Number(limit));

    const sales = db.prepare(query).all(...params);
    res.json(sales);
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new sale (Real-time calculation & gamification trigger!)
app.post('/api/sales', (req, res) => {
  try {
    const { seller_id, customer_name, category, total_amount, payment_method, items_count = 1 } = req.body;
    if (!seller_id || !category || !total_amount) {
      return res.status(400).json({ error: 'Dados incompletos para registrar venda.' });
    }

    const seller = db.prepare('SELECT * FROM sellers WHERE id = ?').get(seller_id);
    if (!seller) return res.status(404).json({ error: 'Vendedor não encontrado.' });

    const amount = Number(total_amount);
    const baseRate = Number(seller.base_commission_rate);

    // Check active campaign matching date & category
    const today = new Date().toISOString().split('T')[0];
    const activeCampaign = db.prepare(`
      SELECT * FROM campaigns 
      WHERE is_active = 1 
        AND ? BETWEEN start_date AND end_date
        AND (category_target = 'TODAS' OR category_target = ?)
      ORDER BY bonus_rate DESC
      LIMIT 1
    `).get(today, category);

    const campaignBonus = activeCampaign ? Number(activeCampaign.bonus_rate) : 0;
    const campaignId = activeCampaign ? activeCampaign.id : null;
    const totalRate = Math.round((baseRate + campaignBonus) * 10) / 10;
    const commissionAmount = Math.round((amount * (totalRate / 100)) * 100) / 100;

    const now = new Date();
    const saleDateStr = now.toISOString().replace('T', ' ').substring(0, 19);
    const saleCode = `VND-${now.getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const insert = db.prepare(`
      INSERT INTO sales (
        code, seller_id, customer_name, category, items_count, total_amount,
        base_commission_rate, campaign_id, campaign_bonus_rate, total_commission_rate,
        commission_amount, payment_method, sale_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      saleCode, seller_id, customer_name || 'Cliente Balcão', category,
      Number(items_count), amount, baseRate, campaignId, campaignBonus,
      totalRate, commissionAmount, payment_method || 'Cartão Crédito', saleDateStr
    );

    // Check if seller reached monthly goal with this sale
    const currentPeriod = saleDateStr.substring(0, 7);
    const goal = db.prepare(`
      SELECT target_amount FROM goals WHERE seller_id = ? AND period = ?
    `).get(seller_id, currentPeriod);

    const sellerMonthTotal = db.prepare(`
      SELECT SUM(total_amount) as total FROM sales 
      WHERE seller_id = ? AND strftime('%Y-%m', sale_date) = ?
    `).get(seller_id, currentPeriod).total;

    const justHitGoal = goal && (sellerMonthTotal >= goal.target_amount) && ((sellerMonthTotal - amount) < goal.target_amount);

    res.status(201).json({
      success: true,
      sale_id: Number(result.lastInsertRowid),
      code: saleCode,
      commission_amount: commissionAmount,
      total_rate: totalRate,
      campaign_bonus: campaignBonus,
      campaign_name: activeCampaign ? activeCampaign.title : null,
      seller_name: seller.name,
      just_hit_goal: !!justHitGoal
    });
  } catch (error) {
    console.error('Error creating sale:', error);
    res.status(500).json({ error: error.message });
  }
});

// Categories list
app.get('/api/categories', (req, res) => {
  try {
    const categories = db.prepare('SELECT * FROM categories ORDER BY name ASC').all();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset database / seed again
app.post('/api/reset-seed', (req, res) => {
  try {
    seedDatabase();
    res.json({ success: true, message: 'Dados restaurados com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✨ ATELIER COMISSÕES rodando com sucesso em http://localhost:${PORT}`);
});
