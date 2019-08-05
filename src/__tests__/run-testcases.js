const pkg = require('./../../package.json')
const runTestcases = require('./../run-testcases')

describe('run-testcases', () => {
	const options = {
		port: 2000,
		testsDir: `${__dirname}/data`,
		testsJson: `${__dirname}/data/testcases.json`,
		ruleId: `73f2c2`,
		siteUrl: `https://act-rules.github.io`,
	}

	const pageRunner = () => {}

	test(`get results`, () => {
		const result = runTestcases(options, pageRunner)
	})
})
