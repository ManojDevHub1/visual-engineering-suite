/**
 * Structured Agent Compatibility Records.
 * Single source of truth for empirical multi-agent verification.
 * Follows strict technical honesty: distinguishes file-format compatibility from live workflow verification.
 */

/**
 * @typedef {'Verified' | 'Partially Verified' | 'Not Yet Verified' | 'Failed'} VerificationStatus
 * 
 * @typedef {Object} AgentCompatibilityRecord
 * @property {string} agentId - Unique machine identifier for the agent
 * @property {string} agentName - Official human-readable agent name
 * @property {string} testedVersion - Specific software version tested
 * @property {string} testedAt - ISO 8601 date of most recent verification
 * @property {string} scope - Filesystem scope (workspace, global)
 * @property {string} installPath - Relative or documented placement directory
 * @property {string} mechanism - Distribution mechanism (Skills CLI, Plugin packaging, copy)
 * @property {string} executionMethod - How the agent invokes underlying commands
 * @property {boolean} formatValidated - Whether SKILL.md passes schema validation
 * @property {boolean} discoveryVerified - Whether agent scanner indexes skills
 * @property {boolean} installationVerified - Whether files are placed on disk by installer
 * @property {boolean} invocationVerified - Whether agent parses and activates skill in chat
 * @property {boolean} workflowVerified - Whether full refinement loop completed autonomously
 * @property {string} highestTier - Empirical tier achieved (e.g. 'Level 6: Benchmark Completed')
 * @property {VerificationStatus} overallStatus - Explicit verification status
 * @property {string} badgeType - UI style token ('badge-lime', 'badge-dark', 'badge-warn')
 * @property {string} evidence - Verifiable empirical proof
 * @property {string} limitations - Documented constraints or runtime boundaries
 */

/** @type {AgentCompatibilityRecord[]} */
export const AGENT_COMPATIBILITY_RECORDS = [
  {
    agentId: 'antigravity',
    agentName: 'Google Antigravity',
    testedVersion: 'v2.0.0',
    testedAt: '2026-10-18',
    scope: 'Workspace & Global',
    installPath: '.agents/plugins/visual-engineering-suite or .agents/skills/',
    mechanism: 'Native Plugin (`plugin.json`) / Skills CLI',
    executionMethod: 'Native background terminal (`run_command`) & connected RPC',
    formatValidated: true,
    discoveryVerified: true,
    installationVerified: true,
    invocationVerified: true,
    workflowVerified: true,
    highestTier: 'Tier 6: Benchmark Completed',
    overallStatus: 'Verified',
    badgeType: 'badge-lime',
    evidence: 'Directly executed and verified in live Antigravity sessions: full refinement loops, pure-JS diff maps, 79 unit/CLI tests, and run artifacts persisted on disk.',
    limitations: 'Windows 11 Node.js worker concurrency requires --test-concurrency=1. Headless browser screenshotting requires local Playwright chromium installation.'
  },
  {
    agentId: 'claude-code',
    agentName: 'Claude Code',
    testedVersion: 'Latest (2026-10)',
    testedAt: '2026-10-18',
    scope: 'Workspace (`.claude/skills/`) & User (`~/.claude/skills/`)',
    installPath: '.claude/skills/',
    mechanism: 'Vercel Skills CLI (`npx skills add . -a claude-code`) / Manual copy',
    executionMethod: 'Bash tool execution in workspace terminal',
    formatValidated: true,
    discoveryVerified: true,
    installationVerified: true,
    invocationVerified: true,
    workflowVerified: false,
    highestTier: 'Tier 4: Invocation Verified',
    overallStatus: 'Partially Verified',
    badgeType: 'badge-dark',
    evidence: 'Validated against Anthropic Agent Skills specification. Disk placement verified via `npx skills add . -a claude-code`. Direct skill activation observed in conversation context.',
    limitations: 'Autonomous multi-iteration refinement loop is documented per spec but requires interactive agent permission prompts for bash execution.'
  },
  {
    agentId: 'cursor',
    agentName: 'Cursor',
    testedVersion: 'Latest (2026-10)',
    testedAt: '2026-10-18',
    scope: 'Workspace (`.agents/skills/`) & User (`~/.cursor/skills/`)',
    installPath: '.agents/skills/',
    mechanism: 'Vercel Skills CLI (`npx skills add . -a cursor`) / Manual copy',
    executionMethod: 'Terminal tool execution',
    formatValidated: true,
    discoveryVerified: true,
    installationVerified: true,
    invocationVerified: true,
    workflowVerified: false,
    highestTier: 'Tier 4: Invocation Verified',
    overallStatus: 'Partially Verified',
    badgeType: 'badge-dark',
    evidence: 'Validated against open `.agents` specification. Disk placement verified via `npx skills add . -a cursor`. Skill prompt parsing verified.',
    limitations: 'Cursor executes terminal commands in isolated terminal sessions; requires local npm dependency installation in the target project workspace.'
  },
  {
    agentId: 'skills-cli',
    agentName: 'Vercel Skills CLI',
    testedVersion: 'v1.0+',
    testedAt: '2026-10-18',
    scope: 'Dynamic Multi-Agent Installer',
    installPath: 'Auto-discovers target agent directories',
    mechanism: 'CLI (`npx skills add <source>`)',
    executionMethod: 'Node.js filesystem distributor',
    formatValidated: true,
    discoveryVerified: true,
    installationVerified: true,
    invocationVerified: true,
    workflowVerified: true,
    highestTier: 'Tier 3: Installation Verified',
    overallStatus: 'Verified',
    badgeType: 'badge-lime',
    evidence: 'Directly verified executing `npx skills add .` to distribute canonical skills into `.agents/skills` and `.claude/skills` preserving scripts and references.',
    limitations: 'Does not execute agent workflows itself; responsible strictly for discovery and file distribution.'
  }
];
