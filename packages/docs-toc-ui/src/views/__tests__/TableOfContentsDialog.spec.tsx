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

import type { Root } from 'react-dom/client';
import { LocaleService, LocaleType, Univer } from '@univerjs/core';
import { RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import enUS from '../../locale/en-US';
import { TableOfContentsDialog } from '../TableOfContentsDialog';

describe('TableOfContentsDialog', () => {
    let root: Root;
    let container: HTMLDivElement;
    let univer: Univer;

    beforeEach(() => {
        vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
        univer = new Univer({ locale: LocaleType.EN_US, locales: { [LocaleType.EN_US]: enUS } });
        univer.__getInjector().get(LocaleService).setDirection('ltr');
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
    });

    afterEach(async () => {
        await act(async () => root.unmount());
        container.remove();
        univer.dispose();
        vi.unstubAllGlobals();
    });

    it('defaults to page numbers and allows switching to a full update', async () => {
        const onModeChange = vi.fn();
        await act(async () => root.render(
            <RediContext.Provider value={{ injector: univer.__getInjector() }}>
                <TableOfContentsDialog mode="pageNumbersOnly" onModeChange={onModeChange} />
            </RediContext.Provider>
        ));
        const radios = [...container.querySelectorAll<HTMLInputElement>('input[type="radio"]')];
        expect(radios.map((radio) => radio.checked)).toEqual([true, false]);
        await act(async () => radios[1].click());
        expect(radios.map((radio) => radio.checked)).toEqual([false, true]);
        expect(onModeChange).toHaveBeenCalledExactlyOnceWith('entireTable');
    });
});
