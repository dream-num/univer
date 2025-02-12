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

import type { CellValue, IAccessor, ICellData, ICommand, IDataValidationRuleBase, IDataValidationRuleOptions, IMutationInfo, Injector, IRange, ISheetDataValidationRule, Nullable } from '@univerjs/core';
import type { DataValidationChangeSource, IAddDataValidationMutationParams, IRemoveDataValidationMutationParams, IUpdateDataValidationMutationParams } from '@univerjs/data-validation';
import type { ISetRangeValuesMutationParams, ISheetCommandSharedParams } from '@univerjs/sheets';
import type { RangeMutation } from '../../models/rule-matrix';
import { CommandType, DataValidationType, ICommandService, isFormulaString, isRangesEqual, IUndoRedoService, IUniverInstanceService, ObjectMatrix, Range, sequenceExecute, Tools } from '@univerjs/core';
import { AddDataValidationMutation, DataValidatorRegistryService, getRuleOptions, getRuleSetting, RemoveDataValidationMutation, UpdateDataValidationMutation, UpdateRuleType } from '@univerjs/data-validation';
import { LexerTreeBuilder } from '@univerjs/engine-formula';
import { getSheetCommandTarget, SetRangeValuesMutation, SetRangeValuesUndoMutationFactory } from '@univerjs/sheets';
import { SheetDataValidationModel } from '../../models/sheet-data-validation-model';
import { shouldOffsetFormulaByRange } from '../../utils/formula';
import { getStringCellValue } from '../../utils/get-cell-data-origin';
import { CHECKBOX_FORMULA_1, CHECKBOX_FORMULA_2, type CheckboxValidator } from '../../validators';

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
    accessor: IAccessor,
    source: DataValidationChangeSource = 'command',
    fillDefaultValue = true
) {
    const lexerTreeBuilder = accessor.get(LexerTreeBuilder);
    const validatorRegistryService = accessor.get(DataValidatorRegistryService);
    const redoMutations: IMutationInfo[] = [];
    const undoMutations: IMutationInfo[] = [];
    const sheetDataValidationModel = accessor.get(SheetDataValidationModel);
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
    let setRangeValue = false;
    function setRangesDefaultValue(ranges: IRange[], defaultValue: CellValue) {
        if (!fillDefaultValue) {
            return;
        }
        ranges.forEach((range) => {
            Range.foreach(range, (row, column) => {
                const cellData = worksheet.getCellRaw(row, column);
                const value = getStringCellValue(cellData);
                if ((isBlankCell(cellData) || value === defaultValue) && !cellData?.p) {
                    setRangeValue = true;
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
                        source,
                    },
                });
                undoMutations.unshift({
                    id: AddDataValidationMutation.id,
                    params: {
                        unitId,
                        subUnitId,
                        rule: diff.rule,
                        index: diff.index,
                        source,
                    },
                });
                break;
            case 'update': {
                if (shouldOffsetFormulaByRange(diff.rule.type, validatorRegistryService)) {
                    const originRow = diff.oldRanges[0].startRow;
                    const originColumn = diff.oldRanges[0].startColumn;
                    const newRow = diff.newRanges[0].startRow;
                    const newColumn = diff.newRanges[0].startColumn;
                    const rowDiff = newRow - originRow;
                    const columnDiff = newColumn - originColumn;
                    const newFormula = isFormulaString(diff.rule.formula1!) ? lexerTreeBuilder.moveFormulaRefOffset(diff.rule.formula1!, columnDiff, rowDiff) : diff.rule.formula1;
                    const newFormula2 = isFormulaString(diff.rule.formula2!) ? lexerTreeBuilder.moveFormulaRefOffset(diff.rule.formula2!, columnDiff, rowDiff) : diff.rule.formula2;

                    if (newFormula !== diff.rule.formula1 || newFormula2 !== diff.rule.formula2 || !isRangesEqual(diff.newRanges, diff.oldRanges)) {
                        redoMutations.push({
                            id: UpdateDataValidationMutation.id,
                            params: {
                                unitId,
                                subUnitId,
                                ruleId: diff.ruleId,
                                payload: {
                                    type: UpdateRuleType.ALL,
                                    payload: {
                                        formula1: newFormula,
                                        formula2: newFormula2,
                                        ranges: diff.newRanges,
                                    },
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
                                    type: UpdateRuleType.ALL,
                                    payload: {
                                        formula1: diff.rule.formula1,
                                        formula2: diff.rule.formula2,
                                        ranges: diff.oldRanges,
                                    },
                                },
                            } as IUpdateDataValidationMutationParams,
                        });
                    } else {
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
                                source,
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
                                source,
                            } as IUpdateDataValidationMutationParams,
                        });
                    }
                } else {
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
                            source,
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
                            source,
                        } as IUpdateDataValidationMutationParams,
                    });
                }

                const rule = sheetDataValidationModel.getRuleById(unitId, subUnitId, diff.ruleId);
                if (rule && rule.type === DataValidationType.CHECKBOX) {
                    const validator = sheetDataValidationModel.getValidator(DataValidationType.CHECKBOX) as CheckboxValidator;
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
                        source,
                    } as IAddDataValidationMutationParams,
                });
                undoMutations.unshift({
                    id: RemoveDataValidationMutation.id,
                    params: {
                        unitId,
                        subUnitId,
                        ruleId: diff.rule.uid,
                        source,
                    },
                });
                if (diff.rule.type === DataValidationType.CHECKBOX) {
                    const validator = sheetDataValidationModel.getValidator(DataValidationType.CHECKBOX) as CheckboxValidator;
                    const formula = validator.parseFormulaSync(diff.rule, unitId, subUnitId);
                    setRangesDefaultValue(diff.rule.ranges, formula.originFormula2!);
                }
                break;
            }
            default:
                break;
        }
    });

    if (setRangeValue) {
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

    return {
        redoMutations,
        undoMutations,
    };
}

