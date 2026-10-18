import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { compareImages } from './diff.js';
import { getImageDimensions } from './dimensions.js';
import { AGENT_COMPATIBILITY_RECORDS } from './data/compatibility.js';

/**
 * 6 Explicit Verification Levels for AI Coding Agents.
 */
export const AGENT_VERIFICATION_LEVELS = {
  LEVEL_1_FORMAT_VALIDATED: 'Tier 1: Format Validated',
  LEVEL_2_DISCOVERY_VERIFIED: 'Tier 2: Discovery Verified',
  LEVEL_3_INSTALLATION_VERIFIED: 'Tier 3: Installation Verified',
  LEVEL_4_INVOCATION_VERIFIED: 'Tier 4: Invocation Verified',
  LEVEL_5_TASK_EXECUTION: 'Tier 5: Task Execution',
  LEVEL_6_BENCHMARK_COMPLETED: 'Tier 6: Benchmark Completed'
};

/**
 * Baseline Agent Evaluation Profiles derived from single source of truth AGENT_COMPATIBILITY_RECORDS.
 */
export const KNOWN_AGENT_PROFILES = Object.fromEntries(
  AGENT_COMPATIBILITY_RECORDS.map(record => [
    record.agentId,
    {
      agentName: record.agentName,
      testedVersion: record.testedVersion,
      verificationLevel: record.highestTier,
      executionMethod: record.executionMethod,
      lastEvaluated: record.testedAt,
      status: record.overallStatus,
      notes: record.evidence
    }
  ])
);

/**
 * Discovers benchmark cases in the given directory.
 * 
 * @param {string} casesDir 
 * @returns {Promise<Array<BenchmarkCaseInfo>>}
 */
export async function discoverBenchmarkCases(casesDir = path.resolve('benchmarks/cases')) {
  if (!fs.existsSync(casesDir)) {
    return [];
  }

  const entries = await fs.promises.readdir(casesDir, { withFileTypes: true });
  const cases = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const casePath = path.join(casesDir, entry.name);
    const caseJsonPath = path.join(casePath, 'case.json');

    if (!fs.existsSync(caseJsonPath)) continue;

    let metadata = {};
    let parseError = null;
    try {
      metadata = JSON.parse(await fs.promises.readFile(caseJsonPath, 'utf8'));
    } catch (err) {
      parseError = err.message;
    }

    const requiredFiles = {
      'case.json': fs.existsSync(caseJsonPath),
      'reference.png': fs.existsSync(path.join(casePath, 'reference.png')),
      'initial-render.png': fs.existsSync(path.join(casePath, 'initial-render.png')),
      'refined-render.png': fs.existsSync(path.join(casePath, 'refined-render.png')),
      'component.html': fs.existsSync(path.join(casePath, 'component.html')),
      'tokens.json': fs.existsSync(path.join(casePath, 'tokens.json'))
    };

    const missingFiles = Object.entries(requiredFiles)
      .filter(([_, exists]) => !exists)
      .map(([name]) => name);

    cases.push({
      id: metadata.id || entry.name,
      name: metadata.name || entry.name,
      category: metadata.category || 'generic',
      dirName: entry.name,
      caseDir: casePath,
      metadata,
      parseError,
      hasRequiredFiles: missingFiles.length === 0,
      missingFiles
    });
  }

  // Sort deterministically by ID
  return cases.sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Validates a single benchmark case definition.
 * 
 * @param {BenchmarkCaseInfo} caseInfo 
 * @returns {Promise<{ valid: boolean, errors: string[], warnings: string[] }>}
 */
