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

import { CommandType, DataValidationType, ICommandService, IUndoRedoService, IUniverInstanceService, ObjectMatrix, Range, sequenceExecute, sequenceExecuteAsync, Tools } from '@univerjs/core';
import type { CellValue, ICellData, ICommand, IDataValidationRuleBase, IDataValidationRuleOptions, IMutationInfo, IRange, ISheetDataValidationRule, Nullable } from '@univerjs/core';
import type { IAddDataValidationMutationParams, IUpdateDataValidationMutationParams } from '@univerjs/data-validation';
import { AddDataValidationMutation, createDefaultNewRule, DataValidationModel, DataValidatorRegistryService, getRuleOptions, getRuleSetting, RemoveDataValidationMutation, UpdateDataValidationMutation, UpdateRuleType } from '@univerjs/data-validation';
import type { ISetRangeValuesMutationParams, ISheetCommandSharedParams } from '@univerjs/sheets';
import { getSheetCommandTarget, SetRangeValuesMutation, SetRangeValuesUndoMutationFactory } from '@univerjs/sheets';
import type { IAccessor } from '@wendellhu/redi';
import type { SheetDataValidationManager } from '../../models/sheet-data-validation-manager';
import { OpenValidationPanelOperation } from '../operations/data-validation.operation';
import type { RangeMutation } from '../../models/rule-matrix';
import { CHECKBOX_FORMULA_2, type CheckboxValidator } from '../../validators';

export interface IUpdateSheetDataValidationRangeCommandParams {
    unitId: string;
    subUnitId: string;
    ruleId: string;
    ranges: IRange[];
}

function isBlankCell(cellData: Nullable<ICellData>) {
    if (!cellData) {
        return true;
    }

    if (!cellData.p) {
        return Tools.isBlank(cellData.v);
    }

    const dataStream = (cellData.p.body?.dataStream ?? '').slice(0, -2).trim();
    return !dataStream;
}

// eslint-disable-next-line max-lines-per-function
export function getDataValidationDiffMutations(
    unitId: string,
    subUnitId: string,
    diffs: RangeMutation[],
    accessor: IAccessor
) {
    const redoMutations: IMutationInfo[] = [];
    const undoMutations: IMutationInfo[] = [];
    const model = accessor.get(DataValidationModel);
    const manager = model.ensureManager(unitId, subUnitId) as SheetDataValidationManager;
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const target = getSheetCommandTarget(univerInstanceService, { unitId, subUnitId });
    if (!target) {
        return {
            redoMutations,
            undoMutations,
        };
    }
    const { worksheet } = target;
    const redoMatrix = new ObjectMatrix<ICellData>();

    function setRangesDefaultValue(ranges: IRange[], defaultValue: CellValue) {
        ranges.forEach((range) => {
            Range.foreach(range, (row, column) => {
                const cellData = worksheet.getCellRaw(row, column);
                if (isBlankCell(cellData) || cellData?.v === defaultValue) {
                    redoMatrix.setValue(row, column, {
                        v: defaultValue,
                        p: null,
                    });
                }
            });
        });
    }

    // eslint-disable-next-line max-lines-per-function
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
                const rule = manager.getRuleById(diff.ruleId);
                if (rule && rule.type === DataValidationType.CHECKBOX) {
                    const validator = manager.getValidator(DataValidationType.CHECKBOX) as CheckboxValidator;
                    const formula = validator.parseFormulaSync(rule, unitId, subUnitId);
                    setRangesDefaultValue(diff.newRanges, formula.formula2!);
                }
                break;
            }
            case 'add': {
                redoMutations.push({
                    id: AddDataValidationMutation.id,
                    params: {
                        unitId,
                        subUnitId,
                        rule: diff.rule,
                    } as IAddDataValidationMutationParams,
                });
                undoMutations.unshift({
                    id: RemoveDataValidationMutation.id,
                    params: {
                        unitId,
                        subUnitId,
                        ruleId: diff.rule.uid,
                    },
                });
                if (diff.rule.type === DataValidationType.CHECKBOX) {
                    const validator = manager.getValidator(DataValidationType.CHECKBOX) as CheckboxValidator;
                    const formula = validator.parseFormulaSync(diff.rule, unitId, subUnitId);
                    setRangesDefaultValue(diff.rule.ranges, formula.formula2!);
                }
                break;
            }
            default:
                break;
        }
    });

    const redoSetRangeValues = {
        id: SetRangeValuesMutation.id,
        params: {
            unitId,
            subUnitId,
            cellValue: redoMatrix.getData(),
        } as ISetRangeValuesMutationParams,
    };

    const undoSetRangeValues = {
        id: SetRangeValuesMutation.id,
        params: SetRangeValuesUndoMutationFactory(accessor, redoSetRangeValues.params),
    };

    redoMutations.push(redoSetRangeValues);
    undoMutations.push(undoSetRangeValues);

    return {
        redoMutations,
        undoMutations,
    };
}

