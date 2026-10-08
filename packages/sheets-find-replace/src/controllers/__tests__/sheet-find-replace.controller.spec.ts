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

import type { ICellData, IRange, IWorkbookData, Workbook } from '@univerjs/core';
import type { IFindQuery, IFindReplaceProvider } from '@univerjs/find-replace';
import type { ISheetCellMatch } from '../sheet-find-replace.controller';
import { ICommandService, IContextService, Injector, IUniverInstanceService, ThemeService, Univer, UniverInstanceType } from '@univerjs/core';
import { IRenderManagerService, RENDER_RAW_FORMULA_KEY } from '@univerjs/engine-render';
import { CloseFindDialogOperation, FindBy, FindDirection, FindScope, IFindReplaceService } from '@univerjs/find-replace';
import { SelectRangeCommand, SetRangeValuesCommand, SetWorksheetActivateCommand, SheetsSelectionsService } from '@univerjs/sheets';
import { ScrollToCellCommand } from '@univerjs/sheets-ui';
import { Subject } from 'rxjs';

import { describe, expect, it, onTestFinished, vi } from 'vitest';
import { SheetReplaceCommand } from '../../commands/commands/sheet-replace.command';
import { hitCell, SheetFindModel, SheetsFindReplaceController } from '../sheet-find-replace.controller';

vi.mock('@univerjs/sheets-ui', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@univerjs/sheets-ui')>();

    return {
        ...actual,
        getCoordByCell: vi.fn((row: number, col: number) => ({
            startX: col * 10,
            startY: row * 20,
            endX: (col + 1) * 10,
            endY: (row + 1) * 20,
        })),
    };
});

const baseQuery: IFindQuery = {
    replaceRevealed: false,
    findString: 'alpha',
    caseSensitive: false,
    matchesTheWholeCell: false,
    matchesTheWholeWord: false,
    findDirection: FindDirection.ROW,
    findScope: FindScope.SUBUNIT,
    findBy: FindBy.VALUE,
};

function createWorksheet(sheetId: string, cells: Record<string, ICellData>, options?: { hidden?: boolean; filteredRows?: number[] }) {
    const getCellData = (row: number, col: number) => cells[`${row},${col}`];

    return {
        getSheetId: () => sheetId,
        getRowCount: () => 4,
        getColumnCount: () => 4,
        isSheetHidden: () => !!options?.hidden,
        getMergedCell: () => null,
        getRowFiltered: (row: number) => options?.filteredRows?.includes(row) ?? false,
        getRowRawVisible: () => true,
        getColVisible: () => true,
        getCellRaw: vi.fn((row: number, col: number) => getCellData(row, col) ?? null),
        * iterateByRow(range: IRange) {
            for (let row = range.startRow; row <= range.endRow; row++) {
                for (let col = range.startColumn; col <= range.endColumn; col++) {
                    const value = getCellData(row, col);
                    if (value) {
                        yield { row, col, value };
                    }
                }
            }
        },
        * iterateByColumn(range: IRange) {
            for (let col = range.startColumn; col <= range.endColumn; col++) {
                for (let row = range.startRow; row <= range.endRow; row++) {
                    const value = getCellData(row, col);
                    if (value) {
                        yield { row, col, value };
                    }
                }
            }
        },
    } as any;
}

function createWorkbook(activeSheet: any, sheets = [activeSheet]) {
    return {
        getUnitId: () => 'unit-1',
        type: UniverInstanceType.UNIVER_SHEET,
        getActiveSheet: vi.fn(() => activeSheet),
        getSheets: vi.fn(() => sheets),
        getSheetOrders: vi.fn(() => sheets.map((sheet) => sheet.getSheetId())),
        getSheetBySheetId: vi.fn((sheetId: string) => sheets.find((sheet) => sheet.getSheetId() === sheetId)),
        activeSheet$: new Subject<any>(),
    } as any;
}

