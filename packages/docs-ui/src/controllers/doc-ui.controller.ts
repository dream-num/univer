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

import { connectInjector, Disposable, Inject, Injector, IUniverInstanceService, LifecycleStages, OnLifecycle, UniverInstanceType } from '@univerjs/core';
import type { IMenuItemFactory } from '@univerjs/ui';
import { BuiltInUIPart, ComponentManager, ILayoutService, IMenuService, IUIPartsService } from '@univerjs/ui';

import { ITextSelectionRenderManager } from '@univerjs/engine-render';
import { COLOR_PICKER_COMPONENT, ColorPicker } from '../components/color-picker';
import {
    FONT_FAMILY_COMPONENT,
    FONT_FAMILY_ITEM_COMPONENT,
    FontFamily,
    FontFamilyItem,
} from '../components/font-family';
import { FONT_SIZE_COMPONENT, FontSize } from '../components/font-size';
import type { IUniverDocsUIConfig } from '../basics';
import { DocFooter } from '../views/doc-footer';
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
    HeaderFooterMenuItemFactory,
    ItalicMenuItemFactory,
    OrderListMenuItemFactory,
    ResetBackgroundColorMenuItemFactory,
    StrikeThroughMenuItemFactory,
    SubscriptMenuItemFactory,
    SuperscriptMenuItemFactory,
    TextColorSelectorMenuItemFactory,
    UnderlineMenuItemFactory,
} from './menu/menu';
import { CopyMenuFactory, CutMenuFactory, DeleteMenuFactory, PasteMenuFactory } from './menu/context-menu';

// FIXME: LifecycleStages.Rendered must be used, otherwise the menu cannot be added to the DOM, but the sheet ui plug-in can be added in LifecycleStages.Ready
@OnLifecycle(LifecycleStages.Rendered, DocUIController)
export class DocUIController extends Disposable {
    constructor(
        private readonly _config: Partial<IUniverDocsUIConfig>,
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager,
        @ILayoutService private readonly _layoutService: ILayoutService,
        @IMenuService private readonly _menuService: IMenuService,
        @IUIPartsService private readonly _uiPartsService: IUIPartsService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
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

    private _initUiParts() {
        const workbook = this._univerInstanceService.getCurrentUnitForType(UniverInstanceType.UNIVER_SHEET);
        if (this._config.layout?.docContainerConfig?.footer && !workbook) {
            this.disposeWithMe(this._uiPartsService.registerComponent(BuiltInUIPart.FOOTER, () => connectInjector(DocFooter, this._injector)));
        }
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
                HeaderFooterMenuItemFactory,
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

        [
            CopyMenuFactory,
            CutMenuFactory,
            PasteMenuFactory,
            DeleteMenuFactory,
        ].forEach((factory) => {
            try {
                this.disposeWithMe(this._menuService.addMenuItem(this._injector.invoke(factory), menu));
            } catch (error) {

            }
        });
    }

    private _init(): void {
        this._initCustomComponents();
        this._initMenus();
        this._initFocusHandler();
        this._initUiParts();
    }

    private _initFocusHandler(): void {
        this.disposeWithMe(
            this._layoutService.registerFocusHandler(UniverInstanceType.UNIVER_DOC, () => {
                const textSelectionManagerService = this._injector.get(ITextSelectionRenderManager);
                textSelectionManagerService.focus();
            })
        );
    }
}
