export default function parseToDom(rawHtml: string) {
    const parser = new DOMParser();
    const html = `<x-univer id="univer-root">${rawHtml}</x-univer>`;
    const doc = parser.parseFromString(html, 'text/html');

    return doc.querySelector('#univer-root');
}
