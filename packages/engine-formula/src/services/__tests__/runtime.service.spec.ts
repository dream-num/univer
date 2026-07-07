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

import type { ICellData, Nullable } from '@univerjs/core';
import type { BaseAstNode } from '../../engine/ast-node/base-ast-node';
import {
    ContextService,
    DesktopLogService,
    IContextService,
    ILogService,
    Injector,
    IUniverInstanceService,
    LocaleService,
    ObjectMatrix,
    UniverInstanceService,
} from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { ErrorType } from '../../basics/error-type';
import { LexerTreeBuilder } from '../../engine/analysis/lexer-tree-builder';
import { createNewArray } from '../../engine/utils/array-object';
import { NullValueObject, NumberValueObject, StringValueObject } from '../../engine/value-object/primitive-object';
import { FormulaDataModel } from '../../models/formula-data.model';
import { FormulaCurrentConfigService, IFormulaCurrentConfigService } from '../current-data.service';
import { HyperlinkEngineFormulaService, IHyperlinkEngineFormulaService } from '../hyperlink-engine-formula.service';
import { FormulaExecutedStateType, FormulaExecuteStageType, FormulaRuntimeService, IFormulaRuntimeService } from '../runtime.service';
import { ISheetRowFilteredService, SheetRowFilteredService } from '../sheet-row-filtered.service';

function createRuntimeService() {
    const unitDataMatrix = new ObjectMatrix<ICellData>();
    const arrayFormulaRange = {
        unit: {
            sheet: {},
        },
    };

    const injector = new Injector();
    injector.add([ILogService, { useClass: DesktopLogService }]);
    injector.add([IContextService, { useClass: ContextService }]);
    injector.add([IUniverInstanceService, { useClass: UniverInstanceService }]);
    injector.add([LocaleService]);
    injector.add([LexerTreeBuilder]);
    injector.add([FormulaDataModel]);
    injector.add([ISheetRowFilteredService, { useClass: SheetRowFilteredService }]);
    injector.add([IFormulaCurrentConfigService, { useClass: FormulaCurrentConfigService }]);
    injector.add([IHyperlinkEngineFormulaService, { useClass: HyperlinkEngineFormulaService }]);
    injector.add([IFormulaRuntimeService, { useClass: FormulaRuntimeService }]);
    const currentConfigService = injector.get(IFormulaCurrentConfigService);
    currentConfigService.load({
        allUnitData: {
            unit: {
                sheet: {
                    cellData: unitDataMatrix,
                    columnCount: 20,
                    columnData: {},
                    rowCount: 20,
                    rowData: {},
                },
            },
        },
        unitStylesData: {},
        unitSheetNameMap: { unit: { sheet: 'Sheet1' } },
        formulaData: {},
        arrayFormulaCellData: { unit: { sheet: {} } },
        arrayFormulaRange,
        forceCalculate: false,
        dirtyRanges: [],
        dirtyNameMap: {},
        dirtyDefinedNameMap: {},
        dirtyUnitFeatureMap: {},
        dirtyUnitOtherFormulaMap: {},
    });
    const runtime = injector.get(IFormulaRuntimeService) as FormulaRuntimeService;

    return {
        runtime,
        unitDataMatrix,
        arrayFormulaCellData: currentConfigService.getArrayFormulaCellData().unit!.sheet!,
        arrayFormulaRange,
    };
}

