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

import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { FindReplaceController } from '../find-replace.controller';

describe('FindReplaceController', () => {
    it('should open dialog when revealed and close when focus changes', () => {
        const focused$ = new Subject<any>();
        const univerInstanceService = {
            focused$,
            getUniverSheetInstance: vi.fn(() => null),
        };

        const menuManagerService = { mergeMenu: vi.fn() };
        const shortcutService = { registerShortcut: vi.fn(() => ({ dispose: vi.fn() })) };
        const commandService = { registerCommand: vi.fn(() => ({ dispose: vi.fn() })) };
        const stateUpdates$ = new Subject<any>();
        const findReplaceService = {
            stateUpdates$,
            terminate: vi.fn(),
        };
        const dialogService = { open: vi.fn(), close: vi.fn() };
        const layoutService = { focus: vi.fn() };
        const localeService = { t: (k: string) => k };
        const componentManager = { register: vi.fn(() => ({ dispose: vi.fn() })) };

        const controller = new FindReplaceController(
            univerInstanceService as any,
            menuManagerService as any,
            shortcutService as any,
            commandService as any,
            findReplaceService as any,
            dialogService as any,
            layoutService as any,
            localeService as any,
            componentManager as any
        );

        stateUpdates$.next({ revealed: true });
        expect(dialogService.open).toHaveBeenCalled();

        focused$.next(null);
        expect(dialogService.close).toHaveBeenCalled();
        expect(findReplaceService.terminate).toHaveBeenCalled();

        controller.dispose();
    });
});
