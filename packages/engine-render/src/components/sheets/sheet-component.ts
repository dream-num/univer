import { Nullable } from '@univerjs/core';

import { RENDER_CLASS_TYPE } from '../../basics/const';
import { IBoundRect, Vector2 } from '../../basics/vector2';
import { RenderComponent } from '../component';
import { SHEET_EXTENSION_TYPE } from './extensions/sheet-extension';
import { SpreadsheetSkeleton } from './sheet-skeleton';

export class SheetComponent extends RenderComponent<SpreadsheetSkeleton, SHEET_EXTENSION_TYPE> {
    // protected _cacheCanvas = new Canvas();

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
    }

    override render(mainCtx: CanvasRenderingContext2D, bounds?: IBoundRect) {
        if (!this.visible) {
            this.makeDirty(false);
            return this;
        }

        // const ctx = this._cacheCanvas.getGlobalContext();
        // this._cacheCanvas.clear();

        mainCtx.save();
        // ctx.setTransform(mainCtx.getTransform());
        this._draw(mainCtx, bounds);
        mainCtx.restore();
        // this._applyCache(mainCtx);
        // console.log('render', ctx);
        // console.log('mainCtx', mainCtx, this.width, this.height);
    }

    getParentScale() {
        let { scaleX = 1, scaleY = 1 } = this.parent;

        if (this.parent.classType === RENDER_CLASS_TYPE.SCENE_VIEWER) {
            scaleX = this.parent.ancestorScaleX || 1;
            scaleY = this.parent.ancestorScaleY || 1;
        }

        return {
            scaleX,
            scaleY,
        };
    }

    getDocuments(): any {}

    getNoMergeCellPositionByIndex(
        rowIndex: number,
        columnIndex: number
    ): Nullable<{ startY: number; startX: number; endX: number; endY: number }> {}

    getScrollXYByRelativeCoords(coord: Vector2) {
        return { x: 0, y: 0 };
    }

    getSelectionBounding(
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number
    ): Nullable<{
        startRow: number;
        startColumn: number;
        endRow: number;
        endColumn: number;
    }> {}

    protected _draw(ctx: CanvasRenderingContext2D, bounds?: IBoundRect) {
        /* abstract */
    }
}

export class SpreadsheetHeader extends SheetComponent {
    protected override _draw(ctx: CanvasRenderingContext2D, bounds?: IBoundRect): void {
        this.draw(ctx, bounds);
    }
}
