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
import type { IARowCfg, IARowCfgObj, IHeaderStyleCfg, IRowStyleCfg } from '../interfaces';
import type { SpreadsheetSkeleton } from '../sheet.render-skeleton';
import { DEFAULT_FONTFACE_PLANE, FIX_ONE_PIXEL_BLUR_OFFSET, MIDDLE_CELL_POS_MAGIC_NUMBER } from '../../../basics/const';
import { getColor } from '../../../basics/tools';
import { SheetRowHeaderExtensionRegistry } from '../../extension';
import { SheetExtension } from './sheet-extension';

const UNIQUE_KEY = 'DefaultRowHeaderLayoutExtension';

export interface IRowsHeaderCfgParam {
    headerStyle?: Partial<IRowStyleCfg>;
    rowsCfg?: Record<number, IARowCfg>;
}

const DEFAULT_ROW_STYLE = {
    fontSize: 13,
    fontFamily: DEFAULT_FONTFACE_PLANE,
    fontColor: '#000000',
    backgroundColor: getColor([248, 249, 250]),
    borderColor: getColor([217, 217, 217]),
    textAlign: 'center',
    textBaseline: 'middle',
} as const;

export class RowHeaderLayout extends SheetExtension {
    override uKey = UNIQUE_KEY;
    override Z_INDEX = 10;
    // The workbook rows configuration and header style
    rowsCfg: Record<number, IARowCfg> = {};
    headerStyle: Partial<IRowStyleCfg> = {};
    // Map of row configurations and header styles for each worksheet, where the key is worksheet id
    rowsCfgOfWorksheet: Map<string, Record<number, IARowCfg>> = new Map();
    headerStyleOfWorksheet: Map<string, Partial<IRowStyleCfg>> = new Map();

    constructor(cfg?: IRowsHeaderCfgParam) {
        super();
        if (cfg) {
            this.configHeaderRow(cfg);
        }
    }

    configHeaderRow(cfg: IRowsHeaderCfgParam, sheetId?: string) {
        if (sheetId) {
            this.rowsCfgOfWorksheet.set(sheetId, cfg.rowsCfg ?? {});
            this.headerStyleOfWorksheet.set(sheetId, cfg.headerStyle ?? {});
        } else {
            this.rowsCfg = cfg.rowsCfg ?? {};
            this.headerStyle = cfg.headerStyle ?? {};
        }
    }

    getRowsCfg(sheetId: string): Record<number, IARowCfg> {
        const rowsCfg = this.rowsCfgOfWorksheet.get(sheetId) ?? {};
        return { ...this.rowsCfg, ...rowsCfg };
    }

    getHeaderStyle(sheetId: string): IRowStyleCfg {
        const headerStyle = this.headerStyleOfWorksheet.get(sheetId) ?? {};
        return { ...DEFAULT_ROW_STYLE, ...this.headerStyle, ...headerStyle };
    }

    getCfgOfCurrentRow(rowsCfg: Record<number, IARowCfg>, headerStyle: IHeaderStyleCfg, rowIndex: number) {
        let mergeWithSpecCfg;
        let curRowSpecCfg;

        if (rowsCfg[rowIndex]) {
            if (typeof rowsCfg[rowIndex] == 'string') {
                rowsCfg[rowIndex] = { text: rowsCfg[rowIndex] } as IARowCfgObj;
            }
            curRowSpecCfg = rowsCfg[rowIndex] as IRowStyleCfg & { text: string };
            mergeWithSpecCfg = { ...headerStyle, ...curRowSpecCfg };
        } else {
            mergeWithSpecCfg = { ...headerStyle, text: `${rowIndex + 1}` };
        }
        const specStyle = Object.keys(curRowSpecCfg || {}).length > 1; // if cfg have more keys than 'text', means there would be special style config for this row.
        return [mergeWithSpecCfg, specStyle] as [IARowCfgObj, boolean];
    }

    setStyleToCtx(ctx: UniverRenderingContext, rowStyle: Partial<IHeaderStyleCfg>) {
        if (rowStyle.textAlign) ctx.textAlign = rowStyle.textAlign;
        if (rowStyle.textBaseline) ctx.textBaseline = rowStyle.textBaseline;
        if (rowStyle.fontColor) ctx.fillStyle = rowStyle.fontColor;
        if (rowStyle.borderColor) ctx.strokeStyle = rowStyle.borderColor;
        if (rowStyle.fontSize) ctx.font = `${rowStyle.fontSize}px ${DEFAULT_FONTFACE_PLANE}`;
    }

