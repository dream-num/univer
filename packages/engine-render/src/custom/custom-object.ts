import { BaseObject } from '../base-object';
import { transformBoundingCoord } from '../basics/position';
import { IBoundRect, Vector2 } from '../basics/vector2';

export class CustomObject extends BaseObject {
    constructor(
        key?: string,
        private _render = (mainCtx: CanvasRenderingContext2D) => {},
        private _isHitCustom?: (coord: Vector2) => boolean
    ) {
        super(key);
    }

    override toJson() {
        return {
            ...super.toJson(),
        };
    }

    override render(mainCtx: CanvasRenderingContext2D, bounds?: IBoundRect) {
        if (!this.visible) {
            this.makeDirty(false);
            return this;
        }

        // Temporarily ignore the on-demand display of elements within a group：this.isInGroup
        if (bounds && !this.isInGroup) {
            const { minX, maxX, minY, maxY } = transformBoundingCoord(this, bounds);

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

    override isHit(coord: Vector2) {
        if (this._isHitCustom) {
            return this._isHitCustom(coord);
        }

        return super.isHit(coord);
    }
}
