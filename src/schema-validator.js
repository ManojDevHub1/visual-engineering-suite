import fs from 'node:fs';
import path from 'node:path';

/**
 * Deterministic Schema Validation Engine for Visual Engineering Suite.
 * Validates Skill Metadata, Agent Compatibility Records, and Benchmark Results.
 */

export const ALLOWED_SKILL_CATEGORIES = [
  'reconstruction',
  'design-tokens',
  'implementation',
  'qa',
  'regression',
  'refinement',
  'audit'
];

export const ALLOWED_IMPLEMENTATION_STATUSES = [
  'production-ready',
  'verified',
  'in-development'
];

export const ALLOWED_COMPATIBILITY_STATUSES = [
  'Verified',
  'Partially Verified',
  'Not Yet Verified',
  'Failed'
];

/**
 * Validates a single Skill Metadata record.
 * 
 * @param {object} skill 
 * @param {string} [rootDir=process.cwd()]
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateSkillMetadata(skill, rootDir = process.cwd()) {
  const errors = [];

  if (!skill || typeof skill !== 'object') {
    return { valid: false, errors: ['Skill metadata must be a non-null object'] };
  }

  // Required string fields
  const requiredStrings = ['id', 'name', 'description', 'category', 'sourcePath', 'implementationStatus'];
  for (const field of requiredStrings) {
    if (!skill[field] || typeof skill[field] !== 'string' || skill[field].trim().length === 0) {
      errors.push(`Missing or invalid required string field: "${field}"`);
    }
  }

  // Category validation
  if (skill.category && !ALLOWED_SKILL_CATEGORIES.includes(skill.category)) {
    errors.push(`Invalid skill category: "${skill.category}". Allowed: ${ALLOWED_SKILL_CATEGORIES.join(', ')}`);
  }

  // Implementation status validation
  if (skill.implementationStatus && !ALLOWED_IMPLEMENTATION_STATUSES.includes(skill.implementationStatus)) {
    errors.push(`Invalid implementationStatus: "${skill.implementationStatus}". Allowed: ${ALLOWED_IMPLEMENTATION_STATUSES.join(', ')}`);
  }

  // Required array fields
  const requiredArrays = ['requiredInputs', 'expectedOutputs', 'dependencies', 'supportedIntegrations', 'scripts', 'references'];
  for (const field of requiredArrays) {
    if (!Array.isArray(skill[field])) {
      errors.push(`Field "${field}" must be an array`);
    }
  }

  // File existence check for sourcePath
  if (skill.sourcePath) {
    const absPath = path.isAbsolute(skill.sourcePath) ? skill.sourcePath : path.join(rootDir, skill.sourcePath);
    if (!fs.existsSync(absPath)) {
      errors.push(`sourcePath does not exist on disk: "${skill.sourcePath}" (resolved: ${absPath})`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates a single Agent Compatibility Record.
 * 
 * @param {object} record 
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateCompatibilityRecord(record) {
  const errors = [];

  if (!record || typeof record !== 'object') {
    return { valid: false, errors: ['Compatibility record must be a non-null object'] };
  }

  const requiredStrings = [
    'agentId',
    'agentName',
    'testedVersion',
    'testedAt',
    'scope',
    'installPath',
    'mechanism',
    'executionMethod',
    'highestTier',
    'overallStatus',
    'evidence',
    'limitations'
  ];

  for (const field of requiredStrings) {
    if (!record[field] || typeof record[field] !== 'string' || record[field].trim().length === 0) {
      errors.push(`Missing or invalid required string field: "${field}"`);
    }
  }

  // Status enum
  if (record.overallStatus && !ALLOWED_COMPATIBILITY_STATUSES.includes(record.overallStatus)) {
    errors.push(`Invalid overallStatus: "${record.overallStatus}". Allowed: ${ALLOWED_COMPATIBILITY_STATUSES.join(', ')}`);
  }

  // Required booleans
  const requiredBooleans = [
    'formatValidated',
    'discoveryVerified',
    'installationVerified',
    'invocationVerified',
    'workflowVerified'
  ];

  for (const field of requiredBooleans) {
    if (typeof record[field] !== 'boolean') {
      errors.push(`Field "${field}" must be a boolean (got ${typeof record[field]})`);
    }
  }

  // Timestamp format check (ISO 8601 YYYY-MM-DD or full ISO)
  if (record.testedAt) {
    const isIsoDate = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/.test(record.testedAt);
    if (!isIsoDate || isNaN(Date.parse(record.testedAt))) {
      errors.push(`Invalid date format for testedAt: "${record.testedAt}" (expected ISO 8601)`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates a Benchmark Evaluation Suite Result object.
 * 
 * @param {object} result 
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateBenchmarkResult(result) {
  const errors = [];

  if (!result || typeof result !== 'object') {
    return { valid: false, errors: ['Benchmark result must be a non-null object'] };
  }

  if (!result.runId || typeof result.runId !== 'string') {
    errors.push('Missing required string field: "runId"');
  }

  if (!result.timestamp || isNaN(Date.parse(result.timestamp))) {
    errors.push(`Invalid timestamp in benchmark result: "${result.timestamp}"`);
  }

  if (!result.summary || typeof result.summary !== 'object') {
    errors.push('Missing required object field: "summary"');
  } else {
    if (typeof result.summary.totalCases !== 'number' || result.summary.totalCases < 0) {
      errors.push('summary.totalCases must be a non-negative number');
    }
    if (typeof result.summary.passedCases !== 'number' || result.summary.passedCases < 0) {
      errors.push('summary.passedCases must be a non-negative number');
    }
    if (typeof result.summary.passRate !== 'number' || result.summary.passRate < 0 || result.summary.passRate > 100) {
      errors.push('summary.passRate must be a number between 0 and 100');
    }
  }

  if (!Array.isArray(result.cases)) {
    errors.push('Benchmark result must contain a "cases" array');
  } else {
    for (let i = 0; i < result.cases.length; i++) {
      const c = result.cases[i];
      if (!c.id || typeof c.id !== 'string') {
        errors.push(`Case [${i}] is missing required string "id"`);
      }
      if (!c.name || typeof c.name !== 'string') {
        errors.push(`Case [${i}] is missing required string "name"`);
      }
      if (typeof c.passed !== 'boolean') {
        errors.push(`Case [${i}] field "passed" must be a boolean`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates that an array of records contains strictly unique identifiers.
 * 
 * @param {Array<object>} items 
 * @param {string} idKey 
 * @returns {{ valid: boolean, duplicates: string[] }}
 */
export function validateUniqueIdentifiers(items, idKey = 'id') {
  if (!Array.isArray(items)) {
    return { valid: false, duplicates: ['Items must be an array'] };
  }

  const seen = new Set();
  const duplicates = [];

  for (const item of items) {
    const val = item[idKey];
    if (val !== undefined && val !== null) {
      if (seen.has(val)) {
        duplicates.push(String(val));
      } else {
        seen.add(val);
      }
    }
  }

  return { valid: duplicates.length === 0, duplicates };
}
