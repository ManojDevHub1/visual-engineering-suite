#!/usr/bin/env node

/**
 * ves-pack: Automated Antigravity Plugin Packager and Distribution Builder.
 * 
 * Usage:
 *   node bin/ves-pack.js [--dest <outputDirectory>] [--validate-only] [--json]
 * 
 * Exit codes:
 *   0: Validation / packaging successful
 *   2: Validation error or missing assets
 */

import path from 'node:path';
import { packagePlugin } from '../src/pack.js';

const args = process.argv.slice(2);
const isJson = args.includes('--json');
const isValidateOnly = args.includes('--validate-only');

let destDir = null;
const destIndex = args.indexOf('--dest');
if (destIndex !== -1 && args[destIndex + 1]) {
  destDir = args[destIndex + 1];
}

async function main() {
  try {
    const result = await packagePlugin({
      sourceDir: process.cwd(),
      destDir,
      validateOnly: isValidateOnly
    });

    if (isJson) {
      console.log(JSON.stringify(result, null, 2));
      process.exit(result.valid ? 0 : 2);
    }

    console.log('=== Visual Engineering Suite — Antigravity Plugin Packager ===\n');

    if (!result.valid) {
      console.error('[✗ FAILED] Plugin packaging validation failed:');
      for (const err of result.errors) {
        console.error(`  ✗ ${err}`);
      }
      process.exit(2);
    }

    console.log(`Plugin:       ${result.pluginMetadata.displayName || result.pluginMetadata.name} (v${result.pluginMetadata.version})`);
    console.log(`Description:  ${result.pluginMetadata.description}`);
    console.log(`Skills:       ${result.skillsCount} canonical skills validated`);

    if (result.warnings.length > 0) {
      console.log('\nWarnings:');
      for (const w of result.warnings) {
        console.log(`  ! ${w}`);
      }
    }

    if (destDir && result.destDir) {
      console.log(`\n[✓ SUCCESS] Plugin packaged successfully into:`);
      console.log(`  Destination: ${result.destDir}`);
      console.log(`  Files:       ${result.bundledFilesCount} files`);
      console.log(`  Total Size:  ${(result.bundledBytes / 1024).toFixed(2)} KB`);
      console.log(`  Manifest:    ${result.bundleManifestPath}`);
    } else {
      console.log('\n[✓ VALID] Plugin manifest, assets, rules, and canonical skills are packaging-ready.');
      console.log('  To build a clean distribution bundle, run:');
      console.log('    node bin/ves-pack.js --dest dist/visual-engineering-suite');
    }

    process.exit(0);
  } catch (err) {
    if (isJson) {
      console.error(JSON.stringify({ valid: false, error: err.message }));
    } else {
      console.error(`[CRITICAL] Plugin packager encountered an error: ${err.message}`);
    }
    process.exit(2);
  }
}

main();
