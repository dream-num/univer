/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { IDocumentBody, IDocumentData, IParagraph } from '@univerjs/core';
import { BaselineOffset, BooleanNumber, DataStreamTreeTokenType } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { extractNodeStyle } from '../parse-node-style';
import { LarkPastePlugin } from '../paste-plugins/plugin-lark';
import { UniverPastePlugin } from '../paste-plugins/plugin-univer';
import { WordPastePlugin } from '../paste-plugins/plugin-word';
import parseToDom, { convertToCellStyle, generateParagraphs, getParagraphStyle } from '../utils';

function createCellDocument(dataStream: string, textRuns: IDocumentBody['textRuns']): IDocumentData {
    return {
        id: 'paste-cell-doc',
        body: {
            dataStream,
            textRuns,
        },
        documentStyle: {},
    };
}

function checkElementFilter(filter: string | string[] | ((node: HTMLElement) => boolean), node: HTMLElement): boolean {
    if (typeof filter !== 'function') {
        throw new TypeError('Expected paste plugin filter to be a function');
    }

    return filter(node);
}

describe('parseToDom', () => {
    it('parses clipboard html without retaining active content sinks', () => {
        const dom = parseToDom(`
            <style>.rich-text { color: red; }</style>
            <div onclick="alert('xss')">foo\r\n   bar</div>
            <script>window.__sheetPasteXss = true;</script>
            <table><tbody><tr><td>1</td></tr></tbody></table>
            <iframe src="https://example.com"></iframe>
        `);

        expect(dom.querySelector('style')?.textContent).toContain('.rich-text');
        expect(dom.querySelector('div')?.getAttribute('onclick')).toBeNull();
        expect(dom.querySelector('div')?.textContent).toBe('foo bar');
        expect(dom.querySelector('script')).toBeNull();
        expect(dom.querySelector('iframe')).toBeNull();
        expect(dom.querySelector('table td')?.textContent).toBe('1');
    });

    it('keeps plain pasted rows readable by normalizing multiline text nodes', () => {
        const dom = parseToDom('<table><tbody><tr><td>North\r\n\tEast</td><td>South\n    West</td></tr></tbody></table>');

        expect([...dom.querySelectorAll('td')].map((td) => td.textContent)).toEqual(['North East', 'South West']);
    });
});

describe('extractNodeStyle', () => {
    it('maps semantic rich text tags and inline styles into document text style', () => {
        const bold = document.createElement('strong');
        bold.setAttribute('style', [
            'font-family: Arial',
            'font-size: 20px',
            'font-style: italic',
            'font-weight: 700',
            'text-decoration: underline',
            'color: rgb(12, 34, 56)',
            'background-color: #ffeecc',
        ].join(';'));

        expect(extractNodeStyle(bold)).toEqual({
            bl: BooleanNumber.TRUE,
            ff: 'Arial',
            fs: 15,
            it: BooleanNumber.TRUE,
            ul: { s: BooleanNumber.TRUE },
            cl: { rgb: 'rgb(12,34,56)' },
            bg: { rgb: 'rgb(255,238,204)' },
        });
    });

    it('honors predefined style records from paste plugins', () => {
        const node = document.createElement('span');

        expect(extractNodeStyle(node, {
            'font-size': '11pt',
            'font-weight': 'bold',
            'text-decoration': 'line-through',
            color: 'not-a-color',
        })).toEqual({
            fs: 11,
            bl: BooleanNumber.TRUE,
            st: { s: BooleanNumber.TRUE },
        });
    });

    it.each([
        ['s', { st: { s: BooleanNumber.TRUE } }],
        ['u', { ul: { s: BooleanNumber.TRUE } }],
        ['i', { it: BooleanNumber.TRUE }],
        ['sup', { va: BaselineOffset.SUPERSCRIPT }],
        ['sub', { va: BaselineOffset.SUBSCRIPT }],
    ])('maps <%s> to spreadsheet text style', (tag, expected) => {
        expect(extractNodeStyle(document.createElement(tag))).toEqual(expected);
    });

    it('prefers overline when pasted text decoration asks for it', () => {
        const node = document.createElement('span');

        expect(extractNodeStyle(node, {
            'text-decoration': 'overline',
        })).toEqual({
            ol: { s: BooleanNumber.TRUE },
        });
    });
});

