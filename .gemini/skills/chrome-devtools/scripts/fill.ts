#!/usr/bin/env bun
import type { PuppeteerLifeCycleEvent } from 'puppeteer'
/**
 * Fill form fields
 * Usage: bun fill.ts --selector "#input" --value "text" [--url https://example.com]
 */
import { closeBrowser, getBrowser, getPage, outputError, outputJSON, parseArgs } from './lib/browser.js'
import { parseSelector, typeIntoElement, waitForElement } from './lib/selector.js'

async function fill() {
  const args = parseArgs(process.argv.slice(2))

  if (!args.selector || typeof args.selector !== 'string') {
    outputError(new Error('--selector is required'))
    return
  }

  if (!args.value || typeof args.value !== 'string') {
    outputError(new Error('--value is required'))
    return
  }

  try {
    const browser = await getBrowser({
      headless: args.headless !== 'false',
    })

    const page = await getPage(browser)

    // Navigate if URL provided
    if (args.url && typeof args.url === 'string') {
      await page.goto(args.url, {
        waitUntil: (args['wait-until'] as PuppeteerLifeCycleEvent) || 'networkidle2',
      })
    }

    // Parse and validate selector
    const parsed = parseSelector(args.selector)

    // Wait for element based on selector type
    await waitForElement(page, parsed, {
      visible: true,
      timeout: Number.parseInt((args.timeout as string) || '5000'),
    })

    // Type into element
    await typeIntoElement(page, parsed, args.value, {
      clear: args.clear === 'true',
      delay: Number.parseInt((args.delay as string) || '0'),
    })

    outputJSON({
      success: true,
      selector: args.selector,
      value: args.value,
      url: page.url(),
    })

    if (args.close !== 'false') {
      await closeBrowser()
    }
  }
  catch (error: any) {
    outputError(error)

    process.exit(1)
  }
}

fill()
