import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import { encodePng, compareImages } from '../src/diff.js';

function fillRect(png, x, y, width, height, r, g, b, a = 255) {
  for (let cy = Math.round(y); cy < Math.round(y + height); cy++) {
    for (let cx = Math.round(x); cx < Math.round(x + width); cx++) {
      if (cx >= 0 && cx < png.width && cy >= 0 && cy < png.height) {
        const idx = (cy * png.width + cx) * 4;
        png.data[idx] = r;
        png.data[idx + 1] = g;
        png.data[idx + 2] = b;
        png.data[idx + 3] = a;
      }
    }
  }
}

function drawCircle(png, cx, cy, radius, r, g, b, a = 255) {
  const r2 = radius * radius;
  for (let y = Math.round(cy - radius); y <= Math.round(cy + radius); y++) {
    for (let x = Math.round(cx - radius); x <= Math.round(cx + radius); x++) {
      const dist2 = (x - cx) * (x - cx) + (y - cy) * (y - cy);
      if (dist2 <= r2 && x >= 0 && x < png.width && y >= 0 && y < png.height) {
        const idx = (y * png.width + x) * 4;
        png.data[idx] = r;
        png.data[idx + 1] = g;
        png.data[idx + 2] = b;
        png.data[idx + 3] = a;
      }
    }
  }
}

function drawCircleRing(png, cx, cy, innerRadius, outerRadius, r, g, b, a = 255) {
  const in2 = innerRadius * innerRadius;
  const out2 = outerRadius * outerRadius;
  for (let y = Math.round(cy - outerRadius); y <= Math.round(cy + outerRadius); y++) {
    for (let x = Math.round(cx - outerRadius); x <= Math.round(cx + outerRadius); x++) {
      const dist2 = (x - cx) * (x - cx) + (y - cy) * (y - cy);
      if (dist2 >= in2 && dist2 <= out2 && x >= 0 && x < png.width && y >= 0 && y < png.height) {
        const idx = (y * png.width + x) * 4;
        png.data[idx] = r;
        png.data[idx + 1] = g;
        png.data[idx + 2] = b;
        png.data[idx + 3] = a;
      }
    }
  }
}

