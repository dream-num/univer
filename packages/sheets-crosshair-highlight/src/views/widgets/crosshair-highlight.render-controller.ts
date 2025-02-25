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

import type { IRange, Nullable, Workbook, Worksheet } from '@univerjs/core';
import type { IRenderContext, IRenderModule, Scene, SpreadsheetSkeleton } from '@univerjs/engine-render';

import type { ISelectionWithStyle } from '@univerjs/sheets';
import { ColorKit, Disposable, IContextService, Inject, RANGE_TYPE } from '@univerjs/core';
import { IRefSelectionsService, REF_SELECTIONS_ENABLED, SheetsSelectionsService } from '@univerjs/sheets';
import { getCoordByCell, SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { combineLatest, map, merge, startWith, tap } from 'rxjs';
import { SHEETS_CROSSHAIR_HIGHLIGHT_Z_INDEX } from '../../const';
import { SheetsCrosshairHighlightService } from '../../services/crosshair.service';
import { CrossHairRangeCollection } from '../../util';
import { SheetCrossHairHighlightShape } from './crosshair-highlight-shape';

export class SheetCrosshairHighlightRenderController extends Disposable implements IRenderModule {
    private _shapes: SheetCrossHairHighlightShape[] = [];
    private _rangeCollection = new CrossHairRangeCollection();
    private _color: string = 'rgba(255,0,0,0.5)';

    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @Inject(SheetsSelectionsService) private readonly _sheetsSelectionsService: SheetsSelectionsService,
        @Inject(SheetsCrosshairHighlightService) private readonly _sheetsCrosshairHighlightService: SheetsCrosshairHighlightService,
        @Inject(IContextService) private readonly _contextService: IContextService,
        @IRefSelectionsService private readonly _refSelectionsService: SheetsSelectionsService
    ) {
        super();

        this._initRenderListener();
    }

    private _transformSelection(selectionData: Readonly<Nullable<ISelectionWithStyle[]>>, sheet: Worksheet): void {
        if (!selectionData) {
            return;
        }
        const rowCount = sheet.getRowCount();
        const columnCount = sheet.getColumnCount();
        const ranges = [];
        // remove the selection that covers the whole row or column
        for (const selection of selectionData) {
            const { startRow, endRow, startColumn, endColumn } = selection.range;
            if (endRow - startRow + 1 === rowCount || endColumn - startColumn + 1 === columnCount) {
                continue;
            }
            ranges.push(selection.range);
        }

        this._rangeCollection.setSelectedRanges(ranges);
        for (const range of ranges) {
            this.addSelection(range, sheet);
        }
    }

    private _initRenderListener(): void {
        const workbook = this._context.unit;

        this.disposeWithMe(combineLatest([
            this._contextService.subscribeContextValue$(REF_SELECTIONS_ENABLED).pipe(startWith(false)),
            this._sheetSkeletonManagerService.currentSkeleton$,
            this._sheetsCrosshairHighlightService.enabled$,
            this._sheetsCrosshairHighlightService.color$.pipe(tap((color) => (this._color = color))),

            merge(
                this._sheetsSelectionsService.selectionMoveStart$,
                this._sheetsSelectionsService.selectionMoving$,
                this._sheetsSelectionsService.selectionMoveEnd$,
                this._sheetsSelectionsService.selectionSet$,
                workbook.activeSheet$.pipe(map(() => this._sheetsSelectionsService.getCurrentSelections()))
            ),
            merge(
                this._refSelectionsService.selectionMoveStart$,
                this._refSelectionsService.selectionMoving$,
                this._refSelectionsService.selectionMoveEnd$,
                this._sheetsSelectionsService.selectionSet$,
                workbook.activeSheet$.pipe(map(() => this._refSelectionsService.getCurrentSelections()))
            ),
        ]).subscribe(([refSelectionEnabled, _, enabled, _color, normalSelections, refSelection]) => {
            this._clear();

            if (!enabled) return;
            const selections = refSelectionEnabled ? refSelection : normalSelections;

            this._rangeCollection.reset();
            this._transformSelection(selections, workbook.getActiveSheet());
            this.render(this._rangeCollection.getRanges());
        }));
    }

    addSelection(range: IRange, sheet: Worksheet): void {
        if (range.rangeType === RANGE_TYPE.COLUMN || range.rangeType === RANGE_TYPE.ROW || range.rangeType === RANGE_TYPE.ALL) {
            return;
        }
        const maxRow = sheet.getRowCount();
        const maxColumn = sheet.getColumnCount();
        const { startRow, endRow, startColumn, endColumn } = range;
        const left = {
            startRow,
            endRow,
            startColumn: 0,
            endColumn: startColumn - 1,
        };
        const right = {
            startRow,
            endRow,
            startColumn: endColumn + 1,
            endColumn: maxColumn,
        };
        const top = {
            startRow: 0,
            endRow: startRow - 1,
            startColumn,
            endColumn,
        };
        const bottom = {
            startRow: endRow + 1,
            endRow: maxRow,
            startColumn,
            endColumn,
        };

        for (const range of [left, right, top, bottom]) {
            // test if the range is valid
            if (range.startRow <= range.endRow && range.startColumn <= range.endColumn) {
                this._rangeCollection.addRange(range);
            }
        }
    }

    private _clear(): void {
        this._shapes.forEach((shape) => {
            shape.dispose();
        });
        this._shapes = [];
    }

    private _addShapes(range: IRange, index: number, scene: Scene, skeleton: SpreadsheetSkeleton): void {
        const { startRow, endRow, startColumn, endColumn } = range;
        const startPosition = getCoordByCell(startRow, startColumn, scene, skeleton);
        const endPosition = getCoordByCell(endRow, endColumn, scene, skeleton);
        const { startX, startY } = startPosition;
        const { endX, endY } = endPosition;
        const width = endX - startX;
        const height = endY - startY;

        const shapeProps = {
            left: startX,
            top: startY,
            color: new ColorKit(this._color).toRgb(),
            width,
            height,
            zIndex: SHEETS_CROSSHAIR_HIGHLIGHT_Z_INDEX,
            evented: false,
        };
        const currentShapes = new SheetCrossHairHighlightShape(`crosshair-${index}`, shapeProps);
        this._shapes.push(currentShapes);
        scene.addObject(currentShapes);
    }

    render(ranges: IRange[]): void {
        const skeleton = this._sheetSkeletonManagerService.getCurrentSkeleton();
        if (!skeleton) {
            return;
        }

        const { scene } = this._context;
        this._clear();
        for (let i = 0; i < ranges.length; i++) {
            const range = ranges[i];
            this._addShapes(range, i, scene, skeleton);
        }
        scene.makeDirty(true);
    }

    override async dispose(): Promise<void> {
        super.dispose();
    }
}
