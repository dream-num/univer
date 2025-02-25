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

import type { DocumentDataModel, IAccessor, ICommand, IDocDrawingBase, IDocDrawingPosition, IMutationInfo, IObjectPositionH, IObjectPositionV, ISize, JSONXActions, WrapTextType } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import type { IDocDrawing } from '@univerjs/docs-drawing';
import {
    BooleanNumber,
    CommandType,
    ICommandService,
    IUniverInstanceService,
    JSONX,
    ObjectRelativeFromH,
    ObjectRelativeFromV,
    PositionedObjectLayoutType,
    TextX,
    TextXActionType,
    Tools,
} from '@univerjs/core';
import { DocSkeletonManagerService, RichTextEditingMutation } from '@univerjs/docs';
import { DocSelectionRenderService, getRichTextEditPath } from '@univerjs/docs-ui';
import { DocumentEditArea, IRenderManagerService } from '@univerjs/engine-render';
import { DocRefreshDrawingsService } from '../../services/doc-refresh-drawings.service';

export enum TextWrappingStyle {
    INLINE = 'inline',
    BEHIND_TEXT = 'behindText',
    IN_FRONT_OF_TEXT = 'inFrontOfText',
    WRAP_SQUARE = 'wrapSquare',
    WRAP_TOP_AND_BOTTOM = 'wrapTopAndBottom',
}

const WRAPPING_STYLE_TO_LAYOUT_TYPE = {
    [TextWrappingStyle.INLINE]: PositionedObjectLayoutType.INLINE,
    [TextWrappingStyle.WRAP_SQUARE]: PositionedObjectLayoutType.WRAP_SQUARE,
    [TextWrappingStyle.WRAP_TOP_AND_BOTTOM]: PositionedObjectLayoutType.WRAP_TOP_AND_BOTTOM,
    [TextWrappingStyle.IN_FRONT_OF_TEXT]: PositionedObjectLayoutType.WRAP_NONE,
    [TextWrappingStyle.BEHIND_TEXT]: PositionedObjectLayoutType.WRAP_NONE,
};

// eslint-disable-next-line max-lines-per-function
function getDeleteAndInsertCustomBlockActions(
    segmentId: string,
    oldSegmentId: string,
    segmentPage: number,
    offset: number,
    drawingId: string,
    documentDataModel: DocumentDataModel,
    docSelectionRenderManager: DocSelectionRenderService
) {
    const textX = new TextX();
    const jsonX = JSONX.getInstance();
    const rawActions: JSONXActions = [];

    const oldBody = documentDataModel.getSelfOrHeaderFooterModel(oldSegmentId).getBody();
    const body = documentDataModel.getSelfOrHeaderFooterModel(segmentId).getBody();

    if (oldBody == null || body == null) {
        return;
    }

    const oldOffset = oldBody.customBlocks?.find((block) => block.blockId === drawingId)?.startIndex;

    if (oldOffset == null) {
        return;
    }

    // Can not put image after the last \r.
    offset = Math.min(body.dataStream.length - 2, offset);

    if (segmentId === oldSegmentId) {
        if (offset < oldOffset) {
            // Insert first.
            if (offset > 0) {
                textX.push({
                    t: TextXActionType.RETAIN,
                    len: offset,
                });
            }

            textX.push({
                t: TextXActionType.INSERT,
                body: {
                    dataStream: '\b',
                    customBlocks: [{
                        startIndex: 0,
                        blockId: drawingId,
                    }],
                },
                len: 1,
            });

            textX.push({
                t: TextXActionType.RETAIN,
                len: oldOffset - offset,
            });

            textX.push({
                t: TextXActionType.DELETE,
                len: 1,
            });
        } else {
            // Delete first.
            if (oldOffset > 0) {
                textX.push({
                    t: TextXActionType.RETAIN,
                    len: oldOffset,
                });
            }

            textX.push({
                t: TextXActionType.DELETE,
                len: 1,
            });

            if (offset - oldOffset - 1 > 0) {
                textX.push({
                    t: TextXActionType.RETAIN,
                    len: offset - oldOffset - 1,
                });
            }

            textX.push({
                t: TextXActionType.INSERT,
                body: {
                    dataStream: '\b',
                    customBlocks: [{
                        startIndex: 0,
                        blockId: drawingId,
                    }],
                },
                len: 1,
            });
        }

        if (offset !== oldOffset) {
            const path = getRichTextEditPath(documentDataModel, oldSegmentId);
            const action = jsonX.editOp(textX.serialize(), path);
            rawActions.push(action!);
        }
    } else {
        if (oldOffset > 0) {
            textX.push({
                t: TextXActionType.RETAIN,
                len: oldOffset,
            });
        }

        textX.push({
            t: TextXActionType.DELETE,
            len: 1,
        });

        let path = getRichTextEditPath(documentDataModel, oldSegmentId);
        let action = jsonX.editOp(textX.serialize(), path);
        rawActions.push(action!);

        textX.empty();

        if (offset > 0) {
            textX.push({
                t: TextXActionType.RETAIN,
                len: offset,
            });
        }

        textX.push({
            t: TextXActionType.INSERT,
            body: {
                dataStream: '\b',
                customBlocks: [{
                    startIndex: 0,
                    blockId: drawingId,
                }],
            },
            len: 1,
        });

        path = getRichTextEditPath(documentDataModel, segmentId);
        action = jsonX.editOp(textX.serialize(), path);
        rawActions.push(action!);

        docSelectionRenderManager.setSegment(segmentId);
        docSelectionRenderManager.setSegmentPage(segmentPage);
    }

    return rawActions;
}

