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
import { Disposable, DOCS_NORMAL_EDITOR_UNIT_ID_KEY, DOCS_ZEN_EDITOR_UNIT_ID_KEY, ICommandService, Inject, Injector, InterceptorEffectEnum, IUniverInstanceService, Range } from '@univerjs/core';
import { DocDrawingController } from '@univerjs/docs-drawing';
import { type IReplaceSnapshotCommandParams, ReplaceSnapshotCommand } from '@univerjs/docs-ui';
import { IDrawingManagerService } from '@univerjs/drawing';
import { AddWorksheetMergeMutation, AFTER_CELL_EDIT, getSheetCommandTarget, InterceptCellContentPriority, INTERCEPTOR_POINT, RemoveWorksheetMergeMutation, SetWorksheetColWidthMutation, SetWorksheetRowAutoHeightMutation, SetWorksheetRowHeightMutation, SetWorksheetRowIsAutoHeightMutation, SheetInterceptorService } from '@univerjs/sheets';
import { IEditorBridgeService } from '@univerjs/sheets-ui';
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
            image.docTransform!.size.width!,
            image.docTransform!.size.height!,
            image.docTransform!.angle
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

            cell.p.documentStyle.pageSize!.width = Infinity;
            cell.p.documentStyle.pageSize!.height = Infinity;
            return true;
        }
    }

    return false;
}

export class SheetCellImageController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(SheetInterceptorService) private readonly _sheetInterceptorService: SheetInterceptorService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(Injector) private readonly _injector: Injector,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @Inject(DocDrawingController) private readonly _docDrawingController: DocDrawingController,
        @Inject(IEditorBridgeService) private readonly _editorBridgeService: IEditorBridgeService
    ) {
        super();

        this._initHandleResize();
        this._handleInitEditor();
        this._handleWriteCell();
        this._initCellContentInterceptor();
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
                ranges.forEach((range) => {
                    const normalizedRange = Range.transformRange(range, sheetTarget.worksheet);
                    for (let row = normalizedRange.startRow; row <= normalizedRange.endRow; row++) {
                        for (let col = normalizedRange.startColumn; col <= normalizedRange.endColumn; col++) {
                            resizeImageByCell(this._injector, { unitId: sheetTarget.unitId, subUnitId: sheetTarget.subUnitId, row, col }, sheetTarget.worksheet.getCellRaw(row, col));
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

        this.disposeWithMe(this._commandService.onCommandExecuted((commandInfo) => {
            if (commandInfo.id === ReplaceSnapshotCommand.id) {
                const params = commandInfo.params as IReplaceSnapshotCommandParams;
                const unitId = params.unitId;
                if (unitId === DOCS_ZEN_EDITOR_UNIT_ID_KEY) {
                    this._drawingManagerService.removeDrawingDataForUnit(DOCS_ZEN_EDITOR_UNIT_ID_KEY);
                    this._docDrawingController.loadDrawingDataForUnit(DOCS_ZEN_EDITOR_UNIT_ID_KEY);
                    this._drawingManagerService.initializeNotification(DOCS_ZEN_EDITOR_UNIT_ID_KEY);
                }
            }
        }));
    }

    private _handleWriteCell() {
        this.disposeWithMe(this._sheetInterceptorService.writeCellInterceptor.intercept(AFTER_CELL_EDIT, {
            priority: 9999,
            handler: (cell, context, next) => {
                resizeImageByCell(this._injector, { unitId: context.unitId, subUnitId: context.subUnitId, row: context.row, col: context.col }, cell);
                return next(cell);
            },
        }));
    }

    private _initCellContentInterceptor() {
        this.disposeWithMe(
            this._sheetInterceptorService.intercept(
                INTERCEPTOR_POINT.CELL_CONTENT,
                {
                    effect: InterceptorEffectEnum.Style,
                    priority: InterceptCellContentPriority.CELL_IMAGE,
                    handler: (cell, pos, next) => {
                        if (cell?.p && cell.p.drawingsOrder?.length) {
                            if (!cell.interceptorStyle) {
                                cell.interceptorStyle = {};
                            }

                            cell.interceptorStyle.tr = { a: 0 };
                        }

                        return next(cell);
                    },
                }
            )
        );
    }
}
