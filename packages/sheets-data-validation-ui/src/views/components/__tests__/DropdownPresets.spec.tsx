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
import { serializeListOptions } from '@univerjs/sheets';
import { RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import enUS from '../../../locale/en-US';
import { DropdownPresets } from '../DropdownPresets';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('DropdownPresets', () => {
    let univer: Univer | undefined;
    let root: Root | undefined;
    let container: HTMLDivElement | undefined;

    afterEach(() => {
        act(() => root?.unmount());
        container?.remove();
        univer?.dispose();
        root = undefined;
        container = undefined;
        univer = undefined;
    });

    it('emits each localized preset as a serialized dropdown value', async () => {
        univer = new Univer({ locale: LocaleType.EN_US });
        const injector = univer.__getInjector();
        injector.get(LocaleService).load({ [LocaleType.EN_US]: enUS });
        const onChange = vi.fn();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector }}>
                    <DropdownPresets value={undefined} onChange={onChange} />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        const buttons = [...container.querySelectorAll('button')];
        expect(buttons).toHaveLength(3);

        for (const button of buttons) {
            await act(async () => {
                button.click();
                await Promise.resolve();
            });
        }

        expect(onChange.mock.calls.map(([value]) => value)).toEqual([
            serializeListOptions(['Yes', 'No']),
            serializeListOptions(['Not Started', 'In Progress', 'Completed']),
            serializeListOptions(['A', 'B', 'C']),
        ]);
    });
});
