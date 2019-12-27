const assert = require('assert')

const runRuleTests = async (pageRunner, testcases, port, siteUrl) => {
	const testResults = []

	for (const tc of testcases) {
		process.stdout.write('.')

		const { ruleAccessibilityRequirements } = tc
		if (!ruleAccessibilityRequirements) {
			return
		}

		const ruleScs = Object.keys(ruleAccessibilityRequirements)
			.filter(key => key.includes(`wcag`))
			.map(key => key.split(':').pop())
			.map(sc => 'wcag' + sc.replace(/\./g, ''))

		const { ruleId, ruleName, relativePath } = tc

		const results = await pageRunner({
			ruleId,
			ruleName,
			url: `http://127.0.0.1:${port}/${relativePath}`,
			ruleSuccessCriterion: ruleScs,
			getSourceUrl: assertionUrl => {
				if (!siteUrl) {
					return assertionUrl
				}
				return `${siteUrl}${assertionUrl.slice(assertionUrl.indexOf(`:${port}`) + 5)}`
			},
		})

		assert(typeof results === 'object', 'Expected `pageRunner` to return an object')
		testResults.push(results)
	}

	process.stdout.write('\n')

	return testResults
}

module.exports = runRuleTests
