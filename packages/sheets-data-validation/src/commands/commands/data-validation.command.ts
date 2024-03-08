/**
 * Copyright 2023-present DreamNum Inc.
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

import { CommandType, ICommandService, IUndoRedoService, ObjectMatrix, Range } from '@univerjs/core';
import type { ICommand, IMutationInfo, IRange, ISheetDataValidationRule } from '@univerjs/core';
import type { IAddDataValidationMutationParams, IUpdateDataValidationMutationParams } from '@univerjs/data-validation';
import { AddDataValidationMutation, DataValidationModel, RemoveDataValidationMutation, UpdateDataValidationMutation, UpdateRuleType } from '@univerjs/data-validation';
import type { SheetDataValidationManager } from '../../models/sheet-data-validation-manager';
import { UpdateDataValidationRangeByMatrixMutation } from '../mutations/data-validation.mutation';

export interface IUpdateSheetDataValidationRangeCommandParams {
    unitId: string;
    subUnitId: string;
    ruleId: string;
    ranges: IRange[];
}

export const UpdateSheetDataValidationRangeCommand: ICommand<IUpdateSheetDataValidationRangeCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheets.command.updateDataValidationRuleRange',
    async  handler(accessor, params) {
        if (!params) {
            return false;
        }
        const { unitId, subUnitId, ranges, ruleId } = params;
        const dataValidationModel = accessor.get(DataValidationModel);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const manager = dataValidationModel.getOrCreateManager(unitId, subUnitId) as SheetDataValidationManager;
        const currentRule = manager.getRuleById(ruleId);
        if (!currentRule) {
            return false;
        }
        const oldRanges = currentRule.ranges;
        const matrix = manager.getRuleObjectMatrix();
        const undoMatrix = new ObjectMatrix<string>();
        const redoMatrix = new ObjectMatrix<string>();

        ranges.forEach((range) => {
            Range.foreach(range, (row, col) => {
                const currentValue = matrix.getValue(row, col);
                if (currentValue !== ruleId) {
                    undoMatrix.setValue(row, col, currentValue ?? '');
                    redoMatrix.setValue(row, col, '');
                }
            });
        });

        const mutationParams: IUpdateDataValidationMutationParams = {
            unitId,
            subUnitId,
            ruleId,
            payload: {
                type: UpdateRuleType.RANGE,
                payload: ranges,
            },
        };

        const redoMutations: IMutationInfo[] = [
            {
                id: UpdateDataValidationRangeByMatrixMutation.id,
                params: {
                    unitId,
                    subUnitId,
                    ranges: redoMatrix,
                },
            },
            {
                id: UpdateDataValidationMutation.id,
                params: mutationParams,
            },
        ];

        const undoMutations: IMutationInfo[] = [
            {
                id: UpdateDataValidationMutation.id,
                params: {
                    ...mutationParams,
                    payload: {
                        type: UpdateRuleType.RANGE,
                        payload: oldRanges,
                    },
                },
            }, {
                id: UpdateDataValidationRangeByMatrixMutation.id,
                params: {
                    unitId,
                    subUnitId,
                    ranges: undoMatrix,
                },
            },
        ];

        undoRedoService.pushUndoRedo({
            undoMutations,
            redoMutations,
            unitID: unitId,
        });

        await commandService.executeCommand(UpdateDataValidationRangeByMatrixMutation.id, {
            unitId,
            subUnitId,
            ranges: redoMatrix,
        });
        await commandService.executeCommand(UpdateDataValidationMutation.id, mutationParams);
        return true;
    },
};

export interface IAddSheetDataValidationCommandParams {
    unitId: string;
    subUnitId: string;
    rule: ISheetDataValidationRule;
}

export const AddSheetDataValidationCommand: ICommand<IAddSheetDataValidationCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheets.command.addDataValidation',
    async handler(accessor, params) {
        if (!params) {
            return false;
        }
        const { unitId, subUnitId, rule } = params;
        const dataValidationModel = accessor.get(DataValidationModel);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const manager = dataValidationModel.getOrCreateManager(unitId, subUnitId) as SheetDataValidationManager;

        const matrix = manager.getRuleObjectMatrix();
        const undoMatrix = new ObjectMatrix<string>();
        const redoMatrix = new ObjectMatrix<string>();
        const ruleId = rule.uid;

        rule.ranges.forEach((range) => {
            Range.foreach(range, (row, col) => {
                const currentValue = matrix.getValue(row, col);
                if (currentValue !== ruleId) {
                    undoMatrix.setValue(row, col, currentValue ?? '');
                    redoMatrix.setValue(row, col, '');
                }
            });
        });

        const redoParams: IAddDataValidationMutationParams = {
            unitId,
            subUnitId,
            rule,
        };

        const redoMutations: IMutationInfo[] = [
            {
                id: UpdateDataValidationRangeByMatrixMutation.id,
                params: {
                    unitId,
                    subUnitId,
                    ranges: redoMatrix,
                },
            },
            {
                id: AddDataValidationMutation.id,
                params: redoParams,
            }];

        const undoMutations: IMutationInfo[] = [
            {
                id: RemoveDataValidationMutation.id,
                params: {
                    unitId,
                    subUnitId,
                    ruleId: rule.uid,
                },
            },
            {
                id: UpdateDataValidationRangeByMatrixMutation.id,
                params: {
                    unitId,
                    subUnitId,
                    ranges: undoMatrix,
                },
            },
        ];

        undoRedoService.pushUndoRedo({
            unitID: unitId,
            redoMutations,
            undoMutations,
        });

        await commandService.executeCommand(UpdateDataValidationRangeByMatrixMutation.id, {
            unitId,
            subUnitId,
            ranges: redoMatrix,
        });
        await commandService.executeCommand(AddDataValidationMutation.id, redoParams);
        return true;
    },
};
