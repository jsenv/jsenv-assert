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
      node: {
        launch: launchNode,
      },
    },
    "test/**/*.test.html": {
      chromium: {
        launch: launchChromiumTab,
        allocatedMs: 60 * 1000,
      },
      firefox: {
        launch: launchFirefoxTab,
        allocatedMs: 60 * 1000,
      },
      webkit: {
        launch: launchWebkitTab,
        allocatedMs: 60 * 1000,
      },
    },
  },
})
