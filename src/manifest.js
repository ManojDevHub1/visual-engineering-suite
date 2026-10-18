import fs from 'node:fs';
import path from 'node:path';

/**
 * Parses frontmatter from a markdown string.
 * Supports basic YAML key-value pairs and multi-line strings with >- or |.
 * 
 * @param {string} content
 * @returns {{ data: Record<string, any>, body: string }}
 */
export function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    throw new Error('Frontmatter block (--- ... ---) not found at beginning of file');
  }

  const rawYaml = match[1];
  const body = match[2];
  const data = {};

  const lines = rawYaml.split(/\r?\n/);
  let currentKey = null;
  let multilineMode = null; // 'fold' (>-), 'literal' (|)
  let multilineBuffer = [];

  const flushMultiline = () => {
    if (currentKey && multilineMode) {
      if (multilineMode === 'fold') {
        data[currentKey] = multilineBuffer.join(' ').replace(/\s+/g, ' ').trim();
      } else {
        data[currentKey] = multilineBuffer.join('\n').trim();
      }
    }
    multilineMode = null;
    multilineBuffer = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Check if indented line belongs to current multiline
    if (/^\s+/.test(line) && currentKey && multilineMode) {
      multilineBuffer.push(trimmed);
      continue;
    }

    // New key-value pair
    flushMultiline();

    const kvMatch = line.match(/^([a-zA-Z0-9_\-]+)\s*:\s*(.*)$/);
    if (!kvMatch) continue;

    const key = kvMatch[1].trim();
    let val = kvMatch[2].trim();

    if (val === '>-' || val === '>') {
      currentKey = key;
      multilineMode = 'fold';
    } else if (val === '|' || val === '|-') {
      currentKey = key;
      multilineMode = 'literal';
    } else {
      // Strip quotes if any
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      data[key] = val;
      currentKey = key;
    }
  }

  flushMultiline();
  return { data, body };
}

/**
 * Validates a single SKILL.md file.
 * 
 * @param {string} skillMdPath 
 * @returns {Promise<{
 *   valid: boolean,
 *   name?: string,
 *   description?: string,
 *   errors: string[],
 *   warnings: string[],
 *   linksChecked: number
 * }>}
 */
