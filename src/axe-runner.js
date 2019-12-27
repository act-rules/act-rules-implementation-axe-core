const { readFileSync } = require('fs')
const path = require('path')
const { AxePuppeteer } = require('axe-puppeteer')
const { axeReporterEarl, earlUntested, earlInapplicable, inapplicableFileExtnensions, ignoreRulesIds } = require('./axe-reporter-earl')
const axe = require('axe-core')
const axeSource = readFileSync(require.resolve('axe-core'), 'utf-8')

/**
 * Run axe-pupppeteer in a given page, with a success criterion
 */
const axeRunner = async (page, { url = '', ruleSuccessCriterion: tags, ruleId, getSourceUrl }) => {
	// check if running axe should be ignored
	const extn = getFileExtension(url)
	const env = {
		url: getSourceUrl(url),
		version: axe.version
	}

	if (ignoreRulesIds.includes(ruleId) || tags.length === 0) {
		return earlUntested(env)
	}

	// Get the page and make sure it loads correctly
	await Promise.race([page.goto(url), page.waitFor('body')])

	// if given page is of type `html`, ensure it loaded
	if (extn === `html`) {
		const html = await page.$eval('html', e => e.outerHTML)
		if (html.includes('Not Found')) {
			console.log(`Not Found ${url}`)
			return earlUntested(env)
		}
	}

	// return
	return Promise.race([
		analyze(), // Run axe to completion
		timeoutReject(5000, `Timeout for page ${url}`), // or, timeout after 5s
	])

	/* Run axe and return EARL */
	async function analyze() {
		try {
			let raw

			// check for inapplicable file extensions
			if (inapplicableFileExtnensions.includes(extn)) {
				const axeRules = axe.getRules(tags) || []
				raw = axeRules.map(({ ruleId }) => {
					return {
						result: `inapplicable`,
						id: ruleId
					}
				})
			} else {
				// Setup axe-puppeteer with the correct SC
				const axePup = new AxePuppeteer(page, axeSource)
				axePup.options({ reporter: 'raw' })
				axePup.withTags(tags)
				raw = await axePup.analyze()
			}

			return axeReporterEarl({ raw, env })
		} catch (error) {
			console.error(error)
		}
	}
}

module.exports = axeRunner


/* Reject with a message after a certain time */
function timeoutReject(t, msg) {
	return new Promise((_, reject) => {
		setTimeout(() => reject(new Error(msg)), t)
	})
}


/**
 * Get extension from path
 * @param {String} str string of file path or url
 */
function getFileExtension(str) {
	const filename = path.basename(str);
	const extn = path.extname(filename).slice(1)
	return extn || ""
}