/**
 * Shared selector parsing and validation library
 * Supports CSS and XPath selectors with security validation
 */
import type { ElementHandle, Page } from 'puppeteer'

export interface ParsedSelector {
  type: 'css' | 'xpath'
  selector: string
}

export interface WaitForOptions {
  visible?: boolean
  timeout?: number
}

export interface TypeOptions {
  delay?: number
  clear?: boolean
}

/**
 * Parse and validate selector
 * @throws {Error} If XPath contains injection patterns
 */
export function parseSelector(selector: string): ParsedSelector {
  if (!selector || typeof selector !== 'string') {
    throw new Error('Selector must be a non-empty string')
  }

  // Detect XPath selectors
  if (selector.startsWith('/') || selector.startsWith('(//')) {
    // XPath injection prevention
    validateXPath(selector)
    return { type: 'xpath', selector }
  }

  // CSS selector
  return { type: 'css', selector }
}

/**
 * Validate XPath selector for security
 * @throws {Error} If XPath contains dangerous patterns
 */
function validateXPath(xpath: string): void {
  const dangerous = [
    'javascript:',
    '<script',
    'onerror=',
    'onload=',
    'onclick=',
    'onmouseover=',
    'eval(',
    'Function(',
    'constructor(',
  ]

  const lower = xpath.toLowerCase()
  for (const pattern of dangerous) {
    if (lower.includes(pattern.toLowerCase())) {
      throw new Error(`Potential XPath injection detected: ${pattern}`)
    }
  }

  // Additional validation: check for extremely long selectors (potential DoS)
  if (xpath.length > 1000) {
    throw new Error('XPath selector too long (max 1000 characters)')
  }
}

/**
 * Wait for element based on selector type
 */
export async function waitForElement(page: Page, parsed: ParsedSelector, options: WaitForOptions = {}): Promise<void> {
  const defaultOptions = {
    visible: true,
    timeout: 5000,
    ...options,
  }

  if (parsed.type === 'xpath') {
    // Use locator API for XPath (Puppeteer v24+)
    const locator = page.locator(`::-p-xpath(${parsed.selector})`)
    // setVisibility and setTimeout are the locator options
    await locator
      .setVisibility(defaultOptions.visible ? 'visible' : null)
      .setTimeout(defaultOptions.timeout!)
      .wait()
  }
  else {
    await page.waitForSelector(parsed.selector, defaultOptions)
  }
}

/**
 * Click element based on selector type
 */
export async function clickElement(page: Page, parsed: ParsedSelector): Promise<void> {
  if (parsed.type === 'xpath') {
    // Use locator API for XPath (Puppeteer v24+)
    const locator = page.locator(`::-p-xpath(${parsed.selector})`)
    await locator.click()
  }
  else {
    await page.click(parsed.selector)
  }
}

/**
 * Type into element based on selector type
 */
export async function typeIntoElement(page: Page, parsed: ParsedSelector, value: string, options: TypeOptions = {}): Promise<void> {
  if (parsed.type === 'xpath') {
    // Use locator API for XPath (Puppeteer v24+)
    const locator = page.locator(`::-p-xpath(${parsed.selector})`)

    // Clear if requested
    if (options.clear) {
      await locator.fill('')
    }

    await locator.fill(value)
  }
  else {
    // CSS selector
    if (options.clear) {
      await page.$eval(parsed.selector, (el: any) => el.value = '')
    }

    await page.type(parsed.selector, value, { delay: options.delay || 0 })
  }
}

/**
 * Get element handle based on selector type
 */
export async function getElement(page: Page, parsed: ParsedSelector): Promise<ElementHandle<Element> | null> {
  if (parsed.type === 'xpath') {
    // For XPath, use page.evaluateHandle with XPath evaluation
    // This returns the first matching element
    const element = await page.evaluateHandle((xpath: string) => {
      const result = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null,
      )
      return result.singleNodeValue
    }, parsed.selector)

    // Convert JSHandle to ElementHandle
    return element.asElement() as ElementHandle<Element> | null
  }
  else {
    return await page.$(parsed.selector)
  }
}

/**
 * Get enhanced error message for selector failures
 */
export function enhanceError(error: Error): Error {
  if (error.message.includes('waiting for selector')
    || error.message.includes('waiting for XPath')
    || error.message.includes('No node found')) {
    error.message += '\n\nTroubleshooting:\n'
      + '1. Use snapshot.js to find correct selector: bun snapshot.ts --url <url>\n'
      + '2. Try XPath selector: //button[text()="Click"] or //button[contains(text(),"Click")]\n'
      + '3. Check element is visible on page (not display:none or hidden)\n'
      + '4. Increase --timeout value: --timeout 10000\n'
      + '5. Change wait strategy: --wait-until load or --wait-until domcontentloaded'
  }
  return error
}
