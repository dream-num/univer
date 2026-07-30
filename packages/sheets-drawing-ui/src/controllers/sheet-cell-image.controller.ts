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

import type { ICellData, IDocDrawingBase, Nullable } from '@univerjs/core';
import type { IImageData } from '@univerjs/drawing';
import type { ISheetLocationBase } from '@univerjs/sheets';
import { Disposable, DOCS_NORMAL_EDITOR_UNIT_ID_KEY, Inject, Injector, InterceptorEffectEnum } from '@univerjs/core';
import { DocDrawingController } from '@univerjs/docs-drawing';
import { IDrawingManagerService } from '@univerjs/drawing';
import { InterceptCellContentPriority, INTERCEPTOR_POINT, isCellImage, SheetInterceptorService } from '@univerjs/sheets';
import { IEditorBridgeService } from '@univerjs/sheets-ui';
import { getDrawingSizeByCell } from './sheet-drawing-update.controller';

export function resizeImageByCell(injector: Injector, location: ISheetLocationBase, cell: Nullable<ICellData>) {
    const documentData = cell?.p;
    const drawingId = isCellImage(documentData) && documentData?.drawingsOrder?.length === 1 ? documentData.drawingsOrder[0] : undefined;
    const image = drawingId ? documentData?.drawings?.[drawingId] as IImageData & IDocDrawingBase : undefined;

    if (image && documentData) {
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

            documentData.documentStyle.pageSize!.width = Infinity;
            documentData.documentStyle.pageSize!.height = Infinity;
            return true;
        }
    }

    return false;
}

export class SheetCellImageController extends Disposable {
    constructor(
        @Inject(SheetInterceptorService) private readonly _sheetInterceptorService: SheetInterceptorService,
        @Inject(Injector) private readonly _injector: Injector,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @Inject(DocDrawingController) private readonly _docDrawingController: DocDrawingController,
        @Inject(IEditorBridgeService) private readonly _editorBridgeService: IEditorBridgeService
    ) {
        super();

        this._handleInitEditor();
        this._initCellContentInterceptor();
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

    private _initCellContentInterceptor() {
        this.disposeWithMe(
            this._sheetInterceptorService.intercept(
                INTERCEPTOR_POINT.CELL_CONTENT,
                {
                    effect: InterceptorEffectEnum.Style,
                    priority: InterceptCellContentPriority.CELL_IMAGE,
                    handler: (cell, pos, next) => {
                        if (cell && isCellImage(cell.p)) {
                            if (cell === pos.rawData) {
                                cell = { ...pos.rawData };
                            }

                            if (!cell.interceptorStyle) {
                                cell.interceptorStyle = {};
                            }
                            cell.interceptorStyle.tr = { a: 0 };

                            resizeImageByCell(this._injector, { unitId: pos.unitId, subUnitId: pos.subUnitId, row: pos.row, col: pos.col }, cell);
                        }

                        return next(cell);
                    },
                }
            )
        );
    }
}
