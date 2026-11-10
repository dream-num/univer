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
});
