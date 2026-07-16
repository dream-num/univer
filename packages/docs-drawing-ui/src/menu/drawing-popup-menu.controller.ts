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

import type { DocumentDataModel, IDisposable, Nullable } from '@univerjs/core';
import type { IDocDrawing } from '@univerjs/docs-drawing';
import type { BaseObject, Scene } from '@univerjs/engine-render';
import {
    DrawingTypeEnum,
    FOCUSING_COMMON_DRAWINGS,
    ICommandService,
    IContextService,
    Inject,
    isInternalEditorID,
    IUniverInstanceService,
    RxDisposable,
    UniverInstanceType,
} from '@univerjs/core';
import { IDocDrawingAdapterService, RemoveDocDrawingCommand } from '@univerjs/docs-drawing';
import { DocCanvasPopManagerService } from '@univerjs/docs-ui';
import { IDrawingManagerService } from '@univerjs/drawing';
import {
    COMPONENT_IMAGE_POPUP_MENU,
    ImageCropperObject,
    ImageResetSizeOperation,
    OpenImageCropOperation,
} from '@univerjs/drawing-ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import { takeUntil } from 'rxjs';
import { EditDocDrawingOperation } from '../commands/operations/edit-doc-drawing.operation';
import { SidebarDocDrawingOperation } from '../commands/operations/open-drawing-panel.operation';
import { DocDrawingFloatingToolbarAdapterService } from '../services/doc-drawing-floating-toolbar-adapter.service';

export class DocDrawingPopupMenuController extends RxDisposable {
    private _initImagePopupMenu = new Set<string>();
    private _disposePopups: IDisposable[] = [];
    private _isDrawingPanelOpen = false;

    constructor(
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @Inject(DocCanvasPopManagerService) private readonly _canvasPopManagerService: DocCanvasPopManagerService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IContextService private readonly _contextService: IContextService,
        @IDocDrawingAdapterService private readonly _drawingAdapterService: IDocDrawingAdapterService,
        @Inject(DocDrawingFloatingToolbarAdapterService) private readonly _floatingToolbarAdapterService: DocDrawingFloatingToolbarAdapterService,
        @ICommandService private readonly _commandService: ICommandService

    ) {
        super();

        this._init();
    }

