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

import {
    Disposable,
    ICommandService,
    IConfigService,
    Inject,
    Injector,
    IUniverInstanceService,
    UniverInstanceType,
} from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { CutIcon, DeleteIcon, DocSettingIcon, TodoListDoubleIcon } from '@univerjs/icons';
import { BuiltInUIPart, ComponentManager, connectInjector, ILayoutService, IMenuManagerService, IShortcutService, IUIPartsService } from '@univerjs/ui';
import { CoreHeaderFooterCommand, OpenHeaderFooterPanelCommand } from '../commands/commands/doc-header-footer.command';
import { SidebarDocHeaderFooterPanelOperation } from '../commands/operations/doc-header-footer-panel.operation';
import { BULLET_LIST_TYPE_COMPONENT, BulletListTypePicker, ORDER_LIST_TYPE_COMPONENT, OrderListTypePicker } from '../components/list-type-picker';
import { ParagraphMenu } from '../components/paragraph-menu';
import { DocSelectionRenderService } from '../services/selection/doc-selection-render.service';
import { TabShortCut } from '../shortcuts/format.shortcut';
import {
    AlignCenterShortCut,
    AlignJustifyShortCut,
    AlignLeftShortCut,
    AlignRightShortCut,
    BoldShortCut,
    BulletListShortCut,
    ItalicShortCut,
    OrderListShortCut,
    StrikeThroughShortCut,
    SubscriptShortCut,
    SuperscriptShortCut,
    UnderlineShortCut,
} from '../shortcuts/toolbar.shortcut';
import { DocFooter } from '../views/doc-footer';
import { PAGE_SETTING_COMPONENT_ID, PageSettings } from '../views/page-settings';
import { DocSideMenu } from '../views/side-menu';
import { menuSchema } from './menu.schema';

export class DocUIController extends Disposable {
    constructor(
        @Inject(Injector) protected readonly _injector: Injector,
        @Inject(ComponentManager) protected readonly _componentManager: ComponentManager,
        @ICommandService protected readonly _commandService: ICommandService,
        @ILayoutService protected readonly _layoutService: ILayoutService,
        @IMenuManagerService protected readonly _menuManagerService: IMenuManagerService,
        @IUIPartsService protected readonly _uiPartsService: IUIPartsService,
        @IUniverInstanceService protected readonly _univerInstanceService: IUniverInstanceService,
        @IShortcutService protected readonly _shortcutService: IShortcutService,
        @IConfigService protected readonly _configService: IConfigService
    ) {
        super();

        this._init();
    }

    private _initCustomComponents(): void {
        ([
            [BULLET_LIST_TYPE_COMPONENT, BulletListTypePicker],
            [ORDER_LIST_TYPE_COMPONENT, OrderListTypePicker],
            ['TodoListDoubleIcon', TodoListDoubleIcon],
            ['doc.paragraph.menu', ParagraphMenu],
            ['CutIcon', CutIcon],
            ['DeleteIcon', DeleteIcon],
            [PAGE_SETTING_COMPONENT_ID, PageSettings],
            ['DocumentSettingIcon', DocSettingIcon],
        ] as const).forEach(([key, comp]) => {
            this.disposeWithMe(
                this._componentManager.register(key, comp)
            );
        });
    }

    private _initUiParts() {
        this.disposeWithMe(this._uiPartsService.registerComponent(BuiltInUIPart.FOOTER, () => connectInjector(DocFooter, this._injector)));
        this.disposeWithMe(this._uiPartsService.registerComponent(BuiltInUIPart.CONTENT, () => connectInjector(DocSideMenu, this._injector)));
    }

    private _initMenus(): void {
        this._menuManagerService.mergeMenu(menuSchema);
    }

    private _initShortCut() {
        [
            BoldShortCut,
            ItalicShortCut,
            UnderlineShortCut,
            StrikeThroughShortCut,
            SubscriptShortCut,
            SuperscriptShortCut,
            AlignCenterShortCut,
            AlignJustifyShortCut,
            AlignRightShortCut,
            AlignLeftShortCut,
            OrderListShortCut,
            BulletListShortCut,
            TabShortCut,
        ].forEach((shortcut) => {
            this.disposeWithMe(this._shortcutService.registerShortcut(shortcut));
        });
    }

    private _init(): void {
        this._initCustomComponents();
        this._initMenus();
        this._initFocusHandler();
        this._initCommands();
        this._initUiParts();
        this._initShortCut();
    }

    private _initCommands(): void {
        [
            CoreHeaderFooterCommand,
            OpenHeaderFooterPanelCommand,
            SidebarDocHeaderFooterPanelOperation,
        ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
    }

    private _initFocusHandler(): void {
        this.disposeWithMe(
            this._layoutService.registerFocusHandler(UniverInstanceType.UNIVER_DOC, (unitId: string) => {
                const renderManagerService = this._injector.get(IRenderManagerService);
                const docSelectionRenderService = renderManagerService.getRenderById(unitId)!.with(DocSelectionRenderService);

                docSelectionRenderService.focus();
            })
        );
    }
}
