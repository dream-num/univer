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

import type { IAccessor, ICommand, IDocDrawingPosition } from '@univerjs/core';
import type { IInsertDrawingCommandParams } from './interfaces';
import {
    BooleanNumber,
    CommandType,
    DrawingTypeEnum,
    generateRandomId,
    ICommandService,
    IUniverInstanceService,
    ObjectRelativeFromH,
    ObjectRelativeFromV,
    PositionedObjectLayoutType,
    UniverInstanceType,
    WrapTextType,
} from '@univerjs/core';
import { docDrawingPositionToTransform } from '@univerjs/docs-ui';
import { ImageSourceType } from '@univerjs/drawing';
import { InsertDocDrawingCommand } from './insert-doc-drawing.command';

type DocShapeKind = 'rectangle' | 'ellipse';

const DOC_SHAPE_FILL = '#3A60F7';
const DOC_SHAPE_STROKE = '#1D3EA6';

function createShapeSvgSource(shape: DocShapeKind, width: number, height: number) {
    const content = shape === 'ellipse'
        ? `<ellipse cx="${width / 2}" cy="${height / 2}" rx="${(width - 8) / 2}" ry="${(height - 8) / 2}" fill="${DOC_SHAPE_FILL}" stroke="${DOC_SHAPE_STROKE}" stroke-width="4" />`
        : `<rect x="4" y="4" width="${width - 8}" height="${height - 8}" rx="14" fill="${DOC_SHAPE_FILL}" stroke="${DOC_SHAPE_STROKE}" stroke-width="4" />`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">${content}</svg>`;

    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function createDefaultDocTransform(width: number, height: number): IDocDrawingPosition {
    return {
        size: {
            width,
            height,
        },
        positionH: {
            relativeFrom: ObjectRelativeFromH.PAGE,
            posOffset: 0,
        },
        positionV: {
            relativeFrom: ObjectRelativeFromV.PARAGRAPH,
            posOffset: 0,
        },
        angle: 0,
    };
}

function createShapeInsertCommand(shape: DocShapeKind, width: number, height: number, id: string): ICommand {
    return {
        id,
        type: CommandType.COMMAND,
        handler: async (accessor: IAccessor) => {
            const commandService = accessor.get(ICommandService);
            const univerInstanceService = accessor.get(IUniverInstanceService);
            const unitId = univerInstanceService.getCurrentUnitOfType(UniverInstanceType.UNIVER_DOC)?.getUnitId();

            if (!unitId) {
                return false;
            }

            const docTransform = createDefaultDocTransform(width, height);

            return commandService.executeCommand(InsertDocDrawingCommand.id, {
                unitId,
                drawings: [{
                    unitId,
                    subUnitId: unitId,
                    drawingId: generateRandomId(6),
                    drawingType: DrawingTypeEnum.DRAWING_IMAGE,
                    imageSourceType: ImageSourceType.BASE64,
                    source: createShapeSvgSource(shape, width, height),
                    transform: docDrawingPositionToTransform(docTransform),
                    docTransform,
                    behindDoc: BooleanNumber.FALSE,
                    title: '',
                    description: '',
                    layoutType: PositionedObjectLayoutType.INLINE,
                    wrapText: WrapTextType.BOTH_SIDES,
                    distB: 0,
                    distL: 0,
                    distR: 0,
                    distT: 0,
                }],
            } as IInsertDrawingCommandParams);
        },
    };
}

export const InsertDocRectangleShapeCommand = createShapeInsertCommand(
    'rectangle',
    144,
    96,
    'doc.command.insert-float-shape.rectangle'
);

export const InsertDocEllipseShapeCommand = createShapeInsertCommand(
    'ellipse',
    112,
    112,
    'doc.command.insert-float-shape.ellipse'
);
