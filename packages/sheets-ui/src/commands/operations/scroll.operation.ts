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

import type { IOperation } from '@univerjs/core';
import type { IScrollStateWithSearchParam } from '../../services/scroll-manager.service';

import { CommandType } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { SheetScrollManagerService } from '../../services/scroll-manager.service';

export const SetScrollOperation: IOperation<IScrollStateWithSearchParam> = {
    id: 'sheet.operation.set-scroll',
    type: CommandType.OPERATION,

    handler: (accessor, params: IScrollStateWithSearchParam) => {
        if (!params) {
            return false;
        }

        // freeze is handled by set-scroll.command.ts
        const { unitId, sheetId, offsetX, offsetY, sheetViewStartColumn, sheetViewStartRow } = params;
        const renderManagerService = accessor.get(IRenderManagerService);
        const scrollManagerService = renderManagerService.getRenderById(unitId)!.with(SheetScrollManagerService);
        // const currentService = accessor.get(IUniverInstanceService);
        // const workbook = currentService.getUniverSheetInstance(unitId);
        // const worksheet = workbook!.getSheetBySheetId(sheetId);
        // const { xSplit, ySplit } = worksheet!.getConfig().freeze;

        scrollManagerService.emitRawScrollParam({
            unitId,
            sheetId,
            offsetX,
            offsetY,
            sheetViewStartRow,
            sheetViewStartColumn,
        });

        return true;
    },
};
