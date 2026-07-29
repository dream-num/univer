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

import { DrawingTypeEnum, type IDrawingParam, type IGroupBaseBound, type ITransformState, type Nullable } from '@univerjs/core';
import {
    convertPositionCellToSheetOverGrid,
    convertPositionSheetOverGridToAbsolute,
    type ICellOverGridPosition,
    type SpreadsheetSkeleton,
} from '@univerjs/sheets';
import { transformToAxisAlignPosition, transformToDrawingPosition } from '../basics/transform-position';
import {
    type ISheetDrawingPosition,
    type ISheetFloatDom,
    type ISheetImage,
    type ISheetShape,
    SheetDrawingAnchorType,
} from './sheet-drawing.service';

export type ISheetDrawingPlacementTarget = ISheetImage | ISheetShape;
type SheetDrawingPlacementMaterializationTarget = ISheetDrawingPlacementTarget | ISheetFloatDom;

export function isSheetDrawingPlacementTarget(
    drawing: Nullable<IDrawingParam>
): drawing is ISheetDrawingPlacementTarget {
    return Boolean(
        drawing &&
        (drawing.drawingType === DrawingTypeEnum.DRAWING_IMAGE || drawing.drawingType === DrawingTypeEnum.DRAWING_SHAPE) &&
        'sheetTransform' in drawing
    );
}

/**
 * Position follows the anchor cell while the extent remains fixed.
 * This maps to OOXML `xdr:oneCellAnchor`.
 */
export interface ISheetDrawingPositionPlacement {
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
 * Position and extent follow two cell markers.
 * This maps to OOXML `xdr:twoCellAnchor`.
 */
export interface ISheetDrawingBothPlacement {
    /** Placement discriminator. */
    kind: SheetDrawingAnchorType.Both;
    /** Zero-based start cell and pixel offsets. */
    from: ICellOverGridPosition;
    /** Zero-based end cell and pixel offsets. */
    to: ICellOverGridPosition;
}

/**
 * Position and extent use the model Sheet grid coordinate system and do not
 * follow cells. This maps to OOXML `xdr:absoluteAnchor`.
 */
export interface ISheetDrawingNonePlacement {
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
    | ISheetDrawingPositionPlacement
    | ISheetDrawingBothPlacement
    | ISheetDrawingNonePlacement;

/**
 * Absolute Sheet grid bounds paired with the requested anchor behavior.
 * Commands normalize Position and Both bounds to cell markers.
 */
export type ISheetDrawingBoundsPlacement = IGroupBaseBound & {
    kind: SheetDrawingAnchorType.Position | SheetDrawingAnchorType.Both;
};

/**
 * Placement accepted by Sheet drawing write APIs.
 *
 * Marker placements are already normalized. Bounds placements are normalized
 * by the command with the model SpreadsheetSkeleton.
 */
export type ISheetDrawingPlacementInput = ISheetDrawingPlacement | ISheetDrawingBoundsPlacement;

export function getSheetDrawingPlacement(drawing: ISheetDrawingPlacementTarget): ISheetDrawingPlacement {
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

/**
 * Normalize an API placement input to the authoritative model representation.
 */
export function normalizeSheetDrawingPlacement(
    placement: ISheetDrawingPlacementInput,
    skeleton?: SpreadsheetSkeleton
): ISheetDrawingPlacement {
    if (placement.kind === SheetDrawingAnchorType.None) {
        validateBounds(placement);
        return placement;
    }
    if (!isSheetDrawingBoundsPlacement(placement)) {
        validatePlacement(placement);
        return placement;
    }

    validateBounds(placement);
    if (!skeleton) {
        throw new Error('SHEET_DRAWING_PLACEMENT_SKELETON_REQUIRED');
    }

    const { from, to } = transformToDrawingPosition(placement, skeleton);
    return placement.kind === SheetDrawingAnchorType.Position
        ? {
            kind: SheetDrawingAnchorType.Position,
            from,
            width: placement.width,
            height: placement.height,
        }
        : {
            kind: SheetDrawingAnchorType.Both,
            from,
            to,
        };
}

/**
 * Rebuild derived geometry from the authoritative fields of the current
 * placement contract.
 */
export function materializeSheetDrawingPlacement(
    drawing: ISheetDrawingPlacementTarget,
    skeleton: SpreadsheetSkeleton
): ISheetDrawingPlacementTarget {
    return applySheetDrawingPlacement(drawing, getSheetDrawingPlacement(drawing), skeleton);
}

export function applySheetDrawingPlacement(
    drawing: ISheetImage,
    placement: ISheetDrawingPlacement,
    skeleton?: SpreadsheetSkeleton
): ISheetImage;
export function applySheetDrawingPlacement(
    drawing: ISheetFloatDom,
    placement: ISheetDrawingPlacement,
    skeleton?: SpreadsheetSkeleton
): ISheetFloatDom;
export function applySheetDrawingPlacement(
    drawing: ISheetShape,
    placement: ISheetDrawingPlacement,
    skeleton?: SpreadsheetSkeleton
): ISheetShape;
export function applySheetDrawingPlacement(
    drawing: SheetDrawingPlacementMaterializationTarget,
    placement: ISheetDrawingPlacement,
    skeleton?: SpreadsheetSkeleton
): SheetDrawingPlacementMaterializationTarget {
    validatePlacement(placement);

    if (placement.kind === SheetDrawingAnchorType.None) {
        const transform = withExistingTransform(drawing.transform, placement);
        return {
            ...drawing,
            anchorType: SheetDrawingAnchorType.None,
            transform,
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

function isSheetDrawingBoundsPlacement(
    placement: ISheetDrawingPlacementInput
): placement is ISheetDrawingBoundsPlacement {
    return 'left' in placement;
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
