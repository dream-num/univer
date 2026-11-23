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
import EmbedSortBtn from '../EmbedSortBtn';
import { createSortViewTestBed, getButton, getColumnValues, renderWithInjector } from './SortViewTestBed';

describe('EmbedSortBtn', () => {
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

    it('sorts the selected data rows from the embedded descending action', async () => {
        currentTestBed = createSortViewTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        let closeCount = 0;

        await renderWithInjector(
            root,
            currentTestBed, (
                <EmbedSortBtn
                    range={{ startRow: 0, endRow: 3, startColumn: 0, endColumn: 2 }}
                    colIndex={1}
                    onClose={() => {
                        closeCount += 1;
                    }}
                />
            ));

        await act(async () => {
            getButton(container!, 'Descending').dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await awaitTime(20);
        });

        expect(getColumnValues(currentTestBed.worksheet, 0, [0, 1, 2, 3])).toEqual(['Name', 'Ben', 'Cat', 'Amy']);
        expect(getColumnValues(currentTestBed.worksheet, 1, [0, 1, 2, 3])).toEqual(['Score', 30, 20, 10]);
        expect(closeCount).toBe(1);
    });
});
