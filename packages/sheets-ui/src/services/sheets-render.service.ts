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

import type { Workbook } from '@univerjs/core';
import {
    IContextService,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
    RxDisposable,
    toDisposable,
    UniverInstanceType,
} from '@univerjs/core';
import { IRenderManagerService, RENDER_RAW_FORMULA_KEY, Spreadsheet } from '@univerjs/engine-render';
import type { IDisposable } from '@wendellhu/redi';
import { distinctUntilChanged, takeUntil } from 'rxjs';

/**
 * This controller is responsible for managing units of a specific kind to be rendered on the canvas.
 */
@OnLifecycle(LifecycleStages.Ready, SheetsRenderService)
export class SheetsRenderService extends RxDisposable {
    private _skeletonChangeMutations = new Set<string>();

    constructor(
        @IContextService private readonly _contextService: IContextService,
        @IUniverInstanceService private readonly _instanceSrv: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
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
            return toDisposable(() => {});
        }

        this._skeletonChangeMutations.add(mutationId);
        return toDisposable(() => this._skeletonChangeMutations.delete(mutationId));
    }

    checkMutationShouldTriggerRerender(id: string): boolean {
        return this._skeletonChangeMutations.has(id);
    }

    private _init() {
        this._initWorkbookListener();
        this._initContextListener();
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
        this._renderManagerService.createRender(unitId);

        // NOTE@wzhudev: maybe not in univer mode
        this._renderManagerService.setCurrent(unitId);
    }

    private _disposeRenderer(workbook: Workbook): void {
        const unitId = workbook.getUnitId();
        this._renderManagerService.removeRender(unitId);
    }

    private _initContextListener(): void {
        // If we toggle the raw formula, we need to refresh all spreadsheets.
        this._contextService.subscribeContextValue$(RENDER_RAW_FORMULA_KEY)
            .pipe(distinctUntilChanged(), takeUntil(this.dispose$))
            .subscribe(() => {
                this._renderManagerService.getRenderAll().forEach((renderer) => {
                    if (renderer.mainComponent instanceof Spreadsheet) {
                        (renderer.mainComponent as Spreadsheet).makeForceDirty(true);
                    }
                });
            });
    }
}
