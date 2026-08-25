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

import { Injector, IPermissionService, IUniverInstanceService, PermissionService, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService, setDocumentPermissionValue } from '@univerjs/docs';
import { UnitAction } from '@univerjs/protocol';
import { firstValueFrom, of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { CopyMenuFactory, ParagraphSettingMenuFactory, PasteMenuFactory, SectionSettingMenuFactory } from '../context-menu';

describe('settings context menu factories', () => {
    it('does not show leading icons', () => {
        const accessor = new Injector([
            [DocSelectionManagerService, {
                useValue: {
                    textSelection$: of(null),
                    getActiveTextRange: () => null,
                },
            }],
            [IUniverInstanceService, {
                useValue: {
                    focused$: of('doc-1'),
                    getCurrentTypeOfUnit$: () => of({ getUnitId: () => 'doc-1' }),
                    getUnitType: () => UniverInstanceType.UNIVER_DOC,
                },
            }],
            [IPermissionService, { useClass: PermissionService }],
        ]);

        expect(ParagraphSettingMenuFactory(accessor).icon).toBeUndefined();
        expect(SectionSettingMenuFactory(accessor).icon).toBeUndefined();

        accessor.dispose();
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
        if (!copyDisabled$) throw new Error('Copy menu must expose disabled state.');
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
        if (!pasteDisabled$ || !paragraphSettingDisabled$) throw new Error('Mutating menus must expose disabled state.');
        expect(await firstValueFrom(pasteDisabled$)).toBe(true);
        expect(await firstValueFrom(paragraphSettingDisabled$)).toBe(true);

        accessor.dispose();
    });
});
