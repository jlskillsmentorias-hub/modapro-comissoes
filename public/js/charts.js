// Charts Controller using Chart.js
class ChartsManager {
  constructor() {
    this.historyChart = null;
    this.categoriesChart = null;
    this.sellersChart = null;
  }

  // 1. History Trend Chart (12 Months)
  renderHistoryChart(monthlyData) {
    const ctx = document.getElementById('chartHistory');
    if (!ctx) return;

    if (this.historyChart) {
      this.historyChart.destroy();
    }

    const monthLabels = {
      '2025-10': 'Out/25',
      '2025-11': 'Nov/25 (Black)',
      '2025-12': 'Dez/25 (Natal)',
      '2026-01': 'Jan/26',
      '2026-02': 'Fev/26',
      '2026-03': 'Mar/26',
      '2026-04': 'Abr/26',
      '2026-05': 'Mai/26 (Mães)',
      '2026-06': 'Jun/26',
      '2026-07': 'Jul/26 (Inverno)',
      '2026-08': 'Ago/26',
      '2026-09': 'Set/26',
      '2026-10': 'Out/26 (Atual)'
    };

    const labels = monthlyData.map(d => monthLabels[d.month] || d.month);
    const salesValues = monthlyData.map(d => d.total_sales);
    const commissionValues = monthlyData.map(d => d.total_commission);

    this.historyChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Faturamento Total (R$)',
            data: salesValues,
            borderColor: '#0071e3',
            backgroundColor: 'rgba(0, 113, 227, 0.08)',
            fill: true,
            tension: 0.35,
            borderWidth: 2.5,
            pointBackgroundColor: '#0071e3',
            pointRadius: 5,
            yAxisID: 'y'
          },
          {
            label: 'Comissões Pagas à Equipe (R$)',
            data: commissionValues,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            fill: true,
            tension: 0.35,
            borderWidth: 2,
            pointBackgroundColor: '#34d399',
            pointRadius: 4,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#6e6e73',
              font: { family: "Inter, -apple-system, BlinkMacSystemFont, sans-serif", size: 12 }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(17, 24, 39, 0.95)',
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
            titleColor: '#fff',
            bodyColor: '#cbd5e1',
            padding: 12,
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: ${window.gamification.formatCurrency(context.raw)}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(0, 0, 0, 0.06)' },
            ticks: { color: '#86868b', font: { size: 11 } }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            grid: { color: 'rgba(0, 0, 0, 0.06)' },
            ticks: {
              color: '#0071e3',
              callback: value => 'R$ ' + (value / 1000).toFixed(0) + 'k'
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            grid: { drawOnChartArea: false },
            ticks: {
              color: '#10b981',
              callback: value => 'R$ ' + (value / 1000).toFixed(0) + 'k'
            }
          }
        }
      }
    });
  }

  // 2. Categories Donut Chart
  renderCategoriesChart(categoriesData) {
    const ctx = document.getElementById('chartCategories');
    if (!ctx) return;

    if (this.categoriesChart) {
      this.categoriesChart.destroy();
    }

    const labels = categoriesData.map(c => c.category);
    const data = categoriesData.map(c => c.total_amount);

    const colors = [
      '#ec4899', // Vestidos
      '#3b82f6', // Alfaiataria
      '#f59e0b', // Jeans
      '#8b5cf6', // Casacos
      '#06b6d4', // Moda Praia
      '#10b981', // Calçados
      '#f97316'  // Acessórios
    ];

    this.categoriesChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderColor: '#ffffff',
          borderWidth: 3,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: '#6e6e73',
              font: { family: "Inter, -apple-system, BlinkMacSystemFont, sans-serif", size: 11 },
              boxWidth: 14,
              padding: 10
            }
          },
          tooltip: {
            backgroundColor: 'rgba(17, 24, 39, 0.95)',
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
            callbacks: {
              label: function(context) {
                const val = context.raw;
                const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                const pct = ((val / total) * 100).toFixed(1);
                return `${context.label}: ${window.gamification.formatCurrency(val)} (${pct}%)`;
              }
            }
          }
        },
        cutout: '65%'
      }
    });
  }

  // 3. Sellers Comparison Bar Chart
  renderSellersChart(rankingData) {
    const ctx = document.getElementById('chartSellers');
    if (!ctx) return;

    if (this.sellersChart) {
      this.sellersChart.destroy();
    }

    const labels = rankingData.map(r => r.nickname);
    const sales = rankingData.map(r => r.total_sales);
    const targets = rankingData.map(r => r.goal.target);

    this.sellersChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Vendas Realizadas',
            data: sales,
            backgroundColor: rankingData.map(r => r.color_theme || '#6366f1'),
            borderRadius: 6
          },
          {
            label: 'Meta do Mês',
            data: targets,
            backgroundColor: 'rgba(0, 0, 0, 0.06)',
            borderColor: 'rgba(0, 0, 0, 0.08)',
            borderWidth: 1,
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#6e6e73' }
          },
          tooltip: {
            backgroundColor: 'rgba(17, 24, 39, 0.95)',
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: ${window.gamification.formatCurrency(context.raw)}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#6e6e73' }
          },
          y: {
            grid: { color: 'rgba(0, 0, 0, 0.06)' },
            ticks: {
              color: '#86868b',
              callback: value => 'R$ ' + (value / 1000).toFixed(0) + 'k'
            }
          }
        }
      }
    });
  }
}

window.chartsManager = new ChartsManager();
