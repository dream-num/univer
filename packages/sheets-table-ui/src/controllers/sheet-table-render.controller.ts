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

import type { Workbook } from '@univerjs/core';

import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { Inject, Injector, RxDisposable } from '@univerjs/core';
import { TableManager } from '@univerjs/sheets-table';
import { SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { merge } from 'rxjs';
import { SheetTableThemeUIController } from './sheet-table-theme-ui.controller';

/**
 * Show selected range in filter.
 */
export class SheetsTableRenderController extends RxDisposable implements IRenderModule {
    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @Inject(TableManager) private _tableManager: TableManager,
        @Inject(SheetTableThemeUIController) private readonly _sheetTableThemeUIController: SheetTableThemeUIController
    ) {
        super();
        this._initListener();
    }

    private _dirtySkeleton() {
        this._context.mainComponent?.makeDirty();
        const currentParam = this._sheetSkeletonManagerService.getCurrentParam();
        if (currentParam) {
            const param = { ...currentParam, dirty: true };
            this._sheetSkeletonManagerService.reCalculate(param);
        }
    }

    private _initListener(): void {
        const tableManager = this._tableManager;
        const dirtySkeleton = this._dirtySkeleton.bind(this);
        this.disposeWithMe(
            merge(
                tableManager.tableAdd$,
                tableManager.tableDelete$,
                tableManager.tableNameChanged$,
                tableManager.tableRangeChanged$,
                tableManager.tableThemeChanged$,
                tableManager.tableFilterChanged$,
                tableManager.tableInitStatus$,
                this._sheetTableThemeUIController.refreshTable$
            ).subscribe(
                dirtySkeleton
            )
        );
    }
}
