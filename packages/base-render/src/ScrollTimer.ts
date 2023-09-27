import { IPaddingData, Nullable } from '@univerjs/core';

import { RENDER_CLASS_TYPE } from './Basics/Const';
import { cancelRequestFrame, requestNewFrame } from './Basics/Tools';
import { Vector2 } from './Basics/Vector2';

export class ScrollTimer {
    private _requestNewFrameNumber: number = -1;

    private _viewport: Nullable<any>;

    private _offsetX: number = 0;

    private _offsetY: number = 0;

    private _moveX: number = 0;

    private _moveY: number = 0;

    private _scrollX: number = 0;

    private _scrollY: number = 0;

    private _scrollFunction: Nullable<(x?: number, y?: number) => void>;

    constructor(
        private _scene: any,
        private _padding?: IPaddingData,
        private _smoothRatioX = 0.05,
        private _smoothRatioY = 0.05
    ) {
        if (!this._padding) {
            this._padding = { t: 20, b: 20, l: 46, r: 60 };
        }
    }

    static create(scene: any, padding?: IPaddingData) {
        return new ScrollTimer(scene, padding);
    }

    startScroll(offsetX: number, offsetY: number, targetViewport?: any) {
        this._offsetX = offsetX;
        this._offsetY = offsetY;

        this._moveX = offsetX;
        this._moveY = offsetY;

        if (targetViewport != null) {
            this._viewport = targetViewport;
        } else {
            this._viewport = this.getViewportByCoord(this._scene);
        }

        this._runRenderLoop();
    }

    _scroll(viewport: Nullable<any>) {
        const topBounding = viewport?.top || 0;
        const bottomBounding = topBounding + (viewport?.height || 0);
        const leftBounding = viewport?.left || 0;
        const rightBounding = leftBounding + (viewport?.width || 0);

        const { t = 0, b = 0, r = 0, l = 0 } = this._padding!;

        let x = 0;
        let y = 0;

        let shouldScroll = false;

        if (this._moveX < leftBounding + l) {
            x = (this._moveX - leftBounding - l) * this._smoothRatioX;
            shouldScroll = true;
        }

        if (this._moveX > rightBounding - r) {
            x = (this._moveX - rightBounding + r) * this._smoothRatioX;
            shouldScroll = true;
        }

        if (this._moveY < topBounding + t) {
            y = (this._moveY - topBounding - t) * this._smoothRatioY;
            shouldScroll = true;
        }

        if (this._moveY > bottomBounding - b) {
            y = (this._moveY - bottomBounding + b) * this._smoothRatioY;
            shouldScroll = true;
        }

        if (!shouldScroll) {
            return;
        }

        const limited = viewport?.scrollBy({
            x,
            y,
        });

        const actualScroll = viewport?.getActualScroll(x, y);

        this._scrollX = actualScroll?.x || 0;
        this._scrollY = actualScroll?.y || 0;

        if (limited) {
            const ancestorScene = this._findAncestorScene(viewport?.scene);
            const newViewport = this.getViewportByCoord(ancestorScene);
            if (newViewport) {
                this._scroll(newViewport);
            }
        }
    }

    scrolling(offsetX: number, offsetY: number, scrollFunction: (x?: number, y?: number) => void) {
        this._moveX = offsetX;
        this._moveY = offsetY;
        this._scrollFunction = scrollFunction;
    }

    stopScroll() {
        cancelRequestFrame(this._requestNewFrameNumber);
    }

    dispose() {
        this.stopScroll();
        delete this._scrollFunction;
    }

    getViewportByCoord(scene?: any) {
        // return scene?.getActiveViewportByCoord(Vector2.FromArray([this._offsetX, this._offsetY]));

        return scene?.getActiveViewportByRelativeCoord(Vector2.FromArray([this._offsetX, this._offsetY]));
    }

    getScene() {
        return this._scene;
    }

    private _runRenderLoop() {
        this._scroll(this._viewport);
        this._scrollFunction && this._scrollFunction(this._scrollX, this._scrollY);
        this._requestNewFrameNumber = requestNewFrame(this._runRenderLoop.bind(this));
    }

    private _findAncestorScene(scene?: any) {
        let parent: any = scene?.getParent();
        while (parent) {
            if (parent.classType === RENDER_CLASS_TYPE.SCENE) {
                return parent;
            }
            parent = parent?.getParent && parent?.getParent();
        }
    }
}
