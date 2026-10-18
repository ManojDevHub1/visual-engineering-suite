import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { validatePluginManifest, validateSkillFile } from './manifest.js';
import { CANONICAL_SKILL_NAMES } from './doctor.js';

/**
 * Calculates SHA-256 for a file buffer or file path.
 * @param {string} filePath 
 * @returns {string}
 */
function fileSha256(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buf).digest('hex');
}

/**
 * Recursively copies a directory, skipping ignored patterns.
 * 
 * @param {string} src 
 * @param {string} dest 
 * @param {Map<string, string>} fileHashes 
 * @param {string} baseDest 
 */
function copyDirRecursive(src, dest, fileHashes, baseDest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.visual-engineering' || entry.name === 'tests') {
      continue;
    }

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath, fileHashes, baseDest);
    } else {
      fs.copyFileSync(srcPath, destPath);
      const relPath = path.relative(baseDest, destPath).replace(/\\/g, '/');
      fileHashes.set(relPath, fileSha256(destPath));
    }
  }
}

/**
 * Validates and packages the repository as a clean Antigravity plugin distribution bundle.
 * 
 * @param {object} options
 * @param {string} [options.sourceDir=process.cwd()]
 * @param {string} [options.destDir]
 * @param {boolean} [options.validateOnly=false]
 * @returns {Promise<{
 *   valid: boolean,
 *   errors: string[],
 *   warnings: string[],
 *   pluginMetadata: object,
 *   skillsCount: number,
 *   bundledFilesCount?: number,
 *   bundledBytes?: number,
 *   destDir?: string,
 *   bundleManifestPath?: string
 * }>}
 */
export async function packagePlugin(options = {}) {
  const sourceDir = path.resolve(options.sourceDir || process.cwd());
  const destDir = options.destDir ? path.resolve(options.destDir) : null;
  const validateOnly = Boolean(options.validateOnly || !destDir);

  const errors = [];
  const warnings = [];

  // 1. Validate plugin.json
  const pluginJsonPath = path.join(sourceDir, 'plugin.json');
  if (!fs.existsSync(pluginJsonPath)) {
    errors.push(`Missing plugin.json at root: ${pluginJsonPath}`);
    return { valid: false, errors, warnings, pluginMetadata: {}, skillsCount: 0 };
  }

  const pluginVal = await validatePluginManifest(pluginJsonPath);
  errors.push(...pluginVal.errors);
  warnings.push(...pluginVal.warnings);

  let pluginMetadata = {};
  try {
    pluginMetadata = JSON.parse(fs.readFileSync(pluginJsonPath, 'utf8'));
  } catch (err) {
    errors.push(`Failed to parse plugin.json: ${err.message}`);
  }

  // 2. Validate rules/AGENTS.md
  const rulesPath = path.join(sourceDir, 'rules', 'AGENTS.md');
  if (!fs.existsSync(rulesPath)) {
    warnings.push('Recommended rules/AGENTS.md is missing from plugin bundle.');
  } else {
    const rulesContent = fs.readFileSync(rulesPath, 'utf8').trim();
    if (rulesContent.length === 0) {
      warnings.push('rules/AGENTS.md is empty.');
    }
  }

  // 3. Validate assets
  if (pluginMetadata.logo) {
    const logoFullPath = path.join(sourceDir, pluginMetadata.logo);
    if (!fs.existsSync(logoFullPath)) {
      errors.push(`Referenced logo file not found: ${pluginMetadata.logo}`);
    }
  }

  // 4. Validate canonical skills
  const skillsDir = path.join(sourceDir, 'skills');
  let validSkillsCount = 0;
  if (!fs.existsSync(skillsDir)) {
    errors.push(`Skills directory not found: ${skillsDir}`);
  } else {
    for (const skillName of CANONICAL_SKILL_NAMES) {
      const skillMd = path.join(skillsDir, skillName, 'SKILL.md');
      if (!fs.existsSync(skillMd)) {
        errors.push(`Missing canonical skill: ${skillName}`);
        continue;
      }
      const sVal = await validateSkillFile(skillMd);
      if (!sVal.valid) {
        errors.push(`Canonical skill "${skillName}" failed validation: ${sVal.errors.join('; ')}`);
      } else {
        validSkillsCount++;
      }
    }
  }

  if (errors.length > 0) {
    return {
      valid: false,
      errors,
      warnings,
      pluginMetadata,
      skillsCount: validSkillsCount
    };
  }

  // If validateOnly or no destDir, stop here
  if (validateOnly) {
    return {
      valid: true,
      errors: [],
      warnings,
      pluginMetadata,
      skillsCount: validSkillsCount
    };
  }

  // 5. Staging/Packaging into destDir
  if (fs.existsSync(destDir)) {
    // Clean target dir if exists
    fs.rmSync(destDir, { recursive: true, force: true });
  }
  fs.mkdirSync(destDir, { recursive: true });

  const fileHashes = new Map();

  // Explicit files to copy
  const rootFiles = ['plugin.json', 'README.md', 'LICENSE', 'package.json'];
  for (const rf of rootFiles) {
    const srcFile = path.join(sourceDir, rf);
    if (fs.existsSync(srcFile)) {
      const targetFile = path.join(destDir, rf);
      fs.copyFileSync(srcFile, targetFile);
      fileHashes.set(rf, fileSha256(targetFile));
    }
  }

  // Explicit directories to copy
  const dirsToCopy = ['rules', 'assets', 'skills', 'src', 'bin'];
  for (const dirName of dirsToCopy) {
    const srcSub = path.join(sourceDir, dirName);
    if (fs.existsSync(srcSub)) {
      const destSub = path.join(destDir, dirName);
      copyDirRecursive(srcSub, destSub, fileHashes, destDir);
    }
  }

  // Generate distribution bundle manifest
  const bundleManifest = {
    bundleFormat: 'antigravity-plugin-v1',
    plugin: {
      name: pluginMetadata.name,
      displayName: pluginMetadata.displayName || pluginMetadata.name,
      version: pluginMetadata.version || '1.0.0',
      description: pluginMetadata.description
    },
    packagedAt: new Date().toISOString(),
    skills: CANONICAL_SKILL_NAMES,
    totalFiles: fileHashes.size,
    files: Object.fromEntries(fileHashes.entries())
  };

  const bundleManifestPath = path.join(destDir, 'ves-bundle.json');
  fs.writeFileSync(bundleManifestPath, JSON.stringify(bundleManifest, null, 2), 'utf8');

  // Compute total bytes
  let totalBytes = 0;
  function sumBytes(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) sumBytes(p);
      else totalBytes += fs.statSync(p).size;
    }
  }
  sumBytes(destDir);

  return {
    valid: true,
    errors: [],
    warnings,
    pluginMetadata,
    skillsCount: validSkillsCount,
    bundledFilesCount: fileHashes.size + 1, // including ves-bundle.json
    bundledBytes: totalBytes,
    destDir,
    bundleManifestPath
  };
}
