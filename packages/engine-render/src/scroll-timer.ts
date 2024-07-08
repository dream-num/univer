/**
 * Copyright 2023-present DreamNum Inc.
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

import type { IPaddingData, Nullable } from '@univerjs/core';

import { RENDER_CLASS_TYPE } from './basics/const';
import { cancelRequestFrame, requestNewFrame } from './basics/tools';
import { Vector2 } from './basics/vector2';
import type { Scene } from './scene';
import type { ThinScene } from './thin-scene';
import type { Viewport } from './viewport';

export enum ScrollTimerType {
    NONE,
    X,
    Y,
    ALL,
}

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
        private _scene: Scene,
        private _scrollTimerType: ScrollTimerType = ScrollTimerType.ALL,
        private _padding?: IPaddingData,
        private _smoothRatioX = 0.4,
        private _smoothRatioY = 0.1
    ) {
        if (!this._padding) {
            this._padding = { t: 0, b: 15, l: 0, r: 60 };
        }
    }

    static create(scene: any, scrollTimerType: ScrollTimerType = ScrollTimerType.ALL, padding?: IPaddingData) {
        return new ScrollTimer(scene, scrollTimerType, padding);
    }

    set scrollTimerType(type: ScrollTimerType) {
        this._scrollTimerType = type;
    }

    get scrollTimerType() {
        return this._scrollTimerType;
    }

    setActiveViewport(viewport: Viewport) {
        this._viewport = viewport;
    }

    getActiveViewport() {
        return this._viewport;
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

    private _scroll(viewport: Nullable<Viewport>) {
        const topBounding = viewport?.top || 0;
        const bottomBounding = topBounding + (viewport?.height || 0);
        const leftBounding = viewport?.left || 0;
        const rightBounding = leftBounding + (viewport?.width || 0);

        const { t = 0, b = 0, r = 0, l = 0 } = this._padding!;

        let x = 0;
        let y = 0;

        let shouldScroll = false;

        if (this._scrollTimerType & ScrollTimerType.X) {
            if (this._moveX < leftBounding + l) {
                x = (this._moveX - leftBounding - l) * this._smoothRatioX;
                shouldScroll = true;
            }

            if (this._moveX > rightBounding - r) {
                x = (this._moveX - rightBounding + r) * this._smoothRatioX;
                shouldScroll = true;
            }
        }

        if (this._scrollTimerType & ScrollTimerType.Y) {
            if (this._moveY < topBounding + t) {
                y = (this._moveY - topBounding - t) * this._smoothRatioY;
                shouldScroll = true;
            }

            if (this._moveY > bottomBounding - b) {
                y = (this._moveY - bottomBounding + b) * this._smoothRatioY;
                shouldScroll = true;
            }
        }

        if (!shouldScroll) {
            return;
        }

        const limited = viewport?.scrollBy({
            x,
            y,
        });

        const actualScroll = viewport?.transScroll2ViewportScrollValue(x, y);

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

    getViewportByCoord(scene?: Scene) {
        // return scene?.getActiveViewportByCoord(Vector2.FromArray([this._offsetX, this._offsetY]));

        return scene?.findViewportByPosToViewport(Vector2.FromArray([this._offsetX, this._offsetY]));
    }

    getScene() {
        return this._scene;
    }

    private _runRenderLoop() {
        this._scroll(this._viewport);
        this._scrollFunction && this._scrollFunction(this._scrollX, this._scrollY);
        this._requestNewFrameNumber = requestNewFrame(this._runRenderLoop.bind(this));
    }

    private _findAncestorScene(scene?: ThinScene) {
        let parent = scene?.getParent();
        while (parent) {
            if (parent.classType === RENDER_CLASS_TYPE.SCENE) {
                return parent;
            }
            parent = parent?.getParent && parent?.getParent();
        }
    }
}
