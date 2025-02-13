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

import type { ICellData, ICellDataForSheetInterceptor, ICellWithCoord, IRange, IRangeWithCoord, ISelectionCell } from '../sheets/typedef';
import type { Worksheet } from '../sheets/worksheet';
import type { IDocumentData } from '../types/interfaces/i-document-data';
import type { IColorStyle, IStyleData } from '../types/interfaces/i-style-data';
import type { Nullable } from './types';
import { RANGE_TYPE } from '../sheets/typedef';
import {
    BaselineOffset,
    BorderStyleTypes,
    HorizontalAlign,
    TextDirection,
    VerticalAlign,
    WrapStrategy,
} from '../types/enum';
import { ColorBuilder } from './color/color';
import { Tools } from './tools';

/**
 * Data type convert, convert ICellWithCoord to IRangeWithCoord
 * @param cellInfo
 * @returns IRangeWithCoord
 */
export function convertCellToRange(cellInfo: ICellWithCoord): IRangeWithCoord {
    const { actualRow, actualColumn, isMerged, isMergedMainCell, mergeInfo } = cellInfo;
    let { startY, endY, startX, endX } = cellInfo;
    let startRow = actualRow;
    let startColumn = actualColumn;
    let endRow = actualRow;
    let endColumn = actualColumn;

    if (isMerged && mergeInfo) {
        const {
            startRow: mergeStartRow,
            startColumn: mergeStartColumn,
            endRow: mergeEndRow,
            endColumn: mergeEndColumn,
            startY: mergeStartY,
            endY: mergeEndY,
            startX: mergeStartX,
            endX: mergeEndX,
        } = mergeInfo;
        startRow = mergeStartRow;
        startColumn = mergeStartColumn;
        endRow = mergeEndRow;
        endColumn = mergeEndColumn;
        startY = mergeStartY;
        endY = mergeEndY;
        startX = mergeStartX;
        endX = mergeEndX;
    }

    if (isMergedMainCell) {
        startY = mergeInfo.startY;
        endY = mergeInfo.endY;
        startX = mergeInfo.startX;
        endX = mergeInfo.endX;
        endRow = mergeInfo.endRow;
        endColumn = mergeInfo.endColumn;
    }

    return {
        startRow,
        startColumn,
        endRow,
        endColumn,
        startY,
        endY,
        startX,
        endX,
    };
}

/**
 * @deprecated use `convertCellToRange` instead
 */
const makeCellToSelection = convertCellToRange;
export { makeCellToSelection };

export function makeCellRangeToRangeData(cellInfo: Nullable<ISelectionCell>): Nullable<IRange> {
    if (!cellInfo) {
        return;
    }
    const {
        actualRow,
        actualColumn,
        isMerged,
        isMergedMainCell,
        startRow: mergeStartRow,
        startColumn: mergeStartColumn,
        endRow: mergeEndRow,
        endColumn: mergeEndColumn,
    } = cellInfo;
    let startRow = actualRow;
    let startColumn = actualColumn;
    let endRow = actualRow;
    let endColumn = actualColumn;
    if (isMerged || isMergedMainCell) {
        startRow = mergeStartRow;
        startColumn = mergeStartColumn;
        endRow = mergeEndRow;
        endColumn = mergeEndColumn;
    }

    return {
        startRow,
        startColumn,
        endRow,
        endColumn,
    };
}

export function isEmptyCell(cell: Nullable<ICellData>) {
    if (!cell) {
        return true;
    }

    const content = cell?.v?.toString() || '';
    if (content.length === 0 && !cell.p) {
        return true;
    }
    return false;
}

export function isCellCoverable(cell: Nullable<ICellDataForSheetInterceptor>) {
    return isEmptyCell(cell) && cell?.coverable !== false;
}

export function getColorStyle(color: Nullable<IColorStyle>): Nullable<string> {
    if (color) {
        if (color.rgb) {
            return color.rgb;
        }

        if (color.th) {
            return new ColorBuilder().setThemeColor(color.th).asThemeColor().asRgbColor().getCssString();
        }
    }

    return null;
}

