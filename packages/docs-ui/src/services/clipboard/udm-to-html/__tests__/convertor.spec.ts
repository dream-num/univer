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

import type { IDocumentBody } from '@univerjs/core';
import {
    BooleanNumber,
    DataStreamTreeTokenType,
    DocumentBlockRangeType,
    NamedStyleType,
    TableRowHeightRule,
    TableSizeType,
} from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { convertBodyToHtml, covertTextRunToHtml, getBodySliceHtml, UDMToHtmlService } from '../convertor';

function getTestBody() {
    return {
        dataStream: '荷塘月色\r作者：朱自清',
        textRuns: [
            {
                st: 1,
                ed: 3,
                ts: {
                    fs: 24,
                    ff: 'Microsoft YaHei',
                    cl: {
                        rgb: 'rgb(0, 0, 0)',
                    },
                    bl: BooleanNumber.TRUE,
                },
            },
        ],
        paragraphs: [
            { paragraphId: 'para_docs_ui_fixture_65', startIndex: 4, paragraphStyle: {
                spaceAbove: { v: 10 },
                lineSpacing: 2,
                spaceBelow: { v: 0 },
            } },
            { paragraphId: 'para_docs_ui_fixture_66', startIndex: 11, paragraphStyle: {
                spaceAbove: { v: 10 },
                lineSpacing: 2,
                spaceBelow: { v: 0 },
            } },
        ],
    } as IDocumentBody;
}

