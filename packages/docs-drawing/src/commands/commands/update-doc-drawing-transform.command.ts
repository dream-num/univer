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

import type { DocumentDataModel, IAccessor, ICommand, IObjectPositionH, IObjectPositionV, ISize, ISrcRect, JSONXActions, Nullable } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import type { IDocImage } from '../../services/doc-drawing.service';
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
    key: 'size' | 'angle' | 'positionH' | 'positionV' | 'flipX' | 'flipY' | 'srcRect';
    value: ISize | number | boolean | IObjectPositionH | IObjectPositionV | Nullable<ISrcRect>;
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
            const oldDrawing = oldDrawings[drawingId];
            const oldValue = key === 'srcRect'
                ? (oldDrawing as IDocImage | undefined)?.srcRect
                : oldDrawing?.docTransform?.[key];
            if (!Tools.diffValue(oldValue, value)) {
                const path = key === 'srcRect'
                    ? ['drawings', drawingId, key]
                    : ['drawings', drawingId, 'docTransform', key];
                // Optional transform fields such as flips do not exist in older documents.
                actions.push(oldValue === undefined
                    ? jsonX.insertOp(path, value)!
                    : jsonX.replaceOp(path, oldValue, value)!);
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
