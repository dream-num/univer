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
        span.innerText = `Sheet ${i}`;
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

    vi.spyOn(bar, 'getBoundingClientRect').mockImplementation(() => rect(0, 100));

    Array.from(bar.querySelectorAll('.tab-item')).forEach((item, idx) => {
        vi.spyOn(item, 'getBoundingClientRect').mockImplementation(() => rect(itemLefts[idx], itemWidths[idx]));
    });

    return {
        root,
        bar,
        onScroll: vi.fn(),
        onSlideEnd: vi.fn(),
        onChangeTab: vi.fn(),
        onChangeName: vi.fn(),
    };
}

describe('slide-tab-bar', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        document.body.innerHTML = '';
    });

    it('guards invalid constructor config', () => {
        expect(() => new SlideTabBar({ slideTabBarContainer: null as any })).toThrowError('not found slide-tab-bar root element');
        const root = document.createElement('div');
        expect(() => new SlideTabBar({
            slideTabBarContainer: root as any,
            slideTabBarSelector: '.missing',
        })).toThrowError('not found slide-tab-bar');
    });

    it('handles scroll and calculation utilities', () => {
        const { root, onScroll, onSlideEnd, onChangeTab, onChangeName } = setupDOM();
        const bar = new SlideTabBar({
            slideTabBarSelector: '.tab-bar',
            slideTabBarItemSelector: '.tab-item',
            slideTabBarContainer: root as HTMLDivElement,
            slideTabBarItemAutoSort: true,
            currentIndex: 0,
            onScroll,
            onSlideEnd,
            onChangeTab,
            onChangeName,
            onNameCheckAlert: () => false,
            onNameChangeCheck: () => true,
        });

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

        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        bar.scrollToItem(99);
        expect(errorSpy).toHaveBeenCalled();
        expect(onScroll).toHaveBeenCalled();

        bar.update(1);
        expect(bar.getActiveItem()?.getId()).toBe('sheet-1');

        bar.destroy();
        expect(bar.getSlideTabItems()).toEqual([]);
    });

    it('supports edit/fixed/animate behaviors on SlideTabItem', async () => {
        const { root, onScroll, onSlideEnd, onChangeTab, onChangeName } = setupDOM();
        const bar = new SlideTabBar({
            slideTabBarSelector: '.tab-bar',
            slideTabBarItemSelector: '.tab-item',
            slideTabBarContainer: root as HTMLDivElement,
            slideTabBarItemAutoSort: true,
            currentIndex: 0,
            onScroll,
            onSlideEnd,
            onChangeTab,
            onChangeName,
            onNameCheckAlert: () => false,
            onNameChangeCheck: () => true,
        });

        const item = bar.getSlideTabItems()[0];
        const editor = item.getEditor() as HTMLSpanElement;
        expect(SlideTabItem.leftLine(item)).toBe(0);
        expect(SlideTabItem.rightLine(item)).toBe(40);
        expect(item.translateX(10)).toBeTypeOf('number');
        expect(item.classList()).toBe(item.getSlideTabItem().classList);
        expect(item.equals(item)).toBe(true);

        const callback = vi.fn();
        item.setEditor(callback);
        expect(editor.getAttribute('contentEditable')).toBe('true');
        editor.innerText = 'Renamed';
        editor.dispatchEvent(new FocusEvent('focusout'));

        expect(onChangeName).toHaveBeenCalledWith('sheet-0', 'Renamed');
        expect(callback).toHaveBeenCalled();

        item.enableFixed();
        expect(document.body.contains(item.getSlideTabItem())).toBe(true);
        item.disableFixed();
        expect(item.getSlideTabItem().style.position).toBe('');

        const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 1);
        const cafSpy = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
        const anim = item.animate();
        anim.translateX(30);
        anim.cancel();
        expect(rafSpy).toHaveBeenCalled();
        expect(cafSpy).toHaveBeenCalled();
    });

    it('covers internal compare/sort/auto-scroll branches', () => {
        const { root, onScroll, onSlideEnd, onChangeTab, onChangeName } = setupDOM();
        const bar = new SlideTabBar({
            slideTabBarSelector: '.tab-bar',
            slideTabBarItemSelector: '.tab-item',
            slideTabBarContainer: root as HTMLDivElement,
            slideTabBarItemAutoSort: true,
            currentIndex: 1,
            onScroll,
            onSlideEnd,
            onChangeTab,
            onChangeName,
            onNameCheckAlert: () => false,
            onNameChangeCheck: () => true,
        });

        const items = bar.getSlideTabItems();
        const active = items[1];
        let activeX = 45;
        active.getBoundingRect = () => rect(activeX, 40);
        (bar as any)._activeTabItem = active;
        (bar as any)._activeTabItemIndex = 1;

        activeX = 110;
        (bar as any)._compareRight();
        expect((bar as any)._compareIndex).toBeGreaterThanOrEqual(1);

        activeX = -30;
        (bar as any)._compareLeft();
        expect((bar as any)._compareIndex).toBeLessThanOrEqual(1);

        (bar as any)._compareIndex = 0;
        (bar as any)._sortedItems();
        expect(bar.getSlideTabItems()[0].getId()).toBe('sheet-1');

        (bar as any)._leftBoundingLine = 20;
        (bar as any)._rightBoundingLine = 20;
        (bar as any)._scrollIncremental = 0;
        (bar as any)._scrollLeft({ pageX: 0 } as MouseEvent);
        expect((bar as any)._scrollIncremental).toBeLessThanOrEqual(0);
        (bar as any)._scrollRight({ pageX: 500 } as MouseEvent);
        expect((bar as any)._scrollIncremental).toBeGreaterThanOrEqual(0);

        const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 2);
        const cafSpy = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
        (bar as any)._moveActionX = 10;
        (bar as any)._startAutoScroll();
        expect((bar as any)._autoScrollTime).toBe(2);
        (bar as any)._closeAutoScroll();
        expect((bar as any)._autoScrollTime).toBeNull();
        expect(rafSpy).toHaveBeenCalled();
        expect(cafSpy).toHaveBeenCalled();
    });

    it('handles static selection helpers', () => {
        const el = document.createElement('span');
        el.innerText = 'abc';
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
