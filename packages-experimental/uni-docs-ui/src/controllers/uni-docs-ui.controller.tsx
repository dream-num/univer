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

import { ICommandService, Inject, Injector, IUniverInstanceService, LifecycleStages, OnLifecycle, UniverInstanceType } from '@univerjs/core';
import type { IMenuItemFactory } from '@univerjs/ui';
import { ComponentManager, ILayoutService, IMenuService, IShortcutService, IUIPartsService } from '@univerjs/ui';
import { BuiltinUniToolbarItemId, generateCloneMutation, UniToolbarService } from '@univerjs/uniui';
import type { IUniverDocsUIConfig } from '@univerjs/docs-ui';
import { DocUIController } from '@univerjs/docs-ui';
import { SetInlineFormatBoldCommand, SetInlineFormatFontFamilyCommand, SetInlineFormatFontSizeCommand, SetInlineFormatItalicCommand, SetInlineFormatStrikethroughCommand, SetInlineFormatTextBackgroundColorCommand, SetInlineFormatTextColorCommand, SetInlineFormatUnderlineCommand } from '@univerjs/docs';
import { IMAGE_MENU_ID as DocsImageMenuId } from '@univerjs/docs-drawing-ui';
import { DOC_BOLD_MUTATION_ID, DOC_ITALIC_MUTATION_ID, DOC_STRIKE_MUTATION_ID, DOC_UNDERLINE_MUTATION_ID, DocBoldMenuItemFactory, DocItalicMenuItemFactory, DocStrikeThroughMenuItemFactory, DocUnderlineMenuItemFactory } from './menu';

@OnLifecycle(LifecycleStages.Ready, UniDocsUIController)
export class UniDocsUIController extends DocUIController {
    constructor(
        config: Partial<IUniverDocsUIConfig>,
        @Inject(Injector) injector: Injector,
        @Inject(ComponentManager) componentManager: ComponentManager,
        @ICommandService commandService: ICommandService,
        @ILayoutService layoutService: ILayoutService,
        @IMenuService menuService: IMenuService,
        @IUIPartsService uiPartsService: IUIPartsService,
        @IUniverInstanceService univerInstanceService: IUniverInstanceService,
        @IShortcutService shortcutService: IShortcutService,
        @Inject(UniToolbarService) private readonly _toolbarService: UniToolbarService

    ) {
        super(
            config,
            injector,
            componentManager,
            commandService,
            layoutService,
            menuService,
            uiPartsService,
            univerInstanceService,
            shortcutService
        );
        this._initUniMenus();
        this._initMutations();
    }

    private _initUniMenus(): void {
        ([
            [BuiltinUniToolbarItemId.FONT_FAMILY, SetInlineFormatFontFamilyCommand.id],
            [BuiltinUniToolbarItemId.FONT_SIZE, SetInlineFormatFontSizeCommand.id],
            [BuiltinUniToolbarItemId.COLOR, SetInlineFormatTextColorCommand.id],
            [BuiltinUniToolbarItemId.BACKGROUND, SetInlineFormatTextBackgroundColorCommand.id],
            [BuiltinUniToolbarItemId.IMAGE, DocsImageMenuId],
        ]).forEach(([id, menuId]) => {
            this.disposeWithMe(this._toolbarService.implementItem(id, { id: menuId, type: UniverInstanceType.UNIVER_DOC }));
        });

        (
            [
                DocBoldMenuItemFactory,
                DocItalicMenuItemFactory,
                DocUnderlineMenuItemFactory,
                DocStrikeThroughMenuItemFactory,
            ] as IMenuItemFactory[]
        ).forEach((factory) => {
            this.disposeWithMe(this._menuService.addMenuItem(this._injector.invoke(factory), {}));
        });
    }

    private _initMutations() {
        [
            generateCloneMutation(DOC_BOLD_MUTATION_ID, SetInlineFormatBoldCommand),
            generateCloneMutation(DOC_ITALIC_MUTATION_ID, SetInlineFormatItalicCommand),
            generateCloneMutation(DOC_UNDERLINE_MUTATION_ID, SetInlineFormatUnderlineCommand),
            generateCloneMutation(DOC_STRIKE_MUTATION_ID, SetInlineFormatStrikethroughCommand),
        ].forEach((mutation) => {
            this.disposeWithMe(this._commandService.registerCommand(mutation));
        });
    }
}

