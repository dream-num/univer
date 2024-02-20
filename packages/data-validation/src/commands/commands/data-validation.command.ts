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

import { CommandType, type ICommand } from '@univerjs/core';

// TODO: redo & undo
export const AddDataValidationCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'data-validation.command.addRule',
    handler(accessor, params) {
        return true;
    },
};

export interface IRemoveDataValidationCommandParams {
    ruleId: string;
}

export const RemoveDataValidationCommand: ICommand<IRemoveDataValidationCommandParams> = {
    type: CommandType.COMMAND,
    id: 'data-validation.command.removeRule',
    handler(accessor, params) {
        return true;
    },
};

export interface IUpdateDataValidationCommand {
    ruleId: string;
}

export const UpdateDataValidationCommand: ICommand<IRemoveDataValidationCommandParams> = {
    type: CommandType.COMMAND,
    id: 'data-validation.command.updateRule',
    handler(accessor, params) {
        return true;
    },
};

export interface IRemoveAllDataValidationCommand {

}

export const RemoveAllDataValidationCommand: ICommand<IRemoveAllDataValidationCommand> = {
    type: CommandType.COMMAND,
    id: 'data-validation.command.removeAll',
    handler(accessor, params) {
        return true;
    },
};
