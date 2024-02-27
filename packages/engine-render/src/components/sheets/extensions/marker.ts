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

import { type IRange, type IScale, Range } from '@univerjs/core';
import type { UniverRenderingContext } from '../../../context';
import type { SpreadsheetSkeleton } from '../sheet-skeleton';
import { SpreadsheetExtensionRegistry } from '../../extension';
import { getColor } from '../../../basics/tools';
import { SheetExtension } from './sheet-extension';

const UNIQUE_KEY = 'DefaultMarkerExtension';

const Z_INDEX = 60;

export class Marker extends SheetExtension {
    protected override Z_INDEX: number = Z_INDEX;

    override uKey: string = UNIQUE_KEY;

    override draw(ctx: UniverRenderingContext, parentScale: IScale, skeleton: SpreadsheetSkeleton, diffBounds?: IRange[] | undefined): void {
        const { worksheet, rowColumnSegment } = skeleton;
        if (!worksheet) {
            return;
        }

        Range.foreach(rowColumnSegment, (row, col) => {
            const cellData = worksheet.getCell(row, col);
            const cellInfo = this.getCellIndex(
                row,
                col,
                skeleton.rowHeightAccumulation,
                skeleton.columnWidthAccumulation,
                skeleton.dataMergeCache
            );

            if (cellData?.markers?.tr) {
                ctx.save();
                const marker = cellData.markers.tr;
                const { startY, endX } = cellInfo;
                const x = endX;
                const y = startY;
                ctx.fillStyle = marker.color;
                ctx.moveTo(x, y);
                ctx.beginPath();
                ctx.lineTo(x - marker.size, y);
                ctx.lineTo(x, y + marker.size);
                ctx.lineTo(x, y);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }

            if (cellData?.markers?.tl) {
                ctx.save();
                const marker = cellData.markers.tl;
                const { startY: y, startX: x } = cellInfo;
                ctx.fillStyle = marker.color;
                ctx.moveTo(x, y);
                ctx.beginPath();
                ctx.lineTo(x + marker.size, y);
                ctx.lineTo(x, y + marker.size);
                ctx.lineTo(x, y);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }

            if (cellData?.markers?.br) {
                ctx.save();
                const marker = cellData.markers.br;
                const { endY: y, endX: x } = cellInfo;
                ctx.fillStyle = marker.color;
                ctx.moveTo(x, y);
                ctx.beginPath();
                ctx.lineTo(x - marker.size, y);
                ctx.lineTo(x, y - marker.size);
                ctx.lineTo(x, y);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }

            if (cellData?.markers?.bl) {
                ctx.save();
                const marker = cellData.markers.bl;
                const { endY: y, startX: x } = cellInfo;
                ctx.fillStyle = marker.color;
                ctx.moveTo(x, y);
                ctx.beginPath();
                ctx.lineTo(x + marker.size, y);
                ctx.lineTo(x, y - marker.size);
                ctx.lineTo(x, y);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }
        });
    }
}

SpreadsheetExtensionRegistry.add(Marker);
