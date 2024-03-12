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

import type { IKeyValue, Workbook, Worksheet } from '@univerjs/core';
import {
    getWorksheetUID,
    ICommandService,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
    RxDisposable,
} from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import type { ISetSpecificColsVisibleCommandParams, ISetSpecificRowsVisibleCommandParams } from '@univerjs/sheets';
import {
    SetColHiddenMutation,
    SetColVisibleMutation,
    SetRowHiddenMutation,
    SetRowVisibleMutation,
    SetSpecificColsVisibleCommand,
    SetSpecificRowsVisibleCommand,
} from '@univerjs/sheets';
import { Inject } from '@wendellhu/redi';
import { pairwise, startWith, takeUntil } from 'rxjs';

import { SHEET_COMPONENT_UNHIDE_LAYER_INDEX } from '../common/keys';
import { SheetSkeletonManagerService } from '../services/sheet-skeleton-manager.service';
import { HeaderUnhideShape, HeaderUnhideShapeType, UNHIDE_ICON_SIZE } from '../views/header-unhide-shape';
import { getCoordByCell, getSheetObject } from './utils/component-tools';

const HEADER_UNHIDE_CONTROLLER_SHAPE = '__SpreadsheetHeaderUnhideSHAPEControllerShape__';

const RENDER_COMMANDS: string[] = [
    SetRowHiddenMutation.id,
    SetRowVisibleMutation.id,
    SetColHiddenMutation.id,
    SetColVisibleMutation.id,
];

/**
 * This controller controls rendering of the buttons to unhide hidden rows and columns.
 */
@OnLifecycle(LifecycleStages.Rendered, HeaderUnhideController)
export class HeaderUnhideController extends RxDisposable {
    private _shapes = new Map<string, { cols: HeaderUnhideShape[]; rows: HeaderUnhideShape[] }>();

    // It should support several workbooks & worksheet.
    constructor(
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @ICommandService private readonly _cmdSrv: ICommandService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IRenderManagerService private readonly _rendererManagerService: IRenderManagerService
    ) {
        super();

        this._init();
    }

    override dispose(): void {
        super.dispose();
    }

    private _init(): void {
        const sheetObject = this._getSheetObject();
        if (!sheetObject) {
            return;
        }

        // Re-render when sheet skeleton changes.
        this._sheetSkeletonManagerService.currentSkeleton$
            .pipe(takeUntil(this.dispose$), startWith(undefined), pairwise())
            .subscribe(([lastSkeleton, skeleton]) => {
                if (skeleton) {
                    const workbook = this._univerInstanceService.getUniverSheetInstance(skeleton.unitId)!;
                    const worksheet = workbook.getSheetBySheetId(skeleton.sheetId)!;
                    this._updateWorksheet(workbook!, worksheet, lastSkeleton?.sheetId);
                }
            });

        // Re-render hidden rows / cols when specific commands are executed.
        this.disposeWithMe(
            this._cmdSrv.onCommandExecuted((command) => {
                if (
                    !RENDER_COMMANDS.includes(command.id) ||
                    !command.params ||
                    !(command.params as IKeyValue).unitId ||
                    !(command.params as IKeyValue).subUnitId
                ) {
                    return;
                }

                const workbook = this._univerInstanceService.getUniverSheetInstance(
                    (command.params as IKeyValue).unitId
                );
                const worksheet = workbook?.getSheetBySheetId((command.params as IKeyValue).subUnitId);
                if (worksheet) {
                    this._updateWorksheet(workbook!, worksheet, worksheet.getSheetId());
                }
            })
        );
    }

    /** Initialize header unhide render shapes for a specific worksheet.  */
    private _initForWorksheet(workbook: Workbook, worksheet: Worksheet): void {
        const skeleton = this._sheetSkeletonManagerService.getCurrent()?.skeleton;
        if (!skeleton) {
            return;
        }

        // steps to render the unhide button for the current worksheet
        // 1. and get hidden rows and columns
        const hiddenRowRanges = worksheet.getHiddenRows();
        const hiddenColRanges = worksheet.getHiddenCols();

        // First just let me render a unhide button of the column header!.
        const sheetObject = this._getSheetObject();
        if (!sheetObject) {
            return;
        }

        // NOTE: for performance consideration we should only get hidden rows & cols in the viewport
        // 2. create shapes and add them to the scene, the position should be calculated from SheetSkeleton
        const { scene } = sheetObject;
        const rowCount = worksheet.getRowCount();
        const rowShapes = hiddenRowRanges.map((range) => {
            const { startRow, endRow } = range;
            const position = getCoordByCell(startRow, 0, scene, skeleton);
            const hasPrevious = startRow !== 0;
            const hasNext = endRow !== rowCount - 1;
            return new HeaderUnhideShape(
                HEADER_UNHIDE_CONTROLLER_SHAPE,
                {
                    type: HeaderUnhideShapeType.ROW,
                    hovered: false,
                    hasPrevious,
                    hasNext,
                    top: position.startY - (hasPrevious ? UNHIDE_ICON_SIZE : 0),
                    left: position.startX - UNHIDE_ICON_SIZE,
                },
                () =>
                    this._cmdSrv.executeCommand<ISetSpecificRowsVisibleCommandParams>(
                        SetSpecificRowsVisibleCommand.id,
                        {
                            unitId: workbook.getUnitId(),
                            subUnitId: worksheet.getSheetId(),
                            ranges: [range],
                        }
                    )
            );
        });
        const colCount = worksheet.getColumnCount();
        const colShapes = hiddenColRanges.map((range) => {
            const { startColumn, endColumn } = range;
            const position = getCoordByCell(0, startColumn, scene, skeleton);
            const hasPrevious = startColumn !== 0;
            const hasNext = endColumn !== colCount - 1;
            return new HeaderUnhideShape(
                HEADER_UNHIDE_CONTROLLER_SHAPE,
                {
                    type: HeaderUnhideShapeType.COLUMN,
                    hovered: false,
                    hasPrevious,
                    hasNext,
                    left: position.startX - (hasPrevious ? UNHIDE_ICON_SIZE : 0),

                    top: 20 - UNHIDE_ICON_SIZE,
                },
                () =>
                    this._cmdSrv.executeCommand<ISetSpecificColsVisibleCommandParams>(
                        SetSpecificColsVisibleCommand.id,
                        {
                            unitId: workbook.getUnitId(),
                            subUnitId: worksheet.getSheetId(),
                            ranges: [range],
                        }
                    )
            );
        });

        scene.addObjects(colShapes, SHEET_COMPONENT_UNHIDE_LAYER_INDEX);
        scene.addObjects(rowShapes, SHEET_COMPONENT_UNHIDE_LAYER_INDEX);
        this._shapes.set(getWorksheetUID(workbook, worksheet), { cols: colShapes, rows: rowShapes });
    }

    private _updateWorksheet(workbook: Workbook, worksheet: Worksheet, lastWorksheetId?: string): void {
        if (lastWorksheetId) {
            const shapes = this._shapes.get(`${workbook.getUnitId()}|${lastWorksheetId}`);
            shapes?.cols.forEach((shape) => shape.dispose());
            shapes?.rows.forEach((shape) => shape.dispose());
        }

        this._initForWorksheet(workbook, worksheet);
    }

    private _getSheetObject() {
        return getSheetObject(this._univerInstanceService, this._rendererManagerService);
    }
}
