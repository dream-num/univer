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

import type { ITextRange, ITextRangeParam } from '../../../../sheets/typedef';
import type { IDocumentBody } from '../../../../types/interfaces';
import type { DocumentDataModel } from '../../document-data-model';
import type { JSONXActions } from '../../json-x/json-x';
import { JSONX } from '../../json-x/json-x';
import { TextXActionType } from '../action-types';
import { TextX } from '../text-x';
import { deleteSelectionTextX } from './text-x-utils';

export interface IAddDrawingParam {
    selection: ITextRangeParam;
    documentDataModel: DocumentDataModel;
    drawings: any[];
}

export function getCustomBlockIdsInSelections(body: IDocumentBody, selections: ITextRange[]): string[] {
    const customBlockIds: string[] = [];
    const { customBlocks = [] } = body;

    for (const selection of selections) {
        const { startOffset, endOffset } = selection;

        if (startOffset == null || endOffset == null) {
            continue;
        }

        for (const customBlock of customBlocks) {
            const { startIndex } = customBlock;

            if (startIndex >= startOffset && startIndex < endOffset) {
                customBlockIds.push(customBlock.blockId);
            }
        }
    }

    return customBlockIds;
}

export function getRichTextEditPath(docDataModel: DocumentDataModel, segmentId = '') {
    if (!segmentId) {
        return ['body'];
    }

    const { headers, footers } = docDataModel.getSnapshot();

    if (headers == null && footers == null) {
        throw new Error('Document data model must have headers or footers when update by segment id');
    }

    if (headers?.[segmentId] != null) {
        return ['headers', segmentId, 'body'];
    } else if (footers?.[segmentId] != null) {
        return ['footers', segmentId, 'body'];
    } else {
        throw new Error('Segment id not found in headers or footers');
    }
}

// eslint-disable-next-line max-lines-per-function
export const addDrawing = (param: IAddDrawingParam) => {
    const { selection, documentDataModel, drawings } = param;
    const { collapsed, startOffset, segmentId } = selection;
    const textX = new TextX();
    const jsonX = JSONX.getInstance();
    const rawActions: JSONXActions = [];
    const body = documentDataModel.getSelfOrHeaderFooterModel(segmentId).getBody();

    if (!body) {
        return false;
    }

    const drawingOrderLength = documentDataModel.getSnapshot().drawingsOrder?.length ?? 0;
    let removeDrawingLen = 0;

        // Step 1: Insert placeholder `\b` in dataStream and add drawing to customBlocks.
    if (collapsed) {
        if (startOffset > 0) {
            textX.push({
                t: TextXActionType.RETAIN,
                len: startOffset,
            });
        }
    } else {
        const dos = deleteSelectionTextX([selection], body, 0, null, false);
        textX.push(...dos);

        const removedCustomBlockIds = getCustomBlockIdsInSelections(body, [selection]);
        const drawings = documentDataModel.getDrawings() ?? {};
        const drawingOrder = documentDataModel.getDrawingsOrder() ?? [];
        const sortedRemovedCustomBlockIds = removedCustomBlockIds.sort((a, b) => {
            if (drawingOrder.indexOf(a) > drawingOrder.indexOf(b)) {
                return -1;
            } else if (drawingOrder.indexOf(a) < drawingOrder.indexOf(b)) {
                return 1;
            }

            return 0;
        });

        if (sortedRemovedCustomBlockIds.length > 0) {
            for (const blockId of sortedRemovedCustomBlockIds) {
                const drawing = drawings[blockId];
                const drawingIndex = drawingOrder.indexOf(blockId);
                if (drawing == null || drawingIndex < 0) {
                    continue;
                }

                const removeDrawingAction = jsonX.removeOp(['drawings', blockId], drawing);
                const removeDrawingOrderAction = jsonX.removeOp(['drawingsOrder', drawingIndex], blockId);

                rawActions.push(removeDrawingAction!);
                rawActions.push(removeDrawingOrderAction!);

                removeDrawingLen++;
            }
        }
    }

    textX.push({
        t: TextXActionType.INSERT,
        body: {
            dataStream: '\b'.repeat(drawings.length),
            customBlocks: drawings.map((drawing, i) => ({
                startIndex: i,
                blockId: drawing.drawingId,
            })),
        },
        len: drawings.length,
    });

    const path = getRichTextEditPath(documentDataModel, segmentId);
    const placeHolderAction = jsonX.editOp(textX.serialize(), path);

    rawActions.push(placeHolderAction!);

        // Step 2: add drawing to drawings and drawingsOrder fields.
    for (const drawing of drawings) {
        const { drawingId } = drawing;
        const addDrawingAction = jsonX.insertOp(['drawings', drawingId], drawing);
        const addDrawingOrderAction = jsonX.insertOp(['drawingsOrder', drawingOrderLength - removeDrawingLen], drawingId);

        rawActions.push(addDrawingAction!);
        rawActions.push(addDrawingOrderAction!);
    }

    return rawActions.reduce((acc, cur) => {
        return JSONX.compose(acc, cur as JSONXActions);
    }, null as JSONXActions);
};
