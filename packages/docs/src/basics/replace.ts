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

import type { DocumentDataModel, IAccessor, IDeleteAction, IDocumentBody, IMutationInfo, IRetainAction, ITextRange, ITextRangeParam, Nullable } from '@univerjs/core';
import { IUniverInstanceService, JSONX, TextX, TextXActionType } from '@univerjs/core';
import type { ITextRangeWithStyle } from '@univerjs/engine-render';
import type { IRichTextEditingMutationParams } from '../commands/mutations/core-editing.mutation';
import { RichTextEditingMutation } from '../commands/mutations/core-editing.mutation';
import { TextSelectionManagerService } from '../services/text-selection-manager.service';
import { getRichTextEditPath } from '../commands/util';
import { isIntersecting, shouldDeleteCustomRange } from './custom-range';
import { getDeleteSelection } from './selection';

// If the selection contains line breaks,
// paragraph information needs to be preserved when performing the CUT operation
// eslint-disable-next-line max-lines-per-function
export function getRetainAndDeleteAndExcludeLineBreak(
    selection: ITextRange,
    body: IDocumentBody,
    segmentId: string = '',
    memoryCursor: number = 0,
    preserveLineBreak: boolean = true
): Array<IRetainAction | IDeleteAction> {
    const { startOffset, endOffset } = getDeleteSelection(selection, body);
    const dos: Array<IRetainAction | IDeleteAction> = [];

    const { paragraphs = [], dataStream } = body;

    const textStart = startOffset - memoryCursor;
    const textEnd = endOffset - memoryCursor;

    const paragraphInRange = paragraphs?.find(
        (p) => p.startIndex - memoryCursor >= textStart && p.startIndex - memoryCursor < textEnd
    );

    const relativeCustomRanges = body.customRanges?.filter((customRange) => isIntersecting(customRange.startIndex, customRange.endIndex, startOffset, endOffset));
    const toDeleteRanges = new Set(relativeCustomRanges?.filter((customRange) => shouldDeleteCustomRange(startOffset, endOffset - startOffset, customRange, dataStream)));
    const retainPoints = new Set<number>();
    relativeCustomRanges?.forEach((range) => {
        if (toDeleteRanges.has(range)) {
            return;
        }

        if (range.startIndex - memoryCursor >= textStart &&
            range.startIndex - memoryCursor <= textEnd &&
            range.endIndex - memoryCursor > textEnd) {
            retainPoints.add(range.startIndex);
        }
        if (range.endIndex - memoryCursor >= textStart &&
            range.endIndex - memoryCursor <= textEnd &&
            range.startIndex < textStart) {
            retainPoints.add(range.endIndex);
        }
    });

    if (textStart > 0) {
        dos.push({
            t: TextXActionType.RETAIN,
            len: textStart,
            segmentId,
        });
    }

    if (preserveLineBreak) {
        if (paragraphInRange && paragraphInRange.startIndex - memoryCursor > textStart) {
            const paragraphIndex = paragraphInRange.startIndex - memoryCursor;
            retainPoints.add(paragraphIndex);
        }
    }

    const sortedRetains = [...retainPoints].sort((pre, aft) => pre - aft);

    let cursor = textStart;
    sortedRetains.forEach((pos) => {
        const len = pos - cursor;
        if (len > 0) {
            dos.push({
                t: TextXActionType.DELETE,
                len,
                line: 0,
                segmentId,
            });
        }
        dos.push({
            t: TextXActionType.RETAIN,
            len: 1,
            segmentId,
        });
        cursor = pos + 1;
    });

    if (cursor < textEnd) {
        dos.push({
            t: TextXActionType.DELETE,
            len: textEnd - cursor,
            line: 0,
            segmentId,
        });
    }
    return dos;
}

export interface IReplaceSelectionTextXParams {
    /**
     * range to be replaced.
     */
    selection: ITextRangeParam;

    /** Body to be inserted at the given position. */
    body: IDocumentBody; // Do not contain `\r\n` at the end.
    /**
     * origin document data model.
     */
    doc: DocumentDataModel;
}

const replaceSelectionTextX = (params: IReplaceSelectionTextXParams) => {
    const { selection, body: insertBody, doc } = params;
    const segmentId = selection.segmentId;
    const body = doc.getSelfOrHeaderFooterModel(segmentId)?.getBody();
    if (!body) return false;

    const textX = new TextX();
    // delete
    textX.push(...getRetainAndDeleteAndExcludeLineBreak(selection, body, segmentId));
    // insert
    textX.push({
        t: TextXActionType.INSERT,
        body: insertBody,
        len: insertBody.dataStream.length,
        line: 0,
        segmentId,
    });

    return textX;
};

export interface IReplaceSelectionFactoryParams {
    unitId: string;
    /**
     * slelection to be replaced, if not provided, use the current selection.
     */
    selection?: ITextRangeParam;

    /** Body to be inserted at the given position. */
    body: IDocumentBody; // Do not contain `\r\n` at the end.
    /**
     * Text ranges to be replaced.
     */
    textRanges?: ITextRangeWithStyle[];
    doc?: DocumentDataModel;
}

export function replaceSelectionFactory(accessor: IAccessor, params: IReplaceSelectionFactoryParams) {
    const { unitId, body: insertBody, doc } = params;
    let docDataModel: Nullable<DocumentDataModel> = doc;
    if (!docDataModel) {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        docDataModel = univerInstanceService.getUnit<DocumentDataModel>(unitId);
    }

    if (!docDataModel) {
        return false;
    }
    const segmentId = params.selection?.segmentId;
    const body = docDataModel.getSelfOrHeaderFooterModel(segmentId)?.getBody();

    if (!body) return false;

    const textSelectionManagerService = accessor.get(TextSelectionManagerService);
    const selection = params.selection ?? textSelectionManagerService.getActiveTextRangeWithStyle();
    if (!selection || !body) {
        return false;
    }
    const textRanges = params.textRanges ?? [{
        startOffset: selection.startOffset + insertBody.dataStream.length,
        endOffset: selection.startOffset + insertBody.dataStream.length,
        collapsed: true,
        segmentId,
    }];

    const textX = replaceSelectionTextX({
        selection,
        body: insertBody,
        doc: docDataModel,
    });
    if (!textX) {
        return false;
    }

    const doMutation: IMutationInfo<IRichTextEditingMutationParams> & { textX: TextX } = {
        id: RichTextEditingMutation.id,
        params: {
            unitId,
            actions: [],
            textRanges,
            debounce: true,
            segmentId,
        },
        textX,
    };

    const jsonX = JSONX.getInstance();
    const path = getRichTextEditPath(docDataModel, segmentId);
    doMutation.params.actions = jsonX.editOp(textX.serialize(), path);
    return doMutation;
}
