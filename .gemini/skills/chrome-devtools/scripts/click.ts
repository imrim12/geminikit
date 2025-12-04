#!/usr/bin/env bun
/**
 * Click an element
 * Usage: bun click.ts --selector ".button" [--url https://example.com] [--wait-for ".result"]
 */
import { getBrowser, getPage, closeBrowser, parseArgs, outputJSON, outputError } from './lib/browser.js';
import { parseSelector, waitForElement, clickElement, enhanceError } from './lib/selector.js';
import { PuppeteerLifeCycleEvent } from 'puppeteer';

async function click() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.selector || typeof args.selector !== 'string') {
    outputError(new Error('--selector is required'));
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

    // Set up navigation promise BEFORE clicking (in case click triggers immediate navigation)
    const navigationPromise = page.waitForNavigation({
      waitUntil: 'load',
      timeout: 5000
    }).catch(() => null); // Catch timeout - navigation may not occur

    // Click element
    await clickElement(page, parsed);

    // Wait for optional selector after click
    if (args['wait-for'] && typeof args['wait-for'] === 'string') {
      await page.waitForSelector(args['wait-for'], {
        timeout: parseInt((args.timeout as string) || '5000')
      });
    } else {
      // Wait for navigation to complete (or timeout if no navigation)
      await navigationPromise;
    }

    outputJSON({
      success: true,
      url: page.url(),
      title: await page.title()
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

click();
