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
import { awaitTime } from '@univerjs/core';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { ExtendConfirm } from '../ExtendConfirm';
import { createSortViewTestBed, getRadio, renderWithInjector } from './SortViewTestBed';

describe('ExtendConfirm', () => {
    let root: Root | undefined;
    let container: HTMLDivElement | undefined;
    let currentTestBed: ReturnType<typeof createSortViewTestBed> | undefined;

    afterEach(() => {
        act(() => {
            root?.unmount();
        });
        container?.remove();
        currentTestBed?.univer.dispose();
        root = undefined;
        container = undefined;
        currentTestBed = undefined;
    });

    it('reports the selected extend range option through the rendered confirmation body', async () => {
        currentTestBed = createSortViewTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        const selectedOptions: string[] = [];

        await renderWithInjector(
            root,
            currentTestBed,
            <ExtendConfirm onChange={(value) => selectedOptions.push(value)} />
        );

        await act(async () => {
            getRadio(container!, 'Extend range sorting').click();
            await awaitTime(20);
        });

        await act(async () => {
            getRadio(container!, 'Keep range sorting').click();
            await awaitTime(20);
        });

        expect(selectedOptions).toEqual(['1', '0']);
    });
});
