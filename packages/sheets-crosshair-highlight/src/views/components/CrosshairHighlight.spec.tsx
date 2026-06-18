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

import type { IDisposable } from '@univerjs/core';
import type { Root } from 'react-dom/client';
import { Injector, ThemeService, toDisposable } from '@univerjs/core';
import { RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
    CROSSHAIR_HIGHLIGHT_COLOR_THEME_PATHS,
    SheetsCrosshairHighlightService,
} from '../../services/crosshair.service';
import { CrosshairOverlay } from './CrosshairHighlight';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

class TestState {
    static pickedTokens: string[] = [];

    static reset(): void {
        this.pickedTokens = [];
    }
}

function createOverlayTestBed() {
    const injector = new Injector();
    injector.add([ThemeService]);
    injector.add([SheetsCrosshairHighlightService]);

    const themeService = injector.get(ThemeService);
    const highlightBackground = Object.fromEntries(CROSSHAIR_HIGHLIGHT_COLOR_THEME_PATHS.map((path, index) => [
        path.replace('highlight.background.', ''),
        {
            color: index === 0 ? '#010203' : index === 1 ? '#040506' : `#${String(index + 10).padStart(2, '0')}0a0b`,
            alpha: index === 1 ? 0.15 : 0.3,
        },
    ]));

    themeService.setTheme({
        ...themeService.getCurrentTheme(),
        highlight: {
            background: highlightBackground,
        },
    } as never);

    return {
        injector,
        service: injector.get(SheetsCrosshairHighlightService),
    };
}

function renderOverlay(injector: Injector) {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
        root.render(
            <RediContext.Provider value={{ injector }}>
                <CrosshairOverlay onChange={(token) => TestState.pickedTokens.push(token)} />
            </RediContext.Provider>
        );
    });

    return { container, root };
}

function getColorCells(container: HTMLElement): HTMLElement[] {
    return Array.from(container.querySelectorAll<HTMLElement>('div[style*="background-color"]'));
}

function hasClassToken(element: HTMLElement, token: string): boolean {
    return element.className.split(/\s+/).includes(token);
}

function teardown(root?: Root, container?: HTMLElement): IDisposable {
    return toDisposable(() => {
        if (root) {
            act(() => root.unmount());
        }
        container?.remove();
    });
}

describe('CrosshairOverlay', () => {
    let disposable: IDisposable | undefined;

    beforeEach(() => {
        TestState.reset();
    });

    afterEach(() => {
        disposable?.dispose();
        disposable = undefined;
    });

    it('offers theme-backed highlight colors and reports the picked token', () => {
        const testBed = createOverlayTestBed();
        const rendered = renderOverlay(testBed.injector);
        disposable = teardown(rendered.root, rendered.container);

        const cells = getColorCells(rendered.container);
        expect(cells).toHaveLength(CROSSHAIR_HIGHLIGHT_COLOR_THEME_PATHS.length);
        expect(cells[0].style.backgroundColor).toBe('rgba(1, 2, 3, 0.3)');
        expect(cells[1].style.backgroundColor).toBe('rgba(4, 5, 6, 0.15)');

        act(() => {
            cells[1].dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        expect(TestState.pickedTokens).toEqual([CROSSHAIR_HIGHLIGHT_COLOR_THEME_PATHS[1]]);
    });

    it('marks the service-selected color as the active swatch', () => {
        const testBed = createOverlayTestBed();
        testBed.service.setColor(CROSSHAIR_HIGHLIGHT_COLOR_THEME_PATHS[1]);

        const rendered = renderOverlay(testBed.injector);
        disposable = teardown(rendered.root, rendered.container);

        const cells = getColorCells(rendered.container);
        expect(hasClassToken(cells[1], 'univer-ring-primary-600')).toBe(true);
        expect(hasClassToken(cells[0], 'univer-ring-primary-600')).toBe(false);
    });

    it('moves the active swatch when the service color changes after render', () => {
        const testBed = createOverlayTestBed();
        const rendered = renderOverlay(testBed.injector);
        disposable = teardown(rendered.root, rendered.container);

        let cells = getColorCells(rendered.container);
        expect(hasClassToken(cells[0], 'univer-ring-primary-600')).toBe(true);
        expect(hasClassToken(cells[2], 'univer-ring-primary-600')).toBe(false);

        act(() => {
            testBed.service.setColor(CROSSHAIR_HIGHLIGHT_COLOR_THEME_PATHS[2]);
        });

        cells = getColorCells(rendered.container);
        expect(hasClassToken(cells[0], 'univer-ring-primary-600')).toBe(false);
        expect(hasClassToken(cells[2], 'univer-ring-primary-600')).toBe(true);
    });
});
