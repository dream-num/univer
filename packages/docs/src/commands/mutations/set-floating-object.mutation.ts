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

import type {
    BooleanNumber,
    IMutation,
    ISize,
    ObjectPositionH,
    ObjectPositionV,
    PositionedObjectLayoutType,
    WrapTextType,
} from '@univerjs/core';
import { CommandType, IUniverInstanceService } from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

export interface ISeachDrawingMutation {
    documentId: string;
    objectId: string;
}

export interface IDrawingTransformMutation extends ISeachDrawingMutation {
    size?: ISize;
    positionH?: ObjectPositionH;
    positionV?: ObjectPositionV;
    angle?: number;
}

export const SetDrawingTransformMutationFactory = (
    accessor: IAccessor,
    params: IDrawingTransformMutation
): IDrawingTransformMutation => {
    const { documentId, objectId } = params;
    const documentModel = accessor.get(IUniverInstanceService).getUniverDocInstance(documentId);
    if (documentModel == null) {
        throw new Error('documentModel is null error!');
    }

    const drawings = documentModel.snapshot.drawings;

    if (drawings == null) {
        return {
            documentId,
            objectId,
        };
    }

    const drawing = drawings[objectId];

    if (drawing == null) {
        return {
            documentId,
            objectId,
        };
    }

    return {
        size: drawing.objectTransform.size,
        positionH: drawing.objectTransform.positionH,
        positionV: drawing.objectTransform.positionV,
        angle: drawing.objectTransform.angle,
        documentId,
        objectId,
    };
};

export const SetDrawingTransformMutation: IMutation<IDrawingTransformMutation> = {
    id: 'doc.mutation.set-drawing-transform',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const univerdoc = accessor.get(IUniverInstanceService).getUniverDocInstance(params.documentId);

        if (univerdoc == null) {
            return false;
        }

        let drawings = univerdoc.snapshot.drawings;

        if (drawings == null) {
            drawings = {};
            univerdoc.snapshot.drawings = drawings;
        }

        const { objectId, size, positionH, positionV, angle } = params;

        const drawing = drawings[objectId];

        if (drawing == null) {
            return false;
        }

        if (size != null) drawing.objectTransform.size = size;

        if (positionH != null) drawing.objectTransform.positionH = positionH;

        if (positionV != null) drawing.objectTransform.positionV = positionV;

        if (angle != null) drawing.objectTransform.angle = angle;

        return true;
    },
};

export interface IDrawingLayoutMutation extends ISeachDrawingMutation {
    layoutType?: PositionedObjectLayoutType;

    behindDoc?: BooleanNumber; // wrapNone
    start?: number[]; // wrapPolygon
    lineTo?: number[][]; // wrapPolygon
    wrapText?: WrapTextType; // wrapSquare | wrapThrough | wrapTight
    distL?: number; // wrapSquare | wrapThrough | wrapTight
    distR?: number; // wrapSquare | wrapThrough | wrapTight
    distT?: number; // wrapSquare | wrapTopAndBottom
    distB?: number; // wrapSquare | wrapTopAndBottom
}

export const SetDrawingLayoutMutation: IMutation<IDrawingLayoutMutation> = {
    id: 'doc.mutation.set-drawing-layout',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const univerdoc = accessor.get(IUniverInstanceService).getUniverDocInstance(params.documentId);

        if (univerdoc == null) {
            return false;
        }

        let drawings = univerdoc.snapshot.drawings;

        if (drawings == null) {
            drawings = {};
            univerdoc.snapshot.drawings = drawings;
        }

        const { objectId, layoutType, behindDoc, start, lineTo, wrapText, distL, distR, distT, distB } = params;

        const drawing = drawings[objectId];

        if (drawing == null) {
            return false;
        }

        layoutType && (drawing.layoutType = layoutType);

        behindDoc && (drawing.behindDoc = behindDoc);

        start && (drawing.start = start);

        lineTo && (drawing.lineTo = lineTo);

        wrapText && (drawing.wrapText = wrapText);

        distL && (drawing.distL = distL);

        distR && (drawing.distR = distR);

        distT && (drawing.distT = distT);

        distB && (drawing.distB = distB);

        return true;
    },
};

export interface IDrawingInfoMutation extends ISeachDrawingMutation {
    title?: string;
    description?: string;
}

export const SetDrawingInfoMutation: IMutation<IDrawingInfoMutation> = {
    id: 'doc.mutation.set-drawing-info',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const univerdoc = accessor.get(IUniverInstanceService).getUniverDocInstance(params.documentId);

        if (univerdoc == null) {
            return false;
        }

        let drawings = univerdoc.snapshot.drawings;

        if (drawings == null) {
            drawings = {};
            univerdoc.snapshot.drawings = drawings;
        }

        const { objectId, title, description } = params;

        const drawing = drawings[objectId];

        if (drawing == null) {
            return false;
        }

        title && (drawing.title = title);

        description && (drawing.description = description);

        return true;
    },
};
