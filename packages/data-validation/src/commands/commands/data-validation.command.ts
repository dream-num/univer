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

import { CommandType, ICommandService, ILogService, IUndoRedoService } from '@univerjs/core';
import type { ICommand, IDataValidationRule, IDataValidationRuleBase, IDataValidationRuleOptions, IMutationInfo, Injector, IRange, ISheetDataValidationRule } from '@univerjs/core';
import { getRuleOptions, getRuleSetting } from '../../common/util';
import { DataValidationModel } from '../../models/data-validation-model';
import { DataValidatorRegistryService } from '../../services/data-validator-registry.service';
import { UpdateRuleType } from '../../types/enum/update-rule-type';
import { AddDataValidationMutation, RemoveDataValidationMutation, UpdateDataValidationMutation } from '../mutations/data-validation.mutation';
import type { IAddDataValidationMutationParams, IRemoveDataValidationMutationParams, IUpdateDataValidationMutationParams } from '../mutations/data-validation.mutation';

interface ISheetCommandSharedParams {
    unitId: string;
    subUnitId: string;
}

export interface IAddDataValidationCommandParams extends ISheetCommandSharedParams {
    rule: Omit<IDataValidationRule, 'ranges'> & {
        range: IRange;
    };
    index?: number;
}

/**
 * @deprecated `AddDataValidationCommand` is deprecated, please use `AddSheetDataValidationCommand` in `@univerjs/sheets-data-validation` instead!
 */
export const AddDataValidationCommand: ICommand<IAddDataValidationCommandParams> = {
    type: CommandType.COMMAND,
    id: 'data-validation.command.addRule',
    async handler(accessor, params) {
        const logService = accessor.get(ILogService);
        logService.error('[Deprecated]: `AddDataValidationCommand` is deprecated, please use `AddSheetDataValidationCommand` in `@univerjs/sheets-data-validation` instead!');
        if (!params) {
            return false;
        }
        const { rule, unitId, subUnitId } = params;
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const mutationParams: IAddDataValidationMutationParams = {
            ...params,
            rule: {
                ...params.rule,
                ranges: [params.rule.range],
            },
        };
        const redoMutations: IMutationInfo[] = [{
            id: AddDataValidationMutation.id,
            params: mutationParams,
        }];

        const undoMutations: IMutationInfo[] = [{
            id: RemoveDataValidationMutation.id,
            params: {
                unitId,
                subUnitId,
                ruleId: rule.uid,
            },
        }];
        undoRedoService.pushUndoRedo({
            unitID: unitId,
            redoMutations,
            undoMutations,
        });

        await commandService.executeCommand(AddDataValidationMutation.id, mutationParams);
        return true;
    },
};

export interface IRemoveDataValidationCommandParams extends ISheetCommandSharedParams {
    ruleId: string;
}

export const removeDataValidationUndoFactory = (accessor: Injector, redoParams: IRemoveDataValidationMutationParams) => {
    const dataValidationModel = accessor.get(DataValidationModel);
    const { unitId, subUnitId, ruleId, source } = redoParams;
    if (Array.isArray(ruleId)) {
        const rules = ruleId.map((id) => dataValidationModel.getRuleById(unitId, subUnitId, id)).filter(Boolean) as ISheetDataValidationRule[];
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
                ...dataValidationModel.getRuleById(unitId, subUnitId, ruleId),
            },
            index: dataValidationModel.getRuleIndex(unitId, subUnitId, ruleId),
        } as IAddDataValidationMutationParams,
    }];

    return undoMutations;
};

/**
 * @deprecated `RemoveDataValidationCommand` is deprecated, please use `RemoveSheetDataValidationCommand` in `@univerjs/sheets-data-validation` instead!
 */
export const RemoveDataValidationCommand: ICommand<IRemoveDataValidationCommandParams> = {
    type: CommandType.COMMAND,
    id: 'data-validation.command.removeRule',
    handler(accessor, params) {
        const logService = accessor.get(ILogService);
        logService.error('[Deprecated]: `RemoveDataValidationCommand` is deprecated, please use `RemoveSheetDataValidationCommand` in `@univerjs/sheets-data-validation` instead!');

        if (!params) {
            return false;
        }
        const { unitId, subUnitId, ruleId } = params;
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const dataValidationModel = accessor.get(DataValidationModel);

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
                    ...dataValidationModel.getRuleById(unitId, subUnitId, ruleId),
                },
                index: dataValidationModel.getRuleIndex(unitId, subUnitId, ruleId),
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

export interface IUpdateDataValidationOptionsCommandParams extends ISheetCommandSharedParams {
    ruleId: string;
    options: IDataValidationRuleOptions;
}

/**
 * @deprecated `UpdateDataValidationOptionsCommand` is deprecated, please use `UpdateSheetDataValidationOptionsCommand` in `@univerjs/sheets-data-validation` instead!
 */
export const UpdateDataValidationOptionsCommand: ICommand<IUpdateDataValidationOptionsCommandParams> = {
    type: CommandType.COMMAND,
    id: 'data-validation.command.updateDataValidationSetting',
    handler(accessor, params) {
        const logService = accessor.get(ILogService);
        logService.warn('[Deprecated]: `UpdateDataValidationOptionsCommand` is deprecated, please use `UpdateSheetDataValidationOptionsCommand` in `@univerjs/sheets-data-validation` instead!');
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

export interface IUpdateDataValidationSettingCommandParams extends ISheetCommandSharedParams {
    ruleId: string;
    setting: IDataValidationRuleBase;
}

/**
 * @deprecated `UpdateDataValidationSettingCommand` is deprecated, please use `UpdateSheetDataValidationSettingCommand` in `@univerjs/sheets-data-validation` instead!
 */
export const UpdateDataValidationSettingCommand: ICommand<IUpdateDataValidationSettingCommandParams> = {
    type: CommandType.COMMAND,
    id: 'data-validation.command.updateDataValidationOptions',
    handler(accessor, params) {
        const logService = accessor.get(ILogService);
        logService.error('[Deprecated]: `UpdateDataValidationSettingCommand` is deprecated, please use `UpdateSheetDataValidationSettingCommand` in `@univerjs/sheets-data-validation` instead!');

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

        redoUndoService.pushUndoRedo({
            unitID: unitId,
            redoMutations,
            undoMutations,
        });

        commandService.executeCommand(UpdateDataValidationMutation.id, mutationParams);
        return true;
    },
};

export interface IRemoveAllDataValidationCommandParams extends ISheetCommandSharedParams {
}

/**
 * @deprecated `RemoveAllDataValidationCommand` is deprecated, please use `RemoveSheetAllDataValidationCommand` in `@univerjs/sheets-data-validation` instead!
 */
export const RemoveAllDataValidationCommand: ICommand<IRemoveAllDataValidationCommandParams> = {
    type: CommandType.COMMAND,
    id: 'data-validation.command.removeAll',
    handler(accessor, params) {
        const logService = accessor.get(ILogService);
        logService.error('[Deprecated]: `RemoveAllDataValidationCommand` is deprecated, please use `RemoveSheetAllDataValidationCommand` in `@univerjs/sheets-data-validation` instead!');

        if (!params) {
            return false;
        }
        const { unitId, subUnitId } = params;
        const commandService = accessor.get(ICommandService);
        const dataValidationModel = accessor.get(DataValidationModel);
        const undoRedoService = accessor.get(IUndoRedoService);
        const currentRules = [...dataValidationModel.getRules(unitId, subUnitId)];

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