interface IUpdateDocDrawingWrappingStyleParams {
    unitId: string;
    subUnitId: string;
    drawings: IDocDrawing[];
    wrappingStyle: TextWrappingStyle;
}

/**
 * The command to update drawing wrapping style.
 */
export const UpdateDocDrawingWrappingStyleCommand: ICommand = {
    id: 'doc.command.update-doc-drawing-wrapping-style',

    type: CommandType.COMMAND,

    // eslint-disable-next-line max-lines-per-function, complexity
    handler: (accessor: IAccessor, params?: IUpdateDocDrawingWrappingStyleParams) => {
        if (params == null) {
            return false;
        }

        const { drawings, wrappingStyle, unitId } = params;

        const commandService = accessor.get(ICommandService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const renderManagerService = accessor.get(IRenderManagerService);

        const renderObject = renderManagerService.getRenderById(unitId);
        const skeletonData = renderObject?.with(DocSkeletonManagerService)
            .getSkeleton()
            .getSkeletonData();
        const viewModel = renderObject?.with(DocSkeletonManagerService).getViewModel();
        const scene = renderObject?.scene;
        const documentDataModel = univerInstanceService.getCurrentUniverDocInstance();

        if (documentDataModel == null || skeletonData == null || scene == null || viewModel == null) {
            return false;
        }

        const editArea = viewModel.getEditArea();
        const transformer = scene.getTransformerByCreate();

        const { pages, skeHeaders, skeFooters } = skeletonData;

        const jsonX = JSONX.getInstance();
        const rawActions: JSONXActions = [];

        const { drawings: oldDrawings = {} } = documentDataModel.getSnapshot();

        // Update drawing layoutType.
        for (const drawing of drawings) {
            const { drawingId } = drawing;

            // Update layoutType.
            const oldLayoutType = oldDrawings[drawingId].layoutType;
            const newLayoutType = WRAPPING_STYLE_TO_LAYOUT_TYPE[wrappingStyle];

            if (oldLayoutType !== newLayoutType) {
                const updateLayoutTypeAction = jsonX.replaceOp(['drawings', drawingId, 'layoutType'], oldLayoutType, newLayoutType);

                rawActions.push(updateLayoutTypeAction!);
            }

            // Update behindDoc if layoutType is WRAP_NONE.
            if (wrappingStyle === TextWrappingStyle.BEHIND_TEXT || wrappingStyle === TextWrappingStyle.IN_FRONT_OF_TEXT) {
                const oldBehindDoc = oldDrawings[drawingId].behindDoc;
                const newBehindDoc = wrappingStyle === TextWrappingStyle.BEHIND_TEXT ? BooleanNumber.TRUE : BooleanNumber.FALSE;

                if (oldBehindDoc !== newBehindDoc) {
                    const updateBehindDocAction = jsonX.replaceOp(['drawings', drawingId, 'behindDoc'], oldBehindDoc, newBehindDoc);

                    rawActions.push(updateBehindDocAction!);
                }
            }

            if (wrappingStyle === TextWrappingStyle.INLINE) {
                continue;
            }

            // Update positionH and positionV if layoutType is not inline.
            let skeDrawing = null;
            let pageMarginTop = 0;
            let pageMarginLeft = 0;
            for (const page of pages) {
                const { headerId, footerId, marginTop, marginLeft, marginBottom, pageWidth, pageHeight } = page;

                switch (editArea) {
                    case DocumentEditArea.HEADER: {
                        const headerSke = skeHeaders.get(headerId)?.get(pageWidth);

                        if (headerSke != null && headerSke.skeDrawings.has(drawingId)) {
                            skeDrawing = headerSke.skeDrawings.get(drawingId);
                            pageMarginTop = headerSke.marginTop;
                            pageMarginLeft = marginLeft;
                        }

                        break;
                    }

                    case DocumentEditArea.FOOTER: {
                        const footerSke = skeFooters.get(footerId)?.get(pageWidth);
                        if (footerSke != null && footerSke.skeDrawings.has(drawingId)) {
                            skeDrawing = footerSke.skeDrawings.get(drawingId);
                            pageMarginTop = pageHeight - marginBottom + footerSke.marginTop;
                            pageMarginLeft = marginLeft;
                        }
                        break;
                    }

                    case DocumentEditArea.BODY: {
                        if (page.skeDrawings.has(drawingId)) {
                            skeDrawing = page.skeDrawings.get(drawingId);
                            pageMarginTop = marginTop;
                            pageMarginLeft = marginLeft;
                        }
                        break;
                    }
                }

                if (skeDrawing != null) {
                    break;
                }
            }

            if (skeDrawing != null) {
                const { aTop, aLeft } = skeDrawing;
                const oldPositionH = oldDrawings[drawingId].docTransform.positionH;
                let posOffsetH = aLeft;

                if (oldPositionH.relativeFrom === ObjectRelativeFromH.MARGIN) {
                    posOffsetH -= pageMarginLeft;
                } else if (oldPositionH.relativeFrom === ObjectRelativeFromH.COLUMN) {
                    posOffsetH -= skeDrawing.columnLeft;
                }

                const newPositionH = {
                    relativeFrom: oldPositionH.relativeFrom,
                    posOffset: posOffsetH,
                };

                if (oldPositionH.posOffset !== newPositionH.posOffset) {
                    const action = jsonX.replaceOp(['drawings', drawingId, 'docTransform', 'positionH'], oldPositionH, newPositionH);

                    rawActions.push(action!);
                }

                const oldPositionV = oldDrawings[drawingId].docTransform.positionV;
                let posOffsetV = aTop;

                if (oldPositionV.relativeFrom === ObjectRelativeFromV.PAGE) {
                    posOffsetV += pageMarginTop;
                } else if (oldPositionV.relativeFrom === ObjectRelativeFromV.LINE) {
                    posOffsetV -= skeDrawing.lineTop;
                } else if (oldPositionV.relativeFrom === ObjectRelativeFromV.PARAGRAPH) {
                    posOffsetV -= skeDrawing.blockAnchorTop;
                }

                const newPositionV = {
                    relativeFrom: oldPositionV.relativeFrom,
                    posOffset: posOffsetV,
                };

                if (oldPositionV.posOffset !== newPositionV.posOffset) {
                    const action = jsonX.replaceOp(['drawings', drawingId, 'docTransform', 'positionV'], oldPositionV, newPositionV);

                    rawActions.push(action!);
                }
            }
        }

        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                actions: [],
                textRanges: null,
            },
        };

        doMutation.params.actions = rawActions.reduce((acc, cur) => {
            return JSONX.compose(acc, cur as JSONXActions);
        }, null as JSONXActions);

        const result = commandService.syncExecuteCommand<
            IRichTextEditingMutationParams,
            IRichTextEditingMutationParams
        >(doMutation.id, doMutation.params);

        transformer.refreshControls();

        return Boolean(result);
    },
};

