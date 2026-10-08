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

import type { IDrawingSearch, IOperation } from '@univerjs/core';
import { CommandType } from '@univerjs/core';
import { getDrawingShapeKeyByDrawingSearch } from '@univerjs/drawing';
import { Image, IRenderManagerService } from '@univerjs/engine-render';

export interface IPreviewSheetImageOpacityOperationParams extends IDrawingSearch {
    opacity: number;
}

export const PreviewSheetImageOpacityOperation: IOperation<IPreviewSheetImageOpacityOperationParams> = {
    id: 'sheet.operation.preview-image-opacity',
    type: CommandType.OPERATION,
    handler: (accessor, params) => {
        if (!params || !Number.isFinite(params.opacity)) {
            return false;
        }

        const renderManagerService = accessor.get(IRenderManagerService);
        const scene = renderManagerService.getRenderUnitById(params.unitId)?.scene;
        const image = scene?.getObject(getDrawingShapeKeyByDrawingSearch(params));
        if (!(image instanceof Image)) {
            return false;
        }

        image.setOpacity(Math.min(Math.max(params.opacity, 0), 1));
        return true;
    },
};