    // eslint-disable-next-line max-lines-per-function
    override draw(ctx: UniverRenderingContext, parentScale: IScale, spreadsheetSkeleton: SpreadsheetSkeleton) {
        const { rowColumnSegment, rowHeaderWidth = 0 } = spreadsheetSkeleton;
        const { startRow, endRow } = rowColumnSegment;

        if (!spreadsheetSkeleton || rowHeaderWidth === 0) {
            return;
        }

        const { rowHeightAccumulation, columnTotalWidth, columnWidthAccumulation, rowTotalHeight, worksheet } =
            spreadsheetSkeleton;

        if (
            !rowHeightAccumulation ||
            !columnWidthAccumulation ||
            columnTotalWidth === undefined ||
            rowTotalHeight === undefined
        ) {
            return;
        }

        const rowsCfg = this.getRowsCfg(worksheet.getSheetId());
        const headerStyle = this.getHeaderStyle(worksheet.getSheetId());

        const scale = this._getScale(parentScale);
        this.setStyleToCtx(ctx, headerStyle);

        // background
        ctx.save();
        ctx.fillStyle = headerStyle.backgroundColor;
        ctx.fillRectByPrecision(0, 0, rowHeaderWidth, rowTotalHeight);
        ctx.restore();

        ctx.setLineWidthByPrecision(1);
        ctx.translateWithPrecisionRatio(FIX_ONE_PIXEL_BLUR_OFFSET, FIX_ONE_PIXEL_BLUR_OFFSET);

        let preRowPosition = 0;
        const rowHeightAccumulationLength = rowHeightAccumulation.length;
        for (let r = startRow - 1; r <= endRow; r++) {
            if (r < 0 || r > rowHeightAccumulationLength - 1) {
                continue;
            }
            const rowEndPosition = rowHeightAccumulation[r];
            if (preRowPosition === rowEndPosition) {
                continue; // Skip hidden rows
            }
            const cellBound = {
                left: 0,
                top: preRowPosition,
                right: rowHeaderWidth,
                bottom: rowEndPosition,
                width: rowHeaderWidth,
                height: rowEndPosition - preRowPosition,
            };
            const [curRowCfg, specStyle] = this.getCfgOfCurrentRow(rowsCfg, headerStyle, r);

            // background
            if (specStyle && curRowCfg.backgroundColor) {
                ctx.save();
                ctx.fillStyle = curRowCfg.backgroundColor;
                ctx.fillRectByPrecision(cellBound.left, cellBound.top, cellBound.width, cellBound.height);
                ctx.restore();
            }

            // horizontal line border
            ctx.beginPath();
            ctx.moveToByPrecision(cellBound.left, cellBound.bottom);
            ctx.lineToByPrecision(cellBound.right, cellBound.bottom);
            ctx.stroke();

            // row header text
            const textX = (() => {
                switch (curRowCfg.textAlign) {
                    case 'center':
                        return cellBound.left + (cellBound.right - cellBound.left) / 2;
                    case 'right':
                        return cellBound.right - MIDDLE_CELL_POS_MAGIC_NUMBER;
                    case 'left':
                        return cellBound.left + MIDDLE_CELL_POS_MAGIC_NUMBER;
                    default: // center
                        return cellBound.left + (cellBound.right - cellBound.left) / 2;
                }
            })();
            const middleYCellRect = preRowPosition + (rowEndPosition - preRowPosition) / 2 + MIDDLE_CELL_POS_MAGIC_NUMBER; // Magic number 1, because the vertical alignment appears to be off by 1 pixel

            if (specStyle) {
                ctx.save();
                ctx.beginPath();
                this.setStyleToCtx(ctx, curRowCfg);
                ctx.rectByPrecision(cellBound.left, cellBound.top, cellBound.width, cellBound.height);
                ctx.clip();
            }

            ctx.fillText(curRowCfg.text, textX, middleYCellRect);
            if (specStyle) {
                ctx.restore();
            }

            preRowPosition = rowEndPosition;
        }

        // border right line
        const rowHeaderWidthFix = rowHeaderWidth - 0.5 / scale;
        ctx.beginPath();
        ctx.moveToByPrecision(rowHeaderWidthFix, 0);
        ctx.lineToByPrecision(rowHeaderWidthFix, rowTotalHeight);
        ctx.stroke();
    }
}

SheetRowHeaderExtensionRegistry.add(new RowHeaderLayout());
