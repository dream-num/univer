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

import type { IRange, Workbook } from '@univerjs/core';
import { CommandType, fromCallback, ICommandService, RxDisposable, ThemeService } from '@univerjs/core';
import type { IRenderContext, IRenderModule, SpreadsheetSkeleton } from '@univerjs/engine-render';
import { IRenderManagerService } from '@univerjs/engine-render';
import type { ISelectionStyle, ISheetCommandSharedParams } from '@univerjs/sheets';
import { INTERCEPTOR_POINT, SheetInterceptorService } from '@univerjs/sheets';
import type { FilterModel } from '@univerjs/sheets-filter';
import { FILTER_MUTATIONS, ReCalcSheetsFilterMutation, RemoveSheetsFilterMutation, SetSheetsFilterCriteriaMutation, SetSheetsFilterRangeMutation, SheetsFilterService } from '@univerjs/sheets-filter';
import { getCoordByCell, ISelectionRenderService, SelectionShape, SheetSkeletonManagerService, SheetsRenderService } from '@univerjs/sheets-ui';
import type { IDisposable } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

import { combineLatest, filter, map, of, startWith, switchMap, takeUntil, throttleTime } from 'rxjs';
import type { ISheetsFilterButtonShapeProps } from '../views/widgets/filter-button.shape';
import { FILTER_ICON_PADDING, FILTER_ICON_SIZE, SheetsFilterButtonShape } from '../views/widgets/filter-button.shape';

const DEFAULT_Z_INDEX = 1000;

const SHEETS_FILTER_BUTTON_Z_INDEX = 5000;

interface ISheetsFilterRenderParams {
    unitId: string;
    worksheetId: string;
    filterModel?: FilterModel;
    range?: IRange;
    skeleton: SpreadsheetSkeleton;
}

