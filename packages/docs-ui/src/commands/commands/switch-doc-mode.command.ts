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

import type { ICommand, ICommandInfo, JSONXActions } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import { CommandType, DocumentFlavor, ICommandService, IUniverInstanceService, JSONX, ObjectRelativeFromV } from '@univerjs/core';
import { DocSelectionManagerService, DocSkeletonManagerService, RichTextEditingMutation } from '@univerjs/docs';
import { IRenderManagerService } from '@univerjs/engine-render';
import { DocSelectionRenderService } from '../../services/selection/doc-selection-render.service';

export interface ISwitchDocModeCommandParams { }

export const SwitchDocModeCommand: ICommand<ISwitchDocModeCommandParams> = {
    id: 'doc.command.switch-mode',

    type: CommandType.COMMAND,

    // eslint-disable-next-line max-lines-per-function, complexity
    handler: (accessor) => {
        const commandService = accessor.get(ICommandService);
        const renderManagerService = accessor.get(IRenderManagerService);
        const docSelectionManagerService = accessor.get(DocSelectionManagerService);

        const univerInstanceService = accessor.get(IUniverInstanceService);
        const docDataModel = univerInstanceService.getCurrentUniverDocInstance();

        if (docDataModel == null) {
            return false;
        }

        const unitId = docDataModel.getUnitId();

        const skeleton = renderManagerService.getRenderById(unitId)
            ?.with(DocSkeletonManagerService)
            .getSkeleton();

        const docSelectionRenderService = renderManagerService.getRenderById(unitId)?.with(DocSelectionRenderService);

        if (skeleton == null || docSelectionRenderService == null) {
            return false;
        }

        const segmentId = docSelectionRenderService?.getSegment();

        const segmentPage = docSelectionRenderService?.getSegmentPage();

        const oldDocumentFlavor = docDataModel.getSnapshot().documentStyle.documentFlavor;

        const docRanges = docSelectionManagerService.getDocRanges();

        const doMutation: ICommandInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                actions: [],
                textRanges: (oldDocumentFlavor === DocumentFlavor.TRADITIONAL && !!segmentId) ? [] : docRanges,
            },
        };

        const jsonX = JSONX.getInstance();

        const rawActions: JSONXActions = [];
        let action;

        if (oldDocumentFlavor === undefined) {
            action = jsonX.insertOp(['documentStyle', 'documentFlavor'], DocumentFlavor.MODERN);
        } else {
            if (oldDocumentFlavor === DocumentFlavor.MODERN) {
                action = jsonX.replaceOp(['documentStyle', 'documentFlavor'], oldDocumentFlavor, DocumentFlavor.TRADITIONAL);
            } else {
                action = jsonX.replaceOp(['documentStyle', 'documentFlavor'], oldDocumentFlavor, DocumentFlavor.MODERN);
            }
        }

        if (action) {
            rawActions.push(action);
        } else {
            return false;
        }

        // Change all drawings' position to relative to paragraph if necessary.
        // And only need to change drawing in body.
        if (oldDocumentFlavor !== DocumentFlavor.MODERN) {
            const snapshot = docDataModel.getSnapshot();
            const { drawings = {}, body } = snapshot;
            const customBlocks = body?.customBlocks ?? [];

            for (const drawingId in drawings) {
                const drawing = drawings[drawingId];

                // if (drawing.layoutType === PositionedObjectLayoutType.INLINE) {
                //     continue;
                // }

                const customBlock = customBlocks.find((block) => block.blockId === drawingId);

                // If drawing is not in body, skip it.
                if (customBlock == null) {
                    continue;
                }

                const drawingPositionV = drawing.docTransform.positionV;

                const { relativeFrom: prevRelativeFrom, posOffset: prevPosOffset } = drawingPositionV;

                if (prevRelativeFrom === ObjectRelativeFromV.PARAGRAPH) {
                    continue;
                }

                const { startIndex } = customBlock;

                const glyph = skeleton.findNodeByCharIndex(startIndex, segmentId, segmentPage);
                const line = glyph?.parent?.parent;
                const column = line?.parent;
                const paragraphStartLine = column?.lines.find((l) => l.paragraphIndex === line?.paragraphIndex && l.paragraphStart);
                const page = column?.parent?.parent;

                if (glyph == null || line == null || paragraphStartLine == null || column == null || page == null) {
                    continue;
                }

                let delta = 0;

                if (prevRelativeFrom === ObjectRelativeFromV.LINE) {
                    delta -= line.top;
                } else if (prevRelativeFrom === ObjectRelativeFromV.PAGE) {
                    delta += page.marginTop;
                }

                delta += paragraphStartLine.top;

                const newPositionV = {
                    ...drawingPositionV,
                    relativeFrom: ObjectRelativeFromV.PARAGRAPH,
                    posOffset: (prevPosOffset ?? 0) - delta,
                };

                const updateDrawingAction = jsonX.replaceOp(['drawings', drawingId, 'docTransform', 'positionV'], drawingPositionV, newPositionV);

                if (updateDrawingAction) {
                    rawActions.push(updateDrawingAction);
                }
            }
        }

        doMutation.params!.actions = rawActions.reduce((acc, cur) => {
            return JSONX.compose(acc, cur as JSONXActions);
        }, null as JSONXActions);

        const result = commandService.syncExecuteCommand<
            IRichTextEditingMutationParams,
            IRichTextEditingMutationParams
        >(doMutation.id, doMutation.params);

        return Boolean(result);
    },
};
