import { IKeyValue } from '@univerjs/core';
import { Vector2 } from '../Basics/Vector2';
import { ThinScene } from '../ThinScene';

import { Rect } from './Rect';

export interface IScrollBarProps {
    thumbMargin?: number;
    thumbLengthRatio?: number;
    thumbBackgroundColor?: string;
    thumbHoverBackgroundColor?: string;
    thumbActiveBackgroundColor?: string;
    barSize?: number;
    barBackgroundColor?: string;
    barBorder?: number;
    barBorderColor?: string;

    enableHorizontal?: boolean;
    enableVertical?: boolean;

    mainScene?: ThinScene;
}

export class BaseScrollBar {
    horizontalThumbWidth: number;

    horizontalMinusMiniThumb: number = 0;

    horizontalBarWidth: number;

    verticalThumbHeight: number;

    verticalBarHeight: number;

    verticalMinusMiniThumb: number = 0;

    horizonBarRect: Rect;

    horizonThumbRect: Rect;

    verticalBarRect: Rect;

    verticalThumbRect: Rect;

    placeholderBarRect: Rect;

    constructor(props?: IScrollBarProps) {
        this.setProps(props);
    }

    get limitX() {
        if (!this.horizonThumbRect.visible) {
            return 0;
        }
        return this.horizontalBarWidth - this.horizontalThumbWidth;
    }

    get limitY() {
        if (!this.verticalThumbRect.visible) {
            return 0;
        }
        return this.verticalBarHeight - this.verticalThumbHeight;
    }

    get ratioScrollX(): number {
        if (this.horizontalThumbWidth === undefined || this.horizontalBarWidth === undefined) {
            return 1;
        }
        return (this.horizontalThumbWidth - this.horizontalMinusMiniThumb) / this.horizontalBarWidth;
    }

    get ratioScrollY(): number {
        if (this.verticalThumbHeight === undefined || this.verticalBarHeight === undefined) {
            return 1;
        }
        return (this.verticalThumbHeight - this.verticalMinusMiniThumb) / this.verticalBarHeight;
    }

    setProps(props?: IScrollBarProps) {
        if (!props) {
            return;
        }

        const themeKeys = Object.keys(props);
        if (themeKeys.length === 0) {
            return;
        }

        themeKeys.forEach((key) => {
            if (props[key as keyof IScrollBarProps] !== undefined) {
                (this as IKeyValue)[`_${key}`] = props[key as keyof IScrollBarProps];
            }
        });
    }

    pick(coord: Vector2) {
        if (this.horizonThumbRect?.isHit(coord)) {
            return this.horizonThumbRect;
        }

        if (this.verticalThumbRect?.isHit(coord)) {
            return this.verticalThumbRect;
        }

        if (this.horizonBarRect?.isHit(coord)) {
            return this.horizonBarRect;
        }

        if (this.verticalBarRect?.isHit(coord)) {
            return this.verticalBarRect;
        }

        return null;
    }

    dispose() {
        this.horizonBarRect.dispose();
        this.horizonThumbRect.dispose();
        this.verticalBarRect.dispose();
        this.verticalThumbRect.dispose();
        this.placeholderBarRect.dispose();
    }

    resize(parentWidth: number = 0, parentHeight: number = 0, contentWidth: number = 0, contentHeight: number = 0) {}

    makeDirty(state: boolean) {}

    render(ctx: CanvasRenderingContext2D, left: number = 0, top: number = 0) {}
}