export const UpdateSheetDataValidationRangeCommand: ICommand<IUpdateSheetDataValidationRangeCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.updateDataValidationRuleRange',
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const { unitId, subUnitId, ranges, ruleId } = params;
        const sheetDataValidationModel = accessor.get(SheetDataValidationModel);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const currentRule = sheetDataValidationModel.getRuleById(unitId, subUnitId, ruleId);
        if (!currentRule) {
            return false;
        }
        const matrix = sheetDataValidationModel.getRuleObjectMatrix(unitId, subUnitId).clone();
        matrix.updateRange(ruleId, ranges);
        const diffs = matrix.diff(sheetDataValidationModel.getRules(unitId, subUnitId));

        const { redoMutations, undoMutations } = getDataValidationDiffMutations(unitId, subUnitId, diffs, accessor);

        undoRedoService.pushUndoRedo({
            undoMutations,
            redoMutations,
            unitID: unitId,
        });
        sequenceExecute(redoMutations, commandService);
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
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const { unitId, subUnitId, rule } = params;
        const sheetDataValidationModel = accessor.get(SheetDataValidationModel);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const matrix = sheetDataValidationModel.getRuleObjectMatrix(unitId, subUnitId).clone();
        matrix.addRule(rule);
        const diffs = matrix.diff(sheetDataValidationModel.getRules(unitId, subUnitId));
        const validator = sheetDataValidationModel.getValidator(rule.type);

        const mutationParams: IAddDataValidationMutationParams = {
            unitId,
            subUnitId,
            rule: {
                ...rule,
                ...validator?.normalizeFormula(rule, unitId, subUnitId),
            },
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

        sequenceExecute(redoMutations, commandService);
        return true;
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
        const sheetDataValidationModel = accessor.get(SheetDataValidationModel);
        const dataValidatorRegistryService = accessor.get(DataValidatorRegistryService);

        const { unitId, subUnitId, ruleId, setting } = params;
        const validator = dataValidatorRegistryService.getValidatorItem(setting.type);

        if (!validator) {
            return false;
        }
        const rule = sheetDataValidationModel.getRuleById(unitId, subUnitId, ruleId);
        if (!rule) {
            return false;
        }

        const newRule = { ...rule, ...setting };
        if (!validator.validatorFormula(newRule, unitId, subUnitId).success) {
            return false;
        }

        const mutationParams: IUpdateDataValidationMutationParams = {
            unitId,
            subUnitId,
            ruleId,
            payload: {
                type: UpdateRuleType.SETTING,
                payload: {
                    ...setting,
                    ...validator.normalizeFormula(newRule, unitId, subUnitId),
                },
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
                const { formula2: oldFormula2 = CHECKBOX_FORMULA_2, formula1: oldFormula1 = CHECKBOX_FORMULA_1 } = rule;
                const { formula2 = CHECKBOX_FORMULA_2, formula1 = CHECKBOX_FORMULA_1 } = setting;
                let setted = false;
                ranges.forEach((range) => {
                    Range.foreach(range, (row, column) => {
                        const cellData = worksheet.getCellRaw(row, column);
                        const value = getStringCellValue(cellData);
                        if ((isBlankCell(cellData) || value === String(oldFormula2)) && !cellData?.p) {
                            redoMatrix.setValue(row, column, {
                                v: formula2,
                                p: null,
                            });
                            setted = true;
                        } else if (value === String(oldFormula1) && !cellData?.p) {
                            redoMatrix.setValue(row, column, {
                                v: formula1,
                                p: null,
                            });
                            setted = true;
                        }
                    });
                });

                if (setted) {
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
        const sheetDataValidationModel = accessor.get(SheetDataValidationModel);

        const { unitId, subUnitId, ruleId, options } = params;

        const rule = sheetDataValidationModel.getRuleById(unitId, subUnitId, ruleId);
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

export interface IClearRangeDataValidationCommandParams {
    unitId: string;
    subUnitId: string;
    ranges: IRange[];
}

export const ClearRangeDataValidationCommand: ICommand<IClearRangeDataValidationCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheets.command.clear-range-data-validation',
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const { unitId, subUnitId, ranges } = params;
        const commandService = accessor.get(ICommandService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const target = getSheetCommandTarget(univerInstanceService, { unitId, subUnitId });
        const sheetDataValidationModel = accessor.get(SheetDataValidationModel);

        if (!target) return false;
        const undoRedoService = accessor.get(IUndoRedoService);

        const matrix = sheetDataValidationModel.getRuleObjectMatrix(unitId, subUnitId).clone();
        matrix.removeRange(ranges);

        const diffs = matrix.diff(sheetDataValidationModel.getRules(unitId, subUnitId));
        const { redoMutations, undoMutations } = getDataValidationDiffMutations(unitId, subUnitId, diffs, accessor);

        undoRedoService.pushUndoRedo({
            unitID: unitId,
            redoMutations,
            undoMutations,
        });

        return sequenceExecute(redoMutations, commandService).result;
    },
};

export interface IRemoveSheetAllDataValidationCommandParams extends ISheetCommandSharedParams {
}

export const RemoveSheetAllDataValidationCommand: ICommand<IRemoveSheetAllDataValidationCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.remove-all-data-validation',
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const { unitId, subUnitId } = params;
        const commandService = accessor.get(ICommandService);
        const sheetDataValidationModel = accessor.get(SheetDataValidationModel);
        const undoRedoService = accessor.get(IUndoRedoService);
        const currentRules = [...sheetDataValidationModel.getRules(unitId, subUnitId)];

        const redoParams: IRemoveDataValidationMutationParams = {
            unitId,
            subUnitId,
            ruleId: currentRules.map((rule) => rule.uid),
        };
        const redoMutations: IMutationInfo[] = [{
            id: RemoveDataValidationMutation.id,
            params: redoParams,
        }];

        const undoMutations: IMutationInfo[] = [{
            id: AddDataValidationMutation.id,
            params: {
                unitId,
                subUnitId,
                rule: currentRules,
            },
        }];

        undoRedoService.pushUndoRedo({
            redoMutations,
            undoMutations,
            unitID: unitId,
        });

        commandService.executeCommand(RemoveDataValidationMutation.id, redoParams);
        return true;
    },
};

export interface IRemoveSheetDataValidationCommandParams extends ISheetCommandSharedParams {
    ruleId: string;
}

export const removeDataValidationUndoFactory = (accessor: Injector, redoParams: IRemoveDataValidationMutationParams) => {
    const sheetDataValidationModel = accessor.get(SheetDataValidationModel);
    const { unitId, subUnitId, ruleId, source } = redoParams;
    if (Array.isArray(ruleId)) {
        const rules = ruleId.map((id) => sheetDataValidationModel.getRuleById(unitId, subUnitId, id)).filter(Boolean) as ISheetDataValidationRule[];
        return [{
            id: AddDataValidationMutation.id,
            params: {
                unitId,
                subUnitId,
                rule: rules,
                source,
            } as IAddDataValidationMutationParams,
        }];
    }

    const undoMutations: IMutationInfo[] = [{
        id: AddDataValidationMutation.id,
        params: {
            unitId,
            subUnitId,
            rule: {
                ...sheetDataValidationModel.getRuleById(unitId, subUnitId, ruleId),
            },
            index: sheetDataValidationModel.getRuleIndex(unitId, subUnitId, ruleId),
        } as IAddDataValidationMutationParams,
    }];

    return undoMutations;
};

export const RemoveSheetDataValidationCommand: ICommand<IRemoveSheetDataValidationCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.remove-data-validation-rule',
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const { unitId, subUnitId, ruleId } = params;
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const sheetDataValidationModel = accessor.get(SheetDataValidationModel);

        const redoMutations: IMutationInfo[] = [{
            id: RemoveDataValidationMutation.id,
            params,
        }];
        const undoMutations: IMutationInfo[] = [{
            id: AddDataValidationMutation.id,
            params: {
                unitId,
                subUnitId,
                rule: {
                    ...sheetDataValidationModel.getRuleById(unitId, subUnitId, ruleId),
                },
                index: sheetDataValidationModel.getRuleIndex(unitId, subUnitId, ruleId),
            } as IAddDataValidationMutationParams,
        }];

        undoRedoService.pushUndoRedo({
            undoMutations,
            redoMutations,
            unitID: params.unitId,
        });

        commandService.executeCommand(RemoveDataValidationMutation.id, params);
        return true;
    },
};
