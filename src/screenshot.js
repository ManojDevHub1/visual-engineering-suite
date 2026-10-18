import path from 'node:path';
import fs from 'node:fs';

export const VIEWPORT_PRESETS = {
  mobile: { width: 390, height: 844 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 800 },
  wide: { width: 1440, height: 900 }
};

/**
 * Checks if Playwright is available in the environment.
 * @returns {Promise<boolean>}
 */
export async function isPlaywrightAvailable() {
  try {
    await import('playwright');
    return true;
  } catch {
    return false;
  }
}

/**
 * Captures a screenshot using Playwright with viewport control, console logging, and network failure tracking.
 * 
 * @param {object} options
 * @param {string} options.url - Web URL or file:// URI to capture
 * @param {string} options.outputPath - Destination file path for PNG
 * @param {number} [options.width=1280] - Viewport width
 * @param {number} [options.height=800] - Viewport height
 * @param {string} [options.preset] - Viewport preset ('mobile'|'tablet'|'desktop'|'wide')
 * @param {boolean} [options.fullPage=false] - Whether to capture full scrollable page
 * @param {string} [options.waitForSelector] - Optional CSS selector to wait for before capturing
 * @param {number} [options.waitTimeout=500] - Milliseconds to settle before capturing
 * @returns {Promise<{
 *   outputPath: string,
 *   dimensions: { width: number, height: number },
 *   consoleLogs: Array<{ type: string, text: string }>,
 *   networkFailures: Array<{ url: string, status?: number, error?: string }>,
 *   capturedAt: string
 * }>}
 */
export async function captureScreenshot(options) {
  const {
    url,
    outputPath,
    width = 1280,
    height = 800,
    preset,
    fullPage = false,
    waitForSelector,
    waitTimeout = 500
  } = options;

  if (!url) {
    throw new Error('URL is required for browser screenshot capture.');
  }
  if (!outputPath) {
    throw new Error('outputPath is required for browser screenshot capture.');
  }

  let finalWidth = width;
  let finalHeight = height;
  if (preset && VIEWPORT_PRESETS[preset]) {
    finalWidth = VIEWPORT_PRESETS[preset].width;
    finalHeight = VIEWPORT_PRESETS[preset].height;
  }

  const available = await isPlaywrightAvailable();
  if (!available) {
    const err = new Error(
      'Playwright is not installed. To enable automated browser screenshot capture, install it with:\n' +
      '  npm install --save-dev playwright\n' +
      '  npx playwright install chromium\n\n' +
      'Alternatively, if running inside an agent with built-in browser tools (e.g. Antigravity browser tools), ' +
      'use the agent\'s native screenshot command.'
    );
    err.code = 'PLAYWRIGHT_NOT_INSTALLED';
    throw err;
  }

  const { chromium } = await import('playwright');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: finalWidth, height: finalHeight },
    deviceScaleFactor: 1
  });

  const page = await context.newPage();
  const consoleLogs = [];
  const networkFailures = [];

  page.on('console', msg => {
    consoleLogs.push({ type: msg.type(), text: msg.text() });
  });

  page.on('requestfailed', req => {
    networkFailures.push({
      url: req.url(),
      error: req.failure()?.errorText || 'Unknown error'
    });
  });

  page.on('response', resp => {
    if (resp.status() >= 400) {
      networkFailures.push({
        url: resp.url(),
        status: resp.status()
      });
    }
  });

  try {
    await page.goto(url, { waitUntil: 'load', timeout: 30000 });

    if (waitForSelector) {
      await page.waitForSelector(waitForSelector, { timeout: 10000 });
    }

    if (waitTimeout > 0) {
      await page.waitForTimeout(waitTimeout);
    }

    const resolvedOutputPath = path.resolve(outputPath);
    await fs.promises.mkdir(path.dirname(resolvedOutputPath), { recursive: true });

    await page.screenshot({
      path: resolvedOutputPath,
      fullPage
    });

    return {
      outputPath: resolvedOutputPath,
      dimensions: { width: finalWidth, height: finalHeight },
      consoleLogs,
      networkFailures,
      capturedAt: new Date().toISOString()
    };
  } finally {
    await browser.close();
  }
}
