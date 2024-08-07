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

export interface IDocTableTabCommandParams {}

export const DocTableTabCommand: ICommand<IDocTableTabCommandParams> = {
    id: 'doc.table.tab-in-table',
    type: CommandType.COMMAND,

    handler: async () => {
        // TODO: implement tab in table
        return true;
    },
};

export interface IDocTableShiftTabCommandParams {}

export const DocTableShiftTabCommand: ICommand<IDocTableShiftTabCommandParams> = {
    id: 'doc.table.shift-tab-in-table',
    type: CommandType.COMMAND,

    handler: async () => {
        // TODO: implement tab in table
        return true;
    },
};
