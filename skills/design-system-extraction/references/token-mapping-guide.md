# Design Token Extraction & Mapping Guide

When extracting visual properties from mockups, always align with the existing project architecture before inventing new variables.

## 1. Inspecting the Host Codebase

Before extracting candidate tokens, check for existing configuration files:
- **Tailwind CSS**: `tailwind.config.js`, `tailwind.config.ts`, or CSS theme blocks (`@theme`).
- **CSS Custom Properties**: `:root` variables in `src/styles/globals.css`, `index.css`, or design token files.
- **UI Component Libraries**: Radix UI, shadcn/ui, MUI, Chakra UI, Ant Design, Bootstrap.

## 2. Token Extraction Taxonomy

### Colors
- **Brand / Accent**: Primary action color, hover color, subtle active background.
- **Neutrals / Surfaces**: Canvas background, card surface, elevation layers, divider borders.
- **Text Hierarchies**: Heading text (`100%` contrast), body copy (`80%` contrast), muted captions (`50-60%` contrast).
- **Semantics**: Success (green), warning (amber/orange), destructive/error (red).

### Spacing Ladder (Base 4 or Base 8)
- `2xs`: 2px or 4px
- `xs`: 8px
- `sm`: 12px
- `md`: 16px
- `lg`: 24px
- `xl`: 32px
- `2xl`: 48px
- `3xl`: 64px

### Typography Scales
- **Display**: 36px–48px / font-bold / line-height 1.1
- **Heading 1**: 30px–36px / font-bold / line-height 1.2
- **Heading 2**: 24px–28px / font-semibold / line-height 1.25
- **Heading 3**: 18px–20px / font-semibold / line-height 1.3
- **Body**: 14px–16px / font-normal / line-height 1.5
- **Caption / Meta**: 12px–13px / font-medium / line-height 1.4

### Border Radii & Elevation
- Minimal: 4px (`rounded-sm`)
- Standard: 8px (`rounded-md` / `rounded-lg`)
- Elevated / Pill: 9999px (`rounded-full`)

## 3. Anti-Patterns to Avoid
1. **Magic numbers**: Do not use arbitrary inline styles like `margin-top: 19px` or `color: #245199` when project tokens exist like `mt-5` and `text-primary`.
2. **Duplicate token sprawl**: If the project already defines `--primary: #2563eb`, do not define `--brand-blue: #2563eb`.
3. **Hardcoding dark mode**: Respect existing CSS variables or `dark:` modifiers.
