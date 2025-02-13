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
import type { IIconType } from '../models/icon-map';
import type { IIconSetCellData } from './type';
import { Range } from '@univerjs/core';
import { SheetExtension, SpreadsheetExtensionRegistry } from '@univerjs/engine-render';
import { EMPTY_ICON_TYPE, iconMap } from '../models/icon-map';

export const IconUKey = 'sheet-conditional-rule-icon';
const EXTENSION_Z_INDEX = 35;
export const DEFAULT_WIDTH = 15;
export const DEFAULT_PADDING = 2;

export class ConditionalFormattingIcon extends SheetExtension {
    private _paddingRightAndLeft = DEFAULT_PADDING;

    private _width = DEFAULT_WIDTH;

    private _imageMap: Map<string, HTMLImageElement> = new Map();
    override uKey = IconUKey;

    override Z_INDEX = EXTENSION_Z_INDEX;
    _radius = 1;
    constructor() {
        super();
        this._init();
    }

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
            const cellData = worksheet.getCell(row, col) as IIconSetCellData;
            if (cellData?.iconSet) {
                const { iconType, iconId } = cellData.iconSet;
                if (iconType === EMPTY_ICON_TYPE) {
                    return;
                }
                const icon = this._imageMap.get(this._createKey(iconType, iconId));
                if (!icon) {
                    return;
                }
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
                const borderHeight = endY - startY;
                if (this._width > borderHeight || this._width > borderWidth + this._paddingRightAndLeft * 2) {
                    return;
                }
                // Highly centered processing
                const y = (borderHeight - this._width) / 2 + startY;
                ctx.drawImage(icon, startX + this._paddingRightAndLeft, y, this._width, this._width);
            }
        });
        ctx.restore();
    }

    private _init() {
        for (const type in iconMap) {
            const list = iconMap[type as IIconType];
            list.forEach((base64, index) => {
                const key = this._createKey(type as IIconType, String(index));
                const image = new Image();
                image.onload = () => {
                    this._imageMap.set(key, image);
                };
                image.src = base64;
            });
        }
    }

    private _createKey(iconType: IIconType, iconIndex: string) {
        return `${iconType}_${iconIndex}`;
    }
}

SpreadsheetExtensionRegistry.add(ConditionalFormattingIcon);