function createModel(
    workbook: any,
    selections: any[] = [{ range: { startRow: 0, startColumn: 0, endRow: 0, endColumn: 0 } }],
    overrides: {
        skeletonService?: any;
        renderManagerService?: any;
        themeService?: any;
    } = {}
) {
    const skeletonService = overrides.skeletonService ?? {
        currentSkeleton$: new Subject<any>(),
        getCurrentSkeleton: vi.fn(() => null),
    };
    const commandService = {
        executeCommand: vi.fn(() => Promise.resolve(true)),
        onCommandExecuted: vi.fn(() => ({ dispose: vi.fn() })),
    };
    const contextService = { setContextValue: vi.fn() };
    const selectionService = {
        getWorkbookSelections: vi.fn(() => ({
            getCurrentSelections: vi.fn(() => selections),
            getCurrentLastSelection: vi.fn(() => selections.at(-1)),
        })),
    };

    const injector = new Injector([
        [IUniverInstanceService, { useValue: {} }],
        [IRenderManagerService, { useValue: overrides.renderManagerService ?? { getRenderUnitById: vi.fn(() => null) } }],
        [ICommandService, { useValue: commandService }],
        [IContextService, { useValue: contextService }],
        [ThemeService, { useValue: overrides.themeService ?? { getColorFromTheme: vi.fn(() => '#ff0') } }],
        [SheetsSelectionsService, { useValue: selectionService }],
    ]);
    const model = injector.createInstance(SheetFindModel, workbook, skeletonService as any);
    onTestFinished(() => {
        model.dispose();
        injector.dispose();
    });

    return { model, commandService, contextService, skeletonService };
}

function createProvider(workbook: Workbook | null) {
    const skeletonService = {
        currentSkeleton$: new Subject<unknown>(),
        getCurrentSkeleton: vi.fn(() => null),
    };
    const commandService = {
        registerCommand: vi.fn(() => ({ dispose: vi.fn() })),
        executeCommand: vi.fn(() => Promise.resolve(true)),
        onCommandExecuted: vi.fn(() => ({ dispose: vi.fn() })),
    };
    const contextValue$ = new Subject<boolean>();
    let provider!: IFindReplaceProvider;
    const terminate = vi.fn();
    const injector = new Injector([
        [IUniverInstanceService, { useValue: { getCurrentUnitOfType: () => workbook } }],
        [IRenderManagerService, { useValue: { getRenderUnitById: () => ({ with: () => skeletonService }) } }],
        [ICommandService, { useValue: commandService }],
        [IContextService, { useValue: { subscribeContextValue$: () => contextValue$, setContextValue: vi.fn() } }],
        [IFindReplaceService, { useValue: {
            registerFindReplaceProvider: (registeredProvider: IFindReplaceProvider) => {
                provider = registeredProvider;
                return { dispose: vi.fn() };
            },
            terminate,
        } }],
        [ThemeService, { useValue: { getColorFromTheme: () => '#ff0' } }],
        [SheetsSelectionsService, { useValue: { getWorkbookSelections: () => ({
            getCurrentSelections: () => [],
            getCurrentLastSelection: () => null,
        }) } }],
        [SheetsFindReplaceController],
    ]);
    const controller = injector.get(SheetsFindReplaceController);
    onTestFinished(() => {
        provider.terminate();
        injector.dispose();
    });
    return { provider, controller, commandService, contextValue$, terminate };
}

