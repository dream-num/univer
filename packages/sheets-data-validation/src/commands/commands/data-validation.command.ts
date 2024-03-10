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

import { CommandType, ICommandService, IUndoRedoService } from '@univerjs/core';
import type { ICommand, IMutationInfo, IRange, ISheetDataValidationRule } from '@univerjs/core';
import type { IAddDataValidationMutationParams, IUpdateDataValidationMutationParams } from '@univerjs/data-validation';
import { AddDataValidationMutation, DataValidationModel, RemoveDataValidationMutation, UpdateDataValidationMutation, UpdateRuleType } from '@univerjs/data-validation';
import type { SheetDataValidationManager } from '../../models/sheet-data-validation-manager';

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
        const matrix = manager.getRuleObjectMatrix().clone();
        matrix.updateRange(ruleId, oldRanges, ranges);
        const diffs = matrix.diff(manager.getDataValidations());

        const mutationParams: IUpdateDataValidationMutationParams = {
            unitId,
            subUnitId,
            ruleId,
            payload: {
                type: UpdateRuleType.RANGE,
                payload: ranges,
            },
        };

        const redoMutations: IMutationInfo[] = [];

        const undoMutations: IMutationInfo[] = [];

        diffs.forEach((diff) => {
            switch (diff.type) {
                case 'delete':
                    redoMutations.push({
                        id: RemoveDataValidationMutation.id,
                        params: {
                            unitId,
                            subUnitId,
                            ruleId: diff.rule.uid,
                        },
                    });
                    undoMutations.unshift({
                        id: AddDataValidationMutation.id,
                        params: {
                            unitId,
                            subUnitId,
                            rule: diff.rule,
                            index: diff.index,
                        },
                    });
                    break;
                case 'update': {
                    redoMutations.push({
                        id: UpdateDataValidationMutation.id,
                        params: {
                            unitId,
                            subUnitId,
                            ruleId: diff.ruleId,
                            payload: {
                                type: UpdateRuleType.RANGE,
                                payload: diff.newRanges,
                            },
                        } as IUpdateDataValidationMutationParams,
                    });
                    undoMutations.unshift({
                        id: UpdateDataValidationMutation.id,
                        params: {
                            unitId,
                            subUnitId,
                            ruleId,
                            payload: {
                                type: UpdateRuleType.RANGE,
                                payload: diff.oldRanges,
                            },
                        } as IUpdateDataValidationMutationParams,
                    });
                    break;
                }
                default:
                    break;
            }
        });

        redoMutations.push(
            {
                id: UpdateDataValidationMutation.id,
                params: mutationParams,
            }
        );

        undoMutations.unshift(
            {
                id: UpdateDataValidationMutation.id,
                params: {
                    ...mutationParams,
                    payload: {
                        type: UpdateRuleType.RANGE,
                        payload: oldRanges,
                    },
                },
            }
        );

        undoRedoService.pushUndoRedo({
            undoMutations,
            redoMutations,
            unitID: unitId,
        });

        redoMutations.forEach((commandInfo) => {
            commandService.executeCommand(commandInfo.id, commandInfo.params);
        });

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

        const matrix = manager.getRuleObjectMatrix().clone();
        matrix.addRule(rule);
        const diffs = matrix.diff(manager.getDataValidations());

        const mutationParams: IAddDataValidationMutationParams = {
            unitId,
            subUnitId,
            rule,
        };

        const redoMutations: IMutationInfo[] = [];

        const undoMutations: IMutationInfo[] = [];

        diffs.forEach((diff) => {
            switch (diff.type) {
                case 'delete':
                    redoMutations.push({
                        id: RemoveDataValidationMutation.id,
                        params: {
                            unitId,
                            subUnitId,
                            ruleId: diff.rule.uid,
                        },
                    });
                    undoMutations.unshift({
                        id: AddDataValidationMutation.id,
                        params: {
                            unitId,
                            subUnitId,
                            rule: diff.rule,
                            index: diff.index,
                        },
                    });
                    break;
                case 'update': {
                    redoMutations.push({
                        id: UpdateDataValidationMutation.id,
                        params: {
                            unitId,
                            subUnitId,
                            ruleId: diff.ruleId,
                            payload: {
                                type: UpdateRuleType.RANGE,
                                payload: diff.newRanges,
                            },
                        } as IUpdateDataValidationMutationParams,
                    });
                    undoMutations.unshift({
                        id: UpdateDataValidationMutation.id,
                        params: {
                            unitId,
                            subUnitId,
                            ruleId: diff.ruleId,
                            payload: {
                                type: UpdateRuleType.RANGE,
                                payload: diff.oldRanges,
                            },
                        } as IUpdateDataValidationMutationParams,
                    });
                    break;
                }
                default:
                    break;
            }
        });

        redoMutations.push({
            id: AddDataValidationMutation.id,
            params: mutationParams,
        });

        undoMutations.unshift({
            id: RemoveDataValidationMutation.id,
            params: {
                unitId,
                subUnitId,
                ruleId: rule.uid,
            },
        });

        undoRedoService.pushUndoRedo({
            unitID: unitId,
            redoMutations,
            undoMutations,
        });

        redoMutations.forEach((commandInfo) => {
            commandService.executeCommand(commandInfo.id, commandInfo.params);
        });

        return true;
    },
};
