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

import type { ICommand } from '@univerjs/core';
import { CommandType } from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';
import { ConditionalFormatMenuController } from '../../controllers/cf.menu.controller';
import { createDefaultRule } from '../../base/const';

interface IOpenConditionalFormatOperatorParams {
    value: number;
}
export const OpenConditionalFormatOperator: ICommand = {
    id: 'sheet.operation.open.conditional.format.panel',
    type: CommandType.OPERATION,
    handler: (accessor: IAccessor, params: IOpenConditionalFormatOperatorParams) => {
        const conditionalFormatMenuController = accessor.get(ConditionalFormatMenuController);
        if (params.value === 1) {
            conditionalFormatMenuController.openPanel();
        } else if (params.value === 2) {
            // create cf rule
            conditionalFormatMenuController.openPanel(createDefaultRule());
        }
        return true;
    },
};
