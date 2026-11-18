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
import { DrawingTypeEnum } from '@univerjs/core';
import { getGroupState, getTransformBoundingBox, precisionTo } from '@univerjs/engine-render';
import { convertPositionSheetOverGridToAbsolute } from '@univerjs/sheets';
import type {
    ISheetDrawing,
    ISheetDrawingPosition,
    ISheetFloatDom,
    ISheetImage,
} from './sheet-drawing.service';
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

const PLACEMENT_ERROR = {
    CELL_INVALID: 'SHEET_DRAWING_PLACEMENT_CELL_INVALID',
    EXTENT_INVALID: 'SHEET_DRAWING_PLACEMENT_EXTENT_INVALID',
    KIND_INVALID: 'SHEET_DRAWING_PLACEMENT_KIND_INVALID',
    POSITION_INVALID: 'SHEET_DRAWING_PLACEMENT_POSITION_INVALID',
} as const;

interface ISheetDrawingPlacementFailure {
    ok: false;
    reason: typeof PLACEMENT_ERROR[keyof typeof PLACEMENT_ERROR];
    details?: Record<string, unknown>;
}

type SheetDrawingPlacementRefreshResult = { ok: true; drawing: ISheetDrawing } | ISheetDrawingPlacementFailure;

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
    const requiresArea = requiresDrawingArea(drawing);
    const placement = normalizePlacement(input, skeleton, requiresArea);

    return resolveSheetDrawingPlacement(drawing, placement, skeleton);
}

/** Place a batch at the logical start corner of a Chart Sheet, preserving its relative geometry. */
export function transformDrawingsToChartSheet(
    drawings: readonly ISheetDrawing[],
    chartSheetBounds: IGroupBaseBound,
    rightToLeft: boolean
): ISheetDrawing[] | null {
    if (validateBounds(chartSheetBounds, true)) {
        return null;
    }
    if (!drawings.length) {
        return [];
    }
    const bounds: IGroupBaseBound[] = [];
    for (const drawing of drawings) {
        const state = drawing.transform;
        if (!state || validateBounds(state as IGroupBaseBound, requiresDrawingArea(drawing))
            || [state.angle, state.skewX, state.skewY, state.scaleX, state.scaleY]
                .some((value) => value !== undefined && !Number.isFinite(value))) {
            return null;
        }
        bounds.push(getTransformBoundingBox(state));
    }
    const group = getGroupState(0, 0, bounds);
    const scale = Math.min(1, group.width ? chartSheetBounds.width / group.width : 1, group.height ? chartSheetBounds.height / group.height : 1);
    const left = rightToLeft ? chartSheetBounds.left + chartSheetBounds.width - group.width * scale : chartSheetBounds.left;
    return drawings.map((drawing) => applySheetDrawingPlacement(drawing, {
        kind: SheetDrawingAnchorType.None,
        left: left + (drawing.transform!.left! - group.left) * scale,
        top: chartSheetBounds.top + (drawing.transform!.top! - group.top) * scale,
        width: drawing.transform!.width! * scale,
        height: drawing.transform!.height! * scale,
    }));
}

/** Refresh layout-derived geometry without changing the drawing's anchor semantics. */
export function refreshSheetDrawingPlacement(drawing: ISheetDrawing, skeleton: SpreadsheetSkeleton): ISheetDrawing {
    const result = tryRefreshSheetDrawingPlacement(drawing, skeleton);
    if (!result.ok) {
        throw createPlacementError(result);
    }
    return result.drawing;
}

