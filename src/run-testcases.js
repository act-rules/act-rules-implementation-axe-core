const { readFileSync } = require('fs')
const staticServer = require('static-server')
const runRuleTests = require('./run-rule-tests')

const groupedTestcases = (testsJson, ruleId) => {
  const { testcases } = JSON.parse(readFileSync(testsJson, { encoding: 'utf-8' }))
  if (!testcases) {
    throw new Error(`Given testcases JSON does not contain tests`)
  }

  const groupedTestcasesByRuleId = testcases.reduce(
    (out, tc) => {
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

const runTestcases = async (options, pageRunner) => {
  const { port = 1338, testsDir, testsJson, ruleId, siteUrl } = options

  const tests = groupedTestcases(testsJson, ruleId)
  const server = new staticServer({
    rootPath: testsDir,
    port
  })

  server.start()

  const results = []
  for (let ruleTest of tests) {
    const { ruleName, ruleId } = ruleTest[0]

    console.log(`Testing: ${ruleName} (${ruleId})`)
    process.stdout.write('  ')

    try {
      const ruleResults = await runRuleTests(pageRunner, ruleTest, port, siteUrl)
      if (ruleResults && ruleResults.length > 0) {
        results.push(
          ...ruleResults
        )
      }
    } catch (e) {
      console.error(e.message, e.stack)
    }
  }
  server.stop()
  return results
}

module.exports = runTestcases;