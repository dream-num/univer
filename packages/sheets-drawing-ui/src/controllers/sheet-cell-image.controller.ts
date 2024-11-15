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

import type { ICellData, IDocDrawingBase, IRange, Nullable } from '@univerjs/core';
import type { IImageData } from '@univerjs/drawing';
import type { IAddWorksheetMergeMutationParams, IRemoveWorksheetMergeMutationParams, ISetWorksheetColWidthMutationParams, ISetWorksheetRowAutoHeightMutationParams, ISetWorksheetRowHeightMutationParams, ISetWorksheetRowIsAutoHeightMutationParams, ISheetLocationBase } from '@univerjs/sheets';
import { Disposable, DOCS_NORMAL_EDITOR_UNIT_ID_KEY, ICommandService, Inject, Injector, IUniverInstanceService, Range } from '@univerjs/core';
import { DocDrawingController } from '@univerjs/docs-drawing';
import { IDrawingManagerService, IImageIoService } from '@univerjs/drawing';
import { IRenderManagerService } from '@univerjs/engine-render';
import { AddWorksheetMergeMutation, AFTER_CELL_EDIT, getSheetCommandTarget, INTERCEPTOR_POINT, RefRangeService, RemoveWorksheetMergeMutation, SetWorksheetColWidthMutation, SetWorksheetRowAutoHeightMutation, SetWorksheetRowHeightMutation, SetWorksheetRowIsAutoHeightMutation, SheetInterceptorService } from '@univerjs/sheets';
import { IEditorBridgeService } from '@univerjs/sheets-ui';
import { SheetCellCacheManagerService } from '../services/sheet-cell-cache-manager.service';
import { getDrawingSizeByCell } from './sheet-drawing-update.controller';

export function resizeImageByCell(injector: Injector, location: ISheetLocationBase, cell: Nullable<ICellData>) {
    if (cell?.p?.body?.dataStream.length === 3 && cell.p?.drawingsOrder?.length === 1) {
        const image = cell.p.drawings![cell.p.drawingsOrder[0]]! as IImageData & IDocDrawingBase;
        const imageSize = getDrawingSizeByCell(
            injector,
            {
                unitId: location.unitId,
                subUnitId: location.subUnitId,
                row: location.row,
                col: location.col,
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
            return true;
        }
    }

    return false;
}

export class SheetCellImageController extends Disposable {
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
        @Inject(IEditorBridgeService) private readonly _editorBridgeService: IEditorBridgeService,
        @Inject(SheetCellCacheManagerService) private readonly _sheetCellCacheManagerService: SheetCellCacheManagerService
    ) {
        super();

        this._initInterceptor();
        this._initHandleResize();
        this._handleInitEditor();
        this._handleWriteCell();
    }

    private _initInterceptor() {
        this.disposeWithMe(this._sheetInterceptorService.intercept(INTERCEPTOR_POINT.CELL_CONTENT, {
            handler: (cell, context, next) => {
                const { row, col } = context;
                const imageCache = this._sheetCellCacheManagerService.getImageElementByPosition(context.unitId, context.subUnitId, row, col);

                if (imageCache && cell) {
                    cell.images = imageCache;
                }

                return next(cell);
            },
        }));
    }

    private _initHandleResize() {
        this.disposeWithMe(this._commandService.onCommandExecuted((commandInfo) => {
            let sheetTarget: Nullable<ReturnType<typeof getSheetCommandTarget>>;
            let ranges: IRange[] = [];
            if (commandInfo.id === SetWorksheetRowHeightMutation.id) {
                const params = commandInfo.params as ISetWorksheetRowHeightMutationParams;
                ranges = params.ranges;
                sheetTarget = getSheetCommandTarget(this._univerInstanceService, { unitId: params.unitId, subUnitId: params.subUnitId });
            } else if (commandInfo.id === SetWorksheetColWidthMutation.id) {
                const params = commandInfo.params as ISetWorksheetColWidthMutationParams;
                ranges = params.ranges;
                sheetTarget = getSheetCommandTarget(this._univerInstanceService, { unitId: params.unitId, subUnitId: params.subUnitId });
            } else if (commandInfo.id === SetWorksheetRowIsAutoHeightMutation.id) {
                const params = commandInfo.params as ISetWorksheetRowIsAutoHeightMutationParams;
                ranges = params.ranges;
                sheetTarget = getSheetCommandTarget(this._univerInstanceService, { unitId: params.unitId, subUnitId: params.subUnitId });
            } else if (commandInfo.id === SetWorksheetRowAutoHeightMutation.id) {
                const params = commandInfo.params as ISetWorksheetRowAutoHeightMutationParams;
                sheetTarget = getSheetCommandTarget(this._univerInstanceService, { unitId: params.unitId, subUnitId: params.subUnitId });
                ranges = params.rowsAutoHeightInfo.map((info) => ({
                    startRow: info.row,
                    endRow: info.row,
                    startColumn: 0,
                    endColumn: 9999,
                }));
            } else if (commandInfo.id === AddWorksheetMergeMutation.id) {
                const params = commandInfo.params as IAddWorksheetMergeMutationParams;
                ranges = params.ranges;
                sheetTarget = getSheetCommandTarget(this._univerInstanceService, { unitId: params.unitId, subUnitId: params.subUnitId });
            } else if (commandInfo.id === RemoveWorksheetMergeMutation.id) {
                const params = commandInfo.params as IRemoveWorksheetMergeMutationParams;
                ranges = params.ranges;
                sheetTarget = getSheetCommandTarget(this._univerInstanceService, { unitId: params.unitId, subUnitId: params.subUnitId });
            }

            if (sheetTarget && (ranges.length)) {
                const cellMatrix = sheetTarget.worksheet.getCellMatrix();
                ranges.forEach((range) => {
                    const normalizedRange = Range.transformRange(range, sheetTarget.worksheet);
                    for (let row = normalizedRange.startRow; row <= normalizedRange.endRow; row++) {
                        for (let col = normalizedRange.startColumn; col <= normalizedRange.endColumn; col++) {
                            resizeImageByCell(this._injector, { unitId: sheetTarget.unitId, subUnitId: sheetTarget.subUnitId, row, col }, cellMatrix.getValue(row, col));
                        }
                    }
                });
            }
        }));
    }

    private _handleInitEditor() {
        this.disposeWithMe(this._editorBridgeService.visible$.subscribe((param) => {
            if (!param.visible) {
                this._drawingManagerService.removeDrawingDataForUnit(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);
            } else if (param.visible) {
                this._drawingManagerService.removeDrawingDataForUnit(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);
                this._docDrawingController.loadDrawingDataForUnit(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);
                this._drawingManagerService.initializeNotification(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);
            }
        }));
    }

    private _handleWriteCell() {
        this.disposeWithMe(this._sheetInterceptorService.intercept(AFTER_CELL_EDIT, {
            priority: 9999,
            handler: (cell, context, next) => {
                resizeImageByCell(this._injector, { unitId: context.unitId, subUnitId: context.subUnitId, row: context.row, col: context.col }, cell);
                return next(cell);
            },
        }));
    }
}
