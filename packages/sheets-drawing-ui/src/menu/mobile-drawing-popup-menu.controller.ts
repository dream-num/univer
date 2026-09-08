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

import type { IDisposable, IDrawingSearch, Nullable, Workbook } from '@univerjs/core';
import type { ImageIoService } from '@univerjs/drawing';
import type { BaseObject, Scene } from '@univerjs/engine-render';
import type { ISheetFloatDom } from '@univerjs/sheets-drawing';
import type { LocaleKey } from '../locale/types';
import {
    DrawingTypeEnum,
    FOCUSING_COMMON_DRAWINGS,
    ICommandService,
    IContextService,
    IImageIoService,
    Inject,
    IUniverInstanceService,
    LocaleService,
    RxDisposable,
    toDisposable,
    UniverInstanceType,
} from '@univerjs/core';
import { MessageType } from '@univerjs/design';
import { IDrawingManagerService, SetDrawingSelectedOperation } from '@univerjs/drawing';
import {
    COMPONENT_MOBILE_IMAGE_POPUP_MENU,
    ImageCropperObject,
    ImageResetSizeOperation,
    OpenImageCropOperation,
} from '@univerjs/drawing-ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import { RemoveSheetDrawingCommand } from '@univerjs/sheets-drawing';
import { SheetCanvasPopManagerService } from '@univerjs/sheets-ui';
import {
    FloatingObjectToolbarPosition,
    IDialogService,
    ILayoutService,
    IMenuManagerService,
    IMessageService,
    MenuItemType,
} from '@univerjs/ui';
import { FlipSheetDrawingCommand } from '../commands/commands/flip-drawings.command';
import { EditSheetDrawingOperation } from '../commands/operations/edit-sheet-drawing.operation';

const MOBILE_IMAGE_ACTIONS_DIALOG_ID = 'sheet-mobile-image-actions';
const MOBILE_DRAWING_LONG_PRESS_DURATION = 500;

export class MobileDrawingPopupMenuController extends RxDisposable {
    private readonly _initImagePopupMenu = new Set<string>();

    constructor(
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @Inject(SheetCanvasPopManagerService)
        private readonly _canvasPopManagerService: SheetCanvasPopManagerService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IMessageService private readonly _messageService: IMessageService,
        @IMenuManagerService private readonly _menuManagerService: IMenuManagerService,
        @IContextService private readonly _contextService: IContextService,
        @IImageIoService private readonly _ioService: ImageIoService,
        @ICommandService private readonly _commandService: ICommandService,
        @IDialogService private readonly _dialogService: IDialogService,
        @ILayoutService private readonly _layoutService: ILayoutService
    ) {
        super();

        this._init();
    }

    private _init(): void {
        this.disposeWithMe(
            this._univerInstanceService
                .getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET)
                .subscribe((workbook) => this._create(workbook))
        );
        this.disposeWithMe(
            this._univerInstanceService
                .getTypeOfUnitDisposed$<Workbook>(UniverInstanceType.UNIVER_SHEET)
                .subscribe((workbook) => this._dispose(workbook))
        );
        this._univerInstanceService
            .getAllUnitsForType<Workbook>(UniverInstanceType.UNIVER_SHEET)
            .forEach((workbook) => this._create(workbook));

