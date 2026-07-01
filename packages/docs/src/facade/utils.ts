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

import type { DocumentDataModel, IDocumentBody, Injector, IParagraphStyle, UpdateDocsAttributeType } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import { createParagraphId, DataStreamTreeTokenType, getRichTextEditPath, ICommandService, JSONX, TextX, TextXActionType } from '@univerjs/core';
import { RichTextEditingMutation } from '@univerjs/docs';

export interface IBuildPlainTextInsertBodyOptions {
    paragraphStyle?: IParagraphStyle;
    removeLeadingParagraphBreak?: boolean;
}

/**
 * A text range in a document segment. Offsets are zero-based positions in the segment data stream.
 */
export interface IFDocumentTextRange {
    /** The inclusive start offset of the range. */
    startOffset: number;
    /** The exclusive end offset of the range. */
    endOffset: number;
    /** The header/footer segment id. Omit or use an empty string for the main body. */
    segmentId?: string;
}

function cloneParagraphStyle(paragraphStyle: IParagraphStyle): IParagraphStyle {
    return paragraphStyle == null ? paragraphStyle : JSON.parse(JSON.stringify(paragraphStyle));
}

function normalizePlainTextDataStream(dataStream: string): string {
    return dataStream.replace(/\r\n/g, '\r').replace(/\n/g, '\r');
}

export function getRemovedLeadingParagraphBreakLength(
    dataStream: string,
    removeLeadingParagraphBreak?: boolean
): number {
    const normalized = normalizePlainTextDataStream(dataStream);

    if (removeLeadingParagraphBreak && normalized.length > 1 && normalized.startsWith('\r')) {
        return 1;
    }

    return 0;
}

export function getNormalizedPlainTextCursorOffset(
    dataStream: string,
    cursorOffset: number,
    removeLeadingParagraphBreak?: boolean
): number {
    const normalizedPrefixLength = normalizePlainTextDataStream(dataStream.slice(0, cursorOffset)).length;

    return Math.max(
        0,
        normalizedPrefixLength - getRemovedLeadingParagraphBreakLength(dataStream, removeLeadingParagraphBreak)
    );
}

export function getParagraphStyleAtOffset(body: IDocumentBody, offset: number): IParagraphStyle | undefined {
    const paragraphs = body.paragraphs ?? [];
    const paragraph = paragraphs.find((item) => item.startIndex >= offset) ?? paragraphs[paragraphs.length - 1];

    return paragraph?.paragraphStyle;
}

export function buildPlainTextInsertBody(
    dataStream: string,
    options: IBuildPlainTextInsertBodyOptions = {}
): IDocumentBody {
    const normalizedDataStream = normalizePlainTextDataStream(dataStream).slice(
        getRemovedLeadingParagraphBreakLength(dataStream, options.removeLeadingParagraphBreak)
    );
    const body: IDocumentBody = {
        dataStream: normalizedDataStream,
        customDecorations: [],
        customRanges: [],
        textRuns: [],
    };

    const paragraphs = [];
    const existingParagraphIds = new Set<string>();
    for (let index = 0; index < normalizedDataStream.length; index++) {
        if (normalizedDataStream[index] === '\r') {
            paragraphs.push({
                startIndex: index,
                paragraphId: createParagraphId(existingParagraphIds),
                ...(options.paragraphStyle == null ? {} : { paragraphStyle: cloneParagraphStyle(options.paragraphStyle) }),
            });
        }
    }

    if (paragraphs.length > 0) {
        body.paragraphs = paragraphs;
    }

    return body;
}

export function replaceBodyRange(
    range: IFDocumentTextRange,
    insertBody: IDocumentBody,
    docDataModel: DocumentDataModel,
    injector: Injector
): boolean {
    const { startOffset, endOffset, segmentId } = range;
    const textX = new TextX();

    if (startOffset > 0) {
        textX.push({ t: TextXActionType.RETAIN, len: startOffset });
    }

    if (endOffset > startOffset) {
        textX.push({ t: TextXActionType.DELETE, len: endOffset - startOffset });
    }

    if (insertBody.dataStream.length > 0) {
        textX.push({
            t: TextXActionType.INSERT,
            body: insertBody,
            len: insertBody.dataStream.length,
        });
    }

    const jsonX = JSONX.getInstance();
    const actions = jsonX.editOp(textX.serialize(), getRichTextEditPath(docDataModel, segmentId));

    const commandService = injector.get(ICommandService);
    const result = commandService.syncExecuteCommand<IRichTextEditingMutationParams, IRichTextEditingMutationParams>(
        RichTextEditingMutation.id,
        {
            unitId: docDataModel.getUnitId(),
            segmentId,
            actions,
            textRanges: [],
            isEditing: false,
        }
    );

    return Boolean(result?.actions && result.actions.length > 0);
}

export function retainBodyRange(
    range: IFDocumentTextRange,
    updateBody: IDocumentBody,
    coverType: UpdateDocsAttributeType,
    docDataModel: DocumentDataModel,
    injector: Injector
): boolean {
    const { startOffset, endOffset, segmentId } = range;
    const commandService = injector.get(ICommandService);

    if (updateBody.textRuns?.length && docDataModel.getSelfOrHeaderFooterModel(segmentId)?.getBody()?.textRuns == null) {
        const jsonX = JSONX.getInstance();
        const actions = jsonX.replaceOp(
            [...getRichTextEditPath(docDataModel, segmentId), 'textRuns'],
            undefined,
            []
        );

        commandService.syncExecuteCommand<IRichTextEditingMutationParams, IRichTextEditingMutationParams>(
            RichTextEditingMutation.id,
            {
                unitId: docDataModel.getUnitId(),
                segmentId,
                actions,
                textRanges: [],
                isEditing: false,
            }
        );
    }

    const textX = new TextX();

    if (startOffset > 0) {
        textX.push({ t: TextXActionType.RETAIN, len: startOffset });
    }

    textX.push({
        t: TextXActionType.RETAIN,
        body: updateBody,
        coverType,
        len: endOffset - startOffset,
    });

    const jsonX = JSONX.getInstance();
    const actions = jsonX.editOp(textX.serialize(), getRichTextEditPath(docDataModel, segmentId));

    const result = commandService.syncExecuteCommand<IRichTextEditingMutationParams, IRichTextEditingMutationParams>(
        RichTextEditingMutation.id,
        {
            unitId: docDataModel.getUnitId(),
            segmentId,
            actions,
            textRanges: [],
            isEditing: false,
        }
    );

    return Boolean(result?.actions && result.actions.length > 0);
}

export function stripBlockTokens(text: string): string {
    return Array.from(text)
        .map((char) => char === DataStreamTreeTokenType.PARAGRAPH ? '\n' : char)
        .filter(
            (char) =>
                char !== DataStreamTreeTokenType.BLOCK_START &&
                char !== DataStreamTreeTokenType.BLOCK_END &&
                char !== DataStreamTreeTokenType.SECTION_BREAK
        )
        .join('')
        .replace(/\n$/, '');
}