interface IDist {
    distT: number;
    distB: number;
    distL: number;
    distR: number;
}

interface IUpdateDocDrawingDistanceParams {
    unitId: string;
    subUnitId: string;
    drawings: IDocDrawing[];
    dist: IDist;
}

/**
 * The command to update drawing wrap text.
 */
export const UpdateDocDrawingDistanceCommand: ICommand = {
    id: 'doc.command.update-doc-drawing-distance',

    type: CommandType.COMMAND,

    handler: (accessor: IAccessor, params?: IUpdateDocDrawingDistanceParams) => {
        if (params == null) {
            return false;
        }

        const commandService = accessor.get(ICommandService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const documentDataModel = univerInstanceService.getCurrentUniverDocInstance();
        if (documentDataModel == null) {
            return false;
        }

        const { drawings, dist, unitId } = params;

        const jsonX = JSONX.getInstance();
        const rawActions: JSONXActions = [];

        const { drawings: oldDrawings = {} } = documentDataModel.getSnapshot();

        for (const drawing of drawings) {
            const { drawingId } = drawing;

            for (const [key, value] of Object.entries(dist)) {
                const oldValue = oldDrawings[drawingId][key as keyof IDist];

                if (oldValue !== value) {
                    const action = jsonX.replaceOp(['drawings', drawingId, key], oldValue, value);

                    rawActions.push(action!);
                }
            }
        }

        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                actions: [],
                textRanges: null,
            },
        };

        doMutation.params.actions = rawActions.reduce((acc, cur) => {
            return JSONX.compose(acc, cur as JSONXActions);
        }, null as JSONXActions);

        const result = commandService.syncExecuteCommand<
            IRichTextEditingMutationParams,
            IRichTextEditingMutationParams
        >(doMutation.id, doMutation.params);

        return Boolean(result);
    },
};

