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

import type { IScrollState } from '../../../../services/sheet-bar/type';
import { Animate } from './animate';
import { calculateSheetTabDragSort, reorderItems } from './sheet-tab-drag-sort';
import { keepLastTextIndex, keepTextSelected, startSheetTabNameEditor } from './sheet-tab-name-editor';

export interface ISlideTabBarConfig {
    slideTabBarSelector: string;
    slideTabBarItemSelector: string;
    slideTabBarContainer: HTMLDivElement | null;
    slideTabBarItemAutoSort: boolean;
    currentIndex: number;
    onSlideEnd: (event: MouseEvent, compareIndex: number) => void;
    onChangeName: (id: string, name: string) => void;
    onChangeTab: (event: MouseEvent, id: string) => void;
    onScroll: (state: IScrollState) => void;
    onNameCheckAlert: (text: string, id?: string) => boolean;
    onNameChangeCheck: () => boolean;
}

export interface ISlideTabItemAnimate {
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

    static leftLine(item: SlideTabItem) {
        return item.getBoundingRect().x;
    }

    static rightLine(item: SlideTabItem) {
        return item.getBoundingRect().x + item.getBoundingRect().width;
    }

    static make(nodeList: NodeList, slideTabBar: SlideTabBar): SlideTabItem[] {
        const result: SlideTabItem[] = [];
        nodeList.forEach((item) => result.push(new SlideTabItem(item as HTMLElement, slideTabBar)));
        return result;
    }

    getSlideTabItem(): HTMLElement {
        return this._slideTabItem;
    }

    getEditor() {
        return this._slideTabItem.querySelector('span');
    }

    focus() {
        this.getEditor()?.focus();
    }

    selectAll() {
        const input = this.getEditor();
        input && SlideTabBar.keepSelectAll(input);
    }

    isEditMode(): boolean {
        return this._editMode;
    }

    classList(): DOMTokenList {
        return this._slideTabItem.classList;
    }

    translateX(x: number) {
        this._translateX = x;
        this._slideTabItem.style.transform = `translateX(${x}px)`;
        return this.getTranslateXDirection();
    }

    setEditor(callback?: (event: FocusEvent) => void): void {
        if (this._editMode) {
            return;
        }

        startSheetTabNameEditor({
            slideTabItem: this._slideTabItem,
            canStart: () => this._slideTabBar.getConfig().onNameChangeCheck(),
            checkName: (name) => this._slideTabBar.getConfig().onNameCheckAlert(name, this.getId()),
            setEditMode: (editing) => {
                this._editMode = editing;
            },
            beforeCommit: () => {
                this._slideTabBar.removeListener();
                this._slideTabBar.updateItems();
            },
            onCommit: (name, focusEvent) => {
                try {
                    this._slideTabBar.getConfig().onChangeName(this.getId(), name);
                    if (callback) {
                        callback(focusEvent);
                    }
                } finally {
                    this._slideTabBar.addListener();
                }
            },
        });
    }

    nameCheck() {
        const input = this._slideTabItem.querySelector('span');
        if (!input) return false;

        const text = input.textContent ?? '';
        const checkAlert = this._slideTabBar.getConfig().onNameCheckAlert(text, this.getId());
        return checkAlert;
    }

