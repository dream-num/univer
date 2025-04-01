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

import type { IRange, Styles, Workbook, Worksheet } from '@univerjs/core';
import type { IFilterByValueItem, IFilterByValueWithTreeItem } from '../services/sheets-filter-panel.service';
import { createIdentifier, Disposable, extractPureTextFromCell, ILogService, Inject, IUniverInstanceService, LocaleService, numfmt } from '@univerjs/core';

export interface ISheetsGenerateFilterValuesService {
    getFilterValues(params: {
        unitId: string;
        subUnitId: string;
        filteredOutRowsByOtherColumns: number[];
        filters: boolean;
        blankChecked: boolean;
        iterateRange: IRange;
        alreadyChecked: string[];
    }): Promise<{
        filterTreeItems: IFilterByValueWithTreeItem[];
        filterTreeMapCache: Map<string, string[]>;
    }>;
}
export const SHEETS_GENERATE_FILTER_VALUES_SERVICE_NAME = 'sheets-filter.generate-filter-values.service';
export const ISheetsGenerateFilterValuesService = createIdentifier<ISheetsGenerateFilterValuesService>(SHEETS_GENERATE_FILTER_VALUES_SERVICE_NAME);
const CAN_PARSE_DATE_FORMAT = ['yyyy-mm-dd', 'yyyy-mm-dd;@', 'yyyy/mm/dd;@', 'yyyy/mm/dd hh:mm', 'yyyy-m-d am/pm h:mm', 'yyyy-MM-dd', 'yyyy/MM/dd', 'yyyy/mm/dd', 'yyyy"年"MM"月"dd"日"', 'MM-dd', 'M"月"d"日"', 'MM-dd A/P hh:mm'];

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
        const workbook = this._univerInstanceService.getUnit<Workbook>(unitId);
        const worksheet = this._univerInstanceService.getUnit<Workbook>(unitId)?.getSheetBySheetId(subUnitId);

        if (!workbook || !worksheet) return [];

        this._logService.debug('[SheetsGenerateFilterValuesService]', 'getFilterValues for', { unitId, subUnitId });

        return getFilterTreeByValueItems(filters, this._localeService, iterateRange, worksheet, new Set(filteredOutRowsByOtherColumns), new Set(alreadyChecked.map(String)), blankChecked, workbook.getStyles());
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

