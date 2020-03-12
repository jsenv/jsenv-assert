import { generateGlobalBundle } from "@jsenv/core"
import * as jsenvConfig from "../../jsenv.config.js"

generateGlobalBundle({
  ...jsenvConfig,
  globalName: "__jsenv_assert__",
  bundleDirectoryClean: true,
})
