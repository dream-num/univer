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

import { CommandType, IUniverInstanceService, PageElementType, UniverInstanceType } from '@univerjs/core';
import { DRAWING_IMAGE_ALLOW_IMAGE_LIST, getImageSize, IImageIoService } from '@univerjs/drawing';
import { ILocalFileService } from '@univerjs/ui';
import type { ICommand, SlideDataModel } from '@univerjs/core';
import { CanvasView } from '../../controllers/canvas-view';

export const InsertSlideFloatImageCommand: ICommand<{}> = {
    id: 'slide.command.insert-float-image',
    type: CommandType.COMMAND,
    handler: async (accessor, params) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const unitId = univerInstanceService.getCurrentUnitForType(UniverInstanceType.UNIVER_SLIDE)?.getUnitId();
        if (!unitId) return false;

        const fileOpenerService = accessor.get(ILocalFileService);
        const files = await fileOpenerService.openFile({
            multiple: true,
            accept: DRAWING_IMAGE_ALLOW_IMAGE_LIST.map((image) => `.${image.replace('image/', '')}`).join(','),
        });
        if (files.length !== 1) return false;

        const imageIoService = accessor.get(IImageIoService);
        const imageParam = await imageIoService.saveImage(files[0]);
        if (!imageParam) return false;

        const { imageId, imageSourceType, source, base64Cache } = imageParam;
        const { width, height, image } = await getImageSize(base64Cache || '');

        const slideData = univerInstanceService.getUnit<SlideDataModel>(unitId);
        if (!slideData) return false;

        const activePage = slideData.getActivePage()!;
        const elements = Object.values(activePage.pageElements);
        const maxIndex = (elements?.length) ? Math.max(...elements.map((element) => element.zIndex)) : 20;
        const data = {
            id: imageId,
            zIndex: maxIndex + 1,
            left: 0,
            top: 0,
            width,
            height,
            title: '',
            description: '',
            type: PageElementType.IMAGE,
            image: {
                imageProperties: {
                    contentUrl: base64Cache,
                    imageSourceType,
                    source,
                    base64Cache,
                    image,
                },
            },
        };
        activePage.pageElements[imageId] = data;
        slideData.updatePage(activePage.id, activePage);

        const canvasView = accessor.get(CanvasView);
        const sceneObject = canvasView.createObjectToPage(data, activePage.id, unitId);
        if (sceneObject) {
            canvasView.setObjectActiveByPage(sceneObject, activePage.id, unitId);
        }

        return true;
    },
};
