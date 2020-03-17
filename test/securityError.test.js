import { addWellKnownComposite } from "../src/internal/wellKnownValue.js"

if (typeof window === "object") {
  const iframe = document.createElement("iframe")
  iframe.setAttribute("sandbox", "")
  document.body.appendChild(iframe)
  try {
    addWellKnownComposite(iframe.contentWindow)
  } finally {
    document.body.removeChild(iframe)
  }
}
