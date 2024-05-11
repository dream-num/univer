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

import { CommandType, type ICommand, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';

export const DisposeCurrentUnitCommand: ICommand = {
    id: 'debugger.command.dispose-current-unit',
    type: CommandType.COMMAND,
    handler: async (accessor) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const focused = univerInstanceService.getFocusedUnit();
        if (!focused) return false;

        return univerInstanceService.disposeUnit(focused.getUnitId());
    },
};

export const CreateEmptySheetCommand: ICommand = {
    id: 'debugger.command.create-empty-sheet',
    type: CommandType.COMMAND,
    handler: async (accessor) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        univerInstanceService.createUnit(UniverInstanceType.UNIVER_SHEET, {});
        return true;
    },
};
