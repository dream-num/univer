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

import type {
    DocumentDataModel,
    ICommand,
    IDocumentBody,
    IDocumentData,
    IMutationInfo,
    ITextRange,
    UpdateDocsAttributeType,
} from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import type { ITextRangeWithStyle } from '@univerjs/engine-render';
import { BuildTextUtils, CommandType, ICommandService, IUniverInstanceService, JSONX, TextX, TextXActionType, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService, RichTextEditingMutation } from '@univerjs/docs';
import { DeleteDirection } from '../../types/delete-direction';
import { getRichTextEditPath } from '../util';

export interface IInsertCommandParams {
    unitId: string;
    body: IDocumentBody;
    range: ITextRange;
    segmentId?: string;
    cursorOffset?: number;
}

export const EditorInsertTextCommandId = 'doc.command.insert-text';

/**
 * The command to insert text. The changed range could be non-collapsed, mainly use in line break and normal input.
 */
export const InsertCommand: ICommand<IInsertCommandParams> = {
    id: EditorInsertTextCommandId,

    type: CommandType.COMMAND,

    handler: async (accessor, params: IInsertCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const { range, segmentId, body, unitId, cursorOffset } = params;
        const docSelectionManagerService = accessor.get(DocSelectionManagerService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const docDataModel = univerInstanceService.getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC);

        if (docDataModel == null) {
            return false;
        }

        const activeRange = docSelectionManagerService.getActiveTextRange();
        const originBody = docDataModel.getSelfOrHeaderFooterModel(activeRange?.segmentId ?? '').getBody();

        if (originBody == null) {
            return false;
        }
        const { startOffset, collapsed } = range;
        const cursorMove = cursorOffset ?? body.dataStream.length;
        const textRanges = [
            {
                startOffset: startOffset + cursorMove,
                endOffset: startOffset + cursorMove,
                style: activeRange?.style,
                collapsed,
            },
        ];

        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                actions: [],
                textRanges,
                debounce: true,
            },
        };

        const textX = new TextX();
        const jsonX = JSONX.getInstance();

        if (collapsed) {
            if (startOffset > 0) {
                textX.push({
                    t: TextXActionType.RETAIN,
                    len: startOffset,
                });
            }

            textX.push({
                t: TextXActionType.INSERT,
                body,
                len: body.dataStream.length,
            });
        } else {
            const dos = BuildTextUtils.selection.delete([range], originBody, 0, body);
            textX.push(...dos);
        }

        doMutation.params.textRanges = [{
            startOffset: startOffset + cursorMove,
            endOffset: startOffset + cursorMove,
            collapsed,
        }];

        const path = getRichTextEditPath(docDataModel, segmentId);
        doMutation.params.actions = jsonX.editOp(textX.serialize(), path);

        const result = commandService.syncExecuteCommand<
            IRichTextEditingMutationParams,
            IRichTextEditingMutationParams
        >(doMutation.id, doMutation.params);

        return Boolean(result);
    },
};

export interface IDeleteCommandParams {
    unitId: string;
    range: ITextRange;
    direction: DeleteDirection;
    len?: number;
    segmentId?: string;
}

/**
 * The command to delete text, mainly used in BACKSPACE and DELETE when collapsed is true. ONLY handle collapsed range!!!
 */
export const DeleteCommand: ICommand<IDeleteCommandParams> = {
    id: 'doc.command.delete-text',
    type: CommandType.COMMAND,

    handler: async (accessor, params: IDeleteCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const { range, segmentId, unitId, direction, len = 1 } = params;
        const docDataModel = univerInstanceService.getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC);
        const body = docDataModel?.getSelfOrHeaderFooterModel(segmentId).getBody();
        if (docDataModel == null || body == null) {
            return false;
        }

        const { startOffset } = range;
        let start = direction === DeleteDirection.LEFT ? startOffset - len : startOffset;
        let end = direction === DeleteDirection.LEFT ? startOffset - 1 : startOffset + len - 1;

        const customRange = body.customRanges?.find((customRange) => customRange.startIndex <= start && customRange.endIndex >= end);

        if (customRange?.wholeEntity) {
            start = customRange.startIndex;
            end = Math.max(end, customRange.endIndex);
        }

        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                actions: [],
                textRanges: [{
                    startOffset: start,
                    endOffset: start,
                    collapsed: true,
                }],
                debounce: true,
            },
        };

        const textX = new TextX();
        const jsonX = JSONX.getInstance();

        const cursor = 0;
        textX.push({
            t: TextXActionType.RETAIN,
            len: start - cursor,
        });

        textX.push({
            t: TextXActionType.DELETE,
            len: end - start + 1,
        });

        const path = getRichTextEditPath(docDataModel, segmentId);
        doMutation.params.actions = jsonX.editOp(textX.serialize(), path);

        const result = commandService.syncExecuteCommand<
            IRichTextEditingMutationParams,
            IRichTextEditingMutationParams
        >(doMutation.id, doMutation.params);

        return Boolean(result);
    },
};

export interface IUpdateCommandParams {
    unitId: string;
    updateBody: IDocumentBody;
    range: ITextRange;
    coverType: UpdateDocsAttributeType;
    textRanges: ITextRangeWithStyle[];
    segmentId?: string;
}

/**
 * The command to update text properties, mainly used in BACKSPACE.
 */
export const UpdateCommand: ICommand<IUpdateCommandParams> = {
    id: 'doc.command.update-text',

    type: CommandType.COMMAND,

    handler: async (accessor, params: IUpdateCommandParams) => {
        const { range, segmentId, updateBody, coverType, unitId, textRanges } = params;
        const commandService = accessor.get(ICommandService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const docDataModel = univerInstanceService.getCurrentUniverDocInstance();

        if (docDataModel == null) {
            return false;
        }

        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                actions: [],
                textRanges,
            },
        };

        const textX = new TextX();
        const jsonX = JSONX.getInstance();

        const { startOffset, endOffset } = range;

        textX.push({
            t: TextXActionType.RETAIN,
            len: startOffset,
        });

        textX.push({
            t: TextXActionType.RETAIN,
            body: updateBody,
            len: endOffset - startOffset,
            coverType,
        });

        const path = getRichTextEditPath(docDataModel, segmentId);
        doMutation.params.actions = jsonX.editOp(textX.serialize(), path);

        const result = commandService.syncExecuteCommand<
            IRichTextEditingMutationParams,
            IRichTextEditingMutationParams
        >(doMutation.id, doMutation.params);

        return Boolean(result);
    },
};

export interface ICoverCommandParams {
    unitId: string;

    snapshot?: IDocumentData;
    clearUndoRedoStack?: boolean;
}
