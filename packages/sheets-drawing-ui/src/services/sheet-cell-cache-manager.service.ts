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

import type { ICellData, IDisposable, IDocDrawingBase, Nullable, UnitModel, Workbook } from '@univerjs/core';
import type { IImageData } from '@univerjs/drawing';
import type { IReorderRangeMutationParams, ISetRangeValuesMutationParams } from '@univerjs/sheets';
import { Disposable, ICommandService, Inject, IUniverInstanceService, ObjectMatrix, Range, toDisposable, UniverInstanceType } from '@univerjs/core';
import { IImageIoService, ImageSourceType } from '@univerjs/drawing';
import { IRenderManagerService } from '@univerjs/engine-render';
import { RefRangeService, ReorderRangeMutation, SetRangeValuesMutation } from '@univerjs/sheets';

interface IImageCache {
    image: HTMLImageElement;
    disposable: IDisposable;
    key: string;
    status: 'loading' | 'loaded' | 'error';
}

function makeImageRecord(imageCache: IImageCache[]) {
    const record: Record<string, HTMLImageElement> = {};

    imageCache.forEach((item) => {
        record[item.key] = item.image;
    });

    return record;
}

function makeRecord(imageCache: IImageCache[]) {
    const record: Record<string, IImageCache> = {};

    imageCache.forEach((item) => {
        record[item.key] = item;
    });

    return record;
}

class ImageCacheMap {
    private _poistionMap = new ObjectMatrix<Nullable<Map<string, IImageCache>>>();

    set(row: number, col: number, cache: IImageCache) {
        let map = this._poistionMap.getValue(row, col);
        if (!map) {
            map = new Map();
            this._poistionMap.setValue(row, col, map);
        }
        map.set(cache.key, cache);
    }

    updatePosition(originRow: number, originCol: number, row: number, col: number) {
        const map = this._poistionMap.getValue(originRow, originCol);
        if (map) {
            this._poistionMap.setValue(row, col, map);
        }
    }

    deleteByPosition(row: number, col: number) {
        this._poistionMap.realDeleteValue(row, col);
    }

    private _getByPosition(row: number, col: number) {
        const map = this._poistionMap.getValue(row, col);
        if (map) {
            return Array.from(map.values());
        }
        return [];
    }

    getByPosition(row: number, col: number) {
        return makeRecord(this._getByPosition(row, col));
    }

    getImageCahce(row: number, col: number) {
        return makeImageRecord(this._getByPosition(row, col));
    }

    getByKey(row: number, col: number, key: string) {
        return this._poistionMap.getValue(row, col)?.get(key)?.image;
    }
}

// TODO: @weird94, this cache service should decouple with the render,
// need to remove and implement in render process after some method are provided by @lumix
export class SheetCellCacheManagerService extends Disposable {
    private _imageMaps = new Map<string, Map<string, ImageCacheMap>>();
    private _initedMap = new Map<string, Map<string, boolean>>();

    constructor(
        @Inject(RefRangeService) private readonly _refRangeService: RefRangeService,
        @Inject(IImageIoService) private readonly _imageIoService: IImageIoService,
        @Inject(IUniverInstanceService) private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(IRenderManagerService) private readonly _renderManagerService: IRenderManagerService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();
        this._initSheetChange();
        this._initSetRangeValuesCommandListener();
    }

    private _ensureMap(unitId: string, subUnitId: string) {
        let unitMap = this._imageMaps.get(unitId);
        if (!unitMap) {
            unitMap = new Map();
            this._imageMaps.set(unitId, unitMap);
        }

        let subUnitMap = unitMap.get(subUnitId);
        if (!subUnitMap) {
            subUnitMap = new ImageCacheMap();
            unitMap.set(subUnitId, subUnitMap);
        }
        return subUnitMap;
    }

    private _initSetRangeValuesCommandListener() {
        this.disposeWithMe(this._commandService.onCommandExecuted((commandInfo) => {
            if (commandInfo.id === SetRangeValuesMutation.id) {
                const params = commandInfo.params as ISetRangeValuesMutationParams;
                const { cellValue, unitId, subUnitId } = params;
                if (!cellValue || !this._initedMap.get(unitId)?.get(subUnitId)) {
                    return;
                }

                const cellMatrix = new ObjectMatrix<Nullable<ICellData>>();
                const workbook = this._univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
                const worksheet = workbook?.getSheetBySheetId(subUnitId);
                if (!worksheet) {
                    return;
                }

                (new ObjectMatrix(cellValue)).forValue((row, col) => {
                    const value = worksheet.getCellRaw(row, col);
                    cellMatrix.setValue(row, col, value);
                });
                this._handleMatrix(unitId, subUnitId, cellMatrix);
            }

            if (commandInfo.id === ReorderRangeMutation.id) {
                const params = commandInfo.params as IReorderRangeMutationParams;
                const { unitId, subUnitId, range } = params;

                const cellMatrix = new ObjectMatrix<Nullable<ICellData>>();
                const workbook = this._univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
                const worksheet = workbook?.getSheetBySheetId(subUnitId);
                if (!worksheet) {
                    return;
                }

                Range.foreach(range, (row, col) => {
                    const value = worksheet.getCellRaw(row, col);
                    cellMatrix.setValue(row, col, value);
                });

                this._handleMatrix(unitId, subUnitId, cellMatrix);
            }
        }));
    }

