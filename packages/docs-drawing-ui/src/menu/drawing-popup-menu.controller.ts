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
    IPermissionService,
    isInternalEditorID,
    IUniverInstanceService,
    RxDisposable,
    toDisposable,
    UniverInstanceType,
} from '@univerjs/core';
import {
    canEditDocumentTargets,
    getDocumentDrawingSegmentId,
    getDocumentEntityParentPermissionObjectIds,
    getDocumentEntityPermissionObjectId,
} from '@univerjs/docs';
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
import { FloatingObjectToolbarPosition, IMenuManagerService, MenuItemType } from '@univerjs/ui';
import { takeUntil } from 'rxjs';
import { EditDocDrawingOperation } from '../commands/operations/edit-doc-drawing.operation';
import { SidebarDocDrawingOperation } from '../commands/operations/open-drawing-panel.operation';
import { DocDrawingFloatingToolbarAdapterService } from '../services/doc-drawing-floating-toolbar-adapter.service';

export class DocDrawingPopupMenuController extends RxDisposable {
    private _initImagePopupMenu = new Set<string>();
    private _embeddedRenderUnits = new Set<string>();
    private _popupMenuListeners = new Map<string, IDisposable>();
    private _disposePopups: IDisposable[] = [];
    private _popupTargetObject: BaseObject | null = null;
    private _isDrawingPanelOpen = false;

