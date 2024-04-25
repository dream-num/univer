/**
 * Copyright 2023-present DreamNum Inc.
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

import { getColor, inViewRanges } from '../../../basics/tools';
import type { UniverRenderingContext } from '../../../context';
import { SpreadsheetExtensionRegistry } from '../../extension';
import type { SpreadsheetSkeleton } from '../sheet-skeleton';
import type { Spreadsheet } from '../spreadsheet';
import { SheetExtension } from './sheet-extension';

const UNIQUE_KEY = 'DefaultBackgroundExtension';

const DOC_EXTENSION_Z_INDEX = 40;
const PRINTING_Z_INDEX = 20;

export class Background extends SheetExtension {
    override uKey = UNIQUE_KEY;

    override Z_INDEX = DOC_EXTENSION_Z_INDEX;

    PRINTING_Z_INDEX = PRINTING_Z_INDEX;

    override get zIndex() {
        return (this.parent as Spreadsheet)?.isPrinting ? this.PRINTING_Z_INDEX : this.Z_INDEX;
    }

    override draw(
        ctx: UniverRenderingContext,
        parentScale: IScale,
        spreadsheetSkeleton: SpreadsheetSkeleton,
        {viewRanges, diffRanges, checkOutOfViewBound}: { viewRanges?: IRange[], diffRanges?: IRange[], checkOutOfViewBound?: boolean }
    ) {
        const { stylesCache } = spreadsheetSkeleton;
        const { background, backgroundPositions } = stylesCache;
        if (!spreadsheetSkeleton) {
            return;
        }

        const { rowHeightAccumulation, columnTotalWidth, columnWidthAccumulation, rowTotalHeight } =
            spreadsheetSkeleton;

        if (
            !rowHeightAccumulation ||
            !columnWidthAccumulation ||
            columnTotalWidth === undefined ||
            rowTotalHeight === undefined
        ) {
            return;
        }
        ctx.save();

        ctx.setGlobalCompositeOperation('destination-over');
        background &&
            Object.keys(background).forEach((rgb: string) => {
                const backgroundCache = background[rgb];

                ctx.fillStyle = rgb || getColor([255, 255, 255])!;

                const backgroundPaths = new Path2D(); // 使用 Path 对象代替原有的 ctx.moveTo ctx.lineTo, Path 性能更好
                backgroundCache.forValue((rowIndex, columnIndex) => {
                    // 当前单元格不在视野范围内, 提前退出
                    // 和 font 不同的是, 不需要考虑合并单元格且单元格横跨 viewport 的情况.
                    // 因为即使合并后, 也会进入 forValue 迭代, 此刻单元格状态是 isMerged, 也能从 cellInfo 中获取颜色信息
                    if(!inViewRanges(viewRanges!, rowIndex, columnIndex)) {
                        return true;
                    }
                    const cellInfo = backgroundPositions?.getValue(rowIndex, columnIndex);

                    if (cellInfo == null) {
                        return true;
                    }
                    let { startY, endY, startX, endX } = cellInfo;
                    const { isMerged, isMergedMainCell, mergeInfo } = cellInfo;

                    // 合并后的单元格, 非左上角单元格(因为在)
                    // if (isMerged) {
                    //     return true;
                    // }
                    // // 合并单元格, 但是区域是合并的左上角
                    // if (isMergedMainCell) {
                    //     startY = mergeInfo.startY;
                    //     endY = mergeInfo.endY;
                    //     startX = mergeInfo.startX;
                    //     endX = mergeInfo.endX;
                    // }

                    // 水平方向和 diffRange 没有交集就提前退出
                    // 然而不能这么做  Y 方向滚动也可能存在问题
                    // if (!this.isRowInDiffRanges(
                    //         // {
                    //         //     startRow: mergeInfo.startRow,
                    //         //     endRow: mergeInfo.endRow,
                    //         //     startColumn: mergeInfo.startColumn,
                    //         //     endColumn: mergeInfo.endColumn,
                    //         // },
                    //         rowIndex,
                    //         rowIndex,
                    //         diffRanges
                    //         // {
                    //         //     startRow: rowIndex,
                    //         //     endRow: rowIndex,
                    //         //     startColumn: columnIndex,
                    //         //     endColumn: columnIndex,
                    //         // },
                    //     )
                    // ) {
                    //     return true;
                    // }

                    backgroundPaths.rect(startX, startY, endX - startX, endY - startY)

                });
                ctx.fill(backgroundPaths);
            });
        ctx.restore();
    }


}

SpreadsheetExtensionRegistry.add(Background);
