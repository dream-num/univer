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

import type { IDrawingSearch, IMutation } from '@univerjs/core';
import { CommandType } from '@univerjs/core';
import type { IDrawingGroupUpdateParam, IDrawingJson1Type, IDrawingOrderMapParam } from '@univerjs/drawing';
import { IDrawingManagerService } from '@univerjs/drawing';
import { ISheetDrawingService } from '../../services/sheet-drawing.service';

export enum DrawingApplyType {
    INSERT,
    REMOVE,
    UPDATE,
    ARRANGE,
    GROUP,
    UNGROUP,
}

export interface ISetDrawingApplyMutationParams extends IDrawingJson1Type {
    type: DrawingApplyType;
}

export const SetDrawingApplyMutation: IMutation<ISetDrawingApplyMutationParams> = {
    id: 'sheet.mutation.set-drawing-apply',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const drawingManagerService = accessor.get(IDrawingManagerService);
        const sheetDrawingService = accessor.get(ISheetDrawingService);

        const { op, unitId, subUnitId, type, objects } = params;

        drawingManagerService.applyJson1(unitId, subUnitId, op);
        sheetDrawingService.applyJson1(unitId, subUnitId, op);

        switch (type) {
            case DrawingApplyType.INSERT:
                drawingManagerService.addNotification(objects as IDrawingSearch[]);
                sheetDrawingService.addNotification(objects as IDrawingSearch[]);
                break;
            case DrawingApplyType.REMOVE:
                drawingManagerService.removeNotification(objects as IDrawingSearch[]);
                sheetDrawingService.removeNotification(objects as IDrawingSearch[]);
                break;
            case DrawingApplyType.UPDATE:
                drawingManagerService.updateNotification(objects as IDrawingSearch[]);
                sheetDrawingService.updateNotification(objects as IDrawingSearch[]);
                break;
            case DrawingApplyType.ARRANGE:
                drawingManagerService.orderNotification(objects as IDrawingOrderMapParam);
                sheetDrawingService.orderNotification(objects as IDrawingOrderMapParam);
                break;
            case DrawingApplyType.GROUP:
                drawingManagerService.groupUpdateNotification(objects as IDrawingGroupUpdateParam[]);
                break;
            case DrawingApplyType.UNGROUP:
                drawingManagerService.ungroupUpdateNotification(objects as IDrawingGroupUpdateParam[]);
                break;
        }

        return true;
    },
};
