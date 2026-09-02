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

import type { DocumentDataModel, IAccessor, ICommand, IObjectPositionH, IObjectPositionV } from '@univerjs/core';
import type { IDocDrawing, IDrawingDocTransform, IUpdateDrawingDocTransformCommandParams } from '@univerjs/docs-drawing';
import type { IDocumentSkeletonCached } from '@univerjs/engine-render';
import {
    CommandType,
    Direction,
    ICommandService,
    IUniverInstanceService,
    PositionedObjectLayoutType,
    UniverInstanceType,
} from '@univerjs/core';
import { DocSkeletonManagerService } from '@univerjs/docs';
import { IDocDrawingService, UpdateDrawingDocTransformCommand } from '@univerjs/docs-drawing';
import { IRenderManagerService } from '@univerjs/engine-render';
import { findDrawingAnchorInPage, resolveDrawingAnchorOffsets } from '../../utils/drawing-anchor-position';

export interface IMoveDrawingsCommandParams {
    direction: Direction;
}

export const MoveDocDrawingsCommand: ICommand = {

    id: 'doc.command.move-drawing',

    type: CommandType.COMMAND,
    handler: (accessor: IAccessor, params: IMoveDrawingsCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const docDrawingService = accessor.get(IDocDrawingService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const renderManagerService = accessor.get(IRenderManagerService);

        const { direction } = params;

        const drawings = docDrawingService.getFocusDrawings();

        if (drawings.length === 0) {
            return false;
        }

        const unitId = drawings[0].unitId;

        const renderObject = renderManagerService.getRenderUnitById(unitId);
        const scene = renderObject?.scene;
        if (scene == null) {
            return false;
        }
        const transformer = scene.getTransformerByCreate();
        const skeletonData = renderObject?.with(DocSkeletonManagerService).getSkeleton()?.getSkeletonData();

        const documentDataModel = univerInstanceService.getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC);

        const newDrawings = drawings.map((drawing) => {
            const { drawingId } = drawing as IDocDrawing;
            const drawingData = documentDataModel?.getSnapshot().drawings?.[drawingId];

            // Inline drawing can not be moved by shortcut.
            if (drawingData == null || drawingData.layoutType === PositionedObjectLayoutType.INLINE) {
                return null;
            }

            const { positionH, positionV } = drawingData.docTransform;
            const anchorLookup = skeletonData == null
                ? { anchor: null, previewOnly: false }
                : findDrawingAnchor(skeletonData, drawingId);
            if (anchorLookup.previewOnly) {
                return null;
            }

            const { anchor } = anchorLookup;
            const offsets = anchor == null
                ? { horizontal: positionH.posOffset ?? 0, vertical: positionV.posOffset ?? 0 }
                : resolveDrawingAnchorOffsets(anchor, positionH, positionV);
            const newPositionH = {
                ...(positionH.relativeFrom == null ? {} : { relativeFrom: positionH.relativeFrom }),
                posOffset: offsets.horizontal,
            } as IObjectPositionH;
            const newPositionV = {
                ...(positionV.relativeFrom == null ? {} : { relativeFrom: positionV.relativeFrom }),
                posOffset: offsets.vertical,
            } as IObjectPositionV;

            if (direction === Direction.UP) {
                newPositionV.posOffset = (newPositionV.posOffset ?? 0) - 2;
            } else if (direction === Direction.DOWN) {
                newPositionV.posOffset = (newPositionV.posOffset ?? 0) + 2;
            } else if (direction === Direction.LEFT) {
                newPositionH.posOffset = (newPositionH.posOffset ?? 0) - 2;
            } else if (direction === Direction.RIGHT) {
                newPositionH.posOffset = (newPositionH.posOffset ?? 0) + 2;
            }

            return {
                drawingId,
                key: direction === Direction.UP || direction === Direction.DOWN ? 'positionV' : 'positionH',
                value: direction === Direction.UP || direction === Direction.DOWN ? newPositionV : newPositionH,
            };
        }).filter((drawing) => drawing != null) as IDrawingDocTransform[];

        if (newDrawings.length === 0) {
            return false;
        }

        const result = commandService.syncExecuteCommand<IUpdateDrawingDocTransformCommandParams>(UpdateDrawingDocTransformCommand.id, {
            unitId,
            subUnitId: unitId,
            drawings: newDrawings,
        });

        transformer.refreshControls();

        return Boolean(result);
    },
};

function findDrawingAnchor(
    skeletonData: IDocumentSkeletonCached,
    drawingId: string
) {
    let foundInPreview = false;

    for (const page of skeletonData.pages) {
        const bodyAnchor = findDrawingAnchorInPage(page, drawingId, page.marginTop, page.marginLeft);
        const header = page.headerId == null
            ? undefined
            : skeletonData.skeHeaders.get(page.headerId)?.get(page.pageWidth);
        const headerAnchor = header == null
            ? null
            : findDrawingAnchorInPage(header, drawingId, header.marginTop, page.marginLeft);
        const footer = page.footerId == null
            ? undefined
            : skeletonData.skeFooters.get(page.footerId)?.get(page.pageWidth);
        const footerTop = footer == null ? 0 : page.pageHeight - page.marginBottom + footer.marginTop;
        const footerAnchor = footer == null
            ? null
            : findDrawingAnchorInPage(footer, drawingId, footerTop, page.marginLeft);
        const anchor = bodyAnchor ?? headerAnchor ?? footerAnchor;
        if (anchor == null) {
            continue;
        }

        if (!page.isLayoutPlaceholder && !page.isMaterializationPlaceholder) {
            return { anchor, previewOnly: false };
        }

        foundInPreview = true;
    }

    return { anchor: null, previewOnly: foundInPreview };
}
