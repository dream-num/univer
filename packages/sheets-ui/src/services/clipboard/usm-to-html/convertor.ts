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

import type { ICellData, ObjectMatrix } from '@univerjs/core';

import type { IDiscreteRange } from '../../../controllers/utils/range-tools';
import type { ICellDataWithSpanInfo, IClipboardPropertyItem, ISheetClipboardHook } from '../type';

/**
 *
 * @param row index of the copied row
 * @param cols
 * @param hooks
 * @returns
 */
function getRowContent(
    row: number,
    cols: number[],
    hooks: ISheetClipboardHook[],
    matrix: ObjectMatrix<ICellDataWithSpanInfo>,
    mergeSet: Set<string>
) {
    const properties = hooks.map((hook) => hook.onCopyRow?.(row)).filter((v) => !!v) as IClipboardPropertyItem[];
    const mergedProperties = mergeProperties(properties);
    const str = zipClipboardPropertyItemToString(mergedProperties);
    const tds = cols
        .map((col) => {
            if (!mergeSet.has(`${row}-${col}`)) {
                const v = matrix.getValue(row, col);
                if (v?.rowSpan && v?.colSpan) {
                    for (let i = row; i < row + v.rowSpan; i++) {
                        for (let j = col; j < col + v.colSpan; j++) {
                            mergeSet.add(`${i}-${j}`);
                        }
                    }
                }
                return getTDContent(row, col, hooks, matrix);
            }
            return null;
        })
        .filter((v) => !!v)
        .join('');

    return `<tr${str}>${tds}</tr>`;
}

/**
 * Get content of a single td element.
 * @param row index of the copied cell
 * @param col index of the copied cell
 * @returns
 */
function getTDContent(
    row: number,
    col: number,
    hooks: ISheetClipboardHook[],
    matrix: ObjectMatrix<ICellDataWithSpanInfo>
) {
    const v = matrix.getValue(row, col);
    const properties = hooks
        .map((hook) => hook.onCopyCellStyle?.(row, col, v?.rowSpan, v?.colSpan))
        .filter((v) => !!v) as IClipboardPropertyItem[];
    const mergedProperties = mergeProperties(properties);
    const str = zipClipboardPropertyItemToString(mergedProperties);
    const content = hooks.reduce((acc, hook) => acc || hook.onCopyCellContent?.(row, col) || '', '');
    return `<td${str}>${content}</td>`;
}

function getColStyle(cols: number[], hooks: ISheetClipboardHook[]) {
    const str = cols
        .map((col) => {
            const properties = hooks
                .map((hook) => hook.onCopyColumn?.(col))
                .filter((v) => !!v) as IClipboardPropertyItem[];
            const mergedProperties = mergeProperties(properties);
            const str = zipClipboardPropertyItemToString(mergedProperties);
            return `<col ${str} />`;
        })
        .join('');

    return `<colgroup>${str}</colgroup>`;
}

function mergeProperties(properties: IClipboardPropertyItem[]): IClipboardPropertyItem {
    return properties.reduce((acc, cur) => {
        const keys = Object.keys(cur);
        keys.forEach((key) => {
            if (!acc[key]) {
                acc[key] = cur[key];
            } else {
                acc[key] += `;${cur[key]}`;
            }
        });
        return acc;
    }, {});
}

function zipClipboardPropertyItemToString(item: IClipboardPropertyItem) {
    return Object.keys(item).reduce((acc, cur) => `${acc} ${cur}="${item[cur]}"`, '');
}

export class USMToHtmlService {
    convert(
        matrix: ObjectMatrix<
            ICellData & {
                rowSpan?: number | undefined;
                colSpan?: number | undefined;
            }
        >,
        range: IDiscreteRange,
        hooks: ISheetClipboardHook[]
    ): string {
        const { cols, rows } = range;
        if (!cols.length) {
            return '';
        }
        const colStyles = getColStyle(cols, hooks);
        // row styles and table contents
        const rowContents: string[] = [];
        const mergeSet = new Set<string>();
        rows.forEach((row) => {
            rowContents.push(getRowContent(row, cols, hooks, matrix, mergeSet));
        });

        const html = `<google-sheets-html-origin><table xmlns="http://www.w3.org/1999/xhtml" cellspacing="0" cellpadding="0" dir="ltr" style="table-layout:fixed;font-size:10pt;font-family:Arial;width:0px;border-collapse:collapse;border:none">${colStyles}
<tbody>${rowContents.join('')}</tbody></table>`;
        return html;
    }
}
