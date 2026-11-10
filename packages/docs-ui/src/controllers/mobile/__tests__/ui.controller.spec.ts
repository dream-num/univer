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

// @vitest-environment jsdom

import { LocaleType, Univer } from '@univerjs/core';
import { UniverDocsPlugin } from '@univerjs/docs';
import {
    ContextMenuGroup,
    ContextMenuPosition,
    DesktopLayoutService,
    ILayoutService,
    IMenuManagerService,
    IUIPartsService,
    IWorkbenchService,
    MenuItemType,
    MenuManagerService,
    UIPartsService,
    WorkbenchService,
} from '@univerjs/ui';
import { afterEach, describe, expect, it } from 'vitest';
import { DocCopyCommand, DocCutCommand, DocPasteCommand } from '../../../commands/commands/clipboard.command';
import { DocSelectAllCommand, DocSelectWordCommand } from '../../../commands/commands/doc-select-all.command';
import { DOC_CARET_MENU_ID } from '../../../consts/mobile-context';
import enUS from '../../../locale/en-US';
import { DocMobileUIController } from '../ui.controller';

describe('DocMobileUIController', () => {
    const instances: Univer[] = [];

    afterEach(() => instances.splice(0).forEach((univer) => univer.dispose()));

    it.each([true, false])('preserves other main-area menus registered before docs=%s', (registerBeforeDocs) => {
        const univer = new Univer({ locale: LocaleType.EN_US, locales: { [LocaleType.EN_US]: enUS } });
        instances.push(univer);
        univer.registerPlugin(UniverDocsPlugin);
        const injector = univer.__getInjector();
        injector.add([IMenuManagerService, { useClass: MenuManagerService }]);
        injector.add([ILayoutService, { useClass: DesktopLayoutService }]);
        injector.add([IUIPartsService, { useClass: UIPartsService }]);
        injector.add([IWorkbenchService, { useClass: WorkbenchService }]);
        injector.add([DocMobileUIController]);
        const menus = injector.get(IMenuManagerService);
        const sheetMenu = {
            [ContextMenuPosition.MAIN_AREA]: {
                [ContextMenuGroup.QUICK]: {
                    copy: { order: 0, menuItemFactory: () => ({ id: 'sheet-copy', type: MenuItemType.BUTTON }) },
                },
                [ContextMenuGroup.FORMAT]: {
                    clear: { order: 0, menuItemFactory: () => ({ id: 'sheet-clear', type: MenuItemType.BUTTON }) },
                },
                [ContextMenuGroup.LAYOUT]: {
                    insert: { order: 0, menuItemFactory: () => ({ id: 'sheet-insert', type: MenuItemType.BUTTON }) },
                },
            },
        };

        if (registerBeforeDocs) {
            menus.mergeMenu(sheetMenu);
        }
        injector.get(DocMobileUIController);
        if (!registerBeforeDocs) {
            menus.mergeMenu(sheetMenu);
        }
        menus.mergeMenu({
            [ContextMenuPosition.MAIN_AREA]: {
                [ContextMenuGroup.DATA]: {
                    sort: { order: 0, menuItemFactory: () => ({ id: 'sheet-sort', type: MenuItemType.BUTTON }) },
                },
            },
        });

        const mainAreaIds = menus.getFlatMenuByPositionKey(ContextMenuPosition.MAIN_AREA).map((entry) => entry.item?.id);
        expect(mainAreaIds).toEqual(expect.arrayContaining([
            'sheet-copy',
            'sheet-clear',
            'sheet-insert',
            'sheet-sort',
            DocCopyCommand.name,
            DocCutCommand.id,
            DocPasteCommand.id,
            DocSelectWordCommand.id,
            DocSelectAllCommand.id,
        ]));
        expect(menus.getFlatMenuByPositionKey(DOC_CARET_MENU_ID).map((entry) => entry.item?.id)).toEqual(
            expect.arrayContaining([DocPasteCommand.id, DocSelectWordCommand.id, DocSelectAllCommand.id])
        );
    });
});
