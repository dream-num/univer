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

import type { ISheetSkeletonManagerParam } from '@univerjs/sheets';
import { DocumentDataModel } from '@univerjs/core';
import { convertBodyToHtml } from '@univerjs/docs-ui';
import { describe, expect, it } from 'vitest';
import {
    excelLocaleChHtml,
    excelLocaleFrHtml,
    excelLocaleFrNbspHtml,
    excelLocaleTextHtml,
    excelLocaleUsHtml,
    excelLocaleUsPlainHtml,
    excelLocaleViDeHtml,
    excelLocaleViGeneralHtml,
    excelLocaleXNumHtml,
} from '../../__tests__/excel-locale-separator-html';
import { HtmlToUSMService } from '../converter';
import { LarkPastePlugin } from '../paste-plugins/plugin-lark';
import { UniverPastePlugin } from '../paste-plugins/plugin-univer';
import { WordPastePlugin } from '../paste-plugins/plugin-word';

HtmlToUSMService.use(UniverPastePlugin);
HtmlToUSMService.use(WordPastePlugin);
HtmlToUSMService.use(LarkPastePlugin);

describe('HtmlToUSMService', () => {
    it('preserves colors and offsets when importing a copied rich text selection with Word metadata', () => {
        const source = new DocumentDataModel({
            id: 'rich-text-selection',
            body: {
                dataStream: 'xABCDy\r\n',
                textRuns: [
                    { st: 1, ed: 3, ts: { cl: { rgb: '#ff0000' } } },
                    { st: 3, ed: 5, ts: { cl: { rgb: '#0000ff' } } },
                ],
            },
        });
        const fragment = convertBodyToHtml({
            id: 'copied-selection',
            body: source.sliceBody(1, 5)!,
            documentStyle: {},
        });
        const converter = new HtmlToUSMService({
            getCurrentSkeleton: () => ({ skeleton: {} } as ISheetSkeletonManagerParam),
        });
        const { cellMatrix } = converter.convert(`
            <html><head><meta name="ProgId" content="Word.Document"></head>
            <body>${fragment}<p class="UniverNormal">next row</p></body></html>
        `);

        expect(cellMatrix.getValue(0, 0)?.v).toBe('ABCD');
        expect(cellMatrix.getValue(0, 0)?.p?.body?.textRuns).toEqual([
            expect.objectContaining({ st: 0, ed: 2, ts: expect.objectContaining({ cl: { rgb: 'rgb(255,0,0)' } }) }),
            expect.objectContaining({ st: 2, ed: 4, ts: expect.objectContaining({ cl: { rgb: 'rgb(0,0,255)' } }) }),
        ]);
        expect(cellMatrix.getValue(1, 0)?.v).toBe('next row');
        expect(cellMatrix.getValue(2, 0)).toBeUndefined();
    });

    it.each([
        {
            html: '<span style="color:red">AB</span><span style="color:blue">CD</span>',
            runs: [
                { st: 0, ed: 2, ts: { cl: { rgb: 'rgb(255,0,0)' } } },
                { st: 2, ed: 4, ts: { cl: { rgb: 'rgb(0,0,255)' } } },
            ],
        },
        {
            html: 'A<span style="color:red">BC</span>D',
            runs: [{ st: 1, ed: 3, ts: { cl: { rgb: 'rgb(255,0,0)' } } }],
        },
    ])('preserves inline text styles without paragraph markup: $html', ({ html, runs }) => {
        const converter = new HtmlToUSMService({
            getCurrentSkeleton: () => ({ skeleton: {} } as ISheetSkeletonManagerParam),
        });
        const cell = converter.convert(html).cellMatrix.getValue(0, 0);

        expect(cell?.v).toBe('ABCD');
        expect(cell?.p?.body?.dataStream).toBe('ABCD\r\n');
        expect(cell?.p?.body?.textRuns).toEqual(runs);
    });

    it('keeps a uniform font color as a cell style', () => {
        const converter = new HtmlToUSMService({
            getCurrentSkeleton: () => ({ skeleton: {} } as ISheetSkeletonManagerParam),
        });
        const cell = converter.convert('<span style="color:red">ABCD</span>').cellMatrix.getValue(0, 0);

        expect(cell?.v).toBe('ABCD');
        expect(cell?.s).toEqual({ cl: { rgb: 'rgb(255,0,0)' } });
        expect(cell?.p?.body?.textRuns).toEqual([]);
    });

    it('preserves inline styles in the last row after a line break', () => {
        const converter = new HtmlToUSMService({
            getCurrentSkeleton: () => ({ skeleton: {} } as ISheetSkeletonManagerParam),
        });
        const { cellMatrix } = converter.convert('first<br>A<span style="color:red">BC</span>D');

        expect(cellMatrix.getValue(0, 0)?.v).toBe('first');
        expect(cellMatrix.getValue(1, 0)?.v).toBe('ABCD');
        expect(cellMatrix.getValue(1, 0)?.p?.body?.textRuns).toEqual([
            { st: 1, ed: 3, ts: { cl: { rgb: 'rgb(255,0,0)' } } },
        ]);
    });

    it('uses Word paragraph rules when UniverNormal appears only in a stylesheet', () => {
        const converter = new HtmlToUSMService({ getCurrentSkeleton: () => null });
        const { cellMatrix } = converter.convert(`
            <html><head><style>p.UniverNormal { color: red; }</style></head>
            <body><p class="MsoNormal">first</p><p class="MsoNormal">second</p></body></html>
        `);

        expect(cellMatrix.getValue(0, 0)?.v).toBe('first');
        expect(cellMatrix.getValue(1, 0)?.v).toBe('second');
    });

    it('preserves Excel borders that use the legacy windowtext system color', () => {
        const converter = new HtmlToUSMService({ getCurrentSkeleton: () => null });
        const { cellMatrix } = converter.convert(`
            <html>
                <head>
                    <style>
                        td { border: none; }
                        .xl65 {
                            border-top: .5pt solid windowtext;
                            border-left: .5pt solid windowtext;
                        }
                    </style>
                </head>
                <body><table><tr><td class="xl65">11</td></tr></table></body>
            </html>
        `);

        expect(cellMatrix.getValue(0, 0)?.s).toStrictEqual({
            bd: {
                l: { cl: { rgb: '#000000' }, s: 1 },
                t: { cl: { rgb: '#000000' }, s: 1 },
            },
        });
    });

    it('preserves Lark ace lines as multiline text inside a table cell', () => {
        const converter = new HtmlToUSMService({
            getCurrentSkeleton: () => ({ skeleton: {} } as ISheetSkeletonManagerParam),
        });
        const { cellMatrix } = converter.convert(`
            <table class="ace-table">
                <tbody>
                    <tr>
                        <td><div class="ace-line">1.a</div><div class="ace-line">2.b</div><div class="ace-line">3.c</div></td>
                    </tr>
                </tbody>
            </table>
            <span class="lark-record-clipboard"></span>
        `);

        expect(cellMatrix.getValue(0, 0)?.v).toBe('1.a\r2.b\r3.c');
        expect(cellMatrix.getValue(0, 0)?.p?.body?.dataStream).toBe('1.a\r2.b\r3.c\r\n');
    });

    it.each([
        '<p class="MsoNormal"><b>Office回归中文🙂</b></p><p class="MsoNormal"><b>第二行 0</b></p>',
        '<span>Office回归中文🙂</span><br><span>第二行 0</span>',
    ])('keeps document terminators out of plain paragraph cell values: %s', (html) => {
        const converter = new HtmlToUSMService({ getCurrentSkeleton: () => null });
        const { cellMatrix } = converter.convert(html);

        expect(cellMatrix.getValue(0, 0)?.v).toBe('Office回归中文🙂');
        expect(cellMatrix.getValue(1, 0)?.v).toBe('第二行 0');
        expect(cellMatrix.getValue(2, 0)).toBeUndefined();
    });

    it('preserves intentional spaces and empty paragraphs when splitting cells', () => {
        const converter = new HtmlToUSMService({ getCurrentSkeleton: () => null });
        const { cellMatrix } = converter.convert('<p class="MsoNormal"> left </p><p class="MsoNormal"></p><p class="MsoNormal">right </p>');

        expect(cellMatrix.getValue(0, 0)?.v).toBe(' left ');
        expect(cellMatrix.getValue(1, 0)?.v).toBe('');
        expect(cellMatrix.getValue(2, 0)?.v).toBe('right ');
        expect(cellMatrix.getValue(3, 0)).toBeUndefined();
    });

    // Real Excel output keeps the marker between other declarations, and `mso-ignore` takes a property list.
    it.each([
        'mso-ignore:colspan',
        'color: red; MSO-IGNORE: COLSPAN;',
        'height:14.0pt;mso-ignore:colspan;width:104pt',
        'mso-ignore: colspan padding',
        'mso-ignore:rowspan,colspan',
    ])('keeps Excel overflow cells separate: %s', (style) => {
        const converter = new HtmlToUSMService({ getCurrentSkeleton: () => null });
        const { cellMatrix } = converter.convert(`
            <table>
                <tr><td colspan="2" style="${style}">Long label</td><td>Next</td></tr>
                <tr><td>First</td><td>Second</td><td>Third</td></tr>
            </table>
        `);

        expect(cellMatrix.getValue(0, 0)).toMatchObject({ v: 'Long label', colSpan: 1, rowSpan: 1 });
        expect(cellMatrix.getValue(0, 1)?.v).toBeUndefined();
        expect(cellMatrix.getValue(0, 2)?.v).toBe('Next');
        expect(cellMatrix.getValue(1, 0)?.v).toBe('First');
        expect(cellMatrix.getValue(1, 1)?.v).toBe('Second');
        expect(cellMatrix.getValue(1, 2)?.v).toBe('Third');
    });

    it.each([
        '',
        'mso-ignore:padding',
        '--mso-ignore:colspan',
        'mso-ignore-colspan:1',
        'mso-ignore:colspanx',
    ])('preserves real merged cells: %s', (style) => {
        const converter = new HtmlToUSMService({ getCurrentSkeleton: () => null });
        const { cellMatrix } = converter.convert(`
            <table>
                <tr><td colspan="2" rowspan="2" style="${style}">Merged</td><td>Next</td></tr>
                <tr><td>Below</td></tr>
            </table>
        `);

        expect(cellMatrix.getValue(0, 0)).toMatchObject({ v: 'Merged', colSpan: 2, rowSpan: 2 });
        expect(cellMatrix.getValue(0, 2)?.v).toBe('Next');
        expect(cellMatrix.getValue(1, 2)?.v).toBe('Below');
    });

    it('parses numbers pasted from Excel with non-US separators declared via mso-displayed-*-separator', () => {
        const converter = new HtmlToUSMService({
            getCurrentSkeleton: () => null,
            getNumfmtParseOptions: () => ({ locale: 'en-US' }),
        });
        const { cellMatrix } = converter.convert(excelLocaleViDeHtml);

        expect(cellMatrix.getValue(0, 0)?.v).toBe(516382306730);
        expect(cellMatrix.getValue(1, 0)?.v).toBe(12.5);
        expect(cellMatrix.getValue(2, 0)?.v).toBe(1000.5);

        const { cellMatrix: secondMatrix } = converter.convert(excelLocaleUsPlainHtml);
        expect(secondMatrix.getValue(0, 0)?.v).toBe(1234);
    });

    it('keeps US number parsing unchanged when Excel declares US separators', () => {
        const converter = new HtmlToUSMService({
            getCurrentSkeleton: () => null,
            getNumfmtParseOptions: () => ({ locale: 'en-US' }),
        });
        const { cellMatrix } = converter.convert(excelLocaleUsHtml);

        expect(cellMatrix.getValue(0, 0)?.v).toBe(1234.56);
    });

    it('parses French space and non-breaking-space thousands, Swiss apostrophes, General format, x:num, and text format', () => {
        const converter = new HtmlToUSMService({
            getCurrentSkeleton: () => null,
            getNumfmtParseOptions: () => ({ locale: 'en-US' }),
        });

        expect(converter.convert(excelLocaleFrHtml).cellMatrix.getValue(0, 0)?.v).toBe(1000.5);
        expect(converter.convert(excelLocaleFrNbspHtml).cellMatrix.getValue(0, 0)?.v).toBe(1000.5);
        expect(converter.convert(excelLocaleChHtml).cellMatrix.getValue(0, 0)?.v).toBe(1234.56);
        expect(converter.convert(excelLocaleViGeneralHtml).cellMatrix.getValue(0, 0)?.v).toBe(516382306730);
        expect(converter.convert(excelLocaleXNumHtml).cellMatrix.getValue(0, 0)?.v).toBe(516382306730);
        expect(converter.convert(excelLocaleTextHtml).cellMatrix.getValue(0, 0)?.v).toBe('516.382.306.730');
    });

    it('falls back to US parsing when Excel declares the same character for both separators', () => {
        const converter = new HtmlToUSMService({
            getCurrentSkeleton: () => null,
            getNumfmtParseOptions: () => ({ locale: 'en-US' }),
        });
        const { cellMatrix } = converter.convert(`
            <html><head><style>
                table { mso-displayed-decimal-separator:"\\,"; mso-displayed-thousand-separator:"\\,"; }
                .xl65 { mso-number-format:"\\#\\,\\#\\#0"; }
            </style></head>
            <body><table><tr><td class="xl65">1,234</td></tr></table></body></html>
        `);

        expect(cellMatrix.getValue(0, 0)?.v).toBe(1234);
    });

    it('ignores an invalid x:num value and parses the displayed locale number', () => {
        const converter = new HtmlToUSMService({
            getCurrentSkeleton: () => null,
            getNumfmtParseOptions: () => ({ locale: 'en-US' }),
        });
        const { cellMatrix } = converter.convert(`
            <html><head><style>
                table { mso-displayed-decimal-separator:"\\,"; mso-displayed-thousand-separator:"\\."; }
                .xl65 { mso-number-format:"\\#\\,\\#\\#0"; }
            </style></head>
            <body><table><tr><td class="xl65" x:num="not-a-number">516.382.306.730</td></tr></table></body></html>
        `);

        expect(cellMatrix.getValue(0, 0)?.v).toBe(516382306730);
    });

    it('does not convert a General-format cell that is not entirely a locale number', () => {
        const converter = new HtmlToUSMService({
            getCurrentSkeleton: () => null,
            getNumfmtParseOptions: () => ({ locale: 'en-US' }),
        });
        const { cellMatrix } = converter.convert(`
            <html><head><style>
                table { mso-displayed-decimal-separator:"\\,"; mso-displayed-thousand-separator:"\\."; }
            </style></head>
            <body><table>
                <tr><td></td></tr>
                <tr><td>id 516.382.306.730</td></tr>
            </table></body></html>
        `);

        expect(cellMatrix.getValue(0, 0)?.v).toBe('');
        expect(cellMatrix.getValue(1, 0)?.v).toBe('id 516.382.306.730');
    });

    it('parses locale percent values and parenthesized negatives', () => {
        const converter = new HtmlToUSMService({
            getCurrentSkeleton: () => null,
            getNumfmtParseOptions: () => ({ locale: 'en-US' }),
        });
        const { cellMatrix } = converter.convert(`
            <html><head><style>
                table { mso-displayed-decimal-separator:"\\,"; mso-displayed-thousand-separator:"\\."; }
                .xl65 { mso-number-format:"0\\.0%"; }
                .xl66 { mso-number-format:"\\#\\,\\#\\#0"; }
            </style></head>
            <body><table>
                <tr><td class="xl65">12,5%</td></tr>
                <tr><td class="xl66">(1.000)</td></tr>
            </table></body></html>
        `);

        expect(cellMatrix.getValue(0, 0)?.v).toBe(0.125);
        expect(cellMatrix.getValue(1, 0)?.v).toBe(-1000);
    });
});