export class SheetsFilterRenderController extends RxDisposable implements IRenderModule {
    private _filterRangeShape: SelectionShape | null = null;
    private _buttonRenderDisposable: IDisposable | null = null;
    private _filterButtonShapes: SheetsFilterButtonShape[] = [];

    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @Inject(SheetsFilterService) private readonly _sheetsFilterService: SheetsFilterService,
        @Inject(ThemeService) private readonly _themeService: ThemeService,
        @Inject(SheetInterceptorService) private readonly _sheetInterceptorService: SheetInterceptorService,
        @Inject(SheetsRenderService) private _sheetsRenderService: SheetsRenderService,
        @ICommandService private readonly _commandService: ICommandService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @ISelectionRenderService private readonly _selectionRenderService: ISelectionRenderService
    ) {
        super();

        [
            SetSheetsFilterRangeMutation,
            SetSheetsFilterCriteriaMutation,
            RemoveSheetsFilterMutation,
            ReCalcSheetsFilterMutation,
        ].forEach((m) => this.disposeWithMe(this._sheetsRenderService.registerSkeletonChangingMutations(m.id)));

        this._initRenderer();
    }

    private _initRenderer(): void {
        // Subscribe to skeleton change and filter model change.
        combineLatest([
            this._selectionRenderService.usable$,
            this._sheetSkeletonManagerService.currentSkeleton$,
        ])
            .pipe(
                filter(([usable]) => usable),
                switchMap(([_, skeletonParams]) => {
                    if (!skeletonParams) return of(null);

                    const { unit: workbook, unitId } = this._context;
                    const worksheetId = workbook.getActiveSheet().getSheetId();
                    const filterModel = this._sheetsFilterService.getFilterModel(unitId, worksheetId) ?? undefined;
                    const getParams = (): ISheetsFilterRenderParams => ({
                        unitId,
                        worksheetId,
                        filterModel,
                        range: filterModel?.getRange(),
                        skeleton: skeletonParams.skeleton,
                    });

                    return fromCallback(this._commandService.onCommandExecuted).pipe(
                        filter(([command]) =>
                            command.type === CommandType.MUTATION
                            && (command.params as ISheetCommandSharedParams).unitId === workbook.getUnitId()
                            && FILTER_MUTATIONS.has(command.id)
                        ),
                        throttleTime(20, undefined, { leading: false, trailing: true }),
                        map(getParams),
                        startWith(getParams()) // must trigger once
                    );
                }),
                takeUntil(this.dispose$)
            )
            .subscribe((renderParams) => {
                this._disposeRendering();

                // If there's no filter range, we don't need to render anything.
                if (!renderParams || !renderParams.range) {
                    return;
                }

                this._renderRange(renderParams.unitId, renderParams.range, renderParams.skeleton);
                this._renderButtons(renderParams as Required<ISheetsFilterRenderParams>);
            });
    }

    private _renderRange(unitId: string, range: IRange, skeleton: SpreadsheetSkeleton): void {
        const renderer = this._renderManagerService.getRenderById(unitId);
        if (!renderer) {
            return;
        }

        const { scene } = renderer;
        const { rangeWithCoord, style } = this._selectionRenderService.attachSelectionWithCoord({
            range,
            primary: null,
            style: null,
        });

        const { rowHeaderWidth, columnHeaderHeight } = skeleton;
        const filterRangeShape = this._filterRangeShape = new SelectionShape(scene, DEFAULT_Z_INDEX, true, this._themeService);
        filterRangeShape.update(rangeWithCoord, rowHeaderWidth, columnHeaderHeight, {
            hasAutoFill: false,
            fill: 'rgba(0, 0, 0, 0.0)',
            ...style,
        } as ISelectionStyle);
        filterRangeShape.setEvent(false);

        scene.makeDirty(true);
    }

    private _renderButtons(params: Required<ISheetsFilterRenderParams>): void {
        const { range, filterModel, unitId, skeleton, worksheetId } = params;
        const currentRenderer = this._renderManagerService.getRenderById(unitId);
        if (!currentRenderer) {
            return;
        }

        const { scene } = currentRenderer;

        // Push cell contents to leave space for the filter buttons.
        this._interceptCellContent(params.range);

        // Create filter button shapes.
        const { startColumn, endColumn, startRow } = range;
        for (let col = startColumn; col <= endColumn; col++) {
            const key = `sheets-filter-button-${col}`;
            const startPosition = getCoordByCell(startRow, col, scene, skeleton);
            const { startX, startY, endX, endY } = startPosition;

            // Too little space to draw the button, just ignore it.
            const cellWidth = endX - startX;
            const cellHeight = endY - startY;
            if (cellHeight <= FILTER_ICON_PADDING || cellWidth <= FILTER_ICON_PADDING) {
                continue;
            }

            // In other cases we need to draw the button, and we need to take care of the position and clipping.
            const hasCriteria = !!filterModel.getFilterColumn(col);
            const iconStartX = endX - FILTER_ICON_SIZE - FILTER_ICON_PADDING;
            const iconStartY = endY - FILTER_ICON_SIZE - FILTER_ICON_PADDING;
            const props: ISheetsFilterButtonShapeProps = {
                left: iconStartX,
                top: iconStartY,
                height: FILTER_ICON_SIZE,
                width: FILTER_ICON_SIZE,
                zIndex: SHEETS_FILTER_BUTTON_Z_INDEX,
                cellHeight,
                cellWidth,
                filterParams: { unitId, subUnitId: worksheetId, col, hasCriteria },
            };

            const buttonShape = this._injector.createInstance(SheetsFilterButtonShape, key, props);
            this._filterButtonShapes.push(buttonShape);
        }

        scene.addObjects(this._filterButtonShapes);
        scene.makeDirty();
    }

    private _interceptCellContent(range: IRange): void {
        const { startRow, startColumn, endColumn } = range;
        this._buttonRenderDisposable = this._sheetInterceptorService.intercept(INTERCEPTOR_POINT.CELL_CONTENT, {
            handler: (cell, pos, next) => {
                const { row, col } = pos;
                if (row !== startRow || col < startColumn || col > endColumn) {
                    return next(cell);
                }

                return next({
                    ...cell,
                    // @ts-ignore
                    fontRenderExtension: {
                        // @ts-ignore
                        ...cell?.fontRenderExtension,
                        rightOffset: FILTER_ICON_SIZE,
                    },
                });
            },
            priority: 10,
        });
    }

    private _disposeRendering(): void {
        this._filterRangeShape?.dispose();
        this._filterButtonShapes.forEach((s) => s.dispose());
        this._buttonRenderDisposable?.dispose();

        this._filterRangeShape = null;
        this._buttonRenderDisposable = null;
        this._filterButtonShapes = [];
    }
}
