const runTestsInPage = require('../run-tests-in-page')

describe('runTestsInPage', () => {
  const options = {
    port: 2000,
    testsDir: `${__dirname}/data`,
    testsJson: `${__dirname}/data/testcases.json`,
    ruleId: `73f2c2`,
    siteUrl: `https://act-rules.github.io`,
  }

  test('calls the callback', async () => {
    let count = 0;
    await runTestsInPage(options, () => {
      count++
      return {}
    })
    expect(count).not.toBe(0)
  })

  test('passes a page to the callback', async () => {
    await runTestsInPage(options, (page) => {
      expect(page).toHaveProperty('goto')
      expect(page).toHaveProperty('$eval')
      return {}
    })
  })

  test('passes a test case to the callback', async () => {
    await runTestsInPage(options, (_, testcase) => {
      expect(testcase).toHaveProperty('url')
      expect(testcase).toHaveProperty('ruleSuccessCriterion')
      expect(testcase).toHaveProperty('ruleId')
      expect(testcase).toHaveProperty('remoteUrl')
      return {}
    })
  })
})