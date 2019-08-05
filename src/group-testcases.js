const { readFileSync } = require('fs')

/**
 * Get testcases of ACT Rules (eg: `https://act-rules.github.io/testcases.json`) and then group the same based on ruleId
 *
 * @param {String} testsJson path to testcases json
 * @param {String} ruleId (Optional) rule id to only fetch testcases for a given rule
 */
const groupedTestcases = (testsJson, ruleId = undefined) => {
	let testcasesData
	try {
		testcasesData = readFileSync(testsJson, { encoding: 'utf-8' })
	} catch (error) {
		throw new Error(`Given JSON - ${testsJson} cannot be read`)
	}

	const { testcases } = JSON.parse(testcasesData)
	if (!testcases || !testcases.length) {
		throw new Error(`Given testcases JSON does not contain tests`)
	}

	const groupedTestcasesByRuleId = testcases.reduce((out, tc) => {
		if (!out[tc.ruleId]) {
			out[tc.ruleId] = []
		}
		out[tc.ruleId].push(tc)
		return out
	}, {})

	if (ruleId) {
		return [groupedTestcasesByRuleId[ruleId]]
	}

	return Object.values(groupedTestcasesByRuleId)
}

module.exports = groupedTestcases
