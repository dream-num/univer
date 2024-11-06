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
import type { ISetRangeValuesMutationParams, ISetWorksheetColWidthMutationParams, ISetWorksheetRowAutoHeightMutationParams, ISetWorksheetRowHeightMutationParams, ISetWorksheetRowIsAutoHeightMutationParams } from '@univerjs/sheets';
import { Disposable, DOCS_NORMAL_EDITOR_UNIT_ID_KEY, DOCS_ZEN_EDITOR_UNIT_ID_KEY, ICommandService, Inject, Injector, IUniverInstanceService, ObjectMatrix, toDisposable, UniverInstanceType } from '@univerjs/core';
import { DocDrawingController } from '@univerjs/docs-drawing';
import { ReplaceSnapshotCommand } from '@univerjs/docs-ui';
import { IDrawingManagerService, IImageIoService, ImageSourceType } from '@univerjs/drawing';
import { IRenderManagerService } from '@univerjs/engine-render';
import { AFTER_CELL_EDIT, getSheetCommandTarget, INTERCEPTOR_POINT, RefRangeService, SetRangeValuesMutation, SetWorksheetColWidthMutation, SetWorksheetRowAutoHeightMutation, SetWorksheetRowHeightMutation, SetWorksheetRowIsAutoHeightMutation, SheetInterceptorService } from '@univerjs/sheets';
import { IEditorBridgeService } from '@univerjs/sheets-ui';
import { getDrawingSizeByCell } from './sheet-drawing-update.controller';

interface IImageCache {
    image: HTMLImageElement;
    disposable: IDisposable;
    row: number;
    col: number;
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
    private _map = new Map<string, IImageCache>();
    private _poistionMap = new Map<number, Map<number, Set<string>>>();

    set(key: string, imageCache: IImageCache) {
        this._map.set(key, imageCache);

        this.update(key, imageCache.row, imageCache.col);
    }

    update(key: string, row: number, col: number) {
        const item = this._map.get(key);
        if (item) {
            const rowMap = this._poistionMap.get(row);
            if (rowMap) {
                const colMap = rowMap.get(col);
                if (colMap) {
                    colMap.delete(key);
                }
            }

            item.row = row;
            item.col = col;
        }

        if (row === -1 || col === -1) {
            return;
        }

        let rowMap = this._poistionMap.get(row);
        if (!rowMap) {
            rowMap = new Map();
        }

        let colMap = rowMap.get(col);
        if (!colMap) {
            colMap = new Set();
        }
        colMap.add(key);
        rowMap.set(col, colMap);
        this._poistionMap.set(row, rowMap);
    }

    delete(key: string) {
        this.update(key, -1, -1);
        const item = this._map.get(key);
        if (item) {
            item.disposable.dispose();
        }
        this._map.delete(key);
    }

    deleteByPosition(row: number, col: number) {
        const colMap = this._poistionMap.get(row)?.get(col);
        if (colMap) {
            colMap.forEach((key) => {
                const item = this._map.get(key);
                if (item) {
                    item.disposable.dispose();
                }
                this._map.delete(key);
            });

            this._poistionMap.get(row)!.delete(col);
        }
    }

    getByKey(key: string) {
        return this._map.get(key);
    }

    private _getByPosition(row: number, col: number) {
        const rowMap = this._poistionMap.get(row);
        if (rowMap) {
            return [...(rowMap.get(col) || [])].map((key) => this._map.get(key)).filter(Boolean) as IImageCache[];
        }
        return [];
    }

    getByPosition(row: number, col: number) {
        return makeRecord(this._getByPosition(row, col));
    }

    getImageCahce(row: number, col: number) {
        return makeImageRecord(this._getByPosition(row, col));
    }
}

