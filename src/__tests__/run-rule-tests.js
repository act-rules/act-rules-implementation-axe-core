const runRuleTests = require('./../run-rule-tests')
const axeRunner = require('./../axe-runner')
const context = require('./../context')
const { setup, config } = require('./utils')

describe(`run-rule-tests`, () => {
	let tests
	let page
	let teardown

	function pageRunner(args) {
		axeRunner(page, args)
	}

	beforeAll(async () => {
		;[page, tests, teardown] = await setup()
	})

	test(`retrun "undefined" when given test does not have "ruleAccessibilityRequirements"`, async () => {
		const [test] = tests
		const chosenTest = {
			...test,
			ruleAccessibilityRequirements: undefined,
		}
		const results = await runRuleTests(pageRunner, [chosenTest], config.port, config.siteUrl)
		expect(results).toBeUndefined()
	})

	/**
	 * This test is crashing puppeteer, to debug `axe-runner`
	 */
	// test(`return results for  testcase of rule "Autocomplete valid (73f2c2)"`, async () => {
	//   const [, test2] = tests
	//   const chosenTests = [
	//     test2
	//   ]

	//   const results = await runRuleTests(pageRunner, chosenTests, config.port, config.siteUrl)

	//   expect(results).toBeDefined()
	//   expect(results.length).toBeGreaterThan(1)

	//   const [result] = results;
	//   expect(result).toContainAllKeys(['@context', '@graph'])
	//   expect(result['@context']).toBeObject()
	//   expect(JSON.stringify(result['@context'])).toEqual(JSON.stringify(context))
	//   expect(result['@graph'].length).toBe(1)
	//   const assertion = result['@graph'][0]
	//   expect(assertion).toContainAllKeys(['@type', 'mode', 'subject', 'assertedBy', 'result'])
	//   expect(assertion['@type']).toBe('Assertion')
	//   expect(assertion['mode']).toBeOneOf(['earl:automatic'])
	//   expect(assertion.assertedBy).toStartWith('https://github.com/dequelabs/axe-core/releases/tag')
	//   expect(assertion.result.outcome).toStartWith(`earl:`)
	// })

	afterAll(async () => await teardown())
})
