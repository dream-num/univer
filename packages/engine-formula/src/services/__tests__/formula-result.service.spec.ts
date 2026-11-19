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

import { ICommandService, Injector, ObjectMatrix } from '@univerjs/core';
import { describe, expect, it, onTestFinished, vi } from 'vitest';
import type { ISetFormulaCalculationResultMutation } from '../../commands/mutations/set-formula-calculation.mutation';
import type { IAllRuntimeData } from '../runtime.service';
import { SetArrayFormulaDataMutation } from '../../commands/mutations/set-array-formula-data.mutation';
import { SetFormulaCalculationResultMutation, SetFormulaDependencyCalculationResultMutation } from '../../commands/mutations/set-formula-calculation.mutation';
import { SetImageFormulaDataMutation } from '../../commands/mutations/set-image-formula-data.mutation';
import { FormulaDataModel } from '../../models/formula-data.model';
import { FormulaResultService } from '../formula-result.service';
import { FormulaExecutedStateType, IFormulaRuntimeService } from '../runtime.service';

function createTestBed() {
    const command = { executeCommand: vi.fn<ICommandService['executeCommand']>().mockResolvedValue(true) };
    const model = {
        clearPreviousArrayFormulaCellData: vi.fn(),
        mergeArrayFormulaCellData: vi.fn(),
        mergeArrayFormulaRange: vi.fn(),
        getArrayFormulaRange: () => ({}),
        getArrayFormulaCellData: () => ({}),
    } satisfies Pick<FormulaDataModel, 'clearPreviousArrayFormulaCellData' | 'mergeArrayFormulaCellData' | 'mergeArrayFormulaRange' | 'getArrayFormulaRange' | 'getArrayFormulaCellData'>;
    const runtime = { isStopExecution: vi.fn(() => false) } satisfies Pick<IFormulaRuntimeService, 'isStopExecution'>;
    const injector = new Injector([
        [ICommandService, { useValue: command }],
        [FormulaDataModel, { useValue: model }],
        [IFormulaRuntimeService, { useValue: runtime }],
        [FormulaResultService],
    ]);
    onTestFinished(() => injector.dispose());
    const cell = { v: 42 };
    const matrix = new ObjectMatrix({ 0: { 1: cell } });
    const data: IAllRuntimeData = {
        unitData: { book: { sheet: matrix } },
        unitOtherData: {},
        sourceFormulaData: {},
        arrayFormulaRange: {},
        arrayFormulaEmbedded: {},
        arrayFormulaCellData: {},
        clearArrayFormulaCellData: {},
        imageFormulaData: [],
        dependencyTreeModelData: [],
        functionsExecutedState: FormulaExecutedStateType.SUCCESS,
        runtimeFeatureRange: {},
        runtimeFeatureCellData: {},
    };
    return { command, model, runtime, injector, data, matrix, cell };
}

describe('FormulaResultService', () => {
    it('orders array, image, dependency and cell results through the same writer', async () => {
        const { injector, command, data } = createTestBed();
        const writer = injector.get(FormulaResultService);
        data.imageFormulaData = [{ unitId: 'book', sheetId: 'sheet', row: 0, column: 1, imageId: 'image' }] as never;
        data.dependencyTreeModelData = [{ treeId: 7 }] as never;
        await writer.applyResult(data);
        expect(command.executeCommand.mock.calls.map(([id]) => id)).toEqual([
            SetArrayFormulaDataMutation.id,
            SetImageFormulaDataMutation.id,
            SetFormulaDependencyCalculationResultMutation.id,
            SetFormulaCalculationResultMutation.id,
        ]);
    });

    it('submits Web runtime rows once, after metadata, with independent row containers and shared cells', async () => {
        const { injector, command, data, matrix, cell } = createTestBed();
        const writer = injector.get(FormulaResultService);
        await writer.applyResult(data);
        expect(command.executeCommand.mock.calls.map(([id]) => id)).toEqual([
            SetArrayFormulaDataMutation.id,
            SetFormulaCalculationResultMutation.id,
        ]);
        const [, result, options] = command.executeCommand.mock.calls[1] as unknown as [string, ISetFormulaCalculationResultMutation, object];
        expect(options).toEqual({ onlyLocal: true, applyFormulaCalculationResult: true });
        expect(result.unitData.book!.sheet[0]).not.toBe(matrix.getRow(0));
        expect(result.unitData.book!.sheet[0][1]).toBe(cell);
        result.unitData.book!.sheet[0][1] = { v: 99 };
        expect(matrix.getValue(0, 1)).toBe(cell);
    });

    it('submits an already prepared batch without materializing or copying runtime rows', async () => {
        const { injector, command, data, matrix, cell } = createTestBed();
        const writer = injector.get(FormulaResultService);
        const forValue = vi.spyOn(matrix, 'forValue');
        const result = { unitData: { book: { sheet: { 0: { 1: cell } } } }, unitOtherData: {} };
        await writer.applyResult(data, result);
        expect(command.executeCommand.mock.calls[1][1]).toBe(result);
        expect(forValue).not.toHaveBeenCalled();
    });

    it.each(['stop', 'dispose'])('does not submit values after %s during metadata application', async (action) => {
        const { injector, command, data, runtime } = createTestBed();
        const writer = injector.get(FormulaResultService);
        command.executeCommand.mockImplementationOnce(async () => {
            if (action === 'stop') runtime.isStopExecution.mockReturnValue(true);
            else writer.dispose();
            return true;
        });
        await writer.applyResult(data);
        expect(command.executeCommand.mock.calls.map(([id]) => id)).toEqual([SetArrayFormulaDataMutation.id]);
    });
});
