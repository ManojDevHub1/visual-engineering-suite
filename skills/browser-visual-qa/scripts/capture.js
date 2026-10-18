#!/usr/bin/env node
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cliScript = path.resolve(__dirname, '../../../bin/ves-screenshot.js');

const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('Usage: node capture.js <url> <outputPath> [--preset mobile|tablet|desktop|wide] [options]');
  process.exit(1);
}

const child = spawn(process.execPath, [cliScript, ...args], {
  stdio: 'inherit'
});

child.on('exit', code => {
  process.exit(code ?? 0);
});
