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
import { BooleanNumber, DataStreamTreeTokenType, HorizontalAlign, NamedStyleType, PresetListType, TableSizeType } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { HtmlToUDMService } from '../html-to-udm/converter';
import PastePluginLark from '../html-to-udm/paste-plugins/plugin-lark';
import PastePluginWord from '../html-to-udm/paste-plugins/plugin-word';
import { createInternalClipboardDocData, createInternalClipboardDocDataList, createInternalClipboardFragment, embedInternalClipboardFragment, extractInternalClipboardFragmentFromHtml, wrapClipboardHtml } from '../internal-fragment';
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
                        { startIndex: 9, paragraphStyle: { horizontalAlign: HorizontalAlign.CENTER } },
                        { startIndex: 13 },
                        { startIndex: 21 },
                        { startIndex: 27 },
                    ],
                    sectionBreaks: [{ startIndex: 10 }, { startIndex: 14 }, { startIndex: 22 }, { startIndex: 28 }],
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
                    paragraphs: [{
                        startIndex: 5,
                    }, {
                        startIndex: 19,
                        bullet: {
                            listId: 'list-1',
                            listType: PresetListType.BULLET_LIST,
                            nestingLevel: 0,
                        },
                    }],
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
                        paragraphs: [{
                            startIndex: DataStreamTreeTokenType.TABLE_START.length + DataStreamTreeTokenType.TABLE_ROW_START.length + DataStreamTreeTokenType.TABLE_CELL_START.length + text.length,
                        }],
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
            expect(blockTypes).toEqual(['callout', 'code', 'quote']);
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
                    paragraphs: [{ startIndex: 8 }],
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