/** Validate authoritative markers; a one-cell endpoint can be rebuilt from its fixed extent. */
export function validateSheetDrawingPlacement(drawing: ISheetDrawing): ISheetDrawingPlacementFailure | undefined {
    if (!drawing || typeof drawing !== 'object') {
        return { ok: false, reason: PLACEMENT_ERROR.KIND_INVALID };
    }
    const anchorType = drawing.anchorType ?? SheetDrawingAnchorType.Position;
    if (anchorType === SheetDrawingAnchorType.None) {
        return;
    }
    if (anchorType !== SheetDrawingAnchorType.Position && anchorType !== SheetDrawingAnchorType.Both) {
        return { ok: false, reason: PLACEMENT_ERROR.KIND_INVALID };
    }
    const markerFailure = validateCellPosition(drawing.sheetTransform?.from)
        ?? (anchorType === SheetDrawingAnchorType.Both ? validateCellPosition(drawing.sheetTransform?.to) : undefined);
    if (markerFailure) {
        return markerFailure;
    }
    if (anchorType === SheetDrawingAnchorType.Both && drawing.axisAlignSheetTransform) {
        const axisFailure = validateCellPosition(drawing.axisAlignSheetTransform.from)
            ?? validateCellPosition(drawing.axisAlignSheetTransform.to);
        if (axisFailure) {
            return axisFailure;
        }
    }
    return validatePlacement(getSheetDrawingPlacement(drawing), requiresDrawingArea(drawing));
}

/** Expected snapshot errors are results; unexpected calculation failures are caught by the task owner. */
export function tryRefreshSheetDrawingPlacement(drawing: ISheetDrawing, skeleton: SpreadsheetSkeleton): SheetDrawingPlacementRefreshResult {
    const deriveFixedExtent = drawing && (drawing.anchorType ?? SheetDrawingAnchorType.Position) === SheetDrawingAnchorType.Position && isUnprojectedImage(drawing);
    const failure = validateSheetDrawingPlacement(deriveFixedExtent ? { ...drawing, anchorType: SheetDrawingAnchorType.Both } : drawing);
    if (failure) {
        return failure;
    }
    if (drawing.anchorType === SheetDrawingAnchorType.None) {
        return { ok: true, drawing };
    }

    const placement = deriveFixedExtent
        ? { kind: SheetDrawingAnchorType.Both as const, from: drawing.sheetTransform.from, to: drawing.sheetTransform.to }
        : getSheetDrawingPlacement(drawing);
    const resolved = resolveSheetDrawingPlacement(drawing, placement, skeleton, true);
    // A valid two-cell drawing can temporarily collapse when its cells are hidden.
    const extentFailure = validateExtent(resolved.transform?.width ?? 0, resolved.transform?.height ?? 0, requiresDrawingArea(drawing), !deriveFixedExtent);
    if (extentFailure) {
        return extentFailure;
    }
    return {
        ok: true,
        drawing: {
            ...drawing,
            sheetTransform: resolved.sheetTransform,
            transform: resolved.transform,
            axisAlignSheetTransform: resolved.axisAlignSheetTransform,
        },
    };
}

function requiresDrawingArea(drawing: ISheetDrawing): boolean {
    return drawing.drawingType === DrawingTypeEnum.DRAWING_IMAGE || drawing.drawingType === DrawingTypeEnum.DRAWING_DOM;
}

// XLSX can store the initial rectangle solely as two markers, even with
// editAs="oneCell". An all-zero pixel cache and no axis box identify that form.
function isUnprojectedImage(drawing: ISheetDrawing): boolean {
    const { transform, axisAlignSheetTransform, drawingType } = drawing;
    return drawingType === DrawingTypeEnum.DRAWING_IMAGE && !axisAlignSheetTransform
        && transform?.left === 0 && transform.top === 0 && transform.width === 0 && transform.height === 0;
}

/** Preserve cell orientation when an imported pixel cache is incomplete. */
export function getSheetDrawingTransformWithOrientation(drawing: ISheetDrawing): ITransformState {
    const transform: ITransformState = { ...drawing.transform };
    if (drawing.groupId) {
        return transform;
    }
    for (const key of ['angle', 'flipX', 'flipY', 'skewX', 'skewY'] as const) {
        if (drawing.anchorType === SheetDrawingAnchorType.None && transform[key] !== undefined) {
            continue;
        }
        if (drawing.sheetTransform?.[key] !== undefined && (drawing.sheetTransform[key] || transform[key] !== undefined)) {
            Object.assign(transform, { [key]: drawing.sheetTransform[key] });
        }
    }
    return transform;
}

