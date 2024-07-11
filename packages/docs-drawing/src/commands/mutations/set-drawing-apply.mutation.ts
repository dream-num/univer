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

import type { DocumentDataModel, IMutation } from '@univerjs/core';
import { CommandType, IUniverInstanceService } from '@univerjs/core';
import type { IDrawingGroupUpdateParam, IDrawingJson1Type, IDrawingOrderMapParam, IDrawingSearch } from '@univerjs/drawing';
import { IDrawingManagerService } from '@univerjs/drawing';
import { IDocDrawingService } from '../../services/doc-drawing.service';

export enum DocDrawingApplyType {
    INSERT,
    REMOVE,
    UPDATE,
    ARRANGE,
    GROUP,
    UNGROUP,
}

export interface ISetDrawingApplyMutationParams extends IDrawingJson1Type {
    type: DocDrawingApplyType;
}

// REFACTOR: @JOCS 需要移除！！！
export const SetDocDrawingApplyMutation: IMutation<ISetDrawingApplyMutationParams> = {
    id: 'doc.mutation.set-drawing-apply',

    type: CommandType.MUTATION,

    handler: (accessor, params) => {
        const drawingManagerService = accessor.get(IDrawingManagerService);
        const docDrawingService = accessor.get(IDocDrawingService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const { op, unitId, subUnitId, type, objects } = params;

        drawingManagerService.applyJson1(unitId, subUnitId, op);
        docDrawingService.applyJson1(unitId, subUnitId, op);

        switch (type) {
            case DocDrawingApplyType.INSERT:
                drawingManagerService.addNotification(objects as IDrawingSearch[]);
                docDrawingService.addNotification(objects as IDrawingSearch[]);
                break;
            case DocDrawingApplyType.REMOVE:
                drawingManagerService.removeNotification(objects as IDrawingSearch[]);
                docDrawingService.removeNotification(objects as IDrawingSearch[]);
                break;
            case DocDrawingApplyType.UPDATE:
                drawingManagerService.updateNotification(objects as IDrawingSearch[]);
                docDrawingService.updateNotification(objects as IDrawingSearch[]);
                break;
            case DocDrawingApplyType.ARRANGE:
                drawingManagerService.orderNotification(objects as IDrawingOrderMapParam);
                docDrawingService.orderNotification(objects as IDrawingOrderMapParam);
                break;
            case DocDrawingApplyType.GROUP:
                drawingManagerService.groupUpdateNotification(objects as IDrawingGroupUpdateParam[]);
                break;
            case DocDrawingApplyType.UNGROUP:
                drawingManagerService.ungroupUpdateNotification(objects as IDrawingGroupUpdateParam[]);
                break;
        }

        // TODO: @Jocs Update the document snapshot
        const documentDataModel = univerInstanceService.getUnit(unitId) as DocumentDataModel;
        // documentDataModel.getSnapshot().drawings = drawingManagerService.getDrawingData(unitId, subUnitId) as IDrawings;
        // documentDataModel.getSnapshot().drawingsOrder = drawingManagerService.getDrawingOrder(unitId, subUnitId);

        return true;
    },
};
