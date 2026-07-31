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

import type { IGroupBaseBound, ITransformState } from '@univerjs/core';
import type { SpreadsheetSkeleton } from '@univerjs/engine-render';
import type { ICellOverGridPosition } from '@univerjs/sheets';
import type {
    ISheetDrawing,
    ISheetDrawingPosition,
    ISheetFloatDom,
    ISheetImage,
} from './sheet-drawing.service';
import { convertPositionCellToSheetOverGrid, convertPositionSheetOverGridToAbsolute } from '@univerjs/sheets';
import { transformToAxisAlignPosition, transformToDrawingPosition } from '../basics/transform-position';
import {
    SheetDrawingAnchorType,
} from './sheet-drawing.service';

/**
 * Anchor a drawing to one cell while keeping a fixed pixel extent.
 */
export interface ISheetDrawingOneCellPlacement {
    /** Placement discriminator. */
    kind: SheetDrawingAnchorType.Position;
    /** Zero-based anchor cell and pixel offsets from its top-left corner. */
    from: ICellOverGridPosition;
    /** Drawing width in pixels. */
    width: number;
    /** Drawing height in pixels. */
    height: number;
}

/**
 * Anchor a drawing between two cell markers.
 */
export interface ISheetDrawingTwoCellPlacement {
    /** Placement discriminator. */
    kind: SheetDrawingAnchorType.Both;
    /** Zero-based start cell and pixel offsets. */
    from: ICellOverGridPosition;
    /** Zero-based end cell and pixel offsets. */
    to: ICellOverGridPosition;
}

/**
 * Position a drawing in the Sheet canvas pixel coordinate system.
 */
export interface ISheetDrawingAbsolutePlacement {
    /** Placement discriminator. */
    kind: SheetDrawingAnchorType.None;
    /** Horizontal pixel offset from the Sheet canvas origin. */
    left: number;
    /** Vertical pixel offset from the Sheet canvas origin. */
    top: number;
    /** Drawing width in pixels. */
    width: number;
    /** Drawing height in pixels. */
    height: number;
}

/**
 * Explicit Sheet drawing placement.
 */
export type ISheetDrawingPlacement =
    | ISheetDrawingOneCellPlacement
    | ISheetDrawingTwoCellPlacement
    | ISheetDrawingAbsolutePlacement;

/**
 * Infer cell markers from model-space bounds after the anchor semantics have
 * been selected explicitly.
 */
export interface ISheetDrawingPlacementByBounds {
    /** Position, Both, or None semantics. */
    kind: SheetDrawingAnchorType;
    /** Bounds in the Sheet model coordinate system. */
    bounds: IGroupBaseBound;
}

/**
 * Exact Placement or model-space bounds to normalize into one.
 */
export type ISheetDrawingPlacementInput = ISheetDrawingPlacement | ISheetDrawingPlacementByBounds;

export function getSheetDrawingPlacement(drawing: ISheetDrawing): ISheetDrawingPlacement {
    const anchorType = drawing.anchorType ?? SheetDrawingAnchorType.Position;
    if (anchorType === SheetDrawingAnchorType.None) {
        return {
            kind: SheetDrawingAnchorType.None,
            left: drawing.transform?.left ?? 0,
            top: drawing.transform?.top ?? 0,
            width: drawing.transform?.width ?? 0,
            height: drawing.transform?.height ?? 0,
        };
    }

    if (anchorType === SheetDrawingAnchorType.Both) {
        return {
            kind: SheetDrawingAnchorType.Both,
            from: { ...drawing.sheetTransform.from },
            to: { ...drawing.sheetTransform.to },
        };
    }

    return {
        kind: SheetDrawingAnchorType.Position,
        from: { ...drawing.sheetTransform.from },
        width: drawing.transform?.width ?? 0,
        height: drawing.transform?.height ?? 0,
    };
}

export function applySheetDrawingPlacement(
    drawing: ISheetImage,
    input: ISheetDrawingPlacementInput,
    skeleton?: SpreadsheetSkeleton
): ISheetImage;
export function applySheetDrawingPlacement(
    drawing: ISheetFloatDom,
    input: ISheetDrawingPlacementInput,
    skeleton?: SpreadsheetSkeleton
): ISheetFloatDom;
export function applySheetDrawingPlacement(
    drawing: ISheetDrawing,
    input: ISheetDrawingPlacementInput,
    skeleton?: SpreadsheetSkeleton
): ISheetDrawing;
export function applySheetDrawingPlacement(
    drawing: ISheetDrawing,
    input: ISheetDrawingPlacementInput,
    skeleton?: SpreadsheetSkeleton
): ISheetDrawing {
    const placement = normalizeSheetDrawingPlacement(input, skeleton);

    if (placement.kind === SheetDrawingAnchorType.None) {
        const transform = withExistingTransform(drawing.transform, placement);
        const sheetTransform = absoluteSheetTransform(placement, drawing.sheetTransform);
        return {
            ...drawing,
            anchorType: SheetDrawingAnchorType.None,
            transform,
            sheetTransform,
            axisAlignSheetTransform: sheetTransform,
        };
    }

    if (!skeleton) {
        throw new Error('SHEET_DRAWING_PLACEMENT_SKELETON_REQUIRED');
    }

    if (placement.kind === SheetDrawingAnchorType.Position) {
        const converted = convertPositionCellToSheetOverGrid(
            drawing.unitId,
            drawing.subUnitId,
            placement.from,
            placement.width,
            placement.height,
            skeleton
        );
        const sheetTransform = withExistingSheetTransform(drawing.sheetTransform, converted.sheetTransform);
        const transform = withExistingTransform(drawing.transform, converted.transform);
        return {
            ...drawing,
            anchorType: SheetDrawingAnchorType.Position,
            sheetTransform,
            transform,
            axisAlignSheetTransform: transformToAxisAlignPosition(transform, skeleton),
        };
    }

    const sheetTransform = withExistingSheetTransform(drawing.sheetTransform, {
        from: placement.from,
        to: placement.to,
    });
    const bounds = convertPositionSheetOverGridToAbsolute(
        drawing.unitId,
        drawing.subUnitId,
        sheetTransform,
        skeleton
    );
    const transform = withExistingTransform(drawing.transform, bounds);
    return {
        ...drawing,
        anchorType: SheetDrawingAnchorType.Both,
        sheetTransform,
        transform,
        axisAlignSheetTransform: transformToAxisAlignPosition(transform, skeleton),
    };
}

