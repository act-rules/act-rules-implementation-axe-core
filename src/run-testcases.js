const StaticServer = require('static-server')
const runRuleTests = require('./run-rule-tests')

const runTestcases = async (options, ruleTests, pageRunner) => {
  const { port = 1338, start = 0, size = undefined, testsDir } = options

  const server = new StaticServer({
    rootPath: testsDir,
    port
  })

  server.start()

  let i = 0;
  const results = []
  const tests = ruleTests.slice(start, start + size || undefined)

  for (let ruleTest of tests) {
    const testIndex = (start + (i + 1));
    const { ruleName, ruleId } = ruleTest[0]
    console.log(`testing #${testIndex}: ${ruleName} (${ruleId})`)
    process.stdout.write('  ')

    try {
      const ruleResults = await runRuleTests(pageRunner, ruleTest, port)
      results.push(...ruleResults)
    } catch (e) {
      console.error(e.message, e.stack)
    }
  }

  server.stop()

  return results
}

module.exports = runTestcases;