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

import type { ICellDataForSheetInterceptor, IRange, IScale } from '@univerjs/core';
import { Range } from '@univerjs/core';
import type { SpreadsheetSkeleton, UniverRenderingContext } from '@univerjs/engine-render';
import { SheetExtension } from '@univerjs/engine-render';
import { UnitAction } from '@univerjs/protocol';
import type { ICellPermission } from '../../model/range-protection-render.model';
import { base64 } from '../image/protect-background-img';

export const RANGE_PROTECTION_CAN_VIEW_RENDER_EXTENSION_KEY = 'RANGE_PROTECTION_CAN_VIEW_RENDER_EXTENSION_KEY';
export const RANGE_PROTECTION_CAN_NOT_VIEW_RENDER_EXTENSION_KEY = 'RANGE_PROTECTION_CAN_NOT_VIEW_RENDER_EXTENSION_KEY';

const EXTENSION_CAN_VIEW_Z_INDEX = 25;
const EXTENSION_CAN_NOT_VIEW_Z_INDEX = 80;

export type IRangeProtectionRenderCellData = ICellDataForSheetInterceptor & { selectionProtection: ICellPermission[] };

export abstract class RangeProtectionRenderExtension extends SheetExtension {
    abstract override uKey: string;
    abstract override Z_INDEX: number;
    protected _pattern: CanvasPattern | null = null;
    protected _img = new Image();
    public renderCache = new Set<string>();

    constructor() {
        super();
        this._img.src = base64;
    }

    override clearCache(): void {
        this.renderCache.clear();
    }

    protected abstract shouldRender(config: ICellPermission): boolean;

    override draw(
        ctx: UniverRenderingContext,
        _parentScale: IScale,
        spreadsheetSkeleton: SpreadsheetSkeleton,
        _diffRanges?: IRange[]
    ) {
        const { rowHeightAccumulation, columnWidthAccumulation, worksheet, dataMergeCache } =
            spreadsheetSkeleton;
        if (!worksheet) {
            return;
        }
        ctx.save();
        if (!this._pattern) {
            this._pattern = ctx.createPattern(this._img, 'repeat');
        }
        this.renderCache.clear();
        Range.foreach(spreadsheetSkeleton.rowColumnSegment, (row, col) => {
            if (!worksheet.getColVisible(col) || !worksheet.getRowVisible(row)) {
                return;
            }
            const { selectionProtection = [] } = worksheet.getCell(row, col) as IRangeProtectionRenderCellData || {};
            if (!this._pattern) {
                return;
            }

            ctx.fillStyle = this._pattern;

            selectionProtection.forEach((config) => {
                if (!config.ruleId) {
                    return;
                }

                if (this.shouldRender(config)) {
                    if (this.renderCache.has(config.ruleId)) {
                        return;
                    }
                    this.renderCache.add(config.ruleId);
                    config.ranges!.forEach((range) => {
                        const start = this.getCellIndex(range.startRow, range.startColumn, rowHeightAccumulation, columnWidthAccumulation, dataMergeCache);
                        const end = this.getCellIndex(range.endRow, range.endColumn, rowHeightAccumulation, columnWidthAccumulation, dataMergeCache);
                        ctx.fillRect(start.startX, start.startY, end.endX - start.startX, end.endY - start.startY);
                    });
                }
            });
        });
        ctx.restore();
    }
}

export class RangeProtectionCanViewRenderExtension extends RangeProtectionRenderExtension {
    override uKey = RANGE_PROTECTION_CAN_VIEW_RENDER_EXTENSION_KEY;
    override Z_INDEX = EXTENSION_CAN_VIEW_Z_INDEX;

    constructor() {
        super();
    }

    protected override shouldRender(config: ICellPermission): boolean {
        return config?.[UnitAction.View] !== false;
    }
}

export class RangeProtectionCanNotViewRenderExtension extends RangeProtectionRenderExtension {
    override uKey = RANGE_PROTECTION_CAN_NOT_VIEW_RENDER_EXTENSION_KEY;
    override Z_INDEX = EXTENSION_CAN_NOT_VIEW_Z_INDEX;

    constructor() {
        super();
    }

    protected override shouldRender(config: ICellPermission): boolean {
        return config?.[UnitAction.View] === false;
    }
}
