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

/* eslint-disable unused-imports/no-unused-vars */

import type { Nullable } from '@univerjs/core';
import type { IViewportInfo, Vector2 } from '../../basics/vector2';
import type { UniverRenderingContext } from '../../context';
import type { ColumnHeaderLayout, IColumnsHeaderCfgParam } from './extensions/column-header-layout';
import type { SpreadsheetSkeleton } from './sheet.render-skeleton';
import { SheetColumnHeaderExtensionRegistry } from '../extension';
import { SpreadsheetHeader } from './sheet-component';

export class SpreadsheetColumnHeader extends SpreadsheetHeader {
    override getDocuments(): void {
        throw new Error('Method not implemented.');
    }

    override getNoMergeCellPositionByIndex(rowIndex: number, columnIndex: number): Nullable<{ startY: number; startX: number; endX: number; endY: number }> {
        throw new Error('Method not implemented.');
    }

    override getSelectionBounding(startRow: number, startColumn: number, endRow: number, endColumn: number): Nullable<{ startRow: number; startColumn: number; endRow: number; endColumn: number }> {
        throw new Error('Method not implemented.');
    }

    private _columnHeaderLayoutExtension!: ColumnHeaderLayout;

    constructor(oKey: string, spreadsheetSkeleton?: SpreadsheetSkeleton) {
        super(oKey, spreadsheetSkeleton);
        this._initialDefaultExtension();
        this.makeDirty(true);
    }

    get columnHeaderLayoutExtension(): ColumnHeaderLayout {
        return this._columnHeaderLayoutExtension;
    }

    override draw(ctx: UniverRenderingContext, bounds?: IViewportInfo): void {
        const spreadsheetSkeleton = this.getSkeleton();
        if (!spreadsheetSkeleton) return;

        const parentScale = this.getParentScale();
        spreadsheetSkeleton.updateVisibleRange(bounds);
        const segment = spreadsheetSkeleton.rowColumnSegment;

        if (!segment) return;

        if (segment.startColumn === -1 && segment.endColumn === -1) return;

        const { rowHeaderWidth } = spreadsheetSkeleton;
        ctx.translateWithPrecision(rowHeaderWidth, 0);

        const extensions = this.getExtensionsByOrder();
        for (const extension of extensions) {
            extension.draw(ctx, parentScale, spreadsheetSkeleton);
        }
    }

    override isHit(coord: Vector2): boolean {
        const oCoord = this.getInverseCoord(coord);
        const skeleton = this.getSkeleton();
        if (!skeleton) {
            return false;
        }
        const { rowHeaderWidth, columnHeaderHeight } = skeleton;
        if (oCoord.x > rowHeaderWidth && oCoord.y >= 0 && oCoord.y <= columnHeaderHeight) {
            return true;
        }
        return false;
    }

    private _initialDefaultExtension(): void {
        SheetColumnHeaderExtensionRegistry.getData().forEach((extension) => {
            this.register(extension);
        });
        this._columnHeaderLayoutExtension = this.getExtensionByKey(
            'DefaultColumnHeaderLayoutExtension'
        ) as ColumnHeaderLayout;
    }

    /**
     * Customize column header, such as custom header text and background.
     * @param cfg
     */
    setCustomHeader(cfg: IColumnsHeaderCfgParam): void {
        this.makeDirty(true);
        this._columnHeaderLayoutExtension.configHeaderColumn(cfg);
    }
}
