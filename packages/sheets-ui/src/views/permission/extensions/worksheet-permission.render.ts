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
import type { SpreadsheetSkeleton, UniverRenderingContext } from '@univerjs/engine-render';
import type { IWorksheetProtectionRenderCellData } from '@univerjs/sheets';
import { SheetExtension } from '@univerjs/engine-render';
import { UnitAction } from '@univerjs/protocol';
import { base64 } from './protect-background-img';

export const worksheetProtectionKey = 'worksheet-protection';
const EXTENSION_CAN_VIEW_Z_INDEX = 25;
const EXTENSION_CAN_NOT_VIEW_Z_INDEX = 80;

export class WorksheetProtectionRenderExtension extends SheetExtension {
    override uKey = worksheetProtectionKey;

    override Z_INDEX = EXTENSION_CAN_VIEW_Z_INDEX;
    private _pattern: CanvasPattern | null;

    private _img = new Image();
    protected _shadowStrategy: 'always' | 'non-editable' | 'non-viewable' | 'none' = 'always';

    constructor(shadowStrategy?: 'always' | 'non-editable' | 'non-viewable' | 'none') {
        super();
        this._img.src = base64;
        if (shadowStrategy) {
            this._shadowStrategy = shadowStrategy;
        }
    }

    override draw(
        ctx: UniverRenderingContext,
        _parentScale: IScale,
        spreadsheetSkeleton: SpreadsheetSkeleton
    ) {
        const { worksheet } = spreadsheetSkeleton;

        if (!worksheet) {
            return false;
        }

        ctx.save();
        if (!this._pattern) {
            this._pattern = ctx.createPattern(this._img, 'repeat');
        }
        const { startRow, startColumn, endRow, endColumn } = spreadsheetSkeleton.rowColumnSegment;
        const start = spreadsheetSkeleton.getCellWithCoordByIndex(startRow, startColumn, false);
        const end = spreadsheetSkeleton.getCellWithCoordByIndex(endRow, endColumn, false);

        const { hasWorksheetRule = false, selectionProtection = [] } = worksheet.getCell(startRow, startColumn) as IWorksheetProtectionRenderCellData || {};
        if (!this._pattern) {
            return;
        }

        if (selectionProtection.length > 0) {
            const cellProtectionConfig = selectionProtection[0];
            const viewPermission = cellProtectionConfig?.[UnitAction.View];
            if (viewPermission) {
                this.setZIndex(EXTENSION_CAN_VIEW_Z_INDEX);
            } else {
                this.setZIndex(EXTENSION_CAN_NOT_VIEW_Z_INDEX);
            }
        }

        ctx.fillStyle = this._pattern;

        // Apply shadow strategy for worksheet protection
        let shouldRenderShadow = hasWorksheetRule;

        // If strategy is 'none', never show shadow
        if (this._shadowStrategy === 'none') {
            shouldRenderShadow = false;
        } else if (hasWorksheetRule && selectionProtection.length > 0) {
            const cellProtectionConfig = selectionProtection[0];

            if (this._shadowStrategy === 'non-editable') {
                // Only show shadow if edit permission is false
                shouldRenderShadow = cellProtectionConfig?.[UnitAction.Edit] === false;
            } else if (this._shadowStrategy === 'non-viewable') {
                // Only show shadow if view permission is false
                shouldRenderShadow = cellProtectionConfig?.[UnitAction.View] === false;
            }
            // For 'always' strategy, shouldRenderShadow remains true (hasWorksheetRule)
        }

        if (shouldRenderShadow) {
            ctx.fillRect(start.startX, start.startY, end.endX - start.startX, end.endY - start.startY);
        }

        ctx.restore();
    }

    setZIndex(zIndex: number) {
        this.Z_INDEX = zIndex;
    }
}
