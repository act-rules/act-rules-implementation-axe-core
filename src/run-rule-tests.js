const assert = require('assert')

const runRuleTests = async (pageRunner, testcases, port) => {
  const testResults = []

  for (const tc of testcases) {
    process.stdout.write('.');

    const { ruleName, ruleAccessibilityRequirements, relativePath } = tc

    if (!ruleAccessibilityRequirements) {
      return
    }

    const ruleScs = Object.keys(ruleAccessibilityRequirements)
      .filter(key => key.includes(`wcag`))
      .map(key => key.split(':').pop())
      .map(sc => 'wcag' + sc.replace(/\./g, ''))

    const results = await pageRunner({
      url: `http://127.0.0.1:${port}/${relativePath}`,
      ruleName,
      ruleSuccessCriterion: ruleScs
    })

    assert(typeof results === 'object', 'Expected `pageRunner` to return an object')

    testResults.push(results)
  }

  process.stdout.write('\n');
  
  return testResults
}

module.exports = runRuleTests