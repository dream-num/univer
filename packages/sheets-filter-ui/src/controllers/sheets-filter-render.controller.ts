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

import type { IRange } from '@univerjs/core';
import { CommandType, Disposable, ICommandService, IUniverInstanceService, LifecycleStages, OnLifecycle, ThemeService } from '@univerjs/core';
import { ISelectionRenderService, SelectionShape, SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import type { IDisposable } from '@wendellhu/redi';
import { Inject } from '@wendellhu/redi';
import { FILTER_MUTATIONS, SheetsFilterService } from '@univerjs/sheets-filter';
import type { SpreadsheetSkeleton } from '@univerjs/engine-render';
import { IRenderManagerService } from '@univerjs/engine-render';
import type { ISelectionStyle, ISheetCommandSharedParams } from '@univerjs/sheets';
import { filter, map, Observable, of, startWith, switchMap } from 'rxjs';

const DEFAULT_Z_INDEX = 1000;

/**
 * This controller is for rendering **Filter**-related elements on the canvas, including:
 *
 * - the filter range
 * - the open filter config panel button
 */
@OnLifecycle(LifecycleStages.Rendered, SheetsFilterRenderController)
export class SheetsFilterRenderController extends Disposable {
    private _filterRangeShape: SelectionShape | null = null;

    constructor(
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @Inject(SheetsFilterService) private readonly _sheetsFilterService: SheetsFilterService,
        @Inject(ThemeService) private readonly _themeService: ThemeService,
        @ICommandService private readonly _commandService: ICommandService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @ISelectionRenderService private readonly _selectionRenderService: ISelectionRenderService

    ) {
        super();

        this._initRenderer();
    }

    private _initRenderer(): void {
        this._sheetSkeletonManagerService.currentSkeleton$
            .pipe(
                switchMap((skeletonParams) => {
                    if (!skeletonParams) {
                        return of(null);
                    }

                    const { unitId } = skeletonParams;
                    const workbook = this._univerInstanceService.getUniverSheetInstance(unitId);
                    if (!workbook) {
                        return of(null);
                    }

                    const activeSheet = workbook.getActiveSheet();
                    const getParams = () => ({
                        unitId,
                        range: this._sheetsFilterService.getFilterModel(unitId, activeSheet.getSheetId())?.getRange(),
                        skeleton: skeletonParams.skeleton,
                    });

                    return fromCallback(this._commandService.onCommandExecuted)
                        .pipe(
                            filter(([command]) =>
                                command.type === CommandType.MUTATION
                                && (command.params as ISheetCommandSharedParams).unitId === workbook.getUnitId()
                                && FILTER_MUTATIONS.has(command.id)
                            ),
                            map(getParams),
                            startWith(getParams()) // must trigger once
                        );
                })
            )

            .subscribe((renderParams) => {
                this._disposeRendering();

                if (!renderParams || !renderParams.range) {
                    return;
                }

                this._renderRange(renderParams.unitId, renderParams.range, renderParams.skeleton);
            });
    }

    private _renderRange(unitId: string, range: IRange, skeleton: SpreadsheetSkeleton): void {
        const renderer = this._renderManagerService.getRenderById(unitId);
        if (!renderer) {
            return;
        }

        const { scene } = renderer;
        const { rangeWithCoord, style } = this._selectionRenderService.convertSelectionRangeToData({
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

        scene.makeDirty(true);
    }

    private _renderFilterButtons(): void {

    }

    private _disposeRendering(): void {
        this._filterRangeShape?.dispose();
        this._filterRangeShape = null;
    }
}

type CallbackFn<T extends readonly unknown[]> = (cb: (...args: T) => void) => IDisposable;
export function fromCallback<T extends readonly unknown[]>(callback: CallbackFn<T>): Observable<T> {
    return new Observable((subscriber) => {
        const disposable: IDisposable | undefined = callback((...args: T) => subscriber.next(args));
        return () => disposable?.dispose();
    });
};
