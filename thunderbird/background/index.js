import { getEngine } from "./engines/index.js";

browser.runtime.onMessage.addListener(async (message, sender) => {
  switch (message.type) {
    case "translate": {
      const { engine: engineName = "google", chunks, from = "auto", to } = message;
      const engine = getEngine(engineName);
      const translated = await engine.translateChunks(chunks, { from, to });
      return { chunks: translated };
    }
    case "detect": {
      const { engine: engineName = "google", text } = message;
      const engine = getEngine(engineName);
      const lang = await engine.detect(text);
      return { lang };
    }
    default:
      break;
  }
});
