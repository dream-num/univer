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

import type { IMutation, Workbook } from '@univerjs/core';
import { CommandType, IUniverInstanceService } from '@univerjs/core';
import { UniverType } from '@univerjs/protocol';
import { ISheetDrawingService, type ISheetDrawingServiceParam } from '../../services/sheet-drawing.service';


export const InsertDrawingMutation: IMutation<ISheetDrawingServiceParam> = {
    id: 'sheet.mutation.insert-drawing',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const { unitId, subUnitId } = params;
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const sheetDrawingService = accessor.get(ISheetDrawingService);

        const universheet = univerInstanceService.getUnit<Workbook>(unitId, UniverType.UNIVER_SHEET);
        if (universheet == null) {
            throw new Error('universheet is null error!');
        }

        const worksheet = universheet.getSheetBySheetId(subUnitId);
        if (worksheet == null) {
            throw new Error('worksheet is null error!');
        }

        sheetDrawingService.addDrawing(params);

        return true;
    },
};
