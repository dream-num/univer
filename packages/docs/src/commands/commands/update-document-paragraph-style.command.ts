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

import type { DocumentDataModel, ICommand, IDocumentBody, IParagraphStyle, JSONXActions } from '@univerjs/core';
import {
    CommandType,
    getParagraphContentStartOffset,
    getRichTextEditPath,
    ICommandService,
    IUniverInstanceService,
    JSONX,
    RESTORE_INSERTED_PARAGRAPH_IDS,
    TextX,
    TextXActionType,
    Tools,
    UniverInstanceType,
    UpdateDocsAttributeType,
} from '@univerjs/core';
import { RichTextEditingMutation } from '../mutations/core-editing.mutation';

export interface IUpdateDocumentParagraphStyleCommandParams {
    unitId: string;
    segmentId?: string;
    paragraphId: string;
    startOffset: number;
    endOffset: number;
    style: IParagraphStyle;
}

export const UpdateDocumentParagraphStyleCommand: ICommand<IUpdateDocumentParagraphStyleCommandParams> = {
    id: 'doc.command.update-paragraph-style',
    type: CommandType.COMMAND,
    handler: (accessor, params) => {
        if (!params?.unitId || !params.paragraphId || !Number.isInteger(params.startOffset) ||
            !Number.isInteger(params.endOffset) || params.startOffset < 0 ||
            params.endOffset < params.startOffset || !params.style ||
            Object.keys(params.style).length === 0) {
            return false;
        }

        const instanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);
        const documentDataModel = instanceService.getUnit<DocumentDataModel>(
            params.unitId,
            UniverInstanceType.UNIVER_DOC
        );
        const segmentId = params.segmentId ?? '';
        const body = documentDataModel?.getSelfOrHeaderFooterModel(segmentId)?.getBody();
        if (!documentDataModel || !body) {
            return false;
        }

        const matches = (body.paragraphs ?? []).filter((paragraph) =>
            paragraph.paragraphId === params.paragraphId);
        if (matches.length !== 1) {
            return false;
        }
        const paragraph = matches[0];
        const currentStartOffset = getParagraphContentStartOffset(body, paragraph);
        if (currentStartOffset !== params.startOffset ||
            paragraph.startIndex !== params.endOffset ||
            body.dataStream[params.endOffset] !== '\r') {
            return false;
        }

        const textX = new TextX();
        const initializesTextRuns = Boolean(
            params.style.textStyle &&
            params.startOffset < params.endOffset &&
            body.textRuns == null
        );
        if (params.startOffset > 0) {
            textX.push({ t: TextXActionType.RETAIN, len: params.startOffset });
        }
        if (params.style.textStyle && params.startOffset < params.endOffset && !initializesTextRuns) {
            textX.push({
                t: TextXActionType.RETAIN,
                len: params.endOffset - params.startOffset,
                coverType: UpdateDocsAttributeType.COVER,
                body: {
                    dataStream: '',
                    textRuns: [{
                        st: 0,
                        ed: params.endOffset - params.startOffset,
                        ts: Tools.deepClone(params.style.textStyle),
                    }],
                },
            });
        } else if (params.startOffset < params.endOffset) {
            textX.push({
                t: TextXActionType.RETAIN,
                len: params.endOffset - params.startOffset,
            });
        }

        const paragraphBody: IDocumentBody = {
            dataStream: '',
            paragraphs: [{
                ...Tools.deepClone(paragraph),
                startIndex: 0,
                paragraphStyle: {
                    ...Tools.deepClone(paragraph.paragraphStyle ?? {}),
                    ...Tools.deepClone(params.style),
                },
            }],
        };
        (paragraphBody as IDocumentBody & Record<string, unknown>)[RESTORE_INSERTED_PARAGRAPH_IDS] = true;
        textX.push({
            t: TextXActionType.RETAIN,
            len: 1,
            coverType: UpdateDocsAttributeType.REPLACE,
            body: paragraphBody,
        });

        const jsonX = JSONX.getInstance();
        const path = getRichTextEditPath(documentDataModel, segmentId);
        let actions = jsonX.editOp(textX.serialize(), path);
        if (initializesTextRuns) {
            actions = JSONX.compose(
                jsonX.replaceOp([...path, 'textRuns'], undefined, [{
                    st: params.startOffset,
                    ed: params.endOffset,
                    ts: Tools.deepClone(params.style.textStyle),
                }]) as JSONXActions,
                actions
            );
        }

        return Boolean(commandService.syncExecuteCommand(RichTextEditingMutation.id, {
            unitId: params.unitId,
            segmentId,
            actions,
            textRanges: null,
            noNeedSetTextRange: true,
            isEditing: false,
            trigger: UpdateDocumentParagraphStyleCommand.id,
        }));
    },
};
