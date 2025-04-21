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
import type { ITableOptions, ITableRange } from '../../types/type';
import { CommandType } from '@univerjs/core';
import { SheetTableService } from '../../services/table-service';

export interface IAddSheetTableParams {
    unitId: string;
    subUnitId: string;
    name: string;
    range: ITableRange;
    // TODO 这里的参数应该聚合 Meta Columns Options 等信息
    options?: ITableOptions;
    tableId?: string;
    header?: string[];
}

export const AddSheetTableMutation: IMutation<IAddSheetTableParams & { tableId: string }> = {
    id: 'sheet.mutation.add-table',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const { tableId, unitId, subUnitId, name, range, header, options } = params;
        const sheetTableService = accessor.get(SheetTableService);
        sheetTableService.addTable(unitId, subUnitId, name, range, header, tableId, options);
        return true;
    },
};
