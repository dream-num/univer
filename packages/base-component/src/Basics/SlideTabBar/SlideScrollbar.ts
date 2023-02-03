import { SlideTabBar } from './SlideTabBar';

export class SlideScrollbar {
    protected _slideTabBar: SlideTabBar;

    protected _scrollX: number;

    constructor(slideTabBar: SlideTabBar) {
        const primeval = slideTabBar.primeval();
        this._scrollX = primeval.scrollLeft;
        this._slideTabBar = slideTabBar;
    }

    scrollX(x: number): void {
        const primeval = this._slideTabBar.primeval();
        primeval.scrollLeft = x;
        this._scrollX = primeval.scrollLeft;
    }

    scrollRight(): void {
        const primeval = this._slideTabBar.primeval();
        primeval.scrollLeft = primeval.scrollWidth;
        this._scrollX = primeval.scrollLeft;
    }

    getScrollX(): number {
        return this._scrollX;
    }
}
