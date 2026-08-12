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

import type { ReactElement } from 'react';
import { Injector, LocaleService } from '@univerjs/core';
import { FUNCTION_NAMES_MATH, FUNCTION_NAMES_STATISTICAL } from '@univerjs/engine-formula';
import { RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { IStatusBarService, StatusBarService } from '../../../services/status-bar.service';
import { formatNumber } from '../CopyableStatisticItem';
import { StatusBar } from '../StatusBar';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

class TestLocaleService {
    t(key: string): string {
        return key;
    }
}

function setViewportWidth(width: number) {
    Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        writable: true,
        value: width,
    });
}

function createStatusBarInjector() {
    const injector = new Injector();
    injector.add([LocaleService, { useClass: TestLocaleService as never }]);
    injector.add([IStatusBarService, { useClass: StatusBarService }]);

    return injector;
}

function renderWithDependencies(element: ReactElement) {
    const injector = createStatusBarInjector();
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
        root.render(
            <RediContext.Provider value={{ injector }}>
                {element}
            </RediContext.Provider>
        );
    });

    return {
        container,
        injector,
        unmount: () => {
            act(() => root.unmount());
            container.remove();
        },
    };
}

function queryByText(container: HTMLElement, text: string): HTMLElement | null {
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
        if (node.textContent === text) {
            return node.parentElement;
        }
        node = walker.nextNode();
    }

    return null;
}

function getByText(container: HTMLElement, text: string): HTMLElement {
    const element = queryByText(container, text);
    if (!element) {
        throw new Error(`Text not found: ${text}`);
    }

    return element;
}

function publishStatistics(injector: Injector) {
    act(() => {
        injector.get(IStatusBarService).setState({
            pattern: '0.00',
            values: [
                { func: FUNCTION_NAMES_STATISTICAL.MAX, value: 12.5 },
                { func: FUNCTION_NAMES_STATISTICAL.MIN, value: 3 },
                { func: FUNCTION_NAMES_MATH.SUM, value: 15.5 },
                { func: FUNCTION_NAMES_STATISTICAL.COUNTA, value: 3 },
                { func: FUNCTION_NAMES_STATISTICAL.COUNT, value: 2 },
                { func: FUNCTION_NAMES_STATISTICAL.AVERAGE, value: 7.75 },
            ],
        });
    });
}

describe('StatusBar', () => {
    const disposals: Array<() => void> = [];

    afterEach(() => {
        disposals.splice(0).forEach((dispose) => dispose());
        setViewportWidth(1024);
    });

    it('shows only sum by default with number formatting', () => {
        setViewportWidth(1024);
        const { container, injector, unmount } = renderWithDependencies(<StatusBar />);
        disposals.push(unmount);

        publishStatistics(injector);

        expect(getByText(container, 'sheets-ui.statusbar.sum: 15.50')).toBeTruthy();
        expect(queryByText(container, 'sheets-ui.statusbar.max: 12.50')).toBeNull();
        expect(queryByText(container, 'sheets-ui.statusbar.average: 7.75')).toBeNull();
    });

    it('opens all available statistics and changes the displayed statistic', () => {
        const { container, injector, unmount } = renderWithDependencies(<StatusBar />);
        disposals.push(unmount);

        publishStatistics(injector);

        const statisticText = getByText(container, 'sheets-ui.statusbar.sum: 15.50');
        act(() => statisticText.click());

        expect(getByText(document.body, 'sheets-ui.statusbar.max: 12.50')).toBeTruthy();
        expect(getByText(document.body, 'sheets-ui.statusbar.average: 7.75')).toBeTruthy();
        expect(document.body.querySelector('[data-u-comp="status-bar-statistic-menu"]')?.className)
            .toContain('univer-w-max');

        act(() => {
            getByText(document.body, 'sheets-ui.statusbar.average: 7.75').click();
        });

        expect(getByText(container, 'sheets-ui.statusbar.average: 7.75')).toBeTruthy();
        expect(queryByText(container, 'sheets-ui.statusbar.sum: 15.50')).toBeNull();
    });

    it('falls back to count when the selection has no numeric values', () => {
        const { container, injector, unmount } = renderWithDependencies(<StatusBar />);
        disposals.push(unmount);

        act(() => {
            injector.get(IStatusBarService).setState({
                pattern: null,
                values: [
                    { func: FUNCTION_NAMES_STATISTICAL.COUNTA, value: 3 },
                    { func: FUNCTION_NAMES_STATISTICAL.COUNT, value: 0 },
                ],
            });
        });

        expect(getByText(container, 'sheets-ui.statusbar.countA: 3')).toBeTruthy();
    });
});

describe('formatNumber', () => {
    it('does not force positive or negative large values into scientific notation', () => {
        const value = 1_273_000_000;

        for (const largeValue of [value, -value]) {
            expect(formatNumber({
                name: FUNCTION_NAMES_MATH.SUM,
                value: largeValue,
                show: true,
                disable: false,
                pattern: null,
            })).toBe(largeValue.toLocaleString());
        }
    });
});
