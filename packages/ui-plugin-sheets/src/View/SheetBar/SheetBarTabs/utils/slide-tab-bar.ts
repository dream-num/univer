import { Animate } from './animate';

export interface SlideTabBarConfig {
    slideTabBarClassName: string;
    slideTabBarItemActiveClassName: string;
    slideTabBarItemClassName: string;
    slideTabRootClassName: string;
    activeClassNameAutoController: boolean;
    slideTabBarItemAutoSort: boolean;
    onSlideEnd: (event: MouseEvent, compareIndex: number) => void;
    onChangeName: (event: FocusEvent) => void;
}

export interface SlideTabItemAnimate {
    translateX: (x: number) => void;
    cancel: () => void;
}

export class SlideTabItem {
    _slideTabItem: HTMLElement;

    _animate: Animate | null;

    _midline: number = 0;

    _translateX: number;

    _scrollbar: SlideScrollbar;

    _slideTabBar: SlideTabBar;

    _editMode: boolean;

    _placeholder: HTMLElement | null;

    constructor(slideTabItem: HTMLElement, slideTabBar: SlideTabBar) {
        this._slideTabItem = slideTabItem;
        this._animate = null;
        this._translateX = 0;
        this._editMode = false;
        this._slideTabBar = slideTabBar;
        this._placeholder = null;
        this._scrollbar = slideTabBar.getScrollbar();
        this.update();
    }

    static midline(item: SlideTabItem) {
        return item.getBoundingRect().x + item.getBoundingRect().width / 2;
    }

    static make(nodeList: NodeList, slideTabBar: SlideTabBar): SlideTabItem[] {
        const result: SlideTabItem[] = [];
        nodeList.forEach((item) => result.push(new SlideTabItem(item as HTMLElement, slideTabBar)));
        return result;
    }

    getSlideTabItem(): HTMLElement {
        return this._slideTabItem;
    }

    isEditMode(): boolean {
        return this._editMode;
    }

    classList(): DOMTokenList {
        return this._slideTabItem.classList;
    }

    primeval(): HTMLElement {
        return this._slideTabItem;
    }

    translateX(x: number) {
        this._translateX = x;
        this._slideTabItem.style.transform = `translateX(${x}px)`;
        return this.getTranslateXDirection();
    }

    // editor(callback?: (event: FocusEvent) => void): void {
    //     if (this._editMode === false) {
    //         const input = this.primeval().querySelector('span');

    //         const blurAction = (focusEvent: FocusEvent) => {
    //             this._editMode = false;

    //             if (input) {
    //                 input.removeAttribute('contentEditable');
    //                 input.removeEventListener('blur', blurAction);
    //                 input.removeEventListener('input', inputAction);
    //             }

    //             this._slideTabBar.updateItems();

    //             if (this._slideTabBar.getConfig().onChangeName) {
    //                 this._slideTabBar.getConfig().onChangeName(focusEvent);
    //             }

    //             if (callback) {
    //                 callback(focusEvent);
    //             }
    //         };

    //         let inputAction = () => {
    //             if (input) {
    //                 const brs = input.querySelectorAll('br');
    //                 if (brs.length > 0) {
    //                     brs.forEach((br) => {
    //                         if (input) {
    //                             input.removeChild(br);
    //                         }
    //                     });
    //                     input.blur();
    //                 }
    //             }
    //         };

    //         if (input) {
    //             input.setAttribute('contentEditable', 'true');
    //             input.addEventListener('blur', blurAction);
    //             input.addEventListener('input', inputAction);
    //             this._editMode = true;
    //             SlideTabBar.keepLastIndex(input);
    //         }
    //     }
    // }

    animate(): SlideTabItemAnimate {
        return {
            translateX: (x: number) => {
                if (this._translateX !== x) {
                    if (this._animate) {
                        this._animate.cancel();
                        this._animate = null;
                    }
                    this._animate = new Animate({
                        begin: this._translateX,
                        end: x,
                        receive: (val: number) => {
                            this._slideTabItem.style.transform = `translateX(${val}px)`;
                        },
                    });
                    this._translateX = x;
                    this._animate.request();
                }
            },
            cancel: () => {
                if (this._animate) {
                    this._animate.cancel();
                    this._animate = null;
                }
            },
        };
    }

    after(other: SlideTabItem) {
        this._slideTabItem.after(other._slideTabItem || other);
    }

    update() {
        this._midline = SlideTabItem.midline(this);
    }

    disableFixed() {
        if (this._placeholder) {
            const primeval = this._slideTabBar.primeval();

            this._slideTabItem.style.removeProperty('position');
            this._slideTabItem.style.removeProperty('left');
            this._slideTabItem.style.removeProperty('top');
            this._slideTabItem.style.removeProperty('width');
            this._slideTabItem.style.removeProperty('height');
            this._slideTabItem.style.removeProperty('box-shadow');
            this._slideTabItem.style.removeProperty('background');

            this._placeholder.after(this._slideTabItem);
            primeval.removeChild(this._placeholder);
            this._placeholder = null;
        }
    }