describe('FormulaRuntimeService', () => {
    it('should manage state, counters and cycle flags', () => {
        const { runtime } = createRuntimeService();

        runtime.enableCycleDependency();
        expect(runtime.isCycleDependency()).toBe(true);
        runtime.disableCycleDependency();
        expect(runtime.isCycleDependency()).toBe(false);

        runtime.setFormulaCycleIndex(2);
        expect(runtime.getFormulaCycleIndex()).toBe(2);

        runtime.setTotalFormulasToCalculate(10);
        runtime.setCompletedFormulasCount(3);
        runtime.setTotalArrayFormulasToCalculate(4);
        runtime.setCompletedArrayFormulasCount(1);
        expect(runtime.getRuntimeState()).toEqual({
            totalFormulasToCalculate: 10,
            completedFormulasCount: 3,
            totalArrayFormulasToCalculate: 4,
            completedArrayFormulasCount: 1,
            stage: FormulaExecuteStageType.IDLE,
            formulaCycleIndex: 2,
        });

        runtime.markedAsSuccessfullyExecuted();
        expect(runtime.getAllRuntimeData().functionsExecutedState).toBe(FormulaExecutedStateType.SUCCESS);
        runtime.markedAsNoFunctionsExecuted();
        expect(runtime.getAllRuntimeData().functionsExecutedState).toBe(FormulaExecutedStateType.NOT_EXECUTED);
        runtime.markedAsStopFunctionsExecuted();
        expect(runtime.getAllRuntimeData().functionsExecutedState).toBe(FormulaExecutedStateType.STOP_EXECUTION);
        runtime.markedAsInitialFunctionsExecuted();
        expect(runtime.getAllRuntimeData().functionsExecutedState).toBe(FormulaExecutedStateType.INITIAL);

        runtime.setFormulaExecuteStage(FormulaExecuteStageType.CURRENTLY_CALCULATING);
        expect(runtime.getFormulaExecuteStage()).toBe(FormulaExecuteStageType.CURRENTLY_CALCULATING);
        runtime.stopExecution();
        expect(runtime.isStopExecution()).toBe(true);
        expect(runtime.getFormulaExecuteStage()).toBe(FormulaExecuteStageType.IDLE);

        runtime.reset();
        expect(runtime.isStopExecution()).toBe(false);
        expect(runtime.getTotalFormulasToCalculate()).toBe(0);
        expect(runtime.getCompletedFormulasCount()).toBe(0);
    });

    it('should manage current context and lambda privacy vars', () => {
        const { runtime } = createRuntimeService();
        runtime.setCurrent(6, 7, 99, 88, 'sheet', 'unit');

        expect(runtime.currentRow).toBe(6);
        expect(runtime.currentColumn).toBe(7);
        expect(runtime.currentRowCount).toBe(99);
        expect(runtime.currentColumnCount).toBe(88);
        expect(runtime.currentSubUnitId).toBe('sheet');
        expect(runtime.currentUnitId).toBe('unit');

        const lambdaVar = new Map<string, Nullable<BaseAstNode>>([['x', null]]);
        runtime.registerFunctionDefinitionPrivacyVar('lambda-1', lambdaVar);
        expect(runtime.getFunctionDefinitionPrivacyVar('lambda-1')).toBe(lambdaVar);
        runtime.clearFunctionDefinitionPrivacyVar();
        expect(runtime.getFunctionDefinitionPrivacyVar('lambda-1')).toBeUndefined();
    });

    it('should collect runtime other-data for scalar and array values', () => {
        const { runtime } = createRuntimeService();
        runtime.setCurrent(1, 1, 20, 20, 'sheet', 'unit');

        runtime.setRuntimeOtherData('f1', 2, 3, NumberValueObject.create(9) as never);
        expect(runtime.getRuntimeOtherData().unit?.sheet?.f1?.[3]?.[2]?.[0]?.[0]?.v).toBe(9);

        const array = createNewArray(
            [[NumberValueObject.create(1), NumberValueObject.create(2)]],
            1,
            2
        );
        runtime.setRuntimeOtherData('f2', 0, 0, array as never);
        expect(runtime.getRuntimeOtherData().unit?.sheet?.f2?.[0]?.[0]?.[0]?.[1]?.v).toBe(2);
    });

    it('should set runtime scalar values and image metadata', () => {
        const { runtime } = createRuntimeService();
        runtime.setCurrent(2, 3, 50, 50, 'sheet', 'unit');

        runtime.setRuntimeData(NumberValueObject.create(7) as never);
        expect(runtime.getUnitData().unit?.sheet?.getValue(2, 3)?.v).toBe(7);
        expect(runtime.getRuntimeClearArrayFormulaCellData().unit?.sheet?.getValue(2, 3)?.v).toBe(7);

        const imageValue = StringValueObject.create('', {
            isImage: true,
            imageInfo: {
                source: 'https://img',
                altText: 'demo',
                sizing: 1,
                height: 10,
                width: 20,
            },
        });
        runtime.setRuntimeData(imageValue as never);
        expect(runtime.getRuntimeImageFormulaData()).toEqual([
            {
                source: 'https://img',
                altText: 'demo',
                sizing: 1,
                height: 10,
                width: 20,
                unitId: 'unit',
                sheetId: 'sheet',
                row: 2,
                column: 3,
            },
        ]);
    });

    it('should set runtime hyperlink values via hyperlink service', () => {
        const { runtime } = createRuntimeService();
        runtime.setCurrent(0, 0, 10, 10, 'sheet', 'unit');

        const hyperlinkValue = StringValueObject.create('Open', {
            isHyperlink: true,
            hyperlinkUrl: 'https://example.com',
        });
        runtime.setRuntimeData(hyperlinkValue as never);

        const cell = runtime.getUnitData().unit?.sheet?.getValue(0, 0);
        expect(cell?.p?.body?.dataStream).toBe('Open\r\n');
        expect(cell?.p?.body?.customRanges?.[0]?.properties?.url).toBe('https://example.com');
    });

    it('should handle single-cell and normal array spill write', () => {
        const { runtime } = createRuntimeService();

        runtime.setCurrent(1, 1, 10, 10, 'sheet', 'unit');
        const oneCellArray = createNewArray([[NumberValueObject.create(5)]], 1, 1);
        runtime.setRuntimeData(oneCellArray as never);
        expect(runtime.getUnitData().unit?.sheet?.getValue(1, 1)?.v).toBe(5);

        runtime.setCurrent(2, 2, 10, 10, 'sheet', 'unit');
        const blankOneCellArray = createNewArray([[NullValueObject.create()]], 1, 1);
        runtime.setRuntimeData(blankOneCellArray as never);
        expect(runtime.getUnitData().unit?.sheet?.getValue(2, 2)?.v).toBe(0);

        runtime.setCurrent(3, 3, 10, 10, 'sheet', 'unit');
        const twoByTwo = createNewArray(
            [
                [NumberValueObject.create(11), NumberValueObject.create(12)],
                [NumberValueObject.create(21), NumberValueObject.create(22)],
            ],
            2,
            2
        );
        runtime.setRuntimeData(twoByTwo as never);

        expect(runtime.getUnitArrayFormula().unit?.sheet?.[3]?.[3]).toEqual({
            startRow: 3,
            startColumn: 3,
            endRow: 4,
            endColumn: 4,
        });
        expect(runtime.getUnitData().unit?.sheet?.getValue(3, 3)?.v).toBe(11);
        expect(runtime.getRuntimeArrayFormulaCellData().unit?.sheet?.getValue(4, 4)?.v).toBe(22);
    });

    it('should return #SPILL when array exceeds worksheet boundary', () => {
        const { runtime } = createRuntimeService();
        runtime.setCurrent(9, 9, 10, 10, 'sheet', 'unit');
        const twoByTwo = createNewArray(
            [
                [NumberValueObject.create(1), NumberValueObject.create(2)],
                [NumberValueObject.create(3), NumberValueObject.create(4)],
            ],
            2,
            2
        );

        runtime.setRuntimeData(twoByTwo as never);
        expect(runtime.getUnitData().unit?.sheet?.getValue(9, 9)?.v).toBe(ErrorType.SPILL);
        expect(runtime.getRuntimeArrayFormulaCellData().unit?.sheet?.getValue(9, 9)?.v).toBe(ErrorType.SPILL);
    });

    it('should return #VALUE when a declared single-cell array formula produces multiple cells', () => {
        const { runtime, arrayFormulaRange } = createRuntimeService();
        arrayFormulaRange.unit.sheet = {
            1: {
                1: {
                    startRow: 1,
                    startColumn: 1,
                    endRow: 1,
                    endColumn: 1,
                },
            },
        };

        runtime.setCurrent(1, 1, 10, 10, 'sheet', 'unit');
        const twoByTwo = createNewArray(
            [
                [NumberValueObject.create(1), NumberValueObject.create(2)],
                [NumberValueObject.create(3), NumberValueObject.create(4)],
            ],
            2,
            2
        );

        runtime.setRuntimeData(twoByTwo as never);
        expect(runtime.getUnitData().unit?.sheet?.getValue(1, 1)?.v).toBe(ErrorType.VALUE);
        expect(runtime.getRuntimeClearArrayFormulaCellData().unit?.sheet?.getValue(1, 1)?.v).toBe(ErrorType.VALUE);
        expect(runtime.getRuntimeArrayFormulaCellData().unit?.sheet?.getValue(1, 1)?.v).toBe(ErrorType.VALUE);
        expect(runtime.getRuntimeArrayFormulaCellData().unit?.sheet?.getValue(1, 2)).toBeUndefined();
    });

    it('should not treat previous cells of the same array formula as spill blockers', () => {
        const { runtime, unitDataMatrix, arrayFormulaCellData, arrayFormulaRange } = createRuntimeService();
        arrayFormulaRange.unit.sheet = {
            3: {
                3: {
                    startRow: 3,
                    startColumn: 3,
                    endRow: 4,
                    endColumn: 4,
                },
            },
        };
        unitDataMatrix.setValue(3, 4, { v: 12 });
        arrayFormulaCellData.setValue(3, 4, { v: 12 });

        runtime.setCurrent(3, 3, 10, 10, 'sheet', 'unit');
        const twoByTwo = createNewArray(
            [
                [NumberValueObject.create(11), NumberValueObject.create(12)],
                [NumberValueObject.create(21), NumberValueObject.create(22)],
            ],
            2,
            2
        );

        runtime.setRuntimeData(twoByTwo as never);
        expect(runtime.getUnitData().unit?.sheet?.getValue(3, 3)?.v).toBe(11);
        expect(runtime.getRuntimeArrayFormulaCellData().unit?.sheet?.getValue(3, 4)?.v).toBe(12);
    });

    it('should return #SPILL when a real value is entered into the previous array formula range', () => {
        const { runtime, unitDataMatrix, arrayFormulaCellData, arrayFormulaRange } = createRuntimeService();
        arrayFormulaRange.unit.sheet = {
            3: {
                3: {
                    startRow: 3,
                    startColumn: 3,
                    endRow: 4,
                    endColumn: 4,
                },
            },
        };
        unitDataMatrix.setValue(3, 4, { v: 12 });
        unitDataMatrix.setValue(4, 3, { v: 21 });
        unitDataMatrix.setValue(4, 4, { v: 111 });
        arrayFormulaCellData.setValue(3, 3, { v: 11 });
        arrayFormulaCellData.setValue(3, 4, { v: 12 });
        arrayFormulaCellData.setValue(4, 3, { v: 21 });

        runtime.setCurrent(3, 3, 10, 10, 'sheet', 'unit');
        const twoByTwo = createNewArray(
            [
                [NumberValueObject.create(11), NumberValueObject.create(12)],
                [NumberValueObject.create(21), NumberValueObject.create(22)],
            ],
            2,
            2
        );

        runtime.setRuntimeData(twoByTwo as never);
        expect(runtime.getUnitData().unit?.sheet?.getValue(3, 3)?.v).toBe(ErrorType.SPILL);
        expect(runtime.getUnitData().unit?.sheet?.getValue(3, 4)).toBeNull();
        expect(runtime.getUnitData().unit?.sheet?.getValue(4, 3)).toBeNull();
        expect(runtime.getUnitData().unit?.sheet?.getValue(4, 4)?.v).toBe(111);
        expect(runtime.getRuntimeArrayFormulaCellData().unit?.sheet?.getValue(3, 3)?.v).toBe(ErrorType.SPILL);
        expect(runtime.getRuntimeArrayFormulaCellData().unit?.sheet?.getValue(4, 4)).toBeUndefined();
    });

    it('should not mark real spill blockers as array formula cell data', () => {
        const { runtime, unitDataMatrix, arrayFormulaCellData, arrayFormulaRange } = createRuntimeService();
        arrayFormulaRange.unit.sheet = {
            3: {
                3: {
                    startRow: 3,
                    startColumn: 3,
                    endRow: 4,
                    endColumn: 4,
                },
            },
        };
        unitDataMatrix.setValue(3, 4, { v: 12 });
        unitDataMatrix.setValue(4, 3, { v: 222 });
        unitDataMatrix.setValue(4, 4, { v: 111 });
        arrayFormulaCellData.setValue(3, 3, { v: ErrorType.SPILL });
        arrayFormulaCellData.setValue(3, 4, { v: 12 });

        runtime.setCurrent(3, 3, 10, 10, 'sheet', 'unit');
        const twoByTwo = createNewArray(
            [
                [NumberValueObject.create(11), NumberValueObject.create(12)],
                [NumberValueObject.create(21), NumberValueObject.create(22)],
            ],
            2,
            2
        );

        runtime.setRuntimeData(twoByTwo as never);
        expect(runtime.getUnitData().unit?.sheet?.getValue(3, 3)?.v).toBe(ErrorType.SPILL);
        expect(runtime.getUnitData().unit?.sheet?.getValue(3, 4)).toBeNull();
        expect(runtime.getUnitData().unit?.sheet?.getValue(4, 3)?.v).toBe(222);
        expect(runtime.getUnitData().unit?.sheet?.getValue(4, 4)?.v).toBe(111);
        expect(runtime.getRuntimeArrayFormulaCellData().unit?.sheet?.getValue(3, 3)?.v).toBe(ErrorType.SPILL);
        expect(runtime.getRuntimeArrayFormulaCellData().unit?.sheet?.getValue(4, 3)).toBeUndefined();
        expect(runtime.getRuntimeArrayFormulaCellData().unit?.sheet?.getValue(4, 4)).toBeUndefined();
    });

    it('should preserve a real blocker even when stale array formula cell data still has the edited cell', () => {
        const { runtime, unitDataMatrix, arrayFormulaCellData, arrayFormulaRange } = createRuntimeService();
        arrayFormulaRange.unit.sheet = {
            3: {
                3: {
                    startRow: 3,
                    startColumn: 3,
                    endRow: 4,
                    endColumn: 4,
                },
            },
        };
        unitDataMatrix.setValue(3, 4, { v: 12 });
        unitDataMatrix.setValue(4, 3, { v: 222 });
        arrayFormulaCellData.setValue(3, 3, { v: 11 });
        arrayFormulaCellData.setValue(3, 4, { v: 12 });
        arrayFormulaCellData.setValue(4, 3, { v: 21 });

        runtime.setCurrent(3, 3, 10, 10, 'sheet', 'unit');
        const twoByTwo = createNewArray(
            [
                [NumberValueObject.create(11), NumberValueObject.create(12)],
                [NumberValueObject.create(21), NumberValueObject.create(22)],
            ],
            2,
            2
        );

        runtime.setRuntimeData(twoByTwo as never);
        expect(runtime.getUnitData().unit?.sheet?.getValue(3, 3)?.v).toBe(ErrorType.SPILL);
        expect(runtime.getUnitData().unit?.sheet?.getValue(3, 4)).toBeNull();
        expect(runtime.getUnitData().unit?.sheet?.getValue(4, 3)?.v).toBe(222);
        expect(runtime.getRuntimeArrayFormulaCellData().unit?.sheet?.getValue(3, 3)?.v).toBe(ErrorType.SPILL);
        expect(runtime.getRuntimeArrayFormulaCellData().unit?.sheet?.getValue(4, 3)).toBeUndefined();
    });

    it('should manage feature caches and embedded map', () => {
        const { runtime } = createRuntimeService();
        runtime.setCurrent(4, 5, 20, 20, 'sheet', 'unit');
        runtime.setUnitArrayFormulaEmbeddedMap();
        expect(runtime.getUnitArrayFormulaEmbeddedMap().unit?.sheet?.[4]?.[5]).toBe(true);

        runtime.setRuntimeFeatureRange('feature-a', { unit: { sheet: [] } } as never);
        runtime.setRuntimeFeatureCellData('feature-a', { unit: {} } as never);
        runtime.setDependencyTreeModelData([{ treeId: 1 } as never]);

        expect(runtime.getRuntimeFeatureRange()['feature-a']).toEqual({ unit: { sheet: [] } });
        expect(runtime.getRuntimeFeatureCellData()['feature-a']).toEqual({ unit: {} });
        expect(runtime.getDependencyTreeModelData()).toEqual([{ treeId: 1 }]);
    });

    it('should dispose and clear runtime feature caches', () => {
        const { runtime } = createRuntimeService();
        runtime.setRuntimeFeatureRange('feature-a', { unit: {} } as never);
        runtime.setRuntimeFeatureCellData('feature-a', { unit: {} } as never);
        runtime.dispose();
        expect(runtime.getRuntimeFeatureRange()).toEqual({});
        expect(runtime.getRuntimeFeatureCellData()).toEqual({});
    });
});