    private _init(): void {
        this.disposeWithMe(
            this._commandService.onCommandExecuted((command) => {
                if (command.id === EditDocDrawingOperation.id) {
                    this._isDrawingPanelOpen = true;
                    this._clearPopups();
                }
                if (command.id === SidebarDocDrawingOperation.id) {
                    const params = command.params as { value?: string } | undefined;
                    this._isDrawingPanelOpen = params?.value === 'open';
                    if (this._isDrawingPanelOpen) {
                        this._clearPopups();
                    }
                }
            })
        );
        this.disposeWithMe(
            this._drawingManagerService.focus$.subscribe((params) => {
                if (params.length === 0) {
                    this._isDrawingPanelOpen = false;
                }
            })
        );

        this.disposeWithMe(
            this._univerInstanceService.getCurrentTypeOfUnit$<DocumentDataModel>(UniverInstanceType.UNIVER_DOC).pipe(takeUntil(this.dispose$)).subscribe((documentDataModel) => this._create(documentDataModel))
        );

        this.disposeWithMe(
            this._univerInstanceService.getTypeOfUnitDisposed$<DocumentDataModel>(UniverInstanceType.UNIVER_DOC).pipe(takeUntil(this.dispose$)).subscribe((documentDataModel) => this._dispose(documentDataModel))
        );

        this._univerInstanceService.getAllUnitsForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC).forEach((documentDataModel) => this._create(documentDataModel));
    }

    private _dispose(documentDataModel: DocumentDataModel) {
        const unitId = documentDataModel.getUnitId();
        this._clearPopups();
        this._renderManagerService.removeRender(unitId);
    }

    private _clearPopups() {
        this._disposePopups.forEach((dispose) => dispose.dispose());
        this._disposePopups.length = 0;
    }

    private _create(documentDataModel: Nullable<DocumentDataModel>) {
        if (!documentDataModel) {
            return;
        }

        const unitId = documentDataModel.getUnitId();
        if (isInternalEditorID(unitId)) {
            return;
        }
        if (this._renderManagerService.has(unitId) && !this._initImagePopupMenu.has(unitId)) {
            this._popupMenuListener(unitId);
            this._initImagePopupMenu.add(unitId);
        }
    }

    private _hasCropObject(scene: Scene) {
        const objects = scene.getAllObjects();

        for (const object of objects) {
            if (object instanceof ImageCropperObject) {
                return true;
            }
        }

        return false;
    }

    // eslint-disable-next-line max-lines-per-function
    private _popupMenuListener(unitId: string) {
        const scene = this._renderManagerService.getRenderById(unitId)?.scene;
        if (!scene) {
            return;
        }
        const transformer = scene.getTransformerByCreate();
        if (!transformer) {
            return;
        }

        const disposePopups: IDisposable[] = this._disposePopups;

        this.disposeWithMe(
            transformer.createControl$.subscribe(() => {
                if (this._hasCropObject(scene)) {
                    return;
                }

                const selectedObjects = transformer.getSelectedObjectMap();
                disposePopups.forEach((dispose) => dispose.dispose());
                disposePopups.length = 0;
                if (this._isDrawingPanelOpen) {
                    return;
                }
                if (selectedObjects.size > 1) {
                    return;
                }

                const object = selectedObjects.values().next().value as Nullable<BaseObject>;
                if (!object) {
                    return;
                }

                const oKey = object.oKey;
                const drawingParam = this._drawingManagerService.getDrawingOKey(oKey);
                if (
                    !drawingParam ||
                    drawingParam.drawingType === DrawingTypeEnum.DRAWING_DOM ||
                    drawingParam.drawingType === DrawingTypeEnum.DRAWING_SHAPE
                ) {
                    return;
                }

                const { unitId, subUnitId, drawingId, drawingType } = drawingParam;
                const isImage = drawingType === DrawingTypeEnum.DRAWING_IMAGE;
                // Charts use the document toolbar placement, while retaining chart-specific actions and controls.
                const isChart = drawingType === DrawingTypeEnum.DRAWING_CHART;
                const popup = this._canvasPopManagerService.attachPopupToObject(
                    object,
                    {
                        componentKey: COMPONENT_IMAGE_POPUP_MENU,
                        direction: isImage || isChart ? 'top-center' : 'horizontal',
                        offset: isImage || isChart ? [0, 8] : [2, 0],
                        extraProps: {
                            menuItems: this._getDrawingPopupMenuItems(unitId, subUnitId, drawingId, drawingType),
                            variant: isImage ? 'doc-floating-toolbar' : isChart ? 'doc-chart-floating-toolbar' : undefined,
                            unitId,
                            subUnitId,
                            drawingId,
                        },
                    },
                    unitId
                );

                disposePopups.push(this.disposeWithMe(popup));

                const focusDrawings = this._drawingManagerService.getFocusDrawings();

                const alreadyFocused = focusDrawings.find((drawing) => drawing.unitId === unitId && drawing.subUnitId === subUnitId && drawing.drawingId === drawingId);

                if (alreadyFocused) {
                    return;
                }

                this._drawingManagerService.focusDrawing([{
                    unitId,
                    subUnitId,
                    drawingId,
                }]);
            }
            )
        );

        this.disposeWithMe(
            transformer.clearControl$.subscribe(() => {
                disposePopups.forEach((dispose) => dispose.dispose());
                disposePopups.length = 0;
                this._contextService.setContextValue(FOCUSING_COMMON_DRAWINGS, false);
                this._drawingManagerService.focusDrawing(null);
            })
        );
        this.disposeWithMe(
            transformer.changing$.subscribe(() => {
                disposePopups.forEach((dispose) => dispose.dispose());
                disposePopups.length = 0;
            }
            )
        );

        this.disposeWithMe(
            transformer.changeStart$.subscribe(() => {
                disposePopups.forEach((dispose) => dispose.dispose());
                disposePopups.length = 0;
            })
        );
    }

    private _getDrawingPopupMenuItems(unitId: string, subUnitId: string, drawingId: string, drawingType: number) {
        const drawing = this._drawingManagerService.getDrawingByParam({ unitId, subUnitId, drawingId }) as IDocDrawing | null;
        const floatingToolbarMenuItems = drawing
            ? this._floatingToolbarAdapterService.getItems({ unitId, subUnitId, drawing })
            : null;
        if (floatingToolbarMenuItems) {
            return floatingToolbarMenuItems;
        }

        const editCommandInfo = drawing
            ? this._drawingAdapterService.getEditDrawingCommandInfo({ unitId, subUnitId, drawing })
            : null;

        return [
            {
                label: editCommandInfo?.label ?? 'docs-drawing-ui.image-popup.edit',
                index: 0,
                commandId: editCommandInfo?.commandId ?? EditDocDrawingOperation.id,
                commandParams: editCommandInfo?.commandParams ?? { unitId, subUnitId, drawingId },
                disable: editCommandInfo?.disable ?? drawingType === DrawingTypeEnum.DRAWING_DOM,
                hideOnClick: true,
                icon: 'DrawingEditIcon',
            },
            {
                label: 'docs-drawing-ui.image-popup.crop',
                index: 1,
                commandId: OpenImageCropOperation.id,
                commandParams: { unitId, subUnitId, drawingId },
                disable: drawingType === DrawingTypeEnum.DRAWING_DOM,
                icon: 'DrawingCropIcon',
            },
            {
                label: 'docs-drawing-ui.image-popup.delete',
                index: 2,
                commandId: RemoveDocDrawingCommand.id,
                commandParams: { unitId, drawings: [{ unitId, subUnitId, drawingId }] },
                disable: false,
                icon: 'DrawingDeleteIcon',
            },
            {
                label: 'docs-drawing-ui.image-popup.reset',
                index: 3,
                commandId: ImageResetSizeOperation.id,
                commandParams: [{ unitId, subUnitId, drawingId }],
                disable: true, // TODO: @JOCS, feature is not ready.
            },
        ];
    }
}
