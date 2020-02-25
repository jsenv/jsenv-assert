const { executeTestPlan, launchFirefoxTab, launchNode } = require("@jsenv/core")
const jsenvConfig = require("../../jsenv.config.js")

executeTestPlan({
  ...jsenvConfig,
  testPlan: {
    "test/**/*.test.js": {
      firefox: {
        launch: launchFirefoxTab,
      },
      node: {
        launch: launchNode,
      },
    },
    "test/**/*.browser.test.js": {
      firefox: {
        launch: launchFirefoxTab,
      },
      node: null,
    },
    "test/**/*.node.test.js": {
      firefox: null,
      node: {
        launch: launchNode,
      },
    },
  },
  coverage: process.argv.includes("--coverage"),
})
