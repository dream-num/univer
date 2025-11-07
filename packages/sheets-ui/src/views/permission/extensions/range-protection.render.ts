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

import type { ICellDataForSheetInterceptor, IScale } from '@univerjs/core';
import type { SpreadsheetSkeleton, UniverRenderingContext } from '@univerjs/engine-render';
import type { ICellPermission } from '@univerjs/sheets';
import { Range } from '@univerjs/core';
import { SheetExtension } from '@univerjs/engine-render';
import { UnitAction } from '@univerjs/protocol';
import { base64 } from './protect-background-img';

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
    protected _shadowStrategy: 'always' | 'non-editable' | 'non-viewable' | 'none' = 'always';

    constructor(shadowStrategy?: 'always' | 'non-editable' | 'non-viewable' | 'none') {
        super();
        this._img.src = base64;
        if (shadowStrategy) {
            this._shadowStrategy = shadowStrategy;
        }
    }

    override clearCache(): void {
        this.renderCache.clear();
    }

    /**
     * Set the shadow strategy for this extension
     * @param strategy The shadow strategy
     */
    setShadowStrategy(strategy: 'always' | 'non-editable' | 'non-viewable' | 'none'): void {
        this._shadowStrategy = strategy;
        this.clearCache();
    }

    /**
     * Get the current shadow strategy
     */
    getShadowStrategy(): 'always' | 'non-editable' | 'non-viewable' | 'none' {
        return this._shadowStrategy;
    }

    protected abstract shouldRender(config: ICellPermission): boolean;

    override draw(
        ctx: UniverRenderingContext,
        _parentScale: IScale,
        spreadsheetSkeleton: SpreadsheetSkeleton
    ) {
        const { worksheet } = spreadsheetSkeleton;

        if (!worksheet) {
            return;
        }
        ctx.save();
        if (!this._pattern) {
            this._pattern = ctx.createPattern(this._img, 'repeat');
        }
        this.renderCache.clear();
        Range.foreach(spreadsheetSkeleton.rowColumnSegment, (row, col) => {
            if (!worksheet.getRowVisible(row) || !worksheet.getColVisible(col)) {
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
                        const start = spreadsheetSkeleton.getCellWithCoordByIndex(range.startRow, range.startColumn, false);
                        const end = spreadsheetSkeleton.getCellWithCoordByIndex(range.endRow, range.endColumn, false);
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

    constructor(shadowStrategy?: 'always' | 'non-editable' | 'non-viewable' | 'none') {
        super(shadowStrategy);
    }

    protected override shouldRender(config: ICellPermission): boolean {
        // If strategy is 'none', never show shadow
        if (this._shadowStrategy === 'none') {
            return false;
        }
        // If strategy is 'non-editable', only show shadow when edit permission is false
        if (this._shadowStrategy === 'non-editable') {
            return config?.[UnitAction.View] !== false && config?.[UnitAction.Edit] === false;
        }
        // If strategy is 'non-viewable', only show shadow when view permission is false
        if (this._shadowStrategy === 'non-viewable') {
            return config?.[UnitAction.View] === false;
        }
        // Otherwise ('always'), keep the original behavior - show shadow for all protected ranges
        return config?.[UnitAction.View] !== false;
    }
}

export class RangeProtectionCanNotViewRenderExtension extends RangeProtectionRenderExtension {
    override uKey = RANGE_PROTECTION_CAN_NOT_VIEW_RENDER_EXTENSION_KEY;
    override Z_INDEX = EXTENSION_CAN_NOT_VIEW_Z_INDEX;

    constructor(shadowStrategy?: 'always' | 'non-editable' | 'non-viewable' | 'none') {
        super(shadowStrategy);
    }

    protected override shouldRender(config: ICellPermission): boolean {
        // If strategy is 'none', never show shadow
        if (this._shadowStrategy === 'none') {
            return false;
        }
        // This extension always handles the non-viewable case (View permission is false)
        // regardless of the strategy (except 'none')
        return config?.[UnitAction.View] === false;
    }
}
