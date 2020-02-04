const assert = require('assert')

const runRuleTests = async (pageRunner, testcases, port, siteUrl) => {
	const testResults = []

	for (const tc of testcases) {
		process.stdout.write('.')

		const { ruleAccessibilityRequirements } = tc
		if (!ruleAccessibilityRequirements) {
			return
		}

		const tags = getWcagScs(ruleAccessibilityRequirements)
		if (hasAriaReqs(ruleAccessibilityRequirements)) {
			tags.push(`cat.aria`)
		}

		if (!tags || !tags.length) {
			continue
		}

		const { ruleId, ruleName, relativePath } = tc
		const results = await pageRunner({
			ruleId,
			ruleName,
			url: `http://127.0.0.1:${port}/${relativePath}`,
			ruleSuccessCriterion: tags,
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


/**
 * Get an array of wcag success criterion tags
 * 
 * @param {Object} accReqs accessibility requirements
 * @returns {String[]}
 */
function getWcagScs(accReqs) {
	const wcagAccReqs = Object.keys(accReqs)
		.filter(key => key.includes('wcag20') || key.includes('wcag21'))

	const ruleScs = wcagAccReqs
		.map(key => key.split(':').pop())
		.map(sc => 'wcag' + sc.replace(/\./g, ''))

	return ruleScs
}

/**
 * Check if aria is a part of the accessibility requirements
 * 
 * @param {Object} accReqs accessibility requirements
 * @returns {Boolean}
 */
function hasAriaReqs(accReqs) {
	return Object.keys(accReqs).some(key => key.includes('aria'))
}