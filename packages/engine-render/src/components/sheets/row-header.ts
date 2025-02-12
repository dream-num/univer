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

import type { Nullable } from '@univerjs/core';
import type { IViewportInfo, Vector2 } from '../../basics/vector2';
import type { UniverRenderingContext } from '../../context';
import type { IRowsHeaderCfgParam, RowHeaderLayout } from './extensions/row-header-layout';
import type { SpreadsheetSkeleton } from './sheet.render-skeleton';
import { SheetRowHeaderExtensionRegistry } from '../extension';
import { SpreadsheetHeader } from './sheet-component';

export class SpreadsheetRowHeader extends SpreadsheetHeader {
    override getDocuments() {
        throw new Error('Method not implemented.');
    }

    override getNoMergeCellPositionByIndex(rowIndex: number, columnIndex: number): Nullable<{ startY: number; startX: number; endX: number; endY: number }> {
        throw new Error('Method not implemented.');
    }

    override getSelectionBounding(startRow: number, startColumn: number, endRow: number, endColumn: number): Nullable<{ startRow: number; startColumn: number; endRow: number; endColumn: number }> {
        throw new Error('Method not implemented.');
    }

    private _rowHeaderLayoutExtension!: RowHeaderLayout;

    constructor(oKey: string, spreadsheetSkeleton?: SpreadsheetSkeleton) {
        super(oKey, spreadsheetSkeleton);
        // this._initialProps(props);

        this._initialDefaultExtension();

        this.makeDirty(true);
    }

    get rowHeaderLayoutExtension() {
        return this._rowHeaderLayoutExtension;
    }

    override draw(ctx: UniverRenderingContext, bounds?: IViewportInfo) {
        const spreadsheetSkeleton = this.getSkeleton();
        if (!spreadsheetSkeleton) {
            return;
        }

        const parentScale = this.getParentScale();

        spreadsheetSkeleton.updateVisibleRange(bounds);

        const segment = spreadsheetSkeleton.rowColumnSegment;

        if (!segment) {
            return;
        }

        if (segment.startRow === -1 && segment.endRow === -1) {
            return;
        }

        const { columnHeaderHeight } = spreadsheetSkeleton;

        // const { left: fixTranslateLeft, top: fixTranslateTop } = getTranslateInSpreadContextWithPixelRatio();

        ctx.translateWithPrecision(0, columnHeaderHeight);

        const extensions = this.getExtensionsByOrder();
        for (const extension of extensions) {
            extension.draw(ctx, parentScale, spreadsheetSkeleton);
        }
    }

    override isHit(coord: Vector2) {
        const oCoord = this.getInverseCoord(coord);
        const skeleton = this.getSkeleton();
        if (!skeleton) {
            return false;
        }
        const { rowHeaderWidth, columnHeaderHeight } = skeleton;
        if (oCoord.x >= 0 && oCoord.x <= rowHeaderWidth && oCoord.y > columnHeaderHeight) {
            return true;
        }
        return false;
    }

    private _initialDefaultExtension() {
        SheetRowHeaderExtensionRegistry.getData().forEach((extension) => {
            this.register(extension);
        });
        this._rowHeaderLayoutExtension = this.getExtensionByKey('DefaultRowHeaderLayoutExtension') as RowHeaderLayout;
    }

    setCustomHeader(cfg: IRowsHeaderCfgParam) {
        this.makeDirty(true);
        this._rowHeaderLayoutExtension.configHeaderRow(cfg);
    }
}
