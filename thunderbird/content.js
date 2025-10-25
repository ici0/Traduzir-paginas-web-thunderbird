let translated = false;
let textNodes = [];
let originalTexts = [];
const port = browser.runtime.connect({ name: 'content' });

function getTextNodes(root) {
  const nodes = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: node => {
      if (!node.textContent.trim()) {
        return NodeFilter.FILTER_REJECT;
      }
      const parent = node.parentElement;
      if (!parent) {
        return NodeFilter.FILTER_REJECT;
      }
      if (['SCRIPT', 'STYLE'].includes(parent.tagName)) {
        return NodeFilter.FILTER_REJECT;
      }
      if (parent.closest('blockquote[type="cite"]')) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  while (walker.nextNode()) {
    nodes.push(walker.currentNode);
  }
  return nodes;
}

function chunkTexts(texts, maxLen) {
  const chunks = [];
  let current = [];
  let len = 0;
  for (const t of texts) {
    if (len + t.length > maxLen && current.length) {
      chunks.push(current);
      current = [];
      len = 0;
    }
    current.push(t);
    len += t.length;
  }
  if (current.length) {
    chunks.push(current);
  }
  return chunks;
}

async function doTranslate(engine, to) {
  textNodes = getTextNodes(document.body);
  originalTexts = textNodes.map(n => n.textContent);
  const chunks = chunkTexts(originalTexts, 4500);
  let translatedTexts = [];
  for (const chunk of chunks) {
    const res = await browser.runtime.sendMessage({
      type: 'TRANSLATE_CHUNK',
      texts: chunk,
      engine,
      to
    });
    translatedTexts = translatedTexts.concat(res);
  }
  translatedTexts.forEach((text, i) => {
    textNodes[i].textContent = text;
  });
  translated = true;
}

function restore() {
  textNodes.forEach((n, i) => {
    n.textContent = originalTexts[i];
  });
  translated = false;
}

port.onMessage.addListener(async (msg) => {
  if (msg.type === 'TOGGLE') {
    if (translated) {
      restore();
    } else {
      try {
        await doTranslate(msg.engine, msg.to);
      } catch (e) {
        console.error('translate failed', e);
        restore();
      }
    }
  } else if (msg.type === 'STATUS_REQUEST') {
    port.postMessage({ type: 'STATUS_RESPONSE', translated });
  }
});