function resolveSheetDrawingPlacement(
    drawing: ISheetDrawing,
    placement: ISheetDrawingPlacement,
    skeleton?: SpreadsheetSkeleton,
    refresh = false
): ISheetDrawing {
    // Cell-anchored drawings keep orientation on the cell transform. Imported
    // pixel caches may omit it or still contain a default zero rotation.
    const existingTransform = getSheetDrawingTransformWithOrientation(drawing);
    if (placement.kind === SheetDrawingAnchorType.None) {
        const transform = withExistingTransform(existingTransform, placement);
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
        const transform = withExistingTransform(existingTransform, {
            ...projectCellMarker(placement.from, skeleton),
            width: placement.width,
            height: placement.height,
        });
        const sheetTransform = withExistingSheetTransform(drawing.sheetTransform, {
            from: placement.from,
            to: transformToDrawingPosition(transform, skeleton).to,
        });
        return {
            ...drawing,
            anchorType: SheetDrawingAnchorType.Position,
            sheetTransform,
            transform,
            axisAlignSheetTransform: withExistingSheetTransform(
                drawing.axisAlignSheetTransform,
                transformToAxisAlignPosition(transform, skeleton)
            ),
        };
    }

    let sheetTransform = withExistingSheetTransform(drawing.sheetTransform, {
        from: placement.from,
        to: placement.to,
    });
    // Excel's two-cell anchor follows the nearest major axis of a rotated
    // drawing. Refresh that rectangle, then recover the unrotated render box.
    const axisAnchor = refresh
        ? drawing.axisAlignSheetTransform ?? (isUnprojectedImage(drawing) ? drawing.sheetTransform : undefined)
        : undefined;
    const from = projectCellMarker(axisAnchor?.from ?? placement.from, skeleton);
    const to = projectCellMarker(axisAnchor?.to ?? placement.to, skeleton);
    // Keep sub-pixel anchor precision. Rounding the axis box to tenths before
    // swapping its axes causes repeated refreshes to change the drawing size.
    const bounds = {
        left: from.left,
        top: from.top,
        width: precisionTo(to.left - from.left, 6),
        height: precisionTo(to.top - from.top, 6),
    };
    let transform = withExistingTransform(existingTransform, bounds);
    if (axisAnchor) {
        const angle = ((existingTransform.angle ?? 0) % 360 + 360) % 360;
        if ((angle >= 45 && angle < 135) || (angle >= 225 && angle < 315)) {
            transform = {
                ...transform,
                left: precisionTo(bounds.left + bounds.width / 2 - bounds.height / 2, 6),
                top: precisionTo(bounds.top + bounds.height / 2 - bounds.width / 2, 6),
                width: bounds.height,
                height: bounds.width,
            };
            const current = drawing.transform;
            if (current?.left !== transform.left || current?.top !== transform.top || current?.width !== transform.width || current?.height !== transform.height) {
                // Refresh only derived markers. Adding default flip/skew keys
                // here collides with concurrent JSON1 inserts of those keys.
                sheetTransform = withExistingSheetTransform(drawing.sheetTransform, transformToDrawingPosition(transform, skeleton));
            }
        }
    }
    return {
        ...drawing,
        anchorType: SheetDrawingAnchorType.Both,
        sheetTransform,
        transform,
        axisAlignSheetTransform: axisAnchor ?? withExistingSheetTransform(
            drawing.axisAlignSheetTransform,
            transformToAxisAlignPosition(transform, skeleton)
        ),
    };
}

