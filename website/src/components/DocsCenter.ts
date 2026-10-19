import { siteConfig } from '../site.config.js';

export const DOCS_SECTIONS = [
  {
    id: "getting-started",
    title: "Getting Started",
    content: `
      <h3>Zero to First Visual Diff in 5 Minutes</h3>
      <p>The Visual Engineering Suite provides a complete local developer toolchain with zero native build tools or C++ compilation requirements.</p>

      <h4>Prerequisites</h4>
      <ul>
        <li>Node.js >= 18.0.0</li>
        <li>npm >= 9.0.0</li>
        <li>Git</li>
      </ul>

      <h4>1. Clone and Install Core Dependencies</h4>
      <div class="code-box">
        <pre><code>git clone ${siteConfig.gitCloneUrl || (siteConfig.githubUrl + '.git')}
cd visual-engineering-suite
npm install</code></pre>
      </div>

      <h4>2. Run the System Doctor</h4>
      <div class="code-box">
        <pre><code>npm run check-health</code></pre>
      </div>

      <h4>3. Execute Your First Visual Regression Diff</h4>
      <div class="code-box">
        <pre><code>node bin/ves-diff.js \\
  examples/01-landing-page/reference-hero.png \\
  examples/01-landing-page/rendered-hero.png \\
  --diff examples/01-landing-page/diff-hero.png</code></pre>
      </div>
      <p>The discrepancy bounding box <code>[x: 48..207, y: 248..295]</code> will immediately pinpoint where the candidate render used an indigo CTA button instead of reference blue.</p>
    `
  },
  {
    id: "cli-tools",
    title: "CLI Tooling Reference",
    content: `
      <h3>Standalone Node.js Executables (bin/)</h3>
      <p>The suite includes standalone, portable executables with zero compilation requirements:</p>

      <table class="compat-table">
        <thead>
          <tr>
            <th>Executable</th>
            <th>Primary Function</th>
            <th>Standard Command</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>ves-doctor</code></td>
            <td>Runtime, dependency, and SHA-256 skill drift health check</td>
            <td><code>node bin/ves-doctor.js [--json]</code></td>
          </tr>
          <tr>
            <td><code>ves-pack</code></td>
            <td>Antigravity plugin packager and release manifest builder</td>
            <td><code>node bin/ves-pack.js [--dest &lt;dir&gt;]</code></td>
          </tr>
          <tr>
            <td><code>ves-benchmark</code></td>
            <td>Quantitative benchmark evaluation suite runner</td>
            <td><code>node bin/ves-benchmark.js [--mode &lt;mode&gt;]</code></td>
          </tr>
          <tr>
            <td><code>ves-refine</code></td>
            <td>Visual refinement loop coordinator and run artifact tracker</td>
            <td><code>node bin/ves-refine.js init --reference &lt;ref.png&gt;</code></td>
          </tr>
          <tr>
            <td><code>ves-diff</code></td>
            <td>Pure-JS pixel regression comparator and bounding box locator</td>
            <td><code>node bin/ves-diff.js &lt;ref.png&gt; &lt;cand.png&gt; --diff out.png</code></td>
          </tr>
          <tr>
            <td><code>ves-dimension</code></td>
            <td>Fast image header inspector and dimension validator</td>
            <td><code>node bin/ves-dimension.js &lt;img1.png&gt; [&lt;img2.png&gt;]</code></td>
          </tr>
          <tr>
            <td><code>ves-screenshot</code></td>
            <td>Headless browser viewport screenshot capture (requires optional playwright)</td>
            <td><code>node bin/ves-screenshot.js &lt;url&gt; &lt;out.png&gt; [--preset mobile|tablet|desktop|wide]</code></td>
          </tr>
          <tr>
            <td><code>ves-validate</code></td>
            <td>Frontmatter and markdown internal link validator</td>
            <td><code>node bin/ves-validate.js [dir]</code></td>
          </tr>
          <tr>
            <td><code>ves-env</code></td>
            <td>Machine runtime capability and dependency auditor</td>
            <td><code>node bin/ves-env.js [--json]</code></td>
          </tr>
        </tbody>
      </table>
    `
  },
  {
    id: "refinement-engine",
    title: "Visual Refinement Engine",
    content: `
      <h3>Evidence-Driven Closed-Loop Refinement</h3>
      <p>The refinement coordinator enforces configurable iteration limits, halts on test regressions, and stores verifiable run artifacts under <code>.visual-engineering/runs/&lt;run-id&gt;/</code>.</p>

      <h4>Refinement Safety Guards</h4>
      <ul>
        <li><strong>Strict Iteration Limit:</strong> Caps cycles to 3 (configurable) to prevent infinite loops.</li>
        <li><strong>Stagnation Detection:</strong> Halts automatically if two consecutive iterations produce zero reduction in mismatched pixels.</li>
        <li><strong>Safety Circuit Breaker:</strong> Aborts immediately if a suggested modification causes any automated test to fail.</li>
        <li><strong>Artifact Persistence:</strong> Generates machine-readable <code>run.json</code> and readable <code>summary.md</code> documenting every change.</li>
      </ul>

      <div class="code-box">
        <pre><code># Initialize a new refinement session
node bin/ves-refine.js init --reference mockup.png --max-iterations 3 --max-diff 0.5

# Record an iteration step
node bin/ves-refine.js step --run &lt;runId&gt; --rendered candidate.png --test-passed true</code></pre>
      </div>
    `
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting & FAQ",
    content: `
      <h3>Common Developer Questions</h3>

      <h4>Q: Why does ves-doctor show a warning about Playwright?</h4>
      <p>Playwright is an <strong>optional dependency</strong> used for automated browser screenshot capture. Core visual diffing, dimension checking, token extraction, and refinement coordination use pure JavaScript (<code>pngjs</code> + <code>pixelmatch</code>) and require no browser binaries. If you need automated browser screenshots:</p>
      <div class="code-box">
        <pre><code>npm install --save-optional playwright
npx playwright install chromium</code></pre>
      </div>

      <h4>Q: How do I handle OS font antialiasing differences?</h4>
      <p>Text rendering engines differ between macOS (CoreText), Windows (DirectWrite), and Linux (FreeType). When comparing across different operating systems:</p>
      <ul>
        <li>Set threshold to <code>0.1</code> or <code>0.15</code>: <code>--threshold 0.1</code></li>
        <li>Filter subpixel antialiasing: <code>--include-aa false</code></li>
        <li>Alternatively, render within headless Chrome in a Docker container for identical rasterization.</li>
      </ul>

      <h4>Q: How does path resolution work when installed inside an agent?</h4>
      <p>All helper scripts inside <code>skills/&lt;name&gt;/scripts/</code> use portable relative path resolvers. They dynamically probe candidate paths (<code>../../../bin/</code>, <code>process.cwd()/bin/</code>, <code>node_modules</code>) and fallback to <code>npx</code>, ensuring seamless execution across Antigravity, Claude Code, and Cursor.</p>
    `
  }
];

