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
import { CommandType, IUniverInstanceService, Tools } from '@univerjs/core';

export interface IUpdateElementOperationParams {
    unitId: string;
    oKey: string;
    props: Record<string, any>;
};

export const UpdateSlideElementOperation: ICommand<IUpdateElementOperationParams> = {
    id: 'slide.operation.update-element',
    type: CommandType.OPERATION,
    handler: (accessor, params: IUpdateElementOperationParams) => {
        const { oKey, props } = params!;
        const univerInstanceService = accessor.get(IUniverInstanceService);
        // const slideData = univerInstanceService.getCurrentUnitForType<SlideDataModel>(UniverInstanceType.UNIVER_SLIDE);

        const unitId = params?.unitId;
        const slideData = univerInstanceService.getUnit<SlideDataModel>(unitId);
        if (!slideData) return false;

        const activePage = slideData.getActivePage()!;
        activePage.pageElements[oKey] = Tools.deepMerge(activePage.pageElements[oKey], props);
        slideData.updatePage(activePage.id, activePage);

        return true;
    },
};
