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

import type { IPaddingData, Nullable } from '@univerjs/core';

import type { Scene } from './scene';
import type { Viewport } from './viewport';
import { cancelRequestFrame, requestNewFrame } from './basics/tools';
import { Vector2 } from './basics/vector2';

export enum ScrollTimerType {
    NONE,
    X,
    Y,
    ALL,
}

const THRESHOLD_TO_AUTO_MOVE: IPaddingData = { t: 0, b: 15, l: 0, r: 60 };

export class ScrollTimer {
    private _requestNewFrameNumber: number = -1;
    private _viewport: Nullable<any>;
    private _offsetX: number = 0;
    private _offsetY: number = 0;
    private _moveX: number = 0;
    private _moveY: number = 0;
    private _scrollX: number = 0;
    private _scrollY: number = 0;
    /**
     * Customize scroll function.
     */
    private _scrollFunction: Nullable<(x?: number, y?: number) => void>;

    constructor(
        private _scene: Scene,
        private _scrollTimerType: ScrollTimerType = ScrollTimerType.ALL,
        private _thresholdAutoMove: IPaddingData = THRESHOLD_TO_AUTO_MOVE
    ) {
        //
    }

    static create(scene: Scene, scrollTimerType: ScrollTimerType = ScrollTimerType.ALL, padding?: IPaddingData) {
        return new ScrollTimer(scene, scrollTimerType, padding);
    }

    get offsetX() {
        return this._offsetX;
    }

    get offsetY() {
        return this._offsetY;
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
            this._viewport = this._scene.findViewportByPosToScene(Vector2.FromArray([offsetX, offsetY]));
        }

        this._runRenderLoop();
    }

    //eslint-disable-next-line complexity
    private _autoScroll(viewport: Nullable<Viewport>) {
        const topBounding = viewport?.top || 0;
        const bottomBounding = topBounding + (viewport?.height || 0);
        const leftBounding = viewport?.left || 0;
        const rightBounding = leftBounding + (viewport?.width || 0);

        const { t = 0, b = 0, r = 0, l = 0 } = this._thresholdAutoMove;

        let x = 0;
        let y = 0;

        let shouldScroll = false;

        if (this._scrollTimerType & ScrollTimerType.X) {
            if (this._moveX < leftBounding + l) {
                x = (this._moveX - leftBounding - l);
                shouldScroll = true;
            }

            if (this._moveX > rightBounding - r) {
                x = (this._moveX - rightBounding + r);
                shouldScroll = true;
            }
        }

        if (this._scrollTimerType & ScrollTimerType.Y) {
            if (this._moveY < topBounding + t) {
                y = (this._moveY - topBounding - t);
                shouldScroll = true;
            }

            if (this._moveY > bottomBounding - b) {
                y = (this._moveY - bottomBounding + b);
                shouldScroll = true;
            }
        }

        if (!shouldScroll) {
            return;
        }

        const scrolled = viewport?.scrollByViewportDeltaVal({
            viewportScrollX: x,
            viewportScrollY: y,
        });

        const viewportScrollVal = viewport?.transScroll2ViewportScrollValue(x, y);

        this._scrollX = viewportScrollVal?.x || 0;
        this._scrollY = viewportScrollVal?.y || 0;
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

    getScene() {
        return this._scene;
    }

    private _runRenderLoop() {
        this._autoScroll(this._viewport);
        if (this._scrollFunction) {
            this._scrollFunction(this._scrollX, this._scrollY);
        }
        this._requestNewFrameNumber = requestNewFrame(this._runRenderLoop.bind(this));
    }
}