export function renderDocsCenter(): string {
  return `
    <section id="docs" class="section" aria-labelledby="docs-title">
      <div class="container">
        <div class="section-header">
          <div class="badge badge-purple" style="margin-bottom: var(--space-3);">Technical Documentation</div>
          <h2 id="docs-title">Documentation & Developer Guides</h2>
          <p>
            Everything you need to configure, integrate, evaluate, and deploy the Universal Visual Engineering Suite in your frontend projects.
          </p>
        </div>

        <div class="docs-layout">
          <!-- Docs Navigation Sidebar -->
          <aside class="docs-nav-sidebar" role="navigation" aria-label="Documentation Navigation">
            <div class="docs-nav-list" role="tablist" aria-orientation="vertical">
              ${DOCS_SECTIONS.map((sec, idx) => `
                <button type="button" 
                        class="docs-nav-item ${idx === 0 ? 'active' : ''}" 
                        role="tab" 
                        id="tab-doc-${sec.id}" 
                        aria-selected="${idx === 0 ? 'true' : 'false'}" 
                        aria-controls="panel-doc-${sec.id}" 
                        data-doc-id="${sec.id}">
                  ${sec.title}
                </button>
              `).join('')}
            </div>
          </aside>

          <!-- Docs Content Area -->
          <div class="docs-content-area">
            ${DOCS_SECTIONS.map((sec, idx) => `
              <div class="docs-panel ${idx === 0 ? 'active' : ''}" 
                   id="panel-doc-${sec.id}" 
                   role="tabpanel" 
                   aria-labelledby="tab-doc-${sec.id}" 
                   ${idx !== 0 ? 'hidden' : ''}>
                <div class="card docs-card">
                  ${sec.content.trim()}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </section>
  `;
}
