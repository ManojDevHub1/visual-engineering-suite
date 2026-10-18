#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

async function scanProjectTokens(targetDir = process.cwd()) {
  const findings = {
    tailwind: false,
    cssVariables: [],
    themeFiles: []
  };

  // 1. Check for Tailwind
  const tailwindFiles = ['tailwind.config.js', 'tailwind.config.ts', 'tailwind.config.cjs', 'tailwind.config.mjs'];
  for (const f of tailwindFiles) {
    const full = path.join(targetDir, f);
    if (fs.existsSync(full)) {
      findings.tailwind = true;
      findings.themeFiles.push(f);
      break;
    }
  }

  // 2. Scan CSS files for custom properties (--*)
  async function searchCss(dir, depth = 0) {
    if (depth > 4) return;
    const entries = await fs.promises.readdir(dir, { withFileTypes: true }).catch(() => []);
    for (const e of entries) {
      if (e.name === 'node_modules' || e.name === '.git' || e.name === 'dist' || e.name === 'build') continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        await searchCss(full, depth + 1);
      } else if (e.name.endsWith('.css') || e.name.endsWith('.scss')) {
        const content = await fs.promises.readFile(full, 'utf8').catch(() => '');
        const matches = content.match(/--[a-zA-Z0-9_\-]+:\s*[^;]+;/g);
        if (matches && matches.length > 0) {
          findings.themeFiles.push(path.relative(targetDir, full));
          for (const m of matches.slice(0, 20)) {
            const [key, val] = m.split(':');
            findings.cssVariables.push({ name: key.trim(), sampleValue: val.replace(';', '').trim() });
          }
        }
      }
    }
  }

  await searchCss(targetDir);
  return findings;
}

const target = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
scanProjectTokens(target)
  .then(res => {
    console.log(JSON.stringify(res, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error(`Error scanning project tokens: ${err.message}`);
    process.exit(1);
  });