describe('SheetsFindReplaceController integration', () => {
    it('registers a real sheets provider, preprocesses queries and closes on editor activation', async () => {
        const activeSheet = createWorksheet('sheet-1', {
            '0,0': { v: 'Alpha' },
            '0,1': { v: 'beta' },
            '1,0': { f: '=SUM(1)', v: 'alpha result' },
            '2,0': { v: 'alpha filtered' },
        }, { filteredRows: [2] });
        const { provider, controller, commandService, contextValue$, terminate } = createProvider(createWorkbook(activeSheet));

        contextValue$.next(true);
        const [model] = await provider.find({ ...baseQuery, findString: 'ALPHA' });

        expect(commandService.registerCommand).toHaveBeenCalledWith(SheetReplaceCommand);
        expect(commandService.executeCommand).toHaveBeenCalledWith(CloseFindDialogOperation.id);
        expect(model.getMatches().map((match) => (match as ISheetCellMatch).range.range.startRow)).toEqual([0, 1]);
        expect(model.getMatches().map((match) => match.replaceable)).toEqual([true, false]);

        controller.dispose();
        expect(terminate).toHaveBeenCalledOnce();
    });

    it('returns no models when the provider has no active workbook', async () => {
        const { provider } = createProvider(null);
        await expect(provider.find(baseQuery)).resolves.toEqual([]);
    });

    it.each([
        { name: 'single spaces', findString: ' ', columns: [1, 2, 3, 4, 5, 6, 8] },
        { name: 'consecutive spaces', findString: '  ', columns: [4] },
        { name: 'tabs', findString: '\t', columns: [9] },
        { name: 'nonbreaking spaces', findString: '\u00A0', columns: [10] },
        { name: 'leading spaces', findString: ' Alpha', columns: [2] },
        { name: 'trailing spaces ignoring case', findString: 'alpha ', columns: [1, 3, 6, 8] },
        { name: 'trailing spaces matching case', findString: 'alpha ', caseSensitive: true, columns: [] },
        { name: 'spaces in raw formulas', findString: ' ', findBy: FindBy.FORMULA, columns: [1, 2, 3, 4, 5, 6, 7] },
        { name: 'a cell containing one space', findString: ' ', matchesTheWholeCell: true, columns: [5] },
        { name: 'a cell containing two spaces', findString: '  ', matchesTheWholeCell: true, columns: [4] },
        { name: 'whole cells with leading spaces', findString: ' Alpha', matchesTheWholeCell: true, columns: [2] },
        { name: 'whole cells with trailing spaces', findString: 'Alpha ', matchesTheWholeCell: true, columns: [3] },
        { name: 'whole cells without spaces', findString: 'Alpha', matchesTheWholeCell: true, columns: [0] },
    ])('preserves whitespace when finding $name', async ({ columns, name: _name, ...query }) => {
        const univer = new Univer();
        onTestFinished(() => univer.dispose());
        const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
            id: 'unit-1',
            sheetOrder: ['sheet-1'],
            sheets: {
                'sheet-1': {
                    id: 'sheet-1',
                    rowCount: 1,
                    columnCount: 11,
                    cellData: {
                        0: {
                            0: { v: 'Alpha' },
                            1: { v: 'Alpha Beta' },
                            2: { v: ' Alpha' },
                            3: { v: 'Alpha ' },
                            4: { v: '  ' },
                            5: { v: ' ' },
                            6: { p: { id: 'rich-text', documentStyle: {}, body: { dataStream: 'Alpha Beta\r\n' } } },
                            7: { f: '="Alpha Beta"', v: 'AlphaBeta' },
                            8: { f: '="AlphaBeta"', v: 'Alpha Beta' },
                            9: { v: '\t' },
                            10: { v: 'Alpha\u00A0Beta' },
                        },
                    },
                },
            },
        });
        const { provider } = createProvider(workbook);
        const [model] = await provider.find({ ...baseQuery, ...query });

        expect(model.getMatches().map((match) => (match as ISheetCellMatch).range.range.startColumn)).toEqual(columns);
    });

    it.each([FindBy.VALUE, FindBy.FORMULA])('replaces literal spaces without changing unrelated cells in mode %s', async (findBy) => {
        const activeSheet = createWorksheet('sheet-1', {
            '0,0': { v: 'Alpha' },
            '0,1': { v: 'Alpha Beta' },
            '1,0': { p: { body: { dataStream: 'Alpha Beta\r\n' } } as any },
            '1,1': { f: '="Alpha Beta"', v: 'AlphaBeta' },
        });
        const { provider, commandService } = createProvider(createWorkbook(activeSheet));
        const [model] = await provider.find({ ...baseQuery, findString: ' ', findBy });

        await model.replaceAll('-');

        expect(commandService.executeCommand).toHaveBeenCalledWith(SheetReplaceCommand.id, {
            unitId: 'unit-1',
            replacements: [{
                count: findBy === FindBy.FORMULA ? 3 : 2,
                subUnitId: 'sheet-1',
                value: {
                    0: { 1: { v: 'Alpha-Beta' } },
                    1: {
                        0: { p: { body: expect.objectContaining({ dataStream: 'Alpha-Beta\r\n' }) } },
                        ...(findBy === FindBy.FORMULA ? { 1: { f: '="Alpha-Beta"', v: null } } : {}),
                    },
                },
            }],
        });
    });
});

