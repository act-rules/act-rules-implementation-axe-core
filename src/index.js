const { readFileSync, writeFile } = require('fs')
const path = require('path')
const util = require('util')
const createFile = util.promisify(writeFile)
const program = require('commander')
const puppeteer = require('puppeteer')
const getActTestcasesGroupedByRules = require('./get-act-testcases-grouped-by-rules')
const runTestcases = require('./run-testcases')
const axeRunner = require('./axe-runner')
const { concatReport } = require('./axe-reporter-earl')

/**
 * Setup
 */
const args = process.argv.slice(2)
const start = +args[0] || 0
const size = +args[1] || (start ? 1 : undefined)

/**
 * Init
 */
const init = async ({ testsJson, testsDir }) => {
  const options = { start, size, testsDir }

  /**
   * Get testcases of ACT Rules
   */
  const { testcases } = JSON.parse(readFileSync(testsJson, { encoding: 'utf-8' }))
  const testcasesGroups = getActTestcasesGroupedByRules(testcases)

  /**
   * Start `puppeteer`
   */
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.setBypassCSP(true)

  const testResults = await runTestcases(options, testcasesGroups, (args) => {
    return axeRunner(page, args)
  })

  await page.close()
  await browser.close()

  console.log(testResults);

  // Save EARL
  const earlResults = concatReport(testResults)
  const earlPath = path.resolve('./report.json')
  await createFile(earlPath, JSON.stringify(earlResults, null, 2), 'utf-8')
}

/**
 * Parse `args`
 */
program
  .option(
    '-t, --testsJson <testsJson>',
    'Path to JSON file containing all ACT Rules testcases'
  )
  .option(
    '-d, --testsDir <testsDir>',
    'Directory containing ACR testcases assets and files'
  )
  .parse(process.argv)

/**
 * Invoke
 */
init(program)
  .then(() => console.log('Axe report generated for ACT Rules.'))
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