    constructor(
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @Inject(DocCanvasPopManagerService) private readonly _canvasPopManagerService: DocCanvasPopManagerService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IContextService private readonly _contextService: IContextService,
        @IDocDrawingAdapterService private readonly _drawingAdapterService: IDocDrawingAdapterService,
        @Inject(DocDrawingFloatingToolbarAdapterService) private readonly _floatingToolbarAdapterService: DocDrawingFloatingToolbarAdapterService,
        @ICommandService private readonly _commandService: ICommandService,
        @IMenuManagerService private readonly _menuManagerService: IMenuManagerService,
        @IPermissionService private readonly _permissionService: IPermissionService
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
        this.disposeWithMe(this._permissionService.permissionPointUpdate$.subscribe(() => {
            if (this._drawingManagerService.getFocusDrawings().some((drawing) =>
                this._univerInstanceService.getUnitType(drawing.unitId) === UniverInstanceType.UNIVER_DOC &&
                !this._canEditDrawing(drawing.unitId, drawing.drawingId)
            )) {
                this._clearPopups();
            }
        }));

        this.disposeWithMe(
            this._univerInstanceService.getCurrentTypeOfUnit$<DocumentDataModel>(UniverInstanceType.UNIVER_DOC).pipe(takeUntil(this.dispose$)).subscribe((documentDataModel) => this._create(documentDataModel))
        );

        this.disposeWithMe(
            this._univerInstanceService.getTypeOfUnitDisposed$<DocumentDataModel>(UniverInstanceType.UNIVER_DOC).pipe(takeUntil(this.dispose$)).subscribe((documentDataModel) => this._dispose(documentDataModel))
        );

        this.disposeWithMe(
            this._renderManagerService.created$.pipe(takeUntil(this.dispose$)).subscribe((render) => {
                if (render.type !== UniverInstanceType.UNIVER_DOC || render.isMainScene) {
                    return;
                }

                this._embeddedRenderUnits.add(render.unitId);
                this._create(this._univerInstanceService.getUnit<DocumentDataModel>(render.unitId, UniverInstanceType.UNIVER_DOC));
            })
        );

        this.disposeWithMe(
            this._renderManagerService.disposed$.pipe(takeUntil(this.dispose$)).subscribe((unitId) => {
                if (!this._embeddedRenderUnits.delete(unitId)) {
                    return;
                }

                this._disposePopupMenuListener(unitId);
            })
        );

        this._univerInstanceService.getAllUnitsForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC).forEach((documentDataModel) => this._create(documentDataModel));
    }

    private _dispose(documentDataModel: DocumentDataModel) {
        const unitId = documentDataModel.getUnitId();
        this._clearPopups();
        this._disposePopupMenuListener(unitId);
        this._renderManagerService.removeRender(unitId);
    }

    private _clearPopups() {
        this._disposePopups.forEach((dispose) => dispose.dispose());
        this._disposePopups.length = 0;
        this._popupTargetObject = null;
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
            const listener = this._popupMenuListener(unitId);
            if (listener) {
                this._popupMenuListeners.set(unitId, listener);
                this._initImagePopupMenu.add(unitId);
            }
        }
    }

    private _disposePopupMenuListener(unitId: string) {
        this._popupMenuListeners.get(unitId)?.dispose();
        this._popupMenuListeners.delete(unitId);
        this._initImagePopupMenu.delete(unitId);
        this._clearPopups();
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
    private _popupMenuListener(unitId: string): IDisposable | undefined {
        const scene = this._renderManagerService.getRenderUnitById(unitId)?.scene;
        if (!scene) {
            return;
        }
        const transformer = scene.getTransformerByCreate();
        if (!transformer) {
            return;
        }

        const disposePopups: IDisposable[] = this._disposePopups;
        const subscriptions = [
            transformer.createControl$.subscribe(() => {
                if (this._hasCropObject(scene)) {
                    this._clearPopups();
                    return;
                }

                const selectedObjects = transformer.getSelectedObjectMap();
                if (this._isDrawingPanelOpen || selectedObjects.size > 1) {
                    this._clearPopups();
                    return;
                }

                const object = selectedObjects.values().next().value as Nullable<BaseObject>;
                if (!object) {
                    this._clearPopups();
                    return;
                }

                const drawingParam = this._drawingManagerService.getDrawingOKey(object.oKey);
                if (
                    !drawingParam ||
                    drawingParam.drawingType === DrawingTypeEnum.DRAWING_DOM ||
                    drawingParam.drawingType === DrawingTypeEnum.DRAWING_SHAPE
                ) {
                    this._clearPopups();
                    return;
                }

                const { unitId, subUnitId, drawingId, drawingType } = drawingParam;
                if (!this._canEditDrawing(unitId, drawingId)) {
                    this._clearPopups();
                    return;
                }
                if (this._popupTargetObject === object && disposePopups.length > 0) {
                    return;
                }

                this._clearPopups();
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
                this._popupTargetObject = object;

                const focusDrawings = this._drawingManagerService.getFocusDrawings();
                const alreadyFocused = focusDrawings.find((drawing) => drawing.unitId === unitId && drawing.subUnitId === subUnitId && drawing.drawingId === drawingId);
                if (!alreadyFocused) {
                    this._drawingManagerService.focusDrawing([{ unitId, subUnitId, drawingId }]);
                }
            }),
            transformer.clearControl$.subscribe(() => {
                disposePopups.forEach((dispose) => dispose.dispose());
                disposePopups.length = 0;
                this._contextService.setContextValue(FOCUSING_COMMON_DRAWINGS, false);
                this._drawingManagerService.focusDrawing(null);
            }),
            transformer.changing$.subscribe(() => {
                disposePopups.forEach((dispose) => dispose.dispose());
                disposePopups.length = 0;
            }),
        ];
        const disposable = toDisposable(() => subscriptions.forEach((subscription) => subscription.unsubscribe()));
        this.disposeWithMe(disposable);
        return disposable;
    }

    private _canEditDrawing(unitId: string, drawingId: string): boolean {
        const documentDataModel = this._univerInstanceService.getUnit<DocumentDataModel>(
            unitId,
            UniverInstanceType.UNIVER_DOC
        );
        if (!documentDataModel) {
            return false;
        }
        const segmentId = getDocumentDrawingSegmentId(documentDataModel, drawingId);
        return canEditDocumentTargets(this._permissionService, unitId, [
            ...getDocumentEntityParentPermissionObjectIds(documentDataModel, segmentId, 'drawing', drawingId),
            getDocumentEntityPermissionObjectId(segmentId, 'drawing', drawingId),
        ]);
    }

    private _getDrawingPopupMenuItems(unitId: string, subUnitId: string, drawingId: string, drawingType: number) {
        const drawing = this._drawingManagerService.getDrawingByParam({ unitId, subUnitId, drawingId }) as IDocDrawing | null;
        const floatingToolbarMenuItems = drawing
            ? this._floatingToolbarAdapterService.getItems({ unitId, subUnitId, drawing })
            : null;
        const editCommandInfo = drawing
            ? this._drawingAdapterService.getEditDrawingCommandInfo({ unitId, subUnitId, drawing })
            : null;

        const defaultItems = [
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

        return [
            ...(floatingToolbarMenuItems ?? defaultItems),
            ...this._getFloatingObjectMenuItems(),
        ];
    }

    private _getFloatingObjectMenuItems() {
        return this._menuManagerService
            .getFlatMenuByPositionKey(FloatingObjectToolbarPosition.DOC)
            .flatMap(({ item }, index) => {
                if (!item || item.type !== MenuItemType.BUTTON || !item.title || typeof item.icon !== 'string') {
                    return [];
                }

                return [{
                    type: 'button' as const,
                    label: item.title,
                    index: 100 + index,
                    commandId: item.commandId ?? item.id,
                    commandParams: typeof item.params === 'function' ? item.params() : item.params,
                    disable: false,
                    icon: item.icon,
                }];
            });
    }
}
