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
import { cleanup, fireEvent, render } from '@testing-library/react';
import { ILocalStorageService, Injector, LocaleService, LocaleType } from '@univerjs/core';
import { scrollbarClassName } from '@univerjs/design';
import { afterEach, describe, expect, it, vi } from 'vitest';
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

afterEach(cleanup);

describe('picker callbacks', () => {
    it('omits the popup frame when the emoji picker is embedded', () => {
        const { container } = renderWithDependencies(<EmojiPicker embedded />);
        const picker = container.querySelector('[data-u-comp="ui.emoji-picker"]');

        expect(picker?.className).not.toContain('univer-border');
        expect(picker?.className).not.toContain('univer-shadow-lg');
    });

    it('reports an emoji through the direct change callback', () => {
        const onChange = vi.fn();
        const { getAllByRole } = renderWithDependencies(<EmojiPicker onChange={onChange} />);

        fireEvent.click(getAllByRole('button', { name: 'grinning face' })[0]);

        expect(onChange).toHaveBeenCalledWith('😀');
    });

    it('uses the design scrollbar styles for emoji content', () => {
        const { container } = renderWithDependencies(<EmojiPicker />);
        const scrollContainer = container.querySelector('.univer-overflow-y-auto');

        for (const className of scrollbarClassName.split(' ')) {
            expect(scrollContainer?.classList.contains(className)).toBe(true);
        }
    });

    it('reports a symbol through the direct change callback', () => {
        const onChange = vi.fn();
        const { getByRole } = renderWithDependencies(<SymbolPicker onChange={onChange} />);

        fireEvent.click(getByRole('button', { name: '∞' }));

        expect(onChange).toHaveBeenCalledWith('∞');
    });

    it('omits the popup frame when the symbol picker is embedded', () => {
        const { container } = renderWithDependencies(<SymbolPicker embedded />);
        const picker = container.querySelector('[data-u-comp="ui.symbol-picker"]');

        expect(picker?.className).not.toContain('univer-border');
        expect(picker?.className).not.toContain('univer-shadow-lg');
    });

    it('uses the design scrollbar styles for symbol content', () => {
        const { container } = renderWithDependencies(<SymbolPicker />);
        const scrollContainer = container.querySelector('.univer-overflow-y-auto');

        for (const className of scrollbarClassName.split(' ')) {
            expect(scrollContainer?.classList.contains(className)).toBe(true);
        }
    });
});
