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

import type { IAccessor, ICommand, IMutationInfo, JSONXActions, Nullable } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import type { IDrawingJsonUndo1, IDrawingOrderMapParam } from '@univerjs/drawing';
import {
    ArrangeTypeEnum,
    CommandType,
    ICommandService,
    JSONX,
    Tools,
} from '@univerjs/core';
import { RichTextEditingMutation } from '@univerjs/docs';
import { IDocDrawingService } from '@univerjs/docs-drawing';

export interface ISetDrawingArrangeCommandParams extends IDrawingOrderMapParam {
    arrangeType: ArrangeTypeEnum;
}

/**
 * The command to arrange drawings.
 */
export const SetDocDrawingArrangeCommand: ICommand = {
    id: 'doc.command.set-drawing-arrange',

    type: CommandType.COMMAND,

    handler: (accessor: IAccessor, params?: ISetDrawingArrangeCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const docDrawingService = accessor.get(IDocDrawingService);

        if (params == null) {
            return false;
        }

        const { unitId, subUnitId, drawingIds, arrangeType } = params;

        const drawingOrderMapParam = { unitId, subUnitId, drawingIds } as IDrawingOrderMapParam;

        let jsonOp: Nullable<IDrawingJsonUndo1>;
        if (arrangeType === ArrangeTypeEnum.forward) {
            jsonOp = docDrawingService.getForwardDrawingsOp(drawingOrderMapParam) as IDrawingJsonUndo1;
        } else if (arrangeType === ArrangeTypeEnum.backward) {
            jsonOp = docDrawingService.getBackwardDrawingOp(drawingOrderMapParam) as IDrawingJsonUndo1;
        } else if (arrangeType === ArrangeTypeEnum.front) {
            jsonOp = docDrawingService.getFrontDrawingsOp(drawingOrderMapParam) as IDrawingJsonUndo1;
        } else if (arrangeType === ArrangeTypeEnum.back) {
            jsonOp = docDrawingService.getBackDrawingsOp(drawingOrderMapParam) as IDrawingJsonUndo1;
        }

        if (jsonOp == null) {
            return false;
        }

        const { redo } = jsonOp;

        if (redo == null) {
            return false;
        }

        const rawActions: JSONXActions = [];

        // TODO: @JOCS, It's best to build the actions yourself.
        let redoCopy = Tools.deepClone(redo)! as JSONXActions;
        redoCopy = redoCopy!.slice(3)! as JSONXActions;
        redoCopy!.unshift('drawingsOrder');
        rawActions.push(redoCopy!);

        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                actions: [],
                textRanges: null,
            },
        };

        doMutation.params.actions = rawActions.reduce((acc, cur) => {
            return JSONX.compose(acc, cur as JSONXActions);
        }, null as JSONXActions);

        const result = commandService.syncExecuteCommand<
            IRichTextEditingMutationParams,
            IRichTextEditingMutationParams
        >(doMutation.id, doMutation.params);

        return Boolean(result);
    },
};
