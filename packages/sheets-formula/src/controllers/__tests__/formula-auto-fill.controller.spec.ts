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

import type {
    Dependency,
    Direction,
    ICellData,
    IObjectMatrixPrimitiveType,
    IRange,
    IWorkbookData,
    Nullable,
    Workbook,
} from '@univerjs/core';
import type { IAutoFillLocation } from '@univerjs/sheets';
import {
    BooleanNumber,
    FormulaType,
    ICommandService,
    IPermissionService,
    IUndoRedoService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    mergeWorksheetSnapshotWithDefault,
    RedoCommand,
    Tools,
    UndoCommand,
    UniverInstanceType,
} from '@univerjs/core';
import { FormulaDataModel, IDefinedNamesService, LexerTreeBuilder } from '@univerjs/engine-formula';
import {
    AddRangeProtectionMutation,
    AddWorksheetMergeMutation,
    AUTO_FILL_APPLY_TYPE,
    AUTO_FILL_DATA_TYPE,
    AutoFillCommand,
    AutoFillController,
    AutoFillService,
    EditStateEnum,
    IAutoFillService,
    InsertSheetMutation,
    RangeProtectionPermissionEditPoint,
    RangeProtectionPermissionViewPoint,
    RefillCommand,
    RemoveWorksheetMergeMutation,
    SetRangeValuesCommand,
    SetRangeValuesMutation,
    SetSelectionsOperation,
    SheetPermissionCheckController,
    SheetsSelectionsService,
    ViewStateEnum,
} from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFacadeTestBed } from '../../facade/__tests__/create-test-bed';
import { FormulaAutoFillController } from '../formula-auto-fill.controller';

function createControllerTestBed() {
    const dependencies: Dependency[] = [
        [IAutoFillService, { useClass: AutoFillService }],
        [FormulaAutoFillController],
    ];

    return createFacadeTestBed(undefined, dependencies);
}

function createLocation(sourceRows: number[], targetRows: number[]): IAutoFillLocation {
    return {
        unitId: 'test',
        subUnitId: 'sheet1',
        source: {
            rows: sourceRows,
            cols: [0],
        },
        target: {
            rows: targetRows,
            cols: [0],
        },
    };
}

