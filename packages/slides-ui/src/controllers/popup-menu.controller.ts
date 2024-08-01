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

import type { IDisposable, Nullable, SlideDataModel } from '@univerjs/core';
import { FOCUSING_COMMON_DRAWINGS, IContextService, Inject, Injector, IUniverInstanceService, LifecycleStages, OnLifecycle, RxDisposable, toDisposable, UniverInstanceType } from '@univerjs/core';
import type { BaseObject, Scene } from '@univerjs/engine-render';
import { IRenderManagerService, ObjectType } from '@univerjs/engine-render';
import { IUIPartsService } from '@univerjs/ui';
import { CanvasView } from '@univerjs/slides';
import { SlideCanvasPopMangerService } from '../services/slide-popup-manager.service';
import { COMPONENT_SLIDE_IMAGE_POPUP_MENU } from '../components/image-popup-menu/component-name';
import { DeleteSlideElementOperation } from '../commands/operations/delete-element.operation';

@OnLifecycle(LifecycleStages.Steady, SlidePopupMenuController)
export class SlidePopupMenuController extends RxDisposable {
    private _initImagePopupMenu = new Set<string>();

    constructor(
        @Inject(Injector) private _injector: Injector,
        // @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @Inject(SlideCanvasPopMangerService) private readonly _canvasPopManagerService: SlideCanvasPopMangerService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IContextService private readonly _contextService: IContextService,
        @Inject(IUIPartsService) private readonly _uiPartsService: IUIPartsService,
        @Inject(CanvasView) private readonly _canvasView: CanvasView
    ) {
        super();

        this._init();
    }

    private _init(): void {
        // this._univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET).pipe(takeUntil(this.dispose$)).subscribe((workbook) => this._create(workbook));
        // this._univerInstanceService.getTypeOfUnitDisposed$<Workbook>(UniverInstanceType.UNIVER_SHEET).pipe(takeUntil(this.dispose$)).subscribe((workbook) => this._dispose(workbook));
        this._univerInstanceService.getAllUnitsForType<SlideDataModel>(UniverInstanceType.UNIVER_SLIDE).forEach((slide) => this._create(slide));
    }

    private _dispose(workbook: SlideDataModel) {
        // const unitId = workbook.getUnitId();
        // this._renderManagerService.removeRender(unitId);
    }

    private _create(slide: Nullable<SlideDataModel>) {
        if (!slide) {
            return;
        }

        const unitId = slide.getUnitId();

        if (this._renderManagerService.has(unitId) && !this._initImagePopupMenu.has(unitId)) {
            this._popupMenuListener(unitId);
            this._initImagePopupMenu.add(unitId);
        }
    }

    private _hasCropObject(scene: Scene) {
        // const objects = scene.getAllObjects();

        // for (const object of objects) {
        //     if (object instanceof ImageCropperObject) {
        //         return true;
        //     }
        // }

        // return false;
    }

    private _popupMenuListener(unitId: string) {
        const model = this._univerInstanceService.getCurrentUnitForType<SlideDataModel>(UniverInstanceType.UNIVER_SLIDE);
        const pages = model?.getPages() ?? {};

        Object.keys(pages).forEach((pageId) => {
            const page = this._canvasView.getRenderUnitByPageId(pageId);
            const transformer = page.scene?.getTransformer();

            if (!transformer) return;

            let singletonPopupDisposer: IDisposable;
            this.disposeWithMe(
                toDisposable(
                    transformer.createControl$.subscribe(() => {
                        // this._contextService.setContextValue(FOCUSING_COMMON_DRAWINGS, true);

                        // if (this._hasCropObject(scene)) {
                        //     return;
                        // }

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
                        // const drawingParam = this._drawingManagerService.getDrawingOKey(oKey);
                        // if (!drawingParam) {
                        //     return;
                        // }

                        // const { unitId, subUnitId, drawingId } = drawingParam;
                        singletonPopupDisposer?.dispose();
                        singletonPopupDisposer = this.disposeWithMe(this._canvasPopManagerService.attachPopupToObject(object, {
                            componentKey: COMPONENT_SLIDE_IMAGE_POPUP_MENU,
                            direction: 'horizontal',
                            offset: [2, 0],
                            extraProps: {
                                menuItems: this._getMenuItemsByObjectType(object.objectType, oKey, unitId),
                            },
                        }));

                        // this._drawingManagerService.focusDrawing([{
                        //     unitId,
                        //     subUnitId,
                        //     drawingId,
                        // }]);
                    })
                )
            );
            this.disposeWithMe(
                transformer.clearControl$.subscribe(() => {
                    singletonPopupDisposer?.dispose();
                    this._contextService.setContextValue(FOCUSING_COMMON_DRAWINGS, false);
                    // this._drawingManagerService.focusDrawing(null);
                })
            );
            this.disposeWithMe(
                transformer.changing$.subscribe(() => {
                    singletonPopupDisposer?.dispose();
                })
            );
        });
    }

    private _getMenuItemsByObjectType(objectType: ObjectType, oKey: string, unitId: string) {
        const menuItems = [];

        if (objectType === ObjectType.RICH_TEXT) {
            menuItems.push({
                label: 'slide.popup.edit',
                index: 0,
                commandId: 'xxxx',
                commandParams: {},
                disable: false,
            });
        } else if (objectType === ObjectType.IMAGE) {
            menuItems.push({
                label: 'slide.popup.edit',
                index: 0,
                commandId: 'xxxx',
                commandParams: {},
                disable: false,
            });
        } else if (objectType === ObjectType.RECT) {
            menuItems.push({
                label: 'slide.popup.edit',
                index: 0,
                commandId: 'xxxx',
                commandParams: {},
                disable: false,
            });
        }

        menuItems.push({
            label: 'slide.popup.delete',
            index: 5,
            commandId: DeleteSlideElementOperation.id,
            commandParams: {
                id: oKey,
            },
            disable: false,
        });

        // return [
        //     {
        //         label: 'image-popup.edit',
        //         index: 0,
        //         commandId: 'EditSheetDrawingOperation.id',
        //         commandParams: { unitId },
        //         disable: false,
        //     },
        //     {
        //         label: 'image-popup.delete',
        //         index: 1,
        //         commandId: 'RemoveSheetDrawingCommand.id',
        //         commandParams: { unitId, drawings: [{ unitId }] },
        //         disable: false,
        //     },
        //     {
        //         label: 'image-popup.crop',
        //         index: 2,
        //         commandId: 'OpenImageCropOperation.id',
        //         commandParams: { unitId },
        //         disable: false,
        //     },
        //     {
        //         label: 'image-popup.reset',
        //         index: 3,
        //         commandId: 'ImageResetSizeOperation.id',
        //         commandParams: [{ unitId }],
        //         disable: false,
        //     },
        // ];

        return menuItems;
    }
}
