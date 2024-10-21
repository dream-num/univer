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

import { CommandType, type IAccessor, IConfigService, type IOperation } from '@univerjs/core';
import { SHOW_GRIDLINE_CONFIG_KEY } from '../../controllers/config.schema';

export const ToggleGridlineOperation: IOperation = {
    id: 'sheet.operation.toggle-gridline',
    type: CommandType.OPERATION,
    handler: (accessor: IAccessor) => {
        const configService = accessor.get(IConfigService);
        const gridlineVisible = configService.getConfig(SHOW_GRIDLINE_CONFIG_KEY) !== false;
        configService.setConfig(SHOW_GRIDLINE_CONFIG_KEY, !gridlineVisible);
        return true;
    },
};

export const ShowGridlineOperation: IOperation = {
    id: 'sheet.operation.enable-gridline',
    type: CommandType.OPERATION,
    handler: (accessor) => {
        const configService = accessor.get(IConfigService);
        configService.setConfig(SHOW_GRIDLINE_CONFIG_KEY, true);
        return true;
    },
};

export const HideGridlineOperation: IOperation = {
    id: 'sheet.operation.hide-gridline',
    type: CommandType.OPERATION,
    handler: (accessor) => {
        const configService = accessor.get(IConfigService);
        configService.setConfig(SHOW_GRIDLINE_CONFIG_KEY, false);
        return true;
    },
};