interface IUpdateDocDrawingWrapTextParams {
    unitId: string;
    subUnitId: string;
    drawings: IDocDrawing[];
    wrapText: WrapTextType;
}

/**
 * The command to update drawing wrap text.
 */
export const UpdateDocDrawingWrapTextCommand: ICommand = {
    id: 'doc.command.update-doc-drawing-wrap-text',

    type: CommandType.COMMAND,

    handler: (accessor: IAccessor, params?: IUpdateDocDrawingWrapTextParams) => {
        if (params == null) {
            return false;
        }

        const commandService = accessor.get(ICommandService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const documentDataModel = univerInstanceService.getCurrentUniverDocInstance();
        if (documentDataModel == null) {
            return false;
        }

        const { drawings, wrapText, unitId } = params;

        const jsonX = JSONX.getInstance();
        const rawActions: JSONXActions = [];

        const { drawings: oldDrawings = {} } = documentDataModel.getSnapshot();

        // Update drawing layoutType.
        for (const drawing of drawings) {
            const { drawingId } = drawing;

            const oldWrapText = oldDrawings[drawingId].wrapText;

            if (oldWrapText !== wrapText) {
                const action = jsonX.replaceOp(['drawings', drawingId, 'wrapText'], oldWrapText, wrapText);

                rawActions.push(action!);
            }
        }

        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                actions: [],
                textRanges: null,
            },
        };

        doMutation.params.actions = rawActions.reduce((acc, cur) => {
            return JSONX.compose(acc, cur as JSONXActions);
        }, null as JSONXActions);

        const result = commandService.syncExecuteCommand<
            IRichTextEditingMutationParams,
            IRichTextEditingMutationParams
        >(doMutation.id, doMutation.params);

        return Boolean(result);
    },
};

export interface IDrawingDocTransform {
    drawingId: string;
    key: 'size' | 'angle' | 'positionH' | 'positionV';
    value: ISize | number | IObjectPositionH | IObjectPositionV;
}

export interface IUpdateDrawingDocTransformParams {
    unitId: string;
    subUnitId: string;
    drawings: IDrawingDocTransform[];
}

