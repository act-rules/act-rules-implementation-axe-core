const { readFileSync } = require('fs')
const { AxePuppeteer } = require('axe-puppeteer')
const { axeReporterEarl, earlUntested } = require('./axe-reporter-earl')
const { version } = require('axe-core')
const axeSource = readFileSync(require.resolve('axe-core'), 'utf-8')

const ignores = [
	'Meta-refresh no delay', // TODO: Figure out why these TCs throw
]

/* Reject with a message after a certain time */
function timeoutReject(t, msg) {
	return new Promise((_, reject) => {
		setTimeout(() => reject(new Error(msg)), t)
	})
}

/**
 * Run axe-pupppeteer in a given page, with a success criterion
 */
const axeRunner = async (page, args) => {
	const { url = '', ruleSuccessCriterion: tags, ruleName, getSourceUrl } = args

	// Work out if axe knows how to test this page
	if (ignores.includes(ruleName) || url.substr(-4) === '.svg' || tags.length === 0) {
		return earlUntested({ url, version })
	}

	// Get the page and make sure it loads correctly
	await Promise.race([page.goto(url), page.waitFor('body')])

	const html = await page.$eval('html', e => e.outerHTML)

	if (html.includes('Not Found')) {
		console.log(`Not Found ${url}`)
		return earlUntested({ url, version })
	}

	// Setup axe-puppeteer with the correct SC
	const axeRunner = new AxePuppeteer(page, axeSource)
	axeRunner.options({ reporter: 'raw' })
	axeRunner.withTags(tags)

	/* Run axe and return EARL */
	async function analyze() {
		const raw = await axeRunner.analyze()
		return axeReporterEarl({
			raw,
			env: {
				url: getSourceUrl(url),
				version,
			},
		})
	}

	return Promise.race([
		// Run axe to completion
		analyze(),
		// or, timeout after 5s
		timeoutReject(5000, `Timeout for page ${url}`),
	])
}

module.exports = axeRunner
