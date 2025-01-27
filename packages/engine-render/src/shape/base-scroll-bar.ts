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

import type { Vector2 } from '../basics/vector2';

import type { UniverRenderingContext } from '../context';
import type { Scene } from '../scene';
import type { Rect } from './rect';
import { Disposable, type Nullable } from '@univerjs/core';

export interface IScrollBarProps {
    thumbMargin?: number;
    thumbLengthRatio?: number;
    thumbBackgroundColor?: string;
    thumbHoverBackgroundColor?: string;
    thumbActiveBackgroundColor?: string;
    /**
     * The thickness of a scrolling bar.
     */
    barSize?: number;
    barBackgroundColor?: string;
    barBorder?: number;
    barBorderColor?: string;

    enableHorizontal?: boolean;
    enableVertical?: boolean;

    mainScene?: Scene;

    minThumbSizeH?: number;
    minThumbSizeV?: number;
}

export abstract class BaseScrollBar extends Disposable {
    enableHorizontal: boolean = true;

    enableVertical: boolean = true;

    horizontalThumbWidth: number = 0;

    horizontalMinusMiniThumb: number = 0;

    horizontalBarWidth: number = 0;

    verticalThumbHeight: number = 0;

    verticalBarHeight: number = 0;

    verticalMinusMiniThumb: number = 0;

    horizonScrollTrack: Nullable<Rect>;

    horizonThumbRect: Nullable<Rect>;

    verticalScrollTrack: Nullable<Rect>;

    verticalThumbRect: Nullable<Rect>;

    placeholderBarRect: Nullable<Rect>;

    get limitX() {
        if (!this.horizonThumbRect?.visible) {
            return 0;
        }
        return this.horizontalBarWidth - this.horizontalThumbWidth;
    }

    get limitY() {
        if (!this.verticalThumbRect?.visible) {
            return 0;
        }
        return this.verticalBarHeight - this.verticalThumbHeight;
    }

    get ratioScrollX(): number {
        if (
            this.enableHorizontal === false ||
            this.horizontalThumbWidth === undefined ||
            this.horizontalBarWidth === undefined
        ) {
            return 1;
        }

        const ratio = (
            ((this.horizontalThumbWidth - this.horizontalMinusMiniThumb) * this.miniThumbRatioX) /
            this.horizontalBarWidth
        );

        if (Number.isNaN(ratio)) {
            return 1;
        } else {
            return ratio;
        }
    }

    get ratioScrollY(): number {
        if (
            this.enableVertical === false ||
            this.verticalThumbHeight === undefined ||
            this.verticalBarHeight === undefined
        ) {
            return 1;
        }
        const ratio = (
            ((this.verticalThumbHeight - this.verticalMinusMiniThumb) * this.miniThumbRatioY) / this.verticalBarHeight
        );

        if (Number.isNaN(ratio)) {
            return 1;
        } else {
            return ratio;
        }
    }

    get miniThumbRatioX() {
        const limit = this.horizontalBarWidth - this.horizontalThumbWidth;

        if (limit === 0) {
            return 0;
        }

        const actual = this.horizontalBarWidth - (this.horizontalThumbWidth - this.horizontalMinusMiniThumb);

        if (actual === 0) {
            return 0;
        }

        return limit / actual;
    }

    get miniThumbRatioY() {
        const limit = this.verticalBarHeight - this.verticalThumbHeight;

        if (limit === 0) {
            return 0;
        }

        const actual = this.verticalBarHeight - (this.verticalThumbHeight - this.verticalMinusMiniThumb);

        if (actual === 0) {
            return 0;
        }

        return limit / actual;
    }

    pick(coord: Vector2) {
        if (this.horizonThumbRect?.isHit(coord)) {
            return this.horizonThumbRect;
        }

        if (this.verticalThumbRect?.isHit(coord)) {
            return this.verticalThumbRect;
        }

        if (this.horizonScrollTrack?.isHit(coord)) {
            return this.horizonScrollTrack;
        }

        if (this.verticalScrollTrack?.isHit(coord)) {
            return this.verticalScrollTrack;
        }

        return null;
    }

    override dispose() {
        this.horizonScrollTrack?.dispose();
        this.horizonThumbRect?.dispose();
        this.verticalScrollTrack?.dispose();
        this.verticalThumbRect?.dispose();
        this.placeholderBarRect?.dispose();

        this.horizonScrollTrack = null;
        this.horizonThumbRect = null;
        this.verticalScrollTrack = null;
        this.verticalThumbRect = null;
        this.placeholderBarRect = null;
    }

    hasHorizonThumb() {
        return this.horizonThumbRect?.visible || false;
    }

    hasVerticalThumb() {
        return this.verticalThumbRect?.visible || false;
    }

    abstract resize(
        parentWidth: Nullable<number>,
        parentHeight: Nullable<number>,
        contentWidth: number,
        contentHeight: number
    ): void;

    abstract makeDirty(state: boolean): void;

    abstract render(ctx: UniverRenderingContext, left?: number, top?: number): void;
}
