#!/usr/bin/env node
const { ensureFile, writeJson} = require('fs-extra')
const path = require('path')
const program = require('commander')
const axeRunner = require('./axe-runner')

const runTestsInPage = require('./run-tests-in-page')

program
	.requiredOption('-t, --testsJson <testsJson>', 'Path to JSON file containing all ACT Rules testcases')
	.requiredOption('-d, --testsDir <testsDir>', 'Directory containing ACR testcases assets and files')
	.requiredOption('-s, --siteUrl <siteUrl>', 'Url of the ACT Rules site')
	.option('-o, --outfile <jsonFile>', 'Output location of the report', './report.json')
	.option('-r, --ruleId [ruleId]', '(Optional) Rule Id of the testcases to execute')
	.parse(process.argv)

writeAxeImplementationReport(program)
	.then(() => {
		console.log('Axe report generated for ACT Rules.')
		process.exit()
	})
	.catch(e => {
		console.error(e)
		process.exit(1)
	})

async function writeAxeImplementationReport(program) {
	const earlResults = await runTestsInPage(program, axeRunner)
	await saveJsonFile(program.outfile, earlResults, { spaces: 2 })

	console.log(`Created axe-core implementation report at "${program.outfile}"`)
}

async function saveJsonFile(outfile, jsonObject, options) {
	const filepath = path.resolve(outfile)
	await ensureFile(filepath)
	await writeJson(filepath, jsonObject, options)
}
