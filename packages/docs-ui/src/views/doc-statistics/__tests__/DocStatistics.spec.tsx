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

/**
 * @vitest-environment jsdom
 */

import type { Root } from 'react-dom/client';
import { ConfigService, IConfigService, Injector, LocaleService, LocaleType, RegionService } from '@univerjs/core';
import { ConfigProvider } from '@univerjs/design';
import { RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import enUS from '../../../locale/en-US';
import { DocStatistics } from '../DocStatistics';
import { useDocStatistics } from '../use-doc-statistics';

vi.mock('../use-doc-statistics');

Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { configurable: true, value: true });
globalThis.ResizeObserver = class ResizeObserver {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
};
globalThis.requestAnimationFrame = (callback: FrameRequestCallback) => {
    callback(0);
    return 0;
};

function renderStatistics(direction: 'ltr' | 'rtl' = 'ltr') {
    const injector = new Injector();
    injector.add([LocaleService]);
    injector.add([RegionService]);
    injector.add([IConfigService, { useClass: ConfigService }]);
    const localeService = injector.get(LocaleService);
    localeService.load({ [LocaleType.EN_US]: enUS });
    localeService.setLocale(LocaleType.EN_US);
    localeService.setDirection(direction);
    const regionService = injector.get(RegionService);

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
        root.render(
            <RediContext.Provider value={{ injector }}>
                <ConfigProvider mountContainer={container}>
                    <DocStatistics />
                </ConfigProvider>
            </RediContext.Provider>
        );
    });

    return { container, regionService, root };
}

describe('DocStatistics', () => {
    let root: Root | undefined;
    let container: HTMLElement | undefined;

    afterEach(() => {
        const currentRoot = root;
        if (currentRoot) {
            act(() => currentRoot.unmount());
        }

        container?.remove();
        document.body.replaceChildren();
        vi.resetAllMocks();
        root = undefined;
        container = undefined;
    });

    it('opens the statistics panel from the footer word count', () => {
        vi.mocked(useDocStatistics).mockReturnValue({
            document: {
                pages: 1,
                words: 12,
                charactersWithoutSpaces: 31,
                charactersWithSpaces: 36,
                paragraphs: 3,
                lines: 3,
                nonAsianWords: 6,
                asianCharactersAndKoreanWords: 6,
            },
            selection: null,
            loading: false,
            showPages: true,
        });

        const rendered = renderStatistics();
        root = rendered.root;
        container = rendered.container;

        const button = container.querySelector('button');
        expect(button?.textContent).toContain('12 words');
        expect(useDocStatistics).toHaveBeenLastCalledWith(false);

        act(() => {
            button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        expect(useDocStatistics).toHaveBeenLastCalledWith(true);
        expect(document.body.textContent).toContain('Document statistics');
        expect(document.body.textContent).toContain('Pages');
        expect(document.body.textContent).toContain('Characters (no spaces)');
        expect(document.body.textContent).toContain('Asian characters and Korean words');
        expect(document.querySelector('[role="dialog"]')?.getAttribute('aria-label')).toBe('Document statistics');

        act(() => {
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        });

        expect(document.body.textContent).not.toContain('Document statistics');
        expect(useDocStatistics).toHaveBeenLastCalledWith(false);
    });

    it('hides pages in modern documents', () => {
        vi.mocked(useDocStatistics).mockReturnValue({
            document: {
                pages: 0,
                words: 12,
                charactersWithoutSpaces: 31,
                charactersWithSpaces: 36,
                paragraphs: 3,
                lines: 3,
                nonAsianWords: 6,
                asianCharactersAndKoreanWords: 6,
            },
            selection: null,
            loading: false,
            showPages: false,
        });

        const rendered = renderStatistics();
        root = rendered.root;
        container = rendered.container;

        act(() => {
            rendered.container.querySelector('button')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        expect(document.body.textContent).not.toContain('Pages');
        expect(document.body.textContent).toContain('Lines');
    });

    it('shows placeholders instead of misleading zero values while statistics are loading', () => {
        vi.mocked(useDocStatistics).mockReturnValue({
            document: {
                pages: 0,
                words: 0,
                charactersWithoutSpaces: 0,
                charactersWithSpaces: 0,
                paragraphs: 0,
                lines: 0,
                nonAsianWords: 0,
                asianCharactersAndKoreanWords: 0,
            },
            selection: null,
            loading: true,
            showPages: true,
        });

        const rendered = renderStatistics();
        root = rendered.root;
        container = rendered.container;

        act(() => {
            rendered.container.querySelector('button')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        const dialog = document.querySelector('[role="dialog"]');
        const values = Array.from(dialog?.querySelectorAll('dd') ?? []).map((element) => element.textContent);

        expect(dialog?.getAttribute('aria-busy')).toBe('true');
        expect(values.length).toBeGreaterThan(0);
        expect(values.every((value) => value === '—')).toBe(true);
    });

    it('preserves RTL direction in the statistics content', () => {
        vi.mocked(useDocStatistics).mockReturnValue({
            document: {
                pages: 1,
                words: 12,
                charactersWithoutSpaces: 31,
                charactersWithSpaces: 36,
                paragraphs: 3,
                lines: 3,
                nonAsianWords: 6,
                asianCharactersAndKoreanWords: 6,
            },
            selection: null,
            loading: false,
            showPages: true,
        });

        const rendered = renderStatistics('rtl');
        root = rendered.root;
        container = rendered.container;

        act(() => {
            rendered.container.querySelector('button')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        expect(document.querySelector('[role="dialog"] dl')?.parentElement?.getAttribute('dir')).toBe('rtl');
    });

    it('formats word counts using the current region', () => {
        vi.mocked(useDocStatistics).mockReturnValue({
            document: {
                pages: 2,
                words: 1105,
                charactersWithoutSpaces: 1937,
                charactersWithSpaces: 2105,
                paragraphs: 28,
                lines: 61,
                nonAsianWords: 1105,
                asianCharactersAndKoreanWords: 0,
            },
            selection: null,
            loading: false,
            showPages: true,
        });

        const rendered = renderStatistics();
        root = rendered.root;
        container = rendered.container;

        expect(rendered.container.querySelector('button')?.textContent).toContain('1,105 words');

        act(() => {
            rendered.container.querySelector('button')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        act(() => rendered.regionService.setRegion(LocaleType.FR_FR));

        expect(rendered.container.querySelector('button')?.textContent).toContain('1\u202F105 words');

        const values = Array.from(document.querySelectorAll('[role="dialog"] dd')).map((element) => element.textContent);
        expect(values).toContain('1\u202F105');
        expect(values).not.toContain('1,105');
    });
});
