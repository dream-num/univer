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

import type { IDocumentBody, Nullable } from '@univerjs/core';
import { BooleanNumber } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { HtmlToUDMService } from '../html-to-udm/converter';
import PastePluginLark from '../html-to-udm/paste-plugins/plugin-lark';
import PastePluginWord from '../html-to-udm/paste-plugins/plugin-word';
import { createInternalClipboardFragment, embedInternalClipboardFragment, extractInternalClipboardFragmentFromHtml, wrapClipboardHtml } from '../internal-fragment';
import { UDMToHtmlService } from '../udm-to-html/convertor';

HtmlToUDMService.use(PastePluginWord);
HtmlToUDMService.use(PastePluginLark);

describe('test case in html and udm convert', () => {
    let body: Nullable<IDocumentBody> = null;
    let html: string = '';

    beforeEach(() => {
        body = {
            dataStream: 'helloworld',
            textRuns: [
                {
                    st: 0,
                    ed: 5,
                    ts: {
                        bl: BooleanNumber.TRUE,
                    },
                },
                {
                    st: 5,
                    ed: 10,
                    ts: {
                        bl: BooleanNumber.TRUE,
                        it: BooleanNumber.TRUE,
                    },
                },
            ],
        };

        html = `<p
  class="MsoNormal"
  align="left"
  style="
    margin: 16.8pt 0cm 0cm;
    text-align: left;
    font-size: 10.5pt;
    font-family: DengXian;
    color: rgb(0, 0, 0);
    font-style: normal;
    font-variant-ligatures: normal;
    font-variant-caps: normal;
    font-weight: 400;
    letter-spacing: normal;
    orphans: 2;
    text-indent: 0px;
    text-transform: none;
    widows: 2;
    word-spacing: 0px;
    -webkit-text-stroke-width: 0px;
    white-space: normal;
    text-decoration-thickness: initial;
    text-decoration-style: initial;
    text-decoration-color: initial;
    background: white;
  "
><span style="font-size: 12pt; font-family: 宋体; color: rgb(18, 18, 18)"
    >hello</span
  ></p>
<span
  style="
    font-style: normal;
    font-variant-ligatures: normal;
    font-variant-caps: normal;
    font-weight: 400;
    letter-spacing: normal;
    orphans: 2;
    text-align: start;
    text-indent: 0px;
    text-transform: none;
    widows: 2;
    word-spacing: 0px;
    -webkit-text-stroke-width: 0px;
    white-space: normal;
    text-decoration-thickness: initial;
    text-decoration-style: initial;
    text-decoration-color: initial;
    font-size: 12pt;
    font-family: 宋体;
    color: rgb(18, 18, 18);
  "
>world</span>`;
    });

    afterEach(() => {
        body = null;
        html = '';
    });

    describe('test cases in html-to-udm', () => {
        it('should paste the case when convert html to udm', async () => {
            const convertor = new HtmlToUDMService();
            const udm = await convertor.convert(html);

            expect(udm.body!.dataStream).toBe('hello\rworld');
        });

        it('should parse semantic html blocks and lists to udm metadata', () => {
            const convertor = new HtmlToUDMService();
            const udm = convertor.convert(`
                <blockquote><p>Quote text</p></blockquote>
                <pre><code>const a = 1;</code></pre>
                <aside role="note" data-doc-type="callout"><p>💡 Callout text</p></aside>
                <ol><li>First</li><li>Second</li></ol>
            `);

            expect(udm.body?.blockRanges?.map((range) => range.blockType)).toEqual(['quote', 'code', 'callout']);
            expect(udm.body?.paragraphs?.filter((paragraph) => paragraph.bullet).map((paragraph) => paragraph.bullet?.listType)).toEqual(['ORDER_LIST', 'ORDER_LIST']);
            expect(udm.body?.dataStream).toContain('Quote text\r');
            expect(udm.body?.dataStream).toContain('const a = 1;\r');
        });

        it('should normalize word and wps mso lists to real list paragraphs', () => {
            const convertor = new HtmlToUDMService();
            const udm = convertor.convert(`
                <p class="MsoListParagraph" style="mso-list:l0 level1 lfo1">1. Alpha</p>
                <p class="MsoListParagraph" style="mso-list:l0 level2 lfo1">a. Nested</p>
            `);

            expect(udm.body?.dataStream).toBe('Alpha\rNested\r');
            expect(udm.body?.paragraphs?.map((paragraph) => paragraph.bullet?.nestingLevel)).toEqual([0, 1]);
        });
    });

    describe('test cases in udm-to-html', () => {
        it('should paste the case when convert udm to html', async () => {
            const convertor = new UDMToHtmlService();
            const html = await convertor.convert([{ body: body!, id: '', documentStyle: {} }]);

            expect(html).toBe('<p class="UniverNormal" ><strong>hello</strong><strong><i>world</i></strong></p>');
        });

        it('should serialize structured doc metadata as semantic clipboard html', () => {
            const convertor = new UDMToHtmlService();
            const html = convertor.convert([{
                id: '',
                documentStyle: {},
                body: {
                    dataStream: 'Quote\rCode\rCallout\rItem\r',
                    blockRanges: [
                        { blockId: 'quote-1', blockType: 'quote', startIndex: 0, endIndex: 5 },
                        { blockId: 'code-1', blockType: 'code', startIndex: 6, endIndex: 10 },
                        { blockId: 'callout-1', blockType: 'callout', startIndex: 11, endIndex: 18 },
                    ],
                    paragraphs: [
                        { startIndex: 5 },
                        { startIndex: 10 },
                        { startIndex: 18 },
                        { startIndex: 23, bullet: { listId: 'list-1', listType: 'ORDER_LIST', nestingLevel: 0 } },
                    ],
                },
            }]);

            expect(html).toContain('data-doc-type="quote"');
            expect(html).toContain('data-doc-type="code-block"');
            expect(html).toContain('data-doc-type="callout"');
            expect(html).toContain('data-doc-type="ordered-list"');
        });

        it('should serialize adjacent and nested list paragraphs as one semantic list tree', () => {
            const convertor = new UDMToHtmlService();
            const html = convertor.convert([{
                id: '',
                documentStyle: {},
                body: {
                    dataStream: 'One\rNested\rTwo\r',
                    paragraphs: [
                        { startIndex: 3, bullet: { listId: 'list-1', listType: 'ORDER_LIST', nestingLevel: 0 } },
                        { startIndex: 10, bullet: { listId: 'list-1', listType: 'BULLET_LIST', nestingLevel: 1 } },
                        { startIndex: 14, bullet: { listId: 'list-1', listType: 'ORDER_LIST', nestingLevel: 0 } },
                    ],
                },
            }]);

            expect(html.match(/data-doc-type="ordered-list"/g)?.length).toBe(1);
            expect(html.match(/data-doc-type="bullet-list"/g)?.length).toBe(1);
            expect(html).toContain('<li><p class="UniverNormal" >One</p><ul');
            expect(html).toContain('</ul></li><li><p class="UniverNormal" >Two</p>');
        });

        it('should embed and extract an internal clipboard fragment through html', () => {
            const fragment = createInternalClipboardFragment({
                body: {
                    dataStream: 'Internal\r',
                    paragraphs: [{ startIndex: 8 }],
                },
            });
            const html = wrapClipboardHtml(embedInternalClipboardFragment('<p>Internal</p>', fragment));

            expect(html).toContain('StartFragment');
            expect(extractInternalClipboardFragmentFromHtml(html)?.body?.dataStream).toBe('Internal\r');
        });
    });
});
