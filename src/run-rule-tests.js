const assert = require("assert");

const runRuleTests = async (pageRunner, testcases, port, siteUrl) => {
  const testResults = [];

  for (const tc of testcases) {
    process.stdout.write(".");

    const { ruleAccessibilityRequirements } = tc;
    if (!ruleAccessibilityRequirements) {
      return;
    }

    const tags = getWcagScs(ruleAccessibilityRequirements);
    if (hasAriaReqs(ruleAccessibilityRequirements)) {
      tags.push(`cat.aria`);
    }

    if (!tags || !tags.length) {
      continue;
    }

    const { ruleId, ruleName, relativePath } = tc;
    const url = `http://127.0.0.1:${port}/${relativePath}`;
    const remoteUrl = getSourceUrl({ siteUrl, url, port });

    const results = await pageRunner({
      ruleId,
      ruleName,
      url,
      remoteUrl,
      ruleSuccessCriterion: tags
    });

    assert(
      typeof results === "object",
      "Expected `pageRunner` to return an object"
    );
    testResults.push(results);
  }

  process.stdout.write("\n");

  return testResults;
};

module.exports = runRuleTests;

/**
 * Get an array of wcag success criterion tags
 *
 * @param {Object} accReqs accessibility requirements
 * @returns {String[]}
 */
function getWcagScs(accReqs) {
  const wcagAccReqs = Object.keys(accReqs).filter(
    key => key.includes("wcag20") || key.includes("wcag21")
  );

  const ruleScs = wcagAccReqs
    .map(key => key.split(":").pop())
    .map(sc => "wcag" + sc.replace(/\./g, ""));

  return ruleScs;
}

/**
 * Check if aria is a part of the accessibility requirements
 *
 * @param {Object} accReqs accessibility requirements
 * @returns {Boolean}
 */
function hasAriaReqs(accReqs) {
  return Object.keys(accReqs).some(key => key.includes("aria"));
}

function getSourceUrl({ siteUrl, url, port }) {
  if (!siteUrl) {
    return url;
  }
  return `${siteUrl}${url.slice(url.indexOf(`:${port}`) + 5)}`;
}
