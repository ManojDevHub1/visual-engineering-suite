import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';
import { validateSkillFile, validatePluginManifest } from './manifest.js';

/**
 * Calculates SHA-256 checksum for a file.
 * @param {string} filePath 
 * @returns {string|null}
 */
export function computeFileChecksum(filePath) {
  try {
    const data = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(data).digest('hex');
  } catch {
    return null;
  }
}

/**
 * Expected 7 canonical skills in the Visual Engineering Suite.
 */
export const CANONICAL_SKILL_NAMES = [
  'visual-reconstruction',
  'design-system-extraction',
  'frontend-implementation',
  'browser-visual-qa',
  'visual-regression-triage',
  'accessibility-performance-audit',
  'visual-refinement-loop'
];

/**
 * Executes doctor audit on the workspace.
 * 
 * @param {string} [workspaceDir=process.cwd()]
 * @returns {Promise<DoctorAuditResult>}
 */
export async function runDoctorAudit(workspaceDir = process.cwd()) {
  const issues = {
    critical: [],
    warnings: [],
    info: []
  };
  const recommendations = [];

  // 1. Runtime Audit
  const nodeMajor = parseInt(process.versions.node.split('.')[0], 10);
  const nodeSupported = nodeMajor >= 18;
  if (!nodeSupported) {
    issues.critical.push(`Node.js version ${process.version} is unsupported. Node >= 18.0.0 is required.`);
    recommendations.push('Upgrade Node.js to v18.0.0 or higher.');
  }

  let npmVersion = null;
  try {
    npmVersion = execSync('npm -v', { stdio: ['ignore', 'pipe', 'ignore'], encoding: 'utf8', timeout: 3000 }).trim();
  } catch {
    issues.warnings.push('npm CLI was not found in PATH.');
    recommendations.push('Install Node.js with npm included.');
  }

  let gitVersion = null;
  try {
    gitVersion = execSync('git --version', { stdio: ['ignore', 'pipe', 'ignore'], encoding: 'utf8', timeout: 3000 }).trim();
  } catch {
    issues.info.push('Git CLI was not found in PATH.');
  }

  // 2. Dependency Audit
  let pngjsAvailable = false;
  try {
    await import('pngjs');
    pngjsAvailable = true;
  } catch {
    issues.critical.push('Required dependency "pngjs" is not installed.');
    recommendations.push('Run: npm install to install core dependencies.');
  }

  let pixelmatchAvailable = false;
  try {
    await import('pixelmatch');
    pixelmatchAvailable = true;
  } catch {
    issues.critical.push('Required dependency "pixelmatch" is not installed.');
    recommendations.push('Run: npm install to install core dependencies.');
  }

  let playwrightAvailable = false;
  try {
    await import('playwright');
    playwrightAvailable = true;
  } catch {
    issues.warnings.push('Optional dependency "playwright" is not installed (automated browser capture unavailable).');
    recommendations.push('For automated browser screenshots, run: npm install --save-optional playwright && npx playwright install chromium');
  }

  // 3. Canonical Skills Audit
  const skillsDir = path.join(workspaceDir, 'skills');
  const canonicalSkillsReport = {
    directory: skillsDir,
    exists: fs.existsSync(skillsDir),
    totalExpected: CANONICAL_SKILL_NAMES.length,
    foundCount: 0,
    validCount: 0,
    skills: {}
  };

  if (!canonicalSkillsReport.exists) {
    issues.critical.push(`Canonical skills directory not found at: ${skillsDir}`);
    recommendations.push('Ensure you are running ves-doctor from the visual-engineering-suite root repository.');
  } else {
    for (const skillName of CANONICAL_SKILL_NAMES) {
      const skillPath = path.join(skillsDir, skillName);
      const skillMd = path.join(skillPath, 'SKILL.md');
      const skillExists = fs.existsSync(skillPath) && fs.existsSync(skillMd);

      if (!skillExists) {
        issues.critical.push(`Missing canonical skill: ${skillName}`);
        canonicalSkillsReport.skills[skillName] = {
          exists: false,
          valid: false,
          errors: ['SKILL.md not found']
        };
        continue;
      }

      canonicalSkillsReport.foundCount++;
      const val = await validateSkillFile(skillMd);
      const checksum = computeFileChecksum(skillMd);

      // Verify scripts directory
      const scriptsDir = path.join(skillPath, 'scripts');
      let scriptFiles = [];
      if (fs.existsSync(scriptsDir)) {
        scriptFiles = fs.readdirSync(scriptsDir).filter(f => f.endsWith('.js'));
      }

      // Verify references directory
      const refsDir = path.join(skillPath, 'references');
      let refFiles = [];
      if (fs.existsSync(refsDir)) {
        refFiles = fs.readdirSync(refsDir);
      }

      canonicalSkillsReport.skills[skillName] = {
        exists: true,
        valid: val.valid,
        name: val.name,
        description: val.description,
        checksum,
        scripts: scriptFiles,
        references: refFiles,
        errors: val.errors,
        warnings: val.warnings
      };

      if (val.valid) {
        canonicalSkillsReport.validCount++;
      } else {
        issues.critical.push(`Skill "${skillName}" failed validation: ${val.errors.join('; ')}`);
      }
    }
  }

  // 4. Plugin Manifest Audit
  const pluginJsonPath = path.join(workspaceDir, 'plugin.json');
  let pluginReport = {
    exists: fs.existsSync(pluginJsonPath),
    valid: false,
    errors: [],
    warnings: []
  };

  if (pluginReport.exists) {
    const pVal = await validatePluginManifest(pluginJsonPath);
    pluginReport = {
      exists: true,
      valid: pVal.valid,
      errors: pVal.errors,
      warnings: pVal.warnings
    };
    if (!pVal.valid) {
      issues.critical.push(`plugin.json failed validation: ${pVal.errors.join('; ')}`);
    }
  } else {
    issues.warnings.push('Root plugin.json not found (Antigravity native plugin packaging inactive).');
  }

  // 5. Agent Installations Audit (Workspace & User Global)
  const home = os.homedir();
  const installTargets = [
    {
      agent: 'antigravity',
      scope: 'workspace',
      type: 'skills',
      path: path.join(workspaceDir, '.agents', 'skills')
    },
    {
      agent: 'antigravity',
      scope: 'workspace',
      type: 'plugin',
      path: path.join(workspaceDir, '.agents', 'plugins', 'visual-engineering-suite')
    },
    {
      agent: 'antigravity',
      scope: 'global',
      type: 'skills',
      path: path.join(home, '.gemini', 'antigravity', 'skills')
    },
    {
      agent: 'antigravity',
      scope: 'global',
      type: 'plugin',
      path: path.join(home, '.gemini', 'config', 'plugins', 'visual-engineering-suite')
    },
    {
      agent: 'claude-code',
      scope: 'workspace',
      type: 'skills',
      path: path.join(workspaceDir, '.claude', 'skills')
    },
    {
      agent: 'claude-code',
      scope: 'global',
      type: 'skills',
      path: path.join(home, '.claude', 'skills')
    },
    {
      agent: 'cursor',
      scope: 'workspace',
      type: 'skills',
      path: path.join(workspaceDir, '.cursor', 'skills')
    },
    {
      agent: 'cursor',
      scope: 'global',
      type: 'skills',
      path: path.join(home, '.cursor', 'skills')
    }
  ];

  const agentInstallations = [];

  for (const target of installTargets) {
    const exists = fs.existsSync(target.path);
    if (!exists) continue;

    // Inspect skills found in this target
    let installedSkills = [];
    let matchCount = 0;
    let driftCount = 0;

    if (target.type === 'skills') {
      try {
        const subdirs = fs.readdirSync(target.path, { withFileTypes: true });
        for (const dir of subdirs) {
          if (!dir.isDirectory()) continue;
          if (CANONICAL_SKILL_NAMES.includes(dir.name)) {
            const skillMd = path.join(target.path, dir.name, 'SKILL.md');
            if (fs.existsSync(skillMd)) {
              const hash = computeFileChecksum(skillMd);
              const canonicalHash = canonicalSkillsReport.skills[dir.name]?.checksum;
              const matchesCanonical = canonicalHash && hash === canonicalHash;
              if (matchesCanonical) {
                matchCount++;
              } else {
                driftCount++;
              }
              installedSkills.push({
                name: dir.name,
                matchesCanonical,
                checksum: hash
              });
            }
          }
        }
      } catch (err) {
        issues.warnings.push(`Could not read directory ${target.path}: ${err.message}`);
      }
    } else if (target.type === 'plugin') {
      // For plugin target, check skills subdirectory inside plugin
      const innerSkillsDir = path.join(target.path, 'skills');
      if (fs.existsSync(innerSkillsDir)) {
        try {
          const subdirs = fs.readdirSync(innerSkillsDir, { withFileTypes: true });
          for (const dir of subdirs) {
            if (!dir.isDirectory()) continue;
            if (CANONICAL_SKILL_NAMES.includes(dir.name)) {
              installedSkills.push({ name: dir.name, matchesCanonical: true });
              matchCount++;
            }
          }
        } catch {}
      }
    }

    if (installedSkills.length > 0) {
      if (driftCount > 0) {
        issues.warnings.push(`Detected ${driftCount} drifted skill(s) in ${target.agent} (${target.scope}): ${target.path}`);
        recommendations.push(`Update skills in ${target.path} using: npx skills add . -a ${target.agent} -y`);
      }
      agentInstallations.push({
        agent: target.agent,
        scope: target.scope,
        type: target.type,
        path: target.path,
        installedSkillsCount: installedSkills.length,
        matchCount,
        driftCount,
        skills: installedSkills
      });
    }
  }

  // 6. Overall Status Determination
  let status = 'healthy';
  let exitCode = 0;

  if (issues.critical.length > 0) {
    status = 'critical';
    exitCode = 2;
  } else if (issues.warnings.length > 0) {
    status = 'warning';
    exitCode = 1;
  }

  return {
    timestamp: new Date().toISOString(),
    status,
    exitCode,
    runtime: {
      node: {
        version: process.version,
        major: nodeMajor,
        supported: nodeSupported,
        platform: process.platform,
        arch: process.arch
      },
      npm: { version: npmVersion },
      git: { version: gitVersion }
    },
    dependencies: {
      pngjs: pngjsAvailable,
      pixelmatch: pixelmatchAvailable,
      playwright: playwrightAvailable
    },
    canonicalSkills: canonicalSkillsReport,
    plugin: pluginReport,
    agentInstallations,
    issues,
    recommendations
  };
}

