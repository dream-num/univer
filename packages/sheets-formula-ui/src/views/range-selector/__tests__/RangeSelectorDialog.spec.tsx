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

import type { IUnitRangeName } from '@univerjs/core';
import type { ISelectionWithStyle } from '@univerjs/sheets';
import type { Root } from 'react-dom/client';
import {
    Injector,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    RANGE_TYPE,
    UniverInstanceType,
} from '@univerjs/core';
import { LexerTreeBuilder } from '@univerjs/engine-formula';
import { SheetsSelectionsService } from '@univerjs/sheets';
import { RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { RangeSelectorDialog } from '../index';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

class TestSheetsSelectionsService {
    readonly selectionMoveStart$ = new Subject<ISelectionWithStyle[]>();
    readonly selectionMoving$ = new Subject<ISelectionWithStyle[]>();
    readonly selectionMoveEnd$ = new Subject<ISelectionWithStyle[]>();
}

class TestUniverInstanceService {
    private readonly _workbook = {
        getActiveSheet: () => ({
            getSheetId: () => 'sheet-1',
            getName: () => 'Sheet1',
        }),
    };

    readonly unitAdded$ = new Subject();
    readonly unitDisposed$ = new Subject();

    getUnit(_unitId: string, type?: UniverInstanceType) {
        return type === UniverInstanceType.UNIVER_SHEET ? this._workbook : null;
    }

    getCurrentUnitOfType(type: UniverInstanceType) {
        return type === UniverInstanceType.UNIVER_SHEET ? this._workbook : null;
    }
}

class RangeDialogState {
    static confirmed: IUnitRangeName[][] = [];
    static closed = 0;

    static reset(): void {
        this.confirmed = [];
        this.closed = 0;
    }
}

function createRangeDialogTestBed() {
    const injector = new Injector();
    injector.add([LocaleService, { useClass: LocaleService }]);
    injector.add([LexerTreeBuilder, { useClass: LexerTreeBuilder }]);
    injector.add([SheetsSelectionsService, { useClass: TestSheetsSelectionsService as never }]);
    injector.add([IUniverInstanceService, { useClass: TestUniverInstanceService as never }]);
    const localeService = injector.get(LocaleService);
    localeService.load({
        [LocaleType.EN_US]: {
            'sheets-formula-ui': {
                rangeSelector: {
                    title: 'Select a data range',
                    addAnotherRange: 'Add range',
                    placeHolder: 'Select range or enter.',
                    confirm: 'Confirm',
                    cancel: 'Cancel',
                },
            },
        },
    });
    localeService.setLocale(LocaleType.EN_US);
    return injector;
}

function renderRangeDialog(root: Root, injector: Injector) {
    act(() => {
        root.render(
            <RediContext.Provider value={{ injector }}>
                <RangeSelectorDialog
                    visible
                    initialValue={[]}
                    unitId="book-1"
                    subUnitId="sheet-1"
                    onConfirm={(ranges) => RangeDialogState.confirmed.push(ranges)}
                    onClose={() => {
                        RangeDialogState.closed += 1;
                    }}
                />
            </RediContext.Provider>
        );
    });
}

function writeInput(input: HTMLInputElement, value: string) {
    const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    valueSetter?.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
}

async function emitSelection(injector: Injector, range: ISelectionWithStyle['range']) {
    const selectionsService = injector.get(SheetsSelectionsService) as never as TestSheetsSelectionsService;

    await act(async () => {
        selectionsService.selectionMoveStart$.next([{ range } as ISelectionWithStyle]);
        await Promise.resolve();
    });
}

async function finishSelections(injector: Injector, ranges: Array<ISelectionWithStyle['range']>) {
    const selectionsService = injector.get(SheetsSelectionsService) as never as TestSheetsSelectionsService;

    await act(async () => {
        selectionsService.selectionMoveEnd$.next(ranges.map((range) => ({ range }) as ISelectionWithStyle));
        await Promise.resolve();
    });
}

async function clickButton(text: string): Promise<void> {
    const button = Array.from(document.body.querySelectorAll('button'))
        .find((node) => node.textContent === text) as HTMLButtonElement | undefined;
    expect(button).toBeDefined();
    await act(async () => {
        button!.click();
        await Promise.resolve();
    });
}

describe('RangeSelectorDialog', () => {
    let container: HTMLDivElement;
    let root: Root;

    beforeEach(() => {
        RangeDialogState.reset();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
    });

    afterEach(() => {
        act(() => {
            root.unmount();
        });
        container.remove();
    });

    it('confirms only valid range inputs and normalizes reversed coordinates', async () => {
        renderRangeDialog(root, createRangeDialogTestBed());

        const firstInput = document.body.querySelector('input') as HTMLInputElement;
        expect(firstInput).toBeDefined();

        await act(async () => {
            writeInput(firstInput, 'B2:A1');
            await Promise.resolve();
        });

        await clickButton('Add range');

        const inputs = Array.from(document.body.querySelectorAll('input')) as HTMLInputElement[];
        expect(inputs.length).toBe(2);

        await act(async () => {
            writeInput(inputs[1], 'SUM(A1)');
            await Promise.resolve();
        });

        await clickButton('Confirm');

        expect(RangeDialogState.confirmed).toEqual([[
            expect.objectContaining({
                unitId: '',
                sheetName: '',
                range: expect.objectContaining({
                    startRow: 0,
                    endRow: 1,
                    startColumn: 0,
                    endColumn: 1,
                }),
            }),
        ]]);
        expect(RangeDialogState.closed).toBe(0);
    });

    it('closes without confirming typed ranges when the user cancels the dialog', async () => {
        renderRangeDialog(root, createRangeDialogTestBed());

        const firstInput = document.body.querySelector('input') as HTMLInputElement;
        expect(firstInput).toBeDefined();

        await act(async () => {
            writeInput(firstInput, 'A1:B2');
            await Promise.resolve();
        });

        await clickButton('Cancel');

        expect(RangeDialogState.confirmed).toEqual([]);
        expect(RangeDialogState.closed).toBe(1);
    });

    it('provides rtl-aware layout classes for dialog actions and range rows', () => {
        renderRangeDialog(root, createRangeDialogTestBed());

        const cancelButton = Array.from(document.body.querySelectorAll('button'))
            .find((node) => node.textContent === 'Cancel') as HTMLButtonElement | undefined;
        expect(cancelButton).toBeDefined();
        expect(cancelButton!.closest('footer')?.className).toContain('rtl:univer-flex-row-reverse');

        const firstInput = document.body.querySelector('input') as HTMLInputElement;
        expect(firstInput.closest('.univer-mb-2')?.className).toContain('rtl:univer-flex-row-reverse');
    });

    it('confirms only the remaining ranges after a typed range is removed', async () => {
        renderRangeDialog(root, createRangeDialogTestBed());

        const firstInput = document.body.querySelector('input') as HTMLInputElement;
        expect(firstInput).toBeDefined();

        await act(async () => {
            writeInput(firstInput, 'A1:A2');
            await Promise.resolve();
        });

        await clickButton('Add range');

        const inputs = Array.from(document.body.querySelectorAll('input')) as HTMLInputElement[];
        expect(inputs.length).toBe(2);

        await act(async () => {
            writeInput(inputs[1], 'C3:D4');
            await Promise.resolve();
        });

        const removeFirstRangeIcon = Array.from(document.body.querySelectorAll<SVGElement>('svg'))
            .find((node) => node.classList.contains('univer-cursor-pointer'));
        expect(removeFirstRangeIcon).toBeDefined();

        await act(async () => {
            removeFirstRangeIcon!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await Promise.resolve();
        });

        await clickButton('Confirm');

        expect(RangeDialogState.confirmed).toEqual([[
            expect.objectContaining({
                range: expect.objectContaining({
                    startRow: 2,
                    endRow: 3,
                    startColumn: 2,
                    endColumn: 3,
                }),
            }),
        ]]);
        expect(RangeDialogState.closed).toBe(0);
    });

    it('replaces the active range input with a sheet selection before confirming', async () => {
        const injector = createRangeDialogTestBed();
        renderRangeDialog(root, injector);

        const firstInput = document.body.querySelector('input') as HTMLInputElement;
        expect(firstInput).toBeDefined();

        await act(async () => {
            writeInput(firstInput, 'A1:A2');
            await Promise.resolve();
        });

        await clickButton('Add range');

        await emitSelection(injector, {
            startRow: 1,
            endRow: 2,
            startColumn: 1,
            endColumn: 2,
            rangeType: RANGE_TYPE.NORMAL,
        });

        const inputs = Array.from(document.body.querySelectorAll('input')) as HTMLInputElement[];
        expect(inputs.map((input) => input.value)).toEqual(['A1:A2', 'B2:C3']);

        await clickButton('Confirm');

        expect(RangeDialogState.confirmed).toEqual([[
            expect.objectContaining({
                range: expect.objectContaining({
                    startRow: 0,
                    endRow: 1,
                    startColumn: 0,
                    endColumn: 0,
                }),
            }),
            expect.objectContaining({
                range: expect.objectContaining({
                    startRow: 1,
                    endRow: 2,
                    startColumn: 1,
                    endColumn: 2,
                }),
            }),
        ]]);
        expect(RangeDialogState.closed).toBe(0);
    });

    it('replaces the focused typed range when the user picks a sheet selection', async () => {
        const injector = createRangeDialogTestBed();
        renderRangeDialog(root, injector);

        const firstInput = document.body.querySelector('input') as HTMLInputElement;
        expect(firstInput).toBeDefined();

        await act(async () => {
            writeInput(firstInput, 'A1:A2');
            await Promise.resolve();
        });

        await clickButton('Add range');

        const inputs = Array.from(document.body.querySelectorAll('input')) as HTMLInputElement[];
        expect(inputs.length).toBe(2);

        await act(async () => {
            writeInput(inputs[1], 'D4:D5');
            inputs[0].dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
            await Promise.resolve();
        });

        await emitSelection(injector, {
            startRow: 5,
            endRow: 6,
            startColumn: 2,
            endColumn: 3,
            rangeType: RANGE_TYPE.NORMAL,
        });

        expect(inputs.map((input) => input.value)).toEqual(['C6:D7', 'D4:D5']);

        await clickButton('Confirm');

        expect(RangeDialogState.confirmed).toEqual([[
            expect.objectContaining({
                range: expect.objectContaining({
                    startRow: 5,
                    endRow: 6,
                    startColumn: 2,
                    endColumn: 3,
                }),
            }),
            expect.objectContaining({
                range: expect.objectContaining({
                    startRow: 3,
                    endRow: 4,
                    startColumn: 3,
                    endColumn: 3,
                }),
            }),
        ]]);
        expect(RangeDialogState.closed).toBe(0);
    });

    it('does not append a duplicate range when the sheet selection matches a typed range', async () => {
        const injector = createRangeDialogTestBed();
        renderRangeDialog(root, injector);

        const firstInput = document.body.querySelector('input') as HTMLInputElement;
        expect(firstInput).toBeDefined();

        await act(async () => {
            writeInput(firstInput, 'A1:B2');
            await Promise.resolve();
        });

        await emitSelection(injector, {
            startRow: 0,
            endRow: 1,
            startColumn: 0,
            endColumn: 1,
            rangeType: RANGE_TYPE.NORMAL,
        });

        const inputs = Array.from(document.body.querySelectorAll('input')) as HTMLInputElement[];
        expect(inputs.map((input) => input.value)).toEqual(['A1:B2']);

        await clickButton('Confirm');

        expect(RangeDialogState.confirmed).toEqual([[
            expect.objectContaining({
                range: expect.objectContaining({
                    startRow: 0,
                    endRow: 1,
                    startColumn: 0,
                    endColumn: 1,
                }),
            }),
        ]]);
    });

    it('confirms only the first ranges from a multi-range sheet selection when capped', async () => {
        const injector = createRangeDialogTestBed();
        act(() => {
            root.render(
                <RediContext.Provider value={{ injector }}>
                    <RangeSelectorDialog
                        visible
                        initialValue={[]}
                        unitId="book-1"
                        subUnitId="sheet-1"
                        maxRangeCount={2}
                        onConfirm={(ranges) => RangeDialogState.confirmed.push(ranges)}
                        onClose={() => {
                            RangeDialogState.closed += 1;
                        }}
                    />
                </RediContext.Provider>
            );
        });

        await finishSelections(injector, [
            {
                startRow: 0,
                endRow: 0,
                startColumn: 0,
                endColumn: 0,
                rangeType: RANGE_TYPE.NORMAL,
            },
            {
                startRow: 2,
                endRow: 3,
                startColumn: 2,
                endColumn: 3,
                rangeType: RANGE_TYPE.NORMAL,
            },
            {
                startRow: 4,
                endRow: 4,
                startColumn: 4,
                endColumn: 4,
                rangeType: RANGE_TYPE.NORMAL,
            },
        ]);

        const inputs = Array.from(document.body.querySelectorAll('input')) as HTMLInputElement[];
        expect(inputs.map((input) => input.value)).toEqual(['A1', 'C3:D4']);

        await clickButton('Confirm');

        expect(RangeDialogState.confirmed).toEqual([[
            expect.objectContaining({
                range: expect.objectContaining({
                    startRow: 0,
                    endRow: 0,
                    startColumn: 0,
                    endColumn: 0,
                }),
            }),
            expect.objectContaining({
                range: expect.objectContaining({
                    startRow: 2,
                    endRow: 3,
                    startColumn: 2,
                    endColumn: 3,
                }),
            }),
        ]]);
        expect(RangeDialogState.closed).toBe(0);
    });
});
