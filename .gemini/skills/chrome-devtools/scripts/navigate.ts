#!/usr/bin/env bun
import type { PuppeteerLifeCycleEvent } from 'puppeteer'
/**
 * Navigate to a URL
 * Usage: bun navigate.ts --url https://example.com [--wait-until networkidle2] [--timeout 30000]
 */
import { closeBrowser, getBrowser, getPage, outputError, outputJSON, parseArgs } from './lib/browser.js'

async function navigate() {
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

    const waitUntilOption = (args['wait-until'] as PuppeteerLifeCycleEvent) || 'networkidle2'
    const timeoutOption = Number.parseInt((args.timeout as string) || '30000')

    await page.goto(args.url, {
      waitUntil: waitUntilOption,
      timeout: timeoutOption,
    })

    const result = {
      success: true,
      url: page.url(),
      title: await page.title(),
    }

    outputJSON(result)

    if (args.close !== 'false') {
      await closeBrowser()
    }
  }
  catch (error: any) {
    outputError(error)
  }
}

navigate()
