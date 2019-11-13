const { launchChromiumToLaunchTab } = require("@jsenv/chromium-launcher")
const { launchNode } = require("@jsenv/node-launcher")

const projectPath = __dirname
exports.projectPath = projectPath

const generateTestDescription = async () => {
  const { launchChromiumTab, stop } = await launchChromiumToLaunchTab({
    projectPath,
    compileIntoRelativePath: "/.dist",
    importMapRelativePath: "/importMap.json",
  })

  const testDescription = {
    "/test/**/*.test.js": {
      browser: {
        launch: launchChromiumTab,
      },
      node: {
        launch: launchNode,
      },
    },
    "/test/**/*.browser.test.js": {
      browser: {
        launch: launchChromiumTab,
      },
      node: null,
    },
    "/test/**/*.node.test.js": {
      browser: null,
      node: {
        launch: launchNode,
      },
    },
  }

  return { testDescription, stop }
}
exports.generateTestDescription = generateTestDescription
