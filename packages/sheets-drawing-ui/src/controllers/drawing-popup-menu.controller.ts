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

import type { IDisposable, Nullable, Workbook } from '@univerjs/core';
import type { ImageIoService } from '@univerjs/drawing';
import type { BaseObject, Scene } from '@univerjs/engine-render';
import type { ISheetFloatDom } from '@univerjs/sheets-drawing';
import { DrawingTypeEnum, FOCUSING_COMMON_DRAWINGS, ICommandService, IContextService, IImageIoService, Inject, Injector, IUniverInstanceService, LocaleService, RxDisposable, UniverInstanceType } from '@univerjs/core';
import { MessageType } from '@univerjs/design';
import { IDrawingManagerService, SetDrawingSelectedOperation } from '@univerjs/drawing';
import { COMPONENT_IMAGE_POPUP_MENU, ImageCropperObject, ImageResetSizeOperation, OpenImageCropOperation } from '@univerjs/drawing-ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import { SheetCanvasPopManagerService } from '@univerjs/sheets-ui';
import { IMessageService } from '@univerjs/ui';
import { takeUntil } from 'rxjs';
import { RemoveSheetDrawingCommand } from '../commands/commands/remove-sheet-drawing.command';
import { EditSheetDrawingOperation } from '../commands/operations/edit-sheet-drawing.operation';

export class DrawingPopupMenuController extends RxDisposable {
    private _initImagePopupMenu = new Set<string>();

    constructor(
        @Inject(Injector) private _injector: Injector,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @Inject(SheetCanvasPopManagerService) private readonly _canvasPopManagerService: SheetCanvasPopManagerService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IMessageService private readonly _messageService: IMessageService,
        @IContextService private readonly _contextService: IContextService,
        @IImageIoService private readonly _ioService: ImageIoService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this._init();
    }

    private _init(): void {
        this._univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET).pipe(takeUntil(this.dispose$)).subscribe((workbook) => this._create(workbook));
        this._univerInstanceService.getTypeOfUnitDisposed$<Workbook>(UniverInstanceType.UNIVER_SHEET).pipe(takeUntil(this.dispose$)).subscribe((workbook) => this._dispose(workbook));
        this._univerInstanceService.getAllUnitsForType<Workbook>(UniverInstanceType.UNIVER_SHEET).forEach((workbook) => this._create(workbook));

        this._setupLoadingStatus();
    }

    private _setupLoadingStatus() {
        const MESSAGE_ID = 'image-upload-loading';

        let messageDisposable: IDisposable | undefined;
        this.disposeWithMe(this._ioService.change$.subscribe((status) => {
            if (status > 0 && !messageDisposable) {
                messageDisposable = this._messageService.show({
                    id: MESSAGE_ID,
                    type: MessageType.Loading,
                    content: `${this._localeService.t('uploadLoading.loading')}: ${status}`,
                    duration: 0,
                });
            } else if (status === 0) {
                messageDisposable?.dispose();
                messageDisposable = undefined;
            }
        }));
    }

    private _dispose(workbook: Workbook) {
        super.dispose();

        const unitId = workbook.getUnitId();
        this._renderManagerService.removeRender(unitId);
    }

    private _create(workbook: Nullable<Workbook>) {
        if (!workbook) {
            return;
        }

        const unitId = workbook.getUnitId();
        if (this._renderManagerService.has(unitId) && !this._initImagePopupMenu.has(unitId)) {
            this._popupMenuListener(unitId);
            this._initImagePopupMenu.add(unitId);
        }
    }

    private _hasCropObject(scene: Scene) {
        const objects = scene.getAllObjectsByOrder();

        for (const object of objects) {
            if (object instanceof ImageCropperObject) {
                return true;
            }
        }

        return false;
    }

    private _popupMenuListener(unitId: string) {
        const scene = this._renderManagerService.getRenderById(unitId)?.scene;
        if (!scene) {
            return;
        }
        const transformer = scene.getTransformerByCreate();
        if (!transformer) {
            return;
        }

        let singletonPopupDisposer: IDisposable;
        this.disposeWithMe(transformer.createControl$.subscribe(() => {
            this._contextService.setContextValue(FOCUSING_COMMON_DRAWINGS, true);

            if (this._hasCropObject(scene)) {
                return;
            }

            const selectedObjects = transformer.getSelectedObjectMap();
            if (selectedObjects.size > 1) {
                singletonPopupDisposer?.dispose();
                return;
            }

            const object = selectedObjects.values().next().value as Nullable<BaseObject>;
            if (!object) {
                return;
            }

            const oKey = object.oKey;
            const drawingParam = this._drawingManagerService.getDrawingOKey(oKey);
            if (!drawingParam) {
                return;
            }

            const { unitId, subUnitId, drawingId, drawingType } = drawingParam;
                    // drawingParam should be  ICanvasFloatDom, use for disable popup dialog
            const data = (drawingParam as ISheetFloatDom).data as Record<string, boolean>;
            if (data && data.disablePopup) {
                return;
            }

            singletonPopupDisposer?.dispose();
            const menus = this._canvasPopManagerService.getFeatureMenu(unitId, subUnitId, drawingId, drawingType);
            singletonPopupDisposer = this.disposeWithMe(this._canvasPopManagerService.attachPopupToObject(object, {
                componentKey: COMPONENT_IMAGE_POPUP_MENU,
                direction: 'horizontal',
                offset: [2, 0],
                extraProps: {
                    menuItems: menus || this._getImageMenuItems(unitId, subUnitId, drawingId, drawingType),
                },
            }));
        })
        );
        this.disposeWithMe(
            transformer.clearControl$.subscribe(() => {
                singletonPopupDisposer?.dispose();
                this._contextService.setContextValue(FOCUSING_COMMON_DRAWINGS, false);
                this._commandService.syncExecuteCommand(SetDrawingSelectedOperation.id, []);
            })
        );
        this.disposeWithMe(
            this._contextService.contextChanged$.subscribe((event) => {
                if (event[FOCUSING_COMMON_DRAWINGS] === false) {
                    singletonPopupDisposer?.dispose();
                }
            })
        );
        this.disposeWithMe(
            transformer.changing$.subscribe(() => {
                singletonPopupDisposer?.dispose();
            })
        );
    }

    private _getImageMenuItems(unitId: string, subUnitId: string, drawingId: string, drawingType: number) {
        return [
            {
                label: 'image-popup.edit',
                index: 0,
                commandId: EditSheetDrawingOperation.id,
                commandParams: { unitId, subUnitId, drawingId },
                disable: drawingType === DrawingTypeEnum.DRAWING_DOM,
            },
            {
                label: 'image-popup.delete',
                index: 1,
                commandId: RemoveSheetDrawingCommand.id,
                commandParams: { unitId, drawings: [{ unitId, subUnitId, drawingId }] },
                disable: false,
            },
            {
                label: 'image-popup.crop',
                index: 2,
                commandId: OpenImageCropOperation.id,
                commandParams: { unitId, subUnitId, drawingId },
                disable: drawingType === DrawingTypeEnum.DRAWING_DOM,
            },
            {
                label: 'image-popup.reset',
                index: 3,
                commandId: ImageResetSizeOperation.id,
                commandParams: [{ unitId, subUnitId, drawingId }],
                disable: drawingType === DrawingTypeEnum.DRAWING_DOM,
            },
        ];
    }
}