describe('SheetFindModel search and replace', () => {
    it('finds in selected ranges with deduplication and toggles raw formula mode', () => {
        const activeSheet = createWorksheet('sheet-1', {
            '0,0': { v: 'alpha' },
            '0,1': { v: 'alpha again' },
            '1,0': { v: 'beta' },
        });
        const workbook = createWorkbook(activeSheet);
        const { model, contextService } = createModel(workbook, [
            { range: { startRow: 0, startColumn: 0, endRow: 0, endColumn: 1 } },
            { range: { startRow: 0, startColumn: 1, endRow: 1, endColumn: 1 } },
        ]);

        const complete = model.findInActiveWorksheet({ ...baseQuery, findBy: FindBy.FORMULA });

        expect(contextService.setContextValue).not.toHaveBeenCalled();
        expect(complete.results).toHaveLength(2);
        expect(complete.results.map((match: any) => match.range.range.startColumn)).toEqual([0, 1]);
        expect(model.matchesCount).toBe(2);

        model.start({ ...baseQuery, findBy: FindBy.FORMULA, findString: '=sum' });
        expect(contextService.setContextValue).toHaveBeenCalledWith(RENDER_RAW_FORMULA_KEY, true);

        model.dispose();
        expect(contextService.setContextValue).toHaveBeenLastCalledWith(RENDER_RAW_FORMULA_KEY, false);
    });

    it('finds across visible workbook sheets and skips hidden sheets', () => {
        const sheet1 = createWorksheet('sheet-1', { '0,0': { v: 'alpha' } });
        const sheet2 = createWorksheet('sheet-2', { '0,0': { v: 'alpha second' } });
        const hiddenSheet = createWorksheet('hidden', { '0,0': { v: 'alpha hidden' } }, { hidden: true });
        const workbook = createWorkbook(sheet1, [sheet1, sheet2, hiddenSheet]);
        const { model } = createModel(workbook);

        const complete = model.findInWorkbook({ ...baseQuery, findScope: FindScope.UNIT });

        expect(complete.results.map((match: any) => match.range.subUnitId)).toEqual(['sheet-1', 'sheet-2']);
        expect(model.matchesCount).toBe(2);

        model.dispose();
    });

    it('starts workbook-scope searches from the public start entry and no-ops focus without a match', () => {
        const sheet1 = createWorksheet('sheet-1', { '0,0': { v: 'alpha' } });
        const sheet2 = createWorksheet('sheet-2', { '0,0': { v: 'alpha second' } });
        const workbook = createWorkbook(sheet1, [sheet1, sheet2]);
        const { model, commandService } = createModel(workbook);

        model.focusSelection();
        expect(commandService.executeCommand).not.toHaveBeenCalled();

        model.start({ ...baseQuery, findScope: FindScope.UNIT });
        expect(model.matchesCount).toBe(2);

        model.dispose();
    });

    it('returns no active worksheet matches when the workbook has no active sheet', () => {
        const workbook = {
            getUnitId: () => 'unit-1',
            getActiveSheet: vi.fn(() => null),
            activeSheet$: new Subject<any>(),
        };
        const { model } = createModel(workbook);

        expect(model.findInActiveWorksheet(baseQuery)).toBeUndefined();

        model.dispose();
    });

    it('moves between matches, focuses selections and executes focus commands', async () => {
        const activeSheet = createWorksheet('sheet-1', {
            '0,0': { v: 'alpha' },
            '1,1': { v: 'alpha next' },
        });
        const workbook = createWorkbook(activeSheet);
        const { model, commandService } = createModel(workbook);

        expect(model.moveToNextMatch()).toBeNull();

        model.start(baseQuery);
        const first = model.moveToNextMatch({ ignoreSelection: true });
        expect(first?.range.range).toMatchObject({ startRow: 0, startColumn: 0 });
        expect(model.matchesPosition).toBe(1);
        expect(commandService.executeCommand).toHaveBeenLastCalledWith(ScrollToCellCommand.id, {
            range: first!.range.range,
        }, {
            fromFindReplace: true,
        });

        model.focusSelection();
        expect(commandService.executeCommand).toHaveBeenLastCalledWith(SelectRangeCommand.id, {
            unitId: 'unit-1',
            subUnit: 'sheet-1',
            range: first!.range.range,
        });

        const stayed = model.moveToNextMatch({ stayIfOnMatch: true, noFocus: true });
        expect(stayed).toBe(first);

        const second = model.moveToNextMatch({ noFocus: true });
        expect(second?.range.range).toMatchObject({ startRow: 1, startColumn: 1 });

        expect(model.moveToNextMatch({ noFocus: true })).toBeNull();
        expect(model.matchesPosition).toBe(0);

        const previous = model.moveToPreviousMatch({ noFocus: true, ignoreSelection: true });
        expect(previous?.range.range).toMatchObject({ startRow: 1, startColumn: 1 });
        expect(model.moveToPreviousMatch({ stayIfOnMatch: true, noFocus: true })).toBe(previous);

        model.dispose();
    });

    it('focuses a match on another sheet through activation and scroll commands', async () => {
        const sheet1 = createWorksheet('sheet-1', { '0,0': { v: 'alpha' } });
        const sheet2 = createWorksheet('sheet-2', { '1,1': { v: 'alpha' } });
        const workbook = createWorkbook(sheet1, [sheet1, sheet2]);
        const { model, commandService } = createModel(workbook);
        const match = {
            unitId: 'unit-1',
            provider: 'sheets-find-replace-provider',
            replaceable: true,
            isFormula: false,
            range: {
                subUnitId: 'sheet-2',
                range: { startRow: 1, startColumn: 1, endRow: 1, endColumn: 1 },
            },
        };

        await (model as any)._focusMatch(match);

        expect(commandService.executeCommand).toHaveBeenNthCalledWith(1, SetWorksheetActivateCommand.id, {
            unitId: 'unit-1',
            subUnitId: 'sheet-2',
        }, {
            fromFindReplace: true,
        });
        expect(commandService.executeCommand).toHaveBeenNthCalledWith(2, ScrollToCellCommand.id, {
            range: match.range.range,
        }, {
            fromFindReplace: true,
        });

        model.dispose();
    });

    it('renders find highlights for visible matches and updates the current highlight', () => {
        const activeSheet = createWorksheet('sheet-1', {
            '0,0': { v: 'alpha' },
            '1,1': { v: 'alpha next' },
        });
        const workbook = createWorkbook(activeSheet);
        const skeletonSubject = new Subject<any>();
        const skeletonService = {
            currentSkeleton$: skeletonSubject,
            getCurrentSkeleton: vi.fn(() => ({ rowColumnSegment: {} })),
        };
        const scene = {
            addObjects: vi.fn(),
            makeDirty: vi.fn(),
        };
        const { model } = createModel(workbook, undefined, {
            skeletonService,
            renderManagerService: { getRenderUnitById: vi.fn(() => ({ scene })) },
            themeService: { getColorFromTheme: vi.fn(() => '#ff0') },
        });

        model.start(baseQuery);

        let highlightShapes = scene.addObjects.mock.calls.at(-1)![0] as any[];
        expect(highlightShapes).toHaveLength(2);
        expect(highlightShapes[0].width).toBe(10);
        expect(highlightShapes[0].height).toBe(20);
        expect(scene.makeDirty).toHaveBeenCalled();

        model.moveToNextMatch({ noFocus: true, ignoreSelection: true });
        highlightShapes = scene.addObjects.mock.calls.at(-1)![0] as any[];
        expect(highlightShapes[0]._activated).toBe(true);

        skeletonSubject.next({});
        expect(scene.addObjects).toHaveBeenCalledTimes(2);

        model.dispose();
    });

    it('replaces the current match and replaces all replaceable matches by sheet', async () => {
        const activeSheet = createWorksheet('sheet-1', {
            '0,0': { v: 'alpha plain' },
            '0,1': { f: '=ALPHA()', v: 'alpha formula result' },
            '1,0': { p: { body: { dataStream: 'alpha rich\r\n' } } as any },
        });
        const workbook = createWorkbook(activeSheet);
        const { model, commandService } = createModel(workbook);

        model.start(baseQuery);
        model.moveToNextMatch({ noFocus: true, ignoreSelection: true });

        await expect(model.replace('omega')).resolves.toBe(true);
        expect(commandService.executeCommand).toHaveBeenCalledWith(SetRangeValuesCommand.id, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            value: {
                0: {
                    0: { v: 'omega plain' },
                },
            },
        });

        await model.replaceAll('omega');
        expect(commandService.executeCommand).toHaveBeenLastCalledWith(SheetReplaceCommand.id, {
            unitId: 'unit-1',
            replacements: [
                {
                    count: 2,
                    subUnitId: 'sheet-1',
                    value: expect.objectContaining({
                        0: expect.objectContaining({ 0: { v: 'omega plain' } }),
                        1: expect.objectContaining({ 0: expect.objectContaining({ p: expect.any(Object) }) }),
                    }),
                },
            ],
        });

        model.dispose();
    });

    it('replaces formulas only in formula search mode', async () => {
        const activeSheet = createWorksheet('sheet-1', {
            '0,0': { f: '=ALPHA()', v: 'alpha result' },
        });
        const workbook = createWorkbook(activeSheet);
        const { model, commandService } = createModel(workbook);

        model.start({ ...baseQuery, findBy: FindBy.FORMULA, findString: '=alpha' });
        model.moveToNextMatch({ noFocus: true, ignoreSelection: true });

        await expect(model.replace('=OMEGA')).resolves.toBe(true);
        expect(commandService.executeCommand).toHaveBeenLastCalledWith(SetRangeValuesCommand.id, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            value: {
                0: {
                    0: { f: '=OMEGA()', v: null },
                },
            },
        });

        model.dispose();
    });

    it('treats find strings as literal text when replacing plain cells', async () => {
        const activeSheet = createWorksheet('sheet-1', {
            '0,0': { v: 'a.b aXb a.b' },
        });
        const workbook = createWorkbook(activeSheet);
        const { model, commandService } = createModel(workbook);

        model.start({ ...baseQuery, findString: 'a.b' });

        await expect(model.replaceAll('hit')).resolves.toBe(true);
        expect(commandService.executeCommand).toHaveBeenLastCalledWith(SheetReplaceCommand.id, {
            unitId: 'unit-1',
            replacements: [
                {
                    count: 1,
                    subUnitId: 'sheet-1',
                    value: {
                        0: {
                            0: { v: 'hit aXb hit' },
                        },
                    },
                },
            ],
        });

        model.dispose();
    });

    it('returns empty replacement results when nothing is searchable', async () => {
        const activeSheet = createWorksheet('sheet-1', {});
        const workbook = createWorkbook(activeSheet);
        const { model, commandService } = createModel(workbook);

        expect(model.findInActiveWorksheet(baseQuery).results).toEqual([]);
        await expect(model.replace('omega')).resolves.toBe(false);
        await expect(model.replaceAll('omega')).resolves.toEqual({ success: 0, failure: 0 });
        expect(commandService.executeCommand).not.toHaveBeenCalled();

        model.dispose();
    });
});

