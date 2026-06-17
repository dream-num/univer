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

import type { Dependency, IDisposable, IWorkbookData, Workbook, Worksheet } from '@univerjs/core';
import type { Root } from 'react-dom/client';
import {
    awaitTime,
    ICommandService,
    IConfirmService,
    ILogService,
    Inject,
    Injector,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    LogLevel,
    Plugin,
    toDisposable,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { FormulaDataModel, LexerTreeBuilder } from '@univerjs/engine-formula';
import {
    ReorderRangeCommand,
    ReorderRangeMutation,
    SetSelectionsOperation,
    SheetInterceptorService,
    SheetSkeletonService,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import { SheetsSortController, SheetsSortService } from '@univerjs/sheets-sort';
import { RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Subject } from 'rxjs';
import { afterEach, describe, expect, it } from 'vitest';
import enUS from '../../locale/en-US';
import { SheetsSortUIService } from '../../services/sheets-sort-ui.service';
import { CustomSortPanel } from '../CustomSortPanel';
import EmbedSortBtn from '../EmbedSortBtn';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const UNIT_ID = 'test';
const SUB_UNIT_ID = 'sheet1';

class TestConfirmService implements IConfirmService {
    readonly confirmOptions$ = new Subject<unknown[]>();

    open(): IDisposable {
        return toDisposable(() => undefined);
    }

    confirm(): Promise<boolean> {
        return Promise.resolve(true);
    }

    close() {
        // The tested sort paths close panels through SheetsSortUIService.
    }
}

function createWorkbookData(): IWorkbookData {
    return {
        id: UNIT_ID,
        appVersion: '3.0.0-alpha',
        locale: LocaleType.EN_US,
        name: 'sort view test',
        sheetOrder: [SUB_UNIT_ID],
        styles: {},
        sheets: {
            [SUB_UNIT_ID]: {
                id: SUB_UNIT_ID,
                name: 'Sheet1',
                rowCount: 20,
                columnCount: 20,
                cellData: {
                    0: {
                        0: { v: 'Name' },
                        1: { v: 'Score' },
                        2: { v: 'Region' },
                    },
                    1: {
                        0: { v: 'Cat' },
                        1: { v: 20, t: 2 },
                        2: { v: 'North' },
                    },
                    2: {
                        0: { v: 'Amy' },
                        1: { v: 10, t: 2 },
                        2: { v: 'East' },
                    },
                    3: {
                        0: { v: 'Ben' },
                        1: { v: 30, t: 2 },
                        2: { v: 'West' },
                    },
                },
            },
        },
    };
}

function createSortViewTestBed() {
    const univer = new Univer();
    const injector = univer.__getInjector();

    class TestPlugin extends Plugin {
        static override pluginName = 'sheets-sort-ui-view-test-plugin';
        static override type = UniverInstanceType.UNIVER_SHEET;

        constructor(
            _config: undefined,
            @Inject(Injector) protected readonly _injector: Injector
        ) {
            super();
        }

        override onStarting(): void {
            ([
                [SheetsSelectionsService],
                [SheetInterceptorService],
                [SheetSkeletonService],
                [FormulaDataModel],
                [LexerTreeBuilder],
                [SheetsSortController],
                [SheetsSortService],
                [SheetsSortUIService],
                [IConfirmService, { useClass: TestConfirmService }],
            ] as Dependency[]).forEach((dependency) => this._injector.add(dependency));
        }

        override onReady(): void {
            this._injector.get(SheetsSortController);
        }
    }

    injector.get(LocaleService).load({ [LocaleType.EN_US]: enUS });
    injector.get(LocaleService).setLocale(LocaleType.EN_US);
    univer.registerPlugin(TestPlugin);

    const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, createWorkbookData());
    injector.get(IUniverInstanceService).focusUnit(UNIT_ID);
    injector.get(ILogService).setLogLevel(LogLevel.SILENT);

    const commandService = injector.get(ICommandService);
    [SetSelectionsOperation, ReorderRangeMutation, ReorderRangeCommand].forEach((command) => commandService.registerCommand(command));

    return {
        univer,
        injector,
        workbook,
        worksheet: workbook.getSheetBySheetId(SUB_UNIT_ID)!,
        sortUIService: injector.get(SheetsSortUIService),
    };
}

async function renderWithInjector(root: Root, testBed: ReturnType<typeof createSortViewTestBed>, node: React.ReactNode) {
    await act(async () => {
        root.render(
            <RediContext.Provider value={{ injector: testBed.injector }}>
                {node}
            </RediContext.Provider>
        );
        await awaitTime(20);
    });
}

function getColumnValues(worksheet: Worksheet, col: number, rows: number[]) {
    return rows.map((row) => worksheet.getCell(row, col)?.v);
}

function getButton(container: HTMLElement, text: string) {
    const button = Array.from(container.querySelectorAll('[data-u-comp="button"]'))
        .find((item) => item.textContent === text);
    expect(button).toBeTruthy();
    return button as HTMLElement;
}

describe('Sheets sort views', () => {
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
});
