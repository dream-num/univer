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

import type { Injector, Univer } from '@univerjs/core';
import type { ISetRangeValuesMutationParams } from '@univerjs/sheets';
import { ICommandService } from '@univerjs/core';
import { FormulaDataModel } from '@univerjs/engine-formula';
import { DeviceInputEventType } from '@univerjs/engine-render';
import {
    BEFORE_CELL_EDIT,
    SetRangeValuesMutation,
    SheetInterceptorService,
} from '@univerjs/sheets';
import { IEditorBridgeService, SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FormulaEditorShowController } from '../formula-editor-show.controller';
import { createCommandTestBed } from './create-command-test-bed';

type EditLocation = NonNullable<ReturnType<IEditorBridgeService['getEditLocation']>>;

let activeUniver: Univer | null = null;

function createEditLocation(isInArrayFormulaRange = false): EditLocation {
    return {
        unitId: 'test',
        sheetId: 'sheet1',
        row: 1,
        column: 1,
        isInArrayFormulaRange,
    } as EditLocation;
}

function createControllerTestBed(editLocation = createEditLocation()) {
    let injector: Injector;
    const renderContext = {
        unitId: 'test',
        scene: {
            onTransformChange$: {
                subscribeEvent: () => ({ dispose: vi.fn() }),
            },
        },
    };
    const createSheetSkeletonManagerService = () =>
        injector.createInstance(SheetSkeletonManagerService, renderContext as never);
    const createFormulaEditorShowController = () =>
        injector.createInstance(FormulaEditorShowController, renderContext as never);
    const testBed = createCommandTestBed(undefined, [
        [
            SheetSkeletonManagerService,
            { useFactory: createSheetSkeletonManagerService },
        ],
        [
            FormulaEditorShowController,
            { useFactory: createFormulaEditorShowController },
        ],
    ]);
    activeUniver = testBed.univer;
    injector = testBed.univer.__getInjector();
    testBed.sheet.addWorksheet('sheet2', 1, { id: 'sheet2', name: 'Sheet2', cellData: {} });

    const commandService = testBed.get(ICommandService);
    commandService.registerCommand(SetRangeValuesMutation);

    const editorBridgeService = testBed.get(IEditorBridgeService);
    vi.spyOn(editorBridgeService, 'getEditLocation').mockReturnValue(editLocation);
    testBed.get(FormulaEditorShowController);

    return {
        commandService,
        editorBridgeService,
        formulaDataModel: testBed.get(FormulaDataModel),
        get: testBed.get,
        injector,
        refreshEditCellState: vi.spyOn(editorBridgeService, 'refreshEditCellState'),
        sheet: testBed.sheet,
        sheetInterceptorService: testBed.get(SheetInterceptorService),
    };
}

function createSetRangeValuesParams(subUnitId = 'sheet1'): ISetRangeValuesMutationParams {
    return {
        unitId: 'test',
        subUnitId,
        cellValue: {
            0: {
                1: { v: 2 },
            },
        },
    };
}

function setSpillCellData(formulaDataModel: FormulaDataModel): void {
    formulaDataModel.setArrayFormulaCellData({
        test: {
            sheet1: {
                1: {
                    1: { v: 2 },
                },
            },
        },
    });
}

afterEach(() => {
    activeUniver?.dispose();
    activeUniver = null;
});

