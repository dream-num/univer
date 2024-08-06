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

import type { IAccessor, IOperation, SlideDataModel } from '@univerjs/core';
import { CommandType, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { CanvasView } from '@univerjs/slides';

export interface IActiveSlidePageOperationParams {
    id: string;
}
export const ActivateSlidePageOperation: IOperation<IActiveSlidePageOperationParams> = {
    id: 'slide.operation.activate-slide',
    type: CommandType.OPERATION,
    handler: (accessor: IAccessor, params: IActiveSlidePageOperationParams) => {
        const canvasView = accessor.get(CanvasView);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const model = univerInstanceService.getCurrentUnitForType<SlideDataModel>(UniverInstanceType.UNIVER_SLIDE);
        const id = model?.getActivePage()?.id;

        if (!id) return false;

        const page = canvasView.getRenderUnitByPageId(id);
        const transformer = page.scene?.getTransformer();

        if (!transformer) return false;
        transformer.clearControls();

        canvasView.activePage(params.id);
        return true;
    },
};
