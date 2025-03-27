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

import type { ICommand, IPageElement, SlideDataModel } from '@univerjs/core';
import { CommandType, generateRandomId, ICommandService, IUniverInstanceService, PageElementType } from '@univerjs/core';
import { CanvasView } from '../../controllers/canvas-view';

export interface ISlideAddTextParam {
    text: string;
    unitId: string;
};

export const SlideAddTextCommand: ICommand = {
    id: 'slide.command.add-text',
    type: CommandType.COMMAND,
    handler: async (accessor) => {
        const commandService = accessor.get(ICommandService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const unitId = univerInstanceService.getFocusedUnit()?.getUnitId();
        return await commandService.executeCommand(SlideAddTextOperation.id, { unitId });
    },

};

export const SlideAddTextOperation: ICommand<ISlideAddTextParam> = {
    id: 'slide.operation.add-text',
    type: CommandType.OPERATION,
    handler: async (accessor, params: ISlideAddTextParam) => {
        const unitId = params.unitId;

        const elementId = generateRandomId(6);
        const defaultWidth = 220;
        const defaultheight = 40;
        const left = 230;
        const top = 142;
        const textContent = params?.text || 'A New Text';

        const univerInstanceService = accessor.get(IUniverInstanceService);
        // const slideData = univerInstanceService.getCurrentUnitForType<SlideDataModel>(UniverInstanceType.UNIVER_SLIDE);

        const slideData = univerInstanceService.getUnit<SlideDataModel>(unitId);
        if (!slideData) return false;

        const activePage = slideData.getActivePage()!;

        const elements = Object.values(activePage.pageElements);
        const maxIndex = (elements?.length) ? Math.max(...elements.map((element) => element.zIndex)) : 21;
        const elementData: IPageElement = {
            id: elementId,
            zIndex: maxIndex + 1,
            left,
            top,
            width: defaultWidth,
            height: defaultheight,
            title: 'text',
            description: '',
            type: PageElementType.TEXT,
            richText: {
                text: textContent,
                fs: 30,
                cl: {
                    rgb: 'rgb(51, 51, 51)',
                },
                bl: 1,
            },
        };

        activePage.pageElements[elementId] = elementData;
        slideData.updatePage(activePage.id, activePage);

        const canvasview = accessor.get(CanvasView);
        const sceneObject = canvasview.createObjectToPage(elementData, activePage.id, unitId);
        // make object active: a control rect wrap the object.
        if (sceneObject) {
            canvasview.setObjectActiveByPage(sceneObject, activePage.id, unitId);
        }

        return true;
    },
};