/**
 * The command to update drawing position.
 */
export const UpdateDrawingDocTransformCommand: ICommand = {
    id: 'doc.command.update-drawing-doc-transform',

    type: CommandType.COMMAND,

    handler: (accessor: IAccessor, params?: IUpdateDrawingDocTransformParams) => {
        if (params == null) {
            return false;
        }

        const commandService = accessor.get(ICommandService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const renderManagerService = accessor.get(IRenderManagerService);

        const renderObject = renderManagerService.getRenderById(params.unitId);
        const scene = renderObject?.scene;
        if (scene == null) {
            return false;
        }
        const transformer = scene.getTransformerByCreate();

        const documentDataModel = univerInstanceService.getCurrentUniverDocInstance();
        if (documentDataModel == null) {
            return false;
        }

        const { drawings, unitId } = params;

        const jsonX = JSONX.getInstance();
        const rawActions: JSONXActions = [];

        const { drawings: oldDrawings = {} } = documentDataModel.getSnapshot();

        // Update drawing layoutType.
        for (const drawing of drawings) {
            const { drawingId, key, value } = drawing;

            const oldValue = oldDrawings[drawingId].docTransform[key];

            if (!Tools.diffValue(oldValue, value)) {
                const action = jsonX.replaceOp(['drawings', drawingId, 'docTransform', key], oldValue, value);

                rawActions.push(action!);
            }
        }

        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                actions: [],
                textRanges: null,
                debounce: true,
            },
        };

        doMutation.params.actions = rawActions.reduce((acc, cur) => {
            return JSONX.compose(acc, cur as JSONXActions);
        }, null as JSONXActions);

        const result = commandService.syncExecuteCommand<
            IRichTextEditingMutationParams,
            IRichTextEditingMutationParams
        >(doMutation.id, doMutation.params);

        transformer.refreshControls();

        return Boolean(result);
    },
};

export interface IMoveInlineDrawingParams {
    unitId: string;
    subUnitId: string;
    drawing: IDocDrawingBase;
    offset: number;
    segmentId: string;
    segmentPage: number;
    needRefreshDrawings?: boolean;
}

/**
 * The command to move inline drawing.
 */
export const IMoveInlineDrawingCommand: ICommand = {
    id: 'doc.command.move-inline-drawing',

    type: CommandType.COMMAND,

    handler: (accessor: IAccessor, params: IMoveInlineDrawingParams) => {
        if (params == null) {
            return false;
        }

        const renderManagerService = accessor.get(IRenderManagerService);
        const docSelectionRenderService = renderManagerService.getRenderById(params.unitId)?.with(DocSelectionRenderService);

        const docRefreshDrawingsService = accessor.get(DocRefreshDrawingsService);
        const renderObject = renderManagerService.getRenderById(params.unitId);
        const scene = renderObject?.scene;
        const skeleton = renderObject?.with(DocSkeletonManagerService).getSkeleton();
        if (scene == null || docSelectionRenderService == null) {
            return false;
        }
        const transformer = scene.getTransformerByCreate();

        const commandService = accessor.get(ICommandService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const documentDataModel = univerInstanceService.getCurrentUniverDocInstance();
        if (documentDataModel == null) {
            return false;
        }

        const { drawing, unitId, offset, segmentId: newSegmentId, segmentPage, needRefreshDrawings } = params;

        // Need to refresh drawings if not find the anchor position.
        if (needRefreshDrawings) {
            docRefreshDrawingsService.refreshDrawings(skeleton);
            transformer.refreshControls();
            return true;
        }

        const rawActions: JSONXActions = [];

        const { drawingId } = drawing;
        const segmentId = docSelectionRenderService.getSegment() ?? '';

        const actions = getDeleteAndInsertCustomBlockActions(
            newSegmentId,
            segmentId,
            segmentPage,
            offset,
            drawingId,
            documentDataModel,
            docSelectionRenderService
        );

        if (actions == null || actions.length === 0) {
            docRefreshDrawingsService.refreshDrawings(skeleton);
            transformer.refreshControls();
            return false;
        }

        rawActions.push(...actions);

        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                actions: [],
                textRanges: null,
            },
        };

        doMutation.params.actions = rawActions.reduce((acc, cur) => {
            return JSONX.compose(acc, cur as JSONXActions);
        }, null as JSONXActions);

        const result = commandService.syncExecuteCommand<
            IRichTextEditingMutationParams,
            IRichTextEditingMutationParams
        >(doMutation.id, doMutation.params);

        transformer.refreshControls();

        return Boolean(result);
    },
};

