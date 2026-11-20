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

import type { IAccessor, IDrawingSearch, IExecutionOptions, IMutation } from '@univerjs/core';
import type { IDrawingGroupUpdateParam, IDrawingJson1Type, IDrawingOrderMapParam } from '@univerjs/drawing';
import { CommandType, ILogService, JSON1, Quantity } from '@univerjs/core';
import { IDrawingManagerService } from '@univerjs/drawing';
import { SheetSkeletonService } from '@univerjs/sheets';
import type { ISheetDrawing } from '../../services/sheet-drawing.service';
import { transformSheetDrawingReference } from '../../basics/drawing-reference';
import {
    getLegacySheetDrawingPosition,
    normalizeSheetDrawing,
    tryRefreshSheetDrawingPlacement,
    validateSheetDrawingPlacement,
} from '../../services/sheet-drawing-placement';
import { ISheetDrawingService, SheetDrawingAnchorType } from '../../services/sheet-drawing.service';

export enum DrawingApplyType {
    INSERT,
    REMOVE,
    UPDATE,
    ARRANGE,
    GROUP,
    UNGROUP,
}

export interface ISetDrawingApplyMutationParams extends IDrawingJson1Type {
    type: DrawingApplyType;
    /** Structural intent for rebasing cell anchors, independent of cached pixels. */
    reference?: {
        axis: 'row' | 'column';
        action: 'insert' | 'remove';
        start: number;
        end: number;
        limit: number;
        boundaryOffset: number;
        /** Imported changesets from clients that only sent the unrotated start marker. */
        legacyPositionDrawingIds?: string[];
    };
    /** Reproject a rebased history mutation before notifying render consumers. */
    recalculate?: boolean;
}

function needsPlacementHydration(drawing: ISheetDrawing): boolean {
    const oneCell = (drawing.anchorType ?? SheetDrawingAnchorType.Position) === SheetDrawingAnchorType.Position;
    return Boolean(drawing.sheetTransform)
        || (!drawing.transform?.width && !drawing.transform?.height)
        || (oneCell && Boolean(validateSheetDrawingPlacement({ ...drawing, anchorType: SheetDrawingAnchorType.Both })));
}

/** Supply the old JSON1 path only while applying a legacy operation. */
function adaptLegacyDrawingUpdate(accessor: IAccessor, params: ISetDrawingApplyMutationParams) {
    const { unitId, subUnitId, op } = params;
    const cursor = JSON1.type.readCursor(op);
    const legacy = new Map<string, boolean>();
    const authoredAxis = new Set<string>();
    cursor.traverse(null, (component) => {
        const [unit, sheet, root, id, field] = cursor.getPath();
        if (unit !== unitId || sheet !== subUnitId || root !== 'data' || typeof id !== 'string') return;
        if (field === 'axisAlignSheetTransform') authoredAxis.add(id);
        if (field === 'sheetTransform') {
            legacy.set(id, cursor.getPath().length > 5 || component.r !== undefined);
        }
    });

    const legacyPositionDrawings = new Set(params.reference?.legacyPositionDrawingIds);
    if (!legacy.size) return { op, legacyPositionDrawings };
    const service = accessor.get(ISheetDrawingService);
    const skeleton = accessor.get(SheetSkeletonService, Quantity.OPTIONAL)?.ensureSkeleton(unitId, subUnitId);
    let initial: JSON1.JSONOp = null;
    for (const [drawingId, needsExistingValue] of legacy) {
        if (!authoredAxis.has(drawingId)) legacyPositionDrawings.add(drawingId);
        const drawing = service.getDrawingByParam({ unitId, subUnitId, drawingId });
        if (drawing && skeleton && needsExistingValue && !drawing.sheetTransform) {
            initial = JSON1.type.compose(initial, JSON1.insertOp(
                [unitId, subUnitId, 'data', drawingId, 'sheetTransform'],
                getLegacySheetDrawingPosition(drawing, skeleton) as unknown as JSON1.Doc
            ));
        }
    }
    return { op: initial ? JSON1.type.compose(initial, op) : op, legacyPositionDrawings };
}

