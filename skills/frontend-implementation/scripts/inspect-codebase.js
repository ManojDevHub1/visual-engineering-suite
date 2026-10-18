#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

async function inspectCodebase(targetDir = process.cwd()) {
  const result = {
    framework: 'unknown',
    typescript: false,
    styling: 'vanilla-css',
    componentDir: null,
    dependencies: []
  };

  const pkgJsonPath = path.join(targetDir, 'package.json');
  if (fs.existsSync(pkgJsonPath)) {
    try {
      const pkg = JSON.parse(await fs.promises.readFile(pkgJsonPath, 'utf8'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      result.dependencies = Object.keys(deps);

      if (deps['next']) result.framework = 'nextjs';
      else if (deps['react']) result.framework = 'react';
      else if (deps['vue']) result.framework = 'vue';
      else if (deps['@sveltejs/kit'] || deps['svelte']) result.framework = 'svelte';
      else if (deps['astro']) result.framework = 'astro';

      if (deps['typescript'] || fs.existsSync(path.join(targetDir, 'tsconfig.json'))) {
        result.typescript = true;
      }

      if (deps['tailwindcss']) result.styling = 'tailwind';
      else if (deps['@emotion/react'] || deps['styled-components']) result.styling = 'css-in-js';
      else if (deps['sass']) result.styling = 'sass';
    } catch {
      // Ignore parse error
    }
  }

  // Look for standard component directories
  const candidateDirs = ['src/components', 'components', 'src/ui', 'app/components'];
  for (const c of candidateDirs) {
    if (fs.existsSync(path.join(targetDir, c))) {
      result.componentDir = c;
      break;
    }
  }

  return result;
}

const target = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
inspectCodebase(target)
  .then(res => {
    console.log(JSON.stringify(res, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  });
