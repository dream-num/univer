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

import { Disposable, ICommandService, Inject, Injector, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { DownloadSingle, LockSingle, PrintSingle, ShareSingle, ZenSingle } from '@univerjs/icons';
import type { IMenuItemFactory, MenuConfig } from '@univerjs/ui';
import { ComponentManager, IMenuService } from '@univerjs/ui';
import { SetRangeBoldCommand, SetRangeItalicCommand, SetRangeStrickThroughCommand, SetRangeUnderlineCommand } from '@univerjs/sheets-ui';
import { SetInlineFormatBoldCommand, SetInlineFormatItalicCommand, SetInlineFormatStrikethroughCommand, SetInlineFormatUnderlineCommand } from '@univerjs/docs';
import { generateCloneMutation } from '../controllers/utils';
import { DOC_BOLD_MUTATION_ID, DOC_ITALIC_MUTATION_ID, DOC_STRIKE_MUTATION_ID, DOC_UNDERLINE_MUTATION_ID, DocBoldMenuItemFactory, DocItalicMenuItemFactory, DocStrikeThroughMenuItemFactory, DocUnderlineMenuItemFactory, DownloadMenuItemFactory, FakeBackgroundColorSelectorMenuItemFactory, FakeFontFamilySelectorMenuItemFactory, FakeFontSizeSelectorMenuItemFactory, FakeImageMenuFactory, FakeTextColorSelectorMenuItemFactory, FontGroupMenuItemFactory, LockMenuItemFactory, PrintMenuItemFactory, ShareMenuItemFactory, SHEET_BOLD_MUTATION_ID, SHEET_ITALIC_MUTATION_ID, SHEET_STRIKE_MUTATION_ID, SHEET_UNDERLINE_MUTATION_ID, SheetBoldMenuItemFactory, SheetItalicMenuItemFactory, SheetStrikeThroughMenuItemFactory, SheetUnderlineMenuItemFactory, ZenMenuItemFactory } from './menu';

export interface IUniuiToolbarConfig {
    menu: MenuConfig;
}

export const DefaultUniuiToolbarConfig = {};

@OnLifecycle(LifecycleStages.Ready, UniuiToolbarController)
export class UniuiToolbarController extends Disposable {
    constructor(
        @IMenuService protected readonly _menuService: IMenuService,
        @Inject(Injector) protected readonly _injector: Injector,
        @Inject(ComponentManager) protected readonly _componentManager: ComponentManager,
        @ICommandService protected readonly _commandService: ICommandService
    ) {
        super();
        this._initComponent();
        this._initMenus();
        this._initMutations();
    }

    private _initMutations() {
        [
            generateCloneMutation(SHEET_BOLD_MUTATION_ID, SetRangeBoldCommand),
            generateCloneMutation(SHEET_ITALIC_MUTATION_ID, SetRangeItalicCommand),
            generateCloneMutation(SHEET_UNDERLINE_MUTATION_ID, SetRangeUnderlineCommand),
            generateCloneMutation(SHEET_STRIKE_MUTATION_ID, SetRangeStrickThroughCommand),
            generateCloneMutation(DOC_BOLD_MUTATION_ID, SetInlineFormatBoldCommand),
            generateCloneMutation(DOC_ITALIC_MUTATION_ID, SetInlineFormatItalicCommand),
            generateCloneMutation(DOC_UNDERLINE_MUTATION_ID, SetInlineFormatUnderlineCommand),
            generateCloneMutation(DOC_STRIKE_MUTATION_ID, SetInlineFormatStrikethroughCommand),
        ].forEach((mutation) => {
            this.disposeWithMe(this._commandService.registerCommand(mutation));
        });
    }

    private _initComponent(): void {
        const componentManager = this._componentManager;
        const iconList: Record<string, React.ForwardRefExoticComponent<any>> = {
            DownloadSingle,
            ShareSingle,
            LockSingle,
            PrintSingle,
            ZenSingle,
        };
        for (const k in iconList) {
            this.disposeWithMe(componentManager.register(k, iconList[k]));
        }
    }

    private _initMenus(): void {
        (
            [
                DownloadMenuItemFactory,
                ShareMenuItemFactory,
                LockMenuItemFactory,
                PrintMenuItemFactory,
                ZenMenuItemFactory,
                FontGroupMenuItemFactory,
                SheetBoldMenuItemFactory,
                SheetItalicMenuItemFactory,
                SheetUnderlineMenuItemFactory,
                SheetStrikeThroughMenuItemFactory,
                DocBoldMenuItemFactory,
                DocItalicMenuItemFactory,
                DocUnderlineMenuItemFactory,
                DocStrikeThroughMenuItemFactory,
                FakeFontFamilySelectorMenuItemFactory,
                FakeTextColorSelectorMenuItemFactory,
                FakeFontSizeSelectorMenuItemFactory,
                FakeBackgroundColorSelectorMenuItemFactory,
                FakeImageMenuFactory,
            ] as IMenuItemFactory[]
        ).forEach((factory) => {
            this.disposeWithMe(this._menuService.addMenuItem(this._injector.invoke(factory), {}));
        });
    }
}

