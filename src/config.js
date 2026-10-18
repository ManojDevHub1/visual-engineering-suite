/**
 * Canonical product and repository configuration for Visual Engineering Suite.
 * Single source of truth for branding, metadata, repositories, and verification standards.
 */
export const productConfig = {
  name: 'Visual Engineering Suite',
  shortName: 'VES',
  version: '1.1.0',
  description: 'Production-quality, cross-agent visual engineering skill suite for AI coding agents: UI reconstruction, token extraction, pixel-level visual regression, and closed-loop refinement.',
  repositoryUrl: 'https://github.com/ManojDevHub1/visual-engineering-suite',
  gitCloneUrl: 'https://github.com/ManojDevHub1/visual-engineering-suite.git',
  license: 'MIT',
  author: 'Visual Engineering Suite Contributors',
  npmPackage: 'visual-engineering-suite',
  docsUrl: 'https://github.com/ManojDevHub1/visual-engineering-suite#readme',
  skillsShUrl: 'https://skills.sh',

  // Supported Agent Integrations
  supportedAgents: [
    {
      id: 'antigravity',
      name: 'Google Antigravity',
      packageType: 'Native Plugin / Skills CLI',
      targetPath: '.agents/plugins/visual-engineering-suite'
    },
    {
      id: 'claude-code',
      name: 'Claude Code',
      packageType: 'Agent Skills Standard',
      targetPath: '.claude/skills/'
    },
    {
      id: 'cursor',
      name: 'Cursor',
      packageType: '.agents Standard',
      targetPath: '.agents/skills/'
    }
  ],

  // 6 Empirical Verification Tiers (Single Canonical Standard)
  verificationTiers: [
    {
      tier: 1,
      name: 'Format Validated',
      badge: 'Tier 1',
      description: 'Frontmatter, schema, and directory layout pass automated validators against platform specs.'
    },
    {
      tier: 2,
      name: 'Discovery Verified',
      badge: 'Tier 2',
      description: 'Platform discovery scanner (Connect RPC, skill catalog) is observed indexing the skills by name.'
    },
    {
      tier: 3,
      name: 'Installation Verified',
      badge: 'Tier 3',
      description: 'CLI or plugin installers have been executed and successfully placed files in target paths.'
    },
    {
      tier: 4,
      name: 'Invocation Verified',
      badge: 'Tier 4',
      description: 'Agent is directly observed parsing and activating the skill during an interactive session.'
    },
    {
      tier: 5,
      name: 'Task Execution',
      badge: 'Tier 5',
      description: 'Agent completes an individual visual engineering task (e.g. diffing, token mapping) using the skill.'
    },
    {
      tier: 6,
      name: 'Benchmark Completed',
      badge: 'Tier 6',
      description: 'Autonomous closed-loop refinement loop runs to completion with verified artifacts on disk.'
    }
  ]
};

/**
 * Validates a GitHub repository URL.
 * 
 * @param {string} url 
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateRepositoryUrl(url) {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'Repository URL is required and must be a non-empty string' };
  }
  try {
    const parsed = new URL(url);
    if (!['https:', 'http:'].includes(parsed.protocol)) {
      return { valid: false, error: 'Repository URL must use https: or http: protocol' };
    }
    if (parsed.hostname !== 'github.com') {
      return { valid: false, error: 'Repository URL must be hosted on github.com' };
    }
    const pathParts = parsed.pathname.replace(/\.git$/, '').split('/').filter(Boolean);
    if (pathParts.length < 2) {
      return { valid: false, error: 'Repository URL must contain owner and repository name' };
    }
    return { valid: true };
  } catch (err) {
    return { valid: false, error: `Invalid URL format: ${err.message}` };
  }
}
