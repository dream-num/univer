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

import type { Workbook, Worksheet } from '@univerjs/core';
import type { IRenderContext } from '@univerjs/engine-render';
import type { ISetSpecificColsVisibleCommandParams, ISetSpecificRowsVisibleCommandParams } from '@univerjs/sheets';
import {
    ICommandService,
    Inject,
    RxDisposable,
} from '@univerjs/core';
import {
    SetSpecificColsVisibleCommand,
    SetSpecificRowsVisibleCommand,
} from '@univerjs/sheets';
import { takeUntil } from 'rxjs';

import { SHEET_COMPONENT_UNHIDE_LAYER_INDEX } from '../../common/keys';
import { SheetSkeletonManagerService } from '../../services/sheet-skeleton-manager.service';
import { HeaderUnhideShape, HeaderUnhideShapeType, UNHIDE_ICON_SIZE } from '../../views/header-unhide-shape';
import { getCoordByCell, getSheetObject } from '../utils/component-tools';

const HEADER_UNHIDE_CONTROLLER_SHAPE = '__SpreadsheetHeaderUnhideSHAPEControllerShape__';

/**
 * This controller controls rendering of the buttons to unhide hidden rows and columns.
 */
export class HeaderUnhideRenderController extends RxDisposable {
    private _shapes: { cols: HeaderUnhideShape[]; rows: HeaderUnhideShape[] } = { cols: [], rows: [] };
    private get _workbook(): Workbook { return this._context.unit; }

    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this._init();
    }

    override dispose(): void {
        super.dispose();

        this._clearShapes();
    }

    private _init(): void {
        let activeSheetId: string = '';

        this._context.unit.activeSheet$.pipe(takeUntil(this.dispose$)).subscribe((worksheet) => {
            this._clearShapes();

            if (!worksheet) {
                activeSheetId = '';
                return;
            };

            activeSheetId = worksheet.getSheetId();
            this._update(this._workbook, worksheet);
        });

        this.disposeWithMe(
            this._sheetSkeletonManagerService.currentSkeleton$.subscribe((param) => {
                if (param) {
                    const { unitId, sheetId } = param;
                    if (unitId === this._workbook.getUnitId() && sheetId === activeSheetId) {
                        const worksheet = this._workbook.getSheetBySheetId(sheetId);
                        if (worksheet) {
                            this._update(this._workbook, worksheet);
                        }
                    }
                }
            })
        );
    }

    private _update(workbook: Workbook, worksheet: Worksheet): void {
        const skeleton = this._sheetSkeletonManagerService.getSkeletonParam(worksheet.getSheetId())?.skeleton;
        if (!skeleton) return;

        // steps to render the unhide button for the current worksheet
        // 1. and get hidden rows and columns
        const hiddenRowRanges = worksheet.getHiddenRows();
        const hiddenColRanges = worksheet.getHiddenCols();

        // First just let me render a unhide button of the column header!.
        const sheetObject = this._getSheetObject();

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
                () => this._commandService.executeCommand<ISetSpecificRowsVisibleCommandParams>(
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
                    top: 20 - UNHIDE_ICON_SIZE,
                    left: position.startX - (hasPrevious ? UNHIDE_ICON_SIZE : 0),
                },
                () => this._commandService.executeCommand<ISetSpecificColsVisibleCommandParams>(
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

        // 3. clear the previous shapes and update the shapes
        this._clearShapes();
        this._shapes = { cols: colShapes, rows: rowShapes };
    }

    private _clearShapes(): void {
        this._shapes.cols.forEach((shape) => shape.dispose());
        this._shapes.rows.forEach((shape) => shape.dispose());
        this._shapes = { cols: [], rows: [] };
    }

    private _getSheetObject() {
        return getSheetObject(this._workbook, this._context)!;
    }
}