    animate(): ISlideTabItemAnimate {
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

            // change to set unset
            this._slideTabItem.style.removeProperty('position');
            this._slideTabItem.style.removeProperty('left');
            this._slideTabItem.style.removeProperty('top');
            this._slideTabItem.style.removeProperty('width');
            this._slideTabItem.style.removeProperty('height');
            this._slideTabItem.style.removeProperty('background');
            this._slideTabItem.style.removeProperty('padding');
            this._slideTabItem.style.removeProperty('box-sizing');
            this._slideTabItem.style.removeProperty('font-size');
            this._slideTabItem.style.removeProperty('font-family');
            this._slideTabItem.style.removeProperty('font-weight');
            this._slideTabItem.style.removeProperty('color');
            this._slideTabItem.style.removeProperty('border-radius');

            this._placeholder.after(this._slideTabItem);
            primeval.removeChild(this._placeholder);
            this._placeholder = null;
        }
    }

    enableFixed() {
        const placeholder = document.createElement('div');
        const boundingRect = this.getBoundingRect();
        const computedStyles = getComputedStyle(this._slideTabItem);
        const innerSpan = this._slideTabItem.querySelector('span');

        this._placeholder = placeholder;
        this._placeholder.style.width = `${boundingRect.width}px`;
        this._placeholder.style.height = `${boundingRect.height}px`;
        this._placeholder.style.flexShrink = '0';
        this._placeholder.style.margin = computedStyles.margin;

        this._slideTabItem.style.background = computedStyles.background;
        if (innerSpan) {
            const innerPadding = getComputedStyle(innerSpan).padding;
            this._slideTabItem.style.padding = innerPadding;
        }
        this._slideTabItem.style.boxSizing = computedStyles.boxSizing;
        this._slideTabItem.style.fontSize = computedStyles.fontSize;
        this._slideTabItem.style.fontFamily = computedStyles.fontFamily;
        this._slideTabItem.style.fontWeight = computedStyles.fontWeight;
        this._slideTabItem.style.color = computedStyles.color;
        this._slideTabItem.style.borderRadius = computedStyles.borderRadius;

        this._slideTabItem.style.left = `${boundingRect.x - this.getScrollbar().getScrollX()}px`;
        this._slideTabItem.style.top = `${boundingRect.y}px`;
        this._slideTabItem.style.width = `${boundingRect.width}px`;
        this._slideTabItem.style.height = `${boundingRect.height}px`;
        this._slideTabItem.style.position = 'fixed';

        this._slideTabItem.after(placeholder);
        document.body.appendChild(this._slideTabItem);
    }

    addEventListener<K extends keyof HTMLElementEventMap>(
        type: K,
        action: (this: HTMLElement, ev: HTMLElementEventMap[K]) => void,
        options?: boolean | AddEventListenerOptions
    ) {
        this._slideTabItem.addEventListener(type, action, options);
    }

    removeEventListener<K extends keyof HTMLElementEventMap>(
        type: K,
        action: (this: HTMLElement, ev: HTMLElementEventMap[K]) => void,
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

    scrollX(x: number) {
        const primeval = this._slideTabBar.primeval();
        primeval.scrollLeft = x;
        this._scrollX = primeval.scrollLeft;
    }

    scrollRight() {
        const primeval = this._slideTabBar.primeval();
        primeval.scrollLeft = primeval.scrollWidth;
        this._scrollX = primeval.scrollLeft;
    }

    getScrollX(): number {
        return this._scrollX;
    }
}

export class SlideTabBar {
    /** Time in milliseconds to wait to raise long press events if button is still pressed */
    static LongPressDelay = 500; // in milliseconds

    /** Time in milliseconds with two consecutive clicks will be considered as a double click */
    static DoubleClickDelay = 300; // in milliseconds

    protected _activeTabItemIndex: number = 0;

    protected _slideTabBar: HTMLElement;

    protected _slideTabItems: SlideTabItem[] = [];

    protected _config: ISlideTabBarConfig;

    protected _downActionX: number = 0;

    protected _moveActionX: number = 0;

    protected _compareIndex: number = 0;

    protected _activeTabItem: SlideTabItem | null = null;

    protected _moveAction: (e: MouseEvent) => void;

    protected _upAction: (e: MouseEvent) => void;

    protected _downAction: (e: MouseEvent) => void;

    protected _wheelAction: (e: WheelEvent) => void;

    protected _scrollIncremental: number = 0;

    protected _dragStartScrollX: number = 0;

    protected _compareDirection: number = 0;

    protected _autoScrollTime: number | null = null;

    protected _slideScrollbar: SlideScrollbar;

    protected _longPressTimer: NodeJS.Timeout | number | null = null;

    /**
     * left border line
     */
    protected _leftBoundingLine: number = 0;

    /**
     * right border line
     */
    protected _rightBoundingLine: number = 0;

    /**
     * The distance required to move to the left border
     */
    protected _leftMoveX: number = 0;

