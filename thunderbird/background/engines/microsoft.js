// Microsoft translation engine adapter
// Requires an API key stored under `microsoftApiKey` in storage.local

async function getKey() {
  const { microsoftApiKey } = await browser.storage.local.get("microsoftApiKey");
  return microsoftApiKey;
}

export async function detect(text) {
  const key = await getKey();
  if (!key) return null;
  const res = await fetch("https://api.cognitive.microsofttranslator.com/detect?api-version=3.0", {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": key,
      "Content-type": "application/json"
    },
    body: JSON.stringify([{ Text: text }])
  });
  const data = await res.json();
  return data[0]?.language;
}

export async function translateChunks(chunks, { from = 'auto', to }) {
  const key = await getKey();
  if (!key) throw new Error("Microsoft Translator API key missing");
  const results = [];
  for (const text of chunks) {
    const url = new URL("https://api.cognitive.microsofttranslator.com/translate");
    url.searchParams.set("api-version", "3.0");
    url.searchParams.set("to", to);
    if (from && from !== 'auto') {
      url.searchParams.set("from", from);
    }
    const res = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        "Content-type": "application/json"
      },
      body: JSON.stringify([{ Text: text }])
    });
    const data = await res.json();
    results.push(data[0].translations[0].text);
  }
  return results;
}
