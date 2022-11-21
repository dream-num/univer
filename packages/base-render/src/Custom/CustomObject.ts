import { BaseObject } from '../BaseObject';
import { IBoundRect, Vector2 } from '../Basics';

export class CustomObject extends BaseObject {
    constructor(key?: string, private _render = (mainCtx: CanvasRenderingContext2D) => {}, private _isHitCustom?: (coord: Vector2) => boolean) {
        super(key);
    }

    toJson() {
        return {
            ...super.toJson(),
        };
    }

    render(mainCtx: CanvasRenderingContext2D, bounds?: IBoundRect) {
        if (!this.visible) {
            this.makeDirty(false);
            return this;
        }

        // Temporarily ignore the on-demand display of elements within a group：this.isInGroup
        if (bounds && !this.isInGroup) {
            const tl = this.transform.clone().invert().applyPoint(bounds.tl);
            const tr = this.transform.clone().invert().applyPoint(bounds.tr);
            const bl = this.transform.clone().invert().applyPoint(bounds.bl);
            const br = this.transform.clone().invert().applyPoint(bounds.br);

            const xList = [tl.x, tr.x, bl.x, br.x];
            const yList = [tl.y, tr.y, bl.y, br.y];

            const maxX = Math.max(...xList);
            const minX = Math.min(...xList);
            const maxY = Math.max(...yList);
            const minY = Math.min(...yList);

            if (this.width + this.strokeWidth < minX || maxX < 0 || this.height + this.strokeWidth < minY || maxY < 0) {
                // console.warn('ignore object', this);
                return this;
            }
        }

        const m = this.transform.getMatrix();
        mainCtx.save();
        mainCtx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
        this._render(mainCtx);
        mainCtx.restore();
        this.makeDirty(false);
        return this;
    }

    isHit(coord: Vector2) {
        if (this._isHitCustom) {
            return this._isHitCustom(coord);
        }

        return super.isHit(coord);
    }
}
