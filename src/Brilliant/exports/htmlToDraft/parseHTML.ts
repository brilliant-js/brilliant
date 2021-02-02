const fallback = (html: string) => {
  const doc = document.implementation.createHTMLDocument('');
  doc.documentElement.innerHTML = html as any;
  return doc;
};

export default function parseHTML(html: string): Document | HTMLElement {
  let doc: Document;
  if (typeof DOMParser !== 'undefined') {
    const parser = new DOMParser();
    doc = parser.parseFromString(html, 'text/html');
    if (doc === null || doc.body === null) {
      doc = fallback(html);
    }
  } else {
    doc = fallback(html);
  }
  return doc.body;
}
