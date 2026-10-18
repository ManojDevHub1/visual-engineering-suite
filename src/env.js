import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import { execSync } from 'node:child_process';

/**
 * Checks command availability in PATH.
 * @param {string} cmd 
 * @returns {{ available: boolean, version?: string }}
 */
function checkCommand(cmd, versionFlag = '--version') {
  try {
    const stdout = execSync(`${cmd} ${versionFlag}`, {
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 3000,
      encoding: 'utf8'
    });
    return { available: true, version: stdout.trim().split('\n')[0] };
  } catch {
    return { available: false };
  }
}

/**
 * Checks if an npm package is resolvable.
 * @param {string} pkgName 
 * @returns {Promise<{ available: boolean, version?: string }>}
 */
async function checkPackage(pkgName) {
  try {
    const pkg = await import(pkgName);
    return { available: true };
  } catch {
    return { available: false };
  }
}

/**
 * Audits current environment for Visual Engineering Suite prerequisites and optional features.
 * 
 * @param {string} [workspaceDir=process.cwd()]
 * @returns {Promise<object>}
 */
export async function auditEnvironment(workspaceDir = process.cwd()) {
  const home = os.homedir();

  // Core runtimes
  const nodeInfo = {
    version: process.version,
    platform: process.platform,
    arch: process.arch,
    supported: parseInt(process.versions.node.split('.')[0], 10) >= 18
  };

  const npmInfo = checkCommand('npm', '-v');
  const gitInfo = checkCommand('git', '--version');

  // Core and optional libraries
  const [pngjsInfo, pixelmatchInfo, playwrightInfo] = await Promise.all([
    checkPackage('pngjs'),
    checkPackage('pixelmatch'),
    checkPackage('playwright')
  ]);

  // Agent environments detection
  const antigravityDetected = fs.existsSync(path.join(home, '.gemini', 'antigravity')) ||
                              fs.existsSync(path.join(workspaceDir, '.agents')) ||
                              process.env.ANTIGRAVITY_LS_ADDRESS !== undefined;

  const claudeCodeDetected = fs.existsSync(path.join(home, '.claude')) ||
                             fs.existsSync(path.join(workspaceDir, '.claude'));

  const cursorDetected = fs.existsSync(path.join(home, '.cursor')) ||
                         fs.existsSync(path.join(workspaceDir, '.cursor'));

  return {
    timestamp: new Date().toISOString(),
    runtime: {
      node: nodeInfo,
      npm: npmInfo,
      git: gitInfo
    },
    libraries: {
      pngjs: pngjsInfo,
      pixelmatch: pixelmatchInfo,
      playwright: playwrightInfo
    },
    capabilities: {
      dimensionValidation: true,
      visualDiff: pngjsInfo.available && pixelmatchInfo.available,
      automatedBrowserScreenshots: playwrightInfo.available,
      manifestValidation: true
    },
    agents: {
      antigravity: {
        detected: antigravityDetected,
        projectSkillsDir: path.join(workspaceDir, '.agents', 'skills'),
        globalSkillsDir: path.join(home, '.gemini', 'antigravity', 'skills')
      },
      claudeCode: {
        detected: claudeCodeDetected,
        projectSkillsDir: path.join(workspaceDir, '.claude', 'skills'),
        globalSkillsDir: path.join(home, '.claude', 'skills')
      },
      cursor: {
        detected: cursorDetected,
        projectSkillsDir: path.join(workspaceDir, '.agents', 'skills'),
        globalSkillsDir: path.join(home, '.cursor', 'skills')
      }
    }
  };
}
