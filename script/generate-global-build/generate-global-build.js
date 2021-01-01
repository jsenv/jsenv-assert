import { buildProject } from "@jsenv/core"
import * as jsenvConfig from "../../jsenv.config.js"

buildProject({
  ...jsenvConfig,
  format: "global",
  entryPointMap: {
    "./index.js": "./main.js",
  },
  globalName: "__jsenv_assert__",
  bundleDirectoryClean: true,
})
