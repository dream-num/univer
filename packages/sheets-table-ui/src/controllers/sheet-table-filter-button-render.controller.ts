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

import type { IDisposable, IRange, Workbook } from '@univerjs/core';
import type { IRenderContext, IRenderModule, SpreadsheetSkeleton } from '@univerjs/engine-render';
import type { ITableRangeWithState } from '@univerjs/sheets-table';
import type { ISheetsTableFilterButtonShapeProps } from '../views/widgets/table-filter-button.shape';
import { Inject, Injector, InterceptorEffectEnum, RxDisposable } from '@univerjs/core';
import { INTERCEPTOR_POINT, SheetInterceptorService } from '@univerjs/sheets';
import { TableManager } from '@univerjs/sheets-table';
import { getCoordByCell, SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { map, merge, of, startWith, switchMap, takeUntil } from 'rxjs';
import { FILTER_ICON_PADDING, FILTER_ICON_SIZE, SheetsTableFilterButtonShape } from '../views/widgets/table-filter-button.shape';

const SHEETS_FILTER_BUTTON_Z_INDEX = 5000;

interface ISheetsTableFilterRenderParams {
    unitId: string;
    worksheetId: string;
    tableFilterRanges: ITableRangeWithState[];
    skeleton: SpreadsheetSkeleton;
}

/**
 * Show selected range in filter.
 */
export class SheetsTableFilterButtonRenderController extends RxDisposable implements IRenderModule {
    private _buttonRenderDisposable: IDisposable | null = null;
    private _tableFilterButtonShapes: SheetsTableFilterButtonShape[] = [];

    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @Inject(SheetInterceptorService) private readonly _sheetInterceptorService: SheetInterceptorService,
        @Inject(TableManager) private _tableManager: TableManager
    ) {
        super();
        this._initRenderer();
    }

    override dispose(): void {
        super.dispose();
        this._disposeRendering();
    }

    private _initRenderer(): void {
        // Subscribe to skeleton change and filter model change.
        const tableManager = this._tableManager;
        this._sheetSkeletonManagerService.currentSkeleton$.pipe(
            switchMap((skeletonParams) => {
                if (!skeletonParams) return of(null);

                const { unit: workbook, unitId } = this._context;
                const worksheetId = workbook.getActiveSheet()?.getSheetId() || '';
                const getParams = (): ISheetsTableFilterRenderParams => ({
                    unitId,
                    worksheetId,
                    tableFilterRanges: this._tableManager.getSheetFilterRangeWithState(workbook.getUnitId(), worksheetId),
                    skeleton: skeletonParams.skeleton,
                });

                return merge(
                    tableManager.tableAdd$,
                    tableManager.tableNameChanged$,
                    tableManager.tableRangeChanged$,
                    tableManager.tableThemeChanged$,
                    tableManager.tableDelete$,
                    tableManager.tableFilterChanged$
                ).pipe(
                    map(() => getParams()),
                    startWith(getParams())
                );
            }),
            takeUntil(this.dispose$)
        ).subscribe((renderParams) => {
            this._disposeRendering();
            if (!renderParams || !renderParams.tableFilterRanges) {
                return;
            }

            this._renderButtons(renderParams as Required<ISheetsTableFilterRenderParams>);
        });
    }

    private _renderButtons(params: Required<ISheetsTableFilterRenderParams>): void {
        const { tableFilterRanges, unitId, skeleton, worksheetId } = params;
        const { scene } = this._context;

        for (const { range, states, tableId } of tableFilterRanges) {
            const { startRow, startColumn, endColumn } = range;
            this._interceptCellContent(unitId, worksheetId, range);
            for (let col = startColumn; col <= endColumn; col++) {
                const key = `sheets-table-filter-button-${startRow}-${col}`;
                const startPosition = getCoordByCell(startRow, col, scene, skeleton);
                const { startX, startY, endX, endY } = startPosition;
                const cellWidth = endX - startX;
                const cellHeight = endY - startY;
                if (cellHeight <= FILTER_ICON_PADDING || cellWidth <= FILTER_ICON_PADDING) {
                    continue;
                }
                const state = states[col - startColumn];
                const iconStartX = endX - FILTER_ICON_SIZE - FILTER_ICON_PADDING;
                const iconStartY = endY - FILTER_ICON_SIZE - FILTER_ICON_PADDING;
                const props: ISheetsTableFilterButtonShapeProps = {
                    left: iconStartX,
                    top: iconStartY,
                    height: FILTER_ICON_SIZE,
                    width: FILTER_ICON_SIZE,
                    zIndex: SHEETS_FILTER_BUTTON_Z_INDEX,
                    cellHeight,
                    cellWidth,
                    filterParams: { unitId, subUnitId: worksheetId, row: startRow, col, buttonState: state, tableId },
                };
                const buttonShape = this._injector.createInstance(SheetsTableFilterButtonShape, key, props);
                this._tableFilterButtonShapes.push(buttonShape);
            }
        }

        scene.addObjects(this._tableFilterButtonShapes);
        scene.makeDirty();
    }

    private _interceptCellContent(workbookId: string, worksheetId: string, range: IRange): void {
        const { startRow, startColumn, endColumn } = range;
        this._buttonRenderDisposable = this._sheetInterceptorService.intercept(INTERCEPTOR_POINT.CELL_CONTENT, {
            effect: InterceptorEffectEnum.Style,
            handler: (cell, pos, next) => {
                const { row, col, unitId, subUnitId } = pos;
                if (
                    unitId !== workbookId ||
                    subUnitId !== worksheetId ||
                    row !== startRow ||
                    col < startColumn ||
                    col > endColumn
                ) {
                    return next(cell);
                }

                return next({
                    ...cell,
                    fontRenderExtension: {
                        ...cell?.fontRenderExtension,
                        rightOffset: FILTER_ICON_SIZE,
                    },
                });
            },
            priority: 10,
        });
    }

    private _disposeRendering(): void {
        this._tableFilterButtonShapes.forEach((s) => s.dispose());
        this._buttonRenderDisposable?.dispose();

        this._buttonRenderDisposable = null;
        this._tableFilterButtonShapes = [];
    }
}