        this._setupLoadingStatus();
    }

    private _setupLoadingStatus(): void {
        const messageId = 'image-upload-loading';
        let messageDisposable: IDisposable | undefined;

        this.disposeWithMe(this._ioService.change$.subscribe((status) => {
            if (status > 0 && !messageDisposable) {
                messageDisposable = this._messageService.show({
                    id: messageId,
                    type: MessageType.Loading,
                    content: `${this._localeService.t<LocaleKey>('sheets-drawing-ui.uploadLoading.loading')}: ${status}`,
                    duration: 0,
                });
            } else if (status === 0) {
                messageDisposable?.dispose();
                messageDisposable = undefined;
            }
        }));
    }

    private _dispose(workbook: Workbook): void {
        super.dispose();

        const unitId = workbook.getUnitId();
        this._renderManagerService.removeRender(unitId);
        this._initImagePopupMenu.delete(unitId);
    }

    private _create(workbook: Nullable<Workbook>): void {
        if (!workbook) {
            return;
        }

        const unitId = workbook.getUnitId();
        if (this._renderManagerService.has(unitId) && !this._initImagePopupMenu.has(unitId)) {
            this._popupMenuListener(unitId);
            this._initImagePopupMenu.add(unitId);
        }
    }

    private _hasCropObject(scene: Scene): boolean {
        for (const object of scene.getAllObjectsByOrder()) {
            if (object instanceof ImageCropperObject) {
                return true;
            }
        }

        return false;
    }

    private _openDrawingPopup(scene: Scene, object: BaseObject, closeCurrentPopup: () => void): Nullable<IDisposable> {
        if (this._hasCropObject(scene)) {
            return null;
        }

        const drawingParam = this._drawingManagerService.getDrawingOKey(object.oKey);
        if (!drawingParam) {
            return null;
        }

        const { unitId, subUnitId, drawingId, drawingType } = drawingParam;
        const data = (drawingParam as ISheetFloatDom).data as Record<string, unknown> | undefined;
        if (data && (data.disablePopup || (data.version === 1 && typeof data.embedId === 'string'))) {
            return null;
        }

        const menus = this._canvasPopManagerService.getFeatureMenu(unitId, subUnitId, drawingId, drawingType);
        const menuItems = [
            ...(menus || this._getImageMenuItems(unitId, subUnitId, drawingId, drawingType)),
            ...this._getFloatingObjectMenuItems(),
        ];
        const titleKey = this._canvasPopManagerService.getFeatureMenuTitle(drawingType) ??
            (drawingType === DrawingTypeEnum.DRAWING_IMAGE
                ? 'sheets-drawing-ui.title'
                : 'sheets-drawing-ui.image-popup.edit');
        closeCurrentPopup();
        this._dialogService.open({
            id: MOBILE_IMAGE_ACTIONS_DIALOG_ID,
            title: { title: this._localeService.t(titleKey) },
            children: {
                label: {
                    name: COMPONENT_MOBILE_IMAGE_POPUP_MENU,
                    props: {
                        popup: {
                            extraProps: { menuItems, dialogId: MOBILE_IMAGE_ACTIONS_DIALOG_ID },
                        },
                    },
                },
            },
        });
        return toDisposable(() => this._dialogService.close(MOBILE_IMAGE_ACTIONS_DIALOG_ID));
    }

    private _trackActivePointer(clearLongPressTimer: () => void) {
        const contentElement = this._layoutService.getContentElement();
        let activePointerId: number | undefined;
        const handlePointerDown = (event: PointerEvent) => {
            if (event.isPrimary && event.button === 0) {
                activePointerId = event.pointerId;
            }
        };
        const handlePointerEnd = (event: PointerEvent) => {
            if (event.pointerId === activePointerId) {
                activePointerId = undefined;
                clearLongPressTimer();
            }
        };

        contentElement?.addEventListener('pointerdown', handlePointerDown, true);
        contentElement?.addEventListener('pointerup', handlePointerEnd, true);
        contentElement?.addEventListener('pointercancel', handlePointerEnd, true);

        return {
            getActivePointerId: () => activePointerId,
            disposable: toDisposable(() => {
                contentElement?.removeEventListener('pointerdown', handlePointerDown, true);
                contentElement?.removeEventListener('pointerup', handlePointerEnd, true);
                contentElement?.removeEventListener('pointercancel', handlePointerEnd, true);
            }),
        };
    }

    private _getSelectedDrawingObject(
        transformer: { getSelectedObjectMap: () => Map<string, BaseObject> },
        drawing: IDrawingSearch
    ): Nullable<BaseObject> {
        const selectedObjects = transformer.getSelectedObjectMap();
        if (selectedObjects.size !== 1) {
            return null;
        }

        const selectedObject = selectedObjects.values().next().value as Nullable<BaseObject>;
        const selectedDrawing = selectedObject
            ? this._drawingManagerService.getDrawingOKey(selectedObject.oKey)
            : null;
        return selectedObject &&
            selectedDrawing?.unitId === drawing.unitId &&
            selectedDrawing.subUnitId === drawing.subUnitId &&
            selectedDrawing.drawingId === drawing.drawingId
            ? selectedObject
            : null;
    }

    private _popupMenuListener(unitId: string): void {
        const scene = this._renderManagerService.getRenderUnitById(unitId)?.scene;
        if (!scene) {
            return;
        }
        const transformer = scene.getTransformerByCreate();
        if (!transformer) {
            return;
        }

        let singletonPopupDisposer: IDisposable;
        let longPressTimer: ReturnType<typeof setTimeout> | undefined;
        const clearLongPressTimer = () => {
            if (longPressTimer === undefined) {
                return;
            }

            clearTimeout(longPressTimer);
            longPressTimer = undefined;
        };
        const pointerTracker = this._trackActivePointer(clearLongPressTimer);
        this.disposeWithMe(pointerTracker.disposable);
        this.disposeWithMe(toDisposable(() => {
            clearLongPressTimer();
            singletonPopupDisposer?.dispose();
        }));
        this.disposeWithMe(transformer.createControl$.subscribe(() => {
            clearLongPressTimer();
            this._contextService.setContextValue(FOCUSING_COMMON_DRAWINGS, true);
        }));
        this.disposeWithMe(transformer.changeStart$.subscribe(({ target, objects }) => {
            clearLongPressTimer();
            singletonPopupDisposer?.dispose();
            if (pointerTracker.getActivePointerId() === undefined || !target || objects.size !== 1 || this._hasCropObject(scene)) {
                return;
            }

            const drawingParam = this._drawingManagerService.getDrawingOKey(target.oKey);
            if (!drawingParam) {
                return;
            }

            longPressTimer = setTimeout(() => {
                longPressTimer = undefined;
                const selectedObject = this._getSelectedDrawingObject(transformer, drawingParam);
                if (!selectedObject) {
                    return;
                }

                const popupDisposer = this._openDrawingPopup(
                    scene,
                    selectedObject,
                    () => singletonPopupDisposer?.dispose()
                );
                if (popupDisposer) {
                    singletonPopupDisposer = popupDisposer;
                }
            }, MOBILE_DRAWING_LONG_PRESS_DURATION);
        }));
        this.disposeWithMe(transformer.clearControl$.subscribe(() => {
            clearLongPressTimer();
            singletonPopupDisposer?.dispose();
            this._contextService.setContextValue(FOCUSING_COMMON_DRAWINGS, false);
            this._commandService.syncExecuteCommand(SetDrawingSelectedOperation.id, []);
        }));
        this.disposeWithMe(this._contextService.contextChanged$.subscribe((event) => {
            if (event[FOCUSING_COMMON_DRAWINGS] === false) {
                singletonPopupDisposer?.dispose();
            }
        }));
        this.disposeWithMe(transformer.changing$.subscribe(() => {
            clearLongPressTimer();
            singletonPopupDisposer?.dispose();
        }));
        this.disposeWithMe(transformer.changeEnd$.subscribe(() => {
            clearLongPressTimer();
        }));
    }

    private _getImageMenuItems(unitId: string, subUnitId: string, drawingId: string, drawingType: number) {
        return [
            {
                label: 'sheets-drawing-ui.image-popup.edit',
                index: 0,
                commandId: EditSheetDrawingOperation.id,
                commandParams: { unitId, subUnitId, drawingId },
                disable: drawingType === DrawingTypeEnum.DRAWING_DOM,
            },
            {
                label: 'sheets-drawing-ui.image-popup.delete',
                index: 1,
                commandId: RemoveSheetDrawingCommand.id,
                commandParams: { unitId, drawings: [{ unitId, subUnitId, drawingId }] },
                disable: false,
            },
            {
                label: 'sheets-drawing-ui.image-popup.crop',
                index: 2,
                commandId: OpenImageCropOperation.id,
                commandParams: { unitId, subUnitId, drawingId },
                disable: drawingType === DrawingTypeEnum.DRAWING_DOM,
            },
            {
                label: 'sheets-drawing-ui.image-popup.flipH',
                index: 2,
                commandId: FlipSheetDrawingCommand.id,
                commandParams: { unitId, flipH: true, drawings: [{ unitId, subUnitId, drawingId }] },
                disable: drawingType === DrawingTypeEnum.DRAWING_DOM,
            },
            {
                label: 'sheets-drawing-ui.image-popup.flipV',
                index: 2,
                commandId: FlipSheetDrawingCommand.id,
                commandParams: { unitId, flipV: true, drawings: [{ unitId, subUnitId, drawingId }] },
                disable: drawingType === DrawingTypeEnum.DRAWING_DOM,
            },
            {
                label: 'sheets-drawing-ui.image-popup.reset',
                index: 3,
                commandId: ImageResetSizeOperation.id,
                commandParams: [{ unitId, subUnitId, drawingId }],
                disable: drawingType === DrawingTypeEnum.DRAWING_DOM,
            },
        ];
    }

    private _getFloatingObjectMenuItems() {
        return this._menuManagerService
            .getFlatMenuByPositionKey(FloatingObjectToolbarPosition.SHEET)
            .flatMap(({ item }, index) => {
                if (!item || item.type !== MenuItemType.BUTTON || !item.title) {
                    return [];
                }

                return [{
                    label: item.title,
                    index: 100 + index,
                    commandId: item.commandId ?? item.id,
                    commandParams: typeof item.params === 'function' ? item.params() : item.params,
                    disable: false,
                }];
            });
    }
}
