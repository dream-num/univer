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

import type { IRange, IScale } from '@univerjs/core';
import type { SpreadsheetSkeleton, UniverRenderingContext } from '@univerjs/engine-render';
import type { IDataBarCellData } from './type';
import { Range } from '@univerjs/core';
import { FIX_ONE_PIXEL_BLUR_OFFSET, SheetExtension, SpreadsheetExtensionRegistry } from '@univerjs/engine-render';

export const dataBarUKey = 'sheet-conditional-rule-data-bar';
export const defaultDataBarPositiveColor = '#ffbe38';
export const defaultDataBarNativeColor = '#abd91a';

export const defaultPlaceholderColor = '#000';

const EXTENSION_Z_INDEX = 34;

export class DataBar extends SheetExtension {
    private _paddingRightAndLeft = 2;
    private _paddingTopAndBottom = 2;
    override uKey = dataBarUKey;

    override Z_INDEX = EXTENSION_Z_INDEX;
    _radius = 1;

    // eslint-disable-next-line max-lines-per-function
    override draw(
        ctx: UniverRenderingContext,
        _parentScale: IScale,
        spreadsheetSkeleton: SpreadsheetSkeleton,
        diffRanges: IRange[]
    ) {
        const { worksheet } = spreadsheetSkeleton;

        if (!worksheet) {
            return false;
        }
        ctx.save();
        // ctx.globalCompositeOperation = 'destination-over';
        Range.foreach(spreadsheetSkeleton.rowColumnSegment, (row, col) => {
            if (!worksheet.getRowVisible(row) || !worksheet.getColVisible(col)) {
                return;
            }
            const cellData = worksheet.getCell(row, col) as IDataBarCellData;
            if (cellData && cellData.dataBar) {
                const { color, value, startPoint, isGradient } = cellData.dataBar;
                const cellInfo = spreadsheetSkeleton.getCellWithCoordByIndex(row, col, false);
                let { isMerged, isMergedMainCell, mergeInfo, startY, endY, startX, endX } = cellInfo;
                if (isMerged) {
                    return;
                }
                if (isMergedMainCell) {
                    startY = mergeInfo.startY;
                    endY = mergeInfo.endY;
                    startX = mergeInfo.startX;
                    endX = mergeInfo.endX;
                }
                if (!this.isRenderDiffRangesByCell(mergeInfo, diffRanges)) {
                    return;
                }
                const borderWidth = endX - startX;
                const borderHeight = (endY + FIX_ONE_PIXEL_BLUR_OFFSET) - startY;
                const width = borderWidth - this._paddingRightAndLeft * 2;
                const height = borderHeight - this._paddingTopAndBottom * 2;
                if (value > 0) {
                    // Width less than 1, almost invisible
                    const dataBarWidth = Math.max(width * (1 - startPoint / 100) * value / 100, 1);
                    const x0 = startX + this._paddingRightAndLeft + (startPoint / 100) * width;
                    const y0 = startY + this._paddingTopAndBottom;
                    if (isGradient) {
                        const gradient = ctx.createLinearGradient(x0, y0, x0 + dataBarWidth, y0);
                        gradient.addColorStop(0, color);
                        gradient.addColorStop(1, 'rgb(255 255 255)');
                        ctx.fillStyle = gradient;
                        ctx.strokeStyle = color;
                        ctx.lineWidth = 1;
                    } else {
                        ctx.fillStyle = color;
                    }

                    this._drawRectWithRoundedCorner(ctx, x0, y0, dataBarWidth, height, false, true, true, false);
                    if (isGradient) {
                        ctx.stroke();
                    }
                } else {
                    // Width less than 1, almost invisible
                    const dataBarWidth = Math.max(width * startPoint / 100 * Math.abs(value) / 100, 1);
                    const x0 = startX + this._paddingRightAndLeft + (startPoint / 100) * width - dataBarWidth;
                    const y0 = startY + this._paddingTopAndBottom;
                    if (isGradient) {
                        const gradient = ctx.createLinearGradient(x0, y0, x0 + dataBarWidth, y0);
                        gradient.addColorStop(0, 'rgb(255 255 255)');
                        gradient.addColorStop(1, color);
                        ctx.fillStyle = gradient;
                        ctx.strokeStyle = color;
                        ctx.lineWidth = 1;
                    } else {
                        ctx.fillStyle = color;
                    }

                    this._drawRectWithRoundedCorner(ctx, x0, y0, dataBarWidth, height, true, false, false, true);
                    if (isGradient) {
                        ctx.stroke();
                    }
                }
            }
        });
        ctx.restore();
    }

    private _drawRectWithRoundedCorner(ctx: UniverRenderingContext, x: number, y: number, width: number, height: number, topLeftRadius: boolean, topRightRadius: boolean, bottomRightRadius: boolean, bottomLeftRadius: boolean) {
        const radius = this._radius;
        if (!height || !width) {
            return;
        }
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        if (topRightRadius) {
            ctx.arcTo(x + width, y, x + width, y + radius, radius);
        } else {
            ctx.lineTo(x + width, y);
        }
        ctx.lineTo(x + width, y + height - radius);
        if (bottomRightRadius) {
            ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
        } else {
            ctx.lineTo(x + width, y + height);
        }
        ctx.lineTo(x + radius, y + height);
        if (bottomLeftRadius) {
            ctx.arcTo(x, y + height, x, y + height - radius, radius);
        } else {
            ctx.lineTo(x, y + height);
        }
        ctx.lineTo(x, y + radius);
        if (topLeftRadius) {
            ctx.arcTo(x, y, x + radius, y, radius);
        } else {
            ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
    }
}

SpreadsheetExtensionRegistry.add(DataBar);
