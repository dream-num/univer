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

import type { ICellData, IRange, Nullable } from '@univerjs/core';
import { Disposable, IUniverInstanceService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import type {
    IFindComplete,
    IFindProgressItem,
    IFindQuery,
    IFindReplaceProvider,
    IFindResult,
} from '@univerjs/find-replace';
import { IFindReplaceService } from '@univerjs/find-replace';
import { SelectionManagerService, SheetInterceptorService } from '@univerjs/sheets';
import { getCoordByCell, getSheetObject, SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { type IDisposable, Inject, Injector } from '@wendellhu/redi';

import type { ISheetFindReplaceHighlightShapeProps } from '../views/shapes/find-replace-highlight.shape';
import { SheetFindReplaceHighlightShape } from '../views/shapes/find-replace-highlight.shape';

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

export interface ISheetFindResult extends IFindResult {
    provider: typeof SHEETS_FIND_REPLACE_PROVIDER_NAME;
    range: {
        unitId: string;
        subUnitId: string;
        range: IRange;
    };
}

export class SheetFindResult {
     
}

/**
 * This module is responsible for searching and replacing in the sheets.
 * It also adds the search results to the search view by highlighting them.
 */
class SheetsFindReplaceProvider extends Disposable implements IFindReplaceProvider {
    /**
     * Hold all find results in this kind of univer business (Sheet).
     */
    private readonly _results: IFindResult[] = [];

    private _highlightShapes: Nullable<Set<SheetFindReplaceHighlightShape>>;

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @Inject(SheetInterceptorService) private readonly _sheetInterceptorService: SheetInterceptorService
    ) {
        super();
    }

    async find(query: IFindQuery, onProgress?: ((p: IFindProgressItem) => void) | undefined): Promise<IFindComplete> {
        const results = this._findTheActiveWorksheet(query);
        this._updateFindHighlight(results);
        return results;
    }

    activateFindResult(result: IFindResult): void {}

    // TODO@wzhudev: we should add performance monitoring here

    private _findTheActiveWorksheet(query: IFindQuery): IFindComplete {
        if (!query.text) {
            return {
                results: [],
            };
        }

        const currentWorkbook = this._univerInstanceService.getCurrentUniverSheetInstance();
        const currentWorksheet = currentWorkbook.getActiveSheet();
        const rowCount = currentWorksheet.getRowCount();
        const colCount = currentWorksheet.getColumnCount();
        const unitId = currentWorkbook.getUnitId();
        const subUnitId = currentWorksheet.getSheetId();

        const results: IFindResult[] = [];
        currentWorksheet.getMatrixWithMergedCells(0, 0, rowCount, colCount).forValue((row, col, value) => {
            // We should get value from the view model.
            // TODO: this may change because sometime we need to search the raw value.
            const displayValue = currentWorksheet.getCell(row, col);
            const hit = hitCell(displayValue, query);
            if (hit) {
                const result: ISheetFindResult = {
                    provider: SHEETS_FIND_REPLACE_PROVIDER_NAME,
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

        return {
            results,
        };
    }

    // TODO@wzhudev: should only highlight results on the current activated sheet
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

        const unitId = this._univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
        const currentRender = this._renderManagerService.getRenderById(unitId);
        if (currentRender == null) {
            return;
        }

        const { scene } = currentRender;
        const results = findComplete.results as ISheetFindResult[];
        const highlightShapes = results.map((find, index) => {
            const {} = find;
            const { startColumn, startRow, endColumn, endRow } = find.range.range;
            const startPosition = getCoordByCell(startRow, startColumn, scene, skeleton);
            const endPosition = getCoordByCell(endRow, endColumn, scene, skeleton);
            const { columnHeaderHeightAndMarginTop } = skeleton;
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
