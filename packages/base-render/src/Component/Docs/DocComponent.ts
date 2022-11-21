import { IBoundRect } from '../../Basics/Vector2';
import { ITransformChangeState } from '../../Basics/Interfaces';
import { Canvas } from '../../Canvas';
import { RenderComponent } from '../Component';
import { DocumentSkeleton } from './DocSkeleton';
import { Scene } from '../../Scene';
import { DOCS_EXTENSION_TYPE } from './DocExtension';
import { IDocumentSkeletonLine, IDocumentSkeletonSpan } from '../../Basics/IDocumentSkeletonCached';
import { RENDER_CLASS_TYPE } from '../../Basics/Const';

export class DocComponent extends RenderComponent<IDocumentSkeletonSpan | IDocumentSkeletonLine, DOCS_EXTENSION_TYPE> {
    protected _cacheCanvas: Canvas;

    getSkeleton() {
        return this._skeleton;
    }

    setSkeleton(skeleton: DocumentSkeleton) {
        this._skeleton = skeleton;
    }

    constructor(oKey: string, private _skeleton?: DocumentSkeleton, private _allowCache: boolean = false) {
        super(oKey);
        if (this._allowCache) {
            this._cacheCanvas = new Canvas();
        }
        this.onIsAddedToParentObserver.add((parent) => {
            (parent as Scene)?.getEngine()?.onTransformChangeObservable.add((change: ITransformChangeState) => {
                this.resizeCacheCanvas();
            });
            this.resizeCacheCanvas();
        });
    }

    render(mainCtx: CanvasRenderingContext2D, bounds?: IBoundRect) {
        if (!this.visible) {
            this.makeDirty(false);
            return this;
        }

        if (!this._skeleton) {
            return;
        }
        // const ctx = this._cacheCanvas.getContext();
        // this._cacheCanvas.clear();
        const m = this.transform.getMatrix();
        mainCtx.save();
        mainCtx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
        // ctx.setTransform(mainCtx.getTransform());
        this._draw(mainCtx, bounds);
        mainCtx.restore();
        // this._applyCache(mainCtx);
        // console.log('render', ctx);
        // console.log('mainCtx', mainCtx, this.width, this.height);
    }

    protected _getBounding(bounds?: IBoundRect) {}

    protected _draw(ctx: CanvasRenderingContext2D, bounds?: IBoundRect) {
        /* abstract */
    }

    getParentScale() {
        if (!this.parent) {
            return { scaleX: 1, scaleY: 1 };
        }
        let { scaleX = 1, scaleY = 1 } = this.parent;

        if (this.parent.classType === RENDER_CLASS_TYPE.SCENE) {
            scaleX = this.parent.ancestorScaleX || 1;
            scaleY = this.parent.ancestorScaleY || 1;
        }

        return {
            scaleX,
            scaleY,
        };
    }
}