describe('html-to-usm text body helpers', () => {
    it('extracts paragraph spacing from pasted document blocks', () => {
        const paragraph = document.createElement('p');
        paragraph.setAttribute('style', 'margin-top: 6pt; margin-bottom: 8px; line-height: 1.4');

        expect(getParagraphStyle(paragraph)).toEqual({
            spaceAbove: { v: 8 },
            spaceBelow: { v: 8 },
            lineSpacing: 1.4,
        });
    });

    it('returns no paragraph style when pasted blocks carry no supported paragraph CSS', () => {
        const paragraph = document.createElement('p');
        paragraph.setAttribute('style', 'color: red');

        expect(getParagraphStyle(paragraph)).toBeNull();
    });

    it('creates paragraphs for every paragraph token and copies previous paragraph formatting', () => {
        const previous: IParagraph = {
            startIndex: 0,
            paragraphId: 'previous',
            bullet: { listId: 'list-1', listType: 'BULLET_LIST', nestingLevel: 0 },
            paragraphStyle: { lineSpacing: 1.25 },
        };

        const paragraphs = generateParagraphs(`A${DataStreamTreeTokenType.PARAGRAPH}B${DataStreamTreeTokenType.PARAGRAPH}`, previous);

        expect(paragraphs.map((paragraph) => ({
            startIndex: paragraph.startIndex,
            bullet: paragraph.bullet,
            paragraphStyle: paragraph.paragraphStyle,
        }))).toEqual([
            {
                startIndex: 1,
                bullet: previous.bullet,
                paragraphStyle: previous.paragraphStyle,
            },
            {
                startIndex: 3,
                bullet: previous.bullet,
                paragraphStyle: previous.paragraphStyle,
            },
        ]);
        expect(paragraphs[0].bullet).not.toBe(previous.bullet);
        expect(paragraphs[0].paragraphStyle).not.toBe(previous.paragraphStyle);
    });

    it('promotes single full-length rich text run to cell style', () => {
        const cell = {
            p: createCellDocument('Total\r', [{ st: 0, ed: 6, ts: { bl: BooleanNumber.TRUE } }]),
        };

        expect(convertToCellStyle(cell, 'Total\r', cell.p!.body!.textRuns!)).toEqual({
            p: {
                id: 'paste-cell-doc',
                body: {
                    dataStream: 'Total\r',
                    textRuns: [],
                },
                documentStyle: {},
            },
            s: { bl: BooleanNumber.TRUE },
        });
    });

    it('keeps partial rich text runs inside the document body', () => {
        const cell = {
            p: createCellDocument('Total\r', [{ st: 0, ed: 5, ts: { bl: BooleanNumber.TRUE } }]),
        };

        expect(convertToCellStyle(cell, 'Total\r', cell.p!.body!.textRuns!)).toBe(cell);
    });
});

