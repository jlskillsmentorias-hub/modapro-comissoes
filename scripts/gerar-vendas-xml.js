#!/usr/bin/env node
/**
 * Gerador de arquivo XML de vendas fictícias para teste do ATELIER VESTT.
 *
 * Produz um mês completo de vendas aleatórias (mas determinísticas por seed),
 * coerentes com o schema da tabela `sales` e com as regras de comissão do
 * sistema (taxa base do consultor + bônus da campanha sazonal ativa).
 *
 * Uso:
 *   node scripts/gerar-vendas-xml.js
 *   node scripts/gerar-vendas-xml.js --periodo=2026-10 --seed=42
 *   node scripts/gerar-vendas-xml.js --periodo=2026-11 --saida=data/nov.xml
 */

const fs = require('node:fs');
const path = require('node:path');

// ---------------------------------------------------------------------------
// Argumentos de linha de comando
// ---------------------------------------------------------------------------
function parseArgs(argv) {
  const args = {};
  for (const raw of argv.slice(2)) {
    const match = /^--([^=]+)=(.*)$/.exec(raw);
    if (match) args[match[1]] = match[2];
  }
  return args;
}

const args = parseArgs(process.argv);
const PERIODO = args.periodo || '2026-10';
const SEED = Number(args.seed || 20261001);
const SAIDA = args.saida || path.join('data', `vendas-teste-${PERIODO}.xml`);