// eslint-disable-next-line max-lines-per-function, complexity
export function getFilterTreeByValueItems(
    filters: boolean,
    localeService: LocaleService,
    iterateRange: IRange,
    worksheet: Worksheet,
    filteredOutRowsByOtherColumns: Set<number>,
    alreadyChecked: Set<string>,
    blankChecked: boolean,
    styles: Styles
): {
        filterTreeItems: IFilterByValueWithTreeItem[];
        filterTreeMapCache: Map<string, string[]>;
    } {
    const items: Map<string, IFilterByValueWithTreeItem> = new Map();
    const treeMap: Map<string, string[]> = new Map();

    const DefaultPattern = 'yyyy-mm-dd';
    const canSplitPatternSet = new Set(CAN_PARSE_DATE_FORMAT);
    const EmptyKey = 'empty';

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

            const fmtStr = (cell.value?.v && !cell.value.p) ? styles.get(cell.value?.s)?.n?.pattern : '';
            const isDateValue = fmtStr && numfmt.isDate(fmtStr);
            if (fmtStr && isDateValue && canSplitPatternSet.has(fmtStr)) {
                // const originValue = numfmt.parseDate(value).v as number;
                const originValue = worksheet.getCellRaw(cell.row, cell.col)?.v as number;
                if (!originValue) {
                    rowIndex++;
                    continue;
                }
                const valueParsedByDefaultPattern = numfmt.format(DefaultPattern, originValue);
                const [year, month, day] = valueParsedByDefaultPattern.split('-').map(Number);
                let yearItem = items.get(`${year}`);
                if (!yearItem) {
                    yearItem = {
                        title: `${year}`,
                        key: `${year}`,
                        children: [],
                        count: 0,
                        leaf: false,
                        checked: false,
                    };
                    items.set(`${year}`, yearItem);
                    treeMap.set(`${year}`, [`${year}`]);
                }
                let monthItem = yearItem.children?.find((item) => item.key === `${year}-${month}`);
                if (!monthItem) {
                    monthItem = {
                        title: localeService.t(`sheets-filter.date.${month}`),
                        key: `${year}-${month}`,
                        children: [],
                        count: 0,
                        leaf: false,
                        checked: false,
                    };
                    yearItem.children?.push(monthItem);
                    treeMap.set(`${year}-${month}`, [`${year}`, `${year}-${month}`]);
                }
                const dayItem = monthItem?.children?.find((item) => item.key === `${year}-${month}-${day}`);
                if (!dayItem) {
                    monthItem.children?.push({
                        title: `${day}`,
                        key: `${year}-${month}-${day}`,
                        count: 1,
                        originValues: new Set([value]),
                        leaf: true,
                        checked: alreadyChecked.size ? alreadyChecked.has(value) : !blankChecked,
                    });
                    monthItem.count++;
                    yearItem.count++;
                    treeMap.set(`${year}-${month}-${day}`, [`${year}`, `${year}-${month}`, `${year}-${month}-${day}`]);
                } else {
                    dayItem.originValues!.add(value);
                    dayItem.count++;
                    monthItem.count++;
                    yearItem.count++;
                }
            } else {
                const key = value;
                let item = items.get(key);
                if (!item) {
                    item = {
                        title: value,
                        leaf: true,
                        checked: alreadyChecked.size ? alreadyChecked.has(value) : !blankChecked,
                        key,
                        count: 1,
                    };
                    items.set(key, item);
                    treeMap.set(key, [key]);
                } else {
                    item.count++;
                }
            }
            rowIndex++;
        }
    }

    const initialBlankChecked = filters ? blankChecked : true;
    if (emptyCount > 0) {
        const item: IFilterByValueWithTreeItem = {
            title: localeService.t('sheets-filter.panel.empty'),
            count: emptyCount,
            leaf: true,
            checked: initialBlankChecked,
            key: EmptyKey,
        };
        items.set('empty', item);
        treeMap.set('empty', [EmptyKey]);
    }

    return {
        filterTreeItems: generateFilterTreeBySort(Array.from(items.values())),
        filterTreeMapCache: treeMap,
    };
}

function generateFilterTreeBySort(tree: IFilterByValueWithTreeItem[]) {
    return Array.from(tree).sort((a, b) => {
        if (a.children && !b.children) return -1;
        if (!a.children && b.children) return 1;
        return compare(a.title, b.title);
    }).map((yearItem) => {
        if (yearItem.children) {
            yearItem.children.sort((a, b) => {
                const monthA = Number.parseInt(a.key.split('-')[1], 10);
                const monthB = Number.parseInt(b.key.split('-')[1], 10);
                return monthA - monthB;
            }).forEach((monthItem) => {
                if (monthItem.children) {
                    monthItem.children.sort((a, b) => {
                        const dayA = Number.parseInt(a.key.split('-')[2], 10);
                        const dayB = Number.parseInt(b.key.split('-')[2], 10);
                        return dayA - dayB;
                    });
                }
            });
        }
        return yearItem;
    });
}

const isNumeric = (str: string) => !Number.isNaN(Number(str)) && !Number.isNaN(Number.parseFloat(str)); ;

function compare(strA: string, strB: string) {
    const aIsNumeric = isNumeric(strA);
    const bIsNumeric = isNumeric(strB);

    if (aIsNumeric && bIsNumeric) {
        return Number.parseFloat(strA) - Number.parseFloat(strB);
    } else if (aIsNumeric && !bIsNumeric) {
        return -1;
    } else if (!aIsNumeric && bIsNumeric) {
        return 1;
    } else {
        return strA.localeCompare(strB);
    }
}
