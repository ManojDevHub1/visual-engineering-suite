#!/usr/bin/env node

/**
 * ves-doctor: Comprehensive Environment, Skill Integrity, and Cross-Agent Installation Doctor.
 * 
 * Usage:
 *   node bin/ves-doctor.js [directory] [--json]
 * 
 * Exit codes:
 *   0: All required components healthy and operational
 *   1: Warnings present (e.g. optional Playwright missing or drifted installed skills)
 *   2: Critical issues present (e.g. Node unsupported, core dependencies missing, skill invalid)
 */

import path from 'node:path';
import { runDoctorAudit, formatDoctorTerminal } from '../src/doctor.js';

const args = process.argv.slice(2);
const isJson = args.includes('--json');
const positionalArgs = args.filter(a => !a.startsWith('--'));
const targetDir = positionalArgs[0] ? path.resolve(positionalArgs[0]) : process.cwd();

async function main() {
  try {
    const audit = await runDoctorAudit(targetDir);

    if (isJson) {
      console.log(JSON.stringify(audit, null, 2));
    } else {
      console.log(formatDoctorTerminal(audit));
    }

    process.exit(audit.exitCode);
  } catch (err) {
    if (isJson) {
      console.error(JSON.stringify({
        status: 'error',
        exitCode: 2,
        error: err.message,
        stack: err.stack
      }));
    } else {
      console.error(`[CRITICAL] ves-doctor encountered an unexpected error: ${err.message}`);
    }
    process.exit(2);
  }
}

main();
