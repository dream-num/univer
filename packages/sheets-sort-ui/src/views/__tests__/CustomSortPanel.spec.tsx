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
import { CustomSortPanel } from '../CustomSortPanel';
import {
    createSortViewTestBed,
    getAddCondition,
    getButton,
    getColumnValues,
    getRadio,
    renderWithInjector,
    setDuplicateNamesForConditionTests,
    SUB_UNIT_ID,
    UNIT_ID,
} from './SortViewTestBed';

describe('CustomSortPanel', () => {
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

    it('applies custom sort with the first row excluded from sorting', async () => {
        currentTestBed = createSortViewTestBed();
        currentTestBed.sortUIService.showCustomSortPanel({
            unitId: UNIT_ID,
            subUnitId: SUB_UNIT_ID,
            range: { startRow: 0, endRow: 3, startColumn: 0, endColumn: 2 },
            colIndex: 1,
        });
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await renderWithInjector(root, currentTestBed, <CustomSortPanel />);

        const titleCheckbox = container.querySelector('[data-u-comp="checkbox"] input') as HTMLInputElement;
        expect(titleCheckbox).toBeTruthy();

        await act(async () => {
            titleCheckbox.click();
            await awaitTime(20);
        });

        await act(async () => {
            getButton(container!, 'Confirm').dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await awaitTime(20);
        });

        expect(getColumnValues(currentTestBed.worksheet, 0, [0, 1, 2, 3])).toEqual(['Name', 'Amy', 'Ben', 'Cat']);
        expect(getColumnValues(currentTestBed.worksheet, 1, [0, 1, 2, 3])).toEqual(['Score', 10, 30, 20]);
        expect(currentTestBed.sortUIService.customSortState()).toEqual({ show: false });
    });

    it('applies an added custom sort condition as a secondary rule', async () => {
        currentTestBed = createSortViewTestBed();
        setDuplicateNamesForConditionTests(currentTestBed.worksheet);
        currentTestBed.sortUIService.showCustomSortPanel({
            unitId: UNIT_ID,
            subUnitId: SUB_UNIT_ID,
            range: { startRow: 1, endRow: 3, startColumn: 0, endColumn: 1 },
            colIndex: 0,
        });
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await renderWithInjector(root, currentTestBed, <CustomSortPanel />);

        await act(async () => {
            getAddCondition(container!).click();
            await awaitTime(260);
        });

        await act(async () => {
            getRadio(container!, 'Descending', 1).click();
            await awaitTime(20);
        });

        await act(async () => {
            getButton(container!, 'Confirm').dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await awaitTime(20);
        });

        expect(getColumnValues(currentTestBed.worksheet, 0, [1, 2, 3])).toEqual(['Amy', 'Sam', 'Sam']);
        expect(getColumnValues(currentTestBed.worksheet, 1, [1, 2, 3])).toEqual([10, 30, 20]);
        expect(currentTestBed.sortUIService.customSortState()).toEqual({ show: false });
    });

    it('removes an added custom sort condition before confirming', async () => {
        currentTestBed = createSortViewTestBed();
        setDuplicateNamesForConditionTests(currentTestBed.worksheet);
        currentTestBed.sortUIService.showCustomSortPanel({
            unitId: UNIT_ID,
            subUnitId: SUB_UNIT_ID,
            range: { startRow: 1, endRow: 3, startColumn: 0, endColumn: 1 },
            colIndex: 0,
        });
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await renderWithInjector(root, currentTestBed, <CustomSortPanel />);

        await act(async () => {
            getAddCondition(container!).click();
            await awaitTime(260);
        });

        await act(async () => {
            getRadio(container!, 'Descending', 1).click();
            await awaitTime(20);
        });

        const removeLinks = Array.from(container.querySelectorAll('a'));
        expect(removeLinks[1]).toBeTruthy();

        await act(async () => {
            removeLinks[1].dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await awaitTime(20);
        });

        expect(Array.from(container.querySelectorAll('[data-u-comp="radio"]'))
            .filter((item) => item.textContent === 'Descending')).toHaveLength(1);

        await act(async () => {
            getButton(container!, 'Confirm').dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await awaitTime(20);
        });

        expect(getColumnValues(currentTestBed.worksheet, 0, [1, 2, 3])).toEqual(['Amy', 'Sam', 'Sam']);
        expect(getColumnValues(currentTestBed.worksheet, 1, [1, 2, 3])).toEqual([10, 20, 30]);
        expect(currentTestBed.sortUIService.customSortState()).toEqual({ show: false });
    });
});
