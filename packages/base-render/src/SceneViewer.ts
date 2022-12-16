import { IBoundRect, Vector2 } from './Basics/Vector2';
import { BaseObject } from './BaseObject';
import { Scene } from './Scene';
import { IObjectFullState } from './Basics/Interfaces';
import { RENDER_CLASS_TYPE } from './Basics/Const';
import { transformBoundingCoord } from './Basics/Position';

export class SceneViewer extends BaseObject {
    private _childrenScene: Scene;

    // protected _cacheCanvas = new Canvas();

    // allowCache: boolean = false;

    constructor(key?: string, props?: IObjectFullState) {
        super(key);
        this._initialProps(props);
    }

    get scene() {
        return this._childrenScene;
    }

    get classType() {
        return RENDER_CLASS_TYPE.SCENE_VIEWER;
    }

    render(mainCtx: CanvasRenderingContext2D, bounds?: IBoundRect) {
        if (!this.visible) {
            this.makeDirty(false);
            return this;
        }

        if (bounds) {
            const { minX, maxX, minY, maxY } = transformBoundingCoord(this, bounds);

            if (this.width + this.strokeWidth < minX || maxX < 0 || this.height + this.strokeWidth < minY || maxY < 0) {
                // console.warn('ignore object', this);
                return this;
            }
        }

        const m = this.transform.getMatrix();
        mainCtx.save();
        mainCtx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
        // if (this.allowCache) {
        //     if (this.isDirty()) {
        //         const ctx = this._cacheCanvas.getContext();
        //         this._cacheCanvas.clear();
        //         ctx.save();
        //         ctx.translate(this.strokeWidth / 2, this.strokeWidth / 2); //边框会按照宽度画在边界上，分别占据内外二分之一
        //         this._childrenScene?.makeDirtyNoParent(true).render(ctx);
        //         ctx.restore();
        //     }
        //     this._applyCache(mainCtx);
        // } else {
        //     this._childrenScene?.makeDirtyNoParent(true).render(mainCtx);
        // }
        this._childrenScene?.makeDirtyNoParent(true).render(mainCtx);
        mainCtx.restore();
        this.makeDirty(false);
        return this;
    }

    // protected _applyCache(ctx?: CanvasRenderingContext2D) {
    //     if (!ctx) {
    //         return;
    //     }
    //     const pixelRatio = this._cacheCanvas.getPixelRatio();
    //     const width = this._cacheCanvas.getWidth() * pixelRatio;
    //     const height = this._cacheCanvas.getHeight() * pixelRatio;
    //     ctx.drawImage(
    //         this._cacheCanvas.getCanvasEle(),
    //         0,
    //         0,
    //         width,
    //         height,
    //         -this.strokeWidth / 2,
    //         -this.strokeWidth / 2,
    //         this.width + this.strokeWidth,
    //         this.height + this.strokeWidth
    //     );
    // }

    addObject(o: Scene) {
        this._childrenScene = o;
    }

    // 判断被选中的唯一对象
    pick(coord: Vector2) {
        if (this._childrenScene === undefined) {
            return;
        }

        const trans = this.transform.clone().invert();
        const tCoord = trans.applyPoint(coord);

        return this._childrenScene.pick(tCoord);
    }

    private _initialProps(props?: IObjectFullState) {
        if (!props) {
            return;
        }

        const themeKeys = Object.keys(props);
        if (themeKeys.length === 0) {
            return;
        }

        const transformState: IObjectFullState = {};
        let hasTransformState = false;
        themeKeys.forEach((key) => {
            if (props[key] === undefined) {
                return true;
            }

            transformState[key] = props[key];
            hasTransformState = true;
        });

        if (hasTransformState) {
            this.transformByState(transformState);
        }

        this.makeDirty(true);
    }

    dispose() {
        super.dispose();
        this._childrenScene.dispose();
    }

    // resizeCacheCanvas() {
    //     this._cacheCanvas.setSize(this.width + this.strokeWidth, this.height + this.strokeWidth);
    //     this.makeDirty(true);
    // }

    // scaleCacheCanvas() {
    //     let scaleX = this.getParent()?.ancestorScaleX || 1;
    //     let scaleY = this.getParent()?.ancestorScaleX || 1;
    //     this._cacheCanvas.setPixelRatio(Math.max(scaleX, scaleY) * getDevicePixelRatio());

    //     this._childrenScene.onTransformChangeObservable.notifyObservers({
    //         type: TRANSFORM_CHANGE_OBSERVABLE_TYPE.scale,
    //         value: {
    //             scaleX,
    //             scaleY,
    //         },
    //     });

    //     this.makeDirty(true);
    // }
}
