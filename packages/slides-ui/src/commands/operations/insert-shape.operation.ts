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

import type { IAccessor, ICommand, SlideDataModel } from '@univerjs/core';
import { BasicShapes, CommandType, generateRandomId, ICommandService, IUniverInstanceService, LocaleService, PageElementType } from '@univerjs/core';
import { ObjectType } from '@univerjs/engine-render';

import { ISidebarService } from '@univerjs/ui';
import { COMPONENT_SLIDE_SIDEBAR } from '../../components/sidebar/Sidebar';
import { CanvasView } from '../../controllers/canvas-view';

export interface IInsertShapeOperationParams {
    unitId: string;
};

export const InsertSlideShapeRectangleCommand: ICommand = {
    id: 'slide.command.insert-float-shape',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor) => {
        const commandService = accessor.get(ICommandService);
        const instanceService = accessor.get(IUniverInstanceService);
        const unitId = instanceService.getFocusedUnit()?.getUnitId();
        return commandService.executeCommand(InsertSlideShapeRectangleOperation.id, { unitId });
    },
};

export const InsertSlideShapeRectangleOperation: ICommand<IInsertShapeOperationParams> = {
    id: 'slide.operation.insert-float-shape',
    type: CommandType.OPERATION,
    handler: async (accessor, params: IInsertShapeOperationParams) => {
        const id = generateRandomId(6);

        const univerInstanceService = accessor.get(IUniverInstanceService);
        // const slideData = univerInstanceService.getCurrentUnitForType<SlideDataModel>(UniverInstanceType.UNIVER_SLIDE);

        const unitId = params.unitId;
        const slideData = univerInstanceService.getUnit<SlideDataModel>(unitId);

        if (!slideData) return false;

        const activePage = slideData.getActivePage()!;
        const elements = Object.values(activePage.pageElements);
        const maxIndex = (elements?.length) ? Math.max(...elements.map((element) => element.zIndex)) : 20;
        const data = {
            id,
            zIndex: maxIndex + 1,
            left: 378,
            top: 142,
            width: 250,
            height: 250,
            title: id,
            description: '',
            type: PageElementType.SHAPE,
            shape: {
                shapeType: BasicShapes.Rect,
                text: '',
                shapeProperties: {
                    shapeBackgroundFill: {
                        rgb: 'rgb(0,0,255)',
                    },
                },
            },
        };
        activePage.pageElements[id] = data;
        slideData.updatePage(activePage.id, activePage);

        const canvasview = accessor.get(CanvasView);
        const sceneObject = canvasview.createObjectToPage(data, activePage.id, unitId);
        if (sceneObject) {
            canvasview.setObjectActiveByPage(sceneObject, activePage.id, unitId);
        }

        return true;
    },
};

export interface IToggleSlideEditSidebarOperation {
    visible: string;
    objectType: ObjectType;
}

export const ToggleSlideEditSidebarOperation: ICommand = {
    id: 'sidebar.operation.slide-shape',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor, params: IToggleSlideEditSidebarOperation) => {
        const { visible, objectType } = params;

        const sidebarService = accessor.get(ISidebarService);
        const localeService = accessor.get(LocaleService);

        let title = '';
        let children = '';
        if (objectType === ObjectType.RECT) {
            title = 'slide.sidebar.shape';
            children = COMPONENT_SLIDE_SIDEBAR;
        } else if (objectType === ObjectType.IMAGE) {
            title = 'slide.sidebar.image';
            children = COMPONENT_SLIDE_SIDEBAR;
        } else if (objectType === ObjectType.RICH_TEXT) {
            title = 'slide.sidebar.text';
            children = COMPONENT_SLIDE_SIDEBAR;
        }

        if (visible) {
            sidebarService.open({
                header: { title: localeService.t(title) },
                children: { label: children },
                onClose: () => {
                        // drawingManagerService.focusDrawing(null);
                },
                width: 360,
            });
        } else {
            sidebarService.close();
        }
        return true;
    },
};
