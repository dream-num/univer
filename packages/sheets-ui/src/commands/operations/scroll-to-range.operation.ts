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

import type { IScrollToCellCommandParams } from '../commands/set-scroll.command';
import { CommandType, type ICommand, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { SheetsScrollRenderController } from '../../controllers/render-controllers/scroll.render-controller';

export const ScrollToRangeOperation: ICommand<IScrollToCellCommandParams> = {
    id: 'sheet.operation.scroll-to-range',
    type: CommandType.OPERATION,
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }
        const instanceService = accessor.get(IUniverInstanceService);
        const renderManagerService = accessor.get(IRenderManagerService);
        const scrollController = renderManagerService
            .getRenderById(instanceService.getCurrentUnitForType(UniverInstanceType.UNIVER_SHEET)!.getUnitId())!
            .with(SheetsScrollRenderController);

        return scrollController.scrollToRange(params.range, params.forceTop, params.forceLeft);
    },
};
