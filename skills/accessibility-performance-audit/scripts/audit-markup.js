#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

async function auditFileMarkup(filePath) {
  const issues = [];
  const content = await fs.promises.readFile(filePath, 'utf8');
  const lines = content.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Check 1: <img> tag without alt attribute
    if (/<img\b/i.test(line) && !/\balt\s*=/i.test(line)) {
      issues.push({
        line: lineNum,
        rule: 'WCAG 1.1.1',
        severity: 'Major',
        message: '<img> element missing "alt" attribute'
      });
    }

    // Check 2: outline: none or outline-none without replacement ring
    if (/outline:\s*none|outline:\s*0\b/i.test(line) && !/ring|box-shadow|focus-visible/i.test(line)) {
      issues.push({
        line: lineNum,
        rule: 'WCAG 2.4.7',
        severity: 'Major',
        message: 'Focus outline removed without visible focus replacement'
      });
    }

    // Check 3: button with no text content and no aria-label
    if (/<button\b(?![^>]*\baria-label=)[^>]*>\s*<(svg|i|span class=.*icon.*)\b[^>]*>\s*<\/(svg|i|span)>\s*<\/button>/i.test(line)) {
      issues.push({
        line: lineNum,
        rule: 'WCAG 4.1.2',
        severity: 'Major',
        message: 'Icon-only <button> missing accessible name or aria-label'
      });
    }

    // Check 4: Hardcoded fixed wide pixel widths causing mobile overflow
    const fixedWidthMatch = line.match(/width:\s*([4-9]\d{2,}|[1-9]\d{3,})px/i);
    if (fixedWidthMatch) {
      issues.push({
        line: lineNum,
        rule: 'WCAG 1.4.10',
        severity: 'Minor',
        message: `Fixed width (${fixedWidthMatch[1]}px) may cause horizontal overflow on mobile viewports. Prefer max-width or fluid %`
      });
    }
  }

  return { filePath, issues };
}

async function run() {
  const target = process.argv[2];
  if (!target) {
    console.log('Usage: node audit-markup.js <fileOrDirectoryPath>');
    process.exit(1);
  }

  const stat = await fs.promises.stat(target);
  const results = [];

  if (stat.isFile()) {
    results.push(await auditFileMarkup(path.resolve(target)));
  } else {
    async function walk(dir) {
      const entries = await fs.promises.readdir(dir, { withFileTypes: true }).catch(() => []);
      for (const e of entries) {
        if (['node_modules', '.git', 'dist', 'build'].includes(e.name)) continue;
        const full = path.join(dir, e.name);
        if (e.isDirectory()) {
          await walk(full);
        } else if (/\.(html|jsx|tsx|vue|svelte)$/i.test(e.name)) {
          results.push(await auditFileMarkup(full));
        }
      }
    }
    await walk(path.resolve(target));
  }

  console.log(JSON.stringify(results, null, 2));
}

run().catch(err => {
  console.error(`Error: ${err.message}`);
  process.exit(2);
});
