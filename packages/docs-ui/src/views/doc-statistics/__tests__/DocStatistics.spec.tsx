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
import { ConfigService, IConfigService, Injector, LocaleService, LocaleType } from '@univerjs/core';
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

function renderStatistics() {
    const injector = new Injector();
    injector.add([LocaleService]);
    injector.add([IConfigService, { useClass: ConfigService }]);
    const localeService = injector.get(LocaleService);
    localeService.load({ [LocaleType.EN_US]: enUS });
    localeService.setLocale(LocaleType.EN_US);

    const container = document.createElement('div');
    const popupRoot = document.createElement('div');
    popupRoot.id = 'univer-popup-portal';
    document.body.appendChild(popupRoot);
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
        root.render(
            <RediContext.Provider value={{ injector }}>
                <DocStatistics />
            </RediContext.Provider>
        );
    });

    return { container, root };
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
});
