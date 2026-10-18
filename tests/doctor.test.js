import { test, describe } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { runDoctorAudit, computeFileChecksum, formatDoctorTerminal, CANONICAL_SKILL_NAMES } from '../src/doctor.js';

describe('Doctor & Installation Health Auditor', () => {
  test('computeFileChecksum generates consistent SHA-256 for existing file', () => {
    const pkgPath = path.resolve('package.json');
    const hash1 = computeFileChecksum(pkgPath);
    const hash2 = computeFileChecksum(pkgPath);

    assert.ok(hash1);
    assert.strictEqual(hash1.length, 64);
    assert.strictEqual(hash1, hash2);
  });

  test('computeFileChecksum returns null for non-existent file', () => {
    const hash = computeFileChecksum(path.resolve('does-not-exist.json'));
    assert.strictEqual(hash, null);
  });

  test('runDoctorAudit validates canonical skills and dependencies on root workspace', async () => {
    const audit = await runDoctorAudit(process.cwd());

    assert.ok(audit.timestamp);
    assert.ok(['healthy', 'warning'].includes(audit.status));
    assert.ok(audit.exitCode === 0 || audit.exitCode === 1);

    // Runtime checks
    assert.strictEqual(audit.runtime.node.supported, true);
    assert.strictEqual(audit.dependencies.pngjs, true);
    assert.strictEqual(audit.dependencies.pixelmatch, true);

    // Canonical skills checks
    assert.strictEqual(audit.canonicalSkills.exists, true);
    assert.strictEqual(audit.canonicalSkills.totalExpected, 7);
    assert.strictEqual(audit.canonicalSkills.validCount, 7);

    for (const skillName of CANONICAL_SKILL_NAMES) {
      const s = audit.canonicalSkills.skills[skillName];
      assert.ok(s, `Skill ${skillName} must be present`);
      assert.strictEqual(s.valid, true);
      assert.ok(s.checksum);
      assert.ok(s.scripts.length > 0);
    }

    // Plugin manifest
    assert.strictEqual(audit.plugin.exists, true);
    assert.strictEqual(audit.plugin.valid, true);
  });

  test('formatDoctorTerminal formats audit into readable string', async () => {
    const audit = await runDoctorAudit(process.cwd());
    const terminalOutput = formatDoctorTerminal(audit);

    assert.ok(terminalOutput.includes('Visual Engineering Suite — System & Installation Doctor'));
    assert.ok(terminalOutput.includes('Environment & Runtime'));
    assert.ok(terminalOutput.includes('Core & Optional Dependencies'));
    assert.ok(terminalOutput.includes('Canonical Skills Integrity'));
    assert.ok(terminalOutput.includes('Native Plugin Packaging'));
  });

  test('runDoctorAudit flags critical error when canonical skills are missing', async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ves-empty-'));
    try {
      const audit = await runDoctorAudit(tempDir);
      assert.strictEqual(audit.status, 'critical');
      assert.strictEqual(audit.exitCode, 2);
      assert.ok(audit.issues.critical.some(c => c.includes('Canonical skills directory not found')));
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  test('runDoctorAudit detects installed skills and reports match or drift', async () => {
    const tempWorkspace = fs.mkdtempSync(path.join(os.tmpdir(), 'ves-agent-ws-'));
    try {
      // Create a mock .agents/skills/ directory with canonical copy of visual-reconstruction
      const agentSkillsDir = path.join(tempWorkspace, '.agents', 'skills');
      const mockSkillDir = path.join(agentSkillsDir, 'visual-reconstruction');
      fs.mkdirSync(mockSkillDir, { recursive: true });

      // Copy real SKILL.md
      const realSkillMd = path.join(process.cwd(), 'skills', 'visual-reconstruction', 'SKILL.md');
      fs.copyFileSync(realSkillMd, path.join(mockSkillDir, 'SKILL.md'));

      // Also copy canonical skills into tempWorkspace so canonical audit passes
      const canonicalSkillsTarget = path.join(tempWorkspace, 'skills');
      fs.cpSync(path.join(process.cwd(), 'skills'), canonicalSkillsTarget, { recursive: true });
      fs.copyFileSync(path.join(process.cwd(), 'plugin.json'), path.join(tempWorkspace, 'plugin.json'));

      const audit = await runDoctorAudit(tempWorkspace);
      const agentInst = audit.agentInstallations.find(i => i.agent === 'antigravity' && i.scope === 'workspace');

      assert.ok(agentInst, 'Should detect antigravity workspace skills');
      assert.strictEqual(agentInst.matchCount, 1);
      assert.strictEqual(agentInst.driftCount, 0);

      // Now introduce drift into the installed copy
      fs.appendFileSync(path.join(mockSkillDir, 'SKILL.md'), '\n<!-- drifted comment -->');
      const driftedAudit = await runDoctorAudit(tempWorkspace);
      const driftedInst = driftedAudit.agentInstallations.find(i => i.agent === 'antigravity' && i.scope === 'workspace');

      assert.strictEqual(driftedInst.driftCount, 1);
      assert.ok(driftedAudit.issues.warnings.some(w => w.includes('drifted skill')));
    } finally {
      fs.rmSync(tempWorkspace, { recursive: true, force: true });
    }
  });
});
