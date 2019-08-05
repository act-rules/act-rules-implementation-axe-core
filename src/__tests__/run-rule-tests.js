const runRuleTests = require('./../run-rule-tests')
const groupedTestcases = require('./../group-testcases')
const puppeteer = require('puppeteer')
const axeRunner = require('./../axe-runner')
const staticServer = require('static-server')

describe(`run-rule-tests`, () => {
	const port = `1338`
	const siteUrl = `act-rules.github.io`
	const testsDir = `${__dirname}/data`

	let ruleTests
	let browser
	let page
	let server

	beforeAll(async () => {
		;[ruleTests] = groupedTestcases(`${__dirname}/data/testcases.json`, '73f2c2')
		browser = await puppeteer.launch()
		page = await browser.newPage()
		server = new staticServer({
			rootPath: testsDir,
			port,
		})
		server.start()
	})

	test(`get result`, async () => {
		const result = await runRuleTests(args => axeRunner(page, args), ruleTests, port, siteUrl)
		expect(result).toBeDefined()
	})

	// todo: more assertion validation

	afterAll(async () => {
		await page.close()
		await browser.close()
		server.stop()
	})
})
