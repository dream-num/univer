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

import type { Theme } from '@univerjs/themes';
import { Injector } from '@univerjs/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ThemeSwitcherService } from '../theme-switcher.service';

function createService(): ThemeSwitcherService {
    const injector = new Injector();
    injector.add([ThemeSwitcherService]);
    return injector.get(ThemeSwitcherService);
}

describe('ThemeSwitcherService', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('injects theme tokens as CSS variables and replaces previous theme style', () => {
        interface IStyleElementStub {
            id?: string;
            textContent?: string;
            setAttribute: (key: string, value: string) => void;
            remove: () => void;
        }
        const appended: IStyleElementStub[] = [];
        const existing = { remove: vi.fn() };
        vi.stubGlobal('document', {
            getElementById: () => existing,
            createElement: () => ({
                setAttribute(key: string, value: string) {
                    if (key === 'id') {
                        this.id = value;
                    }
                },
                remove: vi.fn(),
                textContent: '',
            } as IStyleElementStub),
            head: {
                appendChild: (element: IStyleElementStub) => appended.push(element),
            },
        });
        const service = createService();

        service.injectThemeToHead({ primary: { color: 'red' }, radius: 4 } as unknown as Theme);

        expect(existing.remove).toHaveBeenCalledTimes(1);
        expect(appended[0].id).toBe('univer-theme-css-variables');
        expect(appended[0].textContent).toContain('--univer-primary-color: red;');
        expect(appended[0].textContent).toContain('--univer-radius: 4;');
    });
});
