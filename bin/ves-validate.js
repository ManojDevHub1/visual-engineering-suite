#!/usr/bin/env node
import path from 'node:path';
import { validateRepositorySkills } from '../src/manifest.js';

async function main() {
  const args = process.argv.slice(2);
  const isJson = args.includes('--json');
  const showHelp = args.includes('--help') || args.includes('-h');
  const positional = args.filter(a => !a.startsWith('-'));

  if (showHelp) {
    console.log(`
Usage: ves-validate [directory] [options]

Validates all SKILL.md files and plugin.json manifests for open Agent Skills and Antigravity compliance.

Arguments:
  [directory]     Directory to scan (default: current working directory)

Options:
  --json          Output results in machine-readable JSON format
  --help, -h      Show this help message

Exit codes:
  0   All skills and manifests are valid
  1   One or more validation errors found
  2   Fatal execution error
`);
    process.exit(0);
  }

  const targetDir = positional[0] ? path.resolve(positional[0]) : process.cwd();

  try {
    const report = await validateRepositorySkills(targetDir);

    let hasErrors = false;
    for (const r of report.results) {
      if (!r.result.valid) hasErrors = true;
    }
    if (report.pluginResult && !report.pluginResult.valid) {
      hasErrors = true;
    }

    if (isJson) {
      console.log(JSON.stringify({ targetDir, ...report }, null, 2));
    } else {
      console.log(`\n=== Visual Engineering Suite — Manifest Validation ===\n`);
      console.log(`Target Directory: ${targetDir}`);
      console.log(`Skills Found:     ${report.totalSkills} (${report.validSkills} valid, ${report.totalSkills - report.validSkills} invalid)\n`);

      for (const item of report.results) {
        const relPath = path.relative(targetDir, item.path);
        const st = item.result.valid ? '✓ VALID' : '✗ INVALID';
        console.log(`[${st}] ${relPath} (name: "${item.result.name || 'N/A'}")`);
        for (const err of item.result.errors) {
          console.log(`    Error:   ${err}`);
        }
        for (const warn of item.result.warnings) {
          console.log(`    Warning: ${warn}`);
        }
      }

      if (report.pluginResult) {
        console.log(`\n--- Plugin Manifest (plugin.json) ---`);
        const st = report.pluginResult.valid ? '✓ VALID' : '✗ INVALID';
        console.log(`[${st}] plugin.json`);
        for (const err of report.pluginResult.errors) {
          console.log(`    Error:   ${err}`);
        }
        for (const warn of report.pluginResult.warnings) {
          console.log(`    Warning: ${warn}`);
        }
      }
      console.log('');
    }

    process.exit(hasErrors ? 1 : 0);
  } catch (err) {
    if (isJson) {
      console.log(JSON.stringify({ error: err.message }, null, 2));
    } else {
      console.error(`Fatal error: ${err.message}`);
    }
    process.exit(2);
  }
}

main();
