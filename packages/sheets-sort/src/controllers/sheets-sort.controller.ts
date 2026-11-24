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

import { Disposable, ICommandService, Inject, RegionService } from '@univerjs/core';
import type { IRowComparator, IRowCompareFn } from '../commands/commands/sheets-sort.command';
import type { IRegionTextComparer, TextColumnComparer } from './text-comparer';
import { SortRangeCommand } from '../commands/commands/sheets-sort.command';
import { SortType } from '../services/interface';
import { SheetsSortService } from '../services/sheets-sort.service';
import { createRegionTextComparer } from './text-comparer';
import { compareCells, compareRankedCells, getSortRank, readNumber, readText, SortRank } from './utils';

type ColumnCompareFn = (type: SortType, a: IRowComparator, b: IRowComparator) => number;

export class SheetsSortController extends Disposable {
    private _textComparer: IRegionTextComparer;

    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(SheetsSortService) private readonly _sortService: SheetsSortService,
        @Inject(RegionService) private readonly _regionService: RegionService
    ) {
        super();
        this._textComparer = createRegionTextComparer(this._regionService.getCurrentRegion());
        this._initCommands();
        this._initTextComparer();
        this._registerCompareFns();
    }

    private _initTextComparer(): void {
        this.disposeWithMe(this._regionService.currentRegion$.subscribe((region) => {
            this._textComparer = createRegionTextComparer(region);
        }));
    }

    private _initCommands(): void {
        [
            SortRangeCommand,
        ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
    }

    private _registerCompareFns(): void {
        this._sortService.registerCompareFn(
            (type, a, b) => compareCells(type, a, b, this._textComparer.compare),
            (rows) => this._prepareCompareFn(rows)
        );
    }

    private _prepareCompareFn(rows: readonly IRowComparator[]): IRowCompareFn {
        const comparer = this._textComparer;
        const columns: Array<ColumnCompareFn | undefined> = [];
        const secondaryTextComparisons: number[] = [];
        const prepareAfter = Math.ceil(Math.sqrt(rows.length));

        return (type, a, b, key) => {
            let column = columns[key];
            if (column) {
                return column(type, a, b);
            }

            if (key > 0) {
                const aCell = a.value[key];
                const bCell = b.value[key];
                const rankA = getSortRank(aCell);
                const rankB = getSortRank(bCell);
                if (rankA !== SortRank.TEXT || rankB !== SortRank.TEXT) {
                    return compareRankedCells(type, aCell, bCell, rankA, rankB, comparer.compare);
                }
                // A few tied primary keys do not justify preparing an entire secondary column.
                const comparisons = (secondaryTextComparisons[key] ?? 0) + 1;
                secondaryTextComparisons[key] = comparisons;
                if (comparisons < prepareAfter) {
                    return compareRankedCells(type, aCell, bCell, rankA, rankB, comparer.compare);
                }
            }
            column = columns[key] = this._prepareColumn(rows, key, comparer);
            return column(type, a, b);
        };
    }

    private _prepareColumn(rows: readonly IRowComparator[], key: number, comparer: IRegionTextComparer): ColumnCompareFn {
        const ranks: SortRank[] = [];
        const rowTexts: Array<string | undefined> = [];
        let allNumeric = true;
        let textCount = 0;
        for (const row of rows) {
            const cell = row.value[key];
            const rank = getSortRank(cell);
            ranks[row.position] = rank;
            if (rank !== SortRank.NUMBER) {
                allNumeric = false;
            }
            if (rank === SortRank.TEXT) {
                rowTexts[row.position] = readText(cell);
                textCount++;
            }
        }

        if (allNumeric) {
            const numbers = new Float64Array(rows.length);
            for (const row of rows) {
                numbers[row.position] = readNumber(row.value[key]);
            }
            return (type, a, b) => {
                const order = Math.sign(numbers[a.position] - numbers[b.position]);
                return type === SortType.ASC ? order : -order;
            };
        }

        if (textCount === rows.length) {
            const compareText = comparer.prepareColumn(rowTexts);
            return (type, a, b) => {
                const order = compareText(a.position, b.position);
                return type === SortType.ASC ? order : -order;
            };
        }

        let compareText: TextColumnComparer | undefined;
        return (type, a, b) => {
            const rankA = ranks[a.position];
            const rankB = ranks[b.position];
            if (rankA === SortRank.TEXT && rankB === SortRank.TEXT) {
                compareText ??= comparer.prepareColumn(rowTexts);
                const order = compareText(a.position, b.position);
                return type === SortType.ASC ? order : -order;
            }
            return compareRankedCells(type, a.value[key], b.value[key], rankA, rankB, comparer.compare);
        };
    }
}
