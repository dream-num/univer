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

import type { IObjectPositionH, IObjectPositionV } from '@univerjs/core';
import type { IDocumentSkeletonDrawing, IDocumentSkeletonHeaderFooter, IDocumentSkeletonPage } from '@univerjs/engine-render';
import { ObjectRelativeFromH, ObjectRelativeFromV } from '@univerjs/core';

export interface IDrawingAnchorInPage {
    skeDrawing: IDocumentSkeletonDrawing;
    pageMarginTop: number;
    pageMarginLeft: number;
}

export function findDrawingAnchorInPage(
    page: IDocumentSkeletonPage | IDocumentSkeletonHeaderFooter,
    drawingId: string,
    pageMarginTop: number,
    pageMarginLeft: number
): IDrawingAnchorInPage | null {
    const skeDrawing = page.skeDrawings.get(drawingId);
    if (skeDrawing) {
        return { skeDrawing, pageMarginTop, pageMarginLeft };
    }

    for (const table of page.skeTables.values()) {
        for (const row of table.rows) {
            for (const cell of row.cells) {
                const cellAnchor = findDrawingAnchorInPage(cell, drawingId, cell.marginTop, cell.marginLeft);
                if (cellAnchor) {
                    return cellAnchor;
                }
            }
        }
    }

    return null;
}

export function resolveDrawingAnchorOffsets(
    anchor: IDrawingAnchorInPage,
    positionH: IObjectPositionH,
    positionV: IObjectPositionV
): { horizontal: number; vertical: number } {
    const { skeDrawing, pageMarginTop, pageMarginLeft } = anchor;
    let horizontal = skeDrawing.aLeft;
    let vertical = skeDrawing.aTop;

    if (positionH.relativeFrom === ObjectRelativeFromH.MARGIN) {
        horizontal -= pageMarginLeft;
    } else if (positionH.relativeFrom === ObjectRelativeFromH.COLUMN) {
        horizontal -= skeDrawing.columnLeft;
    }

    if (positionV.relativeFrom === ObjectRelativeFromV.PAGE) {
        vertical += pageMarginTop;
    } else if (positionV.relativeFrom === ObjectRelativeFromV.LINE) {
        vertical -= skeDrawing.lineTop;
    } else if (positionV.relativeFrom === ObjectRelativeFromV.PARAGRAPH) {
        vertical -= skeDrawing.blockAnchorTop;
    }

    return { horizontal, vertical };
}
