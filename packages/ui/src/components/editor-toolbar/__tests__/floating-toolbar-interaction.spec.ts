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

import { describe, expect, it } from 'vitest';
import { shouldKeepFloatingToolbarMouseDownDefault } from '../floating-toolbar-interaction';

describe('floating toolbar interaction', () => {
    it.each([
        'input',
        'textarea',
        '[contenteditable="true"]',
        '[role="combobox"]',
        '[data-u-comp="select"]',
        '.univer-select',
    ])('keeps the default mouse-down behavior inside %s', (selector) => {
        const wrapper = document.createElement('div');
        const target = selector.startsWith('.') || selector.startsWith('[')
            ? document.createElement('span')
            : document.createElement(selector);

        if (selector.startsWith('.')) {
            target.className = selector.slice(1);
        } else if (selector.startsWith('[')) {
            const [name, value] = selector.slice(1, -1).split('=');
            target.setAttribute(name, value.replaceAll('"', ''));
        }

        const child = document.createElement('span');
        target.appendChild(child);
        wrapper.appendChild(target);

        expect(shouldKeepFloatingToolbarMouseDownDefault(child)).toBe(true);
    });

    it('prevents the default behavior for ordinary controls and non-elements', () => {
        expect(shouldKeepFloatingToolbarMouseDownDefault(document.createElement('button'))).toBe(false);
        expect(shouldKeepFloatingToolbarMouseDownDefault(window)).toBe(false);
        expect(shouldKeepFloatingToolbarMouseDownDefault(null)).toBe(false);
    });
});