    enableFixed() {
        const placeholder = document.createElement('div');
        const boundingRect = this.getBoundingRect();

        this._placeholder = placeholder;
        this._placeholder.style.width = `${boundingRect.width}px`;
        this._placeholder.style.height = `${boundingRect.height}px`;
        this._placeholder.style.flexShrink = '0';

        this._slideTabItem.style.left = `${boundingRect.x - this.getScrollbar().getScrollX()}px`;
        this._slideTabItem.style.top = `${boundingRect.y}px`;
        this._slideTabItem.style.width = `${boundingRect.width}px`;
        this._slideTabItem.style.height = `${boundingRect.height}px`;
        this._slideTabItem.style.background = getComputedStyle(this._slideTabItem).background;
        this._slideTabItem.style.boxShadow = '0px 0px 1px 1px rgba(82,82,82,0.1)';
        this._slideTabItem.style.position = 'fixed';

        this._slideTabItem.after(placeholder);
        document.body.appendChild(this._slideTabItem);
    }

    addEventListener<K extends keyof HTMLElementEventMap>(
        type: K,
        action: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
        options?: boolean | AddEventListenerOptions
    ) {
        this._slideTabItem.addEventListener(type, action, options);
    }

    removeEventListener<K extends keyof HTMLElementEventMap>(
        type: K,
        action: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
        options?: boolean | AddEventListenerOptions
    ) {
        this._slideTabItem.removeEventListener(type, action, options);
    }

    getScrollbar() {
        return this._scrollbar;
    }

    getMidLine() {
        return this._midline;
    }

    getBoundingRect() {
        const boundingClientRect = this._slideTabItem.getBoundingClientRect();
        boundingClientRect.x += this._scrollbar.getScrollX();
        return boundingClientRect;
    }

    getWidth() {
        return this.getBoundingRect().width;
    }

    getTranslateXDirection() {
        const midline = SlideTabItem.midline(this);
        return midline > this._midline ? 1 : midline < this._midline ? -1 : 0;
    }

    equals(other: SlideTabItem | null) {
        return other && other._slideTabItem === this._slideTabItem;
    }

