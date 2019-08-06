const staticServer = require('static-server')
const puppeteer = require('puppeteer')
const groupedTestcases = require('./../group-testcases')

const config = {
	testRuleId: `73f2c2`,
	testRuleName: `Autocomplete valid`,
	port: `1339`,
	siteUrl: `act-rules.github.io`,
	testsDir: `${__dirname}/data`,
	testsJson: `${__dirname}/data/testcases.json`,
}

const setup = async () => {
	const [tests] = groupedTestcases(config.testsJson, config.testRuleId)
	const browser = await puppeteer.launch({
		args: ['--single-process'],
	})
	const page = await browser.newPage()
	await page.setBypassCSP(true)

	const server = new staticServer({
		rootPath: config.testsDir,
		port: config.port,
	})
	server.start()

	const teardown = async () => {
		await page.close()
		await browser.close()
		server.stop()
	}

	return [page, tests, teardown]
}

module.exports = {
	config,
	setup,
}
