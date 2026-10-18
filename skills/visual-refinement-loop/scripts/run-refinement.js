#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function resolveCli(toolName) {
  const candidates = [
    path.resolve(__dirname, `../../../bin/${toolName}.js`),
    path.resolve(process.cwd(), `bin/${toolName}.js`),
    path.resolve(process.cwd(), `node_modules/visual-engineering-suite/bin/${toolName}.js`),
    path.resolve(__dirname, `../../../../node_modules/visual-engineering-suite/bin/${toolName}.js`),
    path.resolve(__dirname, `../../../node_modules/visual-engineering-suite/bin/${toolName}.js`)
  ];

  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

const args = process.argv.slice(2);
if (args.length === 0 && !args.includes('--help') && !args.includes('-h')) {
  console.log('Usage: node run-refinement.js <run|init|step|status> [options]');
  process.exit(1);
}

const localScript = resolveCli('ves-refine');

if (localScript) {
  const child = spawn(process.execPath, [localScript, ...args], {
    stdio: 'inherit'
  });
  child.on('exit', code => process.exit(code ?? 0));
  child.on('error', err => {
    console.error(`Execution error: ${err.message}`);
    process.exit(2);
  });
} else {
  const isWindows = process.platform === 'win32';
  const npxCmd = isWindows ? 'npx.cmd' : 'npx';
  const child = spawn(npxCmd, ['--yes', 'ves-refine', ...args], {
    stdio: 'inherit'
  });
  child.on('exit', code => process.exit(code ?? 0));
  child.on('error', () => {
    console.error('Could not locate ves-refine. In the development repository, run via "node bin/ves-refine.js". In an installed project, ensure "visual-engineering-suite" is installed or run via "npx ves-refine".');
    process.exit(2);
  });
}
