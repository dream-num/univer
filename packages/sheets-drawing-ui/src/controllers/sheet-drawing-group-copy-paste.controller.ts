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

import type { IDrawingGroupNestedParam, IMutationInfo, Nullable } from '@univerjs/core';
import type { IDrawingJsonUndo1 } from '@univerjs/drawing';
import type { ISheetDrawing } from '@univerjs/sheets-drawing';
import type { IPasteHookValueType, ISheetDiscreteRangeLocation } from '@univerjs/sheets-ui';
import { Disposable, DrawingTypeEnum, Inject } from '@univerjs/core';
import { IDrawingManagerService } from '@univerjs/drawing';
import { IRenderManagerService } from '@univerjs/engine-render';
import { attachRangeWithCoord, discreteRangeToRange, SheetSkeletonService } from '@univerjs/sheets';
import { DrawingApplyType, ISheetDrawingService, SetDrawingApplyMutation, transformToAxisAlignPosition, transformToDrawingPosition } from '@univerjs/sheets-drawing';
import { ISheetClipboardService, PREDEFINED_HOOK_NAME_PASTE } from '@univerjs/sheets-ui';
import { cloneGroupParams } from '../commands/commands/utils';

export interface IGroupFeaturePasteHookParams {
    /** Unit ID of the copy source */
    fromUnitId: string;
    /** Sub-unit ID of the copy source */
    fromSubUnitId: string;
    /** Unit ID of the paste destination */
    toUnitId: string;
    /** Sub-unit ID of the paste destination */
    toSubUnitId: string;
    /** Maps original drawingId → new (cloned) drawingId */
    idMap: Map<string, string>;
    /** The fully cloned group param with remapped IDs */
    cloned: IDrawingGroupNestedParam;
}

export type GroupFeaturePasteHook = (params: IGroupFeaturePasteHookParams) => { redos: IMutationInfo[]; undos: IMutationInfo[] };

const specialPastes: IPasteHookValueType[] = [
    PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_COL_WIDTH,
    PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_VALUE,
    PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_FORMAT,
    PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_FORMULA,
];

export class SheetsDrawingGroupCopyPasteController extends Disposable {
    private readonly _featurePasteHooks: GroupFeaturePasteHook[] = [];

    private _copyInfo: Nullable<{
        unitId: string;
        subUnitId: string;
        groupNestedParam: IDrawingGroupNestedParam;
    }>;

    constructor(
        @ISheetClipboardService private readonly _sheetClipboardService: ISheetClipboardService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(SheetSkeletonService) private readonly _sheetSkeletonService: SheetSkeletonService,
        @ISheetDrawingService private readonly _sheetDrawingService: ISheetDrawingService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService
    ) {
        super();
        this._initCopyPaste();
    }

    private get _focusedDrawings() {
        return this._sheetDrawingService.getFocusDrawings() as ISheetDrawing[];
    }

    private _initCopyPaste() {
        this._sheetClipboardService.addClipboardHook({
            id: 'SHEET_DRAWING_GROUP',

            onBeforeCopy: (_unitId, _subUnitId) => {
                this._copyInfo = null;

                const focusDrawings = this._focusedDrawings;
                if (focusDrawings.length === 0) return;

                // Only handle the first focused group drawing.
                const groupDrawing = focusDrawings.find((d) => d.drawingType === DrawingTypeEnum.DRAWING_GROUP);
                if (!groupDrawing) return;

                const groupNestedParam = this._drawingManagerService.getDrawingsByGroupNested({
                    unitId: groupDrawing.unitId,
                    subUnitId: groupDrawing.subUnitId,
                    drawingId: groupDrawing.drawingId,
                });
                if (!groupNestedParam) return;

                this._copyInfo = {
                    unitId: groupDrawing.unitId,
                    subUnitId: groupDrawing.subUnitId,
                    groupNestedParam,
                };
            },

            onPasteCells: (_pasteFrom, pasteTo, _data, payload) => {
                if (!this._copyInfo) return { redos: [], undos: [] };

                const { pasteType } = payload;
                if (specialPastes.includes(pasteType)) return { redos: [], undos: [] };

                return this._generateGroupPasteMutations(pasteTo);
            },

            onPasteUnrecognized: (pasteTo) => {
                if (!this._copyInfo) return { redos: [], undos: [] };
                return this._generateGroupPasteMutations(pasteTo);
            },
        });
    }

