#!/usr/bin/env bun
import type { ConsoleMessage, PuppeteerLifeCycleEvent } from 'puppeteer'
/**
 * Monitor console messages
 * Usage: bun console.ts --url https://example.com [--types error,warn] [--duration 5000]
 */
import { closeBrowser, getBrowser, getPage, outputError, outputJSON, parseArgs } from './lib/browser.js'

async function monitorConsole() {
  const args = parseArgs(process.argv.slice(2))

  if (!args.url || typeof args.url !== 'string') {
    outputError(new Error('--url is required'))
    return
  }

  try {
    const browser = await getBrowser({
      headless: args.headless !== 'false',
    })

    const page = await getPage(browser)

    const messages: any[] = []
    const filterTypes = args.types && typeof args.types === 'string' ? args.types.split(',') : null

    // Listen for console messages
    page.on('console', (msg: ConsoleMessage) => {
      const type = msg.type()

      if (!filterTypes || filterTypes.includes(type)) {
        messages.push({
          type,
          text: msg.text(),
          location: msg.location(),
          timestamp: Date.now(),
        })
      }
    })

    // Listen for page errors
    page.on('pageerror', (error: any) => {
      messages.push({
        type: 'pageerror',
        text: error.message,
        stack: error.stack,
        timestamp: Date.now(),
      })
    })

    // Navigate
    await page.goto(args.url, {
      waitUntil: (args['wait-until'] as PuppeteerLifeCycleEvent) || 'networkidle2',
    })

    // Wait for additional time if specified
    if (args.duration) {
      await new Promise(resolve => setTimeout(resolve, Number.parseInt(args.duration as string)))
    }

    outputJSON({
      success: true,
      url: page.url(),
      messageCount: messages.length,
      messages,
    })

    if (args.close !== 'false') {
      await closeBrowser()
    }
  }
  catch (error: any) {
    outputError(error)
  }
}

monitorConsole()
