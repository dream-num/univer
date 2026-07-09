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

import { afterEach, describe, expect, it, vi } from 'vitest';
import { SlideTabBar, SlideTabItem } from '../slide-tab-bar';

const originalRequestAnimationFrame = window.requestAnimationFrame;
const originalCancelAnimationFrame = window.cancelAnimationFrame;
const originalConsoleError = console.error;

function rect(x: number, width: number, y = 0, height = 24): DOMRect {
    return {
        x,
        y,
        left: x,
        top: y,
        width,
        height,
        right: x + width,
        bottom: y + height,
        toJSON: () => ({}),
    } as DOMRect;
}

class TestSlideEvents {
    readonly scrollStates: Array<{ leftEnd: boolean; rightEnd: boolean }> = [];
    readonly slideEnds: Array<{ event: MouseEvent; compareIndex: number }> = [];
    readonly changedTabs: Array<{ event: MouseEvent; id: string }> = [];
    readonly changedNames: Array<{ id: string; name: string }> = [];
    nameCheckAlerts: string[] = [];
    errorCount = 0;

    createConfig(root: HTMLDivElement) {
        return {
            slideTabBarSelector: '.tab-bar',
            slideTabBarItemSelector: '.tab-item',
            slideTabBarContainer: root,
            slideTabBarItemAutoSort: true,
            currentIndex: 0,
            onScroll: (state: { leftEnd: boolean; rightEnd: boolean }) => this.scrollStates.push(state),
            onSlideEnd: (event: MouseEvent, compareIndex: number) => this.slideEnds.push({ event, compareIndex }),
            onChangeTab: (event: MouseEvent, id: string) => this.changedTabs.push({ event, id }),
            onChangeName: (id: string, name: string) => this.changedNames.push({ id, name }),
            onNameCheckAlert: (text: string) => {
                this.nameCheckAlerts.push(text);
                return false;
            },
            onNameChangeCheck: () => true,
        };
    }
}

class TestAnimationFrameState {
    frameId = 0;
    readonly requests: number[] = [];
    readonly cancellations: number[] = [];

    install(nextFrameId = 1): void {
        this.frameId = nextFrameId;
        window.requestAnimationFrame = () => {
            this.requests.push(this.frameId);
            return this.frameId;
        };
        window.cancelAnimationFrame = (frameId: number) => {
            this.cancellations.push(frameId);
        };
    }
}

function setupDOM() {
    const root = document.createElement('div');
    const bar = document.createElement('div');
    bar.className = 'tab-bar';
    root.appendChild(bar);
    document.body.appendChild(root);

    const itemLefts = [0, 45, 90];
    const itemWidths = [40, 40, 40];
    for (let i = 0; i < 3; i++) {
        const item = document.createElement('div');
        item.className = 'tab-item';
        item.dataset.id = `sheet-${i}`;
        const span = document.createElement('span');
        span.textContent = `Sheet ${i}`;
        item.appendChild(span);
        bar.appendChild(item);
    }

    let scrollLeft = 0;
    Object.defineProperty(root, 'clientWidth', { configurable: true, value: 100 });
    Object.defineProperty(bar, 'scrollWidth', { configurable: true, value: 220 });
    Object.defineProperty(bar, 'scrollLeft', {
        configurable: true,
        get() {
            return scrollLeft;
        },
        set(v: number) {
            scrollLeft = v;
        },
    });

    bar.getBoundingClientRect = () => rect(0, 100);

    Array.from(bar.querySelectorAll<HTMLElement>('.tab-item')).forEach((item, idx) => {
        item.getBoundingClientRect = () => rect(itemLefts[idx], itemWidths[idx]);
    });

    return {
        root,
        bar,
        events: new TestSlideEvents(),
    };
}

function createBar(root: HTMLDivElement, events: TestSlideEvents, currentIndex = 0): SlideTabBar {
    const config = events.createConfig(root);
    config.currentIndex = currentIndex;
    return new SlideTabBar(config);
}

