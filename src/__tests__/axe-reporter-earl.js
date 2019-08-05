const { axeReporterEarl, earlUntested } = require('./../axe-reporter-earl')
const context = require('./../context')

const rawResults = require('./data/raw-results-73f2c2.json')

describe(`axe-reporter-earl`, () => {
	describe(`axeReporterEarl fn`, () => {
		test(`get report with empty "@graph"`, () => {
			const args = { raw: [] }
			const actual = axeReporterEarl(args)
			expect(actual).toContainAllKeys(['@context', '@graph'])

			expect(actual['@context']).toBeObject()
			expect(JSON.stringify(actual['@context']) === JSON.stringify(context)).toBe(true)

			expect(actual['@graph'].length).toBe(0)
		})

		test.each(rawResults)(`assert "@graph" EARL results for  given rule raw results, %p`, rawResult => {
			const args = {
				raw: [rawResult],
				env: {
					version: '100.200.999',
				},
			}
			const actual = axeReporterEarl(args)

			expect(actual).toContainAllKeys(['@context', '@graph'])

			expect(actual['@context']).toBeObject()
			expect(JSON.stringify(actual['@context'])).toEqual(JSON.stringify(context))

			expect(actual['@graph'].length).toBe(1)

			const assertion = actual['@graph'][0]
			expect(assertion).toContainAllKeys(['@type', 'mode', 'subject', 'assertedBy', 'result', 'test'])
			expect(assertion['@type']).toBe('Assertion')
			expect(assertion['mode']).toBeOneOf([
				'earl:automatic', // note: can be extended later
			])
			expect(assertion.assertedBy).toEndWith(`${args.env.version}`)
			expect(assertion.result.outcome).toBe(`earl:${rawResult.result}`)
		})
	})

	describe(`earlUntested fn`, () => {

    test(`get assertion of untested testcase`, () => {
      const args = { url: 'http://idonot.exist', version: '100.200.999' }
      const actual = earlUntested(args)

      expect(actual).toContainAllKeys(['@context', '@graph'])

      expect(actual['@context']).toBeObject()
			expect(JSON.stringify(actual['@context'])).toEqual(JSON.stringify(context))

      expect(actual['@graph'].length).toBe(1)

      const assertion = actual['@graph'][0]
			expect(assertion).toContainAllKeys(['@type', 'mode', 'subject', 'assertedBy', 'result'])
			expect(assertion['@type']).toBe('Assertion')
			expect(assertion['mode']).toBeOneOf([
				'earl:automatic', // note: can be extended later
      ])
      expect(assertion.assertedBy).toEndWith(`${args.version}`)
      expect(assertion.result.outcome).toBe(`earl:untested`)
    })

  })

	// describe(`concatReport`, () => {
	// })
})
