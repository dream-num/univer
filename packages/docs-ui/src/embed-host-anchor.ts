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
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import { DocumentFlavor, DrawingTypeEnum, JSONX, ObjectRelativeFromH, ObjectRelativeFromV, PositionedObjectLayoutType, TextX, TextXActionType, UniverInstanceType } from '@univerjs/core';
import { RichTextEditingMutation } from '@univerjs/docs';

export interface DocsCustomBlockMutationParams {
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

export interface EmbedDocsCustomBlockData {
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
const MODERN_DOCS_CUSTOM_BLOCK_VIEWPORT_INSET = 10;

export interface DocsCustomBlockRenderViewportParams {
    childType?: UniverInstanceType;
    contentHeight?: number;
    contentWidth?: number;
    docsLeft?: number;
    documentFlavor?: DocumentFlavor;
    fallbackHeight?: number;
    fallbackWidth?: number;
    pageMarginLeft?: number;
    pageMarginRight?: number;
    pageWidth?: number;
    scale?: number;
    visibleCanvasHeight?: number;
    visibleCanvasLeft?: number;
    visibleCanvasWidth?: number;
}

export interface DocsCustomBlockRenderViewport {
    bleedLeft?: number;
    bleedWidth?: number;
    contentHeight?: number;
    contentWidth?: number;
    height: number;
    layoutWidth?: number;
    offsetLeft?: number;
    width: number;
}

export function createDocsCustomBlockInsertMutation(params: DocsCustomBlockMutationParams): IMutationInfo<IRichTextEditingMutationParams> {
    return createRichTextMutation(params.unitId, params.segmentId, createInsertCustomBlockActions(params));
}

export function createDocsCustomBlockRemoveMutation(params: DocsCustomBlockMutationParams): IMutationInfo<IRichTextEditingMutationParams> {
    return createRichTextMutation(params.unitId, params.segmentId, createRemoveCustomBlockActions(params));
}

export function createInsertCustomBlockActions(params: DocsCustomBlockMutationParams): JSONXActions {
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

export function createRemoveCustomBlockActions(params: DocsCustomBlockMutationParams): JSONXActions {
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

export function createDocsCustomBlockDrawing(params: DocsCustomBlockMutationParams): IDocDrawingBase {
    const size = resolveDocsCustomBlockSize(params.childType);
    const drawing: IDocDrawingBase & { componentKey: string; data: Serializable } = {
        unitId: params.unitId,
        subUnitId: params.unitId,
        drawingId: params.blockId,
        drawingType: DrawingTypeEnum.DRAWING_DOM,
        componentKey: params.componentKey ?? EMBED_DOCS_CUSTOM_BLOCK_DEFAULT_COMPONENT_KEY,
        data: createEmbedDocsCustomBlockData(params) as unknown as Serializable,
        title: params.blockId,
        description: 'Univer embedded unit custom block',
        layoutType: PositionedObjectLayoutType.INLINE,
        allowTransform: false,
        docTransform: {
            size: {
                width: size.width,
                height: size.height,
            },
            positionH: {
                relativeFrom: ObjectRelativeFromH.PAGE,
                posOffset: 0,
            },
            positionV: {
                relativeFrom: ObjectRelativeFromV.PAGE,
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

export function resolveDocsCustomBlockRenderViewport(params: DocsCustomBlockRenderViewportParams): DocsCustomBlockRenderViewport {
    const defaultSize = resolveDocsCustomBlockSize(params.childType);
    const fallbackWidth = params.fallbackWidth ?? defaultSize.width;
    const fallbackHeight = params.fallbackHeight ?? defaultSize.height;
    const sheetLike = isSheetLikeDocsCustomBlockChildType(params.childType);
    const contentHeight = Number.isFinite(params.contentHeight) && (params.contentHeight ?? 0) > 0
        ? params.contentHeight!
        : fallbackHeight;
    const visibleCanvasHeight = Number.isFinite(params.visibleCanvasHeight) && (params.visibleCanvasHeight ?? 0) > 0
        ? params.visibleCanvasHeight!
        : undefined;
    const height = sheetLike && visibleCanvasHeight != null ? Math.min(contentHeight, visibleCanvasHeight) : (sheetLike ? contentHeight : fallbackHeight);

    if (!sheetLike) {
        return {
            height,
            width: fallbackWidth,
        };
    }

    const pageWidth = params.pageWidth;
    const pageMarginLeft = params.pageMarginLeft ?? 0;
    const pageMarginRight = params.pageMarginRight ?? 0;
    const pageContentWidth = Number.isFinite(pageWidth)
        ? Math.max(0, pageWidth! - pageMarginLeft - pageMarginRight)
        : fallbackWidth;
    const contentWidth = Number.isFinite(params.contentWidth) && (params.contentWidth ?? 0) > 0
        ? params.contentWidth!
        : fallbackWidth;

    if (params.documentFlavor !== DocumentFlavor.MODERN || !Number.isFinite(pageWidth)) {
        const layoutWidth = Math.min(contentWidth, pageContentWidth || contentWidth);
        return {
            contentHeight,
            contentWidth,
            height,
            layoutWidth,
            offsetLeft: 0,
            width: layoutWidth,
        };
    }

    const scale = params.scale && params.scale > 0 ? params.scale : 1;
    const inset = MODERN_DOCS_CUSTOM_BLOCK_VIEWPORT_INSET / scale;
    const docsLeft = params.docsLeft ?? 0;
    const fallbackViewportLeft = docsLeft + inset;
    const fallbackViewportWidth = Math.max(0, pageWidth! - inset * 2);
    const hasVisibleCanvas = Number.isFinite(params.visibleCanvasLeft) &&
        Number.isFinite(params.visibleCanvasWidth) &&
        (params.visibleCanvasWidth ?? 0) > 0;
    const viewportLeft = hasVisibleCanvas ? params.visibleCanvasLeft! + inset : fallbackViewportLeft;
    const viewportWidth = hasVisibleCanvas ? Math.max(0, params.visibleCanvasWidth! - inset * 2) : fallbackViewportWidth;
    const paragraphTextStart = docsLeft + pageMarginLeft;
    const leadingInsetLeft = Math.max(0, paragraphTextStart - viewportLeft);

    const desiredWidth = contentWidth;
    const maxBleedWidth = Math.max(1, viewportLeft + viewportWidth - paragraphTextStart);
    const layoutWidth = Math.min(desiredWidth, maxBleedWidth);

    return {
        bleedLeft: leadingInsetLeft,
        bleedWidth: viewportWidth,
        contentHeight,
        contentWidth,
        height,
        layoutWidth,
        offsetLeft: 0,
        width: layoutWidth,
    };
}

export function createEmbedDocsCustomBlockData(params: {
    blockId: string;
    embedId?: string;
    unitId?: string;
    childUnitId?: string;
    childType?: UniverInstanceType;
    interactionMode?: EmbedDocsCustomBlockInteractionMode;
}): EmbedDocsCustomBlockData {
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

export function isEmbedDocsCustomBlockData(data: unknown): data is EmbedDocsCustomBlockData {
    if (!data || typeof data !== 'object') {
        return false;
    }

    const candidate = data as Partial<EmbedDocsCustomBlockData>;
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

function createDrawingInsertActions(params: DocsCustomBlockMutationParams): JSONXActions {
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

function createDrawingRemoveActions(params: DocsCustomBlockMutationParams): JSONXActions {
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
