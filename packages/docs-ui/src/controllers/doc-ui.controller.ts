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

import { Disposable, ICommandService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import type { IDesktopUIController, IMenuItemFactory } from '@univerjs/ui';
import { ComponentManager, IEditorService, IMenuService, IUIController } from '@univerjs/ui';
import { Inject, Injector } from '@wendellhu/redi';

import { connectInjector } from '@wendellhu/redi/react-bindings';
import { COLOR_PICKER_COMPONENT, ColorPicker } from '../components/color-picker';
import {
    FONT_FAMILY_COMPONENT,
    FONT_FAMILY_ITEM_COMPONENT,
    FontFamily,
    FontFamilyItem,
} from '../components/font-family';
import { FONT_SIZE_COMPONENT, FontSize } from '../components/font-size';
import { TestEditorContainer } from '../components/test-editor/TestTextEditor';
import { TEST_EDITOR_CONTAINER_COMPONENT } from '../components/test-editor/component-name';
import { DocBackground } from '../views/doc-background/DocBackground';
import {
    BoldMenuItemFactory,
    BulletListMenuItemFactory,
    FontFamilySelectorMenuItemFactory,
    FontSizeSelectorMenuItemFactory,
    ItalicMenuItemFactory,
    OrderListMenuItemFactory,
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
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager,
        @ICommandService private readonly _commandService: ICommandService,
        @IEditorService private readonly _editorService: IEditorService,
        @IMenuService private readonly _menuService: IMenuService,
        @IUIController private readonly _uiController: IDesktopUIController
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
        this.disposeWithMe(componentManager.register(TEST_EDITOR_CONTAINER_COMPONENT, TestEditorContainer));
    }

    private _initMenus(): void {
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
                OrderListMenuItemFactory,
                BulletListMenuItemFactory,
            ] as IMenuItemFactory[]
        ).forEach((factory) => {
            this.disposeWithMe(this._menuService.addMenuItem(this._injector.invoke(factory)));
        });
    }

    private _init(): void {
        this._initCustomComponents();
        this._initMenus();
        this._initDocBackground();
    }

    private _initDocBackground() {
        const standAlone = [...this._editorService.getAllEditor().values()].some((editor) => {
            return editor.isSheetEditor === true;
        });
        if (!standAlone) {
            this.disposeWithMe(
                this._uiController.registerContentComponent(() => connectInjector(DocBackground, this._injector))
            );
        }
    }
}
