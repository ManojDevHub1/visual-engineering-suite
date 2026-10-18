import { test, describe } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import { validateSkillFile, validatePluginManifest, parseFrontmatter } from '../src/manifest.js';

const FIXTURES_DIR = path.resolve('tests/fixtures');
const SAMPLE_SKILLS = path.join(FIXTURES_DIR, 'sample-skills');

describe('Skill Manifest & Plugin Validator', () => {
  test('parses frontmatter correctly with multiline description', () => {
    const raw = `---
name: test-skill
description: >-
  This is a multiline
  folded description.
---
# Content`;

    const { data, body } = parseFrontmatter(raw);
    assert.strictEqual(data.name, 'test-skill');
    assert.strictEqual(data.description, 'This is a multiline folded description.');
    assert.strictEqual(body.trim(), '# Content');
  });

  test('validates valid skill successfully with resolved markdown links', async () => {
    const skillPath = path.join(SAMPLE_SKILLS, 'valid-skill', 'SKILL.md');
    const res = await validateSkillFile(skillPath);
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.errors.length, 0);
    assert.strictEqual(res.name, 'valid-skill');
    assert.strictEqual(res.linksChecked, 1);
  });

  test('fails validation when name is missing', async () => {
    const skillPath = path.join(SAMPLE_SKILLS, 'missing-name', 'SKILL.md');
    const res = await validateSkillFile(skillPath);
    assert.strictEqual(res.valid, false);
    assert.ok(res.errors.some(e => e.includes('Missing required frontmatter field: "name"')));
  });

  test('fails validation when description is missing', async () => {
    const skillPath = path.join(SAMPLE_SKILLS, 'missing-desc', 'SKILL.md');
    const res = await validateSkillFile(skillPath);
    assert.strictEqual(res.valid, false);
    assert.ok(res.errors.some(e => e.includes('Missing required frontmatter field: "description"')));
  });

  test('fails validation when markdown link points to non-existent file', async () => {
    const skillPath = path.join(SAMPLE_SKILLS, 'broken-link', 'SKILL.md');
    const res = await validateSkillFile(skillPath);
    assert.strictEqual(res.valid, false);
    assert.ok(res.errors.some(e => e.includes('Broken markdown link')));
  });

  test('validates plugin.json structure', async () => {
    const pluginPath = path.join(FIXTURES_DIR, 'test-plugin.json');
    await import('node:fs/promises').then(fs => fs.writeFile(pluginPath, JSON.stringify({
      name: 'test-plugin',
      description: 'Plugin for testing validation.',
      suggestedPrompts: ['Prompt 1', 'Prompt 2', 'Prompt 3']
    })));

    const res = await validatePluginManifest(pluginPath);
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.errors.length, 0);
  });
});