describe('slide-tab-bar', () => {
    afterEach(() => {
        vi.useRealTimers();
        window.requestAnimationFrame = originalRequestAnimationFrame;
        window.cancelAnimationFrame = originalCancelAnimationFrame;
        console.error = originalConsoleError;
        document.body.innerHTML = '';
    });

    it('guards invalid constructor config', () => {
        expect(() => new SlideTabBar({ slideTabBarContainer: null as never })).toThrowError('not found slide-tab-bar root element');
        const root = document.createElement('div');
        expect(() => new SlideTabBar({
            slideTabBarContainer: root as HTMLDivElement,
            slideTabBarSelector: '.missing',
        })).toThrowError('not found slide-tab-bar');
    });

    it('handles scroll boundaries and keeps the active sheet visible', () => {
        const { root, events } = setupDOM();
        const bar = createBar(root, events);

        expect(bar.getSlideTabItems().length).toBe(3);
        expect(bar.isLeftEnd()).toBe(true);
        expect(bar.isRightEnd()).toBe(false);
        expect(bar.calculateLeftScrollX()).toBeGreaterThanOrEqual(0);
        expect(bar.calculateRightScrollX()).toBeLessThanOrEqual(0);
        expect(bar.calculateTabItemScrollX(2)).toBeGreaterThanOrEqual(0);

        bar.setScroll(20);
        bar.setScroll(-10);
        bar.flipPage(1);
        bar.flipPage(-1);
        bar.scrollToItem(2);

        console.error = () => {
            events.errorCount += 1;
        };
        bar.scrollToItem(99);
        expect(events.errorCount).toBe(1);
        expect(events.scrollStates.length).toBeGreaterThan(0);

        bar.update(1);
        expect(bar.getActiveItem()?.getId()).toBe('sheet-1');

        bar.destroy();
        expect(bar.getSlideTabItems()).toEqual([]);
    });

    it('supports editing, fixed dragging style, and per-item animation', () => {
        const { root, events } = setupDOM();
        const frameState = new TestAnimationFrameState();
        const bar = createBar(root, events);

        const item = bar.getSlideTabItems()[0];
        const editor = item.getEditor() as HTMLSpanElement;
        expect(SlideTabItem.leftLine(item)).toBe(0);
        expect(SlideTabItem.rightLine(item)).toBe(40);
        expect(item.translateX(10)).toBeTypeOf('number');
        expect(item.classList()).toBe(item.getSlideTabItem().classList);
        expect(item.equals(item)).toBe(true);

        let renameFinishedCount = 0;
        item.setEditor(() => {
            renameFinishedCount += 1;
        });
        expect(editor.getAttribute('contentEditable')).toBe('true');
        editor.textContent = 'Renamed';
        editor.dispatchEvent(new FocusEvent('focusout'));

        expect(events.changedNames).toEqual([{ id: 'sheet-0', name: 'Renamed' }]);
        expect(renameFinishedCount).toBe(1);

        item.enableFixed();
        expect(document.body.contains(item.getSlideTabItem())).toBe(true);
        item.disableFixed();
        expect(item.getSlideTabItem().style.position).toBe('');

        frameState.install(1);
        const animation = item.animate();
        animation.translateX(30);
        animation.cancel();
        expect(frameState.requests).toEqual([1]);
        expect(frameState.cancellations).toEqual([1]);
    });

    it('keeps tab interactions available after finishing sheet name editing', () => {
        const { root, events, bar: barElement } = setupDOM();
        const bar = createBar(root, events);
        const firstItem = bar.getSlideTabItems()[0];
        const firstEditor = firstItem.getEditor() as HTMLSpanElement;
        const secondTab = barElement.querySelectorAll<HTMLElement>('.tab-item')[1];

        firstItem.setEditor();
        firstEditor.textContent = 'Renamed';
        firstEditor.dispatchEvent(new FocusEvent('focusout'));

        secondTab.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));

        expect(events.changedTabs).toEqual([{ event: expect.any(PointerEvent), id: 'sheet-1' }]);
    });

    it('does not start delayed dragging after a double click enters name editing', () => {
        vi.useFakeTimers();
        const { root, bar: barElement } = setupDOM();
        createBar(root, new TestSlideEvents());

        const tabElement = barElement.querySelector<HTMLElement>('.tab-item')!;
        const editor = tabElement.querySelector<HTMLSpanElement>('span')!;
        const originalSetPointerCapture = tabElement.setPointerCapture;
        const originalReleasePointerCapture = tabElement.releasePointerCapture;
        const originalHasPointerCapture = tabElement.hasPointerCapture;

        tabElement.setPointerCapture = () => {};
        tabElement.releasePointerCapture = () => {};
        tabElement.hasPointerCapture = () => true;

        const dispatchPointer = (type: 'pointerdown' | 'pointerup') => {
            tabElement.dispatchEvent(new PointerEvent(type, {
                bubbles: true,
                clientX: 8,
                clientY: 8,
                pointerId: 1,
            }));
        };

        dispatchPointer('pointerdown');
        dispatchPointer('pointerup');
        dispatchPointer('pointerdown');
        expect(editor.getAttribute('contentEditable')).toBe('true');
        dispatchPointer('pointerup');

        editor.dispatchEvent(new FocusEvent('focusout'));
        vi.advanceTimersByTime(SlideTabBar.LongPressDelay + 1);

        expect(tabElement.parentElement).not.toBe(document.body);
        expect(tabElement.style.position).toBe('');

        tabElement.setPointerCapture = originalSetPointerCapture;
        tabElement.releasePointerCapture = originalReleasePointerCapture;
        tabElement.hasPointerCapture = originalHasPointerCapture;
    });

    it('starts or closes edge auto-scroll during sheet tab dragging', () => {
        const { root, events } = setupDOM();
        const frameState = new TestAnimationFrameState();
        const bar = createBar(root, events, 1);

        const items = bar.getSlideTabItems();
        const active = items[1];
        (bar as unknown as { _activeTabItem: SlideTabItem })._activeTabItem = active;
        (bar as unknown as { _activeTabItemIndex: number })._activeTabItemIndex = 1;

        (bar as unknown as { _leftBoundingLine: number })._leftBoundingLine = 20;
        (bar as unknown as { _rightBoundingLine: number })._rightBoundingLine = 20;
        (bar as unknown as { _scrollIncremental: number })._scrollIncremental = 0;
        (bar as unknown as { _scrollLeft: (event: MouseEvent) => void })._scrollLeft({ pageX: 0 } as MouseEvent);
        expect((bar as unknown as { _scrollIncremental: number })._scrollIncremental).toBeLessThanOrEqual(0);
        (bar as unknown as { _scrollRight: (event: MouseEvent) => void })._scrollRight({ pageX: 500 } as MouseEvent);
        expect((bar as unknown as { _scrollIncremental: number })._scrollIncremental).toBeGreaterThanOrEqual(0);

        frameState.install(2);
        (bar as unknown as { _moveActionX: number })._moveActionX = 10;
        (bar as unknown as { _startAutoScroll: () => void })._startAutoScroll();
        expect((bar as unknown as { _autoScrollTime: number })._autoScrollTime).toBe(2);
        (bar as unknown as { _closeAutoScroll: () => void })._closeAutoScroll();
        expect((bar as unknown as { _autoScrollTime: null })._autoScrollTime).toBeNull();
        expect(frameState.requests.length).toBeGreaterThan(0);
        expect(frameState.requests.every((frameId) => frameId === 2)).toBe(true);
        expect(frameState.cancellations).toContain(2);
    });

    it('includes sheet bar scroll delta when calculating the drag target index', () => {
        const { root } = setupDOM();
        const bar = createBar(root, new TestSlideEvents(), 1);
        const active = bar.getSlideTabItems()[1];

        (bar as unknown as { _activeTabItem: SlideTabItem })._activeTabItem = active;
        (bar as unknown as { _activeTabItemIndex: number })._activeTabItemIndex = 1;
        (bar as unknown as { _dragStartScrollX: number })._dragStartScrollX = 0;
        (bar as unknown as { _moveActionX: number })._moveActionX = 0;

        bar.getScrollbar().scrollX(50);
        (bar as unknown as { _updateDragSortState: () => void })._updateDragSortState();

        expect((bar as unknown as { _compareIndex: number })._compareIndex).toBe(2);
    });

    it('handles static text-selection and slide-skip helpers', () => {
        const el = document.createElement('span');
        el.textContent = 'abc';
        document.body.appendChild(el);

        SlideTabBar.keepSelectAll(el);
        SlideTabBar.keepLastIndex(el);

        const skip = document.createElement('div');
        skip.setAttribute('data-slide-skip', '1');
        const child = document.createElement('span');
        skip.appendChild(child);
        document.body.appendChild(skip);

        expect(SlideTabBar.checkedSkipSlide({ target: child } as unknown as MouseEvent)).toBe(true);
        expect(SlideTabBar.checkedSkipSlide({ target: document.body } as unknown as MouseEvent)).toBe(false);
    });
});