export const UpdateSheetDataValidationRangeCommand: ICommand<IUpdateSheetDataValidationRangeCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.updateDataValidationRuleRange',
    async handler(accessor, params) {
        if (!params) {
            return false;
        }
        const { unitId, subUnitId, ranges, ruleId } = params;
        const dataValidationModel = accessor.get(DataValidationModel);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const manager = dataValidationModel.ensureManager(unitId, subUnitId) as SheetDataValidationManager;
        const currentRule = manager.getRuleById(ruleId);
        if (!currentRule) {
            return false;
        }
        const oldRanges = currentRule.ranges;
        const matrix = manager.getRuleObjectMatrix().clone();
        matrix.updateRange(ruleId, oldRanges, ranges);
        const diffs = matrix.diff(manager.getDataValidations());

        const { redoMutations, undoMutations } = getDataValidationDiffMutations(unitId, subUnitId, diffs, accessor);

        undoRedoService.pushUndoRedo({
            undoMutations,
            redoMutations,
            unitID: unitId,
        });
        await sequenceExecuteAsync(redoMutations, commandService);
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
    id: 'sheet.command.addDataValidation',
    async handler(accessor, params) {
        if (!params) {
            return false;
        }
        const { unitId, subUnitId, rule } = params;
        const dataValidationModel = accessor.get(DataValidationModel);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const manager = dataValidationModel.ensureManager(unitId, subUnitId) as SheetDataValidationManager;

        const matrix = manager.getRuleObjectMatrix().clone();
        matrix.addRule(rule);
        const diffs = matrix.diff(manager.getDataValidations());

        const mutationParams: IAddDataValidationMutationParams = {
            unitId,
            subUnitId,
            rule,
        };

        const { redoMutations, undoMutations } = getDataValidationDiffMutations(unitId, subUnitId, diffs, accessor);

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

        await sequenceExecuteAsync(redoMutations, commandService);
        return true;
    },
};

export const AddSheetDataValidationAndOpenCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'data-validation.command.addRuleAndOpen',
    async handler(accessor) {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) return false;

        const { workbook, worksheet } = target;
        const rule = createDefaultNewRule(accessor);
        const commandService = accessor.get(ICommandService);
        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();

        const addParams: IAddSheetDataValidationCommandParams = {
            rule,
            unitId,
            subUnitId,
        };

        const res = await commandService.executeCommand(AddSheetDataValidationCommand.id, addParams);

        if (res) {
            commandService.executeCommand(OpenValidationPanelOperation.id, {
                ruleId: rule.uid,
                isAdd: true,
            });

            return true;
        }
        return false;
    },
};

export interface IUpdateSheetDataValidationSettingCommandParams extends ISheetCommandSharedParams {
    ruleId: string;
    setting: IDataValidationRuleBase;
}