export class SheetCellImageController extends Disposable {
    private _imageMaps = new Map<string, Map<string, ImageCacheMap>>();
    private _initedMap = new Map<string, Map<string, boolean>>();

    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IImageIoService private readonly _imageIoService: IImageIoService,
        @Inject(RefRangeService) private readonly _refRangeService: RefRangeService,
        @Inject(SheetInterceptorService) private readonly _sheetInterceptorService: SheetInterceptorService,
        @Inject(IRenderManagerService) private readonly _renderManagerService: IRenderManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(Injector) private readonly _injector: Injector,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @Inject(DocDrawingController) private readonly _docDrawingController: DocDrawingController,
        @Inject(IEditorBridgeService) private readonly _editorBridgeService: IEditorBridgeService
    ) {
        super();

        this._initSetRangeValuesCommandListener();
        this._initInterceptor();
        this._initSheetChange();
        this._initHandleResize();
        this._handleInitEditor();
        this._handleWriteCell();
    }

    private _reRender(unitId: string) {
        const render = this._renderManagerService.getCurrentTypeOfRenderer(UniverInstanceType.UNIVER_SHEET);

        if (render && render.unitId === unitId) {
            render.mainComponent?.makeForceDirty();
        }
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
                            (_, after) => {
                                if (after) {
                                    map.update(key, after.startRow, after.startColumn);
                                } else {
                                    map.delete(key);
                                }
                            });
                        const imageElement = new Image();

                        const item: IImageCache = {
                            image: imageElement,
                            disposable,
                            row,
                            col,
                            key,
                            status: 'loading',
                        };
                        map.set(key, item);

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

    private _initSetRangeValuesCommandListener() {
        this.disposeWithMe(this._commandService.onCommandExecuted((commandInfo) => {
            if (commandInfo.id === SetRangeValuesMutation.id) {
                const params = commandInfo.params as ISetRangeValuesMutationParams;
                const { cellValue, unitId, subUnitId } = params;
                if (!cellValue || !this._initedMap.get(unitId)?.get(subUnitId)) {
                    return;
                }

                const cellMatrux = new ObjectMatrix(cellValue);
                const workbook = this._univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
                const worksheet = workbook?.getSheetBySheetId(subUnitId);
                if (!worksheet) {
                    return;
                }
                cellMatrux.forValue((row, col) => {
                    const value = worksheet.getCellRaw(row, col);
                    cellMatrux.setValue(row, col, value);
                });
                this._handleMatrix(unitId, subUnitId, cellMatrux);
            }
        }));
    }

    private _initInterceptor() {
        this.disposeWithMe(this._sheetInterceptorService.intercept(INTERCEPTOR_POINT.CELL_CONTENT, {
            handler: (cell, context, next) => {
                const { row, col } = context;
                const imageCache = this._imageMaps.get(context.unitId)?.get(context.subUnitId)?.getImageCahce(row, col);

                if (imageCache && cell) {
                    cell.images = imageCache;
                }

                return next(cell);
            },
        }));
    }

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

        this.disposeWithMe(() => {
            map.forEach((disposable) => {
                disposable.dispose();
            });
        });
    }

    private _initHandleResize() {
        this.disposeWithMe(this._commandService.onCommandExecuted((commandInfo) => {
            const rows = new Set<number>();
            const cols = new Set<number>();
            let sheetTarget: Nullable<ReturnType<typeof getSheetCommandTarget>>;

            if (commandInfo.id === SetWorksheetRowHeightMutation.id) {
                const params = commandInfo.params as ISetWorksheetRowHeightMutationParams;
                params.ranges.forEach((range) => {
                    for (let row = range.startRow; row <= range.endRow; row++) {
                        rows.add(row);
                    }
                });
                sheetTarget = getSheetCommandTarget(this._univerInstanceService, { unitId: params.unitId, subUnitId: params.subUnitId });
            } else if (commandInfo.id === SetWorksheetColWidthMutation.id) {
                const params = commandInfo.params as ISetWorksheetColWidthMutationParams;
                params.ranges.forEach((range) => {
                    for (let col = range.startColumn; col <= range.endColumn; col++) {
                        cols.add(col);
                    }
                });
                sheetTarget = getSheetCommandTarget(this._univerInstanceService, { unitId: params.unitId, subUnitId: params.subUnitId });
            } else if (commandInfo.id === SetWorksheetRowIsAutoHeightMutation.id) {
                const params = commandInfo.params as ISetWorksheetRowIsAutoHeightMutationParams;
                params.ranges.forEach((range) => {
                    for (let row = range.startRow; row <= range.endRow; row++) {
                        rows.add(row);
                    }
                });
                sheetTarget = getSheetCommandTarget(this._univerInstanceService, { unitId: params.unitId, subUnitId: params.subUnitId });
            } else if (commandInfo.id === SetWorksheetRowAutoHeightMutation.id) {
                const params = commandInfo.params as ISetWorksheetRowAutoHeightMutationParams;
                sheetTarget = getSheetCommandTarget(this._univerInstanceService, { unitId: params.unitId, subUnitId: params.subUnitId });
                params.rowsAutoHeightInfo.forEach((info) => {
                    rows.add(info.row);
                });
            }

            if (sheetTarget && (rows.size || cols.size)) {
                const cellMatrix = sheetTarget.worksheet.getCellMatrix();
                cellMatrix.forValue((row, col, cellData) => {
                    if (rows.has(row) || cols.has(col)) {
                        const imageCache = this._imageMaps.get(sheetTarget.unitId)?.get(sheetTarget.subUnitId)?.getByPosition(row, +col);
                        // single image need to reisze by cell
                        if (cellData?.p && cellData.p.drawingsOrder?.length === 1 && cellData.p.body?.dataStream.length === 3) {
                            const image = cellData.p.drawings![cellData.p.drawingsOrder[0]]! as IImageData & IDocDrawingBase;
                            const imageSize = getDrawingSizeByCell(
                                this._injector,
                                {
                                    unitId: sheetTarget.unitId,
                                    subUnitId: sheetTarget.subUnitId,
                                    row,
                                    col: +col,
                                },
                                image.transform!.width!,
                                image.transform!.height!
                            );

                            if (imageSize) {
                                image.transform!.width = imageSize.width;
                                image.transform!.height = imageSize.height;
                                image.docTransform!.size.width = imageSize.width;
                                image.docTransform!.size.height = imageSize.height;
                                if (imageCache) {
                                    imageCache[cellData.p.drawingsOrder[0]].image.width = imageSize.width;
                                    imageCache[cellData.p.drawingsOrder[0]].image.height = imageSize.height;
                                }
                            }
                        }
                    }
                });
            }
        }));
    }

    private _handleInitEditor() {
        this.disposeWithMe(
            this._univerInstanceService.unitAdded$.subscribe((unit) => {
                if (unit.type === UniverInstanceType.UNIVER_DOC && unit.getUnitId() === DOCS_NORMAL_EDITOR_UNIT_ID_KEY) {
                    const unitId = unit.getUnitId();
                    this._drawingManagerService.removeDrawingDataForUnit(unitId);
                    this._docDrawingController.loadDrawingDataForUnit(unitId);
                    this._drawingManagerService.initializeNotification(unitId);
                }
            })
        );

        this.disposeWithMe(this._commandService.onCommandExecuted((commandInfo) => {
            if (commandInfo.id === ReplaceSnapshotCommand.id) {
                const params = commandInfo.params;
                const { unitId } = params as { unitId: string };
                if (unitId === DOCS_ZEN_EDITOR_UNIT_ID_KEY) {
                    this._drawingManagerService.removeDrawingDataForUnit(unitId);
                    this._docDrawingController.loadDrawingDataForUnit(unitId);
                    this._drawingManagerService.initializeNotification(unitId);
                }
            }
        }));

        this.disposeWithMe(this._editorBridgeService.visible$.subscribe((param) => {
            if (!param.visible) {
                this._drawingManagerService.removeDrawingDataForUnit(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);
            }
        }));
    }

    private _handleWriteCell() {
        this.disposeWithMe(this._sheetInterceptorService.intercept(AFTER_CELL_EDIT, {
            priority: 9999,
            handler: (cell, context, next) => {
                if (cell?.p?.body?.dataStream.length === 3 && cell.p?.drawingsOrder?.length === 1) {
                    const image = cell.p.drawings![cell.p.drawingsOrder[0]]! as IImageData & IDocDrawingBase;
                    const imageSize = getDrawingSizeByCell(
                        this._injector,
                        {
                            unitId: context.unitId,
                            subUnitId: context.subUnitId,
                            row: context.row,
                            col: context.col,
                        },
                        image.transform!.width!,
                        image.transform!.height!
                    );

                    if (imageSize) {
                        image.transform!.width = imageSize.width;
                        image.transform!.height = imageSize.height;
                        image.docTransform!.size.width = imageSize.width;
                        image.docTransform!.size.height = imageSize.height;
                        image.transform!.left = 0;
                        image.transform!.top = 0;
                        image.docTransform!.positionH.posOffset = 0;
                        image.docTransform!.positionV.posOffset = 0;
                    }
                }
                return next(cell);
            },
        }));
    }
}
