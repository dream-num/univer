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

import { Injector, IPermissionService, IUniverInstanceService, PermissionService } from '@univerjs/core';
import { DocSelectionManagerService, setDocumentPermissionValue } from '@univerjs/docs';
import { UnitAction } from '@univerjs/protocol';
import { ContextMenuGroup } from '@univerjs/ui';
import { firstValueFrom, of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { DocPasteCommand, DocPasteSpecialCommand } from '../../commands/commands/clipboard.command';
import { DocSelectAllCommand, DocSelectWordCommand } from '../../commands/commands/doc-select-all.command';
import { DOC_CARET_MENU_ID } from '../../consts/mobile-context';
import {
    CopyMenuFactory,
    ParagraphSettingMenuFactory,
    PasteMenuFactory,
    PasteSpecialMenuFactory,
    SelectAllMenuFactory,
    SelectWordMenuFactory,
} from '../context-menu';
import { mobileMenuSchema } from '../mobile-schema';

describe('settings context menu factories', () => {
    it('registers a mobile caret menu with both paste and format choices', () => {
        const caretMenu = Object.entries(mobileMenuSchema).find(([position]) => position === DOC_CARET_MENU_ID)?.[1];

        expect(caretMenu).toEqual({
            [ContextMenuGroup.QUICK]: {
                quickLayout: 'tile',
                [DocPasteCommand.id]: { order: 0, menuItemFactory: PasteMenuFactory },
                [DocPasteSpecialCommand.id]: { order: 0.5, menuItemFactory: PasteSpecialMenuFactory },
                [DocSelectWordCommand.id]: { order: 1, menuItemFactory: SelectWordMenuFactory },
                [DocSelectAllCommand.id]: { order: 2, menuItemFactory: SelectAllMenuFactory },
            },
        });
    });

    it('disables copy without Unit Copy while keeping copy available in read-only mode', async () => {
        const permissionService = new PermissionService();
        const accessor = new Injector([
            [DocSelectionManagerService, {
                useValue: {
                    textSelection$: of({}),
                    getDocRanges: () => [{ collapsed: false }],
                },
            }],
            [IUniverInstanceService, {
                useValue: {
                    getCurrentTypeOfUnit$: () => of({ getUnitId: () => 'doc-1' }),
                },
            }],
            [IPermissionService, { useValue: permissionService }],
        ]);

        setDocumentPermissionValue(permissionService, 'doc-1', 'doc-1', UnitAction.Copy, false);
        const copyDisabled$ = CopyMenuFactory(accessor).disabled$;
        if (!copyDisabled$) {
            throw new Error('Copy menu must expose disabled state.');
        }
        expect(await firstValueFrom(copyDisabled$)).toBe(true);

        setDocumentPermissionValue(permissionService, 'doc-1', 'doc-1', UnitAction.Copy, true);
        setDocumentPermissionValue(permissionService, 'doc-1', 'doc-1', UnitAction.Edit, false);
        expect(await firstValueFrom(copyDisabled$)).toBe(false);

        accessor.dispose();
    });

    it('disables mutating context-menu actions in read-only mode', async () => {
        const permissionService = new PermissionService();
        const accessor = new Injector([
            [IUniverInstanceService, {
                useValue: {
                    getCurrentTypeOfUnit$: () => of({ getUnitId: () => 'doc-1' }),
                },
            }],
            [IPermissionService, { useValue: permissionService }],
        ]);
        setDocumentPermissionValue(permissionService, 'doc-1', 'doc-1', UnitAction.Edit, false);

        const pasteDisabled$ = PasteMenuFactory(accessor).disabled$;
        const paragraphSettingDisabled$ = ParagraphSettingMenuFactory(accessor).disabled$;
        if (!pasteDisabled$ || !paragraphSettingDisabled$) {
            throw new Error('Mutating menus must expose disabled state.');
        }
        expect(await firstValueFrom(pasteDisabled$)).toBe(true);
        expect(await firstValueFrom(paragraphSettingDisabled$)).toBe(true);

        accessor.dispose();
    });
});
