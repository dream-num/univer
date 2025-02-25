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

import type { IDisposable, Nullable, SlideDataModel } from '@univerjs/core';
import type { BaseObject, ObjectType, Scene } from '@univerjs/engine-render';
import { FOCUSING_COMMON_DRAWINGS, ICommandService, IContextService, Inject, IUniverInstanceService, RxDisposable, toDisposable, UniverInstanceType } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { ISidebarService } from '@univerjs/ui';
import { DeleteSlideElementOperation } from '../commands/operations/delete-element.operation';
import { ToggleSlideEditSidebarOperation } from '../commands/operations/insert-shape.operation';
import { UpdateSlideElementOperation } from '../commands/operations/update-element.operation';
import { COMPONENT_SLIDE_IMAGE_POPUP_MENU } from '../components/image-popup-menu/component-name';
import { SlideCanvasPopMangerService } from '../services/slide-popup-manager.service';
import { CanvasView } from './canvas-view';

export class SlidePopupMenuController extends RxDisposable {
    private _initImagePopupMenu = new Set<string>();

    constructor(
        @Inject(SlideCanvasPopMangerService) private readonly _canvasPopManagerService: SlideCanvasPopMangerService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IContextService private readonly _contextService: IContextService,
        @Inject(CanvasView) private readonly _canvasView: CanvasView,
        @ISidebarService private readonly _sidebarService: ISidebarService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this._init();
    }

    private _init(): void {
        this._univerInstanceService.getAllUnitsForType<SlideDataModel>(UniverInstanceType.UNIVER_SLIDE).forEach((slide) => this._create(slide));
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

    // eslint-disable-next-line max-lines-per-function
    private _popupMenuListener(unitId: string) {
        const model = this._univerInstanceService.getCurrentUnitForType<SlideDataModel>(UniverInstanceType.UNIVER_SLIDE);
        const pages = model?.getPages() ?? {};

        // eslint-disable-next-line max-lines-per-function
        Object.keys(pages).forEach((pageId) => {
            const page = this._canvasView.getRenderUnitByPageId(pageId, unitId);
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

                        if (this._sidebarService.visible) {
                            this._commandService.executeCommand(ToggleSlideEditSidebarOperation.id, {
                                visible: true,
                                objectType: object.objectType,
                            });
                        }

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

                    const selectedObjects = transformer.getSelectedObjectMap();
                    if (selectedObjects.size > 1) {
                        singletonPopupDisposer?.dispose();
                        return;
                    }

                    const object = selectedObjects.values().next().value as Nullable<BaseObject>;
                    if (!object) {
                        return;
                    }

                    this._commandService.executeCommand(UpdateSlideElementOperation.id, {
                        unitId,
                        oKey: object.oKey,
                        props: {
                            width: object.width,
                            height: object.height,
                            left: object.left,
                            top: object.top,
                        },
                    });
                })
            );
        });
    }

    private _getMenuItemsByObjectType(objectType: ObjectType, oKey: string, unitId: string) {
        const menuItems = [{
            label: 'slide.popup.edit',
            index: 0,
            commandId: ToggleSlideEditSidebarOperation.id,
            commandParams: {
                visible: true,
                objectType,
            },
            disable: false,
        }, {
            label: 'slide.popup.delete',
            index: 5,
            commandId: DeleteSlideElementOperation.id,
            commandParams: {
                id: oKey,
                unitId,
            },
            disable: false,
        }];

        return menuItems;
    }
}
