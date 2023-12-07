import type { Nullable } from '@univerjs/core';

import { RENDER_CLASS_TYPE } from '../../basics/const';
import type { IDocumentSkeletonLine, IDocumentSkeletonSpan } from '../../basics/i-document-skeleton-cached';
import { PageLayoutType } from '../../basics/i-document-skeleton-cached';
import type { INodeInfo, ITransformChangeState } from '../../basics/interfaces';
import type { IBoundRect } from '../../basics/vector2';
import { Canvas } from '../../canvas';
import type { Scene } from '../../scene';
import { RenderComponent } from '../component';
import type { DOCS_EXTENSION_TYPE } from './doc-extension';
import type { DocumentSkeleton } from './doc-skeleton';

export class DocComponent extends RenderComponent<IDocumentSkeletonSpan | IDocumentSkeletonLine, DOCS_EXTENSION_TYPE> {
    pageMarginLeft: number = 0;

    pageMarginTop: number = 0;

    pageLayoutType: PageLayoutType = PageLayoutType.VERTICAL;

    protected _cacheCanvas: Nullable<Canvas>;

    constructor(
        oKey: string,
        private _skeleton?: DocumentSkeleton,
        private _allowCache: boolean = false
    ) {
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

    setAllowCache(state: boolean = false) {
        this._allowCache = state;
    }

    getSkeleton() {
        return this._skeleton;
    }

    setSkeleton(skeleton: DocumentSkeleton) {
        this._skeleton = skeleton;
    }

    override render(mainCtx: CanvasRenderingContext2D, bounds?: IBoundRect) {
        if (!this.visible) {
            this.makeDirty(false);
            return this;
        }

        if (!this._skeleton) {
            return;
        }
        // const ctx = this._cacheCanvas.getGlobalContext();
        // this._cacheCanvas.clear();
        const m = this.transform.getMatrix();
        mainCtx.save();
        // eslint-disable-next-line no-magic-numbers
        mainCtx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
        // ctx.setTransform(mainCtx.getTransform());
        this._draw(mainCtx, bounds);
        mainCtx.restore();
        // this._applyCache(mainCtx);
        // console.log('render', ctx);
        // console.log('mainCtx', mainCtx, this.width, this.height);
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

    scrollBySelection() {}

    syncSelection() {}

    remainActiveSelection() {}

    findNodeByCoord(offsetX: number, offsetY: number): Nullable<INodeInfo> {}

    findCoordByNode(span: IDocumentSkeletonSpan) {}

    protected _getBounding(bounds?: IBoundRect) {}

    protected _draw(ctx: CanvasRenderingContext2D, bounds?: IBoundRect) {
        /* abstract */
    }
}
