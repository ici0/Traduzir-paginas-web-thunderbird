const EXCLUDE_SELECTOR = "blockquote[type='cite'], pre, code, kbd, samp";
const originalTextMap = new Map();

function collectTextNodes(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      const parent = node.parentElement;
      if (parent && parent.closest(EXCLUDE_SELECTOR)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  const nodes = [];
  while (walker.nextNode()) {
    nodes.push(walker.currentNode);
  }
  return nodes;
}

async function translateMessage({ engine, to }) {
  if (originalTextMap.size) return; // already translated
  const nodes = collectTextNodes(document.body);
  const texts = nodes.map((n) => n.nodeValue);
  const { chunks } = await browser.runtime.sendMessage({
    type: "translate",
    engine,
    to,
    chunks: texts
  });
  nodes.forEach((node, i) => {
    originalTextMap.set(node, node.nodeValue);
    node.nodeValue = chunks[i];
  });
}

function restoreOriginal() {
  for (const [node, text] of originalTextMap.entries()) {
    node.nodeValue = text;
  }
  originalTextMap.clear();
}

browser.runtime.onMessage.addListener((message) => {
  if (message.type === "translate") {
    translateMessage(message);
  } else if (message.type === "restore") {
    restoreOriginal();
  }
});