describe('test case in html and udm convert', () => {
    it('test case in html and udm convert and bodyList length is 1', () => {
        const convertor = new UDMToHtmlService();
        const bodyList = [
            {
                dataStream: '=SUM(F15:G18)',
                textRuns: [
                    {
                        st: 5,
                        ed: 12,
                        ts: {
                            cl: {
                                rgb: '#9e6de3',
                            },
                        },
                    },
                ],
                paragraphs: [
                    { paragraphId: 'para_docs_ui_fixture_67', startIndex: 13, paragraphStyle: {
                        horizontalAlign: 0,
                    } },
                ],
            },
        ];

        const html = convertor.convert(bodyList.map((b) => ({ body: b, id: '', documentStyle: {} })));

        expect(html).toBe('<p class="UniverNormal" >=SUM(<span style="font-family: Arial; color: #9e6de3;">F15:G18</span>)</p>');
    });

    it('applies registered export transformers before converting UDM to HTML', () => {
        const convertor = new UDMToHtmlService({
            transformDocumentForHtmlExport: (doc) => ({
                ...doc,
                body: {
                    dataStream: 'Exported\r\n',
                    paragraphs: [{ paragraphId: 'para_docs_ui_fixture_73', startIndex: 'Exported'.length }],
                    sectionBreaks: [{ sectionId: 'section_fixture_235', startIndex: 'Exported\r\n'.length - 1 }],
                },
            }),
        });

        const html = convertor.convert([{
            id: '',
            documentStyle: {},
            body: {
                dataStream: 'Original\r\n',
                paragraphs: [{ paragraphId: 'para_docs_ui_fixture_74', startIndex: 'Original'.length }],
                sectionBreaks: [{ sectionId: 'section_fixture_236', startIndex: 'Original\r\n'.length - 1 }],
            },
        }]);

        expect(html).toContain('Exported');
        expect(html).not.toContain('Original');
    });

    it('Should convert textRun to Html', () => {
        const documentBody = getTestBody();
        const expectedHtml = '<span style="font-family: Microsoft YaHei; color: #000000; font-size: 24pt;"><strong>塘月</strong></span>';

        expect(covertTextRunToHtml(documentBody.dataStream, documentBody.textRuns![0])).toBe(expectedHtml);
    });

    it('Should get getBodySliceHtml', () => {
        const documentBody = getTestBody();
        let startIndex = 1;
        let endIndex = 3;

        let expectedHtml = '<span style="font-family: Microsoft YaHei; color: #000000; font-size: 24pt;"><strong>塘月</strong></span>';

        expect(getBodySliceHtml({ body: documentBody, id: '', documentStyle: {} }, startIndex, endIndex)).toEqual(expectedHtml);

        startIndex = 0;
        endIndex = 4;

        expectedHtml = '荷<span style="font-family: Microsoft YaHei; color: #000000; font-size: 24pt;"><strong>塘月</strong></span>色';
        expect(getBodySliceHtml({ body: documentBody, id: '', documentStyle: {} }, startIndex, endIndex)).toEqual(expectedHtml);
    });

    it('Should convert document body To Html(convertBodyToHtml)', () => {
        const documentBody = getTestBody();
        const expectedHtml = '<p class="UniverNormal" style="margin-top: 10px; margin-bottom: 0px; line-height: 2;">荷<span style="font-family: Microsoft YaHei; color: #000000; font-size: 24pt;"><strong>塘月</strong></span>色</p><p class="UniverNormal" style="margin-top: 10px; margin-bottom: 0px; line-height: 2;">作者：朱自清</p>';

        expect(convertBodyToHtml({ body: documentBody, id: '', documentStyle: {} })).toEqual(expectedHtml);
    });
    it('serializes embedded tables as paragraph siblings and strips data stream control chars', () => {
        const tokens = DataStreamTreeTokenType;
        const prefix = 'Intro\r';
        const tableStart = prefix.length;
        const cellText = 'Cell text';
        const tableStream = `${tokens.TABLE_START}${tokens.TABLE_ROW_START}${tokens.TABLE_CELL_START}${cellText}\r\n${tokens.TABLE_CELL_END}${tokens.TABLE_ROW_END}${tokens.TABLE_END}`;
        const tableEnd = tableStart + tableStream.length;
        const dataStream = `${prefix}${tableStream}\r\n`;

        const html = convertBodyToHtml({
            id: '',
            documentStyle: {},
            tableSource: {
                'table-1': {
                    tableId: 'table-1',
                    tableColumns: [{
                        size: {
                            type: TableSizeType.SPECIFIED,
                            width: { v: 120 },
                        },
                    }],
                    tableRows: [{
                        trHeight: {
                            hRule: TableRowHeightRule.AUTO,
                            val: { v: 32 },
                        },
                        tableCells: [{}],
                    }],
                },
            } as any,
            body: {
                dataStream,
                paragraphs: [
                    { paragraphId: 'para_docs_ui_fixture_68', startIndex: prefix.length - 1 },
                    { paragraphId: 'para_docs_ui_fixture_69', startIndex: tableStart + tokens.TABLE_START.length + tokens.TABLE_ROW_START.length + tokens.TABLE_CELL_START.length + cellText.length },
                ],
                sectionBreaks: [],
                tables: [{
                    startIndex: tableStart,
                    endIndex: tableEnd,
                    tableId: 'table-1',
                }],
            },
        });

        expect(html).toContain('<p class="UniverNormal" >Intro</p><table');
        expect(html).not.toMatch(/<p[^>]*>\s*<table/i);
        expect(html).not.toContain(tokens.TABLE_START);
        expect(html).not.toContain(tokens.TABLE_CELL_START);
        expect(html).toContain('Cell text');
    });

    it('serializes title paragraphs as headings and hides block boundary tokens', () => {
        const tokens = DataStreamTreeTokenType;
        const title = 'Docs Table 2.0 playground';
        const code = 'const cell = {};';
        const blockStart = title.length + 1;
        const dataStream = `${title}\r${tokens.BLOCK_START}${code}${tokens.BLOCK_END}\r\n`;

        const html = convertBodyToHtml({
            id: '',
            documentStyle: {},
            body: {
                dataStream,
                paragraphs: [
                    { paragraphId: 'para_docs_ui_fixture_70', startIndex: title.length, paragraphStyle: {
                        namedStyleType: NamedStyleType.TITLE,
                    } },
                    { paragraphId: 'para_docs_ui_fixture_71', startIndex: dataStream.length - 2 },
                ],
                sectionBreaks: [],
                blockRanges: [{
                    startIndex: blockStart,
                    endIndex: blockStart + tokens.BLOCK_START.length + code.length - 1,
                    blockType: DocumentBlockRangeType.CODE,
                }] as any,
            },
        });

        expect(html).toContain('<p class="UniverHeading" role="heading" aria-level="1" data-heading-level="1" >Docs Table 2.0 playground</p>');
        expect(html).toContain('const cell = {};');
        expect(html).not.toContain(tokens.BLOCK_START);
        expect(html).not.toContain(tokens.BLOCK_END);
    });

    it('serializes paragraph-level text style for Word copy', () => {
        const title = 'Styled paragraph';
        const html = convertBodyToHtml({
            id: '',
            documentStyle: {},
            body: {
                dataStream: `${title}\r\n`,
                paragraphs: [{ paragraphId: 'para_docs_ui_fixture_72', startIndex: title.length, paragraphStyle: {
                    textStyle: {
                        fs: 22,
                        bl: BooleanNumber.TRUE,
                        cl: { rgb: '#4B5563' },
                        ff: 'Arial',
                    },
                } }],
                sectionBreaks: [],
            },
        });

        expect(html).toContain('font-size: 22pt');
        expect(html).toContain('font-weight: bold');
        expect(html).toContain('color: #4B5563');
        expect(html).toContain('font-family: Arial');
        expect(html).toContain('<strong>Styled paragraph</strong>');
    });
});
