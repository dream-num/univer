/**
 * Copyright 2023 DreamNum Inc.
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

import { FindService } from '../../services/find.service';

export const ShowModalOperation: ICommand = {
    id: 'find.operation.show-modal',
    type: CommandType.OPERATION,
    handler: async (accessor: IAccessor) => {
        const findService = accessor.get(FindService);
        findService.showModal(true);
        return true;
    },
};
export const HideModalOperation: ICommand = {
    id: 'find.operation.hide-modal',
    type: CommandType.OPERATION,
    handler: async (accessor: IAccessor) => {
        const findService = accessor.get(FindService);
        findService.showModal(false);
        return true;
    },
};
