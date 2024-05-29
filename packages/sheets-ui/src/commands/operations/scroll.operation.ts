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

import type { IOperation } from '@univerjs/core';
import { CommandType, IUniverInstanceService } from '@univerjs/core';

import type { IScrollManagerInsertParam } from '../../services/scroll-manager.service';
import { ScrollManagerService } from '../../services/scroll-manager.service';

export const SetScrollOperation: IOperation<IScrollManagerInsertParam> = {
    id: 'sheet.operation.set-scroll',

    type: CommandType.OPERATION,

    handler: (accessor, params) => {
        if (params == null) {
            return false;
        }

        const scrollManagerService = accessor.get(ScrollManagerService);
        const currentService = accessor.get(IUniverInstanceService);
        const workbook = currentService.getUniverSheetInstance(params!.unitId);
        const worksheet = workbook!.getSheetBySheetId(params!.sheetId);
        const { xSplit, ySplit } = worksheet!.getConfig().freeze;

        if (!worksheet) return false;
        const config = worksheet.getConfig();
        config.scrollLeft = params.scrollLeft;
        config.scrollTop = params.scrollTop;

        scrollManagerService.addOrReplaceByParam({
            ...params,
            sheetViewStartRow: params.sheetViewStartRow - ySplit,
            sheetViewStartColumn: params.sheetViewStartColumn - xSplit,
        });

        return true;
    },
};
