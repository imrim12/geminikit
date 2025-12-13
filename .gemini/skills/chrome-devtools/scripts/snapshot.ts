#!/usr/bin/env bun
import type { PuppeteerLifeCycleEvent } from 'puppeteer'
import * as fs from 'node:fs/promises'
/**
 * Get DOM snapshot with selectors
 * Usage: bun snapshot.ts [--url https://example.com] [--output snapshot.json]
 */
import { closeBrowser, getBrowser, getPage, outputJSON, parseArgs } from './lib/browser.js'

async function snapshot() {
  const args = parseArgs(process.argv.slice(2))

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

    // Get interactive elements with metadata
    const elements = await page.evaluate(() => {
      const interactiveSelectors = [
        'a[href]',
        'button',
        'input',
        'textarea',
        'select',
        '[onclick]',
        '[role="button"]',
        '[role="link"]',
        '[contenteditable]',
      ]

      const elements: any[] = []
      const selector = interactiveSelectors.join(', ')
      const nodes = document.querySelectorAll(selector)

      function getXPath(element: Element): string {
        if (element.id) {
          return `//*[@id="${element.id}"]`
        }
        if (element === document.body) {
          return '/html/body'
        }
        let ix = 0
        const siblings = element.parentNode?.childNodes || []
        for (let i = 0; i < siblings.length; i++) {
          const sibling = siblings[i]
          if (sibling === element) {
            return `${getXPath(element.parentNode as Element)}/${element.tagName.toLowerCase()}[${ix + 1}]`
          }
          if (sibling.nodeType === 1 && (sibling as Element).tagName === element.tagName) {
            ix++
          }
        }
        return ''
      }

      nodes.forEach((el: any, index: number) => {
        const rect = el.getBoundingClientRect()

        // Generate unique selector
        let uniqueSelector = ''
        if (el.id) {
          uniqueSelector = `#${el.id}`
        }
        else if (el.className && typeof el.className === 'string') {
          const classes = Array.from(el.classList).join('.')
          uniqueSelector = `${el.tagName.toLowerCase()}.${classes}`
        }
        else {
          uniqueSelector = el.tagName.toLowerCase()
        }

        elements.push({
          index,
          tagName: el.tagName.toLowerCase(),
          type: el.type || null,
          id: el.id || null,
          className: el.className || null,
          name: el.name || null,
          value: el.value || null,
          text: el.textContent?.trim().substring(0, 100) || null,
          href: el.href || null,
          selector: uniqueSelector,
          xpath: getXPath(el),
          visible: rect.width > 0 && rect.height > 0,
          position: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
          },
        })
      })

      return elements
    })

    const result = {
      success: true,
      url: page.url(),
      title: await page.title(),
      elementCount: elements.length,
      elements,
    }

    if (args.output && typeof args.output === 'string') {
      await fs.writeFile(args.output, JSON.stringify(result, null, 2))
      outputJSON({
        success: true,
        output: args.output,
        elementCount: elements.length,
      })
    }
    else {
      outputJSON(result)
    }

    if (args.close !== 'false') {
      await closeBrowser()
    }
  }
  catch (error: any) {
    outputJSON({
      success: false,
      error: error.message,
      stack: error.stack,
    })
    process.exit(1)
  }
}

snapshot()