    getId(): string {
        return this._slideTabItem.dataset.id || '';
    }
}

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

    protected _scrollIncremental: number = 0;

    protected _compareDirection: number = 0;

    protected _autoScrollTime: number | null = null;

    protected _slideScrollbar: SlideScrollbar;

    protected _longPressTimer: number | null = null;

    constructor(config: Partial<SlideTabBarConfig>) {
        if (config.slideTabRootClassName == null) {
            throw new Error('not found slide-tab-bar root element');
        }

        const slideTabBar = document.querySelector(
            `.${config.slideTabRootClassName} .${config.slideTabBarClassName ?? 'slide-tab-bar'}`
        );
        const slideTabItems = document.querySelectorAll(
            `.${config.slideTabRootClassName} .${config.slideTabBarItemClassName ?? 'slide-tab-item'}`
        );

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

            const slideItemIndex = this._slideTabItems.findIndex(
                (item) =>
                    item.getId() ===
                    (downEvent.target as Element)?.closest(`.${config.slideTabBarItemClassName}`)?.dataset.id
            );

            if (slideItemIndex === -1) return;

            this._compareIndex = slideItemIndex;
            this._downActionX = downEvent.pageX;
            this._moveActionX = 0;
            this._scrollIncremental = 0;
            this._activeTabItem = this._slideTabItems[slideItemIndex];
            if (!this._activeTabItem) return;
            this._activeTabItemIndex = slideItemIndex;

            // 设置定时器，延迟 200 毫秒执行拖动
            this._longPressTimer = window.setTimeout(() => {
                const { pageX, pageY } = downEvent;
                const current = Date.now();
                const diffTime = current - lastTime <= 800;
                const diffPageX = pageX === lastPageX;
                const diffPageY = pageY === lastPageY;

                // double click
                if (diffTime && diffPageX && diffPageY) {
                    // const slideItem = this._slideTabItems.find((item) =>
                    //     item.equals(new SlideTabItem(downEvent.currentTarget as HTMLElement, this))
                    // );
                    // if (slideItem) {
                    //     // user editor
                    //     slideItem.editor();
                    // }
                    // lastTime = 0;
                    // lastPageX = 0;
                    // lastPageY = 0;
                } else {
                    // not item is edit mode
                    // if (!this._hasEditItem()) {
                    // if (SlideTabBar.checkedSkipSlide(downEvent)) {
                    //     lastPageX = 0;
                    //     lastTime = 0;
                    //     lastPageY = 0;
                    //     return;
                    // }

                    // if (slideItemIndex > -1) {
                    // this._compareIndex = slideItemIndex;
                    // this._downActionX = downEvent.pageX;
                    // this._moveActionX = 0;
                    // this._scrollIncremental = 0;
                    // this._activeTabItem = this._slideTabItems[slideItemIndex];
                    // this._activeTabItemIndex = slideItemIndex;
                    if (this._config.activeClassNameAutoController) {
                        this._slideTabItems.forEach((item) => {
                            item.classList().remove(this._config.slideTabBarItemActiveClassName);
                        });
                        this._activeTabItem.classList().add(this._config.slideTabBarItemActiveClassName);
                    }
                    this._activeTabItem.enableFixed();

                    //
                    console.info('开始拖动啦=====');
                    this._startAutoScroll();
                    // 设置鼠标光标为十字拖动
                    const activeSlideItemElement = this._activeTabItem?.getSlideTabItem();
                    activeSlideItemElement.style.cursor = 'move';

                    this._activeTabItem?.addEventListener('pointermove', this._moveAction);
                    activeSlideItemElement.setPointerCapture(downEvent.pointerId);
                    //     } else {
                    //         this.updateItems();
                    //         this._activeTabItemIndex = 0;
                    //         this._downActionX = 0;
                    //         this._scrollIncremental = 0;
                    //         this._compareIndex = 0;
                    //         this._activeTabItem = null;
                    //     }
                    // }

                    lastPageX = pageX;
                    lastPageY = pageY;
                    lastTime = current;
                }
            }, 300);

            this._activeTabItem?.addEventListener('pointerup', this._upAction);
        };

        this._upAction = (upEvent: MouseEvent) => {
            // 清除定时器
            if (this._longPressTimer) {
                clearTimeout(this._longPressTimer);
                this._longPressTimer = null;
                console.info('清除定时器 pointerup=====');
            }

            if (!this._activeTabItem) return;

            console.info('松开了pointerup=====');
            this._closeAutoScroll();
            this._activeTabItem.disableFixed();
            this._sortedItems();
            this.updateItems();

            this._activeTabItem?.removeEventListener('pointermove', this._moveAction);
            this._activeTabItem?.removeEventListener('pointerup', this._upAction);
            // this._slideTabItems.forEach((item) => {
            //     item.removeEventListener('pointerdown', this._downAction);
            // });

            // 恢复鼠标光标
            const activeSlideItemElement = this._activeTabItem?.getSlideTabItem();
            if (!activeSlideItemElement) return;

            activeSlideItemElement.style.cursor = 'auto';
            activeSlideItemElement.releasePointerCapture(upEvent.pointerId);

            if (this._config.onSlideEnd && this._activeTabItemIndex !== this._compareIndex) {
                this._config.onSlideEnd(upEvent, this._compareIndex || 0);
            }

            // fix bug
            // const event = new MouseEvent('click', {
            //     view: window,
            //     bubbles: true,
            //     cancelable: true,
            // });
            // this._activeTabItem.primeval().dispatchEvent(event);

            this._scrollIncremental = 0;
            this._activeTabItemIndex = 0;
            this._downActionX = 0;
            this._moveActionX = 0;
            this._compareIndex = 0;
            this._activeTabItem = null;
        };

        this._moveAction = (moveEvent) => {
            if (this._activeTabItem) {
                console.info('动动动===pointermove=====');
                this._moveActionX = moveEvent.pageX - this._downActionX;
                this._scrollIncremental = 0;
                this._scrollLeft(moveEvent);
                this._scrollRight(moveEvent);
            }
        };

        this._wheelAction = (wheelEvent: WheelEvent) => {
            if (wheelEvent.deltaY > 0) {
                this._slideScrollbar.scrollX(this._slideScrollbar.getScrollX() + wheelEvent.deltaY);
            } else {
                this._slideScrollbar.scrollX(this._slideScrollbar.getScrollX() + wheelEvent.deltaY);
            }
        };

        this._initialize();
    }

    // static checkedSkipSlide(event: MouseEvent): boolean {
    //     let parent: HTMLElement | null = event.target as HTMLElement;
    //     while (parent != null && parent !== document.body) {
    //         if (parent.getAttribute('data-slide-skip')) {
    //             return true;
    //         }
    //         parent = parent.parentElement;
    //     }
    //     return false;
    // }

    // static keepLastIndex(inputHtml: HTMLElement) {
    //     setTimeout(() => {
    //         const range = window.getSelection();
    //         if (range) {
    //             range.selectAllChildren(inputHtml);
    //             range.collapseToEnd();
    //         }
    //     });
    // }

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

    destroy(): void {
        document.removeEventListener('wheel', this._wheelAction);
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
        this._slideTabBar.addEventListener('wheel', this._wheelAction);
        this._slideTabItems.forEach((item) => {
            item.addEventListener('pointerdown', this._downAction);
        });
    }
}
