import { SlideScrollbar } from './SlideScrollbar';
import { SlideTabItem } from './SlideTabItem';

export interface SlideTabBarConfig {
    slideTabBarClassName: string;
    slideTabBarItemActiveClassName: string;
    slideTabBarItemClassName: string;
    slideTabRoot: HTMLElement;
    activeClassNameAutoController: boolean;
    slideTabBarItemAutoSort: boolean;
    onSlideEnd: (event: MouseEvent) => void;
    onChangeName: (sheetId: string, name: string) => void;
    onItemClick: (slideItemIndex: number) => void;
}

export class SlideTabBar {
    protected _activeTabItemIndex: number | null;

    protected _slideTabBar: HTMLElement;

    protected _slideTabItems: SlideTabItem[];

    protected _config: SlideTabBarConfig;

    protected _downActionX: number;

    protected _moveActionX: number;

    protected _compareIndex: number | null;

    protected _activeTabItem: SlideTabItem | null;

    protected _moveAction: (e: MouseEvent) => void;

    protected _upAction: (e: MouseEvent) => void;

    protected _downAction: (e: MouseEvent) => void;

    protected _wheelAction: (e: WheelEvent) => void;

    protected _scrollIncremental: number;

    protected _compareDirection: number;

    protected _autoScrollTime: number | null;

    protected _slideScrollbar: SlideScrollbar;

    constructor(config: Partial<SlideTabBarConfig>) {
        if (config.slideTabRoot == null) {
            throw new Error('not found slide-tab-bar root element');
        }

        const slideTabBar = config.slideTabRoot.querySelector(`.${config.slideTabBarClassName ?? 'slide-tab-bar'}`);
        const slideTabItems = config.slideTabRoot.querySelectorAll(`.${config.slideTabBarItemClassName ?? 'slide-tab-item'}`);

        if (slideTabBar == null) {
            throw new Error('not found slide-tab-bar');
        }

        this._config = config as SlideTabBarConfig;
        this._activeTabItem = null;
        this._downActionX = 0;
        this._moveActionX = 0;
        this._compareDirection = 0;
        this._compareIndex = 0;
        this._activeTabItemIndex = 0;
        this._slideTabBar = slideTabBar as HTMLElement;
        this._slideScrollbar = new SlideScrollbar(this);
        this._slideTabItems = SlideTabItem.make(slideTabItems, this);

        this.initDownAction();
        this.initUpAction();
        this.initMoveAction();
        this.initWheelAction();

        this._initialize();
    }

    static checkedSkipSlide(event: MouseEvent): boolean {
        let parent: HTMLElement | null = event.target as HTMLElement;
        while (parent != null && parent !== document.body) {
            if (parent.getAttribute('data-slide-skip')) {
                return true;
            }
            parent = parent.parentElement;
        }
        return false;
    }

    static keepLastIndex(inputHtml: HTMLElement) {
        setTimeout(() => {
            const range = window.getSelection();
            if (range) {
                range.selectAllChildren(inputHtml);
                range.collapseToEnd();
            }
        });
    }

    initDownAction() {
        let lastPageX = 0;
        let lastPageY = 0;
        let lastTime = 0;
        this._downAction = (downEvent: MouseEvent) => {
            if (downEvent.button === 2) {
                lastPageX = 0;
                lastTime = 0;
                lastPageY = 0;
                return;
            }

            const { pageX, pageY } = downEvent;
            const current = Date.now();
            const diffTime = current - lastTime <= 800;
            const diffPageX = pageX === lastPageX;
            const diffPageY = pageY === lastPageY;

            // double click
            if (diffTime && diffPageX && diffPageY) {
                const slideItem = this._slideTabItems.find((item) => item.equals(new SlideTabItem(downEvent.currentTarget as HTMLElement, this)));
                if (slideItem) {
                    // user editor
                    slideItem.editor();
                }

                lastTime = 0;
                lastPageX = 0;
                lastPageY = 0;
            } else {
                // not item is edit mode
                if (!this._hasEditItem()) {
                    if (SlideTabBar.checkedSkipSlide(downEvent)) {
                        lastPageX = 0;
                        lastTime = 0;
                        lastPageY = 0;
                        return;
                    }
                    const slideItemIndex = this._slideTabItems.findIndex((item) => item.equals(new SlideTabItem(downEvent.currentTarget as HTMLElement, this)));
                    if (slideItemIndex > -1) {
                        this._compareIndex = slideItemIndex;
                        this._downActionX = downEvent.pageX;
                        this._moveActionX = 0;
                        this._scrollIncremental = 0;
                        this._activeTabItem = this._slideTabItems[slideItemIndex];
                        this._activeTabItemIndex = slideItemIndex;
                        if (this._config.activeClassNameAutoController) {
                            this._slideTabItems.forEach((item) => {
                                item.classList().remove(this._config.slideTabBarItemActiveClassName ?? 'slide-tab-active');
                            });
                            this._activeTabItem.classList().add(this._config.slideTabBarItemActiveClassName ?? 'slide-tab-active');
                            // send current item index to sheet bar
                            this._config.onItemClick && this._config.onItemClick(slideItemIndex);
                        }
                        this._activeTabItem.enableFixed();
                        this._startAutoScroll();
                    } else {
                        this.updateItems();
                        this._activeTabItemIndex = 0;
                        this._downActionX = 0;
                        this._scrollIncremental = 0;
                        this._compareIndex = 0;
                        this._activeTabItem = null;
                    }
                }

                lastPageX = pageX;
                lastPageY = pageY;
                lastTime = current;
            }
        };
    }

