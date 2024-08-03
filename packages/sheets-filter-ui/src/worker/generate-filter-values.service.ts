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

import type { IRange, Workbook, Worksheet } from '@univerjs/core';
import { createIdentifier, Disposable, extractPureTextFromCell, ILogService, Inject, IUniverInstanceService, LocaleService } from '@univerjs/core';
import type { IFilterByValueItem } from '../services/sheets-filter-panel.service';

export interface ISheetsGenerateFilterValuesService {
    getFilterValues(params: {
        unitId: string;
        subUnitId: string;
        filteredOutRowsByOtherColumns: number[];
        filters: boolean;
        blankChecked: boolean;
        iterateRange: IRange;
        alreadyChecked: string[];
    }): Promise<IFilterByValueItem[]>;
}
export const SHEETS_GENERATE_FILTER_VALUES_SERVICE_NAME = 'sheets-filter.generate-filter-values.service';
export const ISheetsGenerateFilterValuesService = createIdentifier<ISheetsGenerateFilterValuesService>(SHEETS_GENERATE_FILTER_VALUES_SERVICE_NAME);

export class SheetsGenerateFilterValuesService extends Disposable {
    constructor(
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @ILogService private readonly _logService: ILogService
    ) {
        super();
    }

    async getFilterValues(params: {
        unitId: string;
        subUnitId: string;
        filteredOutRowsByOtherColumns: number[];
        filters: boolean;
        blankChecked: boolean;
        iterateRange: IRange;
        alreadyChecked: string[];
    }) {
        const { unitId, subUnitId, filteredOutRowsByOtherColumns, filters, blankChecked, iterateRange, alreadyChecked } = params;
        const worksheet = this._univerInstanceService.getUnit<Workbook>(unitId)?.getSheetBySheetId(subUnitId);

        if (!worksheet) return [];

        this._logService.debug('[SheetsGenerateFilterValuesService]', 'getFilterValues for', { unitId, subUnitId });

        return getFilterByValueItems(
            filters,
            blankChecked,
            this._localeService,
            iterateRange,
            worksheet,
            new Set(alreadyChecked.map(String)),
            new Set(filteredOutRowsByOtherColumns)
        );
    }
}

export function getFilterByValueItems(
    filters: boolean,
    blankChecked: boolean,
    localeService: LocaleService,
    iterateRange: IRange,
    worksheet: Worksheet,
    alreadyChecked: Set<string>,
    filteredOutRowsByOtherColumns: Set<number>
): IFilterByValueItem[] {
    const items: IFilterByValueItem[] = [];
    const itemsByKey: Record<string, IFilterByValueItem> = {};

    let index = 0;
    let emptyCount = 0;
    for (const cell of worksheet.iterateByColumn(iterateRange, false, false)) { // iterate and do not skip empty cells
        const { row, rowSpan = 1 } = cell;

        let rowIndex = 0;
        while (rowIndex < rowSpan) {
            const targetRow = row + rowIndex;

            if (filteredOutRowsByOtherColumns.has(targetRow)) {
                rowIndex++;
                continue;
            }

            const value = cell?.value ? extractPureTextFromCell(cell.value) : '';
            if (!value) {
                emptyCount += 1;
                rowIndex += rowSpan;
                continue;
            }

            if (!itemsByKey[value]) {
                const item: IFilterByValueItem = {
                    value,
                    checked: alreadyChecked.size ? alreadyChecked.has(value) : !blankChecked,
                    count: 1,
                    index,
                    isEmpty: false,
                };

                itemsByKey[value] = item;
                items.push(item);
            } else {
                itemsByKey[value].count++;
            }
            rowIndex++;
        }

        index++;
    }

    const initialBlankChecked = filters ? blankChecked : true;
    if (emptyCount > 0) {
        const item: IFilterByValueItem = {
            value: localeService.t('sheets-filter.panel.empty'),
            checked: initialBlankChecked,
            count: emptyCount,
            index,
            isEmpty: true,
        };

        items.push(item);
    }

    return items;
}
