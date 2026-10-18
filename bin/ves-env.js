#!/usr/bin/env node
import { auditEnvironment } from '../src/env.js';

async function main() {
  const args = process.argv.slice(2);
  const isJson = args.includes('--json');
  const showHelp = args.includes('--help') || args.includes('-h');

  if (showHelp) {
    console.log(`
Usage: ves-env [options]

Audits the current development environment for Visual Engineering Suite capabilities.

Options:
  --json        Output results in JSON format
  --help, -h    Show this help message

Exit codes:
  0   Prerequisites satisfied
  1   Critical prerequisite missing (Node < 18)
`);
    process.exit(0);
  }

  const audit = await auditEnvironment();

  if (isJson) {
    console.log(JSON.stringify(audit, null, 2));
  } else {
    console.log('\n=== Visual Engineering Suite — Environment Audit ===\n');
    console.log(`Node.js:      ${audit.runtime.node.version} (${audit.runtime.node.platform} ${audit.runtime.node.arch}) ${audit.runtime.node.supported ? '✓' : '✗'}`);
    console.log(`npm:          ${audit.runtime.npm.available ? audit.runtime.npm.version + ' ✓' : 'Not found ✗'}`);
    console.log(`git:          ${audit.runtime.git.available ? audit.runtime.git.version + ' ✓' : 'Not found ✗'}`);
    console.log('\n--- Core & Optional Libraries ---');
    console.log(`pngjs:        ${audit.libraries.pngjs.available ? 'Installed ✓' : 'Not installed ✗'}`);
    console.log(`pixelmatch:   ${audit.libraries.pixelmatch.available ? 'Installed ✓' : 'Not installed ✗'}`);
    console.log(`playwright:   ${audit.libraries.playwright.available ? 'Installed ✓ (Headless browser automation ready)' : 'Optional (Not installed — manual or native browser tool required)'}`);
    console.log('\n--- Detected Coding Agents ---');
    console.log(`Antigravity:  ${audit.agents.antigravity.detected ? 'Detected ✓' : 'Not detected in current scope'}`);
    console.log(`Claude Code:  ${audit.agents.claudeCode.detected ? 'Detected ✓' : 'Not detected in current scope'}`);
    console.log(`Cursor:       ${audit.agents.cursor.detected ? 'Detected ✓' : 'Not detected in current scope'}`);
    console.log('\n--- Active Capabilities ---');
    console.log(`Dimension Validation:        ${audit.capabilities.dimensionValidation ? 'Ready ✓' : 'Unavailable ✗'}`);
    console.log(`Pixel-Level Visual Diff:     ${audit.capabilities.visualDiff ? 'Ready ✓' : 'Unavailable ✗'}`);
    console.log(`Automated Browser Capture:   ${audit.capabilities.automatedBrowserScreenshots ? 'Ready ✓' : 'Optional (Install playwright)'}`);
    console.log(`Manifest & Skill Validation: ${audit.capabilities.manifestValidation ? 'Ready ✓' : 'Unavailable ✗'}`);
    console.log('');
  }

  if (!audit.runtime.node.supported) {
    process.exit(1);
  }
  process.exit(0);
}

main().catch(err => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
