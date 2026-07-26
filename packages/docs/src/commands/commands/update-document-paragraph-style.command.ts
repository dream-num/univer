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

import type { DocumentDataModel, ICommand, IDocumentBody, IParagraph, IParagraphStyle, JSONXActions } from '@univerjs/core';
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

function isValidParams(
    params: IUpdateDocumentParagraphStyleCommandParams | undefined
): params is IUpdateDocumentParagraphStyleCommandParams {
    return Boolean(
        params?.unitId &&
        params.paragraphId &&
        Number.isInteger(params.startOffset) &&
        Number.isInteger(params.endOffset) &&
        params.startOffset >= 0 &&
        params.endOffset >= params.startOffset &&
        params.style &&
        Object.keys(params.style).length > 0
    );
}

function getCurrentParagraph(
    body: IDocumentBody,
    params: IUpdateDocumentParagraphStyleCommandParams
): IParagraph | null {
    const matches = (body.paragraphs ?? []).filter((paragraph) =>
        paragraph.paragraphId === params.paragraphId);
    if (matches.length !== 1) {
        return null;
    }

    const paragraph = matches[0];
    return getParagraphContentStartOffset(body, paragraph) === params.startOffset &&
        paragraph.startIndex === params.endOffset &&
        body.dataStream[params.endOffset] === '\r'
        ? paragraph
        : null;
}

function createParagraphStyleTextX(
    body: IDocumentBody,
    paragraph: IParagraph,
    params: IUpdateDocumentParagraphStyleCommandParams
): { textX: TextX; initializesTextRuns: boolean } {
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
    Object.defineProperty(paragraphBody, RESTORE_INSERTED_PARAGRAPH_IDS, {
        value: true,
        enumerable: true,
    });
    textX.push({
        t: TextXActionType.RETAIN,
        len: 1,
        coverType: UpdateDocsAttributeType.REPLACE,
        body: paragraphBody,
    });

    return { textX, initializesTextRuns };
}

export const UpdateDocumentParagraphStyleCommand: ICommand<IUpdateDocumentParagraphStyleCommandParams> = {
    id: 'doc.command.update-paragraph-style',
    type: CommandType.COMMAND,
    handler: (accessor, params) => {
        if (!isValidParams(params)) {
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

        const paragraph = getCurrentParagraph(body, params);
        if (!paragraph) {
            return false;
        }

        const { textX, initializesTextRuns } = createParagraphStyleTextX(body, paragraph, params);
        const jsonX = JSONX.getInstance();
        const path = getRichTextEditPath(documentDataModel, segmentId);
        let actions = jsonX.editOp(textX.serialize(), path);
        if (initializesTextRuns) {
            const initializeTextRunsActions: JSONXActions = jsonX.replaceOp([...path, 'textRuns'], undefined, [{
                st: params.startOffset,
                ed: params.endOffset,
                ts: Tools.deepClone(params.style.textStyle),
            }]);
            actions = JSONX.compose(
                initializeTextRunsActions,
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
