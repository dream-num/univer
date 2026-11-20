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
import { isDrawingAxisSwapped, transformToAxisAlignPosition, transformToDrawingPosition } from '../basics/transform-position';
import {
    SheetDrawingAnchorType,
} from './sheet-drawing.service';

/**
 * Anchor a drawing to one cell while keeping a fixed pixel extent.
 */
export interface ISheetDrawingOneCellPlacement {
    /** Placement discriminator. */
    kind: SheetDrawingAnchorType.Position;
    /** Start marker of the Excel-aligned rectangle, with zero-based cell coordinates. */
    from: ICellOverGridPosition;
    /** Fixed, unrotated drawing width in pixels. */
    width: number;
    /** Fixed, unrotated drawing height in pixels. */
    height: number;
}

/**
 * Anchor a drawing between two cell markers.
 */
export interface ISheetDrawingTwoCellPlacement {
    /** Placement discriminator. */
    kind: SheetDrawingAnchorType.Both;
    /** Start marker of the Excel-aligned rectangle, with zero-based cell coordinates. */
    from: ICellOverGridPosition;
    /** End marker of the Excel-aligned rectangle, with zero-based cell coordinates. */
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

export function getSheetDrawingPositionAnchorField(drawing: ISheetDrawing): 'axisAlignSheetTransform' | 'sheetTransform' {
    const axis = drawing.axisAlignSheetTransform;
    const from = axis?.from;
    if (!from || validateCellPosition(from)) return 'sheetTransform';
    // Old snapshots could retain a corrupt axis cache with an invalid
    // endpoint and a negative offset in the sheet interior (#5842).
    if (axis.to && validateCellPosition(axis.to)
        && ((from.row > 0 && from.rowOffset < 0) || (from.column > 0 && from.columnOffset < 0))) {
        return 'sheetTransform';
    }
    return 'axisAlignSheetTransform';
}

function getAxisAlignedDrawingPosition(drawing: ISheetDrawing, usesImportedMarkers = false): ISheetDrawingPosition | undefined {
    if (usesImportedMarkers) {
        return drawing.axisAlignSheetTransform ?? drawing.sheetTransform;
    }
    if (drawing.anchorType === SheetDrawingAnchorType.Both || getSheetDrawingPositionAnchorField(drawing) === 'axisAlignSheetTransform') {
        return drawing.axisAlignSheetTransform;
    }
}

/** Reconstruct the unrotated coordinates expected by legacy drawing APIs. */
export function getLegacySheetDrawingPosition(drawing: ISheetDrawing, skeleton: SpreadsheetSkeleton): ISheetDrawingPosition {
    const transform = getSheetDrawingTransformWithOrientation(drawing);
    const position = transformToDrawingPosition(transform, skeleton);
    const anchorType = drawing.anchorType ?? SheetDrawingAnchorType.Position;
    if (anchorType !== SheetDrawingAnchorType.None && !isDrawingAxisSwapped(transform.angle)) {
        const anchor = drawing.axisAlignSheetTransform;
        if (anchor?.from) position.from = { ...anchor.from };
        if (anchorType === SheetDrawingAnchorType.Both && anchor?.to) position.to = { ...anchor.to };
    }
    return position;
}

/** Convert old position and orientation fields at the drawing model boundary. */
export function normalizeSheetDrawing<T extends ISheetDrawing>(drawing: T, skeleton?: SpreadsheetSkeleton): T {
    const { sheetTransform, axisAlignSheetTransform, ...model } = drawing;
    const axisHasOrientation = axisAlignSheetTransform && Object.keys(axisAlignSheetTransform).some((key) => key !== 'from' && key !== 'to');
    if (!sheetTransform && !axisHasOrientation) return drawing;

    const transform = getSheetDrawingTransformWithOrientation(drawing);
    if (skeleton && !drawing.groupId && drawing.anchorType !== SheetDrawingAnchorType.None) {
        const result = tryRefreshSheetDrawingPlacement({ ...drawing, transform }, skeleton);
        if (!result.ok) return drawing;
        return {
            ...model,
            transform: result.drawing.transform,
            axisAlignSheetTransform: result.drawing.axisAlignSheetTransform,
        } as T;
    }

    const markers = axisAlignSheetTransform ?? sheetTransform;
    if (!markers || (!axisAlignSheetTransform && drawing.anchorType !== SheetDrawingAnchorType.None && !drawing.groupId)) {
        // The sheet may not have installed its layout yet.
        return { ...drawing, transform };
    }
    return { ...model, transform, axisAlignSheetTransform: { from: markers.from, to: markers.to } } as T;
}

export function getSheetDrawingPlacement(drawing: ISheetDrawing, skeleton?: SpreadsheetSkeleton): ISheetDrawingPlacement {
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

    const current = skeleton && !getAxisAlignedDrawingPosition(drawing) ? normalizeSheetDrawing(drawing, skeleton) : drawing;
    const position = getAxisAlignedDrawingPosition(current) ?? current.sheetTransform ?? current.axisAlignSheetTransform;
    if (anchorType === SheetDrawingAnchorType.Both) {
        return {
            kind: SheetDrawingAnchorType.Both,
            from: { ...position.from },
            to: { ...position.to },
        };
    }

    return {
        kind: SheetDrawingAnchorType.Position,
        from: { ...position.from },
        width: current.transform?.width ?? 0,
        height: current.transform?.height ?? 0,
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

    return resolveSheetDrawingPlacement(drawing, placement, skeleton, !('bounds' in input));
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
    if (anchorType === SheetDrawingAnchorType.Position) {
        return validateCellPosition(drawing[getSheetDrawingPositionAnchorField(drawing)]?.from)
            ?? validateExtent(drawing.transform?.width ?? 0, drawing.transform?.height ?? 0, requiresDrawingArea(drawing));
    }
    const markers = drawing.axisAlignSheetTransform ?? drawing.sheetTransform;
    return validateCellPosition(markers?.from) ?? validateCellPosition(markers?.to);
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

    const resolvesBoth = deriveFixedExtent || drawing.anchorType === SheetDrawingAnchorType.Both;
    const axisAnchor = getAxisAlignedDrawingPosition(drawing, resolvesBoth && isUnprojectedImage(drawing));
    const anchor = axisAnchor ?? drawing.sheetTransform!;
    const placement = resolvesBoth
        ? { kind: SheetDrawingAnchorType.Both as const, from: anchor.from, to: anchor.to }
        : {
            kind: SheetDrawingAnchorType.Position as const,
            from: anchor.from,
            width: drawing.transform?.width ?? 0,
            height: drawing.transform?.height ?? 0,
        };
    const resolved = resolveSheetDrawingPlacement(drawing, placement, skeleton, Boolean(axisAnchor));
    // A valid two-cell drawing can temporarily collapse when its cells are hidden.
    const extentFailure = validateExtent(resolved.transform?.width ?? 0, resolved.transform?.height ?? 0, requiresDrawingArea(drawing), !deriveFixedExtent);
    if (extentFailure) {
        return extentFailure;
    }
    return {
        ok: true,
        drawing: {
            ...drawing,
            sheetTransform: undefined,
            transform: resolved.transform,
            axisAlignSheetTransform: resolved.axisAlignSheetTransform,
        },
    };
}

function requiresDrawingArea(drawing: ISheetDrawing): boolean {
    return drawing.drawingType === DrawingTypeEnum.DRAWING_IMAGE || drawing.drawingType === DrawingTypeEnum.DRAWING_DOM;
}

// XLSX can store the initial rectangle solely as two markers, even with
// editAs="oneCell". An all-zero pixel cache identifies that form.
function isUnprojectedImage(drawing: ISheetDrawing): boolean {
    const { transform, drawingType } = drawing;
    return drawingType === DrawingTypeEnum.DRAWING_IMAGE
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
        const legacy = drawing.sheetTransform?.[key] ?? drawing.axisAlignSheetTransform?.[key];
        const legacySupplied = drawing.sheetTransform?.[key] !== undefined;
        if (legacy !== undefined && (legacySupplied ? legacy || transform[key] !== undefined : legacy && transform[key] === undefined)) {
            Object.assign(transform, { [key]: legacy });
        }
    }
    return transform;
}

function resolveSheetDrawingPlacement(
    drawing: ISheetDrawing,
    placement: ISheetDrawingPlacement,
    skeleton: SpreadsheetSkeleton | undefined,
    usesAxisMarkers: boolean
): ISheetDrawing {
    const existingTransform = getSheetDrawingTransformWithOrientation(drawing);
    const { sheetTransform: _legacy, ...model } = drawing;
    if (placement.kind === SheetDrawingAnchorType.None) {
        const transform = withExistingTransform(existingTransform, placement);
        return {
            ...model,
            anchorType: SheetDrawingAnchorType.None,
            transform,
            axisAlignSheetTransform: absoluteSheetTransform(placement),
        };
    }

    if (!skeleton) {
        throw new Error('SHEET_DRAWING_PLACEMENT_SKELETON_REQUIRED');
    }

    if (placement.kind === SheetDrawingAnchorType.Position) {
        const { width, height } = placement;
        const origin = projectCellMarker(placement.from, skeleton);
        // The Excel marker is the start of the major-axis rectangle. Recover
        // the unrotated origin without re-anchoring when the sheet layout changes.
        const swapped = isDrawingAxisSwapped(existingTransform.angle);
        if (usesAxisMarkers && swapped) {
            origin.left = precisionTo(origin.left + (height - width) / 2, 6);
            origin.top = precisionTo(origin.top + (width - height) / 2, 6);
        }
        const transform = withExistingTransform(existingTransform, {
            ...origin,
            width,
            height,
        });
        const axis = transformToAxisAlignPosition(transform, skeleton);
        return {
            ...model,
            anchorType: SheetDrawingAnchorType.Position,
            transform,
            axisAlignSheetTransform: {
                from: { ...(usesAxisMarkers || !swapped ? placement.from : axis.from) },
                to: axis.to,
            },
        };
    }

    // Excel's two-cell anchor follows the nearest major axis of a rotated
    // drawing. Refresh that rectangle, then recover the unrotated render box.
    const swapped = isDrawingAxisSwapped(existingTransform.angle);
    const from = projectCellMarker(placement.from, skeleton);
    const to = projectCellMarker(placement.to, skeleton);
    // Keep sub-pixel anchor precision. Rounding the axis box to tenths before
    // swapping its axes causes repeated refreshes to change the drawing size.
    const bounds = {
        left: from.left,
        top: from.top,
        width: precisionTo(to.left - from.left, 6),
        height: precisionTo(to.top - from.top, 6),
    };
    let transform = withExistingTransform(existingTransform, bounds);
    if (usesAxisMarkers && swapped) {
        transform = {
            ...transform,
            left: precisionTo(bounds.left + bounds.width / 2 - bounds.height / 2, 6),
            top: precisionTo(bounds.top + bounds.height / 2 - bounds.width / 2, 6),
            width: bounds.height,
            height: bounds.width,
        };
    }
    const markers = usesAxisMarkers || !swapped ? placement : transformToAxisAlignPosition(transform, skeleton);
    return {
        ...model,
        anchorType: SheetDrawingAnchorType.Both,
        transform,
        axisAlignSheetTransform: { from: { ...markers.from }, to: { ...markers.to } },
    };
}

function projectCellMarker(position: ICellOverGridPosition, skeleton: SpreadsheetSkeleton): { left: number; top: number } {
    const cell = skeleton.getNoMergeCellWithCoordByIndex(position.row, position.column);
    const { worksheet } = skeleton;
    // Position-to-marker conversion stores any off-grid extent in the final cell.
    const lastColumn = position.column === worksheet.getColumnCount() - 1;
    const lastRow = position.row === worksheet.getRowCount() - 1;
    return {
        left: precisionTo(cell.startX + projectCellOffset(position.columnOffset, cell.endX - cell.startX, lastColumn), 6),
        top: precisionTo(cell.startY + projectCellOffset(position.rowOffset, cell.endY - cell.startY, lastRow), 6),
    };
}

function projectCellOffset(offset: number, extent: number, isLastCell: boolean): number {
    if (extent === 0) {
        return 0;
    }
    return isLastCell ? offset : Math.min(offset, extent);
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

function absoluteSheetTransform(placement: ISheetDrawingAbsolutePlacement): ISheetDrawingPosition {
    return {
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