describe('SheetFindModel navigation', () => {
    it('moves to the next match from the selection without focusing it', () => {
        const activeSheet = createWorksheet('sheet-1', { '1,1': { v: 'alpha' }, '2,1': { v: 'alpha' } });
        const { model, commandService } = createModel(createWorkbook(activeSheet));
        model.start(baseQuery);

        expect(model.moveToNextMatch({ noFocus: true })?.range.range.startRow).toBe(1);
        expect(commandService.executeCommand).not.toHaveBeenCalled();
    });
});

describe('hitCell', () => {
    const baseQuery: IFindQuery = {
        replaceRevealed: false,
        findString: 'abc',
        caseSensitive: false,
        matchesTheWholeCell: false,
        matchesTheWholeWord: false,
        findDirection: FindDirection.ROW,
        findScope: FindScope.SUBUNIT,
        findBy: FindBy.VALUE,
    };

    it('should mark formula matches replaceable only in formula mode', () => {
        const worksheet = {
            getCellRaw: () => ({ f: '=ABC()' }),
        };

        const formulaQuery: IFindQuery = { ...baseQuery, findBy: FindBy.FORMULA, findString: '=abc' };
        const res1 = hitCell(worksheet as any, 0, 0, formulaQuery, { v: 'xxx' } as any);
        expect(res1.hit).toBe(true);
        expect(res1.replaceable).toBe(true);
        expect(res1.isFormula).toBe(true);

        const valueQuery: IFindQuery = { ...baseQuery, findBy: FindBy.VALUE, findString: 'xxx' };
        const res2 = hitCell(worksheet as any, 0, 0, valueQuery, { v: 'xxx' } as any);
        expect(res2.hit).toBe(true);
        expect(res2.replaceable).toBe(false);
        expect(res2.isFormula).toBe(true);
    });

    it('should mark non-formula matches replaceable only when rawData exists', () => {
        const worksheetWithRaw = {
            getCellRaw: () => ({ v: 'abc' }),
        };

        const res1 = hitCell(worksheetWithRaw as any, 0, 0, baseQuery, { v: 'abc' } as any);
        expect(res1.hit).toBe(true);
        expect(res1.replaceable).toBe(true);

        const worksheetNoRaw = {
            getCellRaw: () => null,
        };

        const res2 = hitCell(worksheetNoRaw as any, 0, 0, baseQuery, { v: 'abc' } as any);
        expect(res2.hit).toBe(true);
        expect(res2.replaceable).toBe(false);
    });

    it('requires literal edge spaces when matching the whole cell', () => {
        const worksheet = {
            getCellRaw: () => ({ v: '  abc  ' }),
        };

        const res = hitCell(worksheet as any, 0, 0, {
            ...baseQuery,
            matchesTheWholeCell: true,
            findString: '  abc  ',
        }, { v: '  abc  ' } as any);

        expect(res.hit).toBe(true);
        expect(res.replaceable).toBe(true);
    });

    it('should extract number and boolean cell values for matching', () => {
        const worksheet = {
            getCellRaw: (_row: number, col: number) => (col === 0 ? { v: 123 } : { v: true }),
        };

        expect(hitCell(worksheet as any, 0, 0, { ...baseQuery, findString: '23' }, { v: 123 } as any).hit).toBe(true);
        expect(hitCell(worksheet as any, 0, 1, { ...baseQuery, findString: '1' }, { v: true } as any).hit).toBe(true);
    });

    it('should report misses for empty values and unmatched formula display values', () => {
        const formulaWorksheet = {
            getCellRaw: () => ({ f: '=SUM(1)' }),
        };
        const formulaRawMiss = hitCell(formulaWorksheet as any, 0, 0, {
            ...baseQuery,
            findBy: FindBy.FORMULA,
            findString: '=missing',
        }, { v: 'alpha' } as any);
        expect(formulaRawMiss.hit).toBe(false);
        expect(formulaRawMiss.replaceable).toBe(false);

        const formulaMiss = hitCell(formulaWorksheet as any, 0, 0, { ...baseQuery, findString: 'missing' }, { v: 'alpha' } as any);
        expect(formulaMiss.hit).toBe(false);
        expect(formulaMiss.replaceable).toBe(false);
        expect(formulaMiss.isFormula).toBe(true);

        const emptyWorksheet = {
            getCellRaw: () => ({ v: '' }),
        };
        const emptyMiss = hitCell(emptyWorksheet as any, 0, 0, baseQuery, { v: '' } as any);
        expect(emptyMiss.hit).toBe(false);
        expect(emptyMiss.replaceable).toBe(false);
    });
});

describe('hitCell formula case sensitivity', () => {
    it.each([
        { findString: 'sum', caseSensitive: true, hit: false },
        { findString: 'SUM', caseSensitive: true, hit: true },
        { findString: 'sum', caseSensitive: false, hit: true },
    ])('matches formula query $findString with caseSensitive=$caseSensitive', ({ findString, caseSensitive, hit }) => {
        const cell = { f: '=SUM(6, 3)', v: 9 };
        const worksheet = createWorksheet('sheet-1', { '0,0': cell });
        expect(hitCell(worksheet, 0, 0, { ...baseQuery, findBy: FindBy.FORMULA, findString, caseSensitive }, cell))
            .toMatchObject({ hit, replaceable: hit });
    });
});
