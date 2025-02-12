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

import type { IRange, Nullable } from '@univerjs/core';

import type { IViewportInfo, Vector2 } from '../../basics/vector2';
import type { UniverRenderingContext } from '../../context';
import type { SHEET_EXTENSION_TYPE } from './extensions/sheet-extension';
import type { SpreadsheetSkeleton } from './sheet.render-skeleton';
import { RENDER_CLASS_TYPE } from '../../basics/const';
import { RenderComponent } from '../component';

export abstract class SheetComponent extends RenderComponent<SpreadsheetSkeleton, SHEET_EXTENSION_TYPE, IRange[]> {
    constructor(
        oKey: string,
        private _skeleton?: SpreadsheetSkeleton
    ) {
        super(oKey);
    }

    getSkeleton() {
        return this._skeleton;
    }

    updateSkeleton(spreadsheetSkeleton: SpreadsheetSkeleton) {
        this._skeleton = spreadsheetSkeleton;
        this.getScene()?.updateTransformerZero(spreadsheetSkeleton.rowHeaderWidth, spreadsheetSkeleton.columnHeaderHeight);
    }

    override render(mainCtx: UniverRenderingContext, bounds?: IViewportInfo) {
        if (!this.visible) {
            this.makeDirty(false);
            return this;
        }

        mainCtx.save();
        this._draw(mainCtx, bounds);
        mainCtx.restore();
    }

    getParentScale() {
        let { scaleX = 1, scaleY = 1 } = this.parent;

        if (this.parent.classType === RENDER_CLASS_TYPE.SCENE_VIEWER) {
            scaleX = (this.parent.ancestorScaleX || 1) as number;
            scaleY = (this.parent.ancestorScaleY || 1) as number;
        }

        return {
            scaleX: scaleX as number,
            scaleY: scaleY as number,
        };
    }

    abstract getDocuments(): any;

    abstract getNoMergeCellPositionByIndex(
        rowIndex: number,
        columnIndex: number
    ): Nullable<{ startY: number; startX: number; endX: number; endY: number }>;

    getScrollXYByRelativeCoords(coord: Vector2) {
        return { x: 0, y: 0 };
    }

    abstract getSelectionBounding(
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number
    ): Nullable<{ startRow: number; startColumn: number; endRow: number; endColumn: number }>;

    protected abstract _draw(ctx: UniverRenderingContext, bounds?: IViewportInfo): void;

    /**
     * TODO: DR-Univer, fix as unknown as
     */
    override dispose() {
        super.dispose();
        this._skeleton = null as unknown as SpreadsheetSkeleton;
    }
}

export abstract class SpreadsheetHeader extends SheetComponent {
    protected override _draw(ctx: UniverRenderingContext, bounds?: IViewportInfo): void {
        this.draw(ctx, bounds);
    }
}
