import { useState, useEffect, useRef, useMemo } from 'react'
import { Link } from 'react-router-dom'
import s from './QueryNoir.module.css'

// ─── CASES ────────────────────────────────────────────────────────────────────
const CASES = [
  {
    id: 'case_1', code: 'CASE 01', title: 'The Vanishing Margin', mood: 'Finance anomaly',
    difficulty: 1, difficultyLabel: 'ROOKIE',
    icon: '📉', color: '#f59e2a', colorDim: 'rgba(245,158,42,0.12)', colorBorder: 'rgba(245,158,42,0.3)',
    story: 'Midnight MegaDrop looked like a win. Revenue surged, traffic exploded, and leadership celebrated. Then finance noticed profit had quietly collapsed in a handful of cities. The business was selling a lot — and keeping almost none of it.',
    mission: 'Find the product category generating the highest revenue but the weakest profit margin.',
    objective: 'JOIN orders + products → GROUP BY category → Compare SUM(revenue) vs SUM(cost)',
    tables: ['orders', 'products'],
    clues: ['Revenue is high, but something else tells the real story.','A promo-heavy category dominates order volume — look beyond the headline.','Margin = revenue minus cost. You need both columns.'],
    chartLabel: 'Revenue vs Margin Pressure — Campaign Night',
    chartData: [{ l:'Mon',a:38,b:22 },{ l:'Tue',a:52,b:28 },{ l:'Wed',a:45,b:25 },{ l:'Thu',a:61,b:18 },{ l:'Fri',a:74,b:12 },{ l:'Sat',a:91,b:8 },{ l:'Sun',a:100,b:3 }],
    required: ['select','join','group by','sum','order by'],
    answerCheck: q => q.includes('category') && (q.includes('cost')||q.includes('margin')) && q.includes('revenue'),
    successRows: [{ category:'Audio', total_revenue:'£4,810', margin:'£122' },{ category:'Accessories', total_revenue:'£3,290', margin:'£684' },{ category:'Home', total_revenue:'£2,710', margin:'£740' }],
    nearMissRows: [{ city:'Leeds', total_revenue:'£1,810' },{ city:'Bristol', total_revenue:'£1,740' },{ city:'Manchester', total_revenue:'£1,680' }],
    reveal: 'Audio was pushed too aggressively under promotion. It looked like growth — but it quietly drained profit in the highest-volume cities. The margin column told the truth the headline never did.',
    hint: 'JOIN orders to products to get the category. Then GROUP BY category and compute SUM(revenue) and SUM(cost). The gap between them is the margin.',
    starterSql: `-- Find categories with high revenue but weak profit margin
      SELECT
        p.category,
        SUM(o.revenue) AS total_revenue,
        SUM(o.cost) AS total_cost,
        SUM(o.revenue - o.cost) AS total_profit,
        ROUND(
          SUM(o.revenue - o.cost) * 100.0 / NULLIF(SUM(o.revenue), 0),
          2
        ) AS profit_margin_pct
      FROM orders o
      JOIN products p
        ON o.product_id = p.product_id
      GROUP BY p.category
      ORDER BY profit_margin_pct ASC, total_revenue DESC;`,
    schema: {
      orders:   [['order_id','product_id','city','revenue','cost'],['10091','P13','Leeds','89','74'],['10092','P09','Bristol','95','92'],['10093','P09','Leeds','105','101'],['10094','P04','Manchester','78','38']],
      products: [['product_id','category'],['P13','Accessories'],['P09','Audio'],['P04','Home']],
    },
  },
  {
    id: 'case_2', code: 'CASE 02', title: 'The Refund Spiral', mood: 'Support escalation',
    difficulty: 2, difficultyLabel: 'DETECTIVE',
    icon: '🔄', color: '#ef4444', colorDim: 'rgba(239,68,68,0.12)', colorBorder: 'rgba(239,68,68,0.3)',
    story: 'Support queues are exploding. Refunds are rising fast, but only during a narrow window of the campaign night. Outside that window everything looks completely normal. Something happened in the launch rush — and the timestamp holds the key.',
    mission: 'Identify which product category had the highest refund rate during the campaign window (01:00–03:00).',
    objective: 'JOIN orders + refunds + products → Filter WHERE time BETWEEN 01:00 AND 03:00 → GROUP BY category',
    tables: ['orders', 'refunds', 'products'],
    clues: ['The spike is concentrated between 01:00 and 03:00. Filter for that window first.','You need to link refunds → orders → products to get the category.','COUNT the refunds per category inside the time window.'],
    chartLabel: 'Refund Rate — Campaign Night Hours',
    chartData: [{ l:'21:00',a:4,b:4 },{ l:'22:00',a:5,b:5 },{ l:'23:00',a:6,b:6 },{ l:'00:00',a:9,b:9 },{ l:'01:00',a:42,b:42 },{ l:'02:00',a:71,b:71 },{ l:'03:00',a:88,b:88 }],
    required: ['select','join','where','group by','count','order by'],
    answerCheck: q => q.includes('refund') && (q.includes('between')||q.includes('01')||q.includes('03')) && q.includes('category'),
    successRows: [{ category:'Audio', refunds:42 },{ category:'Beauty', refunds:16 },{ category:'Home', refunds:9 }],
    nearMissRows: [{ category:'Audio', refunds:58 },{ category:'Beauty', refunds:26 },{ category:'Home', refunds:18 }],
    reveal: 'A defective Audio batch shipped during the campaign window. The spike was temporal — not company-wide. Without the time filter, the signal was buried in normal daily noise.',
    hint: 'Three JOINs: refunds → orders → products. Add WHERE refund_time BETWEEN \'01:00\' AND \'03:00\'. Then GROUP BY category and COUNT(*). ORDER BY refunds DESC.',
    starterSql: `-- Find refund rate by category during the campaign window
      SELECT
        p.category,
        COUNT(DISTINCT o.order_id) AS total_orders,
        COUNT(DISTINCT r.refund_id) AS total_refunds,
        ROUND(
          COUNT(DISTINCT r.refund_id) * 100.0 / NULLIF(COUNT(DISTINCT o.order_id), 0),
          2
        ) AS refund_rate_pct
      FROM orders o
      JOIN products p
        ON o.product_id = p.product_id
      LEFT JOIN refunds r
        ON o.order_id = r.order_id
      AND r.refund_time BETWEEN '01:00' AND '03:00'
      where o.order_id IS NOT NULL
      GROUP BY p.category
      ORDER BY refund_rate_pct DESC, total_refunds DESC;`,
    schema: {
      refunds:  [['order_id','refund_id','refund_time','refund_amount'],['20011','R03','01:14','44'],['20019','R09','01:44','47'],['20031','R17','02:22','41'],['20045','R22','02:55','38']],
      orders:   [['order_id','product_id','category'],['20011','P09','Audio'],['20019','P09','Audio'],['20031','P09','Audio'],['20045','P02','Beauty']],
      products: [['product_id','category'],['P09','Audio'],['P02','Beauty'],['P04','Home']],
    },
  },
  {
    id: 'case_3', code: 'CASE 03', title: 'Ghost Customers', mood: 'Fraud cluster',
    difficulty: 3, difficultyLabel: 'INVESTIGATOR',
    icon: '👻', color: '#8b5cf6', colorDim: 'rgba(139,92,246,0.12)', colorBorder: 'rgba(139,92,246,0.3)',
    story: 'Fraud tooling is quiet, but operations is uneasy. High-value orders are appearing from brand-new accounts with almost no browsing history. The orders look clean one by one. Together, they feel very wrong. You need a filter that spots clusters — not individuals.',
    mission: 'Detect customers placing 4 or more orders — a threshold that flags suspicious burst behaviour.',
    objective: 'JOIN customers + orders → GROUP BY customer_id → HAVING COUNT(*) >= 4 to isolate burst accounts',
    tables: ['customers', 'orders'],
    clues: ['Individual orders look fine. The pattern only appears when you count per account.','You need a threshold filter — HAVING, not WHERE, filters on aggregated counts.','New accounts with high order counts are the signal. JOIN customers to get account age.'],
    chartLabel: 'New Account Order Burst — Campaign Night',
    chartData: [{ l:'20:00',a:5,b:5 },{ l:'21:00',a:7,b:7 },{ l:'22:00',a:9,b:9 },{ l:'23:00',a:14,b:14 },{ l:'00:00',a:22,b:22 },{ l:'01:00',a:38,b:38 },{ l:'02:00',a:52,b:52 }],
    required: ['select','join','group by','count','having','order by'],
    answerCheck: q => q.includes('customer') && q.includes('having') && q.includes('count'),
    successRows: [{ customer_id:'C120', order_count:6 },{ customer_id:'C129', order_count:7 },{ customer_id:'C121', order_count:5 }],
    nearMissRows: [{ customer_id:'C120', order_count:6 },{ customer_id:'C129', order_count:7 },{ customer_id:'C141', order_count:2 }],
    reveal: 'A promo abuse ring used freshly created accounts to place clustered orders before disappearing. HAVING COUNT > threshold was the only lens that surfaced the pattern — individual rows looked completely clean.',
    hint: 'GROUP BY o.customer_id, then use HAVING COUNT(*) >= 4 to isolate the burst accounts. Without HAVING, all customers appear and the signal is invisible.',
    starterSql: `-- Identify suspicious customers with burst order behaviour
      SELECT
        o.customer_id,
        COUNT(o.order_id) AS order_count
      FROM orders o
      JOIN customers c
        ON o.customer_id = c.customer_id
      GROUP BY o.customer_id
      HAVING COUNT(o.order_id) >= 4
      ORDER BY order_count DESC;`,
    schema: {
      customers: [['customer_id','created_at','email_domain'],['C120','00:18','tempmail.io'],['C121','00:24','tempmail.io'],['C129','00:31','tempmail.io'],['C141','14:05','gmail.com']],
      orders:    [['customer_id','order_id','order_value'],['C120','O991','249'],['C120','O992','199'],['C120','O993','189'],['C129','O995','229'],['C129','O996','179'],['C141','O999','99']],
    },
  },
  {
    id: 'case_4', code: 'CASE 04', title: 'The Warehouse Lie', mood: 'Inventory mismatch',
    difficulty: 4, difficultyLabel: 'ANALYST',
    icon: '📦', color: '#f59e2a', colorDim: 'rgba(245,158,42,0.12)', colorBorder: 'rgba(245,158,42,0.3)',
    story: 'Customers say packages never arrived. The logistics dashboard insists all shipments succeeded. That should be impossible. Either deliveries failed, inventory drifted, or the warehouse system is telling a very expensive lie. You need to reconcile two systems that were never designed to talk to each other.',
    mission: 'Find the SKU where shipped orders exceed available inventory — the stock that was never really there.',
    objective: 'LEFT JOIN inventory + orders → GROUP BY sku → Compare available_stock vs COUNT(shipped) → filter gap > 0',
    tables: ['inventory', 'orders', 'deliveries'],
    clues: ['A LEFT JOIN will show SKUs with no orders AND with orders — the gap is what matters.','available_stock is in the inventory table. Shipped quantity comes from counting order records per SKU.','Filter using HAVING where COUNT(orders) exceeds available_stock. That\'s the lie.'],
    chartLabel: 'Shipment Confidence vs Stock Reality',
    chartData: [{ l:'SKU-1',a:92,b:91 },{ l:'SKU-2',a:88,b:85 },{ l:'SKU-3',a:79,b:76 },{ l:'SKU-4',a:71,b:58 },{ l:'SKU-6',a:64,b:41 },{ l:'SKU-8',a:55,b:28 },{ l:'SKU-9',a:44,b:8 }],
    required: ['select','join','group by','count','order by'],
    answerCheck: q => (q.includes('left join')||q.includes('join')) && q.includes('inventory') && q.includes('sku'),
    successRows: [{ sku:'SKU-9', available_stock:12, shipped_orders:44, gap:32 },{ sku:'SKU-4', available_stock:19, shipped_orders:33, gap:14 },{ sku:'SKU-2', available_stock:61, shipped_orders:58, gap:0 }],
    nearMissRows: [{ delivered_status:'ok', orders:58 },{ delivered_status:'partial', orders:27 },{ delivered_status:'missing', orders:19 }],
    reveal: 'SKU-9 was massively oversold. Inventory and fulfilment drifted apart while the dashboard stayed green. Reconciling across a JOIN was the only way to see the gap between reported and actual stock.',
    hint: 'LEFT JOIN inventory to orders on SKU. GROUP BY sku, available_stock. Compute COUNT(orders) AS shipped. The gap = available_stock - shipped. ORDER BY gap ASC to see the worst offender first.',
    starterSql: `-- Reconcile stock against shipped orders and find oversold SKUs
      SELECT
        i.sku,
        i.available_stock,
        COUNT(o.order_id) AS shipped_orders,
        COUNT(o.order_id) - i.available_stock AS oversold_by
      FROM inventory i
      LEFT JOIN orders o
        ON i.sku = o.sku
      GROUP BY i.sku, i.available_stock
      HAVING COUNT(o.order_id) > i.available_stock
      ORDER BY oversold_by DESC;`,
    schema: {
      inventory: [['sku','available_stock'],['SKU-9','12'],['SKU-2','61'],['SKU-4','19'],['SKU-1','88']],
      orders:    [['order_id','sku','status'],['O901','SKU-9','shipped'],['O902','SKU-9','shipped'],['O903','SKU-9','shipped'],['O910','SKU-4','shipped'],['O911','SKU-2','shipped']],
      deliveries:[['sku','delivery_record','status'],['SKU-9','partial','warning'],['SKU-2','ok','healthy'],['SKU-4','missing','warning']],
    },
  },
  {
    id: 'case_5', code: 'CASE 05', title: 'The Silent Leak', mood: 'Hidden loss engine',
    difficulty: 5, difficultyLabel: 'MASTER',
    icon: '🕳️', color: '#22c55e', colorDim: 'rgba(34,197,94,0.12)', colorBorder: 'rgba(34,197,94,0.3)',
    story: 'It is almost sunrise. You solved the visible failures — but finance still sees money disappearing faster than reported. Somewhere in the order lifecycle, costs are stacking quietly across multiple systems at once. No single table will show you this. You have to build the picture from fragments.',
    mission: 'Identify the top 3 orders with the highest combined leakage: discount + refund + compensation credit.',
    objective: 'LEFT JOIN orders + refunds + compensations + promotions → SUM leakage per order using COALESCE for NULLs',
    tables: ['orders', 'refunds', 'compensations', 'promotions'],
    clues: ['COALESCE(value, 0) treats NULL as zero — essential when not every order has a refund or credit.','Total leakage = discount + refund_amount + credit. All three come from different tables.','Use LEFT JOINs so orders with partial data are still included — INNER JOIN will drop them.'],
    chartLabel: 'Leakage Stack — Discount + Refund + Credit',
    chartData: [{ l:'G1',a:12,b:12 },{ l:'G2',a:19,b:19 },{ l:'G3',a:28,b:28 },{ l:'G4',a:39,b:39 },{ l:'G5',a:52,b:52 },{ l:'G6',a:67,b:67 },{ l:'G7',a:88,b:88 }],
    required: ['select','join','group by','order by'],
    answerCheck: q => (q.includes('coalesce')||q.includes('+')||q.includes('sum(')) && q.includes('refund') && (q.includes('credit')||q.includes('compensation')),
    successRows: [{ order_id:'50024', discount:'£20', refund:'£31', credit:'£14', total_leakage:'£65' },{ order_id:'50019', discount:'£18', refund:'£34', credit:'£12', total_leakage:'£64' },{ order_id:'50022', discount:'£16', refund:'£29', credit:'£12', total_leakage:'£57' }],
    nearMissRows: [{ order_id:'50024', refund:'£31' },{ order_id:'50019', refund:'£34' },{ order_id:'50022', refund:'£29' }],
    reveal: 'Delayed campaign orders took a triple hit: discount, refund, and goodwill credit. The loss was distributed across systems — so nobody saw the full stack at once. COALESCE + multi-table LEFT JOIN exposed it.',
    hint: 'LEFT JOIN all four tables on order_id. Then: COALESCE(o.discount,0) + COALESCE(r.refund,0) + COALESCE(c.credit,0) AS total_leakage. ORDER BY total_leakage DESC LIMIT 3.',
    starterSql: `-- Calculate combined leakage per order across discount, refund, and credit
      SELECT
        o.order_id,
        COALESCE(MAX(o.discount), 0) AS discount,
        COALESCE(SUM(r.refund), 0) AS refund,
        COALESCE(SUM(c.credit), 0) AS credit,
        COALESCE(MAX(o.discount), 0)
          + COALESCE(SUM(r.refund), 0)
          + COALESCE(SUM(c.credit), 0) AS total_leakage
      FROM orders o
      LEFT JOIN refunds r
        ON o.order_id = r.order_id
      LEFT JOIN compensations c
        ON o.order_id = c.order_id
      LEFT JOIN promotions p
        ON o.order_id = p.order_id
      GROUP BY o.order_id
      ORDER BY total_leakage DESC
      LIMIT 3;`,
    schema: {
      orders:        [['order_id','discount','delay_min'],['50019','18','73'],['50022','16','61'],['50024','20','79'],['50030','5','12']],
      refunds:       [['order_id','refund'],['50019','34'],['50022','29'],['50024','31']],
      compensations: [['order_id','credit'],['50019','12'],['50022','12'],['50024','14'],['50030','3']],
      promotions:    [['order_id','promo_code'],['50019','FLASH30'],['50022','FLASH30'],['50024','FLASH30']],
    },
  },
  {
    id: 'case_6', code: 'CASE 06', title: 'The Ranking Engine', mood: 'Executive intelligence',
    difficulty: 6, difficultyLabel: 'LEGEND',
    icon: '👁️', color: '#f59e2a', colorDim: 'rgba(245,158,42,0.14)', colorBorder: 'rgba(245,158,42,0.4)',
    story: "The CEO wants answers before the board meeting. Not just totals — rankings. Which city performed best within each region? Which product ranked first in revenue inside its own category? Standard GROUP BY can't answer this. You need window functions: analytics that see the full picture while still grouping by partition.",
    mission: 'For each product category, find the top-performing city by revenue using RANK() OVER (PARTITION BY category ORDER BY revenue DESC).',
    objective: 'Window function: RANK() OVER (PARTITION BY category ORDER BY SUM(revenue) DESC) — no GROUP BY needed for the rank',
    tables: ['orders', 'products', 'regions'],
    clues: [
      'RANK() OVER (PARTITION BY ...) gives each row a rank within its group — without collapsing the rows.',
      'Use a CTE: first aggregate revenue per category+city, then apply RANK() in the outer query.',
      "Filter WHERE rank_pos = 1 in the outer query to get only the #1 city per category."
    ],
    chartLabel: 'Revenue Rank by Category — Campaign Night',
    chartData: [{ l:'Audio',a:100,b:60 },{ l:'Home',a:90,b:55 },{ l:'Beauty',a:75,b:48 },{ l:'Sports',a:65,b:40 },{ l:'Tech',a:55,b:35 },{ l:'Food',a:42,b:28 },{ l:'Other',a:30,b:20 }],
    required: ['select','over','partition by','rank','order by'],
    answerCheck: q => q.includes('rank') && q.includes('over') && q.includes('partition'),
    successRows: [
      { category:'Audio',  top_city:'Leeds',      revenue:'£4,810', rank_pos:1 },
      { category:'Home',   top_city:'Manchester', revenue:'£3,290', rank_pos:1 },
      { category:'Beauty', top_city:'Bristol',    revenue:'£2,740', rank_pos:1 },
      { category:'Sports', top_city:'Birmingham', revenue:'£2,190', rank_pos:1 },
    ],
    nearMissRows: [
      { category:'Audio', city:'Leeds', revenue:'£4,810' },
      { category:'Audio', city:'Bristol', revenue:'£3,100' },
      { category:'Home',  city:'Manchester', revenue:'£3,290' },
    ],
    reveal: 'Window functions let you rank, compare, and contextualise rows within partitions — without losing row-level detail. RANK() OVER (PARTITION BY category) is the lens that turns raw order data into executive-grade intelligence.',
    hint: 'Wrap your GROUP BY in a CTE first. Then in the outer SELECT add RANK() OVER (PARTITION BY category ORDER BY total_revenue DESC) AS rank_pos. Filter WHERE rank_pos = 1.',
    starterSql: `-- Rank cities by revenue within each product category
      WITH city_revenue AS (
        SELECT
          p.category,
          o.city,
          SUM(o.revenue) AS total_revenue
        FROM orders o
        JOIN products p
          ON o.product_id = p.product_id
        GROUP BY p.category, o.city
      ),
      ranked AS (
        SELECT
          category,
          city,
          total_revenue,
          RANK() OVER (
            PARTITION BY category
            ORDER BY total_revenue DESC
          ) AS rank_pos
        FROM city_revenue
      )
      SELECT
        category,
        city AS top_city,
        total_revenue,
        rank_pos
      FROM ranked
      WHERE rank_pos = 1
      ORDER BY total_revenue DESC;`,
    schema: {
      orders:   [['order_id','product_id','city','revenue'],['10091','P09','Leeds','89'],['10092','P09','Bristol','72'],['10093','P04','Manchester','95'],['10094','P02','Bristol','68']],
      products: [['product_id','category'],['P09','Audio'],['P04','Home'],['P02','Beauty'],['P11','Sports']],
      regions:  [['city','region'],['Leeds','North'],['Bristol','South'],['Manchester','North'],['Birmingham','Midlands']],
    },
  },
]

