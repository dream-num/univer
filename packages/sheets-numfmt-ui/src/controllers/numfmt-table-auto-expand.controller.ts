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

import type { ISetCellsNumfmt, ISheetValueChangeContext } from '@univerjs/sheets';
import type { ITableAutoExpandCandidate } from '@univerjs/sheets-table';
import { Disposable, Inject, Injector, Quantity, Rectangle } from '@univerjs/core';
import {
    factorySetNumfmtUndoMutation,
    INumfmtService,
    SetNumfmtMutation,
    SheetInterceptorService,
    transformCellsToRange,
} from '@univerjs/sheets';
import { SheetTableAutoExpandService, TableManager } from '@univerjs/sheets-table';

export class NumfmtTableAutoExpandController extends Disposable {
    private _tables?: TableManager;
    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @INumfmtService private readonly _numfmt: INumfmtService,
        @Inject(SheetInterceptorService) interceptor: SheetInterceptorService
    ) {
        super();
        this._bind();
        this.disposeWithMe(interceptor.interceptValueChange(() => {
            this._bind();
            return [];
        }, 1));
    }

    private _bind(): void {
        if (this._tables) return;
        const service = this._injector.get(SheetTableAutoExpandService, Quantity.OPTIONAL);
        if (!service) return;
        this._tables = this._injector.get(TableManager);
        this.disposeWithMe(service.registerContribution({ id: 'numfmt', getMutations: (context, candidate) => this._getMutations(context, candidate) }));
    }

    private _getMutations(context: ISheetValueChangeContext, candidate: ITableAutoExpandCandidate) {
        const table = this._tables?.getTable(context.unitId, candidate.tableId)?.getTableInfo();
        const cells: ISetCellsNumfmt = [];
        if (table && candidate.direction === 'row') {
            const firstRow = candidate.oldRange.startRow + (table.showHeader ? 1 : 0);
            table.columns.forEach((column, index) => {
                const col = candidate.oldRange.startColumn + index;
                let pattern = column.style?.n?.pattern;
                if (!pattern) {
                    for (let row = firstRow; row <= candidate.oldRange.endRow; row++) {
                        const current = this._numfmt.getValue(context.unitId, context.subUnitId, row, col)?.pattern;
                        if (!current || (pattern && pattern !== current)) {
                            return;
                        }
                        pattern = current;
                    }
                }
                if (!pattern) {
                    return;
                }
                for (let row = candidate.oldRange.endRow + 1; row <= candidate.newRange.endRow; row++) {
                    const range = { startRow: row, endRow: row, startColumn: col, endColumn: col };
                    if (!this._numfmt.getValue(context.unitId, context.subUnitId, row, col)?.pattern
                        && !context.explicitStyleRanges.some((explicit) => Rectangle.intersects(explicit, range))) {
                        cells.push({ row, col, pattern });
                    }
                }
            });
        }
        if (!cells.length) {
            return { redos: [], undos: [] };
        }
        const params = transformCellsToRange(context.unitId, context.subUnitId, cells);
        return {
            redos: [{ id: SetNumfmtMutation.id, params }],
            undos: this._injector.invoke((accessor) => factorySetNumfmtUndoMutation(accessor, params)),
        };
    }
}
