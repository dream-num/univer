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

import type { IDocDrawingBase, IMutationInfo, JSONXActions, Serializable } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from './commands/mutations/core-editing.mutation';
import { AlignTypeH, DrawingTypeEnum, JSONX, ObjectRelativeFromH, ObjectRelativeFromV, PositionedObjectLayoutType, TextX, TextXActionType, UniverInstanceType } from '@univerjs/core';
import { RichTextEditingMutation } from './commands/mutations/core-editing.mutation';

export interface IDocsCustomBlockMutationParams {
    unitId: string;
    blockId: string;
    startIndex: number;
    segmentId?: string;
    drawingOrderIndex?: number;
    embedId?: string;
    childUnitId?: string;
    childType?: UniverInstanceType;
    componentKey?: string;
    interactionMode?: EmbedDocsCustomBlockInteractionMode;
}

export const EMBED_DOCS_CUSTOM_BLOCK_DEFAULT_COMPONENT_KEY = 'UniverEmbedDocsCustomBlock';
export type EmbedDocsCustomBlockInteractionMode = 'block' | 'inline';

export interface IEmbedDocsCustomBlockData {
    version: 1;
    embedId: string;
    hostUnitId?: string;
    hostAnchorId: string;
    childUnitId?: string;
    childType?: UniverInstanceType;
    interactionMode?: EmbedDocsCustomBlockInteractionMode;
}

const DEFAULT_CUSTOM_BLOCK_SIZE = { width: 720, height: 360 };
const SHEET_LIKE_CUSTOM_BLOCK_SIZE = { width: 960, height: 480 };
const SLIDE_CUSTOM_BLOCK_SIZE = { width: 720, height: 405 };

export function createDocsCustomBlockInsertMutation(params: IDocsCustomBlockMutationParams): IMutationInfo<IRichTextEditingMutationParams> {
    return createRichTextMutation(params.unitId, params.segmentId, createInsertCustomBlockActions(params));
}

export function createDocsCustomBlockRemoveMutation(params: IDocsCustomBlockMutationParams): IMutationInfo<IRichTextEditingMutationParams> {
    return createRichTextMutation(params.unitId, params.segmentId, createRemoveCustomBlockActions(params));
}

export function createInsertCustomBlockActions(params: IDocsCustomBlockMutationParams): JSONXActions {
    const textX = new TextX();
    if (params.startIndex > 0) {
        textX.push({
            t: TextXActionType.RETAIN,
            len: params.startIndex,
        });
    }

    textX.push({
        t: TextXActionType.INSERT,
        body: {
            dataStream: '\b',
            customBlocks: [{
                startIndex: 0,
                blockId: params.blockId,
            }],
        },
        len: 1,
    });

    return composeActions([
        toBodyEditActions(textX, params.segmentId),
        createDrawingInsertActions(params),
    ]);
}

export function createRemoveCustomBlockActions(params: IDocsCustomBlockMutationParams): JSONXActions {
    const textX = new TextX();
    if (params.startIndex > 0) {
        textX.push({
            t: TextXActionType.RETAIN,
            len: params.startIndex,
        });
    }

    textX.push({
        t: TextXActionType.DELETE,
        len: 1,
    });

    return composeActions([
        toBodyEditActions(textX, params.segmentId),
        createDrawingRemoveActions(params),
    ]);
}

export function createDocsCustomBlockDrawing(params: IDocsCustomBlockMutationParams): IDocDrawingBase {
    const size = resolveDocsCustomBlockSize(params.childType);
    const isInline = params.interactionMode === 'inline';
    const drawing: IDocDrawingBase & { componentKey: string; data: Serializable } = {
        unitId: params.unitId,
        subUnitId: params.unitId,
        drawingId: params.blockId,
        drawingType: DrawingTypeEnum.DRAWING_DOM,
        componentKey: params.componentKey ?? EMBED_DOCS_CUSTOM_BLOCK_DEFAULT_COMPONENT_KEY,
        data: createEmbedDocsCustomBlockData(params) as unknown as Serializable,
        title: params.blockId,
        description: 'Univer embedded unit custom block',
        layoutType: isInline ? PositionedObjectLayoutType.INLINE : PositionedObjectLayoutType.WRAP_TOP_AND_BOTTOM,
        allowTransform: false,
        docTransform: {
            size: {
                width: size.width,
                height: size.height,
            },
            positionH: {
                relativeFrom: isInline ? ObjectRelativeFromH.PAGE : ObjectRelativeFromH.COLUMN,
                ...(isInline ? { posOffset: 0 } : { align: AlignTypeH.LEFT }),
            },
            positionV: {
                relativeFrom: isInline ? ObjectRelativeFromV.PAGE : ObjectRelativeFromV.PARAGRAPH,
                posOffset: 0,
            },
            angle: 0,
        },
        transform: {
            left: 0,
            top: 0,
            width: size.width,
            height: size.height,
        },
    };

    return drawing;
}

