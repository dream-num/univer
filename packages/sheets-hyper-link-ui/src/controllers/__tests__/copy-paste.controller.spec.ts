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

import type { ISheetClipboardHook } from '@univerjs/sheets-ui';
import { ICommandService, LocaleService, LocaleType, ObjectMatrix, Univer, UniverInstanceType } from '@univerjs/core';
import { DefinedNamesService, IDefinedNamesService } from '@univerjs/engine-formula';
import { IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import { SheetSkeletonService, SheetsSelectionsService } from '@univerjs/sheets';
import { AddHyperLinkMutation, HyperLinkModel, RemoveHyperLinkMutation } from '@univerjs/sheets-hyper-link';
import {
    COPY_TYPE,
    IMarkSelectionService,
    ISheetClipboardService,
    MarkSelectionService,
    PREDEFINED_HOOK_NAME_PASTE,
    SheetClipboardService,
} from '@univerjs/sheets-ui';
import {
    BrowserClipboardService,
    DesktopMessageService,
    IClipboardInterfaceService,
    IMessageService,
    INotificationService,
    IPlatformService,
    IUIPartsService,
    UIPartsService,
} from '@univerjs/ui';
import { describe, expect, it } from 'vitest';
import enUS from '../../locale/en-US';
import { SheetsHyperLinkResolverService } from '../../services/resolver.service';
import { SheetsHyperLinkCopyPasteController } from '../copy-paste.controller';

describe('SheetsHyperLinkCopyPasteController', () => {
    it('pastes hyperlinks from the same discrete rows as copied cell values and supports undo', () => {
        const univer = new Univer();
        const injector = univer.__getInjector();
        injector.add([IUIPartsService, { useClass: UIPartsService }]);
        injector.add([SheetsSelectionsService]);
        injector.add([HyperLinkModel]);
        injector.add([SheetsHyperLinkCopyPasteController]);
        injector.add([SheetsHyperLinkResolverService]);
        injector.add([IDefinedNamesService, { useClass: DefinedNamesService }]);
        injector.add([IMessageService, { useClass: DesktopMessageService }]);
        injector.add([IClipboardInterfaceService, { useClass: BrowserClipboardService }]);
        injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
        injector.add([SheetSkeletonService]);
        injector.add([IMarkSelectionService, { useClass: MarkSelectionService }]);
        injector.add([INotificationService, { useValue: { show: () => ({ dispose: () => {} }) } }]);
        injector.add([IPlatformService, { useValue: { isWindows: true, isMac: false, isLinux: false } }]);
        injector.add([ISheetClipboardService, { useClass: SheetClipboardService }]);
        const clipboard = injector.get(ISheetClipboardService) as SheetClipboardService;
        univer.createUnit(UniverInstanceType.UNIVER_SHEET, {
            id: 'source',
            locale: LocaleType.EN_US,
            sheetOrder: ['sheet'],
            sheets: { sheet: { id: 'sheet', name: 'Sheet', cellData: {} } },
        });
        const locale = injector.get(LocaleService);
        locale.load({ 'en-US': enUS });
        locale.setLocale(LocaleType.EN_US);
        locale.setDirection('ltr');
        const model = injector.get(HyperLinkModel);
        const commands = injector.get(ICommandService);
        commands.registerCommand(AddHyperLinkMutation);
        commands.registerCommand(RemoveHyperLinkMutation);
        try {
            injector.get(SheetsHyperLinkCopyPasteController);
            ['A', 'B', 'C'].forEach((display, row) => model.addHyperLink('source', 'sheet', {
                id: display,
                display,
                row,
                column: 0,
                payload: `https://example.com/${display}`,
            }));
            model.addHyperLink('target', 'sheet', {
                id: 'previous',
                row: 6,
                column: 0,
                display: 'Previous',
                payload: 'https://example.com/previous',
            });
            let hooks: ISheetClipboardHook[] = [];
            const subscription = clipboard.clipboardHooks$.subscribe((value) => {
                hooks = value;
            });
            const hook = hooks.find((value) => value.onPasteCells)!;
            const copiedRange = { rows: [0, 2], cols: [0] };
            hook.onBeforeCopy!('source', 'sheet', {
                startRow: 0,
                endRow: 2,
                startColumn: 0,
                endColumn: 0,
            }, COPY_TYPE.COPY, copiedRange);
            expect(hook.onPasteCells!(
                { unitId: 'source', subUnitId: 'sheet', range: copiedRange },
                { unitId: 'target', subUnitId: 'sheet', range: { rows: [5, 6], cols: [0] } },
                new ObjectMatrix(),
                { copyType: COPY_TYPE.COPY, pasteType: PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_VALUE }
            )).toEqual({ redos: [], undos: [] });
            const mutations = hook.onPasteCells!(
                { unitId: 'source', subUnitId: 'sheet', range: copiedRange },
                { unitId: 'target', subUnitId: 'sheet', range: { rows: [5, 6], cols: [0] } },
                new ObjectMatrix(),
                { copyType: COPY_TYPE.COPY, pasteType: PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE }
            )!;
            mutations.redos.forEach(({ id, params }) => commands.syncExecuteCommand(id, params));
            expect([5, 6].map((row) => model.getHyperLinkByLocation('target', 'sheet', row, 0)?.payload))
                .toEqual(['https://example.com/A', 'https://example.com/C']);
            mutations.undos.forEach(({ id, params }) => commands.syncExecuteCommand(id, params));
            expect([5, 6].map((row) => model.getHyperLinkByLocation('target', 'sheet', row, 0)?.payload))
                .toEqual([undefined, 'https://example.com/previous']);
            subscription.unsubscribe();
        } finally {
            univer.dispose();
        }
    });
});