if (!/^\d{4}-\d{2}$/.test(PERIODO)) {
  console.error(`Período inválido: "${PERIODO}". Use o formato YYYY-MM.`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Gerador pseudoaleatório determinístico (mulberry32)
// ---------------------------------------------------------------------------
function criarRandom(seed) {
  let a = seed >>> 0;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = criarRandom(SEED);
const inteiro = (min, max) => Math.floor(random() * (max - min + 1)) + min;
const escolher = (lista) => lista[Math.floor(random() * lista.length)];
const dinheiro = (valor) => Math.round(valor * 100) / 100;

// ---------------------------------------------------------------------------
// Dados de referência (espelham o cadastro do sistema)
// ---------------------------------------------------------------------------
const vendedores = [
  { id: 1, nome: 'Camila Rossi', apelido: 'Musa do Luxo', taxa: 4.5, peso: 0.24 },
  { id: 2, nome: 'Lucas Silveira', apelido: 'Foguete Casual', taxa: 4.0, peso: 0.22 },
  { id: 3, nome: 'Mariana Prado', apelido: 'Chic Diamante', taxa: 4.2, peso: 0.18 },
  { id: 4, nome: 'Beatriz Lima', apelido: 'Alta-Costura', taxa: 4.0, peso: 0.15 },
  { id: 5, nome: 'Rodrigo Mendes', apelido: 'Mestre da Alfaiataria', taxa: 3.8, peso: 0.12 },
  { id: 6, nome: 'Sofia Nogueira', apelido: 'Revelação Fashion', taxa: 3.5, peso: 0.09 }
];

const categorias = [
  { nome: 'Vestidos & Festas', icone: '👗', minimo: 450, maximo: 2800, pecas: [1, 2, 3] },
  { nome: 'Alfaiataria & Camisaria', icone: '👔', minimo: 380, maximo: 2200, pecas: [1, 2, 3, 4] },
  { nome: 'Jeans & Casual Chic', icone: '👖', minimo: 180, maximo: 950, pecas: [1, 2, 4, 5] },
  { nome: 'Casacos & Tricot', icone: '🧥', minimo: 320, maximo: 2400, pecas: [1, 2, 3] },
  { nome: 'Moda Praia & Resort', icone: '👙', minimo: 220, maximo: 1100, pecas: [1, 2, 3] },
  { nome: 'Calçados & Bolsas de Couro', icone: '👠', minimo: 350, maximo: 2900, pecas: [1, 2] },
  { nome: 'Acessórios & Semijoias', icone: '💍', minimo: 120, maximo: 750, pecas: [2, 3, 5] }
];

const campanhas = [
  {
    id: 1,
    titulo: 'Black Friday Fashion Glam',
    inicio: '2025-11-20',
    fim: '2025-11-30',
    bonus: 2.0,
    alvo: 'TODAS'
  },
  {
    id: 2,
    titulo: 'Natal de Gala & Festas',
    inicio: '2025-12-01',
    fim: '2025-12-25',
    bonus: 2.5,
    alvo: 'Vestidos & Festas'
  },
  {
    id: 3,
    titulo: 'Festival de Inverno & Tricot',
    inicio: '2026-06-01',
    fim: '2026-07-31',
    bonus: 1.5,
    alvo: 'Casacos & Tricot'
  },
  {
    id: 4,
    titulo: 'Primavera-Verão Alto Luxo 2027',
    inicio: '2026-09-15',
    fim: '2026-10-31',
    bonus: 2.0,
    alvo: 'TODAS'
  }
];

const clientes = [
  'Fernanda Medeiros', 'Cláudia Alencar', 'Thiago Silveira', 'Juliana Paiva',
  'Rafael Cortez', 'Marina Ruy', 'Patrícia Poeta', 'Bruno Gagliasso',
  'Camila Pitanga', 'Luciana Gimenez', 'Ana Hickmann', 'Rodrigo Hilbert',
  'Isabella Fiorentino', 'Grazi Massafera', 'Caio Castro', 'Deborah Secco',
  'Cauã Reymond', 'Sabrina Sato', 'Mariana Ximenes', 'Marcos Mion',
  'Bárbara Paz', 'Paolla Oliveira', 'Alice Wegmann', 'Chay Suede',
  'Letícia Spiller', 'Vera Fischer', 'Sônia Braga', 'Christiane Torloni'
];

const formasPagamento = [
  'Cartão Crédito (3x)', 'Cartão Crédito (6x)', 'Pix (À vista)', 'Cartão Débito'
];

// ---------------------------------------------------------------------------
// Geração das vendas
// ---------------------------------------------------------------------------
const [anoTexto, mesTexto] = PERIODO.split('-');
const ano = Number(anoTexto);
const mes = Number(mesTexto);
const diasNoMes = new Date(ano, mes, 0).getDate();

const totalPesos = vendedores.reduce((soma, v) => soma + v.peso, 0);

function sortearVendedor() {
  let alvo = random() * totalPesos;
  for (const vendedor of vendedores) {
    alvo -= vendedor.peso;
    if (alvo <= 0) return vendedor;
  }
  return vendedores[vendedores.length - 1];
}

function campanhaDaVenda(data, categoria) {
  return campanhas.find(
    (c) => data >= c.inicio && data <= c.fim && (c.alvo === 'TODAS' || c.alvo === categoria)
  ) || null;
}

const vendas = [];
let sequencial = 90000;

for (let dia = 1; dia <= diasNoMes; dia++) {
  const dataBase = new Date(ano, mes - 1, dia);
  const diaSemana = dataBase.getDay(); // 0 = domingo, 6 = sábado

  // Movimento maior nos fins de semana e nos primeiros dias do mês.
  let baseDia = inteiro(2, 4);
  if (diaSemana === 0 || diaSemana === 6) baseDia += 1;
  if (dia <= 5) baseDia += 1;

  const vendasDoDia = Math.max(1, baseDia);

  for (let i = 0; i < vendasDoDia; i++) {
    sequencial++;

    const vendedor = sortearVendedor();
    const categoria = escolher(categorias);
    const quantidadePecas = escolher(categoria.pecas);
    const valorTotal = dinheiro(
      categoria.minimo + random() * (categoria.maximo - categoria.minimo)
    );

    const dataVenda = `${anoTexto}-${mesTexto}-${String(dia).padStart(2, '0')}`;
    const campanha = campanhaDaVenda(dataVenda, categoria.nome);
    const bonusCampanha = campanha ? campanha.bonus : 0;
    const taxaTotal = Math.round((vendedor.taxa + bonusCampanha) * 10) / 10;
    const valorComissao = dinheiro(valorTotal * (taxaTotal / 100));

    const hora = String(inteiro(10, 21)).padStart(2, '0');
    const minuto = String(inteiro(0, 59)).padStart(2, '0');
    const segundo = String(inteiro(0, 59)).padStart(2, '0');

    vendas.push({
      id: vendas.length + 1,
      codigo: `VND-${anoTexto}-${String(sequencial).padStart(5, '0')}`,
      vendedorId: vendedor.id,
      vendedorNome: vendedor.nome,
      cliente: escolher(clientes),
      categoria: categoria.nome,
      quantidadePecas,
      valorTotal,
      taxaBase: vendedor.taxa,
      campanhaId: campanha ? campanha.id : null,
      campanhaTitulo: campanha ? campanha.titulo : null,
      bonusCampanha,
      taxaTotal,
      valorComissao,
      formaPagamento: escolher(formasPagamento),
      dataVenda: `${dataVenda} ${hora}:${minuto}:${segundo}`
    });
  }
}

// Ordena cronologicamente, como um relatório de vendas real.
vendas.sort((a, b) => a.dataVenda.localeCompare(b.dataVenda));

// ---------------------------------------------------------------------------
// Montagem do XML
// ---------------------------------------------------------------------------
function escaparXml(valor) {
  return String(valor)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function tag(nome, valor, indentacao) {
  return `${indentacao}<${nome}>${escaparXml(valor)}</${nome}>`;
}

const faturamentoTotal = dinheiro(vendas.reduce((soma, v) => soma + v.valorTotal, 0));
const comissaoTotal = dinheiro(vendas.reduce((soma, v) => soma + v.valorComissao, 0));
const ticketMedio = dinheiro(faturamentoTotal / vendas.length);

const linhas = [];
linhas.push('<?xml version="1.0" encoding="UTF-8"?>');
linhas.push('<atelier-vestt>');
linhas.push('  <exportacao>');
linhas.push(tag('sistema', 'ATELIER VESTT', '    '));
linhas.push(tag('tipo', 'vendas', '    '));
linhas.push(tag('periodo', PERIODO, '    '));
linhas.push(tag('moeda', 'BRL', '    '));
linhas.push(tag('gerado-em', new Date().toISOString(), '    '));
linhas.push(tag('total-vendas', vendas.length, '    '));
linhas.push(tag('faturamento-total', faturamentoTotal.toFixed(2), '    '));
linhas.push(tag('comissao-total', comissaoTotal.toFixed(2), '    '));
linhas.push(tag('ticket-medio', ticketMedio.toFixed(2), '    '));
linhas.push(
  tag(
    'observacao',
    'Dados fictícios gerados para teste de sistema. Não correspondem às vendas reais cadastradas.',
    '    '
  )
);
linhas.push('  </exportacao>');

linhas.push('  <vendedores>');
for (const vendedor of vendedores) {
  linhas.push(`    <vendedor id="${vendedor.id}">`);
  linhas.push(tag('nome', vendedor.nome, '      '));
  linhas.push(tag('apelido', vendedor.apelido, '      '));
  linhas.push(tag('taxa-comissao-base', vendedor.taxa.toFixed(1), '      '));
  linhas.push('    </vendedor>');
}
linhas.push('  </vendedores>');

linhas.push('  <categorias>');
categorias.forEach((categoria, indice) => {
  linhas.push(`    <categoria id="${indice + 1}">`);
  linhas.push(tag('nome', categoria.nome, '      '));
  linhas.push(tag('icone', categoria.icone, '      '));
  linhas.push('    </categoria>');
});
linhas.push('  </categorias>');

linhas.push('  <campanhas>');
for (const campanha of campanhas) {
  linhas.push(`    <campanha id="${campanha.id}">`);
  linhas.push(tag('titulo', campanha.titulo, '      '));
  linhas.push(tag('inicio', campanha.inicio, '      '));
  linhas.push(tag('fim', campanha.fim, '      '));
  linhas.push(tag('bonus', campanha.bonus.toFixed(1), '      '));
  linhas.push(tag('categoria-alvo', campanha.alvo, '      '));
  linhas.push('    </campanha>');
}
linhas.push('  </campanhas>');

linhas.push('  <vendas>');
for (const venda of vendas) {
  linhas.push(`    <venda id="${venda.id}">`);
  linhas.push(tag('codigo', venda.codigo, '      '));
  linhas.push(tag('vendedor-id', venda.vendedorId, '      '));
  linhas.push(tag('vendedor', venda.vendedorNome, '      '));
  linhas.push(tag('cliente', venda.cliente, '      '));
  linhas.push(tag('categoria', venda.categoria, '      '));
  linhas.push(tag('quantidade-pecas', venda.quantidadePecas, '      '));
  linhas.push(tag('valor-total', venda.valorTotal.toFixed(2), '      '));
  linhas.push(tag('taxa-comissao-base', venda.taxaBase.toFixed(1), '      '));
  if (venda.campanhaId) {
    linhas.push(tag('campanha-id', venda.campanhaId, '      '));
    linhas.push(tag('campanha', venda.campanhaTitulo, '      '));
  }
  linhas.push(tag('bonus-campanha', venda.bonusCampanha.toFixed(1), '      '));
  linhas.push(tag('taxa-comissao-total', venda.taxaTotal.toFixed(1), '      '));
  linhas.push(tag('valor-comissao', venda.valorComissao.toFixed(2), '      '));
  linhas.push(tag('forma-pagamento', venda.formaPagamento, '      '));
  linhas.push(tag('data-venda', venda.dataVenda, '      '));
  linhas.push('    </venda>');
}
linhas.push('  </vendas>');
linhas.push('</atelier-vestt>');

const xml = linhas.join('\n') + '\n';

const destino = path.resolve(SAIDA);
fs.mkdirSync(path.dirname(destino), { recursive: true });
fs.writeFileSync(destino, xml, 'utf8');

console.log(`✅ Arquivo XML gerado com sucesso.`);
console.log(`   Período .........: ${PERIODO} (${diasNoMes} dias)`);
console.log(`   Vendas ..........: ${vendas.length}`);
console.log(`   Faturamento .....: R$ ${faturamentoTotal.toFixed(2)}`);
console.log(`   Comissões .......: R$ ${comissaoTotal.toFixed(2)}`);
console.log(`   Seed ............: ${SEED}`);
console.log(`   Arquivo .........: ${destino}`);
