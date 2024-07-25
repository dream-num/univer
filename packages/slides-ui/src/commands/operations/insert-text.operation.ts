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
import { IRenderManagerService } from '@univerjs/engine-render';
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { SlideUIController } from '../../controllers/slide-ui.controller';

export interface ISlideAddTextParam {
    text: string;
};

export const SlideAddTextOperation: ICommand<ISlideAddTextParam> = {
    id: 'slide.operation.add-text',
    type: CommandType.OPERATION,
    handler: async (accessor, params) => {
        const elementId = Tools.generateRandomId(6);
        const defaultWidth = 100;
        const defaultheight = 40;

        const textContent = params?.text || 'Text here';
        const elmentData = {
            id: elementId,
            zIndex: 0,
            left: 430,
            top: 42,
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
        // const rs = accessor.get(IRenderManagerService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const slideData = univerInstanceService.getCurrentUnitForType<SlideDataModel>(UniverInstanceType.UNIVER_SLIDE);
        if (!slideData) return false;

        const activePage = slideData.getActivePage()!;
        activePage.pageElements[elementId] = elmentData;
        slideData.updatePage(activePage.id, activePage);

        return true;
    },
};