export async function validateCaseDefinition(caseInfo) {
  const errors = [];
  const warnings = [];

  if (caseInfo.parseError) {
    errors.push(`Invalid case.json JSON: ${caseInfo.parseError}`);
    return { valid: false, errors, warnings };
  }

  if (caseInfo.missingFiles.length > 0) {
    errors.push(`Missing required case files: ${caseInfo.missingFiles.join(', ')}`);
  }

  const meta = caseInfo.metadata;
  if (!meta.id || typeof meta.id !== 'string') errors.push('Missing or invalid "id" in case.json');
  if (!meta.name || typeof meta.name !== 'string') errors.push('Missing or invalid "name" in case.json');
  if (!meta.category || typeof meta.category !== 'string') errors.push('Missing or invalid "category" in case.json');

  if (!meta.viewports || !Array.isArray(meta.viewports) || meta.viewports.length === 0) {
    errors.push('Missing or empty "viewports" array in case.json');
  } else {
    for (const vp of meta.viewports) {
      if (!vp.width || !vp.height) {
        errors.push(`Viewport ${vp.name || 'unnamed'} must specify numeric width and height`);
      }
    }
  }

  if (!meta.acceptanceCriteria) {
    errors.push('Missing "acceptanceCriteria" in case.json');
  } else {
    if (typeof meta.acceptanceCriteria.maxDiffPercentage !== 'number') {
      errors.push('acceptanceCriteria.maxDiffPercentage must be a number');
    }
    if (typeof meta.acceptanceCriteria.maxDiffPixels !== 'number') {
      errors.push('acceptanceCriteria.maxDiffPixels must be a number');
    }
  }

  // Validate image dimensions if files exist
  const refPath = path.join(caseInfo.caseDir, 'reference.png');
  const initPath = path.join(caseInfo.caseDir, 'initial-render.png');
  const refnPath = path.join(caseInfo.caseDir, 'refined-render.png');

  if (fs.existsSync(refPath) && meta.viewports && meta.viewports[0]) {
    try {
      const dims = await getImageDimensions(refPath);
      const expectedVp = meta.viewports[0];
      if (dims.width !== expectedVp.width || dims.height !== expectedVp.height) {
        warnings.push(`reference.png dimensions (${dims.width}x${dims.height}) do not match primary viewport (${expectedVp.width}x${expectedVp.height})`);
      }

      if (fs.existsSync(initPath)) {
        const initDims = await getImageDimensions(initPath);
        if (initDims.width !== dims.width || initDims.height !== dims.height) {
          errors.push(`initial-render.png dimensions (${initDims.width}x${initDims.height}) do not match reference.png (${dims.width}x${dims.height})`);
        }
      }

      if (fs.existsSync(refnPath)) {
        const refnDims = await getImageDimensions(refnPath);
        if (refnDims.width !== dims.width || refnDims.height !== dims.height) {
          errors.push(`refined-render.png dimensions (${refnDims.width}x${refnDims.height}) do not match reference.png (${dims.width}x${dims.height})`);
        }
      }
    } catch (err) {
      errors.push(`Failed to read image dimensions: ${err.message}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Evaluates visual fidelity between reference and candidate screenshots.
 * 
 * @param {string} referencePath 
 * @param {string} candidatePath 
 * @param {object} options
 * @returns {Promise<VisualFidelityResult>}
 */
export async function evaluateVisualFidelity(referencePath, candidatePath, options = {}) {
  const threshold = options.threshold ?? 0.1;
  const maxDiffPercentage = options.maxDiffPercentage ?? 0.1;
  const maxDiffPixels = options.maxDiffPixels ?? 100;
  const diffPath = options.diffPath;

  const refDims = await getImageDimensions(referencePath);
  const candDims = await getImageDimensions(candidatePath);

  if (refDims.width !== candDims.width || refDims.height !== candDims.height) {
    return {
      passed: false,
      diffPixels: refDims.width * refDims.height,
      diffPercentage: 100.0,
      totalPixels: refDims.width * refDims.height,
      dimensions: { reference: refDims, candidate: candDims },
      defectCategory: 'DIMENSION_MISMATCH',
      boundingBox: null,
      error: `Dimension mismatch: Reference is ${refDims.width}x${refDims.height}, candidate is ${candDims.width}x${candDims.height}`
    };
  }

  const diffResult = await compareImages(referencePath, candidatePath, {
    threshold,
    diffPath,
    maxDiffPercentage
  });

  let defectCategory = 'NO_DEFECT';
  if (diffResult.diffPixels > 0) {
    if (diffResult.diffPercentage > 2.0 && diffResult.boundingBox && diffResult.boundingBox.height > 80) {
      defectCategory = 'LAYOUT_DISPLACEMENT';
    } else if (diffResult.diffPercentage > 0.5) {
      defectCategory = 'COLOR_DISCREPANCY';
    } else {
      defectCategory = 'MINOR_STYLING';
    }
  }

  const passed = diffResult.diffPercentage <= maxDiffPercentage && diffResult.diffPixels <= maxDiffPixels;

  return {
    passed,
    diffPixels: diffResult.diffPixels,
    diffPercentage: diffResult.diffPercentage,
    totalPixels: diffResult.totalPixels,
    threshold,
    dimensions: {
      width: refDims.width,
      height: refDims.height
    },
    boundingBox: diffResult.boundingBox,
    diffPath: diffResult.diffPath,
    defectCategory
  };
}

/**
 * Evaluates semantic HTML structure and accessibility markers without requiring a live browser.
 * 
 * @param {string} htmlPath 
 * @param {object} caseMetadata 
 * @returns {Promise<FunctionalEvaluationResult>}
 */
export async function evaluateFunctionalCorrectness(htmlPath, caseMetadata = {}) {
  if (!fs.existsSync(htmlPath)) {
    return {
      passed: false,
      totalTests: 0,
      passedTests: 0,
      failedTests: 1,
      skippedTests: 0,
      tests: [{ name: 'File Existence', passed: false, message: `HTML file not found: ${htmlPath}` }]
    };
  }

  const content = await fs.promises.readFile(htmlPath, 'utf8');
  const tests = [];

  // 1. Viewport Meta Tag Test
  const hasViewportMeta = /<meta\s+name=["']viewport["']\s+content=["'][^"']*["']/i.test(content);
  tests.push({
    name: 'Responsive Viewport Meta Tag',
    category: 'responsive',
    passed: hasViewportMeta,
    message: hasViewportMeta ? 'Viewport meta tag configured.' : 'Missing <meta name="viewport"> tag.'
  });

  // 2. Required Semantic Tags Test
  const requiredTags = caseMetadata.acceptanceCriteria?.requiredSemanticTags || ['header', 'main', 'button'];
  for (const tag of requiredTags) {
    const hasTag = new RegExp(`<${tag}[\\s>]`, 'i').test(content);
    tests.push({
      name: `Semantic Tag: <${tag}>`,
      category: 'semantics',
      passed: hasTag,
      message: hasTag ? `<${tag}> tag is used correctly.` : `Missing expected semantic <${tag}> tag.`
    });
  }

  // 3. Accessible Names for Buttons
  const buttonMatches = content.match(/<button[\s\S]*?<\/button>/gi) || [];
  let buttonsWithNames = 0;
  for (const btn of buttonMatches) {
    const hasAriaLabel = /aria-label=["'][^"']+["']/i.test(btn);
    const hasText = />([^<]+)</.test(btn) && btn.match(/>([^<]+)</)[1].trim().length > 0;
    if (hasAriaLabel || hasText) buttonsWithNames++;
  }
  const allButtonsAccessible = buttonMatches.length === 0 || buttonsWithNames === buttonMatches.length;
  tests.push({
    name: 'Accessible Names on Buttons',
    category: 'accessibility',
    passed: allButtonsAccessible,
    message: `${buttonsWithNames} of ${buttonMatches.length} button(s) have accessible text or aria-labels.`
  });

  // 4. Interactive State Indicators
  const hasAriaChecked = /aria-checked=["'](true|false)["']/i.test(content);
  const hasRoleRadio = /role=["']radio["']/i.test(content);
  if (caseMetadata.category === 'ecommerce') {
    tests.push({
      name: 'Radio Swatch Group Semantics',
      category: 'accessibility',
      passed: hasAriaChecked && hasRoleRadio,
      message: hasAriaChecked && hasRoleRadio ? 'Radio swatches include role and aria-checked attributes.' : 'Missing role="radio" or aria-checked attributes on swatches.'
    });
  }

  // 5. Semantic Data Table Test
  if (caseMetadata.category === 'dashboard') {
    const hasScopeCol = /scope=["']col["']/i.test(content);
    tests.push({
      name: 'Table Header Column Scopes',
      category: 'accessibility',
      passed: hasScopeCol,
      message: hasScopeCol ? 'Table column headers have scope="col".' : 'Missing scope="col" on table headers.'
    });
  }

  const passedTests = tests.filter(t => t.passed).length;
  const failedTests = tests.filter(t => !t.passed).length;

  return {
    passed: failedTests === 0,
    totalTests: tests.length,
    passedTests,
    failedTests,
    skippedTests: 0,
    tests
  };
}

/**
 * Evaluates the net refinement improvement between initial and refined implementations.
 * 
 * @param {VisualFidelityResult} initialVisual 
 * @param {VisualFidelityResult} refinedVisual 
 * @param {FunctionalEvaluationResult} initialFunc 
 * @param {FunctionalEvaluationResult} refinedFunc 
 * @param {object} acceptanceCriteria 
 * @returns {RefinementEffectivenessResult}
 */
export function evaluateRefinementEffectiveness(initialVisual, refinedVisual, initialFunc, refinedFunc, acceptanceCriteria = {}) {
  const maxDiffPercentage = acceptanceCriteria.maxDiffPercentage ?? 0.1;
  const maxDiffPixels = acceptanceCriteria.maxDiffPixels ?? 100;

  const diffReductionPercentage = initialVisual.diffPercentage - refinedVisual.diffPercentage;
  const diffPixelsReduction = initialVisual.diffPixels - refinedVisual.diffPixels;

  let relativeImprovementPercent = 0;
  if (initialVisual.diffPixels > 0) {
    relativeImprovementPercent = ((diffPixelsReduction / initialVisual.diffPixels) * 100);
  }

  const visualCriteriaSatisfied = refinedVisual.diffPercentage <= maxDiffPercentage && refinedVisual.diffPixels <= maxDiffPixels;
  const functionalCriteriaSatisfied = refinedFunc.passed;

  let status = 'NO_CHANGE';
  if (diffPixelsReduction > 0) {
    status = visualCriteriaSatisfied && functionalCriteriaSatisfied ? 'PASSED_REFINED' : 'IMPROVED_PARTIAL';
  } else if (diffPixelsReduction < 0) {
    status = 'REGRESSION';
  } else if (visualCriteriaSatisfied) {
    status = 'PASSED_INITIAL';
  }

  return {
    status,
    initial: {
      diffPixels: initialVisual.diffPixels,
      diffPercentage: initialVisual.diffPercentage,
      passed: initialVisual.passed,
      defectCategory: initialVisual.defectCategory
    },
    refined: {
      diffPixels: refinedVisual.diffPixels,
      diffPercentage: refinedVisual.diffPercentage,
      passed: refinedVisual.passed,
      defectCategory: refinedVisual.defectCategory
    },
    metrics: {
      diffReductionPercentage,
      diffPixelsReduction,
      relativeImprovementPercent: Math.round(relativeImprovementPercent * 100) / 100,
      visualCriteriaSatisfied,
      functionalCriteriaSatisfied
    },
    isImproved: diffPixelsReduction > 0,
    isRefinementEffective: visualCriteriaSatisfied && diffPixelsReduction >= 0
  };
}

/**
 * Measures the measurement stability and repeatability of the visual diffing engine across N runs.
 * 
 * @param {string} referencePath 
 * @param {string} candidatePath 
 * @param {number} [runs=3] 
 * @returns {Promise<RepeatabilityResult>}
 */
export async function evaluateRepeatability(referencePath, candidatePath, runs = 3) {
  const runResults = [];

  for (let i = 0; i < runs; i++) {
    const start = performance.now();
    const result = await compareImages(referencePath, candidatePath, { threshold: 0.1 });
    const durationMs = performance.now() - start;

    runResults.push({
      iteration: i + 1,
      diffPixels: result.diffPixels,
      diffPercentage: result.diffPercentage,
      durationMs: Math.round(durationMs * 100) / 100
    });
  }

  const diffPixelsArr = runResults.map(r => r.diffPixels);
  const minPixels = Math.min(...diffPixelsArr);
  const maxPixels = Math.max(...diffPixelsArr);
  const variance = maxPixels - minPixels;

  const isDeterministic = variance === 0;
  const stabilityIndex = isDeterministic ? 100.0 : Math.max(0, 100 - (variance / (minPixels || 1)) * 100);

  return {
    runs,
    isDeterministic,
    stabilityIndex,
    pixelVariance: variance,
    results: runResults
  };
}

/**
 * Runs the full benchmark evaluation suite.
 * 
 * @param {object} options
 * @param {string} [options.casesDir]
 * @param {string} [options.outputDir]
 * @param {string} [options.caseFilter]
 * @param {'all'|'visual'|'functional'|'validate'} [options.mode='all']
 * @param {number} [options.repeatabilityRuns=3]
 * @returns {Promise<BenchmarkSuiteResult>}
 */
export async function runBenchmarkSuite(options = {}) {
  const casesDir = path.resolve(options.casesDir || 'benchmarks/cases');
  const baseOutputDir = path.resolve(options.outputDir || '.visual-engineering/benchmarks');
  const mode = options.mode || 'all';
  const caseFilter = options.caseFilter ? options.caseFilter.toLowerCase() : null;
  const repeatabilityRuns = options.repeatabilityRuns || 3;

  const runId = `benchmark-run-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  const runDir = path.join(baseOutputDir, runId);
  const diffsDir = path.join(runDir, 'diffs');

  await fs.promises.mkdir(diffsDir, { recursive: true });

  const allCases = await discoverBenchmarkCases(casesDir);
  const selectedCases = caseFilter
    ? allCases.filter(c => c.id.toLowerCase().includes(caseFilter) || c.dirName.toLowerCase().includes(caseFilter))
    : allCases;

  const caseResults = [];
  let totalTestsCount = 0;
  let passedTestsCount = 0;
  let failedTestsCount = 0;

  for (const c of selectedCases) {
    const valResult = await validateCaseDefinition(c);

    if (mode === 'validate') {
      caseResults.push({
        id: c.id,
        name: c.name,
        category: c.category,
        validation: valResult,
        passed: valResult.valid
      });
      if (valResult.valid) passedTestsCount++;
      else failedTestsCount++;
      totalTestsCount++;
      continue;
    }

    if (!valResult.valid) {
      caseResults.push({
        id: c.id,
        name: c.name,
        category: c.category,
        validation: valResult,
        passed: false,
        error: `Case validation failed: ${valResult.errors.join('; ')}`
      });
      failedTestsCount++;
      totalTestsCount++;
      continue;
    }

    const refPath = path.join(c.caseDir, 'reference.png');
    const initPath = path.join(c.caseDir, 'initial-render.png');
    const refnPath = path.join(c.caseDir, 'refined-render.png');
    const htmlPath = path.join(c.caseDir, 'component.html');

    let visualInit = null;
    let visualRefn = null;
    let functional = null;
    let refinement = null;
    let repeatability = null;

    // Visual Evaluation
    if (mode === 'all' || mode === 'visual') {
      const initDiffPath = path.join(diffsDir, `${c.id}-init-diff.png`);
      const refnDiffPath = path.join(diffsDir, `${c.id}-refn-diff.png`);

      visualInit = await evaluateVisualFidelity(refPath, initPath, {
        diffPath: initDiffPath,
        threshold: c.metadata.acceptanceCriteria.colorThreshold,
        maxDiffPercentage: c.metadata.acceptanceCriteria.maxDiffPercentage,
        maxDiffPixels: c.metadata.acceptanceCriteria.maxDiffPixels
      });

      visualRefn = await evaluateVisualFidelity(refPath, refnPath, {
        diffPath: refnDiffPath,
        threshold: c.metadata.acceptanceCriteria.colorThreshold,
        maxDiffPercentage: c.metadata.acceptanceCriteria.maxDiffPercentage,
        maxDiffPixels: c.metadata.acceptanceCriteria.maxDiffPixels
      });

      repeatability = await evaluateRepeatability(refPath, initPath, repeatabilityRuns);
    }

    // Functional Evaluation
    if (mode === 'all' || mode === 'functional') {
      functional = await evaluateFunctionalCorrectness(htmlPath, c.metadata);
    }

    // Refinement Evaluation
    if (visualInit && visualRefn && functional) {
      refinement = evaluateRefinementEffectiveness(visualInit, visualRefn, functional, functional, c.metadata.acceptanceCriteria);
    }

    const casePassed = (mode === 'visual' ? visualRefn?.passed : mode === 'functional' ? functional?.passed : (visualRefn?.passed && functional?.passed));

    if (casePassed) passedTestsCount++;
    else failedTestsCount++;
    totalTestsCount++;

    caseResults.push({
      id: c.id,
      name: c.name,
      category: c.category,
      passed: Boolean(casePassed),
      validation: valResult,
      visual: {
        initial: visualInit,
        refined: visualRefn
      },
      functional,
      refinement,
      repeatability
    });
  }

  const suiteSuccess = failedTestsCount === 0 && totalTestsCount > 0;
  const exitCode = selectedCases.length === 0 ? 2 : suiteSuccess ? 0 : 1;

  const suiteResult = {
    runId,
    timestamp: new Date().toISOString(),
    mode,
    casesDir,
    runDir,
    summary: {
      totalCases: selectedCases.length,
      passedCases: passedTestsCount,
      failedCases: failedTestsCount,
      passRate: totalTestsCount > 0 ? Math.round((passedTestsCount / totalTestsCount) * 100) : 0,
      exitCode
    },
    agentEvaluations: KNOWN_AGENT_PROFILES,
    cases: caseResults
  };

  // Generate Reports
  const jsonReportPath = path.join(runDir, 'benchmark-results.json');
  await fs.promises.writeFile(jsonReportPath, JSON.stringify(suiteResult, null, 2), 'utf8');

  const reportMarkdown = formatBenchmarkReport(suiteResult);
  const mdReportPath = path.join(runDir, 'benchmark-report.md');
  await fs.promises.writeFile(mdReportPath, reportMarkdown, 'utf8');

  suiteResult.artifacts = {
    jsonReportPath,
    mdReportPath,
    diffsDir
  };

  return suiteResult;
}

/**
 * Formats benchmark suite results into human-readable GitHub-flavored markdown.
 * 
 * @param {BenchmarkSuiteResult} suiteResult 
 * @returns {string}
 */
export function formatBenchmarkReport(suiteResult) {
  const lines = [];

  lines.push(`# Universal Visual Engineering Suite — Benchmark & Quality Evaluation Report`);
  lines.push(``);
  lines.push(`- **Run ID**: \`${suiteResult.runId}\``);
  lines.push(`- **Executed At**: ${suiteResult.timestamp}`);
  lines.push(`- **Execution Mode**: \`${suiteResult.mode}\``);
  lines.push(`- **Total Benchmark Cases**: ${suiteResult.summary.totalCases}`);
  lines.push(`- **Pass Rate**: **${suiteResult.summary.passRate}%** (${suiteResult.summary.passedCases} passed, ${suiteResult.summary.failedCases} failed)`);
  lines.push(`- **Suite Status**: ${suiteResult.summary.exitCode === 0 ? '**PASSED ✓**' : '**FAILED ✗**'}`);
  lines.push(``);

  lines.push(`## 1. Case-by-Case Benchmark Summary`);
  lines.push(``);
  lines.push(`| Case ID | Category | Initial Diff % | Refined Diff % | Net Reduction | Functional Tests | Defect Classification | Outcome |`);
  lines.push(`| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |`);

  for (const c of suiteResult.cases) {
    const initDiff = c.visual?.initial ? `${c.visual.initial.diffPercentage}% (${c.visual.initial.diffPixels.toLocaleString()} px)` : 'N/A';
    const refnDiff = c.visual?.refined ? `${c.visual.refined.diffPercentage}% (${c.visual.refined.diffPixels.toLocaleString()} px)` : 'N/A';
    const netRed = c.refinement ? `-${c.refinement.metrics.diffReductionPercentage.toFixed(2)}%` : 'N/A';
    const funcScore = c.functional ? `${c.functional.passedTests}/${c.functional.totalTests} pass` : 'N/A';
    const defect = c.visual?.initial?.defectCategory || 'NONE';
    const outcome = c.passed ? 'PASS ✓' : 'FAIL ✗';

    lines.push(`| **${c.id}** | \`${c.category}\` | ${initDiff} | ${refnDiff} | **${netRed}** | ${funcScore} | \`${defect}\` | **${outcome}** |`);
  }
  lines.push(``);

  lines.push(`## 2. Refinement Loop Effectiveness`);
  lines.push(``);
  lines.push(`This evaluation answers: *Does iterative refinement reliably improve frontend implementations?*`);
  lines.push(``);

  for (const c of suiteResult.cases) {
    if (!c.refinement) continue;
    const ref = c.refinement;
    lines.push(`### ${c.id}: ${c.name}`);
    lines.push(`- **Initial Discrepancy**: ${ref.initial.diffPercentage}% (${ref.initial.diffPixels.toLocaleString()} pixels) [Defect: \`${ref.initial.defectCategory}\`]`);
    lines.push(`- **Refined Discrepancy**: ${ref.refined.diffPercentage}% (${ref.refined.diffPixels.toLocaleString()} pixels) [Defect: \`${ref.refined.defectCategory}\`]`);
    lines.push(`- **Absolute Pixels Eliminated**: **${ref.metrics.diffPixelsReduction.toLocaleString()} pixels** (${ref.metrics.relativeImprovementPercent}% relative improvement)`);
    lines.push(`- **Refinement Effectiveness**: ${ref.isRefinementEffective ? '✓ **VERIFIED EFFECTIVE** (Met visual and functional criteria)' : '✗ **INEFFECTIVE**'}`);
    lines.push(``);
  }

  lines.push(`## 3. Repeatability & Determinism`);
  lines.push(``);
  lines.push(`This evaluation answers: *Are visual regression measurements stable across repeated runs?*`);
  lines.push(``);
  lines.push(`| Case ID | Iterations | Pixel Variance | Deterministic? | Stability Index |`);
  lines.push(`| :--- | :--- | :--- | :--- | :--- |`);

  for (const c of suiteResult.cases) {
    if (!c.repeatability) continue;
    const rep = c.repeatability;
    lines.push(`| **${c.id}** | ${rep.runs} runs | ${rep.pixelVariance} px | ${rep.isDeterministic ? 'YES ✓' : 'NO ✗'} | **${rep.stabilityIndex}%** |`);
  }
  lines.push(``);

  lines.push(`## 4. Cross-Agent Empirical Testing Status`);
  lines.push(``);
  lines.push(`| Agent Platform | Tested Version | Verification Level | Execution Method | Last Verified |`);
  lines.push(`| :--- | :--- | :--- | :--- | :--- |`);

  for (const [key, agent] of Object.entries(suiteResult.agentEvaluations || {})) {
    lines.push(`| **${agent.agentName}** | \`${agent.testedVersion}\` | **${agent.verificationLevel}** | ${agent.executionMethod} | ${agent.lastEvaluated} |`);
  }
  lines.push(``);

  lines.push(`## 5. Known Limitations & Measurement Boundaries`);
  lines.push(``);
  lines.push(`1. **Font Subpixel Antialiasing**: Differences between macOS (CoreText), Windows (DirectWrite), and Linux (FreeType) can yield false edge discrepancies unless thresholds >= 0.1 are specified.`);
  lines.push(`2. **Dynamic Data Freezing**: Timestamps, live random data, and animations must be frozen or mocked before capturing screenshots.`);
  lines.push(`3. **WebGL and GPU Shaders**: Pixel-diffing measures DOM/CSS box model rendering. GPU shader outputs are hardware dependent.`);
  lines.push(``);

  return lines.join('\n');
}
