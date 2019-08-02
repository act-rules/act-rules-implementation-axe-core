const context = {
  "@vocab": "http://www.w3.org/ns/earl#",
  "earl": "http://www.w3.org/ns/earl#",
  "WCAG20": "http://www.w3.org/TR/WCAG20/#",
  "WCAG21": "http://www.w3.org/TR/WCAG21/#",
  "auto-wcag": "https://auto-wcag.github.io/auto-wcag/rules/",
  "dct": "http://purl.org/dc/terms/",
  "sch": "https://schema.org/",
  "source": "dct:source",
  "title": "dct:title",
  // Bug in the WCAG-EM Report Tool, this should have maped to earl:test
  "EMTest": "http://www.w3.org/TR/WCAG-EM/#testcase",
  "assertedBy": { "@type": "@id" },
  "outcome": { "@type": "@id" },
  "mode": { "@type": "@id" }
}

const axeTypes = [
  'passes',
  'incomplete',
  'inapplicable',
  'violations'
]

const outcomeMap = {
  passes: 'passed',
  violations: 'failed',
  incomplete: 'cantTell'
}

module.exports.axeReporterEarl = function axeReporterEarl({
  raw: ruleResults = [],
  env = {}
}) {
  const { url, version } = env;
  const graph = []

  ruleResults.forEach((ruleResult) => {
    if (ruleResult.result === 'inapplicable') {
      graph.push(earlAssertion({
        outcome: 'inapplicable',
        ruleId: ruleResult.id,
        source: url,
        version
      }))
      return
    }

    axeTypes.forEach(axeType => {
      ruleResult[axeType].forEach(() => {
        graph.push(earlAssertion({
          outcome: outcomeMap[axeType] || axeType,
          ruleId: ruleResult.id,
          source: url,
          version
        }))
      })
    })
  })

  return {
    "@context": context,
    '@graph': graph
  }
}

module.exports.earlUntested = function earlUntested({ url, version }) {
  const untestedAssertion = earlAssertion({
    source: url,
    version
  })
  return {
    "@context": context,
    '@graph': [untestedAssertion]
  }
}

module.exports.concatReport = function concatReport(testResults) {
  // Flatten the graphs into a single array
  const graphs = testResults.reduce((graph, result) => {
    return graph.concat(result['@graph'])
  }
    , [])

  return {
    "@context": context,
    // '@context': testResults[0]['@context'],
    '@graph': graphs
  }
}

function earlAssertion({
  source,
  version,
  ruleId,
  mode = 'automatic',
  outcome = 'untested'
}) {
  const assertion = {
    '@type': 'Assertion',
    mode: `earl:${mode}`,
    subject: { '@type': ['earl:TestSubject', "sch:WebPage"], source },
    assertedBy: `https://github.com/dequelabs/axe-core/releases/tag/${version}`,
    result: {
      '@type': 'TestResult',
      outcome: `earl:${outcome}`
    }
  }

  if (ruleId) {
    const minor = version.match(/[0-9]+\.[0-9]+/)[0]
    assertion.test = {
      '@type': 'TestCase',
      title: ruleId,
      '@id': `https://dequeuniversity.com/rules/axe/${minor}/${ruleId}?application=axeAPI`
    }
  }
  return assertion;
}