/**
 * A string starting with an equal sign is a formula
 * @param value
 * @returns
 */
export function isFormulaString(value: any): boolean {
    return Tools.isString(value) && value.substring(0, 1) === '=' && value.length > 1;
}

/**
 * any string
 * @param value
 * @returns
 */
export function isFormulaId(value: any): boolean {
    return Tools.isString(value) && value.length > 0;
}

/**
 * transform style object to string
 * @param style
 * @returns
 */

// eslint-disable-next-line max-lines-per-function
export function handleStyleToString(style: IStyleData, isCell: boolean = false) {
    let str = '';
    const styleMap = new Map([
        [
            'ff',
            () => {
                if (style.ff) {
                    str += `font-family: ${style.ff}; `;
                }
            },
        ],
        [
            'fs',
            () => {
                if (style.fs) {
                    let fs = style.fs;

                    // subscript / superscript, Font size for superscripts and subscripts is halved
                    if (style.va) {
                        fs /= 2;
                    }
                    str += `font-size: ${fs}pt; `;
                }

                // const fs = isCss ? `${style.fs}px` : `${pxToPt(style.fs || 14)}pt`;
                // str += `font-size: ${fs}; `;
            },
        ],
        [
            'it',
            () => {
                if (style.it) {
                    str += 'font-style: italic; ';
                }
            },
        ],
        [
            'bl',
            () => {
                if (style.bl) {
                    str += 'font-weight: bold; ';
                }
            },
        ],
        [
            'ul',
            () => {
                if (style.ul?.s) {
                    // If there are existing lines, add new lines
                    if (str.indexOf('text-decoration-line') > -1) {
                        str = str.replace(/(text-decoration-line:\s*[^;]+)(?=;)/g, (_, p1) => `${p1} underline`);
                    } else {
                        str += 'text-decoration: underline; ';
                    }
                    if (style.ul.cl && str.indexOf('text-decoration-color') === -1) {
                        str += `text-decoration-color: ${getColorStyle(style.ul.cl)}; `;
                    }
                    if (style.ul.t && str.indexOf('text-decoration-style') === -1) {
                        str += `text-decoration-style: ${style.ul.t} `;
                    }
                }
            },
        ],
        [
            'st',
            () => {
                if (style.st?.s) {
                    if (str.indexOf('text-decoration-line') > -1) {
                        str = str.replace(/(text-decoration-line:\s*[^;]+)(?=;)/g, (_, p1) => `${p1} line-through`);
                    } else {
                        str += 'text-decoration-line: line-through; ';
                    }
                    if (style.st.cl && str.indexOf('text-decoration-color') === -1) {
                        str += `text-decoration-color: ${getColorStyle(style.st.cl)}; `;
                    }
                    if (style.st.t && str.indexOf('text-decoration-style') === -1) {
                        str += `text-decoration-style: ${style.st.t} `;
                    }
                }
            },
        ],
        [
            'ol',
            () => {
                if (style.ol?.s) {
                    if (str.indexOf('text-decoration-line') > -1) {
                        str = str.replace(/(text-decoration-line:\s*[^;]+)(?=;)/g, (_, p1) => `${p1} overline`);
                    } else {
                        str += 'text-decoration-line: overline; ';
                    }
                    if (style.ol.cl && str.indexOf('text-decoration-color') === -1) {
                        str += `text-decoration-color: ${getColorStyle(style.ol.cl)}; `;
                    }
                    if (style.ol.t && str.indexOf('text-decoration-style') === -1) {
                        str += `text-decoration-style: ${style.ol.t} `;
                    }
                }
            },
        ],
        [
            'bg',
            () => {
                if (style.bg) {
                    str += `background: ${getColorStyle(style.bg)}; `;
                }
            },
        ],
        [
            'bd',
            () => {
                if (style.bd?.b) {
                    str += `border-bottom: ${getBorderStyle(style.bd?.b.s)} ${getColorStyle(style.bd.b.cl) ?? ''}; `;
                }
                if (style.bd?.t) {
                    str += `border-top: ${getBorderStyle(style.bd?.t.s)} ${getColorStyle(style.bd.t.cl) ?? ''}; `;
                }
                if (style.bd?.r) {
                    str += `border-right: ${getBorderStyle(style.bd?.r.s)} ${getColorStyle(style.bd.r.cl) ?? ''}; `;
                }
                if (style.bd?.l) {
                    str += `border-left: ${getBorderStyle(style.bd?.l.s)} ${getColorStyle(style.bd.l.cl) ?? ''}; `;
                }
            },
        ],
        [
            'cl',
            () => {
                if (style.cl) {
                    str += `color: ${getColorStyle(style.cl)}; `;
                }
            },
        ],
        [
            'va',
            () => {
                if (style.va === BaselineOffset.SUBSCRIPT) {
                    str += 'vertical-align: sub; ';
                } else if (style.va === BaselineOffset.SUPERSCRIPT) {
                    str += 'vertical-align: super; ';
                }
            },
        ],
        [
            'td',
            () => {
                if (style.td === TextDirection.LEFT_TO_RIGHT) {
                    str += 'direction: ltr; ';
                } else if (style.td === TextDirection.RIGHT_TO_LEFT) {
                    str += 'direction: rtl; ';
                }
            },
        ],
        [
            'tr',
            () => {
                if (style.tr) {
                    str += `--data-rotate: (${style.tr?.a}deg${style.tr?.v ? ` ,${style.tr?.v}` : ''});`;
                }
            },
        ],
        [
            'ht',
            () => {
                if (style.ht === HorizontalAlign.LEFT) {
                    str += 'text-align: left; ';
                } else if (style.ht === HorizontalAlign.RIGHT) {
                    str += 'text-align: right; ';
                } else if (style.ht === HorizontalAlign.CENTER) {
                    str += 'text-align: center; ';
                } else if (style.ht === HorizontalAlign.JUSTIFIED) {
                    str += 'text-align: justify; ';
                }
            },
        ],
        [
            'vt',
            () => {
                if (style.vt === VerticalAlign.BOTTOM) {
                    str += 'vertical-align: bottom; ';
                } else if (style.vt === VerticalAlign.TOP) {
                    str += 'vertical-align: top; ';
                } else if (style.vt === VerticalAlign.MIDDLE) {
                    str += 'vertical-align: middle; ';
                }
            },
        ],
        [
            'tb',
            () => {
                if (style.tb === WrapStrategy.CLIP) {
                    str += 'white-space: nowrap; overflow-x: hidden; ';
                } else if (style.tb === WrapStrategy.WRAP) {
                    str += 'white-space: normal;';
                }
            },
        ],
        [
            'pd',
            () => {
                // let b = '';
                // let t = '';
                // let l = '';
                // let r = '';

                // if (isCss) {
                //     b = `${pxToPt(style.pd?.b || 0)}pt`;
                //     t = `${pxToPt(style.pd?.t || 0)}pt`;
                //     l = `${pxToPt(style.pd?.l || 0)}pt`;
                //     r = `${pxToPt(style.pd?.r || 0)}pt`;
                // } else {
                const b = `${style.pd?.b}pt`;
                const t = `${style.pd?.t}pt`;
                const l = `${style.pd?.l}pt`;
                const r = `${style.pd?.r}pt`;
                // }
                if (style.pd?.b) {
                    str += `padding-bottom: ${b}; `;
                }
                if (style.pd?.t) {
                    str += `padding-top: ${t}; `;
                }
                if (style.pd?.l) {
                    str += `padding-left: ${l}; `;
                }
                if (style.pd?.r) {
                    str += `padding-right: ${r}; `;
                }
            },
        ],
    ]);
    const cellSkip = ['bd', 'tr', 'tb'];
    for (const k in style) {
        if (isCell && cellSkip.includes(k)) continue; // Cell styles to skip when entering edit mode
        styleMap.get(k)?.();
    }
    return str;
}

