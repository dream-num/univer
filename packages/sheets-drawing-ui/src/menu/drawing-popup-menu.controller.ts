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
import type { LocaleKey } from '../locale/types';
import {
    DrawingTypeEnum,
    FOCUSING_COMMON_DRAWINGS,
    ICommandService,
    IConfigService,
    IContextService,
    IImageIoService,
    Inject,
    IPermissionService,
    IUniverInstanceService,
    LocaleService,
    RxDisposable,
    ThemeService,
    UniverInstanceType,
} from '@univerjs/core';
import { MessageType } from '@univerjs/design';
import { IDrawingManagerService, SetDrawingSelectedOperation } from '@univerjs/drawing';
import {
    COMPONENT_IMAGE_POPUP_MENU,
    createOlePreviewViewer,
    ImageCropperObject,
    ImageResetSizeOperation,
    OleUIService,
    OpenImageCropOperation,
} from '@univerjs/drawing-ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import { UniverSheetsPlugin, WorkbookEditablePermission } from '@univerjs/sheets';
import { RemoveSheetDrawingCommand, SetSheetDrawingCommand, UniverSheetsDrawingPlugin } from '@univerjs/sheets-drawing';
import { SheetCanvasPopManagerService, UniverSheetsUIPlugin } from '@univerjs/sheets-ui';
import {
    FloatingObjectToolbarPosition,
    IMenuManagerService,
    IMessageService,
    MenuItemType,
} from '@univerjs/ui';
import { FlipSheetDrawingCommand } from '../commands/commands/flip-drawings.command';
import { EditSheetDrawingOperation } from '../commands/operations/edit-sheet-drawing.operation';
import { UniverSheetsDrawingUIPlugin } from '../plugin';

export class DrawingPopupMenuController extends RxDisposable {
    private _initImagePopupMenu = new Set<string>();

    constructor(
        @Inject(LocaleService) protected readonly _localeService: LocaleService,
        @IDrawingManagerService protected readonly _drawingManagerService: IDrawingManagerService,
        @Inject(SheetCanvasPopManagerService) protected readonly _canvasPopManagerService: SheetCanvasPopManagerService,
        @IRenderManagerService protected readonly _renderManagerService: IRenderManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IMessageService protected readonly _messageService: IMessageService,
        @IMenuManagerService private readonly _menuManagerService: IMenuManagerService,
        @IContextService protected readonly _contextService: IContextService,
        @IImageIoService private readonly _ioService: ImageIoService,
        @ICommandService protected readonly _commandService: ICommandService,
        @Inject(OleUIService) private readonly _oleUI: OleUIService,
        @Inject(ThemeService) private readonly _themeService: ThemeService,
        @IConfigService private readonly _configService: IConfigService,
        @IPermissionService private readonly _permissionService: IPermissionService
    ) {
        super();

        this.disposeWithMe(this._oleUI.registerHost(UniverInstanceType.UNIVER_SHEET, {
            isEditable: (drawing) => this._drawingManagerService.getDrawingEditable() && this._permissionService.getPermissionPoint(new WorkbookEditablePermission(drawing.unitId).id)?.value !== false,
            attach: (object, componentKey, extraProps, _drawing, direction = 'top-center') => this._canvasPopManagerService.attachPopupToObject(object, { componentKey, extraProps, direction, offset: direction === 'top-center' ? [0, 8] : [0, 0] }),
            rename: (drawing, name) => this._commandService.executeCommand(SetSheetDrawingCommand.id, { unitId: drawing.unitId, drawings: [{ ...drawing, oleFileName: name }] }),
            saveOnlineUnit: (drawing, online) => this._commandService.executeCommand(SetSheetDrawingCommand.id, { unitId: drawing.unitId, drawings: [{ ...drawing, oleOnlineUnit: online }] }),
            remove: (drawing) => this._commandService.executeCommand(RemoveSheetDrawingCommand.id, { unitId: drawing.unitId, drawings: [drawing] }),
            createPreview: (container, data) => createOlePreviewViewer({ container, data, type: UniverInstanceType.UNIVER_SHEET, locale: this._localeService, theme: this._themeService, config: this._configService, setReadonly: (permissions, unitId) => {
                const point = new WorkbookEditablePermission(unitId);
                if (!permissions.getPermissionPoint(point.id)) {
                    permissions.addPermissionPoint(point);
                }
                permissions.updatePermissionPoint(point.id, false);
            }, register: (viewer) => {
                viewer.registerPlugin(UniverSheetsPlugin);
                viewer.registerPlugin(UniverSheetsUIPlugin);
                viewer.registerPlugin(UniverSheetsDrawingPlugin);
                viewer.registerPlugin(UniverSheetsDrawingUIPlugin);
            } }),
        }));

        this._init();
    }

    private _init(): void {
        this._univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET).subscribe((workbook) => this._create(workbook));
        this._univerInstanceService.getTypeOfUnitDisposed$<Workbook>(UniverInstanceType.UNIVER_SHEET).subscribe((workbook) => this._dispose(workbook));
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
                    content: `${this._localeService.t<LocaleKey>('sheets-drawing-ui.uploadLoading.loading')}: ${status}`,
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
        this._initImagePopupMenu.delete(unitId);
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
        const scene = this._renderManagerService.getRenderUnitById(unitId)?.scene;
        if (!scene) {
            return;
        }
        const transformer = scene.getTransformerByCreate();
        if (!transformer) {
            return;
        }

        let singletonPopupDisposer: IDisposable | undefined;
        this.disposeWithMe(transformer.createControl$.subscribe(() => {
            singletonPopupDisposer?.dispose();
            singletonPopupDisposer = this._createPopup(scene, transformer);
        }));
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

    private _createPopup(scene: Scene, transformer: ReturnType<Scene['getTransformerByCreate']>): IDisposable | undefined {
        this._contextService.setContextValue(FOCUSING_COMMON_DRAWINGS, true);

        if (this._hasCropObject(scene)) {
            return;
        }

        const selectedObjects = transformer.getSelectedObjectMap();
        if (selectedObjects.size > 1) {
            return;
        }

        const object = selectedObjects.values().next().value as Nullable<BaseObject>;
        if (!object) {
            return;
        }

        const drawingParam = this._drawingManagerService.getDrawingOKey(object.oKey);
        if (!drawingParam || drawingParam.drawingType === DrawingTypeEnum.DRAWING_SHAPE || drawingParam.drawingType === DrawingTypeEnum.DRAWING_OLE) {
            return;
        }

        const { unitId, subUnitId, drawingId, drawingType } = drawingParam;
        const data = (drawingParam as ISheetFloatDom).data as Record<string, unknown> | undefined;
        if (data && (data.disablePopup || (data.version === 1 && typeof data.embedId === 'string'))) {
            return;
        }

        const menus = this._canvasPopManagerService.getFeatureMenu(unitId, subUnitId, drawingId, drawingType);
        const menuItems = [
            ...(menus || this._getImageMenuItems(unitId, subUnitId, drawingId, drawingType)),
            ...this._getFloatingObjectMenuItems(),
        ];

        return this.disposeWithMe(this._canvasPopManagerService.attachPopupToObject(object, {
            componentKey: COMPONENT_IMAGE_POPUP_MENU,
            constrainToCanvas: true,
            direction: this._localeService.getDirection() === 'rtl' ? 'left' : 'horizontal',
            offset: [2, 0],
            extraProps: {
                menuItems,
            },
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