export const UpdateSheetDataValidationSettingCommand: ICommand<IUpdateSheetDataValidationSettingCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheets.command.update-data-validation-setting',
    // eslint-disable-next-line max-lines-per-function
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const commandService = accessor.get(ICommandService);
        const redoUndoService = accessor.get(IUndoRedoService);
        const dataValidationModel = accessor.get(DataValidationModel);
        const dataValidatorRegistryService = accessor.get(DataValidatorRegistryService);

        const { unitId, subUnitId, ruleId, setting } = params;
        const validator = dataValidatorRegistryService.getValidatorItem(setting.type);

        if (!validator) {
            return false;
        }
        const rule = dataValidationModel.getRuleById(unitId, subUnitId, ruleId);
        if (!rule) {
            return false;
        }

        if (!validator.validatorFormula({ ...rule, ...setting }, unitId, subUnitId).success) {
            return false;
        }

        const mutationParams: IUpdateDataValidationMutationParams = {
            unitId,
            subUnitId,
            ruleId,
            payload: {
                type: UpdateRuleType.SETTING,
                payload: setting,
            },
        };

        const redoMutations: IMutationInfo[] = [{
            id: UpdateDataValidationMutation.id,
            params: mutationParams,
        }];
        const undoMutationParams: IUpdateDataValidationMutationParams = {
            unitId,
            subUnitId,
            ruleId,
            payload: {
                type: UpdateRuleType.SETTING,
                payload: getRuleSetting(rule),
            },
        };
        const undoMutations: IMutationInfo[] = [{
            id: UpdateDataValidationMutation.id,
            params: undoMutationParams,
        }];

        if (setting.type === DataValidationType.CHECKBOX) {
            const ranges = rule.ranges as IRange[];
            const univerInstanceService = accessor.get(IUniverInstanceService);
            const target = getSheetCommandTarget(univerInstanceService, { unitId, subUnitId });
            if (target) {
                const redoMatrix = new ObjectMatrix<ICellData>();
                const { worksheet } = target;
                const { formula2: oldFormula2 = CHECKBOX_FORMULA_2 } = rule;
                const { formula2 = CHECKBOX_FORMULA_2 } = setting;
                ranges.forEach((range) => {
                    Range.foreach(range, (row, column) => {
                        const cellData = worksheet.getCellRaw(row, column);
                        if (isBlankCell(cellData) || cellData?.v === oldFormula2) {
                            redoMatrix.setValue(row, column, {
                                v: formula2,
                                // t: 1,
                                p: null,
                            });
                        }
                    });
                });

                const redoSetRangeValues = {
                    id: SetRangeValuesMutation.id,
                    params: {
                        unitId,
                        subUnitId,
                        cellValue: redoMatrix.getData(),
                    } as ISetRangeValuesMutationParams,
                };

                const undoSetRangeValues = {
                    id: SetRangeValuesMutation.id,
                    params: SetRangeValuesUndoMutationFactory(accessor, redoSetRangeValues.params),
                };
                redoMutations.push(redoSetRangeValues);
                undoMutations.push(undoSetRangeValues);
            }
        }
        const res = sequenceExecute(redoMutations, commandService);
        if (res.result) {
            redoUndoService.pushUndoRedo({
                unitID: unitId,
                redoMutations,
                undoMutations,
            });
            return true;
        }

        return false;
    },
};

export interface IUpdateSheetDataValidationOptionsCommandParams extends ISheetCommandSharedParams {
    ruleId: string;
    options: IDataValidationRuleOptions;
}

export const UpdateSheetDataValidationOptionsCommand: ICommand<IUpdateSheetDataValidationOptionsCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheets.command.update-data-validation-options',
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const commandService = accessor.get(ICommandService);
        const redoUndoService = accessor.get(IUndoRedoService);
        const dataValidationModel = accessor.get(DataValidationModel);

        const { unitId, subUnitId, ruleId, options } = params;

        const rule = dataValidationModel.getRuleById(unitId, subUnitId, ruleId);
        if (!rule) {
            return false;
        }

        const mutationParams: IUpdateDataValidationMutationParams = {
            unitId,
            subUnitId,
            ruleId,
            payload: {
                type: UpdateRuleType.OPTIONS,
                payload: options,
            },
        };

        const redoMutations: IMutationInfo[] = [{
            id: UpdateDataValidationMutation.id,
            params: mutationParams,
        }];
        const undoMutationParams: IUpdateDataValidationMutationParams = {
            unitId,
            subUnitId,
            ruleId,
            payload: {
                type: UpdateRuleType.OPTIONS,
                payload: getRuleOptions(rule),
            },
        };
        const undoMutations: IMutationInfo[] = [{
            id: UpdateDataValidationMutation.id,
            params: undoMutationParams,
        }];

        redoUndoService.pushUndoRedo({
            unitID: unitId,
            redoMutations,
            undoMutations,
        });

        commandService.executeCommand(UpdateDataValidationMutation.id, mutationParams);
        return true;
    },
};

