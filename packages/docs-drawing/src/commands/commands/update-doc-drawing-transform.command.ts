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
    DrawingTypeEnum,
    ICommandService,
    IUniverInstanceService,
    JSONX,
    Tools,
    UniverInstanceType,
} from '@univerjs/core';
import { DocHistoryAction, RichTextEditingMutation } from '@univerjs/docs';

import { findDocDrawing } from '../../services/doc-drawing-source';

export interface IDrawingDocTransform {
    drawingId: string;
    key: 'size' | 'angle' | 'positionH' | 'positionV' | 'flipX' | 'flipY' | 'srcRect' | 'prstGeom' | 'adjustValues';
    value: ISize | number | boolean | IObjectPositionH | IObjectPositionV | Nullable<ISrcRect> | IDocImage['prstGeom'] | IDocImage['adjustValues'];
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

        const snapshot = documentDataModel.getSnapshot();
        const historyAction = drawings.length > 0 && drawings.every(({ drawingId }) =>
            findDocDrawing(snapshot, drawingId)?.drawing.drawingType === DrawingTypeEnum.DRAWING_IMAGE
        )
            ? DocHistoryAction.UpdateImage
            : undefined;
        const jsonX = JSONX.getInstance();
        const actions: JSONXActions[] = [];

        for (const { drawingId, key, value } of drawings) {
            const source = findDocDrawing(snapshot, drawingId);
            if (!source) {
                return false;
            }
            const oldDrawing = source.drawing;
            const isImageProperty = key === 'srcRect' || key === 'prstGeom' || key === 'adjustValues';
            const oldValue = isImageProperty
                ? (key in oldDrawing ? Reflect.get(oldDrawing, key) : undefined)
                : oldDrawing?.docTransform?.[key];
            if (!Tools.diffValue(oldValue, value)) {
                const path = isImageProperty
                    ? [...source.path, key]
                    : [...source.path, 'docTransform', key];
                // Optional transform fields such as flips do not exist in older documents.
                const action = oldValue === undefined
                    ? jsonX.insertOp(path, value)
                    : jsonX.replaceOp(path, oldValue, value);
                actions.push(action);
            }
        }

        return Boolean(commandService.syncExecuteCommand<IRichTextEditingMutationParams, IRichTextEditingMutationParams>(RichTextEditingMutation.id, {
            unitId,
            historyAction,
            actions: actions.reduce<JSONXActions>((acc, action) => JSONX.compose(acc, action), null),
            textRanges: null,
            debounce: true,
        }));
    },
};
