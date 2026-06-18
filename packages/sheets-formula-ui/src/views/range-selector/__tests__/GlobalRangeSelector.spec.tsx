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

import type { ICommandInfo, IDisposable, IUnitRangeName } from '@univerjs/core';
import type { ISelectionWithStyle } from '@univerjs/sheets';
import type { Root } from 'react-dom/client';
import type { IRangeSelectorInstance } from '../index';
import {
    CommandType,
    ICommandService,
    Injector,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    ThemeService,
    UniverInstanceType,
} from '@univerjs/core';
import { IEditorService } from '@univerjs/docs-ui';
import { LexerTreeBuilder } from '@univerjs/engine-formula';
import { SetSelectionsOperation, SheetsSelectionsService } from '@univerjs/sheets';
import { IDescriptionService } from '@univerjs/sheets-formula';
import { IMarkSelectionService } from '@univerjs/sheets-ui';
import { RediContext } from '@univerjs/ui';
import { act, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { GlobalRangeSelectorService } from '../../../services/range-selector.service';
import { GlobalRangeSelector } from '../Global';
import { RangeSelector } from '../index';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

class TestCommandService {
    readonly executed: Array<{ id: string; params?: unknown }> = [];

    executeCommand(id: string, params?: unknown): Promise<boolean> {
        this.executed.push({ id, params });
        return Promise.resolve(true);
    }

    registerCommand(): IDisposable {
        return { dispose: () => {} };
    }

    registerMultipleCommand(): IDisposable {
        return { dispose: () => {} };
    }

    beforeCommandExecuted() {
        return { dispose: () => {} };
    }

    onCommandExecuted() {
        return { dispose: () => {} };
    }

    syncExecuteCommand(): boolean {
        return true;
    }

    setCommandExecutedListener(): void {}

    getCommands(): Map<string, ICommandInfo> {
        return new Map();
    }

    getCommand(): ICommandInfo {
        return { id: 'test.command', type: CommandType.OPERATION };
    }
}

class TestEditorService {
    readonly blur$ = new Subject<void>();
    readonly focus$ = new Subject<{ unitId: string }>();

    blur(): void {
        this.blur$.next();
    }

    focus(unitId: string): void {
        this.focus$.next({ unitId });
    }
}

class TestDescriptionService {
    hasDefinedNameDescription() {
        return false;
    }
}

class TestSheetsSelectionsService {
    readonly selectionMoveStart$ = new Subject();
    readonly selectionMoving$ = new Subject();
    readonly selectionMoveEnd$ = new Subject();
}

class TestMarkSelectionService {
    private _nextId = 0;

    addShape() {
        return `shape-${this._nextId++}`;
    }

    addShapeWithNoFresh() {
        return this.addShape();
    }

    removeShape(): void {}

    removeAllShapes(): void {}

    refreshShapes(): void {}

    getShapeMap() {
        return new Map();
    }
}

class TestUniverInstanceService {
    private readonly _workbook = {
        getActiveSheet: () => ({
            getSheetId: () => 'sheet-1',
            getName: () => 'Sheet1',
        }),
    };

    getUnit(_unitId: string, type?: UniverInstanceType) {
        return type === UniverInstanceType.UNIVER_SHEET ? this._workbook : null;
    }

    getCurrentUnitOfType(type: UniverInstanceType) {
        return type === UniverInstanceType.UNIVER_SHEET ? this._workbook : null;
    }
}

function createGlobalRangeSelectorTestBed() {
    const injector = new Injector();
    injector.add([LocaleService, { useClass: LocaleService }]);
    injector.add([ThemeService, { useClass: ThemeService }]);
    injector.add([LexerTreeBuilder, { useClass: LexerTreeBuilder }]);
    injector.add([IDescriptionService, { useClass: TestDescriptionService as never }]);
    injector.add([ICommandService, { useClass: TestCommandService as never }]);
    injector.add([IEditorService, { useClass: TestEditorService as never }]);
    injector.add([IMarkSelectionService, { useClass: TestMarkSelectionService as never }]);
    injector.add([SheetsSelectionsService, { useClass: TestSheetsSelectionsService as never }]);
    injector.add([IUniverInstanceService, { useClass: TestUniverInstanceService as never }]);
    injector.add([GlobalRangeSelectorService]);

    injector.get(LocaleService).load({
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
    injector.get(LocaleService).setLocale(LocaleType.EN_US);

    return {
        injector,
        service: injector.get(GlobalRangeSelectorService),
        commandService: injector.get(ICommandService) as unknown as TestCommandService,
    };
}

function writeInput(input: HTMLInputElement, value: string) {
    const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    valueSetter?.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
}

async function clickButton(text: string) {
    const button = Array.from(document.body.querySelectorAll('button'))
        .find((node) => node.textContent === text) as HTMLButtonElement | undefined;
    expect(button).toBeDefined();

    await act(async () => {
        button!.click();
        await Promise.resolve();
    });
}

describe('GlobalRangeSelector', () => {
    let container: HTMLDivElement;
    let root: Root;

    beforeEach(() => {
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

    it('opens the global selector dialog and resolves the confirmed range', async () => {
        const { injector, service } = createGlobalRangeSelectorTestBed();
        const callbackRanges: IUnitRangeName[][] = [];

        await act(async () => {
            root.render(
                <RediContext.Provider value={{ injector }}>
                    <GlobalRangeSelector />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        let promise!: Promise<IUnitRangeName[]>;

        await act(async () => {
            promise = service.showRangeSelectorDialog({
                unitId: 'book-1',
                subUnitId: 'sheet-1',
                callback: (ranges) => callbackRanges.push(ranges),
            });
            await Promise.resolve();
        });

        const input = document.body.querySelector('input') as HTMLInputElement;
        expect(input).toBeDefined();

        await act(async () => {
            writeInput(input, 'B2:C3');
            await Promise.resolve();
        });

        await clickButton('Confirm');

        await expect(promise).resolves.toEqual([
            expect.objectContaining({
                unitId: '',
                sheetName: '',
                range: expect.objectContaining({
                    startRow: 1,
                    endRow: 2,
                    startColumn: 1,
                    endColumn: 2,
                }),
            }),
        ]);
        expect(callbackRanges).toEqual([
            [
                expect.objectContaining({
                    range: expect.objectContaining({
                        startRow: 1,
                        endRow: 2,
                        startColumn: 1,
                        endColumn: 2,
                    }),
                }),
            ],
        ]);
    });

    it('restores the caller selection when a range selector dialog is cancelled', async () => {
        const { commandService, injector } = createGlobalRangeSelectorTestBed();
        const selectorRef = createRef<IRangeSelectorInstance | null>();
        const resetRange: ISelectionWithStyle[] = [{
            range: {
                startRow: 4,
                endRow: 5,
                startColumn: 2,
                endColumn: 3,
            },
            primary: null,
        } as ISelectionWithStyle];

        await act(async () => {
            root.render(
                <RediContext.Provider value={{ injector }}>
                    <RangeSelector
                        unitId="book-1"
                        subUnitId="sheet-1"
                        hideEditor
                        selectorRef={selectorRef}
                        resetRange={resetRange}
                    />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        await act(async () => {
            selectorRef.current!.showDialog([]);
            await Promise.resolve();
        });

        await clickButton('Cancel');

        expect(commandService.executed).toEqual([
            {
                id: SetSelectionsOperation.id,
                params: {
                    unitId: 'book-1',
                    subUnitId: 'sheet-1',
                    selections: resetRange,
                },
            },
        ]);
    });

    it('confirms the typed range without leaving the temporary range selection active', async () => {
        const { commandService, injector } = createGlobalRangeSelectorTestBed();
        const selectorRef = createRef<IRangeSelectorInstance | null>();
        const resetRange: ISelectionWithStyle[] = [{
            range: {
                startRow: 8,
                endRow: 8,
                startColumn: 1,
                endColumn: 1,
            },
            primary: null,
        } as ISelectionWithStyle];
        const changes: string[] = [];

        await act(async () => {
            root.render(
                <RediContext.Provider value={{ injector }}>
                    <RangeSelector
                        unitId="book-1"
                        subUnitId="sheet-1"
                        hideEditor
                        selectorRef={selectorRef}
                        resetRange={resetRange}
                        onChange={(_, value) => changes.push(value)}
                    />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        await act(async () => {
            selectorRef.current!.showDialog([]);
            await Promise.resolve();
        });

        const input = document.body.querySelector('input') as HTMLInputElement;
        expect(input).toBeDefined();

        await act(async () => {
            writeInput(input, 'D4:E5');
            await Promise.resolve();
        });

        await clickButton('Confirm');

        expect(changes).toEqual(['D4:E5']);
        expect(commandService.executed).toEqual([
            {
                id: SetSelectionsOperation.id,
                params: {
                    unitId: 'book-1',
                    subUnitId: 'sheet-1',
                    selections: resetRange,
                },
            },
        ]);
    });

    it('confirms only the latest global selector request after another request replaces it', async () => {
        const { injector, service } = createGlobalRangeSelectorTestBed();
        const firstCallbackRanges: IUnitRangeName[][] = [];
        const secondCallbackRanges: IUnitRangeName[][] = [];

        await act(async () => {
            root.render(
                <RediContext.Provider value={{ injector }}>
                    <GlobalRangeSelector />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        await act(async () => {
            service.showRangeSelectorDialog({
                unitId: 'book-1',
                subUnitId: 'sheet-1',
                callback: (ranges) => firstCallbackRanges.push(ranges),
            });
            await Promise.resolve();
        });

        let secondPromise!: Promise<IUnitRangeName[]>;
        await act(async () => {
            secondPromise = service.showRangeSelectorDialog({
                unitId: 'book-1',
                subUnitId: 'sheet-1',
                callback: (ranges) => secondCallbackRanges.push(ranges),
            });
            await Promise.resolve();
        });

        const input = document.body.querySelector('input') as HTMLInputElement;
        expect(input).toBeDefined();

        await act(async () => {
            writeInput(input, 'F6:G7');
            await Promise.resolve();
        });

        await clickButton('Confirm');

        expect(firstCallbackRanges).toEqual([]);
        await expect(secondPromise).resolves.toEqual([
            expect.objectContaining({
                range: expect.objectContaining({
                    startRow: 5,
                    endRow: 6,
                    startColumn: 5,
                    endColumn: 6,
                }),
            }),
        ]);
        expect(secondCallbackRanges).toEqual([
            [
                expect.objectContaining({
                    range: expect.objectContaining({
                        startRow: 5,
                        endRow: 6,
                        startColumn: 5,
                        endColumn: 6,
                    }),
                }),
            ],
        ]);
    });
});
