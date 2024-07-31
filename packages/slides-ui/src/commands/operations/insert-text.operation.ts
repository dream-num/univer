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

import type { ICommand, SlideDataModel } from '@univerjs/core';
import { CommandType, IUniverInstanceService, PageElementType, Tools, UniverInstanceType } from '@univerjs/core';
import { CanvasView } from '@univerjs/slides';
import { IRenderManagerService } from '@univerjs/engine-render';
import { SlideEditorBridgeRenderController } from '../../controllers/slide-editor-bridge.render-controller';
import { ISlideEditorBridgeService } from '../../services/slide-editor-bridge.service';

export interface ISlideAddTextParam {
    text: string;
};

export const SlideAddTextOperation: ICommand<ISlideAddTextParam> = {
    id: 'slide.operation.add-text',
    type: CommandType.OPERATION,
    handler: async (accessor, params) => {
        const elementId = Tools.generateRandomId(6);
        const defaultWidth = 220;
        const defaultheight = 40;
        const left = 230;
        const top = 142;
        const textContent = params?.text || 'A New Text';
        const elmentData = {
            id: elementId,
            zIndex: 2,
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

        const univerInstanceService = accessor.get(IUniverInstanceService);
        const slideData = univerInstanceService.getCurrentUnitForType<SlideDataModel>(UniverInstanceType.UNIVER_SLIDE);
        if (!slideData) return false;

        const activePage = slideData.getActivePage()!;
        activePage.pageElements[elementId] = elmentData;
        slideData.updatePage(activePage.id, activePage);

        const canvasview = accessor.get(CanvasView);
        const sceneObject = canvasview.createObjectToPage(elmentData, activePage.id);
        // make object active: a control rect wrap the object.
        if (sceneObject) {
            canvasview.setObjectActiveByPage(sceneObject, activePage.id);
        }

        // copycat from sheet
        {
            // const editorBridgeRenderController = accessor.get(SlideEditorBridgeRenderController);
            const renderManagerService = accessor.get(IRenderManagerService);
            const render = renderManagerService.getCurrent();
            const slideEditorBridgeRenderController = render?.with(SlideEditorBridgeRenderController);

            const rect = {
                x: left,
                y: top,
                width: defaultWidth,
                height: defaultheight,
            };
            slideEditorBridgeRenderController?.setTextRectXYWH(rect);

            // see cell-edit.operation.ts, sheet.operation.set-cell-edit-visible
            const slideEditorBridgeService = accessor.get(ISlideEditorBridgeService);
            const unitId = 'slide-test';
            slideEditorBridgeService.changeVisible({ visible: true, eventType: 3, unitId });
        }

        return true;
    },
};