describe('FormulaEditorShowController', () => {
    it('preserves the formula string when starting to edit a calculated formula cell', () => {
        const testBed = createControllerTestBed();
        const worksheet = testBed.sheet.getSheetBySheetId('sheet1');
        if (worksheet == null) {
            throw new Error('Expected sheet1 to exist');
        }

        const result = testBed.sheetInterceptorService.writeCellInterceptor
            .fetchThroughInterceptors(BEFORE_CELL_EDIT)(
                { v: 3 },
                {
                    row: 0,
                    col: 1,
                    unitId: 'test',
                    subUnitId: 'sheet1',
                    worksheet,
                    workbook: testBed.sheet,
                    origin: worksheet.getCellRaw(0, 1),
                }
            );

        expect(result).toEqual({ v: 3, f: '=SUM(A1)' });
    });

    it('passes an empty edit value through unchanged', () => {
        const testBed = createControllerTestBed();
        const worksheet = testBed.sheet.getSheetBySheetId('sheet1');
        if (worksheet == null) {
            throw new Error('Expected sheet1 to exist');
        }

        const result = testBed.sheetInterceptorService.writeCellInterceptor
            .fetchThroughInterceptors(BEFORE_CELL_EDIT)(
                null,
                {
                    row: 0,
                    col: 1,
                    unitId: 'test',
                    subUnitId: 'sheet1',
                    worksheet,
                    workbook: testBed.sheet,
                    origin: worksheet.getCellRaw(0, 1),
                }
            );

        expect(result).toBeNull();
    });

    it('refreshes when the current cell becomes a spill cell', async () => {
        const testBed = createControllerTestBed();
        setSpillCellData(testBed.formulaDataModel);

        const result = await testBed.commandService.executeCommand(
            SetRangeValuesMutation.id,
            createSetRangeValuesParams(),
            { applyFormulaCalculationResult: true }
        );

        expect(result).toBe(true);
        expect(testBed.refreshEditCellState).toHaveBeenCalledOnce();
    });

    it('refreshes when the current cell was a spill cell before its array data was removed', async () => {
        const testBed = createControllerTestBed(createEditLocation(true));

        const result = await testBed.commandService.executeCommand(
            SetRangeValuesMutation.id,
            createSetRangeValuesParams(),
            { applyFormulaCalculationResult: true }
        );

        expect(result).toBe(true);
        expect(testBed.refreshEditCellState).toHaveBeenCalledOnce();
    });

    it('does not refresh for a formula result on a non-spill cell', async () => {
        const testBed = createControllerTestBed();

        const result = await testBed.commandService.executeCommand(
            SetRangeValuesMutation.id,
            createSetRangeValuesParams(),
            { applyFormulaCalculationResult: true }
        );

        expect(result).toBe(true);
        expect(testBed.refreshEditCellState).not.toHaveBeenCalled();
    });

    it('does not refresh for an ordinary range value mutation', async () => {
        const testBed = createControllerTestBed();
        setSpillCellData(testBed.formulaDataModel);

        const result = await testBed.commandService.executeCommand(
            SetRangeValuesMutation.id,
            createSetRangeValuesParams()
        );

        expect(result).toBe(true);
        expect(testBed.refreshEditCellState).not.toHaveBeenCalled();
    });

    it('does not refresh for a formula result on another sheet', async () => {
        const testBed = createControllerTestBed();
        setSpillCellData(testBed.formulaDataModel);

        const result = await testBed.commandService.executeCommand(
            SetRangeValuesMutation.id,
            createSetRangeValuesParams('sheet2'),
            { applyFormulaCalculationResult: true }
        );

        expect(result).toBe(true);
        expect(testBed.refreshEditCellState).not.toHaveBeenCalled();
    });

    it('does not refresh while the editor is visible', async () => {
        const testBed = createControllerTestBed();
        setSpillCellData(testBed.formulaDataModel);
        testBed.editorBridgeService.changeVisible({
            visible: true,
            eventType: DeviceInputEventType.Dblclick,
            unitId: 'test',
        });

        const result = await testBed.commandService.executeCommand(
            SetRangeValuesMutation.id,
            createSetRangeValuesParams(),
            { applyFormulaCalculationResult: true }
        );

        expect(result).toBe(true);
        expect(testBed.refreshEditCellState).not.toHaveBeenCalled();
    });

    it('refreshes only for the controller associated with the result workbook', async () => {
        const testBed = createControllerTestBed();
        const otherWorkbookController = testBed.injector.createInstance(
            FormulaEditorShowController,
            { unitId: 'other' } as never
        );
        setSpillCellData(testBed.formulaDataModel);

        const result = await testBed.commandService.executeCommand(
            SetRangeValuesMutation.id,
            createSetRangeValuesParams(),
            { applyFormulaCalculationResult: true }
        );

        expect(result).toBe(true);
        expect(testBed.refreshEditCellState).toHaveBeenCalledOnce();
        otherWorkbookController.dispose();
    });
});
