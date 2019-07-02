/**
 * Get ACT Rules testcases
 * 
 * @method getActTestcasesGroupedByRules
 * @param {Object} testcases JSON of ACT Rules testcases 
 */
const getActTestcasesGroupedByRules = (testcases) => {
  /**
   * group testcases by ruleId
   */
  const groupedResults = testcases.reduce((out, tc) => {
    const { ruleId} = tc
    if (!out[ruleId]) {
      out[ruleId] = []
    }
    out[ruleId].push(tc)
    return out
  }, {})

  const result = Object.values(groupedResults)
  return result;
}

module.exports = getActTestcasesGroupedByRules