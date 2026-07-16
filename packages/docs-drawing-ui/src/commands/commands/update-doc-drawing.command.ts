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

import type { DocumentDataModel, IAccessor, ICommand, IDocDrawingBase, IDocDrawingPosition, IMutationInfo, JSONXActions, WrapTextType } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import type { IDocDrawing } from '@univerjs/docs-drawing';
import {
    CommandType,
    getRichTextEditPath,
    ICommandService,
    IUniverInstanceService,
    JSONX,
    TextX,
    TextXActionType,
    Tools,
    UniverInstanceType,
} from '@univerjs/core';
import { DocSkeletonManagerService, RichTextEditingMutation } from '@univerjs/docs';
import { DocSelectionRenderService } from '@univerjs/docs-ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import { DocRefreshDrawingsService } from '../../services/doc-refresh-drawings.service';

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

    const oldBody = documentDataModel.getSelfOrHeaderFooterModel(oldSegmentId)?.getBody();
    const body = documentDataModel.getSelfOrHeaderFooterModel(segmentId)?.getBody();

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

        const { drawings, dist, unitId } = params;
        const documentDataModel = univerInstanceService.getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC);
        if (documentDataModel == null) {
            return false;
        }

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

        const { drawings, wrapText, unitId } = params;
        const documentDataModel = univerInstanceService.getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC);
        if (documentDataModel == null) {
            return false;
        }

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

        const { drawing, unitId, offset, segmentId: newSegmentId, segmentPage, needRefreshDrawings } = params;

        const renderManagerService = accessor.get(IRenderManagerService);
        const docSelectionRenderService = renderManagerService.getRenderUnitById(unitId)?.with(DocSelectionRenderService);

        const docRefreshDrawingsService = accessor.get(DocRefreshDrawingsService);
        const renderObject = renderManagerService.getRenderUnitById(unitId);
        const scene = renderObject?.scene;
        const skeleton = renderObject?.with(DocSkeletonManagerService).getSkeleton();
        if (scene == null || docSelectionRenderService == null) {
            return false;
        }

        const transformer = scene.getTransformerByCreate();

        const commandService = accessor.get(ICommandService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const documentDataModel = univerInstanceService.getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC);
        if (documentDataModel == null) {
            return false;
        }

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

        const { drawing, unitId, offset, docTransform, segmentId: newSegmentId, segmentPage } = params;

        const renderManagerService = accessor.get(IRenderManagerService);
        const docSelectionRenderService = renderManagerService.getRenderUnitById(unitId)?.with(DocSelectionRenderService);

        const renderObject = renderManagerService.getRenderUnitById(unitId);
        const scene = renderObject?.scene;
        if (scene == null || docSelectionRenderService == null) {
            return false;
        }

        const transformer = scene.getTransformerByCreate();

        const commandService = accessor.get(ICommandService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const documentDataModel = univerInstanceService.getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC);
        if (documentDataModel == null) {
            return false;
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
