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

import { fixLineWidthByScale, getColor, inViewRanges, mergeRangeIfIntersects } from '../../../basics/tools';
import type { UniverRenderingContext } from '../../../context';
import { SpreadsheetExtensionRegistry } from '../../extension';
import type { SpreadsheetSkeleton } from '../sheet-skeleton';
import type { Spreadsheet } from '../spreadsheet';
import { SheetExtension } from './sheet-extension';

const UNIQUE_KEY = 'DefaultBackgroundExtension';

/**
 * in prev version background ext is higer than font ext. now turing back lower than font ext.
 * font ext zindex is 30.
 */
const DOC_EXTENSION_Z_INDEX = 21;
const PRINTING_Z_INDEX = 21;

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
        diffRanges: IRange[],
        { viewRanges, checkOutOfViewBound }: { viewRanges: IRange[]; checkOutOfViewBound: boolean; viewPortKey: string }
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
        // ctx.setGlobalCompositeOperation('destination-over');
        const { scaleX, scaleY } = ctx.getScale();
        background &&
            Object.keys(background).forEach((rgb: string) => {
                const backgroundCache = background[rgb];

                ctx.fillStyle = rgb || getColor([255, 255, 255])!;

                const backgroundPaths = new Path2D(); // 使用 Path 对象代替原有的 ctx.moveTo ctx.lineTo, Path 性能更好
                backgroundCache.forValue((rowIndex, columnIndex) => {
                    if (!checkOutOfViewBound && !inViewRanges(viewRanges, rowIndex, columnIndex)) {
                        return true;
                    }

                    // 合并单元格可能从视野外很远的位置开始, 因此需要全局遍历
                    const cellInfo = backgroundPositions?.getValue(rowIndex, columnIndex);
                    if (cellInfo == null) {
                        return true;
                    }
                    let { startY, endY, startX, endX } = cellInfo;
                    const { isMerged, isMergedMainCell, mergeInfo } = cellInfo;
                    const mergeTo = diffRanges && diffRanges.length > 0 ? diffRanges : viewRanges;
                    const combineWithMergeRanges = mergeRangeIfIntersects(mergeTo, [mergeInfo]);

                    // 不在范围(视野 + 合并单元格)内, 提前退出
                    if (!inViewRanges(combineWithMergeRanges!, rowIndex, columnIndex)) {
                        return true;
                    }

                    // 合并后的单元格 && 非左上角单元格  // 此刻需要使用左上角单元格的背景色
                    if (isMerged) {
                        return true;
                    }
                    // 合并单元格, 但是区域是合并的左上角
                    if (isMergedMainCell) {
                        startY = mergeInfo.startY;
                        endY = mergeInfo.endY;
                        startX = mergeInfo.startX;
                        endX = mergeInfo.endX;
                    }
                    // precise is a workaround for windows, macOS does not have this issue.
                    const startXPrecise = fixLineWidthByScale(startX, scaleX);
                    const startYPrecise = fixLineWidthByScale(startY, scaleY);
                    const endXPrecise = fixLineWidthByScale(endX, scaleX);
                    const endYPrecise = fixLineWidthByScale(endY, scaleY);
                    backgroundPaths.rect(startXPrecise, startYPrecise, endXPrecise - startXPrecise, endYPrecise - startYPrecise);
                });
                ctx.fill(backgroundPaths);
            });
        ctx.restore();
    }
}

SpreadsheetExtensionRegistry.add(Background);