    /**
     * Initialize the sheet change event
     */
    private _initSheetChange() {
        const map = new Map<string, IDisposable>();
        const hanldeUnit = (unit: UnitModel<object, number>) => {
            if (unit.type === UniverInstanceType.UNIVER_SHEET) {
                const workbook = unit as Workbook;
                this._initSubSheet(workbook.getUnitId(), workbook.getActiveSheet().getSheetId());

                map.set(
                    workbook.getUnitId(),
                    toDisposable(workbook.activeSheet$.subscribe((sheet) => {
                        if (sheet) {
                            this._initSubSheet(workbook.getUnitId(), sheet.getSheetId());
                        }
                    }))
                );
            }
        };

        this._univerInstanceService.getAllUnitsForType<Workbook>(UniverInstanceType.UNIVER_SHEET).forEach(hanldeUnit);
        this.disposeWithMe(this._univerInstanceService.unitAdded$.subscribe(hanldeUnit));
        this.disposeWithMe(this._univerInstanceService.unitDisposed$.subscribe((unit) => {
            if (unit.type === UniverInstanceType.UNIVER_SHEET) {
                map.get(unit.getUnitId())?.dispose();
                map.delete(unit.getUnitId());
            }
        }));

        this.disposeWithMe(() => {
            map.forEach((disposable) => {
                disposable.dispose();
            });
            map.clear();
        });
    }

    private _initSubSheet(unitId: string, subUnitId: string) {
        if (this._initedMap.get(unitId)?.get(subUnitId)) {
            return;
        }

        const workbook = this._univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
        if (!workbook) {
            return;
        }

        const subSheet = workbook.getSheetBySheetId(subUnitId);
        if (!subSheet) {
            return;
        }
        const unitMap = this._initedMap.get(unitId) || new Map<string, boolean>();
        unitMap.set(subUnitId, true);
        this._initedMap.set(unitId, unitMap);

        const matrix = subSheet.getCellMatrix();
        this._handleMatrix(unitId, subUnitId, matrix);
    }

    private _reRender(unitId: string) {
        const render = this._renderManagerService.getCurrentTypeOfRenderer(UniverInstanceType.UNIVER_SHEET);

        if (render && render.unitId === unitId) {
            render.mainComponent?.makeForceDirty();
        }
    }

    private _handleMatrix(unitId: string, subUnitId: string, matrix: ObjectMatrix<Nullable<ICellData>>) {
        const map = this._ensureMap(unitId, subUnitId);
        matrix.forValue((row, col, cell) => {
            if (cell?.p && cell.p.drawingsOrder?.length) {
                const imageCache = map.getByPosition(row, col);
                cell.p.drawingsOrder.forEach(async (key) => {
                    const image = imageCache[key];
                    if (!image) {
                        const drawing = cell.p!.drawings![key]! as IImageData & IDocDrawingBase;
                        const disposable = this._refRangeService.watchRange(
                            unitId,
                            subUnitId,
                            {
                                startRow: row,
                                endRow: row,
                                startColumn: col,
                                endColumn: col,
                            },
                            (before, after) => {
                                if (after) {
                                    map.updatePosition(before.startRow, before.startColumn, after.startRow, after.startColumn);
                                } else {
                                    map.deleteByPosition(before.startRow, before.startColumn);
                                }
                            });
                        const imageElement = new Image();

                        const item: IImageCache = {
                            image: imageElement,
                            disposable,
                            key,
                            status: 'loading',
                        };
                        map.set(row, col, item);

                        imageElement.width = drawing.transform?.width || 0;
                        imageElement.height = drawing.transform?.height || 0;
                        if (drawing.imageSourceType === ImageSourceType.UUID) {
                            try {
                                imageElement.src = await this._imageIoService.getImage(drawing.source);
                            } catch (error) {
                                console.error(error);
                            }
                        } else {
                            imageElement.src = drawing.source;
                        }

                        imageElement.onload = () => {
                            item.status = 'loaded';
                            this._reRender(unitId);
                        };
                        imageElement.onerror = () => {
                            item.status = 'error';
                        };
                    }
                });

                return;
            }

            map.deleteByPosition(row, col);
        });
    }

    getImageCache(unitId: string, subUnitId: string, row: number, col: number) {
        return this._imageMaps.get(unitId)?.get(subUnitId)?.getByPosition(row, +col);
    }

    getImageElementByPosition(unitId: string, subUnitId: string, row: number, col: number) {
        return this._imageMaps.get(unitId)?.get(subUnitId)?.getImageCahce(row, col);
    }

    getImageElementByKey(unitId: string, subUnitId: string, row: number, col: number, key: string) {
        return this._imageMaps.get(unitId)?.get(subUnitId)?.getByKey(row, col, key);
    }
}
