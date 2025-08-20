// Google translation engine adapter
// Derived from TWP project (MPL-2.0)

export async function detect(text) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url);
  const data = await res.json();
  return data[2];
}

export async function translateChunks(chunks, { from = 'auto', to }) {
  const results = [];
  for (const text of chunks) {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();
    const translated = data[0].map((seg) => seg[0]).join('');
    results.push(translated);
  }
  return results;
}
