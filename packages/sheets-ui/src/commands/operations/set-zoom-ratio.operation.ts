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

import { CommandType } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import type { IOperation } from '@univerjs/core';
import { SheetsZoomRenderController } from '../../controllers/render-controllers/zoom.render-controller';

export interface ISetZoomRatioOperationParams {
    zoomRatio: number;
    unitId: string;
    subUnitId: string;
}

export const SetZoomRatioOperation: IOperation<ISetZoomRatioOperationParams> = {
    id: 'sheet.operation.set-zoom-ratio',
    type: CommandType.OPERATION,
    handler: (accessor, params: ISetZoomRatioOperationParams) => {
        const renderManagerService = accessor.get(IRenderManagerService);
        const renderUnit = renderManagerService.getRenderById(params.unitId);
        if (!renderUnit) return false;

        return renderUnit.with(SheetsZoomRenderController).updateZoom(params.subUnitId, params.zoomRatio);
    },
};