/**
 * Normalize exact markers or model-space bounds to the authoritative
 * Position, Both, or None Placement.
 */
export function normalizeSheetDrawingPlacement(
    input: ISheetDrawingPlacementInput,
    skeleton?: SpreadsheetSkeleton
): ISheetDrawingPlacement {
    if (!('bounds' in input)) {
        validatePlacement(input);
        if (input.kind === SheetDrawingAnchorType.Both && skeleton) {
            validateBounds(convertPositionSheetOverGridToAbsolute(
                skeleton.worksheet.getUnitId(),
                skeleton.worksheet.getSheetId(),
                {
                    from: input.from,
                    to: input.to,
                },
                skeleton
            ));
        }
        return input;
    }

    validateBounds(input.bounds);
    if (input.kind === SheetDrawingAnchorType.None) {
        return {
            kind: SheetDrawingAnchorType.None,
            ...input.bounds,
        };
    }
    if (!skeleton) {
        throw new Error('SHEET_DRAWING_PLACEMENT_SKELETON_REQUIRED');
    }

    const sheetTransform = transformToDrawingPosition(input.bounds, skeleton);
    if (input.kind === SheetDrawingAnchorType.Position) {
        return {
            kind: SheetDrawingAnchorType.Position,
            from: sheetTransform.from,
            width: input.bounds.width,
            height: input.bounds.height,
        };
    }
    if (input.kind === SheetDrawingAnchorType.Both) {
        return {
            kind: SheetDrawingAnchorType.Both,
            from: sheetTransform.from,
            to: sheetTransform.to,
        };
    }

    throw new Error('SHEET_DRAWING_PLACEMENT_KIND_INVALID');
}

function withExistingSheetTransform(
    current: ISheetDrawingPosition,
    placement: Pick<ISheetDrawingPosition, 'from' | 'to'>
): ISheetDrawingPosition {
    return {
        ...current,
        from: { ...placement.from },
        to: { ...placement.to },
    };
}

function withExistingTransform(
    current: ITransformState | null | undefined | void,
    bounds: Pick<ITransformState, 'left' | 'top' | 'width' | 'height'>
): ITransformState {
    return {
        ...current,
        left: bounds.left,
        top: bounds.top,
        width: bounds.width,
        height: bounds.height,
    };
}

function absoluteSheetTransform(
    placement: ISheetDrawingAbsolutePlacement,
    current: ISheetDrawingPosition
): ISheetDrawingPosition {
    return {
        ...current,
        from: {
            column: 0,
            columnOffset: placement.left,
            row: 0,
            rowOffset: placement.top,
        },
        to: {
            column: 0,
            columnOffset: placement.left + placement.width,
            row: 0,
            rowOffset: placement.top + placement.height,
        },
    };
}

function validatePlacement(placement: ISheetDrawingPlacement): void {
    if (placement.kind === SheetDrawingAnchorType.Position) {
        validateCellPosition(placement.from);
        validateExtent(placement.width, placement.height);
        return;
    }

    if (placement.kind === SheetDrawingAnchorType.Both) {
        validateCellPosition(placement.from);
        validateCellPosition(placement.to);
        return;
    }

    if (placement.kind === SheetDrawingAnchorType.None) {
        if (!Number.isFinite(placement.left) || !Number.isFinite(placement.top)) {
            throw new TypeError('SHEET_DRAWING_PLACEMENT_POSITION_INVALID');
        }
        validateExtent(placement.width, placement.height);
        return;
    }

    throw new Error('SHEET_DRAWING_PLACEMENT_KIND_INVALID');
}

function validateBounds(bounds: IGroupBaseBound): void {
    if (!Number.isFinite(bounds.left) || !Number.isFinite(bounds.top)) {
        throw new TypeError('SHEET_DRAWING_PLACEMENT_POSITION_INVALID');
    }
    validateExtent(bounds.width, bounds.height);
}

function validateCellPosition(position: ICellOverGridPosition): void {
    if (
        !Number.isInteger(position.row) ||
        !Number.isInteger(position.column) ||
        position.row < 0 ||
        position.column < 0 ||
        !Number.isFinite(position.rowOffset) ||
        !Number.isFinite(position.columnOffset)
    ) {
        throw new Error('SHEET_DRAWING_PLACEMENT_CELL_INVALID');
    }
}

function validateExtent(width: number, height: number): void {
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
        throw new Error('SHEET_DRAWING_PLACEMENT_EXTENT_INVALID');
    }
}
