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
import { fromEvent, fromGlobalEvent } from '../lifecycle';

describe('lifecycle helpers', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should register and dispose global event listener', () => {
        const addSpy = vi.spyOn(window, 'addEventListener');
        const removeSpy = vi.spyOn(window, 'removeEventListener');
        const listener = vi.fn();

        const disposable = fromGlobalEvent('click', listener);

        expect(addSpy).toHaveBeenCalledWith('click', listener, undefined);

        disposable.dispose();
        expect(removeSpy).toHaveBeenCalledWith('click', listener, undefined);
    });

    it('should register and dispose element event listener', () => {
        const button = document.createElement('button');
        const addSpy = vi.spyOn(button, 'addEventListener');
        const removeSpy = vi.spyOn(button, 'removeEventListener');
        const listener = vi.fn();

        const disposable = fromEvent(button, 'click', listener);

        expect(addSpy).toHaveBeenCalledWith('click', listener, undefined);

        disposable.dispose();
        expect(removeSpy).toHaveBeenCalledWith('click', listener, undefined);
    });
});
