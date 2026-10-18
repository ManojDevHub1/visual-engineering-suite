import { productConfig } from './data/site-config.js';

/**
 * Centralized site and brand configuration derived directly from canonical src/config.js.
 * Single source of truth for repository URLs, metadata, and branding.
 */
export const siteConfig = {
  brandName: productConfig.name,
  shortName: productConfig.shortName,
  tagline: "From Screenshot to Verified UI",
  subheading: productConfig.description,
  version: productConfig.version,
  license: productConfig.license,
  author: productConfig.author,
  githubUrl: productConfig.repositoryUrl,
  gitCloneUrl: productConfig.gitCloneUrl,
  docsUrl: productConfig.docsUrl,
  skillsShUrl: productConfig.skillsShUrl,
  npmPackage: productConfig.npmPackage,
  primaryCtaText: "Get Started",
  secondaryCtaText: "View on GitHub",

  navLinks: [
    { label: "Features", href: "#features" },
    { label: "Workflow", href: "#workflow" },
    { label: "Skills", href: "#skills" },
    { label: "Installation", href: "#install" },
    { label: "Benchmarks", href: "#benchmarks" },
    { label: "Compatibility", href: "#compatibility" },
    { label: "Documentation", href: "#docs" }
  ],

  meta: {
    title: `${productConfig.name} — From Screenshot to Verified UI`,
    description: productConfig.description,
    keywords: [
      "agent skills",
      "visual engineering",
      "visual regression",
      "frontend testing",
      "design tokens",
      "antigravity",
      "claude code",
      "cursor",
      "pixelmatch",
      "developer tools"
    ]
  }
};
