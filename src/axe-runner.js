const { readFileSync } = require('fs')
const path = require('path')
const { AxePuppeteer } = require('axe-puppeteer')
const { axeReporterEarl, earlUntested } = require('./axe-reporter-earl')
const axe = require('axe-core')
const axeSource = readFileSync(require.resolve('axe-core'), 'utf-8')
const { rulesAxeOptions, ignoreRulesIds, inapplicableFileExtensions, manualRulesMapping } = require('./config')

/**
 * Run axe-pupppeteer in a given page, with a success criterion
 */
const axeRunner = async (page, { url = '', ruleSuccessCriterion: tags = [], ruleId, remoteUrl }) => {
	// check if running axe should be ignored
	const extn = getFileExtension(url)
	const env = {
		url: remoteUrl,
		version: axe.version
	}

	if (ignoreRulesIds.includes(ruleId) || !tags.length) {
		return earlUntested(env)
	}

	const axeRulesIds = getAxeRuleIdsToRun(tags, ruleId)
	if(!axeRulesIds.length) {
		return earlUntested(env)
	}

	// Get the page and make sure it loads correctly
	await page.goto(url, { waitUntil: 'networkidle0' });

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
		timeoutReject(50000, `Timeout for page ${url}`), // or, timeout after 5s
	])

	/* Run axe and return EARL */
	async function analyze() {
		try {
			let raw

			// check for inapplicable file extensions
			if (inapplicableFileExtensions.includes(extn)) {
				raw = axeRulesIds.map(ruleId => {
					return { result: `inapplicable`, id: ruleId }
				})
			} else {
				// Setup axe-puppeteer with the correct SC
				const options = {
					reporter: 'raw',
					runOnly: {
						type: 'rule',
						values: axeRulesIds
					},
					...rulesAxeOptions[ruleId]
				}
				raw = await new AxePuppeteer(page, axeSource)
					.options(options)
					.analyze()
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

/**
 * Get axe rules to run
 * @param {Array[]} tags tags
 * @param {String} ruleId rule id
 */
function getAxeRuleIdsToRun(tags, ruleId) {
	const axeRules = axe.getRules(tags)
	if (axeRules.length > 0) {
		return axeRules.map(axeRule => axeRule.ruleId)
	}

	return manualRulesMapping[ruleId] || []
}
