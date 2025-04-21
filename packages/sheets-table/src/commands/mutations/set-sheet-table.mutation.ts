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

import type { IMutation } from '@univerjs/core';
import type { ITableSetConfig } from '../../types/type';
import { CommandType } from '@univerjs/core';
import { TableManager } from '../../model/table-manager';

export interface ISetSheetTableMutationParams {
    unitId: string;
    subUnitId: string;
    tableId: string;
    config: ITableSetConfig;
}

export const SetSheetTableMutation: IMutation<ISetSheetTableMutationParams> = {
    id: 'sheet.mutation.set-sheet-table',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }

        const { unitId, tableId, config } = params;
        const tableManager = accessor.get(TableManager);
        tableManager.setTableByConfig(unitId, tableId, config);

        return true;
    },
};
