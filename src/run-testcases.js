const staticServer = require('static-server')

const groupedTestcases = require('./group-testcases')
const runRuleTests = require('./run-rule-tests')

const runTestcases = async (options, pageRunner) => {
	const { port = 1339, testsDir, testsJson, ruleId = undefined, siteUrl } = options

	const tests = groupedTestcases(testsJson, ruleId)

	const server = new staticServer({
		rootPath: testsDir,
		port,
	})

	server.start()

	const results = []
	for (let ruleTest of tests) {
		const { ruleName, ruleId } = ruleTest[0]

		console.log(`Testing: ${ruleName} (${ruleId})`)
		process.stdout.write('  ')
		try {
			const ruleResults = await runRuleTests(pageRunner, ruleTest, port, siteUrl)
			if (ruleResults && ruleResults.length > 0) {
				results.push(...ruleResults)
			}
		} catch (e) {
			console.error(e.message, e.stack)
		}
	}
	server.stop()
	return results
}

module.exports = runTestcases