const DIFF_META = {
  1: { color: '#22c55e', label: 'ROOKIE',       desc: 'One JOIN · Basic GROUP BY',        certDesc: 'You mastered the fundamentals of SQL joins and aggregation.' },
  2: { color: '#3b82f6', label: 'DETECTIVE',    desc: 'Time filters · 3 JOINs',           certDesc: 'You filtered signals from noise using temporal joins and WHERE logic.' },
  3: { color: '#8b5cf6', label: 'INVESTIGATOR', desc: 'HAVING clause · Fraud logic',      certDesc: 'You exposed fraud patterns invisible to standard filtering logic.' },
  4: { color: '#f59e2a', label: 'ANALYST',      desc: 'LEFT JOIN · Gap reconciliation',   certDesc: 'You reconciled multi-system data gaps with precision LEFT JOIN logic.' },
  5: { color: '#ef4444', label: 'MASTER',       desc: 'COALESCE · 4-table JOIN',          certDesc: 'You dismantled a multi-system loss engine with COALESCE and chained JOINs.' },
  6: { color: '#f59e2a', label: 'LEGEND',       desc: 'Window Functions · RANK OVER',     certDesc: 'You wielded window functions to deliver executive-grade ranked intelligence.' },
}

// ─── SUPABASE ─────────────────────────────────────────────────────────────────
async function sbInsert(table, body) {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) return
  try {
    await fetch(`${url}/rest/v1/${table}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: key, Authorization: `Bearer ${key}`, Prefer: 'return=minimal' },
      body: JSON.stringify(body),
    })
  } catch (_) {}
}

// ─── SCORING ──────────────────────────────────────────────────────────────────
function getPersona(results) {
  const solved = results.filter(r => r.correct).length
  const skipped = results.filter(r => r.skipped).length
  const hints = results.reduce((a, r) => a + (r.hintsUsed || 0), 0)
  const attempts = results.reduce((a, r) => a + (r.attempts || 0), 0)
  const fastSolved = results.filter(r => r.correct && r.elapsed < 40000).length
  const totalPlayed = results.length

  // mostly skipped
  if (skipped >= 4) {
    return {
      name: 'Curious Explorer',
      badge: '🧭',
      desc: 'You explored the investigation experience, sampled multiple cases, and moved quickly through the system to see the bigger picture.'
    }
  }

  // solved everything with no help
  if (solved >= 6 && hints === 0) {
    return {
      name: 'The Oracle',
      badge: '🔮',
      desc: 'You solved every case with no hints. You read the schema sharply, spotted the patterns early, and executed with elite precision.'
    }
  }

  // strong solver with almost no hints
  if (solved >= 5 && hints <= 1) {
    return {
      name: 'Pattern Detective',
      badge: '🕵️',
      desc: 'You noticed hidden relationships quickly and solved complex anomalies with minimal guidance.'
    }
  }

  // fast and strong
  if (solved >= 4 && fastSolved >= 3) {
    return {
      name: 'Executive Strategist',
      badge: '⚡',
      desc: 'You made fast, high-quality decisions under pressure and handled the investigation like a real data lead.'
    }
  }

  // high effort, many retries/hints
  if (solved >= 3 && (hints >= 4 || attempts > 12)) {
    return {
      name: 'Thorough Investigator',
      badge: '🔬',
      desc: 'You worked methodically through the evidence, tested multiple paths, and stayed persistent until the logic became clear.'
    }
  }

  // mixed solve + skip
  if (solved >= 2 && skipped >= 2) {
    return {
      name: 'Selective Analyst',
      badge: '🧠',
      desc: 'You picked your battles, solved the cases that matched your instincts, and moved on when a problem did not feel worth the time.'
    }
  }

  // beginner but engaged
  if (solved >= 1) {
    return {
      name: 'Emerging Investigator',
      badge: '📘',
      desc: 'You started building momentum, solved key parts of the investigation, and showed the instincts of a developing analyst.'
    }
  }

  // default for very low completion
  return {
    name: 'Observer',
    badge: '👁️',
    desc: 'You explored the investigation environment and reviewed the cases, but did not stay long enough to build a full evidence trail.'
  }
}

function evalQuery(sql, c) {
  const q = sql.toLowerCase().replace(/\s+/g, ' ').trim()

  if (!q.startsWith('select') && !q.startsWith('with')) {
    return {
      severity: 'error',
      msg: 'Query must begin with SELECT or WITH.',
      rows: [],
      solved: false
    }
  }

  const miss = c.required.filter(t => !q.includes(t))
  if (miss.length)
    return {
      severity: 'warning',
      msg: `Missing keyword(s): ${miss.map(t => t.toUpperCase()).join(', ')}`,
      rows: c.nearMissRows,
      solved: false
    }

  if (c.answerCheck(q))
    return {
      severity: 'success',
      msg: 'Evidence aligned. Query isolated the key anomaly.',
      rows: c.successRows,
      solved: true
    }

  return {
    severity: 'partial',
    msg: 'Query runs — not yet targeting the core finding. Refine your logic.',
    rows: c.nearMissRows,
    solved: false
  }
}

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────
function CaseChart({ chartData, chartLabel, color }) {
  const maxA = Math.max(...chartData.map(d => d.a))
  return (
    <div className={s.chart}>
      <div className={s.chartHead}>
        <span className={s.chartTitle}>{chartLabel}</span>
        <div className={s.chartLegend}>
          <span><span className={s.dot} style={{ background: color }} />Signal</span>
          <span><span className={s.dot} style={{ background: 'rgba(245,158,42,0.15)' }} />Baseline</span>
        </div>
      </div>
      <div className={s.chartBars}>
        {chartData.map((d, i) => (
          <div key={i} className={s.chartCol}>
            <div className={s.chartStack}>
              <div className={s.barBase}  style={{ height:`${(d.b/maxA)*100}%` }} />
              <div className={s.barSignal} style={{ height:`${(d.a/maxA)*100}%`, background: color, boxShadow:`0 0 8px ${color}60`, animationDelay:`${i*50}ms` }} />
            </div>
            <div className={s.chartColLabel}>{d.l}</div>
          </div>
        ))}
      </div>
      <div className={s.chartFooter}>
        <span>← Earlier</span>
        <span style={{ color }}>Anomaly zone →</span>
      </div>
    </div>
  )
}

function SchemaViewer({ schema }) {
  const names = Object.keys(schema)
  const [active, setActive] = useState(names[0])
  useEffect(() => setActive(names[0]), [names.join()])
  const rows = schema[active]
  return (
    <div className={s.schemaWrap}>
      <div className={s.schemaTabs}>
        {names.map(n => (
          <button key={n} onClick={() => setActive(n)} className={`${s.schemaTab} ${active===n ? s.schemaTabOn : ''}`}>
            ⊞ {n}
          </button>
        ))}
      </div>
      <div className={s.schemaTable}>
        <table>
          <thead><tr>{rows[0].map(h => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {rows.slice(1).map((row, i) => (
              <tr key={i} className={s.fadeRow} style={{ animationDelay:`${i*50}ms` }}>
                {row.map((cell, j) => <td key={j}>{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SqlEditor({ value, onChange, starterSql, onLoadStarter }) {
  const lines = (value || ' ').split('\n')
  return (
    <div className={s.editorWrap}>
      <div className={s.editorBar}>
        <div className={s.editorDots}>
          <span style={{ background:'#ef4444' }} />
          <span style={{ background:'#f59e2a' }} />
          <span style={{ background:'#22c55e' }} />
        </div>
        <span className={s.editorFile}>investigation.sql</span>
        <span className={s.editorLines}>{lines.length} lines</span>
        {starterSql && (
          <button className={s.starterBtn} onClick={onLoadStarter}>⚡ Starter Query</button>
        )}
      </div>
      <div className={s.editorBody}>
        <div className={s.editorGutter}>{lines.map((_, i) => <div key={i}>{i + 1}</div>)}</div>
        <textarea
          className={s.editorTextarea}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={'-- Write your SQL query here\nSELECT ...\nFROM ...\nJOIN ...\nGROUP BY ...\nORDER BY ...'}
          spellCheck={false}
          autoCapitalize="off"
        />
      </div>
    </div>
  )
}

function ResultPanel({ result, running }) {
  if (running) return (
    <div className={s.resultEmpty}>
      <span className={s.spinner} />Running query against evidence database...
    </div>
  )
  if (!result) return <div className={s.resultEmpty}>▸ Run a query to see results here.</div>
  const cols = result.rows?.length ? Object.keys(result.rows[0]) : []
  return (
    <div className={`${s.result} ${s['r_' + result.severity]}`}>
      <div className={s.resultBar}>
        <span className={s.resultIcon}>{result.severity==='success'?'✓':result.severity==='error'?'✕':result.severity==='warning'?'⚠':'~'}</span>
        <span className={s.resultMsg}>{result.msg}</span>
        <span className={s.resultCount}>{result.rows?.length ?? 0} row(s)</span>
      </div>
      {cols.length > 0 && (
        <div className={s.resultTableWrap}>
          <table className={s.resultTable}>
            <thead><tr>{cols.map(c => <th key={c}>{c}</th>)}</tr></thead>
            <tbody>{result.rows.map((row, i) => (
              <tr key={i} className={s.fadeRow} style={{ animationDelay:`${i*60}ms` }}>
                {cols.map(c => <td key={c}>{row[c]}</td>)}
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
      {(result.severity === 'warning' || result.severity === 'partial') && (
        <div className={s.resultTip}>
          {result.severity === 'warning'
            ? '💡 Check which SQL keywords are missing above and add them to your query.'
            : '🔍 You\'re close — review the mission objective and refine your WHERE or JOIN logic.'}
        </div>
      )}
    </div>
  )
}

function ClauseTracker({ required, sql, color }) {
  const q = sql.toLowerCase()
  return (
    <div className={s.clauses}>
      {required.map(r => {
        const hit = q.includes(r)
        return (
          <div key={r} className={`${s.clause} ${hit ? s.clauseHit : ''}`}
            style={hit ? { color, background: `${color}18`, borderColor: `${color}50` } : {}}>
            {hit && <span className={s.clauseTick}>✓</span>}{r.toUpperCase()}
          </div>
        )
      })}
    </div>
  )
}

function ProgressDots({ idx, results }) {
  return (
    <div className={s.progressDots}>
      {CASES.map((c, i) => {
        const r = results.find(r => r.caseId === c.id)

        const solved  = r?.correct
        const skipped = r?.skipped
        const active  = i === idx

        let symbol = c.icon
        if (solved)  symbol = '✓'
        if (skipped) symbol = '✕'

        return (
          <div
            key={c.id}
            title={c.title}
            className={`${s.pdot} ${solved ? s.pdotDone : active ? s.pdotActive : ''}`}
            style={
              active
                ? { borderColor: c.color, background: `${c.color}20`, color: c.color }
                : solved
                ? { background: c.color, borderColor: c.color, color: '#0d0a06' }
                : skipped
                ? { borderColor: '#ef4444', background: '#ef444420', color: '#ef4444' }
                : {}
            }
          >
            {symbol}
          </div>
        )
      })}
    </div>
  )
}

function LiveClock({ t0 }) {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - t0) / 1000)), 1000)
    return () => clearInterval(id)
  }, [t0])
  const m   = String(Math.floor(elapsed / 60)).padStart(2, '0')
  const sec = String(elapsed % 60).padStart(2, '0')
  return <span className={s.clock}>⏱ {m}:{sec}</span>
}


// ─── CERTIFICATE ──────────────────────────────────────────────────────────────
function Certificate({ results, persona, totalScore, playerName }) {
  const canvasRef = useRef(null)
  const solved = results.filter(r => r.correct).length
  const maxDiff = results.filter(r => r.correct).reduce((m, r) => Math.max(m, r.difficulty || 1), 1)
  const diff = DIFF_META[maxDiff]
  const today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const drawCert = (canvas) => {
    const W = 1400
    const H = 980

    canvas.width = W * 2
    canvas.height = H * 2
    canvas.style.width = '100%'
    canvas.style.height = 'auto'
    canvas.style.maxWidth = '1100px'
    canvas.style.display = 'block'
    canvas.style.margin = '0 auto'

    const ctx = canvas.getContext('2d')
    ctx.scale(2, 2)

    const navy = '#16324F'
    const gold = '#C89B3C'
    const goldSoft = '#E6C777'
    const ink = '#1E293B'
    const muted = '#667085'
    const paper = '#FFFDF8'
    const line = '#E7DFCF'

    const fullName = playerName && playerName.trim()
      ? playerName.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      : 'Unnamed Investigator'
    const certificateId = `QN-${new Date().getFullYear()}-${String(totalScore).padStart(4, '0')}-${solved}${maxDiff}`

    // background
    ctx.fillStyle = paper
    ctx.fillRect(0, 0, W, H)

    const glow = ctx.createRadialGradient(W / 2, H / 2, 80, W / 2, H / 2, W * 0.7)
    glow.addColorStop(0, 'rgba(200,155,60,0.06)')
    glow.addColorStop(1, 'rgba(255,253,248,0)')
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, W, H)

    // borders
    ctx.strokeStyle = gold
    ctx.lineWidth = 3
    ctx.strokeRect(28, 28, W - 56, H - 56)

    ctx.strokeStyle = '#D7C8A0'
    ctx.lineWidth = 1.5
    ctx.strokeRect(48, 48, W - 96, H - 96)

    // corner ornaments
    const drawCorner = (x, y, flipX = 1, flipY = 1) => {
      ctx.save()
      ctx.translate(x, y)
      ctx.scale(flipX, flipY)

      ctx.strokeStyle = gold
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, 28)
      ctx.lineTo(0, 0)
      ctx.lineTo(28, 0)
      ctx.stroke()

      ctx.strokeStyle = '#D7C8A0'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, 44)
      ctx.lineTo(0, 0)
      ctx.lineTo(44, 0)
      ctx.stroke()

      ctx.fillStyle = gold
      ctx.beginPath()
      ctx.arc(10, 10, 3, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()
    }

    drawCorner(60, 60, 1, 1)
    drawCorner(W - 60, 60, -1, 1)
    drawCorner(60, H - 60, 1, -1)
    drawCorner(W - 60, H - 60, -1, -1)

    // top logo seal
    ctx.fillStyle = navy
    ctx.beginPath()
    ctx.arc(W / 2, 112, 36, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#ffffff'
    ctx.font = '700 30px Georgia, serif'
    ctx.textAlign = 'center'
    ctx.fillText('QN', W / 2, 124)

    // issuer line
    ctx.fillStyle = muted
    ctx.font = '600 18px Inter, Arial, sans-serif'
    ctx.fillText('QUERY NOIR · DATA INVESTIGATION CERTIFICATE', W / 2, 178)

    // title
    ctx.fillStyle = navy
    ctx.font = '700 60px Georgia, serif'
    ctx.fillText('Certificate of Achievement', W / 2, 270)

    // subtitle
    ctx.fillStyle = muted
    ctx.font = 'italic 28px Georgia, serif'
    ctx.fillText('This certifies that', W / 2, 330)

    // name
    ctx.fillStyle = ink
    ctx.font = '700 66px Georgia, serif'
    ctx.fillText(fullName, W / 2, 415)

    const nameWidth = ctx.measureText(fullName).width
    ctx.strokeStyle = gold
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(W / 2 - nameWidth / 2 - 20, 435)
    ctx.lineTo(W / 2 + nameWidth / 2 + 20, 435)
    ctx.stroke()

    // body
    ctx.fillStyle = muted
    ctx.font = '26px Georgia, serif'
    ctx.fillText('has successfully completed the Query Noir investigation sequence', W / 2, 500)
    ctx.fillText(`and achieved the rank of ${diff.label} — ${persona.name}.`, W / 2, 540)

    // rank badge
    const badgeX = W / 2 - 230
    const badgeY = 585
    const badgeW = 460
    const badgeH = 86

    ctx.fillStyle = '#FAF6ED'
    ctx.strokeStyle = '#D7C8A0'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 22)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = gold
    ctx.font = '700 34px Inter, Arial, sans-serif'
    ctx.fillText(diff.label, W / 2, 638)

    // info cards
    const hintsUsed = results.reduce((a,r)=>a+(r.hintsUsed||0),0)

    const cards = [
      ['CASES SOLVED', `${solved} / ${CASES.length}`],
      ['TOTAL SCORE',  `${totalScore} / 100`],
      ['PERSONA',      persona.name],
      ['HINTS USED',   `${hintsUsed}`],
    ]

    const startX = 120
    const gap = 28
    const cardW = 270
    const cardH = 118
    const y = 720

    cards.forEach(([label, value], i) => {
      const x = startX + i * (cardW + gap)

      ctx.fillStyle = '#FFFFFF'
      ctx.strokeStyle = line
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.roundRect(x, y, cardW, cardH, 16)
      ctx.fill()
      ctx.stroke()

      ctx.fillStyle = muted
      ctx.font = '600 15px Inter, Arial, sans-serif'
      ctx.fillText(label, x + cardW / 2, y + 34)

      ctx.fillStyle = navy
      ctx.font = '700 28px Inter, Arial, sans-serif'
      ctx.fillText(value, x + cardW / 2, y + 80)
    })

    // certificate id
    ctx.fillStyle = '#98A2B3'
    ctx.font = '13px Inter, Arial, sans-serif'
    ctx.fillText(`Certificate ID: ${certificateId}`, W / 2, 880)

    // signature lines
    // footer — two balanced columns
    const sigY = 920
    ctx.strokeStyle = '#CFC5B0'
    ctx.lineWidth = 1.2
    ctx.textAlign = 'center'

    // left rule
    ctx.beginPath()
    ctx.moveTo(160, sigY - 38)
    ctx.lineTo(500, sigY - 38)
    ctx.stroke()

    // right rule
    ctx.beginPath()
    ctx.moveTo(W - 500, sigY - 38)
    ctx.lineTo(W - 160, sigY - 38)
    ctx.stroke()

    // left: cursive signature
    ctx.fillStyle = navy
    ctx.font = 'italic 28px "Brush Script MT", "Segoe Script", cursive'
    ctx.fillText('Bidhan Pant', 330, sigY - 50)

    // left: role label
    ctx.fillStyle = muted
    ctx.font = '600 15px Inter, Arial, sans-serif'
    ctx.fillText('Creator · Query Noir', 330, sigY - 12)

    // right: date label
    ctx.fillStyle = muted
    ctx.font = '600 13px Inter, Arial, sans-serif'
    ctx.fillText('DATE OF ISSUE', W - 330, sigY - 50)

    // right: date value
    ctx.fillStyle = navy
    ctx.font = '700 17px Inter, Arial, sans-serif'
    ctx.fillText(today, W - 330, sigY - 12)
  }

  useEffect(() => {
    if (canvasRef.current) drawCert(canvasRef.current)
  }, [results, persona, totalScore, playerName])

  const downloadPNG = () => {
    const canvas = document.createElement('canvas')
    drawCert(canvas)
    const link = document.createElement('a')
    const slug = (playerName || 'certificate').toLowerCase().replace(/\s+/g, '-')
    link.download = `${slug}-query-noir-certificate.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div className={s.certSection}>
      <div className={s.certSectionTitle}>Official Completion Certificate</div>
      <div className={s.certWrapClean}>
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            borderRadius: '20px'
          }}
        />
      </div>
      <div className={s.certDownloadRow} style={{ justifyContent: 'center', marginTop: '1.5rem' }}>
        <button className={`${s.certDownloadBtn} ${s.primary}`} onClick={downloadPNG}>
          ⬇ Download Certificate (PNG)
        </button>
      </div>
    </div>
  )
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function QueryNoir() {
  const [phase,    setPhase]    = useState('nameEntry') // nameEntry, brief, investigation, resolved, summary
  const [playerName, setPlayerName] = useState('')
  const [nameInput,  setNameInput]  = useState({ first:'', last:'' })
  const [idx,      setIdx]      = useState(0)
  const [sql,      setSql]      = useState('')
  const [results,  setResults]  = useState([])
  const [hintOn,   setHintOn]   = useState(false)
  const [hintsN,   setHintsN]   = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [t0,       setT0]       = useState(Date.now())
  const [qResult,  setQResult]  = useState(null)
  const [running,  setRunning]  = useState(false)
  const [tab,      setTab]      = useState('story')
  const [showObj,  setShowObj]  = useState(false)
  const timer   = useRef(null)
  const topRef  = useRef(null)
  const session = useRef(`qn_${Date.now()}_${Math.random().toString(36).slice(2,8)}`)
  const c = CASES[idx]

  useEffect(() => {
    setT0(Date.now()); setSql(''); setQResult(null)
    setHintOn(false); setHintsN(0); setAttempts(0)
    setRunning(false); setTab('story'); setShowObj(false)
    topRef.current?.scrollIntoView({ behavior:'smooth' })
    return () => clearTimeout(timer.current)
  }, [idx, phase])

  const totalScore = useMemo(() => results.reduce((a, r) => a + r.score, 0), [results])
  const persona    = useMemo(() => getPersona(results), [results])
  const progress   = ((idx + (phase === 'summary' ? 1 : 0)) / CASES.length) * 100

  const runQuery = () => {
    clearTimeout(timer.current)
    setAttempts(v => v + 1); setRunning(true); setQResult(null)
    timer.current = setTimeout(() => {
      const res = evalQuery(sql, c)
      setRunning(false); setQResult(res)
      if (res.solved) {
        const elapsed = Date.now() - t0
        const CASE_MAX = { 1: 8, 2: 13, 3: 17, 4: 18, 5: 20, 6: 24 }
        const caseMax = CASE_MAX[c.difficulty] ?? 15
        const score = Math.max(
          Math.round(caseMax * 0.35),
          caseMax - hintsN * Math.round(caseMax * 0.08) - Math.floor(elapsed / 8000) * Math.round(caseMax * 0.03) - Math.max(0, attempts - 1) * Math.round(caseMax * 0.06)
        )
        const entry   = { caseId:c.id, title:c.title, icon:c.icon, color:c.color, correct:true, score, elapsed, hintsUsed:hintsN, attempts:attempts+1, difficulty:c.difficulty }
        setResults(prev => [...prev.filter(r => r.caseId !== c.id), entry])
        sbInsert('querynoir_answers', { case_id:c.id, correct:true, attempts:attempts+1, hints_used:hintsN, elapsed_ms:elapsed, score, session_id:session.current, played_at:new Date().toISOString() })
        setTimeout(() => setPhase('resolved'), 700)
      }
    }, 900)
  }

  const skipCase = () => {
  const elapsed = Date.now() - t0.current

  const entry = {
    caseId: c.id,
    title: c.title,
    icon: c.icon,
    color: c.color,
    correct: false,
    skipped: true,
    score: 0,
    elapsed,
    hintsUsed: hintsN,
    attempts,
    difficulty: c.difficulty,
  }

  setResults(prev => [
    ...prev.filter(r => r.caseId !== c.id),
    entry
  ])

  if (idx >= CASES.length - 1) {
    setPhase('summary')
  } else {
    setIdx(i => i + 1)
    setPhase('brief')
  }
}

  const advance = () => {
    if (idx >= CASES.length - 1) {
      sbInsert('querynoir_sessions', { persona:persona.name, total_score:totalScore, cases_solved:results.filter(r=>r.correct).length, session_id:session.current, played_at:new Date().toISOString() })
      setPhase('summary')
    } else {
      setIdx(i => i + 1); setPhase('brief')
    }
  }

  const restart = () => { setPhase('nameEntry'); setIdx(0); setSql(''); setResults([]); setPlayerName(''); setNameInput({first:'',last:''}) }

  // ── NAME ENTRY ───────────────────────────────────────────────────────────────
  if (phase === 'nameEntry') return (
    <div className={s.page} ref={topRef}>
      <div className={s.bgGrid} />
      <div className={s.glow1} /><div className={s.glow2} />
      <Link to="/" className={s.backLink}>← Portfolio</Link>
      <div className={s.nameEntryWrap}>
        <div className={s.nameEntryInner}>
          <div className={s.nameEntryBadge}>
            <span className={s.badgeDot} />
            DataCorp Investigator Registration
          </div>
          <div className={s.nameEntryIcon}>🔍</div>
          <h2 className={s.nameEntryTitle}>
            Before you begin,<br /><span className={s.accent}>identify yourself.</span>
          </h2>
          <p className={s.nameEntrySub}>
            Your name will appear on your official Certificate of Achievement once the investigation is complete.
          </p>
          <div className={s.nameFields}>
            <div className={s.nameField}>
              <label className={s.nameLabel}>FIRST NAME</label>
              <input
                className={s.nameInput}
                type="text"
                placeholder="e.g. Alex"
                value={nameInput.first}
                onChange={e => setNameInput(v => ({ ...v, first: e.target.value }))}
                onKeyDown={e => {
                  if (e.key === 'Enter' && nameInput.first.trim() && nameInput.last.trim()) {
                    setPlayerName(`${nameInput.first.trim()} ${nameInput.last.trim()}`)
                    setPhase('intro')
                  }
                }}
                autoFocus
              />
            </div>
            <div className={s.nameField}>
              <label className={s.nameLabel}>LAST NAME</label>
              <input
                className={s.nameInput}
                type="text"
                placeholder="e.g. Chen"
                value={nameInput.last}
                onChange={e => setNameInput(v => ({ ...v, last: e.target.value }))}
                onKeyDown={e => {
                  if (e.key === 'Enter' && nameInput.first.trim() && nameInput.last.trim()) {
                    setPlayerName(`${nameInput.first.trim()} ${nameInput.last.trim()}`)
                    setPhase('intro')
                  }
                }}
              />
            </div>
          </div>
          {nameInput.first.trim() && nameInput.last.trim() && (
            <div className={s.namePreview}>
              Your certificate will read: <span className={s.accent}>{nameInput.first.trim()} {nameInput.last.trim()}</span>
            </div>
          )}
          <button
            className={s.ctaBtn}
            disabled={!nameInput.first.trim() || !nameInput.last.trim()}
            style={(!nameInput.first.trim() || !nameInput.last.trim()) ? { opacity:0.4, cursor:'not-allowed' } : {}}
            onClick={() => {
              setPlayerName(`${nameInput.first.trim()} ${nameInput.last.trim()}`)
              setPhase('intro')
            }}
          >
            Enter the Investigation <span>→</span>
          </button>
        </div>
      </div>
    </div>
  )

  // ── INTRO ────────────────────────────────────────────────────────────────────
  if (phase === 'intro') return (
    <div className={s.page} ref={topRef}>
      <div className={s.bgGrid} />
      <div className={s.glow1} /><div className={s.glow2} />
      <Link to="/" className={s.backLink}>← Portfolio</Link>

      <div className={s.intro}>
        <div className={s.badge}>
          <span className={s.badgeDot} />
          Interactive SQL Mystery · 6 Escalating Cases · Window Functions
        </div>

        <div className={s.eyebrow}>
          <span className={s.eyebrowLine} />
          <span>BE THE BEST DATA INVESTIGATOR</span>
          <span className={s.eyebrowLine} />
        </div>

        <h1 className={s.introTitle}>
          Query <span className={s.accent}>Noir.</span>
        </h1>

        <p className={s.introLead}>
          A campaign night went catastrophically wrong.<br />
          Five crises are unfolding simultaneously.<br />
          <strong>You're the only data investigator online.</strong>
        </p>
        <p className={s.introSub}>
          Write real SQL. Solve real patterns. Cases escalate from rookie joins to master-level multi-table leakage. Every query you write is tracked and analysed as a live data project.
        </p>

        {/* Case grid */}
        <div className={s.caseGrid}>
          {CASES.map((cs, i) => {
            const diff = DIFF_META[cs.difficulty]
            return (
              <div key={cs.id} className={`${s.caseCard} ${cs.difficulty === 6 ? s.caseCardBonus : ''}`} style={{ animationDelay:`${i*80}ms` }}>
                <div className={s.caseAccentLine} style={{ background: cs.color }} />
                <div className={s.caseTop}>
                  <span className={s.caseCode} style={{ color: cs.color }}>{cs.code}</span>
                  <span className={s.caseIcon}>{cs.icon}</span>
                </div>
                <div className={s.caseTitle}>{cs.title}</div>
                <div className={s.caseMood}>{cs.mood}</div>
                <div className={s.caseDiffBadge} style={{ color: diff.color, background: `${diff.color}14`, borderColor: `${diff.color}35` }}>
                  {'★'.repeat(Math.min(cs.difficulty,5))} {diff.label}
                </div>
                {cs.difficulty === 6 && (
                  <div className={s.windowBadge}>⚡ WINDOW FUNCTIONS</div>
                )}
                <div className={s.caseDiffDesc}>{diff.desc}</div>
                <div className={s.caseTables}>{cs.tables.map(t => <span key={t}>{t}</span>)}</div>
              </div>
            )
          })}
        </div>

        <div className={s.introStats}>
          {[['6','Escalating Cases'],['SQL','Real Queries'],['RANK()','Window Functions'],['∞','Unlimited Attempts']].map(([v, l]) => (
            <div key={l} className={s.introStat}><span>{v}</span>{l}</div>
          ))}
        </div>

        <button className={s.ctaBtn} onClick={() => setPhase('brief')}>
          {playerName ? `Begin, ${nameInput.first || playerName.split(' ')[0]} →` : 'Begin Investigation →'}
        </button>

        <p className={s.introDisclaim}>All scenarios are fictional. Query patterns are anonymously recorded as a real data project.</p>
      </div>
    </div>
  )

  // ── BRIEF ────────────────────────────────────────────────────────────────────
  if (phase === 'brief') {
    const diff = DIFF_META[c.difficulty]
    return (
      <div className={s.page} ref={topRef}>
        <div className={s.bgGrid} />
        <Link to="/" className={s.backLink}>← Portfolio</Link>
        <div className={s.brief}>
          <div className={s.briefTopbar}>
            <ProgressDots idx={idx} results={results} />
            <div className={s.progressWrap}>
              <div className={s.progressTrack}><div className={s.progressFill} style={{ width:`${progress}%`, background:c.color, boxShadow:`0 0 8px ${c.color}80` }} /></div>
              <span className={s.progressPct}>{Math.round(progress)}%</span>
            </div>
          </div>

          <div className={s.briefHero}>
            <div className={s.briefMetaRow}>
              <span className={s.briefCode} style={{ color:c.color, background:c.colorDim, borderColor:c.colorBorder }}>{c.code}</span>
              <div className={s.briefDiffPill} style={{ color: diff.color, background:`${diff.color}14`, borderColor:`${diff.color}35` }}>
                {'★'.repeat(c.difficulty)} {diff.label}
              </div>
            </div>
            <h2 className={s.briefTitle}><span>{c.icon}</span> {c.title}</h2>
            <p className={s.briefMood}>{c.mood}</p>
          </div>

          <div className={s.briefGrid}>
            <div className={s.briefLeft}>
              <div className={s.card}>
                <div className={s.cardHeader}>
                  <span className={s.cardTag}>DOSSIER</span>
                  <span className={s.cardCode}>{c.code}</span>
                </div>
                <p className={s.cardBody}>{c.story}</p>
              </div>

              <div className={s.missionCard} style={{ borderColor: c.colorBorder, background: c.colorDim }}>
                <div className={s.missionTag} style={{ color: c.color }}>▸ YOUR MISSION</div>
                <p className={s.missionBody}>{c.mission}</p>
              </div>

              <div className={s.objectiveCard}>
                <div className={s.objectiveLabel}>SQL Approach</div>
                <code className={s.objectiveCode}>{c.objective}</code>
              </div>

              <div className={s.tablesRow}>
                <span className={s.tablesLabel}>Tables:</span>
                {c.tables.map(t => <span key={t} className={s.chip}>{t}</span>)}
              </div>

              <button className="btn btn-primary" style={{ alignSelf:'flex-start' }} onClick={() => setPhase('play')}>
                Open Command Room →
              </button>
            </div>

            <div className={s.briefRight}>
              <div className={s.card} style={{ marginBottom:'1.5rem' }}>
                <div className={s.cardHeader}>
                  <span className={s.cardTag}>🔍 CLUES</span>
                </div>
                {c.clues.map((clue, i) => (
                  <div key={i} className={s.clueRow} style={{ animationDelay:`${i*90}ms` }}>
                    <span className={s.clueNum} style={{ color: c.color, borderColor: c.colorBorder, background: c.colorDim }}>{i + 1}</span>
                    <span>{clue}</span>
                  </div>
                ))}
              </div>
              <CaseChart chartData={c.chartData} chartLabel={c.chartLabel} color={c.color} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── PLAY ─────────────────────────────────────────────────────────────────────
  if (phase === 'play') {
    const diff = DIFF_META[c.difficulty]
    return (
      <div className={s.page} ref={topRef}>
        <div className={s.bgGrid} />
        <Link to="/" className={s.backLink}>← Portfolio</Link>
        <div className={s.play}>
          <div className={s.playTopbar}>
            <div className={s.playTopLeft}>
              <span className={s.playCode} style={{ color: c.color }}>{c.code}</span>
              <span className={s.playTitle}>{c.icon} {c.title}</span>
              <span className={s.playDiff} style={{ color: diff.color, background:`${diff.color}14`, borderColor:`${diff.color}30` }}>
                {'★'.repeat(c.difficulty)} {diff.label}
              </span>
            </div>
            <div className={s.playTopRight}>
              <LiveClock t0={t0} />
              <span className={s.playStat}>Attempts: <b>{attempts}</b></span>
              <span className={s.playStat}>Hints: <b>{hintsN}</b></span>
              <ProgressDots idx={idx} results={results} />
            </div>
          </div>

          <div className={s.playGrid}>
            <div className={s.playLeft}>
              {/* Mission strip */}
              <div className={s.missionStrip} style={{ borderColor: c.colorBorder, background: c.colorDim }}>
                <span className={s.missionStripLabel} style={{ color: c.color }}>MISSION</span>
                <span className={s.missionStripText}>{c.mission}</span>
                <button className={s.objToggle} onClick={() => setShowObj(v => !v)} style={{ color: c.color }}>
                  {showObj ? '▲ Hide' : '▼ SQL approach'}
                </button>
              </div>
              {showObj && (
                <div className={s.objectiveCard} style={{ marginTop:'-0.8rem' }}>
                  <code className={s.objectiveCode}>{c.objective}</code>
                </div>
              )}

              <div className={s.tabBar}>
                {[['story','📋 Evidence'],['schema','⊞ Schema'],['chart','📊 Signal']].map(([key, label]) => (
                  <button key={key} onClick={() => setTab(key)}
                    className={`${s.tabBtn} ${tab===key ? s.tabBtnOn : ''}`}
                    style={tab===key ? { borderBottomColor: c.color, color: c.color } : {}}>
                    {label}
                  </button>
                ))}
              </div>

              <div className={s.tabContent}>
                {tab === 'story' && (
                  <div className={s.storyTab}>
                    <p className={s.storyBody}>{c.story}</p>
                    <div className={s.missionCard} style={{ borderColor: c.colorBorder, background: c.colorDim }}>
                      <div className={s.missionTag} style={{ color: c.color }}>▸ FIND</div>
                      <p className={s.missionBody}>{c.mission}</p>
                    </div>
                    {c.clues.map((cl, i) => (
                      <div key={i} className={s.clueRow}>
                        <span className={s.clueNum} style={{ color: c.color, borderColor: c.colorBorder, background: c.colorDim }}>{i + 1}</span>
                        <span>{cl}</span>
                      </div>
                    ))}
                  </div>
                )}
                {tab === 'schema' && <SchemaViewer schema={c.schema} />}
                {tab === 'chart'  && <div className={s.chartTab}><CaseChart chartData={c.chartData} chartLabel={c.chartLabel} color={c.color} /></div>}
              </div>

              <SqlEditor value={sql} onChange={setSql} />
              <ResultPanel result={qResult} running={running} />

              <div className={s.actions}>
                <button className="btn btn-primary" style={{ background:`linear-gradient(135deg,${c.color},${c.color}cc)` }} onClick={runQuery}>
                  ▶ Run Query
                </button>
                <button className={s.hintBtn} onClick={() => { setHintsN(v => v + 1); setHintOn(true) }}>
                  💡 {hintsN > 0 ? `Hint (${hintsN} used)` : 'Need a Hint?'}
                </button>
                <button className={s.clearBtn} onClick={() => { setSql(''); setQResult(null) }}>✕ Clear</button>
                <button className={s.skipBtn} onClick={skipCase}>Skip Case →</button>
              </div>
              

              {hintOn && (
                <div className={s.hintBox} style={{ borderColor: c.colorBorder }}>
                  <span className={s.hintLabel} style={{ color: c.color }}>💡 Investigator Hint</span>
                  <p>{c.hint}</p>
                </div>
              )}
            </div>

            <div className={s.playRight}>
              <div className={s.telCard}>
                <div className={s.telTitle}>Investigator Panel</div>

                <div className={s.telSection}>
                  <div className={s.telLabel}>Required SQL Clauses</div>
                  <ClauseTracker required={c.required} sql={sql} color={c.color} />
                  <p className={s.telNote}>Clauses light up as you type them into your query.</p>
                </div>

                <div className={s.telSection}>
                  <div className={s.telLabel}>Difficulty</div>
                  <div className={s.diffDetail} style={{ borderColor:`${diff.color}25`, background:`${diff.color}08` }}>
                    <div className={s.diffDetailTop}>
                      <span style={{ color: diff.color, letterSpacing:'.05em' }}>{'★'.repeat(c.difficulty)}{'☆'.repeat(Math.max(0, 6 - c.difficulty))}</span>
                      <span style={{ color: diff.color, fontWeight: 700, fontFamily:'var(--font-display)', fontSize:'1.3rem' }}>{diff.label}</span>
                    </div>
                    <div className={s.diffDetailDesc}>{diff.desc}</div>
                  </div>
                </div>

                <div className={s.telSection}>
                  <div className={s.telLabel}>Tables in Scope</div>
                  <div className={s.tablesRow}>{c.tables.map(t => <span key={t} className={s.chip}>{t}</span>)}</div>
                </div>

                <div className={s.telSection}>
                  <div className={s.telLabel}>Case Progress</div>
                  <div className={s.caseList}>
                    {CASES.map((cs, i) => {
                      const r = results.find(r => r.caseId === cs.id)
                      const solved = r?.correct
                      const skipped = r?.skipped
                      const active = i === idx

                      return (
                        <div
                          key={cs.id}
                          className={`${s.caseListRow} ${active ? s.caseListActive : ''} ${solved ? s.caseListDone : ''} ${skipped ? s.caseListSkipped : ''}`}
                          style={
                            active
                              ? { borderColor: c.color }
                              : solved
                              ? { borderLeftColor: cs.color }
                              : skipped
                              ? { borderLeftColor: '#ef4444' }
                              : {}
                          }
                        >
                          <span>{cs.icon}</span>

                          <span
                            className={s.caseListCode}
                            style={
                              active
                                ? { color: c.color }
                                : solved
                                ? { color: cs.color }
                                : skipped
                                ? { color: '#ef4444' }
                                : {}
                            }
                          >
                            {cs.code}
                          </span>

                          <span className={s.caseListName}>{cs.title}</span>

                          {solved && (
                            <span style={{ color: '#22c55e', fontWeight: 700, marginLeft: 'auto' }}>
                              ✓
                            </span>
                          )}

                          {skipped && (
                            <span style={{ color: '#ef4444', fontWeight: 700, marginLeft: 'auto' }}>
                              ✕
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── RESOLVED ─────────────────────────────────────────────────────────────────
  if (phase === 'resolved') {
    const last   = results[results.length - 1]
    const diff   = DIFF_META[c.difficulty]
    const isLast = idx >= CASES.length - 1
    return (
      <div className={s.page} ref={topRef}>
        <div className={s.bgGrid} />
        <Link to="/" className={s.backLink}>← Portfolio</Link>
        <div className={s.resolved}>
          <div className={s.resolvedBanner} style={{ borderColor: c.colorBorder, background: c.colorDim }}>
            <div className={s.resolvedTick} style={{ background: c.color }}>✓</div>
            <div>
              <div className={s.resolvedTitle} style={{ color: c.color }}>Case Closed</div>
              <div className={s.resolvedSub}>{c.code} — {c.title}</div>
              <div className={s.resolvedDiff} style={{ color: diff.color }}>{'★'.repeat(c.difficulty)} {diff.label}</div>
            </div>
            {last && <div className={s.resolvedPts} style={{ color: c.color }}>+{last.score} pts</div>}
          </div>

          <div className={s.card} style={{ marginBottom:'2.5rem' }}>
            <div className={s.cardHeader}><span className={s.cardTag}>WHAT THE DATA SHOWED</span></div>
            <p className={s.revealText}>{c.reveal}</p>
          </div>

          <div className={s.card} style={{ marginBottom:'2.5rem' }}>
            <div className={s.cardHeader}><span className={s.cardTag}>REFERENCE QUERY</span></div>
            <p style={{ fontSize:'1.2rem', color:'var(--text-dim)', marginBottom:'1.2rem' }}>One correct approach to this case:</p>
            <pre className={s.starterReveal}>{c.starterSql}</pre>
          </div>

          <div className={s.resolvedResult}>
            <div className={s.resolvedResultLabel}>Your result set</div>
            <table className={s.resultTable}>
              <thead><tr>{Object.keys(c.successRows[0]).map(k => <th key={k}>{k}</th>)}</tr></thead>
              <tbody>{c.successRows.map((row, i) => (
                <tr key={i} className={s.fadeRow} style={{ animationDelay:`${i*80}ms` }}>
                  {Object.values(row).map((v, j) => <td key={j}>{v}</td>)}
                </tr>
              ))}</tbody>
            </table>
          </div>

          {last && (
            <div className={s.resolvedStats}>
              {[['Attempts',last.attempts],['Hints',last.hintsUsed],['Time',`${Math.round(last.elapsed/1000)}s`],['Score',`+${last.score}`]].map(([label, val]) => (
                <div key={label} className={s.resolvedStat}>
                  <span style={label==='Score' ? { color:c.color } : {}}>{val}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          )}

          {!isLast && (
            <div className={s.nextPreview}>
              <div className={s.telLabel} style={{ marginBottom:'.8rem' }}>Next up</div>
              <div className={s.nextPreviewCard} style={{ borderColor:`${CASES[idx+1].color}35` }}>
                <span style={{ fontSize:'2.8rem' }}>{CASES[idx+1].icon}</span>
                <div>
                  <div style={{ color:CASES[idx+1].color, fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1.3rem', letterSpacing:'.08em', marginBottom:'.3rem' }}>{CASES[idx+1].code}</div>
                  <div style={{ fontSize:'1.6rem', fontWeight:700, color:'var(--text)', marginBottom:'.3rem' }}>{CASES[idx+1].title}</div>
                  <div style={{ color:DIFF_META[CASES[idx+1].difficulty].color, fontFamily:'var(--font-display)', fontSize:'1.2rem', fontWeight:600 }}>
                    {'★'.repeat(CASES[idx+1].difficulty)} {DIFF_META[CASES[idx+1].difficulty].label} — Harder than this one
                  </div>
                </div>
              </div>
            </div>
          )}

          <button className="btn btn-primary btn-full" onClick={advance} style={{ marginTop:'1rem' }}>
            {isLast ? 'View Final Report →' : 'Open Next Case →'}
          </button>
        </div>
      </div>
    )
  }

  // ── SUMMARY ───────────────────────────────────────────────────────────────────
  if (phase === 'summary') return (
    <div className={s.page} ref={topRef}>
      <div className={s.bgGrid} />
      <div className={s.glow1} /><div className={s.glow2} />
      <Link to="/" className={s.backLink}>← Portfolio</Link>
      <div className={s.summary}>
        <div className={s.summaryBadge}>🏆 Investigation Complete</div>
        <h2 className={s.summaryTitle}>Night <span className={s.accent}>closed.</span></h2>
        <p className={s.summarySub}>DataCorp survived the campaign. Here's how you did it.</p>

        <div className={s.personaCard}>
          <div className={s.section_tag}>Your Analyst Persona</div>
          <div className={s.personaBadge}>{persona.badge}</div>
          <div className={s.personaName}>{persona.name}</div>
          <p className={s.personaDesc}>{persona.desc}</p>
        </div>

        <div className={s.summaryStats}>
          {[['Total Score', totalScore],['Cases Solved',`${results.filter(r=>r.correct).length}/${CASES.length}`],['Hints Used',results.reduce((a,r)=>a+r.hintsUsed,0)],['Attempts',results.reduce((a,r)=>a+r.attempts,0)]].map(([label, val]) => (
            <div key={label} className={s.summaryStat}>
              <span className={s.accent}>{val}</span>{label}
            </div>
          ))}
        </div>

        <div className={s.caseReport}>
          {CASES.map(cs => {
            const r = results.find(x => x.caseId === cs.id)
            const diff = DIFF_META[cs.difficulty]
            return (
              <div
                key={cs.id}
                className={`${s.reportRow} ${r ? s.reportSolved : s.reportSkip}`}
                style={r ? { borderLeftColor: cs.color } : {}}
              >
                <span style={{ fontSize:'2.2rem' }}>{cs.icon}</span>
                <div className={s.reportInfo}>
                  <div style={{ display:'flex', alignItems:'center', gap:'.8rem' }}>
                    <span
                      style={{
                        color: cs.color,
                        fontFamily: 'var(--font-display)',
                        fontWeight: 700,
                        fontSize: '1.2rem',
                        letterSpacing: '.08em'
                      }}
                    >
                      {cs.code}
                    </span>
                    <span style={{ color: diff.color, fontSize:'1.1rem' }}>
                      {'★'.repeat(cs.difficulty)}
                    </span>
                  </div>
                  <span className={s.reportTitle}>{cs.title}</span>
                </div>
                {r
                  ? (
                    <div className={s.reportNums}>
                      <span>{r.attempts}×</span>
                      <span>{Math.round(r.elapsed / 1000)}s</span>
                      <span style={{ color: cs.color, fontWeight: 900 }}>+{r.score}</span>
                    </div>
                  )
                  : <span className={s.reportSkipLabel}>Skipped</span>
                }
              </div>
            )
          })}
        </div>

        <Certificate
          results={results}
          persona={persona}
          totalScore={totalScore}
          playerName={playerName}
        />

        <div className={s.summaryActions}>
          <button className="btn btn-primary" onClick={restart}>↺ Play Again</button>
          <Link to="/" className="btn btn-outline">← Back to Portfolio</Link>
        </div>

        <div className={s.dataNote}>
          📊 Your session has been anonymously recorded. Bidhan will analyse all player SQL patterns and publish the findings as a live data project on this portfolio.
        </div>
        </div>
      </div>
  )

  return null
}
