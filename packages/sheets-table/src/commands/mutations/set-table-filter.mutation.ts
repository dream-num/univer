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
import type { ITableFilterItem } from '../../types/type';
import { CommandType } from '@univerjs/core';
import { TableManager } from '../../model/table-manager';

export interface ISetSheetTableParams {
    unitId: string;
    tableId: string;
    column: number;
    tableFilter: ITableFilterItem | undefined;
}

export const SetSheetTableFilterMutation: IMutation<ISetSheetTableParams & { tableId: string }> = {
    id: 'sheet.mutation.set-table-filter',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const { tableId, unitId, column, tableFilter } = params;
        const tableManager = accessor.get(TableManager);
        tableManager.addFilter(unitId, tableId, column, tableFilter);
        return true;
    },
};
