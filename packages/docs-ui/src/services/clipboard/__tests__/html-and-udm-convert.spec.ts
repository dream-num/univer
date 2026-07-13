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

import type { IDocumentBody, IDocumentData, Nullable } from '@univerjs/core';
import {
    BaselineOffset,
    BooleanNumber,
    CustomDecorationType,
    CustomRangeType,
    DataStreamTreeTokenType,
    DocumentBlockRangeType,
    DrawingTypeEnum,
    HorizontalAlign,
    PresetListType,
    TableSizeType,
} from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CopyContentCache, extractId } from '../copy-content-cache';
import { HtmlToUDMService } from '../html-to-udm/converter';
import { extractNodeStyle } from '../html-to-udm/parse-node-style';
import PastePluginLark from '../html-to-udm/paste-plugins/plugin-lark';
import PastePluginUniver from '../html-to-udm/paste-plugins/plugin-univer';
import PastePluginWord from '../html-to-udm/paste-plugins/plugin-word';
import {
    createInternalClipboardDocData,
    createInternalClipboardDocDataList,
    createInternalClipboardFragment,
    embedInternalClipboardFragment,
    extractInternalClipboardFragmentFromHtml,
    parseInternalClipboardFragment,
    wrapClipboardHtml,
} from '../internal-fragment';
import { covertTextRunToHtml, getBodySliceHtml, UDMToHtmlService } from '../udm-to-html/convertor';

