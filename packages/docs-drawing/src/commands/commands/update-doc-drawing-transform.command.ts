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

import type { DocumentDataModel, IAccessor, ICommand, IObjectPositionH, IObjectPositionV, ISize, JSONXActions } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import {
    CommandType,
    ICommandService,
    IUniverInstanceService,
    JSONX,
    Tools,
    UniverInstanceType,
} from '@univerjs/core';
import { RichTextEditingMutation } from '@univerjs/docs';

export interface IDrawingDocTransform {
    drawingId: string;
    key: 'size' | 'angle' | 'positionH' | 'positionV';
    value: ISize | number | IObjectPositionH | IObjectPositionV;
}

export interface IUpdateDrawingDocTransformCommandParams {
    unitId: string;
    subUnitId: string;
    drawings: IDrawingDocTransform[];
}

export const UpdateDrawingDocTransformCommand: ICommand = {
    id: 'doc.command.update-drawing-doc-transform',
    type: CommandType.COMMAND,
    handler: (accessor: IAccessor, params?: IUpdateDrawingDocTransformCommandParams) => {
        if (!params) {
            return false;
        }

        const commandService = accessor.get(ICommandService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const { unitId, drawings } = params;
        const documentDataModel = univerInstanceService.getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC);
        if (!documentDataModel) {
            return false;
        }

        const oldDrawings = documentDataModel.getSnapshot().drawings ?? {};
        const jsonX = JSONX.getInstance();
        const actions: JSONXActions = [];

        for (const { drawingId, key, value } of drawings) {
            const oldValue = oldDrawings[drawingId]?.docTransform?.[key];
            if (oldValue == null || !Tools.diffValue(oldValue, value)) {
                actions.push(jsonX.replaceOp(['drawings', drawingId, 'docTransform', key], oldValue, value)!);
            }
        }

        return Boolean(commandService.syncExecuteCommand<IRichTextEditingMutationParams, IRichTextEditingMutationParams>(RichTextEditingMutation.id, {
            unitId,
            actions: actions.reduce((acc, action) => JSONX.compose(acc, action as JSONXActions), null as JSONXActions),
            textRanges: null,
            debounce: true,
        }));
    },
};