    /**
     * The distance required to move to the right border
     */
    protected _rightMoveX: number = 0;

    // eslint-disable-next-line max-lines-per-function
    constructor(config: Partial<ISlideTabBarConfig>) {
        if (config.slideTabBarContainer == null) {
            throw new Error('not found slide-tab-bar root element');
        }

        const slideTabBar = config.slideTabBarContainer.querySelector(`${config.slideTabBarSelector}`);
        if (slideTabBar == null) {
            throw new Error('not found slide-tab-bar');
        }

        this._slideTabBar = slideTabBar as HTMLElement;
        this._slideScrollbar = new SlideScrollbar(this);
        this._config = config as ISlideTabBarConfig;

        this._initConfig();

        let lastPageX = 0;
        let lastPageY = 0;
        let lastTime = 0;
        // eslint-disable-next-line max-lines-per-function
        this._downAction = (downEvent: MouseEvent) => {
            // Waiting for the rename of the previous TAB
            if (this._activeTabItem?.isEditMode()) {
                return;
            }

            // Clear timer
            if (this._longPressTimer) {
                clearTimeout(this._longPressTimer);
                this._longPressTimer = null;
            }

            const slideItemId = (downEvent.target as HTMLElement)
                ?.closest(`${config.slideTabBarItemSelector}`)
                ?.getAttribute('data-id');
            const slideItemIndex = this._slideTabItems.findIndex((item) => item.getId() === slideItemId);

            if (slideItemId == null || slideItemIndex === -1) return;

            // switch tab
            if (this._activeTabItemIndex !== slideItemIndex) {
                this._activeTabItem?.removeEventListener('pointermove', this._moveAction);
                this._activeTabItem?.removeEventListener('pointerup', this._upAction);
                this._config.onChangeTab(downEvent, slideItemId);
                return;
            }

            this._compareIndex = slideItemIndex;
            this._downActionX = downEvent.pageX;
            this._moveActionX = 0;
            this._scrollIncremental = 0;
            this._dragStartScrollX = this._slideScrollbar.getScrollX();
            this._activeTabItem = this._slideTabItems[slideItemIndex];
            if (!this._activeTabItem) {
                console.error('Not found active slide-tab-item in sheet bar');
                return;
            }

            const activeSlideItemElement = this._activeTabItem.getSlideTabItem();
            activeSlideItemElement?.setPointerCapture((downEvent as PointerEvent).pointerId);
            this._activeTabItem?.addEventListener('pointerup', this._upAction);

            const { x, width } = this._activeTabItem.getBoundingRect();
            const { x: containerX, width: containerWidth } = this.getBoundingRect();
            const scrollX = this._slideScrollbar.getScrollX();
            this._leftBoundingLine = this._downActionX - (x - scrollX);
            this._rightBoundingLine = x - scrollX + width - this._downActionX;
            this._leftMoveX = x - containerX - scrollX;
            this._rightMoveX = containerX + containerWidth - (x + width) + scrollX;

            if (downEvent.button === 2 || this._hasEditItem()) {
                return;
            }

            const { pageX, pageY } = downEvent;
            const current = Date.now();
            const diffTime = current - lastTime <= SlideTabBar.DoubleClickDelay;
            const diffPageX = Math.abs(pageX - lastPageX) < 10;
            const diffPageY = Math.abs(pageY - lastPageY) < 10;

            // double click
            if (diffTime && diffPageX && diffPageY) {
                // user editor
                this._activeTabItem.setEditor();
            }

            lastPageX = pageX;
            lastPageY = pageY;
            lastTime = current;

            // Set a timer to delay dragging for 300 milliseconds
            this._longPressTimer = setTimeout(() => {
                if (!activeSlideItemElement || this._activeTabItem?.isEditMode()) return;

                this._activeTabItem?.enableFixed();
                this._startAutoScroll();
                // Set the mouse cursor to drag
                activeSlideItemElement.setPointerCapture((downEvent as PointerEvent).pointerId);
                activeSlideItemElement.style.cursor = 'move';
                this._activeTabItem?.addEventListener('pointermove', this._moveAction);
            }, SlideTabBar.LongPressDelay);
        };

        this._upAction = (upEvent: MouseEvent) => {
            // Clear timer
            if (this._longPressTimer) {
                clearTimeout(this._longPressTimer);
                this._longPressTimer = null;
            }

            if (!this._activeTabItem) return;

            if (this._activeTabItem.isEditMode()) {
                const activeSlideItemElement = this._activeTabItem.getSlideTabItem();
                const pointerId = (upEvent as PointerEvent).pointerId;
                if (pointerId != null && activeSlideItemElement.hasPointerCapture(pointerId)) {
                    activeSlideItemElement.releasePointerCapture(pointerId);
                }
                this._activeTabItem.removeEventListener('pointerup', this._upAction);
                return;
            }

            // When blurring after editing the table name, _activeTabItemIndex and _compareIndex may not be equal, causing slideEnd to be triggered
            const isFromScroll = this._autoScrollTime !== null;

            this._closeAutoScroll();
            this._activeTabItem.disableFixed();
            // this._sortedItems();
            this.updateItems();

            // Restore the mouse cursor
            const activeSlideItemElement = this._activeTabItem?.getSlideTabItem();
            if (!activeSlideItemElement) return;

            activeSlideItemElement.style.cursor = '';
            activeSlideItemElement.releasePointerCapture((upEvent as PointerEvent).pointerId);

            this._activeTabItem?.removeEventListener('pointermove', this._moveAction);
            this._activeTabItem?.removeEventListener('pointerup', this._upAction);
            if (
                this._config.onSlideEnd &&
                this._activeTabItemIndex !== this._compareIndex &&
                isFromScroll
            ) {
                this.removeListener();
                this._config.onSlideEnd(upEvent, this._compareIndex || 0);
            }

            this._scrollIncremental = 0;
            this._downActionX = 0;
            this._moveActionX = 0;
            this._dragStartScrollX = this._slideScrollbar.getScrollX();
            this._compareIndex = 0;
        };

        this._moveAction = (moveEvent) => {
            if (this._activeTabItem) {
                this._moveActionX = moveEvent.pageX - this._downActionX;
                if (this._moveActionX <= -this._leftMoveX) {
                    this._moveActionX = -this._leftMoveX;
                } else if (this._moveActionX >= this._rightMoveX) {
                    this._moveActionX = this._rightMoveX;
                }
                this._scrollIncremental = 0;
                this._scrollLeft(moveEvent);
                this._scrollRight(moveEvent);
            }
        };

        this._wheelAction = (wheelEvent: WheelEvent) => {
            this.setScroll(wheelEvent.deltaY);
        };

        this.addListener();
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
        keepLastTextIndex(inputHtml);
    }

