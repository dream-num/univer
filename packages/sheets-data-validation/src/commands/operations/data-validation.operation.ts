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

import { CommandType, type ICommand, IUniverInstanceService } from '@univerjs/core';
import { DataValidationDropdownManagerService } from '../../services/dropdown-manager.service';

export interface IShowDataValidationDropdownParams {
    unitId: string;
    subUnitId: string;
    row: number;
    column: number;
}

export const ShowDataValidationDropdown: ICommand<IShowDataValidationDropdownParams> = {
    type: CommandType.OPERATION,
    id: 'sheet.operation.show-data-validation-dropdown',
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const dataValidationDropdownManagerService = accessor.get(DataValidationDropdownManagerService);
        const { unitId, subUnitId, row, column } = params;

        dataValidationDropdownManagerService.showDataValidationDropdown(
            unitId,
            subUnitId,
            row,
            column
        );
        return true;
    },
};

export const HideDataValidationDropdown: ICommand = {
    type: CommandType.OPERATION,
    id: 'sheet.operation.hide-data-validation-dropdown',
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const dataValidationDropdownManagerService = accessor.get(DataValidationDropdownManagerService);
        dataValidationDropdownManagerService.hideDropdown();
        return true;
    },
};
