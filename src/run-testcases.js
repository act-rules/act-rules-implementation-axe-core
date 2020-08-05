const fs = require('fs')
const path = require('path')
const staticServer = require('static-server')

const groupedTestcases = require('./group-testcases')
const runRuleTests = require('./run-rule-tests')

const runTestcases = async (program, pageRunner) => {
	const { port = 1339, testsDir, testsJson, ruleId = undefined, siteUrl } = program
	const cacheResults = getCacheResults(program)
	const tests = groupedTestcases(testsJson, ruleId)
	const server = new staticServer({
		rootPath: testsDir,
		port,
	})

	server.start()

	const results = []
	for (let testcases of tests) {
		const { ruleName, ruleId } = testcases[0]
		console.log(`Testing: ${ruleName} (${ruleId})`)
		process.stdout.write('  ')

		const untestedCases = []
		testcases.forEach((testcase) => {
			const testcaseCache = cacheResults.filter(({ subject }) => {
				return subject.source.includes(testcase.relativePath)
			}).map(assertion => ({ '@graph': [assertion]}))

			if (testcaseCache.length > 0) {
				results.push(...testcaseCache)
			} else {
				untestedCases.push(testcase)
			}
		})
		// Show cached results
		process.stdout.write(','.repeat(testcases.length - untestedCases.length))
		
		try {
			const ruleResults = await runRuleTests(pageRunner, untestedCases, port, siteUrl)
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

function getCacheResults({ outfile }) {
	if (fs.existsSync(outfile)) {
		return require(path.resolve(outfile))['@graph']
	}
	return []
}

module.exports = runTestcases
