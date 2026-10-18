/**
 * Canonical Skill Specifications & Architectural Metadata.
 * Single source of truth for the 7 specialist skills.
 * Additional fields enrich canonical SKILL.md definitions with structured schemas.
 */

export const SKILL_ARCHITECTURAL_METADATA = {
  'visual-reconstruction': {
    id: 'visual-reconstruction',
    category: 'reconstruction',
    implementationStatus: 'verified',
    requiredInputs: ['Visual mockup or screenshot (PNG / JPEG)', 'Target viewport specifications'],
    expectedOutputs: ['Spatial hierarchy decomposition', 'DOM structure outline', 'reconstruction-spec.json'],
    dependencies: ['node', 'pixelmatch', 'pngjs'],
    supportedIntegrations: ['Google Antigravity', 'Claude Code', 'Cursor']
  },
  'design-system-extraction': {
    id: 'design-system-extraction',
    category: 'design-tokens',
    implementationStatus: 'verified',
    requiredInputs: ['Reference screenshot', 'Host codebase CSS or Tailwind configuration'],
    expectedOutputs: ['Extracted color palette', 'Typography scale', 'Spacing tokens', 'tokens.json'],
    dependencies: ['node'],
    supportedIntegrations: ['Google Antigravity', 'Claude Code', 'Cursor']
  },
  'frontend-implementation': {
    id: 'frontend-implementation',
    category: 'implementation',
    implementationStatus: 'verified',
    requiredInputs: ['reconstruction-spec.json', 'tokens.json', 'Host component conventions'],
    expectedOutputs: ['Semantic HTML/Framework component', 'Interactive state matrix', 'Component tests'],
    dependencies: ['node'],
    supportedIntegrations: ['Google Antigravity', 'Claude Code', 'Cursor']
  },
  'browser-visual-qa': {
    id: 'browser-visual-qa',
    category: 'qa',
    implementationStatus: 'verified',
    requiredInputs: ['Component HTML or local server URL', 'Target viewport presets'],
    expectedOutputs: ['Rendered screenshot (PNG)', 'Console error logs', 'Network request logs'],
    dependencies: ['playwright'],
    supportedIntegrations: ['Google Antigravity', 'Claude Code', 'Cursor']
  },
  'visual-regression-triage': {
    id: 'visual-regression-triage',
    category: 'regression',
    implementationStatus: 'verified',
    requiredInputs: ['reference.png', 'rendered.png', 'Diff threshold (default: 0.1)'],
    expectedOutputs: ['diff.png (magenta diff map)', 'Defect bounding box [minX..maxX, minY..maxY]', 'Triage classification'],
    dependencies: ['pixelmatch', 'pngjs'],
    supportedIntegrations: ['Google Antigravity', 'Claude Code', 'Cursor']
  },
  'accessibility-performance-audit': {
    id: 'accessibility-performance-audit',
    category: 'audit',
    implementationStatus: 'verified',
    requiredInputs: ['Rendered HTML', 'Component source code'],
    expectedOutputs: ['WCAG 2.1 AA contrast report', 'Touch target evaluation', 'Semantic landmarks audit'],
    dependencies: ['node'],
    supportedIntegrations: ['Google Antigravity', 'Claude Code', 'Cursor']
  },
  'visual-refinement-loop': {
    id: 'visual-refinement-loop',
    category: 'refinement',
    implementationStatus: 'verified',
    requiredInputs: ['Discrepancy bounding box', 'Diff map', 'Max iterations (default: 3)'],
    expectedOutputs: ['Targeted code patch', 'Refined rendered screenshot', 'Iteration delta telemetry', 'summary.md', 'run.json'],
    dependencies: ['pixelmatch', 'pngjs', 'node'],
    supportedIntegrations: ['Google Antigravity', 'Claude Code', 'Cursor']
  }
};