describe('paste plugins for rich external HTML', () => {
    it('recognizes Word HTML and carries bold block paragraph spacing into the document body', () => {
        const bold = document.createElement('b');
        bold.setAttribute('style', 'font-size: 10pt; color: #336699');
        const paragraph = document.createElement('p');
        paragraph.className = 'MsoNormal';
        paragraph.setAttribute('style', 'margin-top: 3pt; margin-bottom: 5pt');
        const plainParagraph = document.createElement('p');
        plainParagraph.className = 'Normal';
        const doc: IDocumentBody = {
            dataStream: 'Heading',
            textRuns: [],
            paragraphs: [{ startIndex: 0, paragraphId: 'existing-word-paragraph' }],
        };

        WordPastePlugin.afterProcessRules[0].handler(doc, paragraph);

        expect(WordPastePlugin.checkPasteType('<!-- copied from word -->')).toBe(true);
        expect(WordPastePlugin.checkPasteType('<table><td>plain</td></table>')).toBe(false);
        expect(checkElementFilter(WordPastePlugin.afterProcessRules[0].filter, paragraph)).toBe(true);
        expect(checkElementFilter(WordPastePlugin.afterProcessRules[0].filter, plainParagraph)).toBe(false);
        expect(WordPastePlugin.stylesRules[0].getStyle(bold)).toEqual({
            bl: BooleanNumber.TRUE,
            fs: 10,
            cl: { rgb: 'rgb(51,102,153)' },
        });
        expect(doc.dataStream).toBe('Heading\r');
        expect(doc.paragraphs?.map(({ startIndex, paragraphStyle }) => ({ startIndex, paragraphStyle }))).toEqual([
            {
                startIndex: 0,
                paragraphStyle: undefined,
            },
            {
                startIndex: 7,
                paragraphStyle: {
                    spaceAbove: { v: 4 },
                    spaceBelow: { v: 6.666666666666667 },
                },
            },
        ]);
    });

    it('recognizes Lark HTML and treats deleted text plus ace lines as rich document content', () => {
        const deleted = document.createElement('s');
        deleted.setAttribute('style', 'font-weight: 700; background-color: rgb(250, 240, 230)');
        const line = document.createElement('div');
        line.className = 'ace-line';
        const plainLine = document.createElement('div');
        plainLine.className = 'plain-line';
        const doc: IDocumentBody = {
            dataStream: 'First line',
            textRuns: [],
            paragraphs: [{ startIndex: 0, paragraphId: 'existing-lark-paragraph' }],
        };

        LarkPastePlugin.afterProcessRules[0].handler(doc, line);

        expect(LarkPastePlugin.checkPasteType('<meta name="lark-record-clipboard">')).toBe(true);
        expect(LarkPastePlugin.checkPasteType('<p>plain</p>')).toBe(false);
        expect(checkElementFilter(LarkPastePlugin.afterProcessRules[0].filter, line)).toBe(true);
        expect(checkElementFilter(LarkPastePlugin.afterProcessRules[0].filter, plainLine)).toBe(false);
        expect(LarkPastePlugin.stylesRules[0].getStyle(deleted)).toEqual({
            st: { s: BooleanNumber.TRUE },
            bl: BooleanNumber.TRUE,
            bg: { rgb: 'rgb(250,240,230)' },
        });
        expect(doc.dataStream).toBe('First line\r');
        expect(doc.paragraphs?.map(({ startIndex }) => startIndex)).toEqual([0, 10]);
    });

    it('recognizes Univer HTML and preserves paragraph style on UniverNormal paragraphs', () => {
        const paragraph = document.createElement('p');
        paragraph.className = 'UniverNormal';
        paragraph.setAttribute('style', 'line-height: 1.6');
        const wordParagraph = document.createElement('p');
        wordParagraph.className = 'MsoNormal';
        const doc: IDocumentBody = {
            dataStream: 'Sheet note',
            textRuns: [],
            paragraphs: [{ startIndex: 0, paragraphId: 'existing-univer-paragraph' }],
        };

        UniverPastePlugin.afterProcessRules[0].handler(doc, paragraph);

        expect(UniverPastePlugin.checkPasteType('<p class="UniverNormal">value</p>')).toBe(true);
        expect(UniverPastePlugin.checkPasteType('<p class="MsoNormal">value</p>')).toBe(false);
        expect(checkElementFilter(UniverPastePlugin.afterProcessRules[0].filter, paragraph)).toBe(true);
        expect(checkElementFilter(UniverPastePlugin.afterProcessRules[0].filter, wordParagraph)).toBe(false);
        expect(doc.dataStream).toBe('Sheet note\r');
        expect(doc.paragraphs?.map(({ startIndex, paragraphStyle }) => ({ startIndex, paragraphStyle }))).toEqual([
            {
                startIndex: 0,
                paragraphStyle: undefined,
            },
            {
                startIndex: 10,
                paragraphStyle: {
                    lineSpacing: 1.6,
                },
            },
        ]);
    });
});
