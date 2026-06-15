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
import { DeleteIcon, DocSettingIcon, H1Icon, H2Icon, H3Icon, H4Icon, H5Icon, MoreLeftIcon, MoreRightIcon, TextTypeIcon, TodoListDoubleIcon } from '@univerjs/icons';
import { BuiltInUIPart, ComponentManager, connectInjector, IconManager, ILayoutService, IMenuManagerService, IShortcutService, IUIPartsService } from '@univerjs/ui';
import { CoreHeaderFooterCommand, OpenHeaderFooterPanelCommand } from '../commands/commands/doc-header-footer.command';
import { SidebarDocHeaderFooterPanelOperation } from '../commands/operations/doc-header-footer-panel.operation';
import { floatToolbarMenuSchema, menuSchema } from '../menu/schema';
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
import { DocSideMenu } from '../views/DocSideMenu';
import {
    DefaultTextColorIcon,
    DocParagraphBackgroundColorSwatchIcon0,
    DocParagraphBackgroundColorSwatchIcon1,
    DocParagraphBackgroundColorSwatchIcon10,
    DocParagraphBackgroundColorSwatchIcon11,
    DocParagraphBackgroundColorSwatchIcon12,
    DocParagraphBackgroundColorSwatchIcon13,
    DocParagraphBackgroundColorSwatchIcon14,
    DocParagraphBackgroundColorSwatchIcon2,
    DocParagraphBackgroundColorSwatchIcon3,
    DocParagraphBackgroundColorSwatchIcon4,
    DocParagraphBackgroundColorSwatchIcon5,
    DocParagraphBackgroundColorSwatchIcon6,
    DocParagraphBackgroundColorSwatchIcon7,
    DocParagraphBackgroundColorSwatchIcon8,
    DocParagraphBackgroundColorSwatchIcon9,
    DocParagraphTextColorSwatchIcon0,
    DocParagraphTextColorSwatchIcon1,
    DocParagraphTextColorSwatchIcon2,
    DocParagraphTextColorSwatchIcon3,
    DocParagraphTextColorSwatchIcon4,
    DocParagraphTextColorSwatchIcon5,
    DocParagraphTextColorSwatchIcon6,
    HeaderTextColorIcon,
    SubtitleTypeIcon,
    TitleTypeIcon,
} from '../views/Icon';
import { BULLET_LIST_TYPE_COMPONENT, BulletListTypePicker, ORDER_LIST_TYPE_COMPONENT, OrderListTypePicker } from '../views/list-type-picker/index';
import { PAGE_SETTING_COMPONENT_ID, PageSettings } from '../views/PageSettings';
import { DOC_PARAGRAPH_MENU_COMPONENT_KEY, DOC_TABLE_BLOCK_MENU_COMPONENT_KEY, ParagraphMenu, TableBlockMenu } from '../views/ParagraphMenu';

export class DocUIController extends Disposable {
    constructor(
        @Inject(Injector) protected readonly _injector: Injector,
        @Inject(ComponentManager) protected readonly _componentManager: ComponentManager,
        @Inject(IconManager) protected readonly _iconManager: IconManager,
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

    private _registerIcons(): void {
        this.disposeWithMe(this._iconManager.register({
            DeleteIcon,
            DocSettingIcon,
            H1Icon,
            H2Icon,
            H3Icon,
            H4Icon,
            H5Icon,
            TextTypeIcon,
            TitleTypeIcon,
            SubtitleTypeIcon,
            TodoListDoubleIcon,
            DefaultTextColorIcon,
            HeaderTextColorIcon,
            MoreRightIcon,
            MoreLeftIcon,
            'DocParagraphTextColorSwatchIcon.0': DocParagraphTextColorSwatchIcon0,
            'DocParagraphTextColorSwatchIcon.1': DocParagraphTextColorSwatchIcon1,
            'DocParagraphTextColorSwatchIcon.2': DocParagraphTextColorSwatchIcon2,
            'DocParagraphTextColorSwatchIcon.3': DocParagraphTextColorSwatchIcon3,
            'DocParagraphTextColorSwatchIcon.4': DocParagraphTextColorSwatchIcon4,
            'DocParagraphTextColorSwatchIcon.5': DocParagraphTextColorSwatchIcon5,
            'DocParagraphTextColorSwatchIcon.6': DocParagraphTextColorSwatchIcon6,
            'DocParagraphBackgroundColorSwatchIcon.0': DocParagraphBackgroundColorSwatchIcon0,
            'DocParagraphBackgroundColorSwatchIcon.1': DocParagraphBackgroundColorSwatchIcon1,
            'DocParagraphBackgroundColorSwatchIcon.2': DocParagraphBackgroundColorSwatchIcon2,
            'DocParagraphBackgroundColorSwatchIcon.3': DocParagraphBackgroundColorSwatchIcon3,
            'DocParagraphBackgroundColorSwatchIcon.4': DocParagraphBackgroundColorSwatchIcon4,
            'DocParagraphBackgroundColorSwatchIcon.5': DocParagraphBackgroundColorSwatchIcon5,
            'DocParagraphBackgroundColorSwatchIcon.6': DocParagraphBackgroundColorSwatchIcon6,
            'DocParagraphBackgroundColorSwatchIcon.7': DocParagraphBackgroundColorSwatchIcon7,
            'DocParagraphBackgroundColorSwatchIcon.8': DocParagraphBackgroundColorSwatchIcon8,
            'DocParagraphBackgroundColorSwatchIcon.9': DocParagraphBackgroundColorSwatchIcon9,
            'DocParagraphBackgroundColorSwatchIcon.10': DocParagraphBackgroundColorSwatchIcon10,
            'DocParagraphBackgroundColorSwatchIcon.11': DocParagraphBackgroundColorSwatchIcon11,
            'DocParagraphBackgroundColorSwatchIcon.12': DocParagraphBackgroundColorSwatchIcon12,
            'DocParagraphBackgroundColorSwatchIcon.13': DocParagraphBackgroundColorSwatchIcon13,
            'DocParagraphBackgroundColorSwatchIcon.14': DocParagraphBackgroundColorSwatchIcon14,
        }));
    }

    private _initCustomComponents(): void {
        ([
            [BULLET_LIST_TYPE_COMPONENT, BulletListTypePicker],
            [ORDER_LIST_TYPE_COMPONENT, OrderListTypePicker],
            [DOC_PARAGRAPH_MENU_COMPONENT_KEY, ParagraphMenu],
            [DOC_TABLE_BLOCK_MENU_COMPONENT_KEY, TableBlockMenu],
            [PAGE_SETTING_COMPONENT_ID, PageSettings],
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
        this._menuManagerService.appendRootMenu(floatToolbarMenuSchema);
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
        this._registerIcons();
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
