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

import { describe, expect, it } from 'vitest';
import {
    handelExcelToJson,
    handelTableToJson,
    handleDomToJson,
    handlePlainToJson,
    handleStringToStyle,
    handleTableColgroup,
    handleTableMergeData,
    handleTableRowGroup,
    splitSpanText,
} from '../cell';

describe('cell utils', () => {
    it('should handle div wrapper and mixed text nodes when converting dom', () => {
        const wrapped = document.createElement('div');
        wrapped.innerHTML = '<div><span style="font-weight:bold">A</span></div>';
        const wrappedData = handleDomToJson(wrapped);
        expect(typeof wrappedData).toBe('object');

        const mixed = document.createElement('div');
        const text = document.createTextNode('mixed-text');
        mixed.appendChild(text);
        mixed.appendChild(document.createElement('span'));

        const mixedData = handleDomToJson(mixed);
        expect(typeof mixedData).toBe('object');
    });

    it('should convert simple dom nodes to plain string', () => {
        const empty = document.createElement('div');
        empty.textContent = 'plain';
        expect(handleDomToJson(empty)).toBe('plain');

        const singleText = document.createElement('div');
        singleText.appendChild(document.createTextNode('hello'));
        expect(handleDomToJson(singleText)).toBe('hello');
    });

    it('should convert rich dom content to document data', () => {
        const rich = document.createElement('div');
        rich.innerHTML = '<span style="font-weight: bold">Hello</span><span>World</span>';

        const data = handleDomToJson(rich);
        expect(typeof data).toBe('object');
        if (typeof data !== 'string') {
            expect(data.body?.dataStream).toContain('\r\n');
            expect(data.body?.textRuns?.length).toBeGreaterThan(0);
        }
    });

    it('should parse style with text, alignment and border properties', () => {
        const element = document.createElement('span');
        element.dataset.vertical = '1';
        const style = handleStringToStyle(
            element,
            [
                'font-weight:bold',
                'font-style:italic',
                'font-family:"Arial"',
                'font-size:16px',
                'color:rgb(1,2,3)',
                'background-color:#ff0000',
                'text-decoration-line:underline',
                'text-decoration-color:rgb(9,9,9)',
                'text-decoration-style:2',
                'vertical-align:sub',
                'transform:rotate(30deg)',
                'text-align:center',
                'word-wrap:break-word',
                'border-color:rgb(1,1,1) rgb(2,2,2)',
                'border-width:1px 2px',
                'border-style:solid dashed',
            ].join(';')
        );

        expect(style.bl).toBe(1);
        expect(style.it).toBe(1);
        expect(style.ff).toBe('Arial');
        expect(style.fs).toBeGreaterThan(0);
        expect(style.cl).toBeDefined();
        expect(style.bg).toBeDefined();
        expect(style.ul?.s).toBe(1);
        expect(style.va).toBeDefined();
        expect(style.tr).toEqual({ a: 30, v: 1 });
        expect(style.ht).toBe(2);
        expect(style.tb).toBe(3);
        expect(style.bd).toBeDefined();
    });

    it('should parse additional style variants and clamp font sizes', () => {
        const style = handleStringToStyle(
            undefined,
            [
                'font-size:2px',
                'text-decoration:line-through solid',
                'univer-underline:true',
                'text-overflow:clip',
                'white-space:nowrap',
                'border:1px solid #111',
                '--data-rotate:(0deg ,1)',
            ].join(';')
        );
        expect(style.fs).toBe(9);
        expect(style.st?.s).toBe(1);
        expect(style.ul?.s).toBe(1);
        expect(style.tb).toBe(1);
        expect(style.bd).toBeDefined();
        expect(style.tr).toEqual({ a: 0, v: 1 });

        const largeStyle = handleStringToStyle(undefined, 'font-size:400px;vertical-align:super;text-align:right;');
        expect(largeStyle.fs).toBe(78);
        expect(largeStyle.ht).toBe(3);
    });

    it('should parse additional style branches and clean empty border objects', () => {
        const style = handleStringToStyle(
            undefined,
            [
                'font-weight:normal',
                'font-style:normal',
                'text-decoration-line:line-through',
                'text-decoration-color:#112233',
                'text-decoration-style:3',
                'text-decoration-line:overline',
                'text-decoration-color:#445566',
                'text-decoration-style:2',
                'text-decoration:overline solid',
                'vertical-align:top',
                'vertical-align:middle',
                'vertical-align:bottom',
                'vertical-align:baseline',
                'text-align:left',
                'text-align:justify',
                'text-align:inherit',
                'text-break:overflow',
                'white-space:normal',
                'white-space:clip',
                'border-color:rgb(1,1,1) rgb(2,2,2) rgb(3,3,3) rgb(4,4,4)',
                'border-width:1px 2px 3px 4px',
                'border-style:solid dashed dotted double',
                'border-top:1px solid #123456',
                'border-left:1px solid #654321',
                'border-right:1px solid #abcdef',
                '--data-rotate:(-12deg)',
            ].join(';')
        );

        expect(style.bl).toBe(0);
        expect(style.it).toBe(0);
        expect(style.st?.s).toBe(1);
        expect(style.ol?.s).toBe(1);
        expect(style.vt).toBe(3);
        expect(style.va).toBeDefined();
        expect(style.ht).toBe(0);
        expect(style.tb).toBe(2);
        expect(style.bd).toBeDefined();
        expect(style.tr).toEqual({ a: -12 });

        const borderNone = handleStringToStyle(undefined, 'border:none;');
        expect(borderNone.bd).toBeUndefined();
    });

    it('should split span text with newline handling', () => {
        expect(splitSpanText('')).toEqual(['']);
        expect(splitSpanText('a\nb')).toEqual(['a', '\r\nb']);
    });

    it('should parse table colgroup widths', () => {
        expect(handleTableColgroup('<table><tr><td>A</td></tr></table>')).toEqual([]);

        const widths = handleTableColgroup(
            '<table><colgroup><col width="100px" span="2"/><col width="72pt"/><col width="96"/></colgroup><tr><td>A</td><td>B</td><td>C</td><td>D</td></tr></table>'
        );
        expect(widths.length).toBe(4);
        expect(widths[0]).toBe(100);
    });

    it('should parse table colgroup width fallback and empty row groups', () => {
        const widths = handleTableColgroup('<table><colgroup><col/></colgroup><tr><td>A</td></tr></table>');
        expect(widths).toEqual([72]);
        expect(handleTableRowGroup('<table></table>')).toEqual([]);
    });

    it('should parse table row heights', () => {
        const heights = handleTableRowGroup(
            '<table><tr><td style="height:20px">A</td><td rowSpan="2" style="height:99px">B</td></tr><tr><td style="height:30px">C</td></tr></table>'
        );

        expect(heights).toEqual([20, 30]);
    });

    it('should parse html table to sheet-like matrix with merge metadata', () => {
        const table = handelTableToJson(
            '<table><tr><td rowSpan="2" colSpan="2"><span style="font-weight:bold">A</span></td><td>C</td></tr><tr><td>D</td></tr></table>'
        );

        expect(table.length).toBe(2);
        expect(table[0][0].mc).toEqual({ rs: 1, cs: 1, r: 0, c: 0 });
        expect(table[0][2].v).toBe('C');
        expect(table[1][0]).toEqual({ mc: null });
    });

    it('should handle empty and irregular tables', () => {
        expect(handelTableToJson('<table></table>')).toEqual([]);

        const irregular = handelTableToJson(
            '<table><tr><td>A</td></tr><tr><td>B</td><td>C</td></tr></table>'
        );
        expect(irregular.length).toBe(2);
        expect(irregular[1][0].v).toBe('B');
    });

    it('should parse plain text grid and drop broken rows', () => {
        const plain = handlePlainToJson('A\tB\nC\tD\nE');
        expect(plain.length).toBe(2);
        expect(plain[0][0].v).toBe('A');
        expect(plain[1][1].m).toBe('D');
    });

    it('should map empty plain cells to null', () => {
        const plain = handlePlainToJson('A\t\nB\tC');
        expect(plain[0][1]).toBeNull();
    });

    it('should extract merge ranges and normalize merged placeholder cells', () => {
        const data = [
            [{ v: 'A', mc: { r: 0, c: 0, rs: 1, cs: 1 } }, { mc: null }],
            [{ mc: null }, { v: 'B' }],
        ];

        const result = handleTableMergeData(data as any, {
            startRow: 2,
            startColumn: 3,
            endRow: 3,
            endColumn: 4,
        });

        expect(result.mergeData).toEqual([{ startRow: 2, endRow: 3, startColumn: 3, endColumn: 4 }]);
        expect(result.data[0][0].mc).toBeUndefined();
        expect(result.data[0][1]).toBeNull();
    });

    it('should parse excel html with style and merged cells', () => {
        const html = `
            <html>
                <style>
                    <!--
                    .bold { font-weight: bold; color: rgb(1, 2, 3); }
                    .bg { background-color: #00ff00; }
                    -->
                </style>
                <table>
                    <tr>
                        <td class="bold" rowSpan="2" colSpan="2"><span>X</span></td>
                        <td class="bg">Y</td>
                    </tr>
                    <tr>
                        <td>Z</td>
                    </tr>
                </table>
            </html>
        `;

        const result = handelExcelToJson(html);

        expect(result?.length).toBe(2);
        expect(result?.[0][0].mc).toEqual({ rs: 1, cs: 1, r: 0, c: 0 });
        expect(result?.[0][0].s).toBeDefined();
        expect(result?.[0][2].v).toBe('Y');
    });

    it('should return undefined when excel html has no style block', () => {
        expect(handelExcelToJson('<html><table><tr><td>A</td></tr></table></html>')).toBeUndefined();
    });

    it('should handle excel html with style but no row and irregular columns', () => {
        expect(handelExcelToJson('<html><style>.x{font-weight:bold;}</style><table></table></html>')).toEqual([]);

        const irregular = handelExcelToJson(`
            <html>
                <style>
                    .x { font-weight: bold; }
                </style>
                <table>
                    <tr><td class=\"x\">A</td></tr>
                    <tr><td>B</td><td>C</td></tr>
                </table>
            </html>
        `);

        expect(irregular?.[0][0].v).toBe('A');
        expect(irregular?.[1][0].v).toBe('B');
    });
});
