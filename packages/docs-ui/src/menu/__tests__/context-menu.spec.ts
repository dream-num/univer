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
    IPermissionService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { DocSelectionManagerService, setDocumentPermissionValue, UniverDocsPlugin } from '@univerjs/docs';
import { NORMAL_TEXT_SELECTION_PLUGIN_STYLE } from '@univerjs/engine-render';
import { UnitAction } from '@univerjs/protocol';
import { ContextMenuGroup, ContextMenuPosition, MenuItemType, RibbonStartGroup } from '@univerjs/ui';
import { firstValueFrom } from 'rxjs';
import { afterEach, describe, expect, it } from 'vitest';
import { DocPasteCommand, DocPasteSpecialCommand } from '../../commands/commands/clipboard.command';
import { DocSelectAllCommand, DocSelectWordCommand } from '../../commands/commands/doc-select-all.command';
import { DOC_CARET_MENU_ID } from '../../consts/mobile-context';
import enUS from '../../locale/en-US';
import {
    CopyMenuFactory,
    ParagraphSettingMenuFactory,
    PasteMenuFactory,
    PasteRibbonMenuFactory,
    PasteSpecialMenuFactory,
    SelectAllMenuFactory,
    SelectWordMenuFactory,
} from '../context-menu';
import { mobileMenuSchema } from '../mobile-schema';
import { menuSchema } from '../schema';

describe('settings context menu factories', () => {
    const instances: Univer[] = [];
    afterEach(() => instances.splice(0).forEach((univer) => univer.dispose()));

    function createMenuTestBed() {
        const univer = new Univer({ locale: LocaleType.EN_US, locales: { [LocaleType.EN_US]: enUS } });
        instances.push(univer);
        univer.registerPlugin(UniverDocsPlugin);
        univer.createUnit(UniverInstanceType.UNIVER_DOC, {
            id: 'doc-1',
            body: { dataStream: 'Selected text\r\n' },
        });
        const accessor = univer.__getInjector();
        accessor.get(LocaleService).setDirection('ltr');
        accessor.get(IUniverInstanceService).setCurrentUnitForType('doc-1');
        return accessor;
    }

    it('keeps ordinary paste in the mobile quick tiles and paste special in a separate menu row', () => {
        const caretMenu = Object.entries(mobileMenuSchema).find(([position]) => position === DOC_CARET_MENU_ID)?.[1];

        expect(caretMenu).toEqual({
            [ContextMenuGroup.QUICK]: {
                quickLayout: 'tile',
                [DocPasteCommand.id]: { order: 0, menuItemFactory: PasteMenuFactory },
                [DocSelectWordCommand.id]: { order: 1, menuItemFactory: SelectWordMenuFactory },
                [DocSelectAllCommand.id]: { order: 2, menuItemFactory: SelectAllMenuFactory },
            },
            [ContextMenuGroup.FORMAT]: {
                order: 1,
                [DocPasteSpecialCommand.id]: { order: 0, menuItemFactory: PasteSpecialMenuFactory },
            },
        });
    });

    it('places paste special outside desktop quick tiles and uses a standard ribbon selector', () => {
        const desktopMenu = Object.entries(menuSchema).find(([position]) => position === ContextMenuPosition.MAIN_AREA)?.[1];
        const ribbonMenu = Object.entries(menuSchema).find(([position]) => position === RibbonStartGroup.HISTORY)?.[1];
        expect(desktopMenu[ContextMenuGroup.QUICK][DocPasteCommand.id].menuItemFactory).toBe(PasteMenuFactory);
        expect(desktopMenu[ContextMenuGroup.QUICK][DocPasteSpecialCommand.id]).toBeUndefined();
        expect(desktopMenu[ContextMenuGroup.FORMAT][DocPasteSpecialCommand.id].menuItemFactory).toBe(PasteSpecialMenuFactory);
        expect(ribbonMenu[DocPasteSpecialCommand.id].menuItemFactory).toBe(PasteRibbonMenuFactory);
    });

    it('disables copy without Unit Copy while keeping copy available in read-only mode', () => {
        const accessor = createMenuTestBed();
        const permissionService = accessor.get(IPermissionService);

        setDocumentPermissionValue(permissionService, 'doc-1', 'doc-1', UnitAction.Copy, false);
        const copyDisabled$ = CopyMenuFactory(accessor).disabled$;
        if (!copyDisabled$) {
            throw new Error('Copy menu must expose disabled state.');
        }
        const disabled: boolean[] = [];
        const subscription = copyDisabled$.subscribe((value) => disabled.push(value));
        try {
            accessor.get(DocSelectionManagerService).__replaceTextRangesWithNoRefresh({
                textRanges: [{ startOffset: 0, endOffset: 8, collapsed: false, isActive: true }],
                rectRanges: [],
                segmentId: '',
                segmentPage: -1,
                isEditing: false,
                style: NORMAL_TEXT_SELECTION_PLUGIN_STYLE,
            }, { unitId: 'doc-1', subUnitId: 'doc-1' });
            expect(disabled.pop()).toBe(true);

            setDocumentPermissionValue(permissionService, 'doc-1', 'doc-1', UnitAction.Copy, true);
            setDocumentPermissionValue(permissionService, 'doc-1', 'doc-1', UnitAction.Edit, false);
            expect(disabled.pop()).toBe(false);
        } finally {
            subscription.unsubscribe();
        }
    });

    it('disables mutating context-menu actions in read-only mode', async () => {
        const accessor = createMenuTestBed();
        const permissionService = accessor.get(IPermissionService);
        setDocumentPermissionValue(permissionService, 'doc-1', 'doc-1', UnitAction.Edit, false);

        expect(PasteMenuFactory(accessor).type).toBe(MenuItemType.BUTTON);
        expect(PasteRibbonMenuFactory(accessor).type).toBe(MenuItemType.SELECTOR);
        const pasteSpecial = PasteSpecialMenuFactory(accessor);
        expect(pasteSpecial.type).toBe(MenuItemType.SELECTOR);
        expect(pasteSpecial.selections).toEqual([
            { value: 'source', label: 'docs-ui.pasteOptions.source' },
            { value: 'destination', label: 'docs-ui.pasteOptions.destination' },
            { value: 'text', label: 'docs-ui.pasteOptions.text' },
        ]);
        expect(await firstValueFrom(pasteSpecial.disabled$!)).toBe(true);
        const pasteDisabled$ = PasteMenuFactory(accessor).disabled$;
        const paragraphSettingDisabled$ = ParagraphSettingMenuFactory(accessor).disabled$;
        if (!pasteDisabled$ || !paragraphSettingDisabled$) {
            throw new Error('Mutating menus must expose disabled state.');
        }
        expect(await firstValueFrom(pasteDisabled$)).toBe(true);
        expect(await firstValueFrom(paragraphSettingDisabled$)).toBe(true);
    });
});
