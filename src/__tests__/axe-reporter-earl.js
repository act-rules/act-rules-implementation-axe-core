const { axeReporterEarl } = require('./../axe-reporter-earl')
const context = require('./../context')

const rawResults = [
	[
		{
			id: 'autocomplete-valid',
			result: 'passed',
			pageLevel: false,
			impact: null,
			tags: ['cat.forms', 'wcag21aa', 'wcag135'],
			description: 'Ensure the autocomplete attribute is correct and suitable for the form field',
			help: 'autocomplete attribute must be used correctly',
			helpUrl: 'https://dequeuniversity.com/rules/axe/3.2/autocomplete-valid?application=axe-puppeteer',
			inapplicable: [],
			passes: [
				{
					any: [],
					all: [
						{
							id: 'autocomplete-valid',
							data: null,
							relatedNodes: [],
							impact: 'serious',
							message: 'the autocomplete attribute is correctly formatted',
						},
						{
							id: 'autocomplete-appropriate',
							data: null,
							relatedNodes: [],
							impact: 'serious',
							message: 'the autocomplete value is on an appropriate element',
						},
					],
					none: [],
					node: {
						_fromFrame: false,
						spec: {},
						source: '<input autocomplete="section-primary shipping work email">',
						_element: {},
					},
					impact: null,
					result: 'passed',
				},
			],
			incomplete: [],
			violations: [],
		},
	],
	[
		{
			id: 'autocomplete-valid',
			result: 'failed',
			pageLevel: false,
			impact: 'serious',
			tags: ['cat.forms', 'wcag21aa', 'wcag135'],
			description: 'Ensure the autocomplete attribute is correct and suitable for the form field',
			help: 'autocomplete attribute must be used correctly',
			helpUrl: 'https://dequeuniversity.com/rules/axe/3.2/autocomplete-valid?application=axe-puppeteer',
			inapplicable: [],
			passes: [],
			incomplete: [],
			violations: [
				{
					any: [],
					all: [
						{
							id: 'autocomplete-valid',
							data: null,
							relatedNodes: [],
							impact: 'serious',
							message: 'the autocomplete attribute is incorrectly formatted',
						},
					],
					none: [],
					node: { _fromFrame: false, spec: {}, source: '<input autocomplete="badterm">', _element: {} },
					impact: 'serious',
					result: 'failed',
				},
			],
		},
	],
]

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
			expect(assertion.assertedBy).toBe(`https://github.com/dequelabs/axe-core/releases/tag/${args.env.version}`)

			expect(assertion.result.outcome).toBe(`earl:${rawResult.result}`)
		})
	})

	describe(`earlUntested fn`, () => {})

	// describe(`concatReport`, () => {
	// })
})
