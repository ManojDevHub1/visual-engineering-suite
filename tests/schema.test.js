import { test, describe } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import fs from 'node:fs';
import {
  validateSkillMetadata,
  validateCompatibilityRecord,
  validateBenchmarkResult,
  validateUniqueIdentifiers,
  ALLOWED_SKILL_CATEGORIES,
  ALLOWED_IMPLEMENTATION_STATUSES,
  ALLOWED_COMPATIBILITY_STATUSES
} from '../src/schema-validator.js';
import { CANONICAL_SKILL_NAMES } from '../src/doctor.js';
import { SKILL_ARCHITECTURAL_METADATA } from '../src/data/skills.js';
import { AGENT_COMPATIBILITY_RECORDS } from '../src/data/compatibility.js';

describe('Schema Validation Engine (src/schema-validator.js)', () => {
  const rootDir = process.cwd();

  test('validates all canonical skills successfully against architectural schema', () => {
    for (const skillName of CANONICAL_SKILL_NAMES) {
      const meta = SKILL_ARCHITECTURAL_METADATA[skillName];
      assert.ok(meta, `Metadata must exist for canonical skill: ${skillName}`);

      const record = {
        ...meta,
        name: skillName,
        description: 'Test description for skill validation',
        summary: 'Test summary paragraph',
        sourcePath: `skills/${skillName}/SKILL.md`,
        scripts: [],
        references: [],
        validationStatus: { valid: true }
      };

      const res = validateSkillMetadata(record, rootDir);
      assert.strictEqual(res.valid, true, `Skill ${skillName} must pass schema validation: ${res.errors.join('; ')}`);
    }
  });

  test('flags missing required fields in skill metadata', () => {
    const invalidSkill = {
      id: '',
      name: 'broken-skill',
      description: '',
      category: 'reconstruction',
      sourcePath: 'skills/visual-reconstruction/SKILL.md',
      implementationStatus: 'verified'
    };

    const res = validateSkillMetadata(invalidSkill, rootDir);
    assert.strictEqual(res.valid, false);
    assert.ok(res.errors.some(e => e.includes('id')));
    assert.ok(res.errors.some(e => e.includes('description')));
  });

  test('flags invalid skill category and invalid status', () => {
    const invalidCategory = {
      id: 'bad-cat-skill',
      name: 'Bad Cat',
      description: 'Test skill',
      category: 'not-a-real-category',
      sourcePath: 'skills/visual-reconstruction/SKILL.md',
      implementationStatus: 'almost-ready',
      requiredInputs: [],
      expectedOutputs: [],
      dependencies: [],
      supportedIntegrations: [],
      scripts: [],
      references: []
    };

    const res = validateSkillMetadata(invalidCategory, rootDir);
    assert.strictEqual(res.valid, false);
    assert.ok(res.errors.some(e => e.includes('Invalid skill category')));
    assert.ok(res.errors.some(e => e.includes('Invalid implementationStatus')));
  });

  test('flags missing file in sourcePath', () => {
    const missingFile = {
      id: 'missing-file-skill',
      name: 'Missing File',
      description: 'Test skill with non-existent source',
      category: 'reconstruction',
      sourcePath: 'skills/non-existent-directory/SKILL.md',
      implementationStatus: 'verified',
      requiredInputs: [],
      expectedOutputs: [],
      dependencies: [],
      supportedIntegrations: [],
      scripts: [],
      references: []
    };

    const res = validateSkillMetadata(missingFile, rootDir);
    assert.strictEqual(res.valid, false);
    assert.ok(res.errors.some(e => e.includes('sourcePath does not exist on disk')));
  });

  test('validates all authoritative agent compatibility records', () => {
    for (const record of AGENT_COMPATIBILITY_RECORDS) {
      const res = validateCompatibilityRecord(record);
      assert.strictEqual(res.valid, true, `Agent ${record.agentId} must pass compatibility validation: ${res.errors.join('; ')}`);
    }
  });

  test('flags invalid fields in compatibility records', () => {
    const invalidRecord = {
      agentId: 'test-agent',
      agentName: 'Test Agent',
      testedVersion: '1.0.0',
      testedAt: 'not-a-valid-date',
      scope: 'Workspace',
      installPath: '.agents/skills/',
      mechanism: 'Copy',
      executionMethod: 'Terminal',
      highestTier: 'Tier 1',
      overallStatus: 'Definitely Works', // Not an allowed status
      evidence: 'None',
      limitations: 'None',
      formatValidated: 'yes', // should be boolean
      discoveryVerified: true,
      installationVerified: true,
      invocationVerified: true,
      workflowVerified: false
    };

    const res = validateCompatibilityRecord(invalidRecord);
    assert.strictEqual(res.valid, false);
    assert.ok(res.errors.some(e => e.includes('Invalid overallStatus')));
    assert.ok(res.errors.some(e => e.includes('formatValidated" must be a boolean')));
    assert.ok(res.errors.some(e => e.includes('Invalid date format')));
  });

  test('validates benchmark result schema successfully', () => {
    const validResult = {
      runId: 'benchmark-run-12345',
      timestamp: new Date().toISOString(),
      summary: {
        totalCases: 3,
        passedCases: 3,
        passRate: 100
      },
      cases: [
        { id: 'CASE-01', name: 'Hero Case', passed: true },
        { id: 'CASE-02', name: 'Dashboard Case', passed: true }
      ]
    };

    const res = validateBenchmarkResult(validResult);
    assert.strictEqual(res.valid, true, `Benchmark result must validate: ${res.errors.join('; ')}`);
  });

  test('flags invalid pass rates and non-array cases in benchmark results', () => {
    const invalidBenchmark = {
      runId: 'bench-bad',
      timestamp: 'bad-date',
      summary: {
        totalCases: 2,
        passedCases: 5,
        passRate: 150 // Out of bounds
      },
      cases: 'not-an-array'
    };

    const res = validateBenchmarkResult(invalidBenchmark);
    assert.strictEqual(res.valid, false);
    assert.ok(res.errors.some(e => e.includes('Invalid timestamp')));
    assert.ok(res.errors.some(e => e.includes('between 0 and 100')));
    assert.ok(res.errors.some(e => e.includes('must contain a "cases" array')));
  });

  test('detects duplicate identifiers accurately', () => {
    const items = [
      { id: 'skill-a', name: 'A' },
      { id: 'skill-b', name: 'B' },
      { id: 'skill-a', name: 'Duplicate A' }
    ];

    const res = validateUniqueIdentifiers(items, 'id');
    assert.strictEqual(res.valid, false);
    assert.strictEqual(res.duplicates.length, 1);
    assert.strictEqual(res.duplicates[0], 'skill-a');
  });
});
