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

import type { IScale } from '@univerjs/core';
import type { UniverRenderingContext } from '../../../context';

import type { IAColumnCfg, IAColumnCfgObj, IHeaderStyleCfg } from '../interfaces';
import type { SpreadsheetSkeleton } from '../sheet.render-skeleton';
import { numberToABC } from '@univerjs/core';
import { DEFAULT_FONTFACE_PLANE, FIX_ONE_PIXEL_BLUR_OFFSET, MIDDLE_CELL_POS_MAGIC_NUMBER } from '../../../basics/const';
import { getColor } from '../../../basics/tools';
import { SheetColumnHeaderExtensionRegistry } from '../../extension';
import { SheetExtension } from './sheet-extension';

const UNIQUE_KEY = 'DefaultColumnHeaderLayoutExtension';
export interface IColumnsHeaderCfgParam {
    headerStyle?: Partial<IHeaderStyleCfg>;
    columnsCfg?: IAColumnCfg[];
}
const DEFAULT_COLUMN_STYLE = {
    fontSize: 13,
    fontFamily: DEFAULT_FONTFACE_PLANE,
    fontColor: '#000000',
    backgroundColor: getColor([248, 249, 250]),
    borderColor: getColor([217, 217, 217]),
    textAlign: 'center',
    textBaseline: 'middle',
} as const;

/**
 * Column Header Bar, include a lot of columns header
 */
export class ColumnHeaderLayout extends SheetExtension {
    override uKey = UNIQUE_KEY;
    override Z_INDEX = 10;
    columnsCfg: IAColumnCfg[] = [];
    headerStyle: IHeaderStyleCfg = {
        fontSize: DEFAULT_COLUMN_STYLE.fontSize,
        fontFamily: DEFAULT_COLUMN_STYLE.fontFamily,
        fontColor: DEFAULT_COLUMN_STYLE.fontColor,
        backgroundColor: DEFAULT_COLUMN_STYLE.backgroundColor,
        borderColor: DEFAULT_COLUMN_STYLE.borderColor,
        textAlign: DEFAULT_COLUMN_STYLE.textAlign,
        textBaseline: DEFAULT_COLUMN_STYLE.textBaseline,
    };

    constructor(cfg?: IColumnsHeaderCfgParam) {
        super();
        if (cfg) {
            this.configHeaderColumn(cfg);
        }
    }

    configHeaderColumn(cfg: IColumnsHeaderCfgParam): void {
        this.columnsCfg = cfg.columnsCfg || [];
        this.headerStyle = { ...this.headerStyle, ...cfg.headerStyle };
    }

    getCfgOfCurrentColumn(colIndex: number): [IAColumnCfgObj, boolean] {
        let mergeWithSpecCfg;
        let curColSpecCfg;
        const columnsCfg = this.columnsCfg || [];

        if (columnsCfg[colIndex]) {
            if (typeof columnsCfg[colIndex] == 'string') {
                columnsCfg[colIndex] = { text: columnsCfg[colIndex] } as IAColumnCfgObj;
            }
            curColSpecCfg = columnsCfg[colIndex] as IHeaderStyleCfg & { text: string };
            mergeWithSpecCfg = { ...this.headerStyle, ...curColSpecCfg };
        } else {
            mergeWithSpecCfg = { ...this.headerStyle, text: numberToABC(colIndex) };
        }
        const specStyle = Object.keys(curColSpecCfg || {}).length > 1; // if cfg have more keys than 'text', means there would be special style config for this column.
        return [mergeWithSpecCfg, specStyle] as [IAColumnCfgObj, boolean];
    }

    setStyleToCtx(ctx: UniverRenderingContext, columnStyle: Partial<IHeaderStyleCfg>): void {
        if (columnStyle.textAlign) ctx.textAlign = columnStyle.textAlign;
        if (columnStyle.textBaseline) ctx.textBaseline = columnStyle.textBaseline;
        if (columnStyle.fontColor) ctx.fillStyle = columnStyle.fontColor;
        if (columnStyle.borderColor) ctx.strokeStyle = columnStyle.borderColor;
        if (columnStyle.fontSize) ctx.font = `${columnStyle.fontSize}px ${DEFAULT_FONTFACE_PLANE}`;
    }

