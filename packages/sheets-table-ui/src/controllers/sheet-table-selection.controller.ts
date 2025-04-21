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

import type { IRange } from '@univerjs/core';
import { Disposable, Inject, IUniverInstanceService, Rectangle } from '@univerjs/core';
import { getPrimaryForRange, getSheetCommandTarget, SetSelectionsOperation, SheetInterceptorService } from '@univerjs/sheets';
import { TableManager } from '@univerjs/sheets-table';
import { SelectAllCommand } from '@univerjs/sheets-ui';

export class SheetTableSelectionController extends Disposable {
    constructor(
        @Inject(SheetInterceptorService) private readonly _sheetInterceptorService: SheetInterceptorService,
        @Inject(IUniverInstanceService) private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(TableManager) private readonly _tableManager: TableManager
    ) {
        super();
        this._initSelectionChange();
    }

    private _initSelectionChange() {
        this.disposeWithMe(
            this._sheetInterceptorService.interceptCommand({
                getMutations: (command) => {
                    if (command.id === SelectAllCommand.id) {
                        const target = getSheetCommandTarget(this._univerInstanceService);
                        if (!target) {
                            return { redos: [], undos: [] };
                        }
                        const params = command.params as { range: IRange };
                        const { range } = params;
                        const { unitId, subUnitId, worksheet } = target;
                        const subTables = this._tableManager.getTablesBySubunitId(unitId, subUnitId);
                        const overlapTable = subTables.find((table) => {
                            const tableRange = table.getRange();
                            return Rectangle.contains(tableRange, range);
                        });

                        if (overlapTable) {
                            const tableRange = overlapTable.getRange();
                            const tableRangeWithoutHeader = {
                                ...tableRange,
                                startRow: tableRange.startRow + 1,
                            };

                            if (Rectangle.equals(tableRange, range)) {
                                return { undos: [], redos: [] };
                            } else if (Rectangle.equals(tableRangeWithoutHeader, range)) {
                                return {
                                    undos: [],
                                    redos: [
                                        {
                                            id: SetSelectionsOperation.id,
                                            params: {
                                                unitId,
                                                subUnitId,
                                                selections: [
                                                    {
                                                        range: tableRange,
                                                        primary: getPrimaryForRange(tableRange, worksheet),
                                                    },
                                                ],
                                            },
                                        },
                                    ],
                                };
                            } else {
                                return {
                                    undos: [],
                                    redos: [
                                        {
                                            id: SetSelectionsOperation.id,
                                            params: {
                                                unitId,
                                                subUnitId,
                                                selections: [
                                                    {
                                                        range: tableRangeWithoutHeader,
                                                        primary: getPrimaryForRange(tableRangeWithoutHeader, worksheet),
                                                    },
                                                ],
                                            },
                                        },
                                    ],
                                };
                            }
                        }
                    }
                    return { redos: [], undos: [] };
                },
            })
        );
    }
}
