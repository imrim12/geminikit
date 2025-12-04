#!/usr/bin/env bun
/**
 * Fill form fields
 * Usage: bun fill.ts --selector "#input" --value "text" [--url https://example.com]
 */
import { getBrowser, getPage, closeBrowser, parseArgs, outputJSON, outputError } from './lib/browser.js';
import { parseSelector, waitForElement, typeIntoElement, enhanceError } from './lib/selector.js';
import { PuppeteerLifeCycleEvent } from 'puppeteer';

async function fill() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.selector || typeof args.selector !== 'string') {
    outputError(new Error('--selector is required'));
    return;
  }

  if (!args.value || typeof args.value !== 'string') {
    outputError(new Error('--value is required'));
    return;
  }

  try {
    const browser = await getBrowser({
      headless: args.headless !== 'false'
    });

    const page = await getPage(browser);

    // Navigate if URL provided
    if (args.url && typeof args.url === 'string') {
      await page.goto(args.url, {
        waitUntil: (args['wait-until'] as PuppeteerLifeCycleEvent) || 'networkidle2'
      });
    }

    // Parse and validate selector
    const parsed = parseSelector(args.selector);

    // Wait for element based on selector type
    await waitForElement(page, parsed, {
      visible: true,
      timeout: parseInt((args.timeout as string) || '5000')
    });

    // Type into element
    await typeIntoElement(page, parsed, args.value, {
      clear: args.clear === 'true',
      delay: parseInt((args.delay as string) || '0')
    });

    outputJSON({
      success: true,
      selector: args.selector,
      value: args.value,
      url: page.url()
    });

    if (args.close !== 'false') {
      await closeBrowser();
    }
  } catch (error: any) {
    // Enhance error message with troubleshooting tips
    if (args.selector && typeof args.selector === 'string') {
      const enhanced = enhanceError(error, args.selector);
      outputError(enhanced);
    } else {
      outputError(error);
    }
    process.exit(1);
  }
}

fill();
