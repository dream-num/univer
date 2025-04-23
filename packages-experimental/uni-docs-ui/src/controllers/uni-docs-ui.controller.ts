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

import { ICommandService, IConfigService, Inject, Injector, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { DOCS_IMAGE_MENU_ID } from '@univerjs/docs-drawing-ui';
import {
    BulletListCommand,
    DocCreateTableOperation,
    DocUIController,
    OrderListCommand,
    SetInlineFormatBoldCommand,
    SetInlineFormatFontFamilyCommand,
    SetInlineFormatFontSizeCommand,
    SetInlineFormatItalicCommand,
    SetInlineFormatStrikethroughCommand,
    SetInlineFormatTextBackgroundColorCommand,
    SetInlineFormatTextColorCommand,
    SetInlineFormatUnderlineCommand,
} from '@univerjs/docs-ui';
import { ComponentManager, ILayoutService, IMenuManagerService, IShortcutService, IUIPartsService } from '@univerjs/ui';
import { BuiltinUniToolbarItemId, generateCloneMutation, UniToolbarService } from '@univerjs/uniui';
import { DOC_BOLD_MUTATION_ID, DOC_ITALIC_MUTATION_ID, DOC_STRIKE_MUTATION_ID, DOC_TABLE_MUTATION_ID, DOC_UNDERLINE_MUTATION_ID } from './menu';
import { menuSchema } from './menu.schema';

export class UniDocsUIController extends DocUIController {
    constructor(
        @Inject(Injector) injector: Injector,
        @Inject(ComponentManager) componentManager: ComponentManager,
        @ICommandService commandService: ICommandService,
        @ILayoutService layoutService: ILayoutService,
        @IMenuManagerService menuManagerService: IMenuManagerService,
        @IUIPartsService uiPartsService: IUIPartsService,
        @IUniverInstanceService univerInstanceService: IUniverInstanceService,
        @IShortcutService shortcutService: IShortcutService,
        @IConfigService configService: IConfigService,
        @Inject(UniToolbarService) private readonly _toolbarService: UniToolbarService
    ) {
        super(
            injector,
            componentManager,
            commandService,
            layoutService,
            menuManagerService,
            uiPartsService,
            univerInstanceService,
            shortcutService,
            configService
        );

        this._initUniMenus();
        this._initMutations();
    }

    private _initUniMenus(): void {
        this._menuManagerService.appendRootMenu(menuSchema);

        ([
            [BuiltinUniToolbarItemId.FONT_FAMILY, SetInlineFormatFontFamilyCommand.id],
            [BuiltinUniToolbarItemId.FONT_SIZE, SetInlineFormatFontSizeCommand.id],
            [BuiltinUniToolbarItemId.COLOR, SetInlineFormatTextColorCommand.id],
            [BuiltinUniToolbarItemId.BACKGROUND, SetInlineFormatTextBackgroundColorCommand.id],
            [BuiltinUniToolbarItemId.IMAGE, DOCS_IMAGE_MENU_ID],
            [BuiltinUniToolbarItemId.TABLE, DOC_TABLE_MUTATION_ID],
            [BuiltinUniToolbarItemId.ORDER_LIST, OrderListCommand.id],
            [BuiltinUniToolbarItemId.UNORDER_LIST, BulletListCommand.id],
        ]).forEach(([id, menuId]) => {
            this.disposeWithMe(this._toolbarService.implementItem(id, { id: menuId, type: UniverInstanceType.UNIVER_DOC }));
        });
    }

    private _initMutations() {
        [
            generateCloneMutation(DOC_BOLD_MUTATION_ID, SetInlineFormatBoldCommand),
            generateCloneMutation(DOC_ITALIC_MUTATION_ID, SetInlineFormatItalicCommand),
            generateCloneMutation(DOC_UNDERLINE_MUTATION_ID, SetInlineFormatUnderlineCommand),
            generateCloneMutation(DOC_STRIKE_MUTATION_ID, SetInlineFormatStrikethroughCommand),
            generateCloneMutation(DOC_TABLE_MUTATION_ID, DocCreateTableOperation),
        ].forEach((mutation) => {
            this.disposeWithMe(this._commandService.registerCommand(mutation));
        });
    }
}
