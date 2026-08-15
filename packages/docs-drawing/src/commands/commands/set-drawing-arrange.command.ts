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

import type { DocumentDataModel, IAccessor, ICommand, IDocumentData, JSONXActions } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import type { IDrawingOrderMapParam } from '@univerjs/drawing';
import {
    ArrangeTypeEnum,
    CommandType,
    ICommandService,
    IUniverInstanceService,
    JSONX,
    normalizeDrawingOrderIndex,
    UniverInstanceType,
} from '@univerjs/core';
import { RichTextEditingMutation } from '@univerjs/docs';

export type ISetDocDrawingArrangeCommandParams = IDrawingOrderMapParam & (
    { arrangeType: ArrangeTypeEnum; zOrder?: never }
    | { arrangeType?: never; zOrder: number }
);

const DRAWINGS_ORDER_KEY = 'drawingsOrder' satisfies keyof IDocumentData;

/**
 * Calculates the target model order. Adjacent moves treat selected drawings as a group,
 * so selected drawings keep their relative order instead of crossing each other.
 */
function getArrangedDrawingOrder(
    drawingOrder: string[],
    drawingIds: string[],
    arrangeType: ArrangeTypeEnum
): string[] {
    const selectedDrawingIds = new Set(drawingIds.filter((drawingId) => drawingOrder.includes(drawingId)));
    const arrangedDrawingOrder = [...drawingOrder];

    if (selectedDrawingIds.size === 0) {
        return arrangedDrawingOrder;
    }

    if (arrangeType === ArrangeTypeEnum.forward) {
        for (let index = arrangedDrawingOrder.length - 2; index >= 0; index--) {
            if (selectedDrawingIds.has(arrangedDrawingOrder[index]) && !selectedDrawingIds.has(arrangedDrawingOrder[index + 1])) {
                [arrangedDrawingOrder[index], arrangedDrawingOrder[index + 1]] =
                    [arrangedDrawingOrder[index + 1], arrangedDrawingOrder[index]];
            }
        }
    } else if (arrangeType === ArrangeTypeEnum.backward) {
        for (let index = 1; index < arrangedDrawingOrder.length; index++) {
            if (selectedDrawingIds.has(arrangedDrawingOrder[index]) && !selectedDrawingIds.has(arrangedDrawingOrder[index - 1])) {
                [arrangedDrawingOrder[index], arrangedDrawingOrder[index - 1]] =
                    [arrangedDrawingOrder[index - 1], arrangedDrawingOrder[index]];
            }
        }
    } else if (arrangeType === ArrangeTypeEnum.front || arrangeType === ArrangeTypeEnum.back) {
        const selected = arrangedDrawingOrder.filter((drawingId) => selectedDrawingIds.has(drawingId));
        const unselected = arrangedDrawingOrder.filter((drawingId) => !selectedDrawingIds.has(drawingId));

        return arrangeType === ArrangeTypeEnum.front
            ? [...unselected, ...selected]
            : [...selected, ...unselected];
    }

    return arrangedDrawingOrder;
}

function getDrawingOrderAtIndex(drawingOrder: string[], drawingIds: string[], zOrder: number): string[] {
    if (drawingIds.length !== 1) {
        return [...drawingOrder];
    }

    const arrangedDrawingOrder = [...drawingOrder];
    const currentIndex = arrangedDrawingOrder.indexOf(drawingIds[0]);
    if (currentIndex < 0) {
        return arrangedDrawingOrder;
    }

    const [drawingId] = arrangedDrawingOrder.splice(currentIndex, 1);
    const targetIndex = normalizeDrawingOrderIndex(zOrder, drawingOrder.length);
    arrangedDrawingOrder.splice(targetIndex, 0, drawingId);
    return arrangedDrawingOrder;
}

/**
 * Converts the target order into granular JSONX move operations. This avoids replacing
 * the entire drawingsOrder array and keeps collaboration conflicts scoped to moved items.
 */
function createDrawingOrderActions(drawingOrder: string[], arrangedDrawingOrder: string[]): JSONXActions {
    const jsonX = JSONX.getInstance();
    const workingDrawingOrder = [...drawingOrder];
    const rawActions: JSONXActions[] = [];

    for (let targetIndex = 0; targetIndex < arrangedDrawingOrder.length; targetIndex++) {
        const drawingId = arrangedDrawingOrder[targetIndex];
        const currentIndex = workingDrawingOrder.indexOf(drawingId);

        if (currentIndex < 0 || currentIndex === targetIndex) {
            continue;
        }

        const action = jsonX.moveOp(
            [DRAWINGS_ORDER_KEY, currentIndex],
            [DRAWINGS_ORDER_KEY, targetIndex]
        );
        if (action) {
            rawActions.push(action);
        }

        workingDrawingOrder.splice(currentIndex, 1);
        workingDrawingOrder.splice(targetIndex, 0, drawingId);
    }

    return rawActions.reduce<JSONXActions>(
        (actions, action) => JSONX.compose(actions, action),
        null
    );
}

/**
 * The command to arrange drawings.
 */
export const SetDocDrawingArrangeCommand: ICommand = {
    id: 'doc.command.set-drawing-arrange',

    type: CommandType.COMMAND,

    handler: (accessor: IAccessor, params?: ISetDocDrawingArrangeCommandParams) => {
        const commandService = accessor.get(ICommandService);

        if (params == null) {
            return false;
        }

        const { unitId, drawingIds } = params;
        const documentDataModel = accessor.get(IUniverInstanceService)
            .getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC);
        const drawingOrder = documentDataModel?.getDrawingsOrder();
        if (!drawingOrder) {
            return false;
        }

        const arrangedDrawingOrder = params.zOrder !== undefined
            ? getDrawingOrderAtIndex(drawingOrder, drawingIds, params.zOrder)
            : getArrangedDrawingOrder(drawingOrder, drawingIds, params.arrangeType);
        const actions = createDrawingOrderActions(drawingOrder, arrangedDrawingOrder);
        if (JSONX.isNoop(actions)) {
            return false;
        }

        const result = commandService.syncExecuteCommand<
            IRichTextEditingMutationParams,
            IRichTextEditingMutationParams
        >(RichTextEditingMutation.id, {
            unitId,
            actions,
            textRanges: null,
        });

        return Boolean(result);
    },
};
