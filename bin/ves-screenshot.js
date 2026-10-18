#!/usr/bin/env node
import { captureScreenshot, VIEWPORT_PRESETS } from '../src/screenshot.js';

function parseArgValue(args, flag) {
  const idx = args.indexOf(flag);
  if (idx !== -1 && idx + 1 < args.length) {
    return args[idx + 1];
  }
  return null;
}

async function main() {
  const args = process.argv.slice(2);
  const isJson = args.includes('--json');
  const showHelp = args.includes('--help') || args.includes('-h');
  const fullPage = args.includes('--full-page');

  const preset = parseArgValue(args, '--preset') || parseArgValue(args, '-p');
  const widthVal = parseArgValue(args, '--width') || parseArgValue(args, '-w');
  const heightVal = parseArgValue(args, '--height') || parseArgValue(args, '-h');
  const selector = parseArgValue(args, '--selector') || parseArgValue(args, '-s');
  const waitVal = parseArgValue(args, '--wait');

  const positional = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('-')) {
      if (['--preset', '-p', '--width', '-w', '--height', '-h', '--selector', '-s', '--wait'].includes(args[i])) {
        i++;
      }
      continue;
    }
    positional.push(args[i]);
  }

  if (showHelp || positional.length < 2) {
    console.log(`
Usage: ves-screenshot <url> <outputPath> [options]

Captures a screenshot of a web page or local HTML file at standardized viewport dimensions.

Arguments:
  <url>                   URL (e.g. http://localhost:3000) or local file path
  <outputPath>            Destination file path for PNG screenshot

Options:
  --preset, -p <name>     Viewport preset: mobile (390x844), tablet (768x1024), desktop (1280x800), wide (1440x900)
  --width, -w <px>        Explicit viewport width (default: 1280)
  --height, -h <px>       Explicit viewport height (default: 800)
  --selector, -s <sel>    CSS selector to await before capturing
  --wait <ms>             Settle time in milliseconds before capturing (default: 500)
  --full-page             Capture full scrollable page height
  --json                  Output results in machine-readable JSON format
  --help                  Show this help message

Exit codes:
  0   Screenshot captured successfully
  1   Browser navigation or screenshot error
  2   Playwright not installed in environment
`);
    process.exit(0);
  }

  const [url, outputPath] = positional;
  const width = widthVal ? parseInt(widthVal, 10) : 1280;
  const height = heightVal ? parseInt(heightVal, 10) : 800;
  const waitTimeout = waitVal ? parseInt(waitVal, 10) : 500;

  try {
    const result = await captureScreenshot({
      url,
      outputPath,
      preset,
      width,
      height,
      selector,
      waitTimeout,
      fullPage
    });

    if (isJson) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(`\n=== Browser Screenshot Captured ===\n`);
      console.log(`URL:          ${url}`);
      console.log(`Output:       ${result.outputPath}`);
      console.log(`Dimensions:   ${result.dimensions.width}x${result.dimensions.height}px`);
      console.log(`Console Logs: ${result.consoleLogs.length} entries`);
      console.log(`Net Failures: ${result.networkFailures.length} entries`);
      console.log('');
    }
    process.exit(0);
  } catch (err) {
    if (isJson) {
      console.log(JSON.stringify({ error: err.message, code: err.code || 'SCREENSHOT_ERROR' }, null, 2));
    } else {
      console.error(`\nScreenshot Error: ${err.message}\n`);
    }
    process.exit(err.code === 'PLAYWRIGHT_NOT_INSTALLED' ? 2 : 1);
  }
}

main();
