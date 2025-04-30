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

import type { IDisposable, Workbook } from '@univerjs/core';
import {
    IContextService,
    Inject,
    IUniverInstanceService,
    RxDisposable,
    ThemeService,
    toDisposable,
    UniverInstanceType,
} from '@univerjs/core';
import { IRenderManagerService, RENDER_RAW_FORMULA_KEY, Spreadsheet } from '@univerjs/engine-render';
import { distinctUntilChanged, takeUntil } from 'rxjs';

const SHEET_MAIN_CANVAS_ID = 'univer-sheet-main-canvas';

/**
 * This controller is responsible for managing units of a specific kind (UniverSheet) to be rendered on the canvas.
 */
export class SheetsRenderService extends RxDisposable {
    private _skeletonChangeMutations = new Set<string>();

    constructor(
        @IContextService private readonly _contextService: IContextService,
        @IUniverInstanceService private readonly _instanceSrv: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(ThemeService) private readonly _themeService: ThemeService
    ) {
        super();

        // It should be initialized after all other plugins are ready.
        Promise.resolve().then(() => this._init());
    }

    /**
     * Register a mutation id that will trigger the skeleton change.
     *
     * @param mutationId the id of the mutation
     * @returns a disposable to unregister the mutation
     */
    registerSkeletonChangingMutations(mutationId: string): IDisposable {
        if (this._skeletonChangeMutations.has(mutationId)) {
            return toDisposable(() => { });
        }

        this._skeletonChangeMutations.add(mutationId);
        return toDisposable(() => this._skeletonChangeMutations.delete(mutationId));
    }

    /**
     * Examine if a mutation would make the skeleton to change.
     */
    checkMutationShouldTriggerRerender(id: string): boolean {
        return this._skeletonChangeMutations.has(id);
    }

    private _init() {
        this._initWorkbookListener();
        this._initContextListener();
        this._initDarkModeListener();
    }

    private _initDarkModeListener(): void {
        this.disposeWithMe(this._themeService.darkMode$.subscribe(() => {
            this._renderManagerService.getRenderAll().forEach((renderer) => {
                renderer.components.forEach((component) => {
                    component.makeForceDirty(true);
                    component.makeDirty(true);
                });
            });
        }));
    }

    private _initWorkbookListener(): void {
        this._instanceSrv.getTypeOfUnitAdded$<Workbook>(UniverInstanceType.UNIVER_SHEET)
            .pipe(takeUntil(this.dispose$))
            .subscribe((workbook) => this._createRenderer(workbook));
        this._instanceSrv.getAllUnitsForType<Workbook>(UniverInstanceType.UNIVER_SHEET)
            .forEach((workbook) => this._createRenderer(workbook));
        this._instanceSrv.getTypeOfUnitDisposed$<Workbook>(UniverInstanceType.UNIVER_SHEET)
            .pipe(takeUntil(this.dispose$))
            .subscribe((workbook) => this._disposeRenderer(workbook));
    }

    private _createRenderer(workbook: Workbook): void {
        const unitId = workbook.getUnitId();
        this._renderManagerService.created$.subscribe((renderer) => {
            if (renderer.unitId === unitId) {
                renderer.engine.getCanvas().setId(`${SHEET_MAIN_CANVAS_ID}_${unitId}`);
                renderer.engine.getCanvas().getContext().setId(`${SHEET_MAIN_CANVAS_ID}_${unitId}`);
            }
        });

        this._renderManagerService.createRender(unitId);
    }

    private _disposeRenderer(workbook: Workbook): void {
        const unitId = workbook.getUnitId();
        this._renderManagerService.removeRender(unitId);
    }

    private _initContextListener(): void {
        // If we toggle the raw formula, we need to refresh all spreadsheets.
        this.disposeWithMe(this._contextService.subscribeContextValue$(RENDER_RAW_FORMULA_KEY)
            .pipe(distinctUntilChanged())
            .subscribe(() => {
                this._renderManagerService.getRenderAll().forEach((renderer) => {
                    if (renderer.mainComponent instanceof Spreadsheet) {
                        (renderer.mainComponent as Spreadsheet).makeForceDirty(true);
                    }
                });
            }));
    }
}