export function resolveDocsCustomBlockSize(childType?: UniverInstanceType): { width: number; height: number } {
    if (childType === UniverInstanceType.UNIVER_SHEET || childType === UniverInstanceType.UNIVER_BASE) {
        return SHEET_LIKE_CUSTOM_BLOCK_SIZE;
    }

    if (childType === UniverInstanceType.UNIVER_SLIDE) {
        return SLIDE_CUSTOM_BLOCK_SIZE;
    }

    return DEFAULT_CUSTOM_BLOCK_SIZE;
}

export function isSheetLikeDocsCustomBlockChildType(childType?: UniverInstanceType): boolean {
    return childType === UniverInstanceType.UNIVER_SHEET || childType === UniverInstanceType.UNIVER_BASE;
}

export function createEmbedDocsCustomBlockData(params: {
    blockId: string;
    embedId?: string;
    unitId?: string;
    childUnitId?: string;
    childType?: UniverInstanceType;
    interactionMode?: EmbedDocsCustomBlockInteractionMode;
}): IEmbedDocsCustomBlockData {
    return {
        version: 1,
        embedId: params.embedId ?? params.blockId,
        hostUnitId: params.unitId,
        hostAnchorId: params.blockId,
        childUnitId: params.childUnitId,
        childType: params.childType,
        interactionMode: params.interactionMode ?? 'block',
    };
}

export function isEmbedDocsCustomBlockData(data: unknown): data is IEmbedDocsCustomBlockData {
    if (!data || typeof data !== 'object') {
        return false;
    }

    const candidate = data as Partial<IEmbedDocsCustomBlockData>;
    return candidate.version === 1 &&
        typeof candidate.embedId === 'string' &&
        typeof candidate.hostAnchorId === 'string';
}

export function shouldUseInlineTextSelectionForDocsCustomBlockDrawing(drawing: unknown): boolean {
    const data = drawing && typeof drawing === 'object' ? (drawing as { data?: unknown }).data : undefined;
    if (!isEmbedDocsCustomBlockData(data)) {
        return true;
    }

    return data.interactionMode === 'inline';
}

function createRichTextMutation(unitId: string, segmentId: string | undefined, actions: JSONXActions): IMutationInfo<IRichTextEditingMutationParams> {
    return {
        id: RichTextEditingMutation.id,
        params: {
            unitId,
            segmentId,
            actions,
            textRanges: [],
            isEditing: false,
            noNeedSetTextRange: true,
        },
    };
}

function toBodyEditActions(textX: TextX, segmentId?: string): JSONXActions {
    const action = JSONX.getInstance().editOp(textX.serialize(), segmentId ? ['headers', segmentId, 'body'] : ['body']);
    return action ?? [];
}

function createDrawingInsertActions(params: IDocsCustomBlockMutationParams): JSONXActions {
    if (params.segmentId) {
        return [];
    }

    const jsonX = JSONX.getInstance();
    const drawing = createDocsCustomBlockDrawing(params);
    return composeActions([
        jsonX.insertOp(['drawings', params.blockId], drawing) ?? [],
        jsonX.insertOp(['drawingsOrder', params.drawingOrderIndex ?? 0], params.blockId) ?? [],
    ]);
}

function createDrawingRemoveActions(params: IDocsCustomBlockMutationParams): JSONXActions {
    if (params.segmentId) {
        return [];
    }

    const jsonX = JSONX.getInstance();
    const drawing = createDocsCustomBlockDrawing(params);
    return composeActions([
        jsonX.removeOp(['drawings', params.blockId], drawing) ?? [],
        jsonX.removeOp(['drawingsOrder', params.drawingOrderIndex ?? 0], params.blockId) ?? [],
    ]);
}

function composeActions(actions: Array<JSONXActions | null>): JSONXActions {
    return actions.reduce((composed, action) => {
        if (!action || JSONX.isNoop(action) || action.length === 0) {
            return composed;
        }
        if (!composed || JSONX.isNoop(composed) || composed.length === 0) {
            return action;
        }

        return JSONX.compose(composed, action) ?? [];
    }, [] as JSONXActions);
}