    public registerFeaturePasteHook(hook: GroupFeaturePasteHook): void {
        this._featurePasteHooks.push(hook);
    }

    private _getGroupFeaturePasteMutations(params: IGroupFeaturePasteHookParams): { redos: IMutationInfo[]; undos: IMutationInfo[] } {
        const redos: IMutationInfo[] = [];
        const undos: IMutationInfo[] = [];
        for (const hook of this._featurePasteHooks) {
            const result = hook(params);
            redos.push(...result.redos);
            undos.push(...result.undos);
        }
        return { redos, undos };
    }

    private _generateGroupPasteMutations(pasteTo: ISheetDiscreteRangeLocation): { redos: IMutationInfo[]; undos: IMutationInfo[] } {
        if (!this._copyInfo) {
            return { redos: [], undos: [] };
        }

        const { unitId, subUnitId, range } = pasteTo;
        const pasteToSkeleton = this._sheetSkeletonService.getSkeleton(unitId, subUnitId);
        if (!pasteToSkeleton) {
            return { redos: [], undos: [] };
        }

        const { groupNestedParam } = this._copyInfo;
        // Root group is the last element of the post-order groups array.
        const origRootGroup = groupNestedParam.groups[groupNestedParam.groups.length - 1] as ISheetDrawing;

        // Clone all drawing IDs.
        const { cloned, idMap } = cloneGroupParams(groupNestedParam);
        const newRootGroupId = cloned.groups[cloned.groups.length - 1].drawingId;

        // Resolve the paste destination rectangle.
        const pasteRange = discreteRangeToRange(range);
        const pasteRect = attachRangeWithCoord(pasteToSkeleton, {
            startRow: pasteRange.startRow,
            endRow: pasteRange.endRow,
            startColumn: pasteRange.startColumn,
            endColumn: pasteRange.endColumn,
        });
        if (!pasteRect) return { redos: [], undos: [] };

        // Only the root group's absolute position changes; all other drawings keep their
        // group-relative transforms as-is.
        const newTransform = { ...(origRootGroup.transform), left: pasteRect.startX, top: pasteRect.startY };

        const allDrawings: ISheetDrawing[] = [
            ...(cloned.flatChildren ?? []).map((d) => ({ ...d, unitId, subUnitId } as ISheetDrawing)),
            ...cloned.groups.map((d) => {
                if (d.drawingId !== newRootGroupId) {
                    return { ...d, unitId, subUnitId } as ISheetDrawing;
                }
                return {
                    ...d,
                    unitId,
                    subUnitId,
                    transform: newTransform,
                    sheetTransform: transformToDrawingPosition(newTransform, pasteToSkeleton) ?? origRootGroup.sheetTransform,
                    axisAlignSheetTransform: transformToAxisAlignPosition(newTransform, pasteToSkeleton) ?? origRootGroup.sheetTransform,
                } as ISheetDrawing;
            }),
        ];

        // A single batch INSERT is sufficient: the shape rendering layer calls insertGroupObject()
        // for each shape's groupId, which automatically reconstructs the full group hierarchy in
        // the scene from the data that was just written by applyJson1.
        const { undo: removeOp, redo: insertOp, objects } = this._sheetDrawingService.getBatchAddOp(allDrawings) as IDrawingJsonUndo1;

        const redos: IMutationInfo[] = [{
            id: SetDrawingApplyMutation.id,
            params: { op: insertOp, unitId, subUnitId, objects, type: DrawingApplyType.INSERT },
        }];

        const undos: IMutationInfo[] = [{
            id: SetDrawingApplyMutation.id,
            params: { op: removeOp, unitId, subUnitId, objects, type: DrawingApplyType.REMOVE },
        }];

        const featureMutations = this._getGroupFeaturePasteMutations({
            fromUnitId: this._copyInfo.unitId,
            fromSubUnitId: this._copyInfo.subUnitId,
            toUnitId: unitId,
            toSubUnitId: subUnitId,
            idMap,
            cloned,
        });
        redos.push(...featureMutations.redos);
        undos.push(...featureMutations.undos);

        return { redos, undos };
    }

    override dispose(): void {
        this._copyInfo = null;
        this._featurePasteHooks.length = 0;
        super.dispose();
    }
}