export interface ITransformNonInlineDrawingParams {
    unitId: string;
    subUnitId: string;
    drawing: IDocDrawingBase;
    offset: number;
    docTransform: IDocDrawingPosition;
    segmentId: string;
    segmentPage: number;
}

/**
 * The command to transform non-inline drawing.
 */
export const ITransformNonInlineDrawingCommand: ICommand = {
    id: 'doc.command.transform-non-inline-drawing',

    type: CommandType.COMMAND,

    // eslint-disable-next-line max-lines-per-function
    handler: (accessor: IAccessor, params?: ITransformNonInlineDrawingParams) => {
        if (params == null) {
            return false;
        }

        const renderManagerService = accessor.get(IRenderManagerService);

        const docSelectionRenderService = renderManagerService.getRenderById(params.unitId)?.with(DocSelectionRenderService);

        const renderObject = renderManagerService.getRenderById(params.unitId);
        const scene = renderObject?.scene;
        if (scene == null || docSelectionRenderService == null) {
            return false;
        }
        const transformer = scene.getTransformerByCreate();

        const commandService = accessor.get(ICommandService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const documentDataModel = univerInstanceService.getCurrentUniverDocInstance();
        if (documentDataModel == null) {
            return false;
        }

        const { drawing, unitId, offset, docTransform, segmentId: newSegmentId, segmentPage } = params;
        const rawActions: JSONXActions = [];

        const { drawingId } = drawing;

        const segmentId = docSelectionRenderService.getSegment() ?? '';

        const actions = getDeleteAndInsertCustomBlockActions(
            newSegmentId,
            segmentId,
            segmentPage,
            offset,
            drawingId,
            documentDataModel,
            docSelectionRenderService
        );

        if (actions == null) {
            return false;
        }

        if (actions.length > 0) {
            rawActions.push(...actions);
        }

        const jsonX = JSONX.getInstance();

        const { drawings: oldDrawings = {} } = documentDataModel.getSnapshot();
        const oldDocTransform = oldDrawings[drawingId].docTransform;
        const { positionH: oldPositionH, positionV: oldPositionV, size: oldSize, angle: oldAngle } = oldDocTransform;

        if (!Tools.diffValue(oldPositionH, docTransform.positionH)) {
            const updateAction = jsonX.replaceOp(['drawings', drawingId, 'docTransform', 'positionH'], oldPositionH, docTransform.positionH);

            rawActions.push(updateAction!);
        }

        if (!Tools.diffValue(oldPositionV, docTransform.positionV)) {
            const updateAction = jsonX.replaceOp(['drawings', drawingId, 'docTransform', 'positionV'], oldPositionV, docTransform.positionV);

            rawActions.push(updateAction!);
        }

        if (!Tools.diffValue(oldSize, docTransform.size)) {
            const updateAction = jsonX.replaceOp(['drawings', drawingId, 'docTransform', 'size'], oldSize, docTransform.size);

            rawActions.push(updateAction!);
        }

        if (!Tools.diffValue(oldAngle, docTransform.angle)) {
            const updateAction = jsonX.replaceOp(['drawings', drawingId, 'docTransform', 'angle'], oldAngle, docTransform.angle);

            rawActions.push(updateAction!);
        }

        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                actions: [],
                textRanges: null,
                debounce: true,
            },
        };

        doMutation.params.actions = rawActions.reduce((acc, cur) => {
            return JSONX.compose(acc, cur as JSONXActions);
        }, null as JSONXActions);

        const result = commandService.syncExecuteCommand<
            IRichTextEditingMutationParams,
            IRichTextEditingMutationParams
        >(doMutation.id, doMutation.params);

        transformer.refreshControls();

        return Boolean(result);
    },
};
