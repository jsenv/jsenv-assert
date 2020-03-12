import {
  executeTestPlan,
  launchChromiumTab,
  launchFirefoxTab,
  launchWebkitTab,
  launchNode,
} from "@jsenv/core"
import * as jsenvConfig from "../../jsenv.config.js"

executeTestPlan({
  ...jsenvConfig,
  testPlan: {
    "test/**/*.test.js": {
      chromium: {
        launch: launchChromiumTab,
      },
      firefox: {
        launch: launchFirefoxTab,
      },
      webkit: {
        launch: launchWebkitTab,
      },
      node: {
        launch: launchNode,
      },
    },
    "test/**/*.test.browser.js": {
      chromium: {
        launch: launchChromiumTab,
      },
      firefox: {
        launch: launchFirefoxTab,
      },
      webkit: {
        launch: launchWebkitTab,
      },
    },
    "test/**/*.test.node.js": {
      node: {
        launch: launchNode,
      },
    },
  },
  coverage: process.argv.includes("--coverage"),
  completedExecutionLogMerging: true,
})