function refreshReceivedDrawings(
    accessor: IAccessor,
    params: ISetDrawingApplyMutationParams,
    hydrateOnly: boolean,
    legacyPositionDrawings: ReadonlySet<string>
): void {
    if (params.type === DrawingApplyType.REMOVE || params.type === DrawingApplyType.ARRANGE || !Array.isArray(params.objects) || !params.objects.length) {
        return;
    }
    const skeleton = accessor.get(SheetSkeletonService, Quantity.OPTIONAL)?.ensureSkeleton(params.unitId, params.subUnitId);
    if (!skeleton) {
        return;
    }
    const dimensionsChanged = skeleton.rowHeightAccumulation.length !== skeleton.worksheet.getRowCount()
        || skeleton.columnWidthAccumulation.length !== skeleton.worksheet.getColumnCount();
    // The originating command already calculated layout. Received structural
    // edits and history still need fresh dimensions before projecting anchors.
    if (params.recalculate || (params.reference && dimensionsChanged)) skeleton.makeDirty(true);
    skeleton.calculate();
    const service = accessor.get(ISheetDrawingService);
    const drawings = [];
    const objects = params.type === DrawingApplyType.GROUP || params.type === DrawingApplyType.UNGROUP
        ? (params.objects as IDrawingGroupUpdateParam[]).flatMap(({ parent, children }) => [parent, ...children])
        : params.objects as IDrawingSearch[];
    for (const object of objects) {
        const drawing = service.getDrawingByParam(object);
        if (!drawing) {
            continue;
        }
        if (hydrateOnly && !needsPlacementHydration(drawing)) {
            continue;
        }
        try {
            if (drawing.groupId || drawing.anchorType === SheetDrawingAnchorType.None) {
                const normalized = normalizeSheetDrawing(drawing);
                if (normalized !== drawing) drawings.push({ ...normalized, sheetTransform: undefined });
                continue;
            }
            let placementSource = drawing;
            if (drawing.sheetTransform && legacyPositionDrawings.has(drawing.drawingId)) {
                // Replaying the original insert may have already filled the
                // axis cache. The rebased operation only moved the legacy start.
                placementSource = { ...drawing };
                Reflect.deleteProperty(placementSource, 'axisAlignSheetTransform');
            }
            const result = tryRefreshSheetDrawingPlacement(placementSource, skeleton);
            if (result.ok) {
                drawings.push(result.drawing);
            } else {
                accessor.get(ILogService).warn('[SetDrawingApplyMutation]', 'Skipping invalid drawing placement', object, result);
            }
        } catch (error) {
            accessor.get(ILogService).error('[SetDrawingApplyMutation]', 'Drawing placement refresh failed', object, error);
        }
    }
    if (drawings.length) {
        // Apply the projection to both stores before either notifies consumers.
        // This local cache update is not another collaborative mutation.
        service.refreshTransform(drawings, false);
        accessor.get(IDrawingManagerService).refreshTransform(drawings, false);
    }
}

export const SetDrawingApplyMutation: IMutation<ISetDrawingApplyMutationParams> = {
    id: 'sheet.mutation.set-drawing-apply',
    type: CommandType.MUTATION,
    handler: (accessor, params, options?: IExecutionOptions) => {
        const drawingManagerService = accessor.get(IDrawingManagerService);
        const sheetDrawingService = accessor.get(ISheetDrawingService);

        const { unitId, subUnitId, type, objects } = params;

        if (params.reference !== undefined) {
            const { legacyPositionDrawingIds } = params.reference;
            if (legacyPositionDrawingIds !== undefined
                && (!Array.isArray(legacyPositionDrawingIds) || legacyPositionDrawingIds.some((id) => typeof id !== 'string'))) {
                throw new Error('Invalid drawing reference change.');
            }
            transformSheetDrawingReference({ row: 0, column: 0, rowOffset: 0, columnOffset: 0 }, params.reference);
        }
        if (params.recalculate !== undefined && typeof params.recalculate !== 'boolean') {
            throw new Error('Invalid drawing reference change.');
        }

        const adapted = adaptLegacyDrawingUpdate(accessor, params);
        drawingManagerService.applyJson1(unitId, subUnitId, adapted.op);
        sheetDrawingService.applyJson1(unitId, subUnitId, adapted.op);

        const importedOrientation = type === DrawingApplyType.INSERT && (objects as IDrawingSearch[]).some((object) => {
            const drawing = sheetDrawingService.getDrawingByParam(object);
            return drawing && needsPlacementHydration(drawing);
        });
        const received = Boolean(options?.fromCollab || options?.fromChangeset || params.reference || params.recalculate);
        if (received || importedOrientation) {
            refreshReceivedDrawings(accessor, params, !received, adapted.legacyPositionDrawings);
        }

        switch (type) {
            case DrawingApplyType.INSERT:
                drawingManagerService.addNotification(objects as IDrawingSearch[]);
                sheetDrawingService.addNotification(objects as IDrawingSearch[]);
                break;
            case DrawingApplyType.REMOVE:
                drawingManagerService.removeNotification(objects as IDrawingSearch[]);
                sheetDrawingService.removeNotification(objects as IDrawingSearch[]);
                break;
            case DrawingApplyType.UPDATE:
                drawingManagerService.updateNotification(objects as IDrawingSearch[]);
                sheetDrawingService.updateNotification(objects as IDrawingSearch[]);
                break;
            case DrawingApplyType.ARRANGE:
                drawingManagerService.orderNotification(objects as IDrawingOrderMapParam);
                sheetDrawingService.orderNotification(objects as IDrawingOrderMapParam);
                break;
            case DrawingApplyType.GROUP:
                drawingManagerService.groupUpdateNotification(objects as IDrawingGroupUpdateParam[]);
                sheetDrawingService.groupUpdateNotification(objects as IDrawingGroupUpdateParam[]);
                break;
            case DrawingApplyType.UNGROUP:
                drawingManagerService.ungroupUpdateNotification(objects as IDrawingGroupUpdateParam[]);
                sheetDrawingService.ungroupUpdateNotification(objects as IDrawingGroupUpdateParam[]);
                break;
        }

        return true;
    },
};
