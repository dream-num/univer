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

import type { ILocalStorageService as ILocalStorageServiceType } from '@univerjs/core';
import type { ComponentType, ReactElement } from 'react';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { ILocalStorageService, Injector, LocaleService, LocaleType } from '@univerjs/core';
import { scrollbarClassName } from '@univerjs/design';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import enUS from '../../../locale/en-US';
import { connectInjector } from '../../../utils/di';
import { SymbolPicker } from '../../symbol-picker/SymbolPicker';
import { EmojiPicker } from '../EmojiPicker';

class TestLocalStorageService implements ILocalStorageServiceType {
    async getItem<T>(): Promise<T | null> {
        return null;
    }

    async setItem<T>(_key: string, value: T): Promise<T> {
        return value;
    }

    async removeItem(): Promise<void> {}

    async clear(): Promise<void> {}

    async key(): Promise<string | null> {
        return null;
    }

    async keys(): Promise<string[]> {
        return [];
    }

    async iterate<_T, U>(): Promise<U> {
        return undefined as U;
    }
}

class TestResizeObserver {
    disconnect(): void {}

    observe(): void {}

    unobserve(): void {}
}

function renderWithDependencies(element: ReactElement) {
    const injector = new Injector();
    injector.add([LocaleService]);
    injector.add([ILocalStorageService, { useClass: TestLocalStorageService }]);

    const localeService = injector.get(LocaleService);
    localeService.load({ [LocaleType.EN_US]: enUS });
    localeService.setLocale(LocaleType.EN_US);

    const ConnectedTestRoot = connectInjector(() => element, injector) as ComponentType;
    return render(<ConnectedTestRoot />);
}

beforeEach(() => {
    vi.stubGlobal('ResizeObserver', TestResizeObserver);
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(240);
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(396);
});

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});

describe('picker callbacks', () => {
    it('reports an emoji through the direct change callback', () => {
        const onChange = vi.fn();
        const { getAllByRole } = renderWithDependencies(<EmojiPicker onChange={onChange} />);

        fireEvent.click(getAllByRole('button', { name: 'grinning face' })[0]);

        expect(onChange).toHaveBeenCalledWith('😀');
    });

    it('keeps random selection and applies an icon-only skin tone preference', async () => {
        const onChange = vi.fn();
        const { container, getAllByRole, getByRole, queryAllByRole } = renderWithDependencies(<EmojiPicker onChange={onChange} />);

        expect(getByRole('button', { name: 'Random emoji' })).toBeTruthy();
        fireEvent.click(getByRole('button', { name: 'raised hand' }));

        const skinToneOptions = getAllByRole('radio');
        expect(skinToneOptions).toHaveLength(6);
        expect(skinToneOptions.map((option) => option.textContent)).toEqual(['✋', '✋🏻', '✋🏼', '✋🏽', '✋🏾', '✋🏿']);

        fireEvent.click(container.querySelector('[data-u-comp="ui.emoji-picker"]')!);
        await waitFor(() => expect(queryAllByRole('radio')).toHaveLength(0));

        fireEvent.click(getByRole('button', { name: 'raised hand' }));
        fireEvent.click(getByRole('radio', { name: 'raised hand: medium skin tone' }));
        await waitFor(() => expect(queryAllByRole('radio')).toHaveLength(0));
        expect(onChange).not.toHaveBeenCalled();

        fireEvent.change(getByRole('textbox', { name: 'Search' }), { target: { value: 'waving hand' } });
        await waitFor(() => expect(getByRole('button', { name: 'waving hand: medium skin tone' })).toBeTruthy());
    });

    it('keeps mixed skin tone variants behind the family secondary entry', async () => {
        const { getByRole } = renderWithDependencies(<EmojiPicker />);

        fireEvent.change(getByRole('textbox', { name: 'Search' }), { target: { value: 'handshake' } });
        await waitFor(() => expect(getByRole('button', { name: 'handshake, More' })).toBeTruthy());
        fireEvent.click(getByRole('button', { name: 'handshake, More' }));

        await waitFor(() => {
            const variants = document.querySelector('[data-u-comp="ui.emoji-picker.skin-tone-variants"]');
            expect(variants?.querySelectorAll('button')).toHaveLength(26);
        });
    });

    it('uses the design scrollbar styles for emoji content', () => {
        const { container } = renderWithDependencies(<EmojiPicker />);
        const scrollContainer = container.querySelector('.univer-overflow-y-auto');

        for (const className of scrollbarClassName.split(' ')) {
            expect(scrollContainer?.classList.contains(className)).toBe(true);
        }
    });

    it('keeps the mounted emoji buttons bounded while scrolling', async () => {
        const { container, getByRole, getByText } = renderWithDependencies(<EmojiPicker />);

        await waitFor(() => expect(container.querySelectorAll('button').length).toBeGreaterThan(10));
        expect(container.querySelectorAll('button').length).toBeLessThan(150);

        fireEvent.click(getByRole('button', { name: 'Symbols' }));

        expect(getByText('Symbols')).toBeTruthy();
        expect(container.querySelectorAll('button').length).toBeLessThan(150);
    });

    it('reports a symbol through the direct change callback', () => {
        const onChange = vi.fn();
        const { getByRole } = renderWithDependencies(<SymbolPicker onChange={onChange} />);

        fireEvent.click(getByRole('button', { name: '∞' }));

        expect(onChange).toHaveBeenCalledWith('∞');
    });

    it('uses the design scrollbar styles for symbol content', () => {
        const { container } = renderWithDependencies(<SymbolPicker />);
        const scrollContainer = container.querySelector('.univer-overflow-y-auto');

        for (const className of scrollbarClassName.split(' ')) {
            expect(scrollContainer?.classList.contains(className)).toBe(true);
        }
    });
});