export async function generateAllBenchmarkCases(baseDir = path.resolve('benchmarks/cases')) {
  await fs.promises.mkdir(baseDir, { recursive: true });

  // ==========================================
  // CASE A: LANDING PAGE HERO
  // ==========================================
  const landingDir = path.join(baseDir, 'case-landing-page');
  await fs.promises.mkdir(landingDir, { recursive: true });

  const landingW = 800;
  const landingH = 500;

  // Reference
  const lRef = new PNG({ width: landingW, height: landingH });
  fillRect(lRef, 0, 0, landingW, landingH, 15, 23, 42); // slate 900
  fillRect(lRef, 0, 0, landingW, 56, 30, 41, 59); // header slate 800
  fillRect(lRef, 32, 16, 64, 24, 56, 189, 248); // logo sky 400
  fillRect(lRef, 540, 22, 50, 12, 148, 163, 184); // nav link
  fillRect(lRef, 610, 22, 50, 12, 148, 163, 184); // nav link
  fillRect(lRef, 680, 22, 50, 12, 148, 163, 184); // nav link
  fillRect(lRef, 48, 96, 152, 24, 2, 132, 199); // badge sky 600
  fillRect(lRef, 48, 136, 412, 40, 248, 250, 252); // headline slate 50
  fillRect(lRef, 48, 192, 352, 24, 148, 163, 184); // subtitle slate 400
  fillRect(lRef, 48, 248, 160, 48, 37, 99, 235); // primary CTA blue 600
  fillRect(lRef, 224, 248, 144, 48, 51, 65, 85); // secondary CTA slate 700
  fillRect(lRef, 500, 96, 252, 284, 30, 41, 59); // visual card slate 800

  const lRefBuf = await encodePng(lRef);
  await fs.promises.writeFile(path.join(landingDir, 'reference.png'), lRefBuf);

  // Initial render with CTA color discrepancy (indigo-600 #4f46e5)
  const lInit = new PNG({ width: landingW, height: landingH });
  lRef.data.copy(lInit.data);
  fillRect(lInit, 48, 248, 160, 48, 79, 70, 229); // #4f46e5

  const lInitBuf = await encodePng(lInit);
  await fs.promises.writeFile(path.join(landingDir, 'initial-render.png'), lInitBuf);

  // Refined render (identical to reference)
  await fs.promises.writeFile(path.join(landingDir, 'refined-render.png'), lRefBuf);

  // Landing Page case.json
  const landingCaseJson = {
    id: "CASE-LANDING-01",
    name: "SaaS Landing Page Hero Section",
    category: "landing-page",
    version: "1.0.0",
    description: "Evaluate visual hierarchy, typography ladder, spacing alignment, CTA placement, and navigation landmarks on a modern dark-theme hero section.",
    viewports: [
      { name: "desktop", width: 800, height: 500 }
    ],
    requirements: {
      visual: [
        "Header bar height 56px with aligned logo and 3 navigation links",
        "Announcement badge pill at x: 48, y: 96",
        "Two-tier typography ladder: bold headline (32px) and muted subtitle (16px)",
        "Primary CTA button with blue-600 (#2563EB) background, size 160x48px",
        "Secondary CTA button with border outline, size 144x48px",
        "Hero visual container card at x: 500, y: 96, size 252x284px"
      ],
      functional: [
        "Navigation landmarks present with semantic <header> and <nav> tags",
        "All interactive buttons and links have accessible names",
        "No uncaught JavaScript errors or broken internal anchors"
      ],
      accessibility: [
        "Color contrast on primary CTA text exceeds WCAG 2.1 AA 4.5:1",
        "Touch targets for CTAs satisfy minimum 44x44px",
        "Visible focus state specified for keyboard navigation"
      ]
    },
    acceptanceCriteria: {
      maxDiffPercentage: 0.1,
      maxDiffPixels: 100,
      colorThreshold: 0.1,
      requiredSemanticTags: ["header", "nav", "main", "button"],
      minTouchTargetPx: 44,
      minContrastRatio: 4.5
    },
    expectedOutcomes: {
      initialRender: {
        expectedDiffPercentRange: [1.5, 2.5],
        expectedDefects: ["COLOR_DISCREPANCY"],
        description: "Primary CTA button rendered with incorrect theme color (Indigo-600 #4F46E5 instead of Blue-600 #2563EB)"
      },
      refinedRender: {
        expectedDiffPercentRange: [0.0, 0.05],
        maxDiffPixels: 50,
        expectedDefects: []
      }
    },
    knownLimitations: [
      "Operating system font antialiasing variations require comparison threshold 0.1."
    ]
  };

  await fs.promises.writeFile(path.join(landingDir, 'case.json'), JSON.stringify(landingCaseJson, null, 2), 'utf8');

  // Landing Page component.html
  const landingHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SaaS Hero Component</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; }
    header { height: 56px; background: #1e293b; display: flex; align-items: center; justify-content: space-between; padding: 0 32px; }
    .logo { width: 64px; height: 24px; background: #38bdf8; border-radius: 4px; }
    nav a { color: #94a3b8; text-decoration: none; margin-left: 20px; font-size: 14px; }
    main { padding: 40px 48px; display: flex; justify-content: space-between; }
    .badge { display: inline-block; background: #0284c7; color: #ffffff; padding: 4px 12px; border-radius: 9999px; font-size: 12px; margin-bottom: 16px; }
    h1 { font-size: 32px; line-height: 1.25; margin-bottom: 16px; max-width: 412px; }
    p { font-size: 16px; color: #94a3b8; margin-bottom: 32px; max-width: 352px; }
    .btn-group { display: flex; gap: 16px; }
    .btn-primary { width: 160px; height: 48px; background: #2563eb; color: #ffffff; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; }
    .btn-secondary { width: 144px; height: 48px; background: transparent; border: 1px solid #334155; color: #f8fafc; border-radius: 6px; font-weight: 500; cursor: pointer; }
    .hero-card { width: 252px; height: 284px; background: #1e293b; border-radius: 8px; border: 1px solid #334155; }
  </style>
</head>
<body>
  <header>
    <div class="logo" role="img" aria-label="Acme Logo"></div>
    <nav aria-label="Main Navigation">
      <a href="#features">Features</a>
      <a href="#pricing">Pricing</a>
      <a href="#docs">Docs</a>
    </nav>
  </header>
  <main>
    <div>
      <span class="badge">New Release v2.0</span>
      <h1>Build faster with verified agent visual skills</h1>
      <p>Continuous closed-loop visual regression engineering for enterprise frontend teams.</p>
      <div class="btn-group">
        <button class="btn-primary" type="button">Get Started</button>
        <button class="btn-secondary" type="button">Documentation</button>
      </div>
    </div>
    <div class="hero-card" role="region" aria-label="Interactive preview"></div>
  </main>
</body>
</html>`;
  await fs.promises.writeFile(path.join(landingDir, 'component.html'), landingHtml, 'utf8');

  // Landing Page tokens.json
  const landingTokens = {
    colors: {
      bgDark: "#0f172a",
      surfaceDark: "#1e293b",
      borderDark: "#334155",
      textPrimary: "#f8fafc",
      textMuted: "#94a3b8",
      brandPrimary: "#2563eb",
      brandAccent: "#38bdf8",
      badgeBg: "#0284c7"
    },
    spacing: { headerHeight: 56, ctaHeight: 48, ctaPrimaryWidth: 160, ctaSecondaryWidth: 144 },
    radii: { sm: 4, md: 6, lg: 8, pill: 9999 }
  };
  await fs.promises.writeFile(path.join(landingDir, 'tokens.json'), JSON.stringify(landingTokens, null, 2), 'utf8');

  // ==========================================
  // CASE B: ANALYTICS DASHBOARD
  // ==========================================
  const dashDir = path.join(baseDir, 'case-dashboard');
  await fs.promises.mkdir(dashDir, { recursive: true });

  const dashW = 900;
  const dashH = 600;

  // Reference
  const dRef = new PNG({ width: dashW, height: dashH });
  // Main canvas background (#f8fafc)
  fillRect(dRef, 0, 0, dashW, dashH, 248, 250, 252);
  // Sidebar slate-900 (#0f172a), x: 0..200
  fillRect(dRef, 0, 0, 200, dashH, 15, 23, 42);
  // Sidebar logo (#38bdf8), x: 24..100, y: 24..48
  fillRect(dRef, 24, 24, 76, 24, 56, 189, 248);
  // Sidebar nav items (4 items, x: 24..176, y: 88, 136, 184, 232)
  fillRect(dRef, 24, 88, 152, 32, 30, 41, 59); // active item
  fillRect(dRef, 24, 136, 152, 32, 15, 23, 42);
  fillRect(dRef, 24, 184, 152, 32, 15, 23, 42);
  fillRect(dRef, 24, 232, 152, 32, 15, 23, 42);
  // Top header bar (#ffffff, y: 0..64, x: 200..900)
  fillRect(dRef, 200, 0, 700, 64, 255, 255, 255);
  // Header title (#0f172a, x: 232..400, y: 22..42)
  fillRect(dRef, 232, 22, 168, 20, 15, 23, 42);
  // Header date filter button (#e2e8f0, x: 740..868, y: 16..48)
  fillRect(dRef, 740, 16, 128, 32, 226, 232, 240);

  // 3 KPI Cards at y: 96..206 (height: 110px)
  // Card 1: x: 232..432 (w: 200)
  fillRect(dRef, 232, 96, 200, 110, 255, 255, 255);
  fillRect(dRef, 248, 112, 100, 14, 100, 116, 139); // title
  fillRect(dRef, 248, 140, 120, 28, 15, 23, 42); // value
  fillRect(dRef, 360, 172, 56, 20, 34, 197, 94); // badge green

  // Card 2: x: 452..652 (w: 200)
  fillRect(dRef, 452, 96, 200, 110, 255, 255, 255);
  fillRect(dRef, 468, 112, 100, 14, 100, 116, 139);
  fillRect(dRef, 468, 140, 110, 28, 15, 23, 42);
  fillRect(dRef, 580, 172, 56, 20, 59, 130, 246); // badge blue

  // Card 3: x: 672..872 (w: 200)
  fillRect(dRef, 672, 96, 200, 110, 255, 255, 255);
  fillRect(dRef, 688, 112, 100, 14, 100, 116, 139);
  fillRect(dRef, 688, 140, 90, 28, 15, 23, 42);
  fillRect(dRef, 800, 172, 56, 20, 34, 197, 94); // badge green

  // Data table: x: 232..872 (w: 640), y: 236..560
  fillRect(dRef, 232, 236, 640, 324, 255, 255, 255);
  fillRect(dRef, 232, 236, 640, 44, 241, 245, 249); // table header
  fillRect(dRef, 232, 324, 640, 1, 226, 232, 240); // row divider
  fillRect(dRef, 232, 380, 640, 1, 226, 232, 240); // row divider
  fillRect(dRef, 232, 436, 640, 1, 226, 232, 240); // row divider

  const dRefBuf = await encodePng(dRef);
  await fs.promises.writeFile(path.join(dashDir, 'reference.png'), dRefBuf);

  // Initial render: Card 2 shifted down by 16px (y: 112 instead of 96) and missing badge
  const dInit = new PNG({ width: dashW, height: dashH });
  dRef.data.copy(dInit.data);
  // Clear Card 2 area
  fillRect(dInit, 452, 96, 200, 130, 248, 250, 252);
  // Redraw shifted Card 2 at y: 112 (16px displacement) without badge
  fillRect(dInit, 452, 112, 200, 110, 255, 255, 255);
  fillRect(dInit, 468, 128, 100, 14, 100, 116, 139);
  fillRect(dInit, 468, 156, 110, 28, 15, 23, 42);
  // badge omitted

  const dInitBuf = await encodePng(dInit);
  await fs.promises.writeFile(path.join(dashDir, 'initial-render.png'), dInitBuf);

  // Refined render (identical to reference)
  await fs.promises.writeFile(path.join(dashDir, 'refined-render.png'), dRefBuf);

  // Dashboard case.json
  const dashCaseJson = {
    id: "CASE-DASHBOARD-01",
    name: "Executive Analytics Dashboard",
    category: "dashboard",
    version: "1.0.0",
    description: "Evaluate multi-column layout integrity, KPI card grid alignment, data table semantics, and state indicators.",
    viewports: [
      { name: "desktop", width: 900, height: 600 }
    ],
    requirements: {
      visual: [
        "Fixed-width dark sidebar (200px) with logo and navigation items",
        "Top header bar height 64px with title and filter action",
        "3 KPI metric cards horizontally aligned at y: 96px with width 200px and height 110px",
        "Metric indicator badges present with appropriate status colors (green/blue)",
        "Structured data table container (640x324px) with shaded header row"
      ],
      functional: [
        "Semantic layout using <aside> for sidebar and <main> for dashboard content",
        "Data presented in semantic <table> structure with <thead> and <tbody>",
        "All KPI cards have accessible headings"
      ],
      accessibility: [
        "WCAG 2.1 AA text contrast satisfied across light and dark panels",
        "Table column headers use scope='col'",
        "Filter controls have accessible labels"
      ]
    },
    acceptanceCriteria: {
      maxDiffPercentage: 0.1,
      maxDiffPixels: 150,
      colorThreshold: 0.1,
      requiredSemanticTags: ["aside", "main", "header", "table", "thead", "tbody", "th", "td"],
      minTouchTargetPx: 44,
      minContrastRatio: 4.5
    },
    expectedOutcomes: {
      initialRender: {
        expectedDiffPercentRange: [2.0, 4.0],
        expectedDefects: ["LAYOUT_DISPLACEMENT", "MISSING_ELEMENT"],
        description: "KPI Card #2 vertically displaced by 16px and growth metric badge omitted"
      },
      refinedRender: {
        expectedDiffPercentRange: [0.0, 0.05],
        maxDiffPixels: 50,
        expectedDefects: []
      }
    },
    knownLimitations: [
      "Dynamic data timestamps must be frozen in visual regression tests."
    ]
  };

  await fs.promises.writeFile(path.join(dashDir, 'case.json'), JSON.stringify(dashCaseJson, null, 2), 'utf8');

  // Dashboard component.html
  const dashHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Analytics Dashboard</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; color: #0f172a; display: flex; height: 600px; }
    aside { width: 200px; background: #0f172a; color: #ffffff; padding: 24px; display: flex; flex-direction: column; gap: 16px; }
    .logo { width: 76px; height: 24px; background: #38bdf8; border-radius: 4px; margin-bottom: 24px; }
    aside nav a { display: block; padding: 8px 12px; color: #94a3b8; text-decoration: none; border-radius: 6px; font-size: 14px; }
    aside nav a.active { background: #1e293b; color: #ffffff; font-weight: 600; }
    main { flex: 1; display: flex; flex-direction: column; }
    header { height: 64px; background: #ffffff; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; padding: 0 32px; }
    h1 { font-size: 20px; font-weight: 700; }
    .btn-filter { padding: 8px 16px; background: #e2e8f0; border: none; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; }
    .content { padding: 32px; display: flex; flex-direction: column; gap: 30px; }
    .kpi-grid { display: flex; gap: 20px; }
    .kpi-card { width: 200px; height: 110px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; display: flex; flex-direction: column; justify-content: space-between; }
    .kpi-title { font-size: 13px; color: #64748b; font-weight: 500; }
    .kpi-val { font-size: 24px; font-weight: 700; }
    .kpi-badge { align-self: flex-end; font-size: 12px; padding: 2px 8px; border-radius: 9999px; font-weight: 600; }
    .badge-green { background: #dcfce7; color: #166534; }
    .badge-blue { background: #dbeafe; color: #1e40af; }
    .table-container { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
    table { width: 100%; border-collapse: collapse; text-align: left; }
    th { background: #f1f5f9; padding: 12px 16px; font-size: 13px; color: #475569; font-weight: 600; }
    td { padding: 14px 16px; border-top: 1px solid #e2e8f0; font-size: 14px; }
  </style>
</head>
<body>
  <aside>
    <div class="logo" role="img" aria-label="Dashboard Logo"></div>
    <nav aria-label="Dashboard Navigation">
      <a href="#overview" class="active">Overview</a>
      <a href="#customers">Customers</a>
      <a href="#products">Products</a>
      <a href="#settings">Settings</a>
    </nav>
  </aside>
  <main>
    <header>
      <h1>Analytics Overview</h1>
      <button class="btn-filter" type="button" aria-label="Date Range Filter">Last 30 Days</button>
    </header>
    <div class="content">
      <section class="kpi-grid" aria-label="Key Performance Indicators">
        <article class="kpi-card">
          <span class="kpi-title">Total Revenue</span>
          <span class="kpi-val">$128,450</span>
          <span class="kpi-badge badge-green">+12.4%</span>
        </article>
        <article class="kpi-card">
          <span class="kpi-title">Active Users</span>
          <span class="kpi-val">14,290</span>
          <span class="kpi-badge badge-blue">+8.1%</span>
        </article>
        <article class="kpi-card">
          <span class="kpi-title">Conversion Rate</span>
          <span class="kpi-val">3.42%</span>
          <span class="kpi-badge badge-green">+0.6%</span>
        </article>
      </section>
      <section class="table-container" aria-label="Recent Transactions">
        <table>
          <thead>
            <tr>
              <th scope="col">Transaction ID</th>
              <th scope="col">Customer</th>
              <th scope="col">Amount</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>TX-9021</td>
              <td>Acme Corp</td>
              <td>$4,200.00</td>
              <td>Completed</td>
            </tr>
            <tr>
              <td>TX-9022</td>
              <td>Global Logistics</td>
              <td>$1,850.00</td>
              <td>Completed</td>
            </tr>
            <tr>
              <td>TX-9023</td>
              <td>Vertex Labs</td>
              <td>$6,400.00</td>
              <td>Pending</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  </main>
</body>
</html>`;
  await fs.promises.writeFile(path.join(dashDir, 'component.html'), dashHtml, 'utf8');

  // Dashboard tokens.json
  const dashTokens = {
    colors: {
      sidebarBg: "#0f172a",
      canvasBg: "#f8fafc",
      cardBg: "#ffffff",
      borderSubtle: "#e2e8f0",
      textHead: "#0f172a",
      textMuted: "#64748b",
      greenBadgeBg: "#dcfce7",
      greenBadgeText: "#166534",
      blueBadgeBg: "#dbeafe",
      blueBadgeText: "#1e40af"
    },
    spacing: { sidebarWidth: 200, headerHeight: 64, cardWidth: 200, cardHeight: 110 }
  };
  await fs.promises.writeFile(path.join(dashDir, 'tokens.json'), JSON.stringify(dashTokens, null, 2), 'utf8');

  // ==========================================
  // CASE C: ECOMMERCE PRODUCT CARD
  // ==========================================
  const ecomDir = path.join(baseDir, 'case-ecommerce');
  await fs.promises.mkdir(ecomDir, { recursive: true });

  const ecomW = 600;
  const ecomH = 600;

  // Reference
  const eRef = new PNG({ width: ecomW, height: ecomH });
  // Canvas bg (#f1f5f9)
  fillRect(eRef, 0, 0, ecomW, ecomH, 241, 245, 249);
  // Centered Card container: x: 110..490 (w: 380), y: 40..560 (h: 520) (#ffffff)
  fillRect(eRef, 110, 40, 380, 520, 255, 255, 255);
  // Card image hero area: x: 130..470 (w: 340), y: 60..290 (h: 230) (#0f172a)
  fillRect(eRef, 130, 60, 340, 230, 15, 23, 42);
  // Graphic accent in image: (#38bdf8), x: 260..340, y: 130..220
  fillRect(eRef, 260, 130, 80, 90, 56, 189, 248);

  // Title: x: 130..390, y: 310..330 (#0f172a)
  fillRect(eRef, 130, 310, 260, 20, 15, 23, 42);
  // Price: x: 130..220, y: 340..362 (#2563eb)
  fillRect(eRef, 130, 340, 90, 22, 37, 99, 235);

  // Color swatches: 3 circular swatches at y: 390
  // Swatch 1: cx: 144, cy: 390, r: 12 (#1e293b)
  drawCircle(eRef, 144, 390, 12, 30, 41, 59);
  // Swatch 2: cx: 184, cy: 390, r: 12 (#2563eb) + active ring (inner: 14, outer: 17)
  drawCircle(eRef, 184, 390, 12, 37, 99, 235);
  drawCircleRing(eRef, 184, 390, 14, 17, 37, 99, 235); // active ring
  // Swatch 3: cx: 224, cy: 390, r: 12 (#94a3b8)
  drawCircle(eRef, 224, 390, 12, 148, 163, 184);

  // Quantity stepper [- 1 +], 44x44px touch targets at y: 424..468 (h: 44px)
  fillRect(eRef, 130, 424, 44, 44, 226, 232, 240); // minus
  fillRect(eRef, 174, 424, 44, 44, 241, 245, 249); // count
  fillRect(eRef, 218, 424, 44, 44, 226, 232, 240); // plus

  // Add to Cart CTA: x: 130..470 (w: 340), y: 486..536 (h: 50) (#2563eb)
  fillRect(eRef, 130, 486, 340, 50, 37, 99, 235);

  const eRefBuf = await encodePng(eRef);
  await fs.promises.writeFile(path.join(ecomDir, 'reference.png'), eRefBuf);

  // Initial render:
  // Discrepancy 1: Swatch 2 active selection ring omitted
  // Discrepancy 2: Stepper buttons undersized (30x30px at y: 431 instead of 44x44px)
  const eInit = new PNG({ width: ecomW, height: ecomH });
  eRef.data.copy(eInit.data);
  // Overwrite swatch 2 ring area with white background
  drawCircleRing(eInit, 184, 390, 14, 18, 255, 255, 255);
  // Clear stepper area
  fillRect(eInit, 130, 424, 140, 48, 255, 255, 255);
  // Draw undersized stepper 30x30px
  fillRect(eInit, 130, 431, 30, 30, 226, 232, 240);
  fillRect(eInit, 160, 431, 30, 30, 241, 245, 249);
  fillRect(eInit, 190, 431, 30, 30, 226, 232, 240);

  const eInitBuf = await encodePng(eInit);
  await fs.promises.writeFile(path.join(ecomDir, 'initial-render.png'), eInitBuf);

  // Refined render (identical to reference)
  await fs.promises.writeFile(path.join(ecomDir, 'refined-render.png'), eRefBuf);

  // Ecommerce case.json
  const ecomCaseJson = {
    id: "CASE-ECOMMERCE-01",
    name: "Responsive Product Detail Card",
    category: "ecommerce",
    version: "1.0.0",
    description: "Evaluate product card layout, image presentation, accessible color swatch radio group, touch-target compliance, and action buttons.",
    viewports: [
      { name: "mobile-desktop-card", width: 600, height: 600 }
    ],
    requirements: {
      visual: [
        "Product container card centered at x: 110px with width 380px and height 520px",
        "Hero product preview image area 340x230px with balanced margins",
        "Color swatch selection group with 3 swatches; active swatch visually denoted with outline ring",
        "Quantity stepper buttons meet minimum 44x44px touch targets",
        "Prominent Add to Cart CTA button with height 50px and primary brand color #2563EB"
      ],
      functional: [
        "Card structured using semantic <article> with <figure> for media",
        "Color swatches use role='radiogroup' and individual role='radio' with aria-checked",
        "Quantity stepper controls have accessible names (Decrease quantity, Increase quantity)",
        "Add to cart button handles disabled/loading state indicators"
      ],
      accessibility: [
        "Active swatch state communicated programmatically via aria-checked='true'",
        "Touch targets for stepper controls meet or exceed 44x44px",
        "Text color contrast meets WCAG 2.1 AA requirement"
      ]
    },
    acceptanceCriteria: {
      maxDiffPercentage: 0.1,
      maxDiffPixels: 120,
      colorThreshold: 0.1,
      requiredSemanticTags: ["article", "figure", "button"],
      minTouchTargetPx: 44,
      minContrastRatio: 4.5
    },
    expectedOutcomes: {
      initialRender: {
        expectedDiffPercentRange: [0.8, 2.0],
        expectedDefects: ["COLOR_DISCREPANCY", "LAYOUT_DISPLACEMENT"],
        description: "Active swatch ring omitted and stepper touch targets undersized (30x30px vs required 44x44px)"
      },
      refinedRender: {
        expectedDiffPercentRange: [0.0, 0.05],
        maxDiffPixels: 50,
        expectedDefects: []
      }
    },
    knownLimitations: [
      "Image compression artifacts must be masked when testing external JPEG assets."
    ]
  };

  await fs.promises.writeFile(path.join(ecomDir, 'case.json'), JSON.stringify(ecomCaseJson, null, 2), 'utf8');

  // Ecommerce component.html
  const ecomHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Product Card Component</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f1f5f9; display: flex; justify-content: center; align-items: center; min-height: 600px; }
    article { width: 380px; height: 520px; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 20px; display: flex; flex-direction: column; justify-content: space-between; }
    figure { width: 340px; height: 230px; background: #0f172a; border-radius: 8px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
    .product-graphic { width: 80px; height: 90px; background: #38bdf8; border-radius: 6px; }
    h2 { font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 12px; }
    .price { font-size: 20px; font-weight: 700; color: #2563eb; margin-top: 4px; }
    .swatches { display: flex; gap: 12px; align-items: center; margin-top: 12px; }
    .swatch { width: 24px; height: 24px; border-radius: 50%; border: none; cursor: pointer; position: relative; }
    .swatch[aria-checked="true"]::after { content: ''; position: absolute; top: -4px; left: -4px; right: -4px; bottom: -4px; border: 2px solid #2563eb; border-radius: 50%; }
    .swatch-1 { background: #1e293b; }
    .swatch-2 { background: #2563eb; }
    .swatch-3 { background: #94a3b8; }
    .stepper-container { display: flex; align-items: center; gap: 16px; margin-top: 12px; }
    .stepper { display: flex; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; }
    .stepper-btn { width: 44px; height: 44px; background: #e2e8f0; border: none; font-size: 18px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .stepper-val { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600; background: #f8fafc; }
    .btn-add { width: 340px; height: 50px; background: #2563eb; color: #ffffff; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; }
  </style>
</head>
<body>
  <article>
    <figure>
      <div class="product-graphic" role="img" aria-label="Wireless ANC Headphones Image"></div>
    </figure>
    <div>
      <h2>Pro Wireless ANC Headphones</h2>
      <div class="price">$249.00</div>
      <div class="swatches" role="radiogroup" aria-label="Color Options">
        <button class="swatch swatch-1" role="radio" aria-checked="false" aria-label="Obsidian" type="button"></button>
        <button class="swatch swatch-2" role="radio" aria-checked="true" aria-label="Cobalt Blue" type="button"></button>
        <button class="swatch swatch-3" role="radio" aria-checked="false" aria-label="Silver" type="button"></button>
      </div>
      <div class="stepper-container">
        <div class="stepper" role="group" aria-label="Quantity Selection">
          <button class="stepper-btn" type="button" aria-label="Decrease quantity">-</button>
          <span class="stepper-val" aria-live="polite">1</span>
          <button class="stepper-btn" type="button" aria-label="Increase quantity">+</button>
        </div>
      </div>
    </div>
    <button class="btn-add" type="button">Add to Cart</button>
  </article>
</body>
</html>`;
  await fs.promises.writeFile(path.join(ecomDir, 'component.html'), ecomHtml, 'utf8');

  // Ecommerce tokens.json
  const ecomTokens = {
    colors: {
      canvasBg: "#f1f5f9",
      cardBg: "#ffffff",
      imageBg: "#0f172a",
      accent: "#38bdf8",
      brandPrimary: "#2563eb",
      textHead: "#0f172a",
      textMuted: "#64748b"
    },
    touchTargets: { minSizePx: 44 },
    radii: { card: 12, image: 8, btn: 8 }
  };
  await fs.promises.writeFile(path.join(ecomDir, 'tokens.json'), JSON.stringify(ecomTokens, null, 2), 'utf8');

  return {
    cases: ['case-landing-page', 'case-dashboard', 'case-ecommerce'],
    baseDir
  };
}

// Auto-run if executed directly
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve('benchmarks/generate-benchmark-fixtures.js')) {
  generateAllBenchmarkCases().then((res) => {
    console.log(`Generated ${res.cases.length} benchmark cases in ${res.baseDir}:`);
    for (const c of res.cases) {
      console.log(`  ✓ ${c}`);
    }
  }).catch(console.error);
}
