const { readFileSync } = require('fs')
const path = require('path')
const { AxePuppeteer } = require('axe-puppeteer')
const { axeReporterEarl, earlUntested, earlInapplicable } = require('./axe-reporter-earl')
const { version } = require('axe-core')
const axeSource = readFileSync(require.resolve('axe-core'), 'utf-8')

const ignoreRulesIds = ['bc659a']
const ignoreFileTypes = ['js']

/**
 * Run axe-pupppeteer in a given page, with a success criterion
 */
const axeRunner = async (page, { url = '', ruleSuccessCriterion: tags, ruleId, getSourceUrl }) => {
	// check if running axe should be ignored
	const extn = getFileExtension(url)
	if (ignoreRulesIds.includes(ruleId) || tags.length === 0 || (extn && ignoreFileTypes.includes(extn))) {
		return earlUntested({ url: getSourceUrl(url), version })
	}

	// Get the page and make sure it loads correctly
	await Promise.race([page.goto(url), page.waitFor('body')])

	// if given page is of type `html`, ensure it loaded
	if (extn && extn === `html`) {
		const html = await page.$eval('html', e => e.outerHTML)
		if (html.includes('Not Found')) {
			console.log(`Not Found ${url}`)
			return earlUntested({ url: getSourceUrl(url), version })
		}
	}

	// Setup axe-puppeteer with the correct SC
	const axeRunner = new AxePuppeteer(page, axeSource)
	axeRunner.options({ reporter: 'raw' })
	axeRunner.withTags(tags)

	// return
	return Promise.race([
		analyze(), // Run axe to completion
		timeoutReject(5000, `Timeout for page ${url}`), // or, timeout after 5s
	])

	/* Run axe and return EARL */
	async function analyze() {
		return axeReporterEarl({
			raw: await axeRunner.analyze(),
			env: {
				url: getSourceUrl(url),
				version,
			},
		})
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
	return path.extname(filename).slice(1);
}