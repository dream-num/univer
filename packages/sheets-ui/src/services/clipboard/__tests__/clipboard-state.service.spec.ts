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
    CommandService,
    ConfigService,
    ContextService,
    DesktopLogService,
    ErrorService,
    ICommandService,
    IConfigService,
    IContextService,
    ILogService,
    Injector,
    IUndoRedoService,
    IUniverInstanceService,
    LocaleService,
    LocalUndoRedoService,
    ThemeService,
    UniverInstanceService,
    Workbook,
} from '@univerjs/core';
import { IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import { SheetSkeletonService, SheetsSelectionsService } from '@univerjs/sheets';
import {
    BrowserClipboardService,
    IClipboardInterfaceService,
    INotificationService,
    IPlatformService,
    PlatformService,
} from '@univerjs/ui';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { IMarkSelectionService, MarkSelectionService } from '../../mark-selection/mark-selection.service';
import { ISheetClipboardService, SheetClipboardService } from '../clipboard.service';

class NoopNotificationService {
    show() {
        return { dispose: () => {} };
    }
}

function createService(): ISheetClipboardService {
    vi.stubGlobal('navigator', { appVersion: 'Linux' });
    const injector = new Injector();
    injector.add([ILogService, { useClass: DesktopLogService }]);
    injector.add([IConfigService, { useClass: ConfigService }]);
    injector.add([IContextService, { useClass: ContextService }]);
    injector.add([IUniverInstanceService, { useClass: UniverInstanceService }]);
    injector.add([SheetsSelectionsService]);
    injector.add([IClipboardInterfaceService, { useClass: BrowserClipboardService }]);
    injector.add([IUndoRedoService, { useClass: LocalUndoRedoService }]);
    injector.add([ICommandService, { useClass: CommandService }]);
    injector.add([SheetSkeletonService]);
    injector.add([IMarkSelectionService, { useClass: MarkSelectionService }]);
    injector.add([INotificationService, { useClass: NoopNotificationService }]);
    injector.add([IPlatformService, { useClass: PlatformService }]);
    injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
    injector.add([ThemeService]);
    injector.add([LocaleService]);
    injector.add([ErrorService]);
    injector.add([ISheetClipboardService, { useClass: SheetClipboardService }]);
    const univerInstanceService = injector.get(IUniverInstanceService) as UniverInstanceService;
    const workbook = injector.createInstance(Workbook, {
        id: 'unit-1',
        sheets: { 'sheet-1': { id: 'sheet-1' } },
        sheetOrder: ['sheet-1'],
    });
    univerInstanceService.__addUnit(workbook);
    univerInstanceService.focusUnit('unit-1');
    return injector.get(ISheetClipboardService);
}

describe('SheetClipboardService', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('tracks paste menu state, paste options, and clipboard hooks used by copy/paste features', () => {
        const service = createService();
        const hook = { id: 'business-copy', priority: 1 };
        const cache = { pasteType: 'special-paste-value' };

        service.setShowMenu(true);
        service.updatePasteOptionsCache(cache as never);
        const disposable = service.addClipboardHook(hook as never);

        expect(service.getPasteMenuVisible()).toBe(true);
        expect(service.getPasteOptionsCache()).toBe(cache);
        expect(service.getClipboardHooks()).toEqual([hook]);

        disposable.dispose();
        service.disposePasteOptionsCache();
        expect(service.getClipboardHooks()).toEqual([]);
        expect(service.getPasteMenuVisible()).toBe(false);
        expect(service.getPasteOptionsCache()).toBeNull();
    });
});
