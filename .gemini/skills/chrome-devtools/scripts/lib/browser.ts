/**
 * Shared browser utilities for Chrome DevTools scripts
 */
import type { Browser, Page } from 'puppeteer'
import debug from 'debug'
import puppeteer from 'puppeteer'

const log = debug('chrome-devtools:browser')

let browserInstance: Browser | null = null
let pageInstance: Page | null = null

export interface BrowserOptions {
  headless?: boolean | 'new'
  args?: string[]
  viewport?: {
    width: number
    height: number
  }
  browserUrl?: string
  wsEndpoint?: string
  [key: string]: any
}

/**
 * Launch or connect to browser
 */
export async function getBrowser(options: BrowserOptions = {}): Promise<Browser> {
  if (browserInstance && browserInstance.isConnected()) {
    log('Reusing existing browser instance')
    return browserInstance
  }

  const launchOptions: any = {
    headless: options.headless !== false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      ...(options.args || []),
    ],
    defaultViewport: options.viewport || {
      width: 1920,
      height: 1080,
    },
    ...options,
  }

  if (options.browserUrl || options.wsEndpoint) {
    log('Connecting to existing browser')
    browserInstance = await puppeteer.connect({
      browserURL: options.browserUrl,
      browserWSEndpoint: options.wsEndpoint,
    })
  }
  else {
    log('Launching new browser')
    browserInstance = await puppeteer.launch(launchOptions)
  }

  return browserInstance
}

/**
 * Get current page or create new one
 */
export async function getPage(browser: Browser): Promise<Page> {
  if (pageInstance && !pageInstance.isClosed()) {
    log('Reusing existing page')
    return pageInstance
  }

  const pages = await browser.pages()
  if (pages.length > 0) {
    pageInstance = pages[0]
  }
  else {
    pageInstance = await browser.newPage()
  }

  return pageInstance
}

/**
 * Close browser
 */
export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close()
    browserInstance = null
    pageInstance = null
  }
}

/**
 * Parse command line arguments
 */
export function parseArgs(argv: string[]): Record<string, string | boolean> {
  const args: Record<string, string | boolean> = {}

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]

    if (arg.startsWith('--')) {
      const key = arg.slice(2)
      const nextArg = argv[i + 1]

      if (nextArg && !nextArg.startsWith('--')) {
        args[key] = nextArg
        i++
      }
      else {
        args[key] = true
      }
    }
  }

  return args
}

/**
 * Output JSON result
 */
export function outputJSON(data: any): void {
  console.log(JSON.stringify(data, null, 2))
}

/**
 * Output error
 */
export function outputError(error: Error): void {
  console.error(JSON.stringify({
    success: false,
    error: error.message,
    stack: error.stack,
  }, null, 2))
  process.exit(1)
}
