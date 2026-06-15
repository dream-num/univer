import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import type { IDocDrawingBase, IMutationInfo, JSONXActions, Serializable, UniverInstanceType } from '@univerjs/core';
import { DrawingTypeEnum, JSONX, ObjectRelativeFromH, ObjectRelativeFromV, PositionedObjectLayoutType, TextX, TextXActionType } from '@univerjs/core';
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
}

export const EMBED_DOCS_CUSTOM_BLOCK_DEFAULT_COMPONENT_KEY = 'UniverEmbedDocsCustomBlock';

export interface EmbedDocsCustomBlockData {
    version: 1;
    embedId: string;
    hostUnitId?: string;
    hostAnchorId: string;
    childUnitId?: string;
    childType?: UniverInstanceType;
}

const DEFAULT_CUSTOM_BLOCK_WIDTH = 720;
const DEFAULT_CUSTOM_BLOCK_HEIGHT = 128;

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
        docTransform: {
            size: {
                width: DEFAULT_CUSTOM_BLOCK_WIDTH,
                height: DEFAULT_CUSTOM_BLOCK_HEIGHT,
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
            width: DEFAULT_CUSTOM_BLOCK_WIDTH,
            height: DEFAULT_CUSTOM_BLOCK_HEIGHT,
        },
    };

    return drawing;
}

export function createEmbedDocsCustomBlockData(params: {
    blockId: string;
    embedId?: string;
    unitId?: string;
    childUnitId?: string;
    childType?: UniverInstanceType;
}): EmbedDocsCustomBlockData {
    return {
        version: 1,
        embedId: params.embedId ?? params.blockId,
        hostUnitId: params.unitId,
        hostAnchorId: params.blockId,
        childUnitId: params.childUnitId,
        childType: params.childType,
    };
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
