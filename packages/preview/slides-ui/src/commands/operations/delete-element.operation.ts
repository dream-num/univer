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

import type { ICommand, SlideDataModel } from '@univerjs/core';
import { CommandType, IUniverInstanceService } from '@univerjs/core';
import { CanvasView } from '../../controllers/canvas-view';

export interface IDeleteElementOperationParams {
    unitId: string;
    id: string;
};

export const DeleteSlideElementOperation: ICommand<IDeleteElementOperationParams> = {
    id: 'slide.operation.delete-element',
    type: CommandType.OPERATION,
    handler: (accessor, params) => {
        if (!params?.id) return false;

        const unitId = params.unitId;
        const univerInstanceService = accessor.get(IUniverInstanceService);
        // const slideData = univerInstanceService.getCurrentUnitForType<SlideDataModel>(UniverInstanceType.UNIVER_SLIDE);

        const slideData = univerInstanceService.getUnit<SlideDataModel>(unitId);

        if (!slideData) return false;

        const activePage = slideData.getActivePage()!;

        delete activePage.pageElements[params.id];

        slideData.updatePage(activePage.id, activePage);

        const canvasview = accessor.get(CanvasView);
        canvasview.removeObjectById(params.id, activePage.id, unitId);

        return true;
    },
};
