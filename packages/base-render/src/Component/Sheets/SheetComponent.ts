import { searchArray } from '@univerjs/core';
import { IBoundRect } from '../../Basics/Vector2';
import { RenderComponent } from '../Component';
import { SpreadsheetSkeleton } from './SheetSkeleton';
import { SHEET_EXTENSION_TYPE } from './Extensions/SheetExtension';
import { RENDER_CLASS_TYPE } from '../../Basics/Const';

export class SheetComponent extends RenderComponent<SpreadsheetSkeleton, SHEET_EXTENSION_TYPE> {
    // protected _cacheCanvas = new Canvas();

    constructor(oKey: string, private _skeleton?: SpreadsheetSkeleton) {
        super(oKey);
    }

    getSkeleton() {
        return this._skeleton;
    }

    updateSkeleton(spreadsheetSkeleton: SpreadsheetSkeleton) {
        this._skeleton = spreadsheetSkeleton;
    }

    render(mainCtx: CanvasRenderingContext2D, bounds?: IBoundRect) {
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

    /**
     *
     * @param rowHeightAccumulation Row layout information
     * @param columnWidthAccumulation Column layout information
     * @param bounds The range of the visible area of the canvas
     * @returns The range cell index of the canvas visible area
     */
    protected _getBounding(rowHeightAccumulation: number[], columnWidthAccumulation: number[], bounds?: IBoundRect) {
        const rhaLength = rowHeightAccumulation.length;
        const cwaLength = columnWidthAccumulation.length;

        if (!bounds) {
            return {
                startRow: 0,
                endRow: rhaLength - 1,
                startColumn: 0,
                endColumn: cwaLength - 1,
            };
        }

        let dataset_row_st = -1;
        let dataset_row_ed = -1;
        let dataset_col_st = -1;
        let dataset_col_ed = -1;

        dataset_row_st = searchArray(rowHeightAccumulation, bounds.tl.y);
        dataset_row_ed = searchArray(rowHeightAccumulation, bounds.bl.y);

        if (dataset_row_st === -1) {
            dataset_row_st = 0;
        }

        if (dataset_row_ed === -1) {
            dataset_row_ed = rhaLength - 1;
        }

        if (dataset_row_ed >= rhaLength) {
            dataset_row_ed = rhaLength - 1;
        }

        dataset_col_st = searchArray(columnWidthAccumulation, bounds.tl.x);
        dataset_col_ed = searchArray(columnWidthAccumulation, bounds.tr.x);

        if (dataset_col_st === -1) {
            dataset_col_st = 0;
        }

        if (dataset_col_ed === -1) {
            dataset_col_ed = cwaLength - 1;
        }

        if (dataset_col_ed >= cwaLength) {
            dataset_col_ed = cwaLength - 1;
        }

        return {
            startRow: dataset_row_st - 1,
            endRow: dataset_row_ed + 1,
            startColumn: dataset_col_st - 1,
            endColumn: dataset_col_ed + 1,
        };
    }

    protected _draw(ctx: CanvasRenderingContext2D, bounds?: IBoundRect) {
        /* abstract */
    }
}

export class SpreadsheetTitle extends SheetComponent {
    protected _draw(ctx: CanvasRenderingContext2D, bounds?: IBoundRect): void {
        this.draw(ctx, bounds);
    }
}
