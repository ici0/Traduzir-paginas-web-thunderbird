const DEFAULTS = {
  engine: 'google',
  target: 'es'
};

let contentPort = null;
let pendingStatusResolve = null;

async function getSettings() {
  const stored = await browser.storage.local.get(DEFAULTS);
  return Object.assign({}, DEFAULTS, stored);
}

browser.runtime.onMessage.addListener(async (msg) => {
  if (msg.type === 'TOGGLE') {
    contentPort?.postMessage({ type: 'TOGGLE', engine: msg.engine, to: msg.to });
    return true;
  }
  if (msg.type === 'STATUS') {
    if (!contentPort) {
      return false;
    }
    return await new Promise(resolve => {
      pendingStatusResolve = resolve;
      contentPort.postMessage({ type: 'STATUS_REQUEST' });
    });
  }
  if (msg.type === 'GET_SETTINGS') {
    return await getSettings();
  }
  if (msg.type === 'SET_SETTINGS') {
    await browser.storage.local.set(msg.settings);
    return true;
  }
  if (msg.type === 'TRANSLATE_CHUNK') {
    return await translateTexts(msg.texts, msg.engine, msg.from || null, msg.to);
  }
});

browser.runtime.onConnect.addListener(port => {
  if (port.name === 'content') {
    contentPort = port;
    port.onDisconnect.addListener(() => { contentPort = null; });
    port.onMessage.addListener(msg => {
      if (msg.type === 'STATUS_RESPONSE' && pendingStatusResolve) {
        pendingStatusResolve(msg.translated);
        pendingStatusResolve = null;
      }
    });
  }
});

async function translateTexts(texts, engine, from, to) {
  try {
    if (engine === 'microsoft') {
      return await microsoftTranslate(texts, from, to);
    }
    return await googleTranslate(texts, from, to);
  } catch (e) {
    console.error('Translation error', e);
    throw e;
  }
}

async function googleTranslate(texts, from, to) {
  const params = new URLSearchParams({ client: 'gtx', dt: 't', sl: from || 'auto', tl: to });
  for (const t of texts) {
    params.append('q', t);
  }
  const res = await fetch('https://translate.googleapis.com/translate_a/single?' + params.toString());
  const json = await res.json();
  return json[0].map(item => item[0]);
}

async function microsoftTranslate(texts, from, to) {
  const url = 'https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=' + encodeURIComponent(to) + (from ? '&from=' + encodeURIComponent(from) : '');
  const { msKey } = await browser.storage.local.get('msKey');
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': msKey || '',
      'Ocp-Apim-Subscription-Region': 'global',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(texts.map(t => ({ Text: t })))
  });
  const json = await res.json();
  return json.map(item => item.translations[0].text);
}