HtmlToUDMService.use(PastePluginWord);
HtmlToUDMService.use(PastePluginLark);
HtmlToUDMService.use(PastePluginUniver);

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

            expect(udm.body?.blockRanges?.map((range) => range.blockType)).toEqual([
                DocumentBlockRangeType.QUOTE,
                DocumentBlockRangeType.CODE,
                DocumentBlockRangeType.CALLOUT,
            ]);
            expect(udm.body?.paragraphs?.filter((paragraph) => paragraph.bullet).map((paragraph) => paragraph.bullet?.listType)).toEqual(['ORDER_LIST', 'ORDER_LIST']);
            expect(udm.body?.dataStream).toContain('Quote text\r');
            expect(udm.body?.dataStream).toContain('const a = 1;\r');
        });

        it('should normalize word and wps mso lists to real list paragraphs', () => {
            const convertor = new HtmlToUDMService();
            const udm = convertor.convert(`
                <p class="MsoListParagraph" style="mso-list:l0 level1 lfo1">1) Alpha</p>
                <p class="MsoListParagraph" style="mso-list:l0 level2 lfo1">a. Nested</p>
            `);

            expect(udm.body?.dataStream).toBe('Alpha\rNested\r');
            expect(udm.body?.paragraphs?.map((paragraph) => paragraph.bullet?.nestingLevel)).toEqual([0, 1]);
        });

        it('should preserve Word tab and nbsp separators between inline runs', () => {
            const convertor = new HtmlToUDMService();
            const udm = convertor.convert(`
                <p class="MsoNormal">
                    <span>Nové místo</span>\t   <span>Plasy</span>&nbsp;&nbsp;&nbsp;<span>parkoviště u lékařského domu</span>
                </p>
            `);

            expect(udm.body?.dataStream).toBe('Nové místo Plasy parkoviště u lékařského domu\r');
        });

        it('should preserve Word mso spacer and tab runs', () => {
            const convertor = new HtmlToUDMService();
            const udm = convertor.convert('<p class="MsoNormal"><span>New</span><span style="mso-spacerun:yes">&nbsp;&nbsp;&nbsp;</span><span>place</span><span style="mso-tab-count:1">&nbsp;&nbsp;&nbsp;&nbsp;</span><span>Plasy</span></p>');

            expect(udm.body?.dataStream).toBe('New   place    Plasy\r');
        });

        it('should paste base64 images from Word-compatible HTML as inline drawings', () => {
            const convertor = new HtmlToUDMService();
            const source = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAFgwJ/lz6N4wAAAABJRU5ErkJggg==';
            const udm = convertor.convert(`<p>Before</p><p><img src="${source}" data-width="320" data-height="180"></p>`);
            const block = udm.body?.customBlocks?.[0];
            const drawing = block ? udm.drawings?.[block.blockId] : undefined;

            expect(block).toBeTruthy();
            expect(drawing).toMatchObject({
                imageSourceType: 'BASE64',
                source,
                transform: { width: 320, height: 180 },
            });
        });

        it('should read raw Word image dimensions from html attributes', () => {
            const convertor = new HtmlToUDMService();
            const source = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAFgwJ/lz6N4wAAAABJRU5ErkJggg==';
            const udm = convertor.convert(`<p class="MsoNormal"><img width="611" height="453" src="${source}"></p>`);
            const block = udm.body?.customBlocks?.[0];
            const drawing = block ? udm.drawings?.[block.blockId] : undefined;

            expect(drawing).toMatchObject({
                transform: { width: 611, height: 453 },
                docTransform: { size: { width: 611, height: 453 } },
            });
        });

        it('should preserve Word table structure, cell styles, lists, and paragraph alignment', () => {
            const convertor = new HtmlToUDMService();
            const udm = convertor.convert(`
                <table class="MsoTableGrid">
                    <colgroup><col style="width: 120pt"><col style="width: 80px"></colgroup>
                    <tr style="height: 24pt">
                        <td colspan="2" style="background:#D9EAF7;border:solid #4472C4 1.5pt">
                            <p style="text-align:center">Merged Header</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color:#FFF2CC;border:1px solid #70AD47">
                            <ul><li>Bullet in cell</li></ul>
                        </td>
                        <td><p>Plain cell</p></td>
                    </tr>
                </table>
            `);
            const tableId = udm.body?.tables?.[0].tableId;
            const table = tableId ? udm.tableSource?.[tableId] : undefined;

            expect(table?.tableColumns.map((column) => column.size.width.v)).toEqual([160, 80]);
            expect(table?.tableRows[0].trHeight.val.v).toBe(32);
            expect(table?.tableRows[0].tableCells[0]).toMatchObject({
                columnSpan: 2,
                backgroundColor: { rgb: 'rgb(217,234,247)' },
                borderTop: { color: { rgb: 'rgb(68,114,196)' }, width: { v: 2 } },
            });
            expect(table?.tableRows[0].tableCells[1]).toMatchObject({ rowSpan: 0, columnSpan: 0 });
            expect(table?.tableRows[1].tableCells[0].backgroundColor?.rgb).toBe('rgb(255,242,204)');
            const headerEnd = (udm.body?.dataStream.indexOf('Merged Header') ?? 0) + 'Merged Header'.length;
            expect(udm.body?.paragraphs?.find((paragraph) => paragraph.startIndex === headerEnd)?.paragraphStyle?.horizontalAlign).toBe(HorizontalAlign.CENTER);
            expect(udm.body?.paragraphs?.some((paragraph) => paragraph.bullet && udm.body?.dataStream.includes('Bullet in cell'))).toBe(true);
        });

        it('should distribute table width when clipboard html has no per-column widths', () => {
            const convertor = new HtmlToUDMService();
            const udm = convertor.convert(`
                <table class="MsoNormalTable UniverTable" style="border-collapse: collapse; width: 960px"><tbody>
                    <tr style="height: 38px">
                        <td colspan="4" style="background-color: rgb(236, 254, 255); border-top-width: 1px; border-top-style: solid; border-top-color: rgb(203, 213, 225); border-right-width: 1px; border-right-style: solid; border-right-color: rgb(203, 213, 225); border-bottom-width: 1px; border-bottom-style: solid; border-bottom-color: rgb(203, 213, 225); border-left-width: 1px; border-left-style: solid; border-left-color: rgb(203, 213, 225)">
                            <p class="UniverNormal" style="text-align: center; font-family: Arial; font-size: 12pt; font-weight: bold"><strong>Layout and pagination sample</strong></p>
                        </td>
                    </tr>
                    <tr style="height: 32px">
                        <td class="UniverTableCell" style="background-color: rgb(240, 253, 250); border-top-width: 1px; border-top-style: solid; border-top-color: rgb(203, 213, 225); border-right-width: 1px; border-right-style: solid; border-right-color: rgb(203, 213, 225); border-bottom-width: 1px; border-bottom-style: solid; border-bottom-color: rgb(203, 213, 225); border-left-width: 1px; border-left-style: solid; border-left-color: rgb(203, 213, 225)"><p>Section</p></td>
                        <td class="UniverTableCell" style="background-color: rgb(240, 253, 250); border-top-width: 1px; border-top-style: solid; border-top-color: rgb(203, 213, 225); border-right-width: 1px; border-right-style: solid; border-right-color: rgb(203, 213, 225); border-bottom-width: 1px; border-bottom-style: solid; border-bottom-color: rgb(203, 213, 225); border-left-width: 1px; border-left-style: solid; border-left-color: rgb(203, 213, 225)"><p>Signal</p></td>
                        <td class="UniverTableCell" style="background-color: rgb(240, 253, 250); border-top-width: 1px; border-top-style: solid; border-top-color: rgb(203, 213, 225); border-right-width: 1px; border-right-style: solid; border-right-color: rgb(203, 213, 225); border-bottom-width: 1px; border-bottom-style: solid; border-bottom-color: rgb(203, 213, 225); border-left-width: 1px; border-left-style: solid; border-left-color: rgb(203, 213, 225)"><p>Details</p></td>
                        <td class="UniverTableCell" style="background-color: rgb(240, 253, 250); border-top-width: 1px; border-top-style: solid; border-top-color: rgb(203, 213, 225); border-right-width: 1px; border-right-style: solid; border-right-color: rgb(203, 213, 225); border-bottom-width: 1px; border-bottom-style: solid; border-bottom-color: rgb(203, 213, 225); border-left-width: 1px; border-left-style: solid; border-left-color: rgb(203, 213, 225)"><p>Expected behavior</p></td>
                    </tr>
                </tbody></table>
            `);
            const tableId = udm.body?.tables?.[0].tableId;
            const table = tableId ? udm.tableSource?.[tableId] : undefined;
            const titleCell = table?.tableRows[0].tableCells[0];

            expect(table?.size.width.v).toBe(960);
            expect(table?.tableColumns.map((column) => column.size.width.v)).toEqual([240, 240, 240, 240]);
            expect(table?.tableRows[0].trHeight.val.v).toBe(38);
            expect(titleCell?.columnSpan).toBe(4);
            expect(titleCell?.backgroundColor?.rgb).toBe('rgb(236,254,255)');
            expect(titleCell?.borderTop?.width?.v).toBe(1);
            expect(titleCell?.borderTop?.color.rgb).toBe('rgb(203,213,225)');
        });

        it('should paste Univer exported paragraphs with paragraph styles', () => {
            const convertor = new HtmlToUDMService();
            const udm = convertor.convert(`
                <p class="UniverNormal" style="text-align: center; margin-top: 6px; margin-bottom: 12px; line-height: 150%;">Title</p>
                <p class="UniverNormal">Body</p>
            `);
            const firstParagraph = udm.body?.paragraphs?.[0];
            const secondParagraph = udm.body?.paragraphs?.[1];

            expect(udm.body?.dataStream).toBe('Title\rBody\r');
            expect(firstParagraph?.startIndex).toBe(5);
            expect(firstParagraph?.paragraphStyle).toMatchObject({
                horizontalAlign: HorizontalAlign.CENTER,
                spaceAbove: { v: 6 },
                spaceBelow: { v: 12 },
                lineSpacing: 1.5,
            });
            expect(secondParagraph?.startIndex).toBe(10);
        });

        it('should paste Lark deleted text as strike-through rich text', () => {
            const convertor = new HtmlToUDMService();
            const udm = convertor.convert(`
                <meta name="lark-record-clipboard" content="1">
                <div class="ace-line">Keep <s style="color: #C81E1E;">deleted</s></div>
            `);
            const deletedRun = udm.body?.textRuns?.find((run) => udm.body?.dataStream.slice(run.st, run.ed) === 'deleted');

            expect(udm.body?.dataStream).toBe('Keep deleted\r');
            expect(deletedRun?.ts).toMatchObject({
                st: { s: BooleanNumber.TRUE },
                cl: { rgb: 'rgb(200,30,30)' },
            });
            expect(udm.body?.paragraphs?.[0].startIndex).toBe(12);
        });

        it('should read inline css styles used by copied rich text', () => {
            const span = document.createElement('span');
            span.setAttribute('style', 'font-family: "Inter"; font-size: 16px; font-weight: 700; font-style: italic; text-decoration: overline; background-color: rgb(240, 240, 10);');

            expect(extractNodeStyle(span)).toMatchObject({
                ff: 'Inter',
                fs: 12,
                bl: BooleanNumber.TRUE,
                it: BooleanNumber.TRUE,
                ol: { s: BooleanNumber.TRUE },
                bg: { rgb: 'rgb(240,240,10)' },
            });
        });
    });

    describe('test cases in udm-to-html', () => {
        it('should paste the case when convert udm to html', async () => {
            const convertor = new UDMToHtmlService();
            const html = await convertor.convert([{ body: body!, id: '', documentStyle: {} }]);

            expect(html).toBe('<p class="UniverNormal" ><span style="font-family: Arial;"><strong>hello</strong></span><span style="font-family: Arial;"><strong><i>world</i></strong></span></p>');
        });

        it('should serialize structured doc metadata as semantic clipboard html', () => {
            const convertor = new UDMToHtmlService();
            const html = convertor.convert([{
                id: '',
                documentStyle: {},
                body: {
                    dataStream: 'Quote\rCode\rCallout\rItem\r',
                    blockRanges: [
                        { blockId: 'quote-1', blockType: DocumentBlockRangeType.QUOTE, startIndex: 0, endIndex: 5 },
                        { blockId: 'code-1', blockType: DocumentBlockRangeType.CODE, startIndex: 6, endIndex: 10 },
                        { blockId: 'callout-1', blockType: DocumentBlockRangeType.CALLOUT, startIndex: 11, endIndex: 18 },
                    ],
                    paragraphs: [
                        { paragraphId: 'para_docs_ui_fixture_50', startIndex: 5 },
                        { paragraphId: 'para_docs_ui_fixture_51', startIndex: 10 },
                        { paragraphId: 'para_docs_ui_fixture_52', startIndex: 18 },
                        { paragraphId: 'para_docs_ui_fixture_53', startIndex: 23, bullet: { listId: 'list-1', listType: 'ORDER_LIST', nestingLevel: 0 } },
                    ],
                },
            }]);

            expect(html).toContain('data-doc-type="quote"');
            expect(html).toContain('data-doc-type="code-block"');
            expect(html).toContain('data-doc-type="callout"');
            expect(html).toContain('data-doc-type="ordered-list"');
        });

        it('should serialize table spans and cell formatting to Word-compatible HTML', () => {
            const convertor = new UDMToHtmlService();
            const dataStream = [
                DataStreamTreeTokenType.TABLE_START,
                DataStreamTreeTokenType.TABLE_ROW_START,
                DataStreamTreeTokenType.TABLE_CELL_START,
                'Merged\r\n',
                DataStreamTreeTokenType.TABLE_CELL_END,
                DataStreamTreeTokenType.TABLE_CELL_START,
                '\r\n',
                DataStreamTreeTokenType.TABLE_CELL_END,
                DataStreamTreeTokenType.TABLE_ROW_END,
                DataStreamTreeTokenType.TABLE_ROW_START,
                DataStreamTreeTokenType.TABLE_CELL_START,
                'A2\r\n',
                DataStreamTreeTokenType.TABLE_CELL_END,
                DataStreamTreeTokenType.TABLE_CELL_START,
                'B2\r\n',
                DataStreamTreeTokenType.TABLE_CELL_END,
                DataStreamTreeTokenType.TABLE_ROW_END,
                DataStreamTreeTokenType.TABLE_END,
            ].join('');
            const html = convertor.convert([{
                id: '',
                documentStyle: {},
                body: {
                    dataStream,
                    tables: [{ startIndex: 0, endIndex: dataStream.length, tableId: 'table-1' }],
                    paragraphs: [
                        { paragraphId: 'para_docs_ui_fixture_54', startIndex: 9, paragraphStyle: { horizontalAlign: HorizontalAlign.CENTER } },
                        { paragraphId: 'para_docs_ui_fixture_55', startIndex: 13 },
                        { paragraphId: 'para_docs_ui_fixture_56', startIndex: 21 },
                        { paragraphId: 'para_docs_ui_fixture_57', startIndex: 27 },
                    ],
                    sectionBreaks: [
                        { sectionId: 'section_html_1', startIndex: 10 },
                        { sectionId: 'section_html_2', startIndex: 14 },
                        { sectionId: 'section_html_3', startIndex: 22 },
                        { sectionId: 'section_html_4', startIndex: 28 },
                    ],
                },
                tableSource: {
                    'table-1': {
                        tableId: 'table-1',
                        tableColumns: [
                            { size: { type: 1, width: { v: 120 } } },
                            { size: { type: 1, width: { v: 80 } } },
                        ],
                        tableRows: [
                            {
                                trHeight: { val: { v: 32 }, hRule: 2 },
                                tableCells: [
                                    {
                                        columnSpan: 2,
                                        backgroundColor: { rgb: '#D9EAF7' },
                                        borderTop: { color: { rgb: '#4472C4' }, width: { v: 2 } },
                                        borderRight: { color: { rgb: '#4472C4' }, width: { v: 2 } },
                                        borderBottom: { color: { rgb: '#4472C4' }, width: { v: 2 } },
                                        borderLeft: { color: { rgb: '#4472C4' }, width: { v: 2 } },
                                    },
                                    { rowSpan: 0, columnSpan: 0 },
                                ],
                            },
                            {
                                trHeight: { val: { v: 30 }, hRule: 0 },
                                tableCells: [{ backgroundColor: { rgb: '#FFF2CC' } }, {}],
                            },
                        ],
                        align: 0,
                        indent: { v: 0 },
                        textWrap: 0,
                        position: {
                            positionH: { relativeFrom: 0, posOffset: 0 },
                            positionV: { relativeFrom: 0, posOffset: 0 },
                        },
                        dist: { distB: 0, distL: 0, distR: 0, distT: 0 },
                        size: { type: 1, width: { v: 200 } },
                    },
                },
            }]);

            expect(html).toContain('colspan="2"');
            expect(html).toContain('background-color: #D9EAF7');
            expect(html).toContain('border-top: 2px solid #4472C4');
            expect(html).toContain('text-align: center');
            expect(html).not.toContain('<td class="UniverTableCell"></td><td class="UniverTableCell"></td>');
        });

        it('should serialize adjacent and nested list paragraphs as one semantic list tree', () => {
            const convertor = new UDMToHtmlService();
            const html = convertor.convert([{
                id: '',
                documentStyle: {},
                body: {
                    dataStream: 'One\rNested\rTwo\r',
                    paragraphs: [
                        { paragraphId: 'para_docs_ui_fixture_58', startIndex: 3, bullet: { listId: 'list-1', listType: 'ORDER_LIST', nestingLevel: 0 } },
                        { paragraphId: 'para_docs_ui_fixture_59', startIndex: 10, bullet: { listId: 'list-1', listType: 'BULLET_LIST', nestingLevel: 1 } },
                        { paragraphId: 'para_docs_ui_fixture_60', startIndex: 14, bullet: { listId: 'list-1', listType: 'ORDER_LIST', nestingLevel: 0 } },
                    ],
                },
            }]);

            expect(html.match(/data-doc-type="ordered-list"/g)?.length).toBe(1);
            expect(html.match(/data-doc-type="bullet-list"/g)?.length).toBe(1);
            expect(html).toContain('<li><p class="UniverNormal" >One</p><ul');
            expect(html).toContain('</ul></li><li><p class="UniverNormal" >Two</p>');
        });

        it('should preserve copied internal table sources and list metadata', () => {
            const doc: IDocumentData = {
                id: '',
                documentStyle: {},
                body: {
                    dataStream: `${DataStreamTreeTokenType.TABLE_START}${DataStreamTreeTokenType.TABLE_ROW_START}${DataStreamTreeTokenType.TABLE_CELL_START}Cell\r\n${DataStreamTreeTokenType.TABLE_CELL_END}${DataStreamTreeTokenType.TABLE_ROW_END}${DataStreamTreeTokenType.TABLE_END}\r\nBullet\r`,
                    tables: [{
                        startIndex: 0,
                        endIndex: 10,
                        tableId: 'table-1',
                    }],
                    paragraphs: [{ paragraphId: 'para_docs_ui_fixture_61', startIndex: 5 }, { paragraphId: 'para_docs_ui_fixture_62', startIndex: 19, bullet: {
                        listId: 'list-1',
                        listType: PresetListType.BULLET_LIST,
                        nestingLevel: 0,
                    } }],
                },
                tableSource: {
                    'table-1': {
                        tableId: 'table-1',
                        tableColumns: [
                            { size: { type: TableSizeType.SPECIFIED, width: { v: 88 } } },
                            { size: { type: TableSizeType.SPECIFIED, width: { v: 176 } } },
                        ],
                        tableRows: [],
                    } as any,
                },
                lists: {
                    [PresetListType.BULLET_LIST]: {
                        listType: PresetListType.BULLET_LIST,
                        nestingLevel: {},
                    },
                } as any,
            };

            const internalDocData = createInternalClipboardDocData(doc);

            expect(internalDocData.tableSource?.['table-1'].tableColumns?.map((column) => column.size.width.v)).toEqual([88, 176]);
            expect(internalDocData.lists?.[PresetListType.BULLET_LIST]).toBeDefined();
        });

        it('should preserve table sources when multiple copied fragments are merged for internal paste', () => {
            const createTableDoc = (tableId: string, text: string, widths: number[]): IDocumentData => {
                const dataStream = `${DataStreamTreeTokenType.TABLE_START}${DataStreamTreeTokenType.TABLE_ROW_START}${DataStreamTreeTokenType.TABLE_CELL_START}${text}\r\n${DataStreamTreeTokenType.TABLE_CELL_END}${DataStreamTreeTokenType.TABLE_ROW_END}${DataStreamTreeTokenType.TABLE_END}`;
                return {
                    id: '',
                    documentStyle: {},
                    body: {
                        dataStream,
                        tables: [{
                            startIndex: 0,
                            endIndex: dataStream.length,
                            tableId,
                        }],
                        paragraphs: [{ paragraphId: 'para_docs_ui_fixture_63', startIndex: DataStreamTreeTokenType.TABLE_START.length + DataStreamTreeTokenType.TABLE_ROW_START.length + DataStreamTreeTokenType.TABLE_CELL_START.length + text.length }],
                    },
                    tableSource: {
                        [tableId]: {
                            tableId,
                            tableColumns: widths.map((width) => ({ size: { type: TableSizeType.SPECIFIED, width: { v: width } } })),
                            tableRows: [],
                        } as any,
                    },
                };
            };

            const first = createTableDoc('table-1', 'A', [120, 240]);
            const second = createTableDoc('table-2', 'B', [90, 180]);
            const internalDocData = createInternalClipboardDocDataList([first, second]);

            expect(internalDocData?.body?.tables).toHaveLength(2);
            expect(internalDocData?.body?.tables?.[1].startIndex).toBe(first.body!.dataStream.length);
            expect(internalDocData?.tableSource?.['table-1'].tableColumns?.map((column) => column.size.width.v)).toEqual([120, 240]);
            expect(internalDocData?.tableSource?.['table-2'].tableColumns?.map((column) => column.size.width.v)).toEqual([90, 180]);
        });

        it('should reject invalid internal clipboard fragments and empty copied document lists', () => {
            expect(parseInternalClipboardFragment()).toBeNull();
            expect(parseInternalClipboardFragment('{bad-json')).toBeNull();
            expect(parseInternalClipboardFragment(JSON.stringify({
                version: 1,
                kind: 'univer-doc-fragment',
                doc: {},
            }))).toBeNull();
            expect(extractInternalClipboardFragmentFromHtml('<p>No internal fragment</p>')).toBeNull();
            expect(createInternalClipboardDocDataList([])).toBeNull();
        });

        it('should resolve internal copy ids and cached document payloads for local paste', () => {
            const cache = new CopyContentCache();
            const doc = {
                body: {
                    dataStream: 'Cached\r\n',
                    paragraphs: [{ paragraphId: 'para_docs_ui_fixture_67', startIndex: 6 }],
                },
            };

            cache.set('copy-1', doc);
            expect(extractId('<p data-copy-id="copy-1">Cached</p>')).toBe('copy-1');
            expect(extractId('<p>External paste</p>')).toBeNull();
            expect(cache.get('copy-1')?.body?.dataStream).toBe('Cached\r\n');

            cache.clear();
            expect(cache.get('copy-1')).toBeUndefined();
        });

        it('should merge copied body metadata with offsets for internal multi-range paste', () => {
            const first: IDocumentData = {
                id: 'first',
                documentStyle: {},
                body: {
                    dataStream: 'AB',
                    textRuns: [{ st: 0, ed: 1, ts: { bl: BooleanNumber.TRUE } }],
                    paragraphs: [{ paragraphId: 'para_docs_ui_fixture_65', startIndex: 1 }],
                    sectionBreaks: [{ sectionId: 'section_fixture_233', startIndex: 2 }],
                    blockRanges: [{ startIndex: 0, endIndex: 1, blockId: 'quote-1', blockType: DocumentBlockRangeType.QUOTE }],
                    customRanges: [{ startIndex: 0, endIndex: 1, rangeId: 'range-1', rangeType: 0 }],
                    customDecorations: [{ startIndex: 0, endIndex: 1, id: 'decoration-1', type: CustomDecorationType.COMMENT }],
                    customBlocks: [{ startIndex: 1, blockId: 'block-1' }],
                },
            };
            const second: IDocumentData = {
                id: 'second',
                documentStyle: {},
                body: {
                    dataStream: 'CD',
                    textRuns: [{ st: 0, ed: 2, ts: { it: BooleanNumber.TRUE } }],
                    paragraphs: [{ paragraphId: 'para_docs_ui_fixture_66', startIndex: 2 }],
                    sectionBreaks: [{ sectionId: 'section_fixture_234', startIndex: 2 }],
                    blockRanges: [{ startIndex: 0, endIndex: 2, blockId: 'code-1', blockType: DocumentBlockRangeType.CODE }],
                    customRanges: [{ startIndex: 0, endIndex: 1, rangeId: 'range-2', rangeType: 0 }],
                    customDecorations: [{ startIndex: 1, endIndex: 2, id: 'decoration-2', type: CustomDecorationType.COMMENT }],
                    customBlocks: [{ startIndex: 0, blockId: 'block-2' }],
                },
            };

            const merged = createInternalClipboardDocDataList([first, second]);
            const body = merged?.body;

            expect(body?.dataStream).toBe('ABCD');
            expect(body?.textRuns?.[1]).toMatchObject({ st: 2, ed: 4 });
            expect(body?.paragraphs?.[1].startIndex).toBe(4);
            expect(body?.sectionBreaks?.[1].startIndex).toBe(4);
            expect(body?.blockRanges?.[1]).toMatchObject({ startIndex: 2, endIndex: 4, blockType: DocumentBlockRangeType.CODE });
            expect(body?.customRanges?.[1]).toMatchObject({ startIndex: 2, endIndex: 3, rangeId: 'range-2' });
            expect(body?.customDecorations?.[1]).toMatchObject({ startIndex: 3, endIndex: 4, id: 'decoration-2' });
            expect(body?.customBlocks?.[1]).toMatchObject({ startIndex: 2, blockId: 'block-2' });
        });

        it('should copy inline drawings with fresh block ids for internal paste', () => {
            const doc: IDocumentData = {
                id: 'drawing-doc',
                documentStyle: {},
                body: {
                    dataStream: '\b',
                    customBlocks: [{ startIndex: 0, blockId: 'image-1' }],
                },
                drawings: {
                    'image-1': {
                        drawingId: 'image-1',
                        drawingType: 0,
                        unitId: 'drawing-doc',
                        subUnitId: '',
                    } as never,
                },
            };

            const internalDocData = createInternalClipboardDocData(doc);
            const blockId = internalDocData.body?.customBlocks?.[0].blockId;

            expect(blockId).toBeTruthy();
            expect(blockId).not.toBe('image-1');
            expect(blockId ? internalDocData.drawings?.[blockId]?.drawingId : undefined).toBe(blockId);
        });

        it('should serialize rich inline text styles for html clipboard output', () => {
            const html = covertTextRunToHtml('Styled', {
                st: 0,
                ed: 6,
                ts: {
                    bl: BooleanNumber.TRUE,
                    it: BooleanNumber.TRUE,
                    ul: { s: BooleanNumber.TRUE },
                    st: { s: BooleanNumber.TRUE },
                    va: BaselineOffset.SUPERSCRIPT,
                    fs: 14,
                    ff: 'Inter',
                    cl: { rgb: '#123456' },
                    bg: { rgb: 'rgb(240, 240, 10)' },
                    ol: { s: BooleanNumber.TRUE },
                },
            });

            expect(html).toContain('<strong><s><u><sup><i>Styled</i></sup></u></s></strong>');
            expect(html).toContain('font-family: Inter');
            expect(html).toContain('font-size: 14pt');
            expect(html).toContain('color: #123456');
            expect(html).toContain('background: #f0f00a');
            expect(html).toContain('text-decoration: overline');
        });

        it('should serialize copied hyperlinks and inline images into html clipboard output', () => {
            const doc: IDocumentData = {
                id: 'copy-html',
                documentStyle: {},
                body: {
                    dataStream: 'A\bB',
                    customRanges: [{
                        startIndex: 0,
                        endIndex: 2,
                        rangeId: 'link-1',
                        rangeType: CustomRangeType.HYPERLINK,
                        properties: { url: 'https://univer.ai' },
                    }],
                    customBlocks: [{ startIndex: 1, blockId: 'image-1' }],
                },
                drawings: {
                    'image-1': {
                        drawingId: 'image-1',
                        drawingType: DrawingTypeEnum.DRAWING_IMAGE,
                        imageSourceType: 'UUID',
                        source: 'remote-image-id',
                        transform: { width: 120, height: 80 },
                        docTransform: { size: { width: 120, height: 80 } },
                    } as never,
                },
            };

            const html = getBodySliceHtml(doc, 0, 3);

            expect(html).toContain('<a data-rangeid="link-1" href="https://univer.ai">');
            expect(html).toContain('data-source=remote-image-id');
            expect(html).toContain('data-doc-transform-width=120');
            expect(html).toContain('src=remote-image-id');
        });

        it('should paste docs feature coverage from html with styles, blocks, lists and table dimensions', () => {
            const convertor = new HtmlToUDMService();
            const pasted = convertor.convert(`
                <p class="UniverNormal" style="margin-top: 6px; margin-bottom: 10px; line-height: 150%; text-align: center; font-family: Arial; font-size: 13pt; color: #123456;"><strong><i><u>Styled paragraph</u></i></strong></p>
                <ul data-doc-type="bullet-list"><li><p class="UniverNormal">Bullet item</p></li></ul>
                <ol data-doc-type="ordered-list"><li><p class="UniverNormal">Number item</p></li></ol>
                <blockquote data-doc-type="quote"><p class="UniverNormal">Quote text</p></blockquote>
                <aside data-doc-type="callout" role="note"><p class="UniverNormal">Callout text</p></aside>
                <pre data-doc-type="code-block"><code>const x = 1;</code></pre>
                <table class="MsoNormalTable UniverTable" style="border-collapse: collapse; width: 300px;"><tbody>
                    <tr style="height: 32px"><td class="UniverTableCell" colspan="2" style="background-color: #D9EAF7; border: 2px solid #4472C4;"><p class="UniverNormal" style="text-align: center; font-family: Arial; font-size: 12pt; font-weight: bold"><strong>Header</strong></p></td></tr>
                    <tr><td class="UniverTableCell" style="width: 90px; border: 1px solid #999999"><p class="UniverNormal">Left</p></td><td class="UniverTableCell" style="width: 210px; border: 1px solid #999999"><p class="UniverNormal" style="color: #C81E1E;">Right</p></td></tr>
                </tbody></table>
            `);
            const body = pasted.body!;
            const styledParagraph = body.paragraphs![0];
            const styledRun = body.textRuns!.find((run) => body.dataStream.slice(run.st, run.ed).includes('Styled paragraph'))!;
            const bulletParagraph = body.paragraphs!.find((paragraph) => paragraph.bullet?.listType === PresetListType.BULLET_LIST);
            const orderedParagraph = body.paragraphs!.find((paragraph) => paragraph.bullet?.listType === PresetListType.ORDER_LIST);
            const blockTypes = body.blockRanges?.map((range) => range.blockType).sort();
            const tableId = body.tables?.[0].tableId;
            const table = tableId ? pasted.tableSource?.[tableId] : undefined;

            expect(styledParagraph.paragraphStyle?.horizontalAlign).toBe(HorizontalAlign.CENTER);
            expect(styledParagraph.paragraphStyle?.lineSpacing).toBe(1.5);
            expect(styledRun.ts?.ff).toBe('Arial');
            expect(styledRun.ts?.fs).toBe(13);
            expect(styledRun.ts?.cl?.rgb).toBe('rgb(18,52,86)');
            expect(styledRun.ts?.bl).toBe(BooleanNumber.TRUE);
            expect(styledRun.ts?.it).toBe(BooleanNumber.TRUE);
            expect(styledRun.ts?.ul?.s).toBe(BooleanNumber.TRUE);
            expect(bulletParagraph).toBeDefined();
            expect(orderedParagraph).toBeDefined();
            expect(blockTypes).toEqual([
                DocumentBlockRangeType.CALLOUT,
                DocumentBlockRangeType.CODE,
                DocumentBlockRangeType.QUOTE,
            ]);
            expect(table).toBeDefined();
            const headerCell = table!.tableRows[0]!.tableCells[0]!;
            expect(table!.tableColumns.map((column) => column.size.width.v)).toEqual([90, 210]);
            expect(headerCell.columnSpan).toBe(2);
            expect(headerCell.backgroundColor?.rgb).toBe('rgb(217,234,247)');
            expect(headerCell.borderTop?.width?.v).toBe(2);
        });

        it('should embed and extract an internal clipboard fragment through html', () => {
            const fragment = createInternalClipboardFragment({
                body: {
                    dataStream: 'Internal\r',
                    paragraphs: [{ paragraphId: 'para_docs_ui_fixture_64', startIndex: 8 }],
                },
            });
            const html = wrapClipboardHtml(embedInternalClipboardFragment('<p>Internal</p>', fragment));

            expect(html).toContain('StartFragment');
            expect(html).toContain('urn:schemas-microsoft-com:office:word');
            expect(html).toContain('Word.Document');
            expect(html).toContain('MsoNormalTable');
            expect(extractInternalClipboardFragmentFromHtml(html)?.body?.dataStream).toBe('Internal\r');
        });
    });
});
