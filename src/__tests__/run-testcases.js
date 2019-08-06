const pkg = require('./../../package.json')
const runTestcases = require('../run-testcases')

describe.skip('run-testcases', () => {
	const options = {
		port: 2000,
		testsDir: `${__dirname}/data`,
		testsJson: `${__dirname}/data/testcases.json`,
		ruleId: `73f2c2`,
		siteUrl: `https://act-rules.github.io`,
	}

	test.skip(`get results`, () => {
		expect(1).toBe(1)
	})
})
