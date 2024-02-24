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

import { CommandType, ICommandService } from '@univerjs/core';
import type { ICommand, IDataValidationRule, IRange } from '@univerjs/core';
import type { IAddDataValidationMutationParams } from '../..';
import type { IUpdateRulePayload } from '../../types/interfaces/i-update-rule-payload';
import { AddDataValidationMutation, RemoveAllDataValidationMutation, RemoveDataValidationMutation, UpdateDataValidationMutation } from '../mutations/data-validation.mutation';

export interface IAddDataValidationCommandParams {
    unitId: string;
    subUnitId: string;
    rule: Omit<IDataValidationRule, 'ranges'> & {
        range: IRange;
    };
}

// TODO: redo & undo
export const AddDataValidationCommand: ICommand<IAddDataValidationCommandParams> = {
    type: CommandType.COMMAND,
    id: 'data-validation.command.addRule',
    async  handler(accessor, params) {
        if (!params) {
            return false;
        }

        const commandService = accessor.get(ICommandService);
        const mutationParams: IAddDataValidationMutationParams = {
            ...params,
            rule: {
                ...params.rule,
                ranges: [params.rule.range],
            },
        };
        await commandService.executeCommand(AddDataValidationMutation.id, mutationParams);
        return true;
    },
};

export interface IRemoveDataValidationCommandParams {
    ruleId: string;
    unitId: string;
    subUnitId: string;
}

export const RemoveDataValidationCommand: ICommand<IRemoveDataValidationCommandParams> = {
    type: CommandType.COMMAND,
    id: 'data-validation.command.removeRule',
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const commandService = accessor.get(ICommandService);

        commandService.executeCommand(RemoveDataValidationMutation.id, params);
        return true;
    },
};

export interface IUpdateDataValidationCommandParams {
    payload: IUpdateRulePayload;
    unitId: string;
    subUnitId: string;
    ruleId: string;
}

export const UpdateDataValidationCommand: ICommand<IUpdateDataValidationCommandParams> = {
    type: CommandType.COMMAND,
    id: 'data-validation.command.updateRule',
    handler(accessor, params) {
        if (!params) {
            return false;
        }

        const commandService = accessor.get(ICommandService);
        commandService.executeCommand(UpdateDataValidationMutation.id, params);
        return true;
    },
};

export interface IRemoveAllDataValidationCommandParams {
    unitId: string;
    subUnitId: string;
}

export const RemoveAllDataValidationCommand: ICommand<IRemoveAllDataValidationCommandParams> = {
    type: CommandType.COMMAND,
    id: 'data-validation.command.removeAll',
    handler(accessor, params) {
        const commandService = accessor.get(ICommandService);
        commandService.executeCommand(RemoveAllDataValidationMutation.id, params);
        return true;
    },
};
