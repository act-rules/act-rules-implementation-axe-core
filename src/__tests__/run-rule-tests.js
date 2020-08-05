const runRuleTests = require('./../run-rule-tests')
const axeRunner = require('./../axe-runner')
const { setup, config } = require('./utils')

describe(`run-rule-tests`, () => {
	let tests
	let page
	let teardown

	function pageRunner(args) {
		axeRunner(page, args)
	}

	beforeAll(async () => {
		[page, tests, teardown] = await setup()
	})

	afterAll(async () => await teardown())

	test(`retrun "undefined" when given test does not have "ruleAccessibilityRequirements"`, async () => {
		const [test] = tests
		const chosenTest = {
			...test,
			ruleAccessibilityRequirements: undefined,
		}
		const results = await runRuleTests(pageRunner, [chosenTest], config.port, config.siteUrl)
		expect(results).toBeUndefined()
	})
})