/**
 * Formats doctor audit into human-readable terminal output.
 * @param {ReturnType<typeof runDoctorAudit> extends Promise<infer T> ? T : never} audit 
 * @returns {string}
 */
export function formatDoctorTerminal(audit) {
  const lines = [];

  lines.push('=== Visual Engineering Suite — System & Installation Doctor ===\n');

  // Status banner
  if (audit.status === 'healthy') {
    lines.push('Overall Health:   [✓ HEALTHY] — All systems operational');
  } else if (audit.status === 'warning') {
    lines.push('Overall Health:   [! WARNING] — Ready for core use, optional features missing');
  } else {
    lines.push('Overall Health:   [✗ CRITICAL] — Immediate remediation required');
  }
  lines.push(`Audit Timestamp:  ${audit.timestamp}\n`);

  // Runtime
  lines.push('--- 1. Environment & Runtime ---');
  lines.push(`  Node.js:        ${audit.runtime.node.version} (${audit.runtime.node.supported ? '✓ Supported' : '✗ Unsupported, >= 18 required'}) [${audit.runtime.node.platform} ${audit.runtime.node.arch}]`);
  lines.push(`  npm:            ${audit.runtime.npm.version ? `v${audit.runtime.npm.version} (✓ Available)` : '✗ Missing'}`);
  lines.push(`  Git:            ${audit.runtime.git.version ? `${audit.runtime.git.version} (✓ Available)` : '! Not found'}`);
  lines.push('');

  // Dependencies
  lines.push('--- 2. Core & Optional Dependencies ---');
  lines.push(`  pngjs:          ${audit.dependencies.pngjs ? '✓ Installed (Core Image I/O)' : '✗ Missing (Required)'}`);
  lines.push(`  pixelmatch:     ${audit.dependencies.pixelmatch ? '✓ Installed (Visual Regression Engine)' : '✗ Missing (Required)'}`);
  lines.push(`  playwright:     ${audit.dependencies.playwright ? '✓ Installed (Headless Browser QA)' : '! Not installed (Optional, browser screenshots)'}`);
  lines.push('');

  // Canonical Skills
  lines.push('--- 3. Canonical Skills Integrity (skills/) ---');
  lines.push(`  Directory:      ${audit.canonicalSkills.directory}`);
  lines.push(`  Status:         ${audit.canonicalSkills.validCount} of ${audit.canonicalSkills.totalExpected} skills valid`);
  for (const [name, info] of Object.entries(audit.canonicalSkills.skills)) {
    const mark = info.valid ? '✓' : '✗';
    const scripts = info.scripts?.length ? `[${info.scripts.length} script(s)]` : '';
    lines.push(`    [${mark}] ${name.padEnd(32)} ${scripts}`);
    if (!info.valid && info.errors?.length) {
      for (const err of info.errors) {
        lines.push(`        ✗ ${err}`);
      }
    }
  }
  lines.push('');

  // Antigravity Plugin
  lines.push('--- 4. Native Plugin Packaging (plugin.json) ---');
  if (audit.plugin.exists) {
    lines.push(`  Status:         ${audit.plugin.valid ? '✓ Valid Antigravity plugin manifest' : '✗ Invalid manifest'}`);
    if (audit.plugin.errors?.length) {
      for (const err of audit.plugin.errors) lines.push(`    ✗ ${err}`);
    }
    if (audit.plugin.warnings?.length) {
      for (const warn of audit.plugin.warnings) lines.push(`    ! ${warn}`);
    }
  } else {
    lines.push('  Status:         ! Root plugin.json not found');
  }
  lines.push('');

  // Agent Installations
  lines.push('--- 5. Detected Agent Installations ---');
  if (audit.agentInstallations.length === 0) {
    lines.push('  No workspace or global agent installations currently detected.');
    lines.push('  (Skills can be installed via: npx skills add . -a claude-code -a cursor -a antigravity)');
  } else {
    for (const inst of audit.agentInstallations) {
      lines.push(`  Agent:          ${inst.agent} (${inst.scope} ${inst.type})`);
      lines.push(`  Path:           ${inst.path}`);
      lines.push(`  Skills Found:   ${inst.installedSkillsCount} (${inst.matchCount} matched canonical, ${inst.driftCount} drifted)`);
      lines.push('');
    }
  }

  // Recommendations & Issues
  if (audit.issues.critical.length > 0) {
    lines.push('--- Critical Issues ---');
    for (const crit of audit.issues.critical) {
      lines.push(`  ✗ ${crit}`);
    }
    lines.push('');
  }

  if (audit.issues.warnings.length > 0) {
    lines.push('--- Warnings ---');
    for (const warn of audit.issues.warnings) {
      lines.push(`  ! ${warn}`);
    }
    lines.push('');
  }

  if (audit.recommendations.length > 0) {
    lines.push('--- Actionable Recommendations ---');
    for (const rec of audit.recommendations) {
      lines.push(`  → ${rec}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}
