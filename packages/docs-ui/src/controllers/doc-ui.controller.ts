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

import type { DocumentDataModel, IDrawingMapItemData } from '@univerjs/core';
import { Disposable, IDrawingManagerService, IUniverInstanceService, LifecycleStages, OnLifecycle, UniverInstanceType } from '@univerjs/core';
import type { IMenuItemFactory } from '@univerjs/ui';
import { BuiltInUIPart, ComponentManager, IEditorService, ILayoutService, IMenuService, IUIPartsService } from '@univerjs/ui';
import { Inject, Injector } from '@wendellhu/redi';

import { connectInjector } from '@wendellhu/redi/react-bindings';
import { ITextSelectionRenderManager } from '@univerjs/engine-render';
import { type IDocDrawing, IDocDrawingService } from '@univerjs/docs';
import { COLOR_PICKER_COMPONENT, ColorPicker } from '../components/color-picker';
import {
    FONT_FAMILY_COMPONENT,
    FONT_FAMILY_ITEM_COMPONENT,
    FontFamily,
    FontFamilyItem,
} from '../components/font-family';
import { FONT_SIZE_COMPONENT, FontSize } from '../components/font-size';
import { DocBackground } from '../views/doc-background/DocBackground';
import type { IUniverDocsUIConfig } from '../basics';
import { docDrawingPositionToTransform } from '../basics/transform-position';
import {
    AlignCenterMenuItemFactory,
    AlignJustifyMenuItemFactory,
    AlignLeftMenuItemFactory,
    AlignRightMenuItemFactory,
    BackgroundColorSelectorMenuItemFactory,
    BoldMenuItemFactory,
    BulletListMenuItemFactory,
    FontFamilySelectorMenuItemFactory,
    FontSizeSelectorMenuItemFactory,
    ItalicMenuItemFactory,
    OrderListMenuItemFactory,
    ResetBackgroundColorMenuItemFactory,
    StrikeThroughMenuItemFactory,
    SubscriptMenuItemFactory,
    SuperscriptMenuItemFactory,
    TextColorSelectorMenuItemFactory,
    UnderlineMenuItemFactory,
} from './menu/menu';

// FIXME: LifecycleStages.Rendered must be used, otherwise the menu cannot be added to the DOM, but the sheet ui plug-in can be added in LifecycleStages.Ready
@OnLifecycle(LifecycleStages.Rendered, DocUIController)
export class DocUIController extends Disposable {
    constructor(
        private readonly _config: Partial<IUniverDocsUIConfig>,
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager,
        @ILayoutService private readonly _layoutService: ILayoutService,
        @IEditorService private readonly _editorService: IEditorService,
        @IMenuService private readonly _menuService: IMenuService,
        @IUIPartsService private readonly _uiPartsService: IUIPartsService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(ITextSelectionRenderManager) private readonly _textSelectionRenderManager: ITextSelectionRenderManager,
        @IDocDrawingService private readonly _docDrawingService: IDocDrawingService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService
    ) {
        super();

        this._init();
    }

    private _initCustomComponents(): void {
        const componentManager = this._componentManager;
        this.disposeWithMe(componentManager.register(COLOR_PICKER_COMPONENT, ColorPicker));
        this.disposeWithMe(componentManager.register(FONT_FAMILY_COMPONENT, FontFamily));
        this.disposeWithMe(componentManager.register(FONT_FAMILY_ITEM_COMPONENT, FontFamilyItem));
        this.disposeWithMe(componentManager.register(FONT_SIZE_COMPONENT, FontSize));
    }

    private _initMenus(): void {
        const { menu = {} } = this._config;

        // init menus
        (
            [
                BoldMenuItemFactory,
                ItalicMenuItemFactory,
                UnderlineMenuItemFactory,
                StrikeThroughMenuItemFactory,
                SubscriptMenuItemFactory,
                SuperscriptMenuItemFactory,
                FontSizeSelectorMenuItemFactory,
                FontFamilySelectorMenuItemFactory,
                TextColorSelectorMenuItemFactory,
                AlignLeftMenuItemFactory,
                AlignCenterMenuItemFactory,
                AlignRightMenuItemFactory,
                AlignJustifyMenuItemFactory,
                OrderListMenuItemFactory,
                BulletListMenuItemFactory,
                ResetBackgroundColorMenuItemFactory,
                BackgroundColorSelectorMenuItemFactory,
            ] as IMenuItemFactory[]
        ).forEach((factory) => {
            this.disposeWithMe(this._menuService.addMenuItem(this._injector.invoke(factory), menu));
        });
    }

    private _init(): void {
        this._initCustomComponents();
        this._initMenus();
        this._initDocBackground();
        this._initFocusHandler();
        this._initDataLoader();
    }

    private _initDocBackground() {
        const firstDocUnitId = this._univerInstanceService.getAllUnitsForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC)[0].getUnitId();
        if (firstDocUnitId == null) {
            return;
        }

        const embedded = this._editorService.isEditor(firstDocUnitId);
        if (!embedded) {
            this.disposeWithMe(
                this._uiPartsService.registerComponent(BuiltInUIPart.CONTENT, () => connectInjector(DocBackground, this._injector))
            );
        }
    }

    private _initFocusHandler(): void {
        this.disposeWithMe(
            this._layoutService.registerFocusHandler(UniverInstanceType.UNIVER_DOC, () => {
                const textSelectionManagerService = this._injector.get(ITextSelectionRenderManager);
                textSelectionManagerService.focus();
            })
        );
    }

    private _initDataLoader() {
        const dataModel = this._univerInstanceService.getCurrentUnitForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        if (!dataModel) {
            return false;
        }

        const unitId = dataModel.getUnitId();
        const subUnitId = unitId;

        const drawingDataModels = dataModel.getDrawings();
        const drawingOrderModel = dataModel.getDrawingsOrder();

        if (!drawingDataModels || !drawingOrderModel) {
            return false;
        }

        Object.keys(drawingDataModels).forEach((drawingId) => {
            const drawingDataModel = drawingDataModels[drawingId];
            const docTransform = drawingDataModel.docTransform;
            const transform = docDrawingPositionToTransform(docTransform, this._textSelectionRenderManager);

            drawingDataModels[drawingId] = { ...drawingDataModel, transform } as IDocDrawing;
        });

        const subDrawings = {
            [subUnitId]: {
                unitId,
                subUnitId,
                data: drawingDataModels as IDrawingMapItemData<IDocDrawing>,
                order: drawingOrderModel,
            },
        };

        this._docDrawingService.registerDrawingData(unitId, subDrawings);
        this._drawingManagerService.registerDrawingData(unitId, subDrawings);
    }
}
