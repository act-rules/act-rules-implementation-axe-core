/**
 * List of rule id(s) to ignore running axe-core against
 */
const ignoreRulesIds = [
  /**
   * Rule: meta element has no refresh delay
   * Url: https://act-rules.github.io/rules/bc659a
   *  - This is ignored from generating a mapping in axe-core
   */
  'bc659a'
]

module.exports = ignoreRulesIds