    initUpAction() {
        this._upAction = (upEvent: MouseEvent) => {
            if (this._activeTabItem) {
                this._closeAutoScroll();
                this._activeTabItem.disableFixed();
                this._sortedItems();
                this.updateItems();

                if (this._config.onSlideEnd && this._activeTabItemIndex !== this._compareIndex) {
                    this._config.onSlideEnd(upEvent);
                }

                // fix bug
                const event = new MouseEvent('click', {
                    view: window,
                    bubbles: true,
                    cancelable: true,
                });
                this._activeTabItem.primeval().dispatchEvent(event);

                this._scrollIncremental = 0;
                this._activeTabItemIndex = 0;
                this._downActionX = 0;
                this._moveActionX = 0;
                this._compareIndex = 0;
                this._activeTabItem = null;
            }
        };
    }

    initMoveAction() {
        this._moveAction = (moveEvent) => {
            if (this._activeTabItem) {
                this._moveActionX = moveEvent.pageX - this._downActionX;
                this._scrollIncremental = 0;
                this._scrollLeft(moveEvent);
                this._scrollRight(moveEvent);
            }
        };
    }

    initWheelAction() {
        this._wheelAction = (wheelEvent: WheelEvent) => {
            if (wheelEvent.deltaY > 0) {
                this._slideScrollbar.scrollX(this._slideScrollbar.getScrollX() + wheelEvent.deltaY);
            } else {
                this._slideScrollbar.scrollX(this._slideScrollbar.getScrollX() + wheelEvent.deltaY);
            }
        };
    }

    primeval(): HTMLElement {
        return this._slideTabBar;
    }

    updateItems(): void {
        for (let i = 0; i < this._slideTabItems.length; i++) {
            this._slideTabItems[i].animate().cancel();
            this._slideTabItems[i].translateX(0);
            this._slideTabItems[i].update();
        }
    }

    getScrollbar(): SlideScrollbar {
        return this._slideScrollbar;
    }

    getConfig(): SlideTabBarConfig {
        return this._config;
    }

    getBoundingRect(): DOMRect {
        return this._slideTabBar.getBoundingClientRect();
    }

    getSlideTabItems(): SlideTabItem[] {
        return this._slideTabItems;
    }

    setActiveItem(slideItemIndex: number) {
        this._compareIndex = slideItemIndex;
        this._activeTabItem = this._slideTabItems[slideItemIndex];
        this._activeTabItemIndex = slideItemIndex;
        this._slideTabItems.forEach((item) => {
            item.classList().remove('slide-tab-active');
        });
        this._activeTabItem.classList().add('slide-tab-active');
    }

    destroy(): void {
        document.removeEventListener('mousemove', this._moveAction);
        document.removeEventListener('mouseup', this._upAction);
        document.removeEventListener('wheel', this._wheelAction);
        this._slideTabItems.forEach((item) => {
            item.removeEventListener('mousedown', this._downAction);
        });
    }

    protected _hasEditItem(): boolean {
        for (let index = 0; index < this._slideTabItems.length; index++) {
            const element = this._slideTabItems[index];
            if (element.isEditMode()) {
                return true;
            }
        }
        return false;
    }

    protected _autoScrollFrame(): void {
        if (this._activeTabItem) {
            this._compareDirection = this._activeTabItem.translateX(this._moveActionX);
            switch (this._compareDirection) {
                case 1: {
                    this._slideScrollbar.scrollX(this._slideScrollbar.getScrollX() + this._scrollIncremental);
                    this._compareRight();
                    break;
                }
                case 0: {
                    this._slideScrollbar.scrollX(this._slideScrollbar.getScrollX() + this._scrollIncremental);
                    this._compareIndex = this._activeTabItemIndex;
                    break;
                }
                case -1: {
                    this._slideScrollbar.scrollX(this._slideScrollbar.getScrollX() + this._scrollIncremental);
                    this._compareLeft();
                    break;
                }
            }
        }
        this._autoScrollTime = requestAnimationFrame(() => {
            this._autoScrollFrame();
        });
    }

    protected _startAutoScroll(): void {
        if (this._autoScrollTime == null) {
            this._autoScrollFrame();
        }
    }

    protected _closeAutoScroll(): void {
        if (this._autoScrollTime) {
            cancelAnimationFrame(this._autoScrollTime);
        }
        this._autoScrollTime = null;
    }

    protected _scrollLeft(event: MouseEvent): void {
        const boundingRect = this.getBoundingRect();
        const boundingLine = 10;
        const x = event.pageX - boundingRect.x;
        if (x < boundingLine) {
            this._scrollIncremental = -Math.min(Math.abs(x - boundingLine) * 0.1, 50);
        }
    }

    protected _scrollRight(event: MouseEvent): void {
        const boundingRect = this.getBoundingRect();
        const boundingLine = 10;
        const x = event.pageX - boundingRect.x;
        if (x > boundingRect.width - boundingLine) {
            this._scrollIncremental = Math.min(Math.abs(x - (boundingRect.width - boundingLine)) * 0.1, 50);
        }
    }

    protected _sortedItems(): void {
        if (this._activeTabItem != null && this._activeTabItemIndex != null && this._compareIndex != null) {
            // data array list sort
            this._slideTabItems.splice(this._activeTabItemIndex, 1);
            this._slideTabItems.splice(this._compareIndex, 0, this._activeTabItem);

            // dom list sort
            if (this._config.slideTabBarItemAutoSort) {
                for (let i = 0; i < this._slideTabItems.length; i++) {
                    const item = this._slideTabItems[i];
                    const next = this._slideTabItems[i + 1];
                    if (next) {
                        item.after(next);
                    }
                }
            }
        }
    }

    protected _compareLeft(): void {
        if (this._activeTabItem && this._activeTabItemIndex) {
            const splice = this._slideTabItems.findIndex((item) => item.equals(this._activeTabItem));
            const length = this._slideTabItems.length;
            const collect = [];

            // collect compare item
            for (let i = 0; i < splice; i++) {
                if (i >= splice) {
                    break;
                }
                collect.push(this._slideTabItems[i]);
            }

            // reset right
            for (let i = splice + 1; i < length; i++) {
                this._slideTabItems[i].animate().translateX(0);
            }

            // diff item midline
            let notFound = true;
            for (let i = collect.length - 1; i >= 0; i--) {
                const item = collect[i];
                if (SlideTabItem.midline(this._activeTabItem) < item.getMidLine()) {
                    item.animate().translateX(this._activeTabItem.getWidth());
                    this._compareIndex = i;
                    notFound = false;
                } else {
                    item.animate().translateX(0);
                    if (notFound) {
                        this._compareIndex = this._activeTabItemIndex;
                    }
                }
            }
        }
    }

    protected _compareRight(): void {
        if (this._activeTabItem) {
            const splice = this._slideTabItems.findIndex((item) => item.equals(this._activeTabItem));
            const length = this._slideTabItems.length;
            const collect = [];

            // collect compare item
            for (let i = splice + 1; i < length; i++) {
                collect.push(this._slideTabItems[i]);
            }

            // reset left
            for (let i = 0; i < splice; i++) {
                this._slideTabItems[i].animate().translateX(0);
            }

            // diff item midline
            let notFound = true;
            for (let i = 0; i < collect.length; i++) {
                const item = collect[i];
                if (SlideTabItem.midline(this._activeTabItem) > item.getMidLine()) {
                    item.animate().translateX(-this._activeTabItem.getWidth());
                    this._compareIndex = splice + i + 1;
                    notFound = false;
                } else {
                    item.animate().translateX(0);
                    if (notFound) {
                        this._compareIndex = this._activeTabItemIndex;
                    }
                }
            }
        }
    }

    protected _initialize(): void {
        document.addEventListener('mousemove', this._moveAction);
        document.addEventListener('mouseup', this._upAction);
        this._slideTabBar.addEventListener('wheel', this._wheelAction);
        this._slideTabItems.forEach((item) => {
            item.addEventListener('mousedown', this._downAction);
        });
    }
}
