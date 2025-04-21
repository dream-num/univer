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
import type { Subscription } from 'rxjs';

import { Disposable, Inject, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { getSheetCommandTarget, INTERCEPTOR_POINT, SheetInterceptorService } from '@univerjs/sheets';
import { BehaviorSubject, filter, switchMap } from 'rxjs';
import { TableManager } from '../model/table-manager';

export class TableFilterController extends Disposable {
    private readonly _tableFilteredOutRows$ = new BehaviorSubject<Readonly<Set<number>>>(new Set());
    readonly tableFilteredOutRows$ = this._tableFilteredOutRows$.asObservable();

    private _subscription: Subscription | null = null;
    constructor(
        @Inject(TableManager) private _tableManager: TableManager,
        @Inject(SheetInterceptorService) private readonly _sheetInterceptorService: SheetInterceptorService,
        @Inject(IUniverInstanceService) private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();
        this.registerFilterChangeEvent();
        this.initTableHiddenRowIntercept();
        this._initFilteredOutRows();
    }

    get tableFilteredOutRows() {
        return this._tableFilteredOutRows$.value;
    }

    set tableFilteredOutRows(value: Set<number>) {
        this._tableFilteredOutRows$.next(value);
    }

    initTableHiddenRowIntercept() {
        this.disposeWithMe(this._sheetInterceptorService.intercept(INTERCEPTOR_POINT.ROW_FILTERED, {
            // 这里需要保证优先级高于sheet的筛选，因为筛选没有next,低于筛选的不会触发interceptor
            priority: 100,
            handler: (filtered, rowLocation, next) => {
                if (filtered) return true;
                const isTableFiltered = this.tableFilteredOutRows.has(rowLocation.row);
                return isTableFiltered ? true : next(isTableFiltered);
            },
        }));
    }

    private _initFilteredOutRows() {
        this._tableManager.tableInitStatus$.pipe(
            filter((initialized) => initialized),
            switchMap(() => {
                return this._univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET);
            }),
            filter((workbook) => workbook !== null && workbook !== undefined),
            switchMap((workbook) => workbook.activeSheet$),
            filter((sheet) => sheet !== null && sheet !== undefined)
        ).subscribe(() => {
            const target = getSheetCommandTarget(this._univerInstanceService);
            if (!target) {
                return;
            }
            const { unitId, subUnitId } = target;
            this.tableFilteredOutRows.clear();
            const tables = this._tableManager.getTablesBySubunitId(unitId, subUnitId);
            tables.forEach((table) => {
                const tableFilteredRows = table.getTableFilters().getFilterOutRows();
                if (!tableFilteredRows) {
                    return;
                }
                for (const row of tableFilteredRows) {
                    this.tableFilteredOutRows.add(row);
                }
            });
        });
    }

    registerFilterChangeEvent() {
        this.disposeWithMe(
            this._tableManager.tableFilterChanged$.subscribe((event) => {
                const { unitId, subUnitId, tableId } = event;
                const worksheet = this._univerInstanceService.getUnit<Workbook>(unitId)?.getSheetBySheetId(subUnitId);
                const table = this._tableManager.getTable(unitId, tableId);
                if (!worksheet || !table) {
                    return;
                }

                this.tableFilteredOutRows.clear();

                const tableFilter = table.getTableFilters();
                tableFilter.doFilter(worksheet, table.getTableFilterRange());

                const tables = this._tableManager.getTablesBySubunitId(unitId, subUnitId);
                tables.forEach((table) => {
                    const tableFilteredRows = table.getTableFilters().getFilterOutRows();
                    if (!tableFilteredRows) {
                        return;
                    }
                    for (const row of tableFilteredRows) {
                        this.tableFilteredOutRows.add(row);
                    }
                });
            })
        );
    }

    override dispose(): void {
        super.dispose();
        this._subscription?.unsubscribe();
    }
}
