const assert = require('assert')
const { writeFile } = require('fs')
const path = require('path')
const util = require('util')
const createFile = util.promisify(writeFile)
const puppeteer = require('puppeteer')
const program = require('commander')

const runTestcases = require('./run-testcases')
const axeRunner = require('./axe-runner')
const { concatReport } = require('./axe-reporter-earl')

/**
 * Init
 */
const init = async program => {
	const { testsJson, testsDir, siteUrl } = program
	/**
	 * validate options
	 */
	assert(testsJson, '`testsJson` is required')
	assert(testsDir, '`testsDir` is required')
	assert(siteUrl, '`siteUrl` is required')

	/**
	 * Start `puppeteer`
	 */
	const browser = await puppeteer.launch()
	const page = await browser.newPage()
	await page.setBypassCSP(true)

	const testResults = await runTestcases(program, args => axeRunner(page, args))

	await page.close()
	await browser.close()

	// Save EARL
	const earlResults = concatReport(testResults)
	const earlPath = path.resolve('./report.json')
	await createFile(earlPath, JSON.stringify(earlResults, null, 2), 'utf-8')
}

/**
 * Parse `args`
 */
program
	.option('-t, --testsJson <testsJson>', 'Path to JSON file containing all ACT Rules testcases')
	.option('-d, --testsDir <testsDir>', 'Directory containing ACR testcases assets and files')
	.option('-s, --siteUrl <siteUrl>', 'Url of the ACT Rules site')
	.option('-r, --ruleId [ruleId]', '(Optional) Rule Id of the testcases to execute')

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