describe('FormulaAutoFillController', () => {
    const directions: Array<{ direction: Direction; expected: { offsetX: number; offsetY: number } }> = [
        { direction: 0, expected: { offsetX: 0, offsetY: -3 } },
        { direction: 1, expected: { offsetX: 2, offsetY: 0 } },
        { direction: 2, expected: { offsetX: 0, offsetY: 3 } },
        { direction: 3, expected: { offsetX: -4, offsetY: 0 } },
    ];

    let testBed: ReturnType<typeof createControllerTestBed>;

    beforeEach(() => {
        testBed = createControllerTestBed();
        testBed.injector.get(FormulaAutoFillController);
    });

    afterEach(() => {
        vi.restoreAllMocks();
        testBed?.univer.dispose();
    });

    it('should register a formula auto-fill rule and recognize formula cells', () => {
        const autoFillService = testBed.injector.get(IAutoFillService);
        const formulaRule = autoFillService.getRules().find((rule) => rule.type === AUTO_FILL_DATA_TYPE.FORMULA);

        expect(formulaRule).toBeDefined();
        expect(formulaRule?.match({ f: '=SUM(A1)' }, testBed.injector as never)).toBe(true);
        expect(formulaRule?.match({ si: 'shared-id' }, testBed.injector as never)).toBe(true);
        expect(formulaRule?.match({ v: 1 }, testBed.injector as never)).toBe(false);

        expect(formulaRule?.isContinue({ type: AUTO_FILL_DATA_TYPE.FORMULA, cellData: { f: '=A1' } }, null)).toBe(true);
        expect(formulaRule?.isContinue({ type: AUTO_FILL_DATA_TYPE.NUMBER, cellData: { v: 1 } }, null)).toBe(false);
    });

    it('should offset copied formulas by direction and reuse the generated formula id', () => {
        const autoFillService = testBed.injector.get(IAutoFillService);
        const lexerTreeBuilder = testBed.injector.get(LexerTreeBuilder);
        const formulaRule = autoFillService.getRules().find((rule) => rule.type === AUTO_FILL_DATA_TYPE.FORMULA);

        expect(formulaRule).toBeDefined();
        if (!formulaRule || !formulaRule.applyFunctions?.[AUTO_FILL_APPLY_TYPE.COPY]) {
            throw new Error('Formula auto-fill copy rule is not registered');
        }

        const applyCopy = formulaRule.applyFunctions[AUTO_FILL_APPLY_TYPE.COPY];

        const moveFormulaRefOffsetSpy = vi
            .spyOn(lexerTreeBuilder, 'moveFormulaRefOffset')
            .mockImplementation((formula, offsetX, offsetY) => `${formula}|${offsetX},${offsetY}`);

        directions.forEach(({ direction, expected }) => {
            const result = applyCopy(
                {
                    data: [{ f: '=SUM(A1)' }],
                    index: [0],
                },
                2,
                direction,
                {
                    formula: [{
                        data: [{ f: '=SUM(A1)' }, { f: '=SUM(B1)' }],
                        index: [0, 1],
                    }],
                },
                createLocation([5], direction === 0 ? [2] : direction === 2 ? [8] : [5])
            );

            expect(result).toHaveLength(2);
            expect(result[0]).toMatchObject({
                f: `=SUM(A1)|${expected.offsetX},${expected.offsetY}`,
                si: expect.any(String),
                v: null,
                p: null,
                t: null,
            });
            expect(result[1]).toMatchObject({
                si: result[0]?.si,
                f: null,
                v: null,
                p: null,
                t: null,
            });
        });

        expect(moveFormulaRefOffsetSpy.mock.calls).toEqual([
            ['=SUM(A1)', 0, -3],
            ['=SUM(A1)', 2, 0],
            ['=SUM(A1)', 0, 3],
            ['=SUM(A1)', -4, 0],
        ]);
    });

    it('should preserve shared formula ids and skip non-formula or null cells', () => {
        const autoFillService = testBed.injector.get(IAutoFillService);
        const formulaRule = autoFillService.getRules().find((rule) => rule.type === AUTO_FILL_DATA_TYPE.FORMULA);

        expect(formulaRule).toBeDefined();
        if (!formulaRule || !formulaRule.applyFunctions?.[AUTO_FILL_APPLY_TYPE.COPY]) {
            throw new Error('Formula auto-fill copy rule is not registered');
        }

        const applyCopy = formulaRule.applyFunctions[AUTO_FILL_APPLY_TYPE.COPY];

        const result = applyCopy(
            {
                data: [{ si: 'shared-id' }, { v: 1 }, null] as Array<Nullable<{ si?: string; v?: number }>>,
                index: [0, 1, 2],
            },
            3,
            2,
            {
                formula: [{
                    data: [{ si: 'shared-id' }],
                    index: [0],
                }],
            },
            createLocation([0, 1, 2], [3, 4, 5])
        );

        expect(result).toEqual([
            {
                si: 'shared-id',
                f: null,
                v: null,
                p: null,
                t: null,
            },
        ]);
    });

    it.each([undefined, BooleanNumber.FALSE, BooleanNumber.TRUE])(
        'preserves source formula metadata when filling shared followers (%s)',
        (fd) => {
            const source: ICellData = { f: '=A1' };
            if (fd !== undefined) {
                source.ft = FormulaType.ARRAY;
                source.fd = fd;
            }
            const rule = testBed.injector.get(IAutoFillService).getRules().find((rule) => rule.type === AUTO_FILL_DATA_TYPE.FORMULA)!;
            const result = rule.applyFunctions![AUTO_FILL_APPLY_TYPE.COPY]!({
                data: [source],
                index: [0],
            }, 2, 2, { formula: [{ data: [source], index: [0] }] }, createLocation([0], [1, 2]));
            expect(result[0]?.f).toBe('=A2');
            expect(result[1]?.si).toBe(result[0]?.si);
            for (const cell of result) {
                expect(cell?.ft).toBe(source.ft);
                expect(cell?.fd).toBe(fd);
            }
        }
    );

    describe('formula view permissions', () => {
        let commandService: ICommandService;
        let workbook: Workbook;
        let messages: string[];

        beforeEach(() => {
            const { injector } = testBed;
            injector.add([AutoFillController]);
            injector.add([SheetPermissionCheckController]);
            injector.get(AutoFillController);
            messages = [];
            injector.get(SheetPermissionCheckController).triggerPermissionUIEvent$.subscribe((message) => messages.push(message));
            const localeService = injector.get(LocaleService);
            localeService.setLocale(LocaleType.EN_US);
            localeService.setDirection('ltr');
            commandService = injector.get(ICommandService);
            workbook = injector.get(IUniverInstanceService).getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
            for (const command of [
                AutoFillCommand,
                RefillCommand,
                SetRangeValuesMutation,
                SetSelectionsOperation,
                AddWorksheetMergeMutation,
                RemoveWorksheetMergeMutation,
                AddRangeProtectionMutation,
                InsertSheetMutation,
                SetRangeValuesCommand,
            ]) {
                commandService.registerCommand(command);
            }
            setCells({
                4: { 1: { v: 123 }, 2: { f: '=B5' } },
                6: { 1: { v: 'private value' }, 2: { v: 'existing target' } },
            });
        });

        function setCells(cellValue: IObjectMatrixPrimitiveType<ICellData>) {
            commandService.syncExecuteCommand(SetRangeValuesMutation.id, { unitId: 'test', subUnitId: 'sheet1', cellValue });
        }

        function protect(row: number, column: number, canView = false, subUnitId = 'sheet1', unitId = 'test') {
            const permissionId = `protected-${row}-${column}`;
            const view = new RangeProtectionPermissionViewPoint(unitId, subUnitId, permissionId);
            commandService.syncExecuteCommand(AddRangeProtectionMutation.id, {
                unitId,
                subUnitId,
                rules: [{
                    id: permissionId,
                    permissionId,
                    unitId,
                    subUnitId,
                    ranges: [{ startRow: row, endRow: row, startColumn: column, endColumn: column }],
                    unitType: view.type,
                    viewState: canView ? ViewStateEnum.OthersCanView : ViewStateEnum.NoOneElseCanView,
                    editState: EditStateEnum.OnlyMe,
                }],
            });
            const permissionService = testBed.injector.get(IPermissionService);
            view.value = canView;
            permissionService.addPermissionPoint(view);
            const edit = new RangeProtectionPermissionEditPoint(unitId, subUnitId, permissionId);
            edit.value = false;
            permissionService.addPermissionPoint(edit);
        }

        function fill(applyType = AUTO_FILL_APPLY_TYPE.COPY, sourceRange: IRange = {
            startRow: 4,
            endRow: 4,
            startColumn: 2,
            endColumn: 2,
        }, targetRange: IRange = { ...sourceRange, endRow: 14 }) {
            return commandService.executeCommand(AutoFillCommand.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                sourceRange,
                targetRange,
                applyType,
            });
        }

        function snapshot() {
            return Tools.deepClone(workbook.getActiveSheet().getCellMatrix().getMatrix());
        }

        it.each([AUTO_FILL_APPLY_TYPE.COPY, AUTO_FILL_APPLY_TYPE.NO_FORMAT])(
            'rejects a hidden reference in a shared follower before any writes (%s)',
            async (applyType) => {
                protect(6, 1);
                const before = snapshot();
                const undoRedoService = testBed.injector.get(IUndoRedoService);
                const history = undoRedoService.getUndoRedoStatus('test');
                const selectionService = testBed.injector.get(SheetsSelectionsService);
                const selections = Tools.deepClone(selectionService.getCurrentSelections());
                const mutations: string[] = [];
                commandService.onCommandExecuted(({ id }) => {
                    if ([SetRangeValuesMutation.id, SetSelectionsOperation.id].includes(id)) {
                        mutations.push(id);
                    }
                });

                expect(await fill(applyType)).toBe(false);
                expect(snapshot()).toEqual(before);
                expect(mutations).toEqual([]);
                expect(selectionService.getCurrentSelections()).toEqual(selections);
                expect(undoRedoService.getUndoRedoStatus('test')).toEqual(history);
                expect(messages).toHaveLength(1);
            }
        );

        it('resolves a source cell that only contains a shared formula id', async () => {
            setCells({ 3: { 2: { f: '=B4', si: 'source-formula' } }, 4: { 2: { f: null, si: 'source-formula' } } });
            protect(6, 1);
            const before = snapshot();
            expect(await fill()).toBe(false);
            expect(snapshot()).toEqual(before);
        });

        it.each(['=$B5', '=sheet1!B5', '=SUM(B5:B6)'])(
            'checks the final references for %s',
            async (formula) => {
                setCells({ 4: { 2: { f: formula } } });
                protect(6, 1);
                const before = snapshot();
                expect(await fill()).toBe(false);
                expect(snapshot()).toEqual(before);
            }
        );

        it('checks horizontal fill references', async () => {
            setCells({ 4: { 2: { f: '=B5' } } });
            protect(4, 3);
            const before = snapshot();
            expect(await fill(AUTO_FILL_APPLY_TYPE.COPY, { startRow: 4, endRow: 4, startColumn: 2, endColumn: 2 }, { startRow: 4, endRow: 4, startColumn: 2, endColumn: 4 })).toBe(false);
            expect(snapshot()).toEqual(before);
        });

        it.each([
            { sourceColumn: 2, startRow: 0, startColumn: 2, hiddenRow: 2, hiddenColumn: 1, formula: '=B5' },
            { sourceColumn: 4, startRow: 4, startColumn: 2, hiddenRow: 4, hiddenColumn: 1, formula: '=D5' },
        ])('checks references when filling up or left ($formula)', async (data) => {
            setCells({ 4: { [data.sourceColumn]: { f: data.formula } } });
            protect(data.hiddenRow, data.hiddenColumn);
            const before = snapshot();
            expect(await fill(AUTO_FILL_APPLY_TYPE.COPY, { startRow: 4, endRow: 4, startColumn: data.sourceColumn, endColumn: data.sourceColumn }, { startRow: data.startRow, endRow: 4, startColumn: data.startColumn, endColumn: data.sourceColumn })).toBe(false);
            expect(snapshot()).toEqual(before);
        });

        it.each([false, true])('checks references on another sheet (%s)', async (crossSheetReference) => {
            commandService.syncExecuteCommand(InsertSheetMutation.id, {
                unitId: 'test',
                index: 1,
                sheet: mergeWorksheetSnapshotWithDefault({
                    id: 'sheet2',
                    name: 'sheet2',
                    cellData: { 4: { 2: { f: '=B5' } }, 6: { 1: { v: 'private value' } } },
                }),
            });
            protect(6, 1, false, 'sheet2');
            if (crossSheetReference) {
                setCells({ 4: { 2: { f: '=sheet2!B5' } } });
            }
            const before = Tools.deepClone(workbook.getSnapshot());
            expect(await commandService.executeCommand(AutoFillCommand.id, {
                unitId: 'test',
                subUnitId: crossSheetReference ? 'sheet1' : 'sheet2',
                sourceRange: { startRow: 4, endRow: 4, startColumn: 2, endColumn: 2 },
                targetRange: { startRow: 4, endRow: 14, startColumn: 2, endColumn: 2 },
                applyType: AUTO_FILL_APPLY_TYPE.COPY,
            })).toBe(false);
            expect(workbook.getSnapshot()).toEqual(before);
        });

        it('uses the same view permission check for direct formula entry and named references', async () => {
            protect(6, 1);
            const before = snapshot();
            expect(await commandService.executeCommand(SetRangeValuesCommand.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                range: { startRow: 6, endRow: 6, startColumn: 2, endColumn: 2 },
                value: { f: '=B7' },
            })).toBe(false);
            expect(snapshot()).toEqual(before);

            testBed.injector.get(IDefinedNamesService).registerDefinedName('test', {
                id: 'private-cell',
                name: 'PrivateCell',
                formulaOrRefString: 'sheet1!$B$7',
            });
            setCells({ 4: { 2: { f: '=PrivateCell' } } });
            const beforeFill = snapshot();
            expect(await fill()).toBe(false);
            expect(snapshot()).toEqual(beforeFill);
        });

        it.each([
            '=SUM(PrivateCell)',
            '=PrivateAlias',
            '=PrivateCell&""',
            '=SUM(PrivateAlias,PrivateAlias)',
        ])('checks nested names in %s against view permissions', async (formula) => {
            const definedNames = testBed.injector.get(IDefinedNamesService);
            definedNames.registerDefinedName('test', {
                id: 'private-cell',
                name: 'PrivateCell',
                formulaOrRefString: 'sheet1!$B$7',
            });
            definedNames.registerDefinedName('test', {
                id: 'private-alias',
                name: 'PrivateAlias',
                formulaOrRefString: '=PrivateCell',
            });
            setCells({ 4: { 2: { f: formula } } });
            protect(6, 1);
            const before = snapshot();
            expect(await fill()).toBe(false);
            expect(snapshot()).toEqual(before);

            testBed.injector.get(IPermissionService).updatePermissionPoint(
                new RangeProtectionPermissionViewPoint('test', 'sheet1', 'protected-6-1').id,
                true
            );
            expect(await fill()).toBe(true);
        });

        it.each([
            { definition: '=$B$7', protectedSheet: 'sheet1', permitted: false },
            { definition: '=$B$7', protectedSheet: 'sheet2', permitted: true },
            { definition: '$B$7', protectedSheet: 'sheet1', permitted: false },
            { definition: '=PrivateAlias', protectedSheet: 'sheet1', permitted: false },
            { definition: '=sheet2!$B$7', protectedSheet: 'sheet1', permitted: true },
            { definition: '=sheet2!$B$7', protectedSheet: 'sheet2', permitted: false },
        ])('checks qualified names in their evaluation context ($definition, $protectedSheet)', async ({ definition, protectedSheet, permitted }) => {
            commandService.syncExecuteCommand(InsertSheetMutation.id, {
                unitId: 'test',
                index: 1,
                sheet: mergeWorksheetSnapshotWithDefault({
                    id: 'sheet2',
                    name: 'sheet2',
                    cellData: { 6: { 1: { v: 'other sheet value' } } },
                }),
            });
            const definedNames = testBed.injector.get(IDefinedNamesService);
            definedNames.registerDefinedName('test', {
                id: 'qualified-private',
                name: 'QualifiedPrivate',
                formulaOrRefString: definition,
            });
            definedNames.registerDefinedName('test', {
                id: 'private-alias',
                name: 'PrivateAlias',
                formulaOrRefString: '=$B$7',
            });
            setCells({ 4: { 2: { f: '=sheet2!QualifiedPrivate' } } });
            protect(6, 1, false, protectedSheet);
            const before = Tools.deepClone(workbook.getSnapshot());
            expect(await fill()).toBe(permitted);
            if (!permitted) {
                expect(workbook.getSnapshot()).toEqual(before);
            }
        });

        it.each([
            { formula: '=sheet2!ScopedCell', localIsHidden: false },
            { formula: '=sheet2!ScopedCell', localIsHidden: true },
            { formula: '=sheet2!QualifiedPrivate', localIsHidden: false },
            { formula: '=sheet2!QualifiedPrivate', localIsHidden: true },
        ])('resolves qualified names in the target sheet scope ($formula, $localIsHidden)', async ({ formula, localIsHidden }) => {
            commandService.syncExecuteCommand(InsertSheetMutation.id, {
                unitId: 'test',
                index: 1,
                sheet: mergeWorksheetSnapshotWithDefault({ id: 'sheet2', name: 'sheet2' }),
            });
            const definedNames = testBed.injector.get(IDefinedNamesService);
            definedNames.registerDefinedName('test', {
                id: 'qualified-private',
                name: 'QualifiedPrivate',
                formulaOrRefString: '=ScopedCell',
            });
            definedNames.registerDefinedName('test', {
                id: 'workbook-cell',
                name: 'ScopedCell',
                formulaOrRefString: localIsHidden ? '=$B$5' : '=$B$7',
            });
            definedNames.registerDefinedName('test', {
                id: 'local-cell',
                name: 'ScopedCell',
                localSheetId: 'sheet1',
                formulaOrRefString: localIsHidden ? '=$B$7' : '=$B$5',
            });
            setCells({ 4: { 2: { f: formula } } });
            protect(6, 1);
            expect(await fill()).toBe(!localIsHidden);
        });

        it.each([undefined, 'sheet1'].flatMap((localSheetId) =>
            [false, true].map((canView) => ({ localSheetId, canView }))
        ))('checks names with a missing sheet prefix ($localSheetId, viewable: $canView)', async ({ localSheetId, canView }) => {
            testBed.injector.get(IDefinedNamesService).registerDefinedName('test', {
                id: 'hidden-global',
                name: 'HiddenGlobal',
                formulaOrRefString: '=sheet1!$B$7',
                localSheetId,
            });
            setCells({ 4: { 2: { f: '=MissingSheet!HiddenGlobal' } } });
            protect(6, 1, canView);
            const before = snapshot();
            const permitted = canView || localSheetId === 'sheet1';
            expect(await fill()).toBe(permitted);
            if (!permitted) {
                expect(snapshot()).toEqual(before);
            }
        });

        it.each(['external-book', 'Source.xlsx', 'source.XLSX', 'SOURCE'].flatMap((qualifier) =>
            [false, true].map((canView) => ({ qualifier, canView }))
        ))('checks workbook references by ID or name ($qualifier, viewable: $canView)', async ({ qualifier, canView }) => {
            testBed.univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
                id: 'external-book',
                name: 'Source.xlsx',
                locale: LocaleType.EN_US,
                appVersion: '1',
                sheets: { source: mergeWorksheetSnapshotWithDefault({ id: 'source', name: 'source' }) },
                sheetOrder: ['source'],
                styles: {},
            });
            protect(6, 1, canView, 'source', 'external-book');
            setCells({ 4: { 2: { f: `=[${qualifier}]source!$B$7` } } });
            const before = snapshot();
            expect(await fill()).toBe(canView);
            if (!canView) {
                expect(snapshot()).toEqual(before);
            }
        });

        it.each([
            { qualifier: 'Source.xlsx', permitted: false },
            { qualifier: 'Source', permitted: true },
        ])('preserves exact-name precedence and rejects ambiguous workbook resolution ($qualifier)', async ({ qualifier, permitted }) => {
            for (const [id, name] of [['external-book', 'Source.xlsx'], ['other-book', 'Source.xls']]) {
                testBed.univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
                    id,
                    name,
                    locale: LocaleType.EN_US,
                    appVersion: '1',
                    sheets: { source: mergeWorksheetSnapshotWithDefault({ id: 'source', name: 'source' }) },
                    sheetOrder: ['source'],
                    styles: {},
                });
            }
            protect(6, 1, false, 'source', 'external-book');
            setCells({ 4: { 2: { f: `=[${qualifier}]source!$B$7` } } });
            expect(await fill()).toBe(permitted);
        });

        it('closes the previous fill menu when a new drag is rejected and allows a subsequent fill', async () => {
            protect(16, 1);
            const original = snapshot();
            expect(await fill()).toBe(true);
            const autoFillService = testBed.injector.get(IAutoFillService);
            const menuStates: boolean[] = [];
            const subscription = autoFillService.showMenu$.subscribe((show) => menuStates.push(show));
            const before = snapshot();
            const undoRedoService = testBed.injector.get(IUndoRedoService);
            const history = undoRedoService.getUndoRedoStatus('test');
            const selectionService = testBed.injector.get(SheetsSelectionsService);
            const selections = Tools.deepClone(selectionService.getCurrentSelections());
            const source = { startRow: 4, endRow: 14, startColumn: 2, endColumn: 2 };

            expect(await fill(AUTO_FILL_APPLY_TYPE.COPY, source, { ...source, endRow: 24 })).toBe(false);
            expect(menuStates[menuStates.length - 1]).toBe(false);
            expect(snapshot()).toEqual(before);
            expect(undoRedoService.getUndoRedoStatus('test')).toEqual(history);
            expect(selectionService.getCurrentSelections()).toEqual(selections);

            expect(await fill(AUTO_FILL_APPLY_TYPE.COPY, source, { ...source, endRow: 15 })).toBe(true);
            const after = snapshot();
            expect(menuStates[menuStates.length - 1]).toBe(true);
            subscription.unsubscribe();
            expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
            expect(snapshot()).toEqual(before);
            expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
            expect(snapshot()).toEqual(original);
            expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
            expect(snapshot()).toEqual(before);
            expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
            expect(snapshot()).toEqual(after);
        });

        it('checks nested names when entering a formula directly', async () => {
            testBed.injector.get(IDefinedNamesService).registerDefinedName('test', {
                id: 'private-cell',
                name: 'PrivateCell',
                formulaOrRefString: 'sheet1!$B$7',
            });
            protect(6, 1);
            const before = snapshot();
            expect(await commandService.executeCommand(SetRangeValuesCommand.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                range: { startRow: 5, endRow: 5, startColumn: 2, endColumn: 2 },
                value: { f: '=SUM(PrivateCell)' },
            })).toBe(false);
            expect(snapshot()).toEqual(before);
        });

        it.each([
            { definition: 'sheet1!B1', row: 6, column: 3 },
            { definition: 'sheet1!$B1', row: 6, column: 1 },
            { definition: 'sheet1!B$1', row: 0, column: 3 },
        ])('resolves relative named references at each target cell ($definition)', async ({ definition, row, column }) => {
            testBed.injector.get(IDefinedNamesService).registerDefinedName('test', {
                id: 'relative-cell',
                name: 'RelativeCell',
                formulaOrRefString: definition,
                localSheetId: 'sheet1',
            });
            setCells({ 4: { 2: { f: '=RelativeCell' } } });
            protect(row, column);
            const before = snapshot();
            expect(await fill()).toBe(false);
            expect(snapshot()).toEqual(before);
        });

        it.each([false, true])('uses the sheet-local name before the workbook name (%s)', async (localIsHidden) => {
            const definedNames = testBed.injector.get(IDefinedNamesService);
            definedNames.registerDefinedName('test', {
                id: 'workbook-cell',
                name: 'ScopedCell',
                formulaOrRefString: localIsHidden ? 'sheet1!$B$5' : 'sheet1!$B$7',
            });
            definedNames.registerDefinedName('test', {
                id: 'local-cell',
                name: 'ScopedCell',
                localSheetId: 'sheet1',
                formulaOrRefString: localIsHidden ? 'sheet1!$B$7' : 'sheet1!$B$5',
            });
            setCells({ 4: { 2: { f: '=SUM(ScopedCell)' } } });
            protect(6, 1);
            expect(await fill()).toBe(!localIsHidden);
        });

        it.each([false, true])('terminates circular names while checking other references (%s)', async (hasHiddenReference) => {
            const definedNames = testBed.injector.get(IDefinedNamesService);
            definedNames.registerDefinedName('test', {
                id: 'circular-a',
                name: 'CircularA',
                formulaOrRefString: '=CircularB',
            });
            definedNames.registerDefinedName('test', {
                id: 'circular-b',
                name: 'CircularB',
                formulaOrRefString: '=CircularA',
            });
            setCells({ 4: { 2: { f: hasHiddenReference ? '=SUM(CircularA,$B$7)' : '=CircularA' } } });
            protect(6, 1);
            expect(await fill()).toBe(!hasHiddenReference);
        });

        it('checks the current name definition when refilling a cached formula', async () => {
            const definedNames = testBed.injector.get(IDefinedNamesService);
            const name = { id: 'changing-cell', name: 'ChangingCell', formulaOrRefString: 'sheet1!$B$5' };
            definedNames.registerDefinedName('test', name);
            setCells({ 4: { 2: { f: '=ChangingCell' } } });
            protect(6, 1);
            expect(await fill()).toBe(true);
            const before = snapshot();
            definedNames.registerDefinedName('test', { ...name, formulaOrRefString: 'sheet1!$B$7' });
            expect(await commandService.executeCommand(RefillCommand.id, { type: AUTO_FILL_APPLY_TYPE.COPY })).toBe(false);
            expect(snapshot()).toEqual(before);
        });

        it.each([true, false])('preserves source order after a rejected refill (vertical: %s)', async (vertical) => {
            const source: IRange = vertical
                ? { startRow: 6, endRow: 8, startColumn: 2, endColumn: 2 }
                : { startRow: 4, endRow: 4, startColumn: 6, endColumn: 8 };
            const target: IRange = vertical ? { ...source, startRow: 3 } : { ...source, startColumn: 3 };
            setCells(vertical
                ? {
                    6: { 2: { v: 'first', s: { bl: BooleanNumber.TRUE } } },
                    7: { 2: { v: 'second', s: { it: BooleanNumber.TRUE } } },
                    8: { 2: { f: '=B9' } },
                }
                : {
                    4: {
                        6: { v: 'first', s: { bl: BooleanNumber.TRUE } },
                        7: { v: 'second', s: { it: BooleanNumber.TRUE } },
                        8: { f: '=I4' },
                    },
                });
            protect(vertical ? 5 : 3, vertical ? 1 : 5);
            const original = snapshot();
            expect(await fill(AUTO_FILL_APPLY_TYPE.ONLY_FORMAT, source, target)).toBe(true);
            const before = snapshot();
            expect(await commandService.executeCommand(RefillCommand.id, { type: AUTO_FILL_APPLY_TYPE.COPY })).toBe(false);
            expect(snapshot()).toEqual(before);
            expect(await commandService.executeCommand(RefillCommand.id, { type: AUTO_FILL_APPLY_TYPE.ONLY_FORMAT })).toBe(true);
            expect(snapshot()).toEqual(before);
            expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
            expect(snapshot()).toEqual(original);
            expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
            expect(snapshot()).toEqual(before);
        });

        it.each(['=$B$5', '=B$5'])('allows fixed references that remain viewable (%s)', async (formula) => {
            setCells({ 4: { 2: { f: formula } } });
            protect(6, 1);
            expect(await fill()).toBe(true);
            expect(messages).toEqual([]);
        });

        it('allows viewable read-only references and preserves undo/redo', async () => {
            protect(4, 1, true);
            protect(6, 1, true);
            const before = snapshot();
            expect(await fill()).toBe(true);
            const after = snapshot();
            expect(testBed.injector.get(FormulaDataModel).getFormulaStringByCell(6, 2, 'sheet1', 'test')).toBe('=B7');
            expect(messages).toEqual([]);
            expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
            expect(snapshot()).toEqual(before);
            expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
            expect(snapshot()).toEqual(after);
        });

        it('allows format-only filling and preserves it when a refill is rejected', async () => {
            protect(6, 1);
            expect(await fill(AUTO_FILL_APPLY_TYPE.ONLY_FORMAT)).toBe(true);
            const autoFillService = testBed.injector.get(IAutoFillService);
            const applyTypes: AUTO_FILL_APPLY_TYPE[] = [];
            const subscription = autoFillService.applyType$.subscribe((applyType) => applyTypes.push(applyType));
            const before = snapshot();
            const undoRedoService = testBed.injector.get(IUndoRedoService);
            const history = undoRedoService.getUndoRedoStatus('test');
            const selectionService = testBed.injector.get(SheetsSelectionsService);
            const selections = Tools.deepClone(selectionService.getCurrentSelections());

            const result = await commandService.executeCommand(RefillCommand.id, { type: AUTO_FILL_APPLY_TYPE.COPY });
            subscription.unsubscribe();
            expect(result).toBe(false);
            expect(snapshot()).toEqual(before);
            expect(undoRedoService.getUndoRedoStatus('test')).toEqual(history);
            expect(selectionService.getCurrentSelections()).toEqual(selections);
            expect(autoFillService.applyType).toBe(AUTO_FILL_APPLY_TYPE.ONLY_FORMAT);
            expect(applyTypes).toEqual([AUTO_FILL_APPLY_TYPE.ONLY_FORMAT]);
            expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
            expect(workbook.getActiveSheet().getCellRaw(6, 2)?.v).toBe('existing target');
        });

        it('restores the original values when switching a valid fill to format-only', async () => {
            const before = snapshot();
            expect(await fill()).toBe(true);
            expect(await commandService.executeCommand(RefillCommand.id, { type: AUTO_FILL_APPLY_TYPE.ONLY_FORMAT })).toBe(true);
            expect(workbook.getActiveSheet().getCellRaw(6, 2)?.v).toBe('existing target');
            const after = snapshot();
            expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
            expect(snapshot()).toEqual(before);
            expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
            expect(snapshot()).toEqual(after);
        });
    });
});