function getBorderStyle(type: BorderStyleTypes) {
    let str = '';
    if (type === BorderStyleTypes.NONE) {
        str = 'none';
    } else if (type === BorderStyleTypes.THIN) {
        str = '0.5pt solid';
    } else if (type === BorderStyleTypes.HAIR) {
        str = '0.5pt double';
    } else if (type === BorderStyleTypes.DOTTED) {
        str = '0.5pt dotted';
    } else if (type === BorderStyleTypes.DASHED) {
        str = '0.5pt dashed';
    } else if (type === BorderStyleTypes.DASH_DOT) {
        str = '0.5pt dashed';
    } else if (type === BorderStyleTypes.DASH_DOT_DOT) {
        str = '0.5pt dotted';
    } else if (type === BorderStyleTypes.DOUBLE) {
        str = '0.5pt double';
    } else if (type === BorderStyleTypes.MEDIUM) {
        str = '1pt solid';
    } else if (type === BorderStyleTypes.MEDIUM_DASHED) {
        str = '1pt dashed';
    } else if (type === BorderStyleTypes.MEDIUM_DASH_DOT) {
        str = '1pt dashed';
    } else if (type === BorderStyleTypes.MEDIUM_DASH_DOT_DOT) {
        str = '1pt dotted';
    } else if (type === BorderStyleTypes.SLANT_DASH_DOT) {
        str = '0.5pt dashed';
    } else if (type === BorderStyleTypes.THICK) {
        str = '1.5pt solid';
    }
    return str;
}