function projectCellMarker(position: ICellOverGridPosition, skeleton: SpreadsheetSkeleton): { left: number; top: number } {
    const cell = skeleton.getNoMergeCellWithCoordByIndex(position.row, position.column);
    return {
        left: precisionTo(cell.startX + (cell.startX === cell.endX ? 0 : Math.min(position.columnOffset, cell.endX - cell.startX)), 6),
        top: precisionTo(cell.startY + (cell.startY === cell.endY ? 0 : Math.min(position.rowOffset, cell.endY - cell.startY)), 6),
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
    return normalizePlacement(input, skeleton, false);
}

function normalizePlacement(
    input: ISheetDrawingPlacementInput,
    skeleton: SpreadsheetSkeleton | undefined,
    requiresArea: boolean
): ISheetDrawingPlacement {
    if (!('bounds' in input)) {
        assertValidPlacement(validatePlacement(input, requiresArea));
        if (input.kind === SheetDrawingAnchorType.Both && skeleton) {
            assertValidPlacement(validateBounds(convertPositionSheetOverGridToAbsolute(
                skeleton.worksheet.getUnitId(),
                skeleton.worksheet.getSheetId(),
                {
                    from: input.from,
                    to: input.to,
                },
                skeleton
            ), requiresArea));
        }
        return input;
    }

    assertValidPlacement(validateBounds(input.bounds, requiresArea));
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

    throw new Error(PLACEMENT_ERROR.KIND_INVALID);
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

function validatePlacement(placement: ISheetDrawingPlacement, requiresArea: boolean): ISheetDrawingPlacementFailure | undefined {
    if (placement.kind === SheetDrawingAnchorType.Position) {
        return validateCellPosition(placement.from) ?? validateExtent(placement.width, placement.height, requiresArea);
    }

    if (placement.kind === SheetDrawingAnchorType.Both) {
        return validateCellPosition(placement.from) ?? validateCellPosition(placement.to);
    }

    if (placement.kind === SheetDrawingAnchorType.None) {
        if (!Number.isFinite(placement.left) || !Number.isFinite(placement.top)) {
            return { ok: false, reason: PLACEMENT_ERROR.POSITION_INVALID };
        }
        return validateExtent(placement.width, placement.height, requiresArea);
    }

    return { ok: false, reason: PLACEMENT_ERROR.KIND_INVALID };
}

function validateBounds(bounds: IGroupBaseBound, requiresArea: boolean): ISheetDrawingPlacementFailure | undefined {
    if (!bounds || !Number.isFinite(bounds.left) || !Number.isFinite(bounds.top)) {
        return { ok: false, reason: PLACEMENT_ERROR.POSITION_INVALID };
    }
    return validateExtent(bounds.width, bounds.height, requiresArea);
}

function validateCellPosition(position: ICellOverGridPosition | undefined): ISheetDrawingPlacementFailure | undefined {
    if (
        !position ||
        !Number.isInteger(position.row) ||
        !Number.isInteger(position.column) ||
        position.row < 0 ||
        position.column < 0 ||
        !Number.isFinite(position.rowOffset) ||
        !Number.isFinite(position.columnOffset)
    ) {
        return { ok: false, reason: PLACEMENT_ERROR.CELL_INVALID };
    }
}

function validateExtent(width: number, height: number, requiresArea: boolean, allowCollapsed = false): ISheetDrawingPlacementFailure | undefined {
    // Horizontal and vertical lines have a zero bounding-box extent on one axis;
    // this is independent of stroke width. Images and floating DOM still require area.
    const hasInvalidZeroExtent = !allowCollapsed && (requiresArea ? width === 0 || height === 0 : width === 0 && height === 0);
    if (!Number.isFinite(width) || !Number.isFinite(height) || width < 0 || height < 0 || hasInvalidZeroExtent) {
        return { ok: false, reason: PLACEMENT_ERROR.EXTENT_INVALID, details: { width, height } };
    }
}

function assertValidPlacement(failure: ISheetDrawingPlacementFailure | undefined): void {
    if (failure) {
        throw createPlacementError(failure);
    }
}

function createPlacementError(failure: ISheetDrawingPlacementFailure): Error {
    const error = failure.reason === PLACEMENT_ERROR.POSITION_INVALID ? new TypeError(failure.reason) : new Error(failure.reason);
    return Object.assign(error, failure.details);
}
