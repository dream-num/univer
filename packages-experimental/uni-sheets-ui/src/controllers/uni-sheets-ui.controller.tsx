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

import type { Workbook } from '@univerjs/core';
import { ICommandService, IConfigService, Inject, Injector, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { SetBackgroundColorCommand } from '@univerjs/sheets';
import { SHEETS_IMAGE_MENU_ID } from '@univerjs/sheets-drawing-ui';
import { RenderSheetContent, SetRangeBoldCommand, SetRangeFontFamilyCommand, SetRangeFontSizeCommand, SetRangeItalicCommand, SetRangeStrickThroughCommand, SetRangeTextColorCommand, SetRangeUnderlineCommand, SheetUIController } from '@univerjs/sheets-ui';
import { BuiltInUIPart, ComponentManager, connectInjector, ILayoutService, IMenuManagerService, IShortcutService, IUIPartsService, useDependency, useObservable } from '@univerjs/ui';
import { BuiltinUniToolbarItemId, generateCloneMutation, UniToolbarService, UniUIPart } from '@univerjs/uniui';
import React from 'react';
import { UniSheetBar } from '../views/uni-sheet-bar/UniSheetBar';
import { SHEET_BOLD_MUTATION_ID, SHEET_ITALIC_MUTATION_ID, SHEET_STRIKE_MUTATION_ID, SHEET_UNDERLINE_MUTATION_ID } from './menu';
import { menuSchema } from './menu.schema';

export class UniSheetsUIController extends SheetUIController {
    constructor(
        @Inject(Injector) injector: Injector,
        @Inject(ComponentManager) componentManager: ComponentManager,
        @ILayoutService layoutService: ILayoutService,
        @ICommandService commandService: ICommandService,
        @IShortcutService shortcutService: IShortcutService,
        @IMenuManagerService menuManagerService: IMenuManagerService,
        @IUIPartsService uiPartsService: IUIPartsService,
        @IConfigService configService: IConfigService,
        @Inject(UniToolbarService) private readonly _toolbarService: UniToolbarService
    ) {
        super(
            injector,
            componentManager,
            layoutService,
            commandService,
            shortcutService,
            menuManagerService,
            uiPartsService,
            configService
        );
        this._initUniMenus();
        this._initMutations();
    }

    protected override _initWorkbenchParts(): void {
        const uiController = this._uiPartsService;
        const injector = this._injector;

        this.disposeWithMe(uiController.registerComponent(UniUIPart.OUTLINE, () => connectInjector(RenderOutline, injector)));
        this.disposeWithMe(uiController.registerComponent(BuiltInUIPart.CONTENT, () => connectInjector(RenderSheetContent, injector)));
    }

    private _initUniMenus(): void {
        this._menuManagerService.appendRootMenu(menuSchema);

        ([
            [BuiltinUniToolbarItemId.FONT_FAMILY, SetRangeFontFamilyCommand.id],
            [BuiltinUniToolbarItemId.FONT_SIZE, SetRangeFontSizeCommand.id],
            [BuiltinUniToolbarItemId.COLOR, SetRangeTextColorCommand.id],
            [BuiltinUniToolbarItemId.BACKGROUND, SetBackgroundColorCommand.id],
            [BuiltinUniToolbarItemId.IMAGE, SHEETS_IMAGE_MENU_ID],
        ]).forEach(([id, menuId]) => {
            this._toolbarService.implementItem(id, { id: menuId, type: UniverInstanceType.UNIVER_SHEET });
        });
    }

    private _initMutations() {
        [
            generateCloneMutation(SHEET_BOLD_MUTATION_ID, SetRangeBoldCommand),
            generateCloneMutation(SHEET_ITALIC_MUTATION_ID, SetRangeItalicCommand),
            generateCloneMutation(SHEET_UNDERLINE_MUTATION_ID, SetRangeUnderlineCommand),
            generateCloneMutation(SHEET_STRIKE_MUTATION_ID, SetRangeStrickThroughCommand),
        ].forEach((mutation) => {
            this.disposeWithMe(this._commandService.registerCommand(mutation));
        });
    }
}

function RenderOutline() {
    const univerInstanceService = useDependency(IUniverInstanceService);
    const focused = useObservable(univerInstanceService.focused$);
    const workbook = useObservable(() => univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET), null, false, []);

    if (!workbook || focused !== workbook?.getUnitId()) return null;

    return (
        <UniSheetBar />
    );
}
