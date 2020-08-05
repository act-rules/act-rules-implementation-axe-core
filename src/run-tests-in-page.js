const puppeteer = require("puppeteer");
const runTestcases = require("./run-testcases");
const { concatReport } = require("./axe-reporter-earl");

async function runTestsInPage(program, toolRunner) {
  const { page, browser } = await startPuppeteer();
  const testResults = await runTestcases(program, testcase => {
    return toolRunner(page, testcase);
  });

  await stopPuppeteer({ page, browser });
  return concatReport(testResults);
}

async function startPuppeteer() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setBypassCSP(true);

  return { page, browser };
}

async function stopPuppeteer({ page, browser }) {
  await page.close();
  await browser.close();
}

module.exports = runTestsInPage;