export async function validateSkillFile(skillMdPath) {
  const errors = [];
  const warnings = [];
  let linksChecked = 0;

  if (!fs.existsSync(skillMdPath)) {
    return {
      valid: false,
      errors: [`SKILL.md file does not exist: ${skillMdPath}`],
      warnings: [],
      linksChecked: 0
    };
  }

  const content = await fs.promises.readFile(skillMdPath, 'utf8');
  let data, body;

  try {
    const parsed = parseFrontmatter(content);
    data = parsed.data;
    body = parsed.body;
  } catch (err) {
    errors.push(`Invalid frontmatter: ${err.message}`);
    return { valid: false, errors, warnings, linksChecked };
  }

  // Validate name
  const dirName = path.basename(path.dirname(path.resolve(skillMdPath)));
  if (!data.name) {
    errors.push('Missing required frontmatter field: "name"');
  } else {
    if (typeof data.name !== 'string') {
      errors.push('Frontmatter field "name" must be a string');
    } else {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.name)) {
        errors.push(`Skill name "${data.name}" must be lowercase kebab-case (e.g. "visual-reconstruction")`);
      }
      if (dirName !== data.name && dirName !== 'skills') {
        warnings.push(`Skill directory name "${dirName}" does not match frontmatter name "${data.name}"`);
      }
    }
  }

  // Validate description
  if (!data.description) {
    errors.push('Missing required frontmatter field: "description"');
  } else if (typeof data.description !== 'string' || data.description.trim().length === 0) {
    errors.push('Frontmatter field "description" must be a non-empty string');
  } else if (data.description.length < 20) {
    warnings.push('Frontmatter description is very brief. Ensure it explains both what the skill does and when to activate it.');
  }

  // Validate internal markdown links point to existing files
  const skillDir = path.dirname(path.resolve(skillMdPath));
  const linkRegex = /\[([^\]]+)\]\((?!(?:https?|mailto|[a-zA-Z0-9+.-]+):\/|#)([^)]+)\)/g;
  let match;
  while ((match = linkRegex.exec(body)) !== null) {
    linksChecked++;
    const targetLink = match[2].split('#')[0].trim();
    if (targetLink) {
      const targetPath = path.resolve(skillDir, targetLink);
      if (!fs.existsSync(targetPath)) {
        errors.push(`Broken markdown link in ${path.basename(skillMdPath)}: "${match[2]}" (target file not found: ${targetPath})`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    name: data?.name,
    description: data?.description,
    errors,
    warnings,
    linksChecked
  };
}

/**
 * Validates an Antigravity plugin.json file.
 * 
 * @param {string} pluginJsonPath 
 * @returns {Promise<{ valid: boolean, errors: string[], warnings: string[] }>}
 */
export async function validatePluginManifest(pluginJsonPath) {
  const errors = [];
  const warnings = [];

  if (!fs.existsSync(pluginJsonPath)) {
    return {
      valid: false,
      errors: [`plugin.json file does not exist: ${pluginJsonPath}`],
      warnings: []
    };
  }

  let manifest;
  try {
    const raw = await fs.promises.readFile(pluginJsonPath, 'utf8');
    // Clean trailing commas and comments if any (JSONC)
    const sanitized = raw.replace(/\/\/.*$/gm, '').replace(/,(\s*[\]}])/g, '$1');
    manifest = JSON.parse(sanitized);
  } catch (err) {
    errors.push(`Failed to parse plugin.json: ${err.message}`);
    return { valid: false, errors, warnings };
  }

  if (typeof manifest !== 'object' || manifest === null || Array.isArray(manifest)) {
    errors.push('plugin.json must contain a JSON object');
    return { valid: false, errors, warnings };
  }

  if (manifest.name && typeof manifest.name !== 'string') {
    errors.push('Field "name" in plugin.json must be a string');
  } else if (manifest.name && !/^[a-z0-9_\-]+$/.test(manifest.name)) {
    warnings.push(`Plugin name "${manifest.name}" should ideally be lowercase kebab-case.`);
  }

  if (manifest.description && typeof manifest.description !== 'string') {
    errors.push('Field "description" in plugin.json must be a string');
  }

  if (manifest.suggestedPrompts !== undefined) {
    if (!Array.isArray(manifest.suggestedPrompts)) {
      errors.push('Field "suggestedPrompts" must be an array of strings');
    } else {
      if (manifest.suggestedPrompts.length > 3) {
        warnings.push(`"suggestedPrompts" contains ${manifest.suggestedPrompts.length} items; only the first 3 will be used in Antigravity UI cards.`);
      }
      for (const p of manifest.suggestedPrompts) {
        if (typeof p !== 'string') {
          errors.push(`Each suggested prompt must be a string, got ${typeof p}`);
        }
      }
    }
  }

  if (manifest.logo) {
    if (typeof manifest.logo !== 'string') {
      errors.push('Field "logo" must be a string');
    } else {
      const validExtensions = ['.png', '.svg', '.jpg', '.jpeg', '.webp'];
      const ext = path.extname(manifest.logo).toLowerCase();
      if (!validExtensions.includes(ext)) {
        errors.push(`Logo file extension "${ext}" is invalid. Allowed: ${validExtensions.join(', ')}`);
      }
      const pluginDir = path.dirname(path.resolve(pluginJsonPath));
      const logoPath = path.resolve(pluginDir, manifest.logo);
      if (!fs.existsSync(logoPath)) {
        errors.push(`Specified logo file does not exist on disk: ${manifest.logo} (${logoPath})`);
      }
    }
  }

  // Warn about ignored fields per Antigravity documentation
  const knownFields = ['name', 'displayName', 'description', 'version', 'logo', 'suggestedPrompts', 'disabled'];
  for (const key of Object.keys(manifest)) {
    if (!knownFields.includes(key)) {
      warnings.push(`Field "${key}" is not recognized by Antigravity plugin loader and will be silently ignored.`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates all skills within a directory (recursive search for SKILL.md).
 * 
 * @param {string} rootDir 
 * @returns {Promise<{
 *   totalSkills: number,
 *   validSkills: number,
 *   results: Array<{ path: string, result: Awaited<ReturnType<typeof validateSkillFile>> }>,
 *   pluginResult?: Awaited<ReturnType<typeof validatePluginManifest>>
 * }>}
 */
export async function validateRepositorySkills(rootDir) {
  const results = [];

  async function walk(dir) {
    const entries = await fs.promises.readdir(dir, { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === '.git' || (entry.name === 'fixtures' && path.basename(dir) === 'tests')) continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const skillMd = path.join(fullPath, 'SKILL.md');
        if (fs.existsSync(skillMd)) {
          const res = await validateSkillFile(skillMd);
          results.push({ path: skillMd, result: res });
        }
        await walk(fullPath);
      }
    }
  }

  await walk(rootDir);

  let pluginResult = undefined;
  const rootPluginJson = path.join(rootDir, 'plugin.json');
  if (fs.existsSync(rootPluginJson)) {
    pluginResult = await validatePluginManifest(rootPluginJson);
  }

  const validSkills = results.filter(r => r.result.valid).length;

  return {
    totalSkills: results.length,
    validSkills,
    results,
    pluginResult
  };
}