    // eslint-disable-next-line max-lines-per-function
    override draw(ctx: UniverRenderingContext, parentScale: IScale, spreadsheetSkeleton: SpreadsheetSkeleton): void {
        const { rowColumnSegment, columnHeaderHeight = 0 } = spreadsheetSkeleton;
        const { startColumn, endColumn } = rowColumnSegment;

        if (!spreadsheetSkeleton || columnHeaderHeight === 0) {
            return;
        }

        const { rowHeightAccumulation, columnTotalWidth, columnWidthAccumulation, rowTotalHeight } = spreadsheetSkeleton;

        if (
            !rowHeightAccumulation ||
            !columnWidthAccumulation ||
            columnTotalWidth === undefined ||
            rowTotalHeight === undefined
        ) {
            return;
        }

        const scale = this._getScale(parentScale);
        this.setStyleToCtx(ctx, this.headerStyle);

        // background
        ctx.save();
        ctx.fillStyle = this.headerStyle.backgroundColor;
        ctx.fillRectByPrecision(0, 0, columnTotalWidth, columnHeaderHeight);
        ctx.restore();

        ctx.setLineWidthByPrecision(1);
        ctx.translateWithPrecisionRatio(FIX_ONE_PIXEL_BLUR_OFFSET, FIX_ONE_PIXEL_BLUR_OFFSET);
        let preColumnPosition = 0;

        // draw each column header
        for (let c = startColumn - 1; c <= endColumn; c++) {
            if (c < 0 || c > columnWidthAccumulation.length - 1) {
                continue;
            }

            const columnEndPosition = columnWidthAccumulation[c];
            if (preColumnPosition === columnEndPosition) {
                continue;// Skip hidden columns
            }
            const cellBound = { left: preColumnPosition, top: 0, right: columnEndPosition, bottom: columnHeaderHeight, width: columnEndPosition - preColumnPosition, height: columnHeaderHeight };
            const [curColumnCfg, specStyle] = this.getCfgOfCurrentColumn(c);

            // background
            if (specStyle && curColumnCfg.backgroundColor) {
                ctx.save();
                ctx.fillStyle = curColumnCfg.backgroundColor;
                ctx.fillRectByPrecision(cellBound.left, cellBound.top, cellBound.width, cellBound.height);
                ctx.restore();
            }

            // vertical line border
            ctx.beginPath();
            ctx.moveToByPrecision(cellBound.right, 0);
            ctx.lineToByPrecision(cellBound.right, cellBound.height);
            ctx.stroke();
            // column header text
            const textX = (() => {
                switch (curColumnCfg.textAlign) {
                    case 'center':
                        return cellBound.left + (cellBound.right - cellBound.left) / 2;
                    case 'right':
                        return cellBound.right - MIDDLE_CELL_POS_MAGIC_NUMBER * 3;
                    case 'left':
                        return cellBound.left + MIDDLE_CELL_POS_MAGIC_NUMBER * 3;
                    default: // center
                        return cellBound.left + (cellBound.right - cellBound.left) / 2;
                }
            })();
            const middleYCellRect = cellBound.height / 2 + MIDDLE_CELL_POS_MAGIC_NUMBER; // Magic number 1, because the vertical alignment appears to be off by 1 pixel

            if (specStyle) {
                ctx.save();
                ctx.beginPath();
                this.setStyleToCtx(ctx, curColumnCfg);
                ctx.rectByPrecision(cellBound.left, cellBound.top, cellBound.width, cellBound.height);
                ctx.clip();
            }

            ctx.fillText(curColumnCfg.text, textX, middleYCellRect);
            if (specStyle) {
                ctx.restore();
            }

            preColumnPosition = columnEndPosition;
        }

        // border bottom line
        const columnHeaderHeightFix = columnHeaderHeight - 0.5 / scale;
        ctx.beginPath();
        ctx.moveToByPrecision(0, columnHeaderHeightFix);
        ctx.lineToByPrecision(columnTotalWidth, columnHeaderHeightFix);
        ctx.stroke();
    }
}

SheetColumnHeaderExtensionRegistry.add(new ColumnHeaderLayout());