export function getBorderStyleType(type: string) {
    let str = 0;
    type = type.trim();
    if (type === 'none') {
        str = BorderStyleTypes.NONE;
    } else if (type === '0.5pt solid') {
        str = BorderStyleTypes.THIN;
    } else if (type === '0.5pt double') {
        str = BorderStyleTypes.HAIR;
    } else if (type === '0.5pt dotted') {
        str = BorderStyleTypes.DOTTED;
    } else if (type === '0.5pt dashed') {
        str = BorderStyleTypes.DASHED;
    } else if (type === '1pt solid') {
        str = BorderStyleTypes.MEDIUM;
    } else if (type === '1pt dashed') {
        str = BorderStyleTypes.MEDIUM_DASHED;
    } else if (type === '1pt dotted') {
        str = BorderStyleTypes.MEDIUM_DASH_DOT_DOT;
    } else if (type === '1.5pt solid') {
        str = BorderStyleTypes.THICK;
    } else if (!type.includes('none')) {
        str = BorderStyleTypes.THIN;
    } else {
        return BorderStyleTypes.NONE;
    }
    return str;
}

export function getDocsUpdateBody(model: IDocumentData, segmentId?: string) {
    let body = model.body;

    if (segmentId) {
        const { headers, footers } = model;

        if (headers?.[segmentId]) {
            body = headers[segmentId].body;
        } else if (footers?.[segmentId]) {
            body = footers[segmentId].body;
        }
    }

    return body;
}

export function isValidRange(range: IRange, worksheet?: Worksheet): boolean {
    const { startRow, endRow, startColumn, endColumn, rangeType } = range;
    if (
        startRow < 0
        || startColumn < 0
        || endRow < 0
        || endColumn < 0
    ) {
        return false;
    }

    if (!(Number.isNaN(startRow) && Number.isNaN(endRow)) && rangeType === RANGE_TYPE.COLUMN) {
        return false;
    }

    if (!(Number.isNaN(startColumn) && Number.isNaN(endColumn)) && rangeType === RANGE_TYPE.ROW) {
        return false;
    }

    if (
        rangeType !== RANGE_TYPE.ROW &&
        rangeType !== RANGE_TYPE.COLUMN && (
            Number.isNaN(startColumn) ||
            Number.isNaN(startRow) ||
            Number.isNaN(endColumn) ||
            Number.isNaN(endRow)
        )
    ) {
        return false;
    }

    if (worksheet) {
        const rowCount = worksheet.getRowCount();
        const colCount = worksheet.getColumnCount();
        if (endRow >= rowCount || endColumn >= colCount) {
            return false;
        }
    }

    return true;
}

/**
 * Covert row/column to range object
 * @param row
 * @param col
 * @returns
 */
export function cellToRange(row: number, col: number): IRange {
    return { startRow: row, endRow: row, startColumn: col, endColumn: col };
}
