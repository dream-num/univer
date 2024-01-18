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

import type { ICellData, IRange, Nullable, Workbook, Worksheet } from '@univerjs/core';
import { Disposable, ICommandService, IUniverInstanceService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import type { IFindComplete, IFindMatch, IFindQuery, IFindReplaceProvider } from '@univerjs/find-replace';
import { FindModel, IFindReplaceService } from '@univerjs/find-replace';
import { SelectionManagerService, SheetInterceptorService } from '@univerjs/sheets';
import { getCoordByCell, getSheetObject, SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { type IDisposable, Inject, Injector } from '@wendellhu/redi';

import type { ISheetFindReplaceHighlightShapeProps } from '../views/shapes/find-replace-highlight.shape';
import { SheetFindReplaceHighlightShape } from '../views/shapes/find-replace-highlight.shape';
import { isBeforePositionWithRowPriority, isBehindPositionWithRowPriority, isSamePosition } from './utils';

@OnLifecycle(LifecycleStages.Steady, SheetsFindReplaceController)
export class SheetsFindReplaceController extends Disposable implements IDisposable {
    private _provider: SheetsFindReplaceProvider;

    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @IFindReplaceService private readonly _findReplaceService: IFindReplaceService
    ) {
        super();

        this._init();
    }

    override dispose(): void {
        super.dispose();

        this._provider.dispose();
    }

    private _init(): void {
        const provider = this._injector.createInstance(SheetsFindReplaceProvider);
        this._provider = provider;
        this.disposeWithMe(this._findReplaceService.registerFindReplaceProvider(provider));
    }
}

const SHEETS_FIND_REPLACE_PROVIDER_NAME = 'sheets-find-replace-provider';
const FIND_REPLACE_Z_INDEX = 10000;

export interface ISheetCellMatch extends IFindMatch {
    provider: typeof SHEETS_FIND_REPLACE_PROVIDER_NAME;
    range: {
        unitId: string;
        subUnitId: string;
        range: IRange;
    };
}

/**
 * This class executes finding in a workbook and subscribe to the content change event so when its results changes
 * FindReplaceService would know that and update searching results. Also this class in responsible for
 * highlighting matched cells.
 */
export class SheetFindModel extends FindModel {
    private _matchesCount = 0;
    private _matchesPosition = 0; // position starts from 1
    private _matches: ISheetCellMatch[] = [];

    private _highlightShapes: Nullable<Set<SheetFindReplaceHighlightShape>>;

    get unitId(): string {
        return this._workbook.getUnitId();
    }

    get matchesCount(): number {
        return this._matchesCount;
    }

    get matchesPosition(): number {
        return this._matchesPosition;
    }

    get currentMatch(): Nullable<ISheetCellMatch> {
        return this._matchesPosition > 0 ? this._matches[this._matchesPosition - 1] : null;
    }

    constructor(
        private readonly _workbook: Workbook,
        @ICommandService private readonly _commandService: ICommandService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @Inject(SheetInterceptorService) private readonly _sheetInterceptorService: SheetInterceptorService
    ) {
        super();
    }

    override dispose(): void {
        this._highlightShapes?.forEach((shape) => shape.dispose());
    }

    getMatches(): IFindMatch[] {
        return this._matches;
    }

    findInActiveWorksheet(query: IFindQuery): IFindComplete {
        const currentWorksheet = this._workbook.getActiveSheet();
        const unitId = this._workbook.getUnitId();

        const complete = this._findTheActiveWorksheet(currentWorksheet, query, unitId);
        this._matches = complete.results;
        this._matchesCount = complete.results.length;

        return complete;
    }

    private _getStartPosition(): IRange | null {
        if (!this._isSelfFocused()) {
            return null;
        }

        if (this.currentMatch) {
            return this.currentMatch.range.range;
        }

        const selections = this._selectionManagerService.getSelections();
        return selections?.length ? selections[0].range : null;
    }

    override moveToNextMatch(loop = false): ISheetCellMatch | null {
        const startPosition = this._getStartPosition();
        const matchToMove: [ISheetCellMatch, number] | null = startPosition
            ? this._findNextMatch(startPosition, loop)
            : [this._matches[0], 0];

        if (matchToMove) {
            this._matchesPosition = matchToMove[1] + 1;
            return matchToMove[0];
        }

        this._matchesPosition = 0;
        return null;
    }

    override moveToPreviousMatch(loop = false): ISheetCellMatch | null {
        const startPosition = this._getStartPosition();
        const matchToMove: [ISheetCellMatch, number] | null = startPosition
            ? this._findPreviousMatch(startPosition, loop)
            : [this._matches[0], 0];

        if (matchToMove) {
            this._matchesPosition = matchToMove[1] + 1;
            return matchToMove[0];
        }

        this._matchesPosition = 0;
        return null;
    }

    private _findPreviousMatch(range: IRange, loop = false): [ISheetCellMatch, number] | null {
        let index = this._matches.findLastIndex((match) => {
            const matchRange = match.range.range;
            const isBefore = isBeforePositionWithRowPriority(range, matchRange);
            if (!isBefore) {
                return false;
            }

            if (!this.currentMatch) {
                return true;
            }

            return !isSamePosition(range, matchRange);
        });

        if (index === -1 && !this.currentMatch) {
            index = 0;
        }

        if (index === -1 && loop) {
            index = this._matches.length - 1;
        }

        return index > -1 ? [this._matches[index], index] : null;
    }

    private _findNextMatch(range: IRange, loop = false): [ISheetCellMatch, number] | null {
        let index = this._matches.findIndex((match) => {
            const matchRange = match.range.range;
            const isBehind = isBehindPositionWithRowPriority(range, matchRange);
            if (!isBehind) {
                return false;
            }

            if (!this.currentMatch) {
                return true;
            }

            return !isSamePosition(range, matchRange);
        });

        if (index === -1 && !this.currentMatch) {
            index = this._matches.length - 1;
        }

        if (index === -1 && loop) {
            index = 0;
        }

        return index > -1 ? [this._matches[index], index] : null;
    }

    private _findTheActiveWorksheet(
        worksheet: Worksheet,
        query: IFindQuery,
        unitId: string
    ): IFindComplete<ISheetCellMatch> {
        if (!query.text) {
            return {
                results: [],
            };
        }

        const subUnitId = worksheet.getSheetId();
        const rowCount = worksheet.getRowCount();
        const colCount = worksheet.getColumnCount();

        const results: ISheetCellMatch[] = [];
        worksheet.getMatrixWithMergedCells(0, 0, rowCount, colCount).forValue((row, col, value) => {
            // We should get value from the view model.
            // TODO: this may change because sometime we need to search the raw value.
            const displayValue = worksheet.getCell(row, col);
            const hit = hitCell(displayValue, query);
            if (hit) {
                const result: ISheetCellMatch = {
                    provider: SHEETS_FIND_REPLACE_PROVIDER_NAME,
                    unitId,
                    range: {
                        unitId,
                        subUnitId,
                        range: {
                            startRow: row,
                            startColumn: col,
                            endColumn: col + (value.rowSpan ?? 0),
                            endRow: row + (value.colSpan ?? 0),
                        },
                    },
                };

                results.push(result);
            }
        });

        const complete = {
            results,
        };

        this._updateFindHighlight(complete);
        return complete;
    }

    private _updateFindHighlight(findComplete: IFindComplete): void {
        this._highlightShapes?.forEach((shape) => shape.dispose());

        const skeleton = this._sheetSkeletonManagerService.getCurrent()?.skeleton;
        if (!skeleton) {
            return;
        }

        const sheetObjects = this._getSheetObject();
        if (!sheetObjects) {
            return;
        }

        const unitId = this._workbook.getUnitId();
        const currentRender = this._renderManagerService.getRenderById(unitId);
        if (currentRender == null) {
            return;
        }

        const { scene } = currentRender;
        const results = findComplete.results as ISheetCellMatch[];
        const highlightShapes = results.map((find, index) => {
            const { startColumn, startRow, endColumn, endRow } = find.range.range;
            const startPosition = getCoordByCell(startRow, startColumn, scene, skeleton);
            const endPosition = getCoordByCell(endRow, endColumn, scene, skeleton);
            const { startX, startY } = startPosition;
            const { endX, endY } = endPosition;
            const width = endX - startX;
            const height = endY - startY;

            // TODO@wzhudev: we may need an edge detection to decide to put label on the top or on the bottom of the rect.
            const props: ISheetFindReplaceHighlightShapeProps = {
                left: startX,
                top: startY,
                width,
                height,
                evented: false,
            };

            return new SheetFindReplaceHighlightShape(`find-highlight-${index}`, props);
        });

        // TODO@wzhudev: there is a change that re-render is not triggered
        scene.addObjects(highlightShapes, FIND_REPLACE_Z_INDEX);
        this._highlightShapes = new Set(highlightShapes);
    }

    private _getSheetObject() {
        return getSheetObject(this._univerInstanceService, this._renderManagerService);
    }

    private _isSelfFocused(): boolean {
        return this._univerInstanceService.getFocusedUniverInstance()?.getUnitId() === this._workbook.getUnitId();
    }
}

/**
 * This module is responsible for searching and replacing in the sheets.
 * It also adds the search results to the search view by highlighting them.
 */
class SheetsFindReplaceProvider extends Disposable implements IFindReplaceProvider {
    /**
     * Hold all find results in this kind of univer business instances (Workbooks).
     */
    private readonly _findModels: SheetFindModel[] = [];
    private readonly _findModelsByUnitId = new Map<string, SheetFindModel>();

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(Injector) private readonly _injector: Injector
    ) {
        super();
    }

    async find(query: IFindQuery): Promise<SheetFindModel[]> {
        this._cancelFinding();

        const currentWorkbook = this._univerInstanceService.getCurrentUniverSheetInstance();
        if (currentWorkbook) {
            const sheetFind = this._injector.createInstance(SheetFindModel, currentWorkbook);
            this._findModels.push(sheetFind);
            this._findModelsByUnitId.set(currentWorkbook.getUnitId(), sheetFind);

            sheetFind.findInActiveWorksheet(query);
            return [sheetFind];
        }

        return [];
    }

    cancel(): void {
        this._cancelFinding();
    }

    private _cancelFinding(): void {
        this._findModels.forEach((model) => model.dispose());
        this._findModelsByUnitId.clear();
    }
}

/**
 * This function determines if a cell's content matches what is looked for.
 * @param value
 * @param query
 * @returns
 */
function hitCell(value: Nullable<ICellData>, query: IFindQuery): boolean {
    if (value == null) {
        return false;
    }

    const { v } = value;

    if (typeof v === 'string') {
        return v.toLowerCase().includes(query.text.toLowerCase());
    }

    // TODO@wzhudev: there are a lot of implementation details.

    return false;
}