    static keepSelectAll(inputHtml: HTMLElement) {
        keepTextSelected(inputHtml);
    }

    /**
     * The current instance is persistent, but some parameters need to be updated after refreshing
     * @param currentIndex
     */
    update(currentIndex: number) {
        this.removeListener();
        this._config.currentIndex = currentIndex;
        this._initConfig();
        this.addListener();
        this.scrollToItem(currentIndex);
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

    getConfig(): ISlideTabBarConfig {
        return this._config;
    }

    getBoundingRect(): DOMRect {
        return this._slideTabBar.getBoundingClientRect();
    }

    getSlideTabItems(): SlideTabItem[] {
        return this._slideTabItems;
    }

    getActiveItem() {
        return this._activeTabItem;
    }

    isLeftEnd(): boolean {
        return this._slideTabBar.scrollLeft === 0;
    }

    isRightEnd(): boolean {
        const parent = this._slideTabBar.parentElement;
        if (!parent) return false;
        return this._slideTabBar.scrollWidth - parent.clientWidth === this._slideTabBar.scrollLeft;
    }

    addListener() {
        this._slideTabBar.addEventListener('wheel', this._wheelAction);
        this._slideTabItems.forEach((item) => {
            item.addEventListener('pointerdown', this._downAction);
        });
    }

    removeListener(): void {
        this._slideTabBar.removeEventListener('wheel', this._wheelAction);
        this._slideTabItems.forEach((item) => {
            item.removeEventListener('pointerdown', this._downAction);
        });
    }

    setScroll(x: number) {
        this._slideScrollbar.scrollX(this._slideScrollbar.getScrollX() + x);
        if (x > 0) {
            const left = this.calculateLeftScrollX();
            this._slideScrollbar.scrollX(this._slideScrollbar.getScrollX() + left);
        } else if (x < 0) {
            const right = this.calculateRightScrollX();
            this._slideScrollbar.scrollX(this._slideScrollbar.getScrollX() + right);
        }

        this._config.onScroll({
            leftEnd: this.isLeftEnd(),
            rightEnd: this.isRightEnd(),
        });
    }

    flipPage(x: number) {
        if (x > 0) {
            const left = this.calculateLeftScrollX(true);
            this._slideScrollbar.scrollX(this._slideScrollbar.getScrollX() + left);
        } else if (x < 0) {
            const right = this.calculateRightScrollX(true);
            this._slideScrollbar.scrollX(this._slideScrollbar.getScrollX() + right);
        }

        this._config.onScroll({
            leftEnd: this.isLeftEnd(),
            rightEnd: this.isRightEnd(),
        });
    }

    scrollToItem(index?: number): void {
        const targetIndex = index ?? this._config.currentIndex;
        // Check index validity
        if (targetIndex < 0 || targetIndex >= this._slideTabItems.length) {
            console.error('Index out of bounds');
            return;
        }

        const right = this.calculateTabItemScrollX(targetIndex);
        this._slideScrollbar.scrollX(this._slideScrollbar.getScrollX() + right);

        // Trigger a scroll event
        this._config.onScroll({
            leftEnd: this.isLeftEnd(),
            rightEnd: this.isRightEnd(),
        });
    }

    calculateLeftScrollX(shouldFlipPage?: boolean): number {
        let scrollX = 0;
        const padding = 4;
        this._slideTabItems.some((item) => {
            const containerRect = this._slideTabBar.getBoundingClientRect();
            const containerPosition = containerRect.left + containerRect.width;
            const itemReact = item.getSlideTabItem().getBoundingClientRect();
            const itemLeft = itemReact.left;
            const itemWidth = itemReact.width;
            if (itemLeft < containerPosition && itemLeft + itemWidth + padding * 2 > containerPosition) {
                scrollX = shouldFlipPage
                    ? itemLeft - containerRect.left - padding
                    : itemLeft + itemWidth - containerPosition + padding;

                return true;
            }
            return false;
        });

        return scrollX;
    }

    calculateRightScrollX(shouldFlipPage?: boolean): number {
        let scrollX = 0;
        const padding = 4;
        this._slideTabItems.some((item) => {
            const containerRect = this._slideTabBar.getBoundingClientRect();
            const containerPosition = containerRect.left;
            const itemReact = item.getSlideTabItem().getBoundingClientRect();
            const itemLeft = itemReact.left;
            const itemWidth = itemReact.width;
            if (itemLeft - padding * 2 < containerPosition && itemLeft + itemWidth > containerPosition) {
                scrollX = shouldFlipPage
                    ? itemLeft + itemWidth - containerRect.left - containerRect.width + padding
                    : itemLeft - containerPosition - padding;

                return true;
            }
            return false;
        });

        return scrollX;
    }

    calculateTabItemScrollX(index: number): number {
        let scrollX = 0;
        const padding = 4;

        const containerRect = this._slideTabBar.getBoundingClientRect();
        const containerLeftPosition = containerRect.left;
        const containerRightPosition = containerRect.left + containerRect.width;

        const itemReact = this._slideTabItems[index].getSlideTabItem().getBoundingClientRect();
        const itemLeft = itemReact.left;
        const itemWidth = itemReact.width;

        // Left side or part of left side
        if (itemLeft - padding * 2 < containerLeftPosition) {
            scrollX = itemLeft - containerLeftPosition - padding;
        }

        // Right side or part of right side
        if (itemLeft + itemWidth + padding * 2 > containerRightPosition) {
            scrollX = itemLeft + itemWidth - containerRightPosition + padding;
        }

        return scrollX;
    }

    calculateActiveTabItemScrollX(): number {
        let scrollX = 0;
        const padding = 4;

        const containerRect = this._slideTabBar.getBoundingClientRect();
        const containerLeftPosition = containerRect.left;
        const containerRightPosition = containerRect.left + containerRect.width;

        const itemReact = this._activeTabItem?.getSlideTabItem().getBoundingClientRect();
        if (!itemReact) return 0;

        const itemLeft = itemReact.left;
        const itemWidth = itemReact.width;

        // Part of left side
        if (itemLeft - padding * 2 < containerLeftPosition && itemLeft + itemWidth > containerLeftPosition) {
            scrollX = itemLeft - containerLeftPosition - padding;
        }

        // Part of right side
        if (itemLeft < containerRightPosition && itemLeft + itemWidth + padding * 2 > containerRightPosition) {
            scrollX = itemLeft + itemWidth - containerRightPosition + padding;
        }

        return scrollX;
    }

    destroy() {
        this.removeListener();

        this._downActionX = 0;
        this._moveActionX = 0;
        this._dragStartScrollX = this._slideScrollbar.getScrollX();
        this._compareDirection = 0;
        this._compareIndex = 0;
        this._slideTabItems = [];
        this._activeTabItem = null;

        // TODO@Dushusir: If set to null, the types in other places need to be judged
        // this._slideTabBar = null;
        // this._slideScrollbar = null;
        // this._config = null;
        // this._downAction = null;
        // this._upAction = null;
        // this._moveAction = null;
        // this._wheelAction = null;
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
            this._slideScrollbar.scrollX(this._slideScrollbar.getScrollX() + this._scrollIncremental);
            this._updateDragSortState();
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
        const x = event.pageX - boundingRect.x;
        if (x < this._leftBoundingLine) {
            this._scrollIncremental = -Math.min(Math.abs(x - this._leftBoundingLine) * 0.1, 50);
        }
    }

    protected _scrollRight(event: MouseEvent): void {
        const boundingRect = this.getBoundingRect();
        const x = event.pageX - boundingRect.x;
        if (x > boundingRect.width - this._rightBoundingLine) {
            this._scrollIncremental = Math.min(Math.abs(x - (boundingRect.width - this._rightBoundingLine)) * 0.1, 50);
        }
    }

    protected _sortedItems(): void {
        if (this._activeTabItem != null && this._activeTabItemIndex != null && this._compareIndex != null) {
            this._slideTabItems = reorderItems(this._slideTabItems, this._activeTabItemIndex, this._compareIndex);

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
        this._updateDragSortState();
    }

    protected _compareRight(): void {
        this._updateDragSortState();
    }

    protected _updateDragSortState(): void {
        if (!this._activeTabItem) {
            return;
        }

        const dragSortOffsetX = this._moveActionX + this._slideScrollbar.getScrollX() - this._dragStartScrollX;
        const dragSortResult = calculateSheetTabDragSort(
            this._slideTabItems.map((item) => ({
                id: item.getId(),
                left: item.getMidLine() - item.getWidth() / 2,
                width: item.getWidth(),
            })),
            this._activeTabItemIndex,
            dragSortOffsetX
        );

        this._compareIndex = dragSortResult.targetIndex;
        dragSortResult.itemOffsets.forEach((offset, index) => {
            const item = this._slideTabItems[index];
            if (!item) {
                return;
            }

            if (item.equals(this._activeTabItem)) {
                this._compareDirection = item.translateX(this._moveActionX);
                return;
            }

            item.animate().translateX(offset);
        });
    }

    protected _initConfig(): void {
        const slideTabItems = this._slideTabBar.querySelectorAll(`${this._config.slideTabBarItemSelector}`);

        this._downActionX = 0;
        this._moveActionX = 0;
        this._compareDirection = 0;
        this._compareIndex = 0;

        this._slideTabItems = SlideTabItem.make(slideTabItems, this);
        this._activeTabItemIndex = this._config.currentIndex;
        this._activeTabItem = this._slideTabItems[this._activeTabItemIndex];
    }
}
