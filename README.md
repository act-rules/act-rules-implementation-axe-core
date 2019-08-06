# act-rules-implementation-axe-core

Implementation [report](./report.json) for [ACT Rules](https://github.com/act-rules/act-rules.github.io) test cases validated by [Axe](https://github.com/dequelabs/axe-core).

## Usage

```sh
node src/index.js 
  --testsJson MY_TESTS.json 
  --testsDir MY_TESTS 
  --siteUrl MY_SITE_URL
```

| Options | Description |
|---|---|
| testsJson | JSON file containting [ACT Rules testcases](https://act-rules.github.io/testcases.json) |
| testsDir | Directory containing test files and assets |
| siteUrl | URL prefix of the testcased, used to resolve assertion source correctly |
