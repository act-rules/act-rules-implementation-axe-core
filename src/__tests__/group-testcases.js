const groupedTestcases = require('./../group-testcases')

describe(`group-testcases`, () => {
  test(`throws if given 'testcases' json file path cannot be read/ parsed`, () => {
    expect(() => {
      groupedTestcases(__dirname + '/data/do-not-exist.json')
    }).toThrow()
  })

  test(`throws if given 'testcases' json has 0 testcases`, () => {
    expect(() => {
      groupedTestcases(__dirname + '/data/empty-testcases.json')
    }).toThrow()
  })

  const allResults = groupedTestcases(__dirname + '/data/testcases.json')
  test(`get all testcases that are grouped`, () => {
    expect(allResults).toBeDefined();
    expect(allResults.length).toBeGreaterThan(1)
  })

  test.each(allResults)('has only testcases of the rule: %p', (ruleTestcases) => {
    const { url, ruleId } = ruleTestcases
    expect(url.includes(ruleId))
  })

  const [ruleIdResults] = groupedTestcases(__dirname + '/data/testcases.json', '6cfa84')
  test(`get testcases that are grouped by specified 'ruleId'`, () => {
    expect(ruleIdResults).toBeDefined();
    expect(ruleIdResults.length).toBeGreaterThan(1);
  })

  test.each(ruleIdResults)
    ('has only testcases of the rule `6cfa84`', (ruleTestcases) => {
      const { url, ruleId } = ruleTestcases
      expect(url.includes(ruleId))
    })
})