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

/**
 * @vitest-environment jsdom
 */

import {
    CommandService,
    ConfigService,
    ContextService,
    DesktopLogService,
    EDITOR_ACTIVATED,
    FOCUSING_FX_BAR_EDITOR,
    FOCUSING_UNIVER_EDITOR,
    ICommandService,
    IConfigService,
    IContextService,
    ILogService,
    Injector,
    RedoCommand,
    UndoCommand,
} from '@univerjs/core';
import { afterEach, describe, expect, it } from 'vitest';
import { ToggleFullscreenOperation } from '../../commands/operations/toggle-fullscreen.operation';
import { CopyCommand } from '../../services/clipboard/clipboard.command';
import { IPlatformService } from '../../services/platform/platform.service';
import { IUIRuntimeScopeService, UIRuntimeScopeService } from '../../services/runtime-scope/ui-runtime-scope.service';
import { KeyCode } from '../../services/shortcut/keycode';
import { IShortcutService, ShortcutService } from '../../services/shortcut/shortcut.service';
import {
    CopyShortcutItem,
    CutShortcutItem,
    OnlyDisplayPasteShortcutItem,
    RedoShortcutItem,
    SharedController,
    UndoShortcutItem,
} from '../shared-shortcut.controller';

const injectors: Injector[] = [];

afterEach(() => injectors.splice(0).forEach((injector) => injector.dispose()));

function createInjector(): Injector {
    const injector = new Injector();
    injectors.push(injector);
    injector.add([IContextService, { useClass: ContextService }]);
    return injector;
}

function createContextService(values: Record<string, boolean>): IContextService {
    const context = createInjector().get(IContextService);
    Object.entries(values).forEach(([key, value]) => context.setContextValue(key, value));
    return context;
}

function createControllerTestBed(platform: 'mac' | 'windows' | 'linux') {
    const injector = createInjector();
    injector.add([ICommandService, { useClass: CommandService }]);
    injector.add([IConfigService, { useClass: ConfigService }]);
    injector.add([ILogService, { useClass: DesktopLogService }]);
    injector.add([IPlatformService, { useValue: {
        isMac: platform === 'mac',
        isWindows: platform === 'windows',
        isLinux: platform === 'linux',
    } }]);
    injector.add([IUIRuntimeScopeService, { useClass: UIRuntimeScopeService }]);
    injector.add([IShortcutService, { useClass: ShortcutService }]);
    injector.add([SharedController]);
    const context = injector.get(IContextService);
    context.setContextValue(FOCUSING_UNIVER_EDITOR, true);
    return {
        controller: injector.get(SharedController),
        commandService: injector.get(ICommandService),
        shortcutService: injector.get(IShortcutService),
        context,
    };
}

describe('shared shortcut items', () => {
    it('should require editor focus for copy/cut and never trigger display-only paste', () => {
        const focused = createContextService({ [FOCUSING_UNIVER_EDITOR]: true });
        const notFocused = createContextService({ [FOCUSING_UNIVER_EDITOR]: false });

        expect(CopyShortcutItem.preconditions!(focused)).toBe(true);
        expect(CopyShortcutItem.preconditions!(notFocused)).toBe(false);
        expect(CutShortcutItem.preconditions!(focused)).toBe(true);
        expect(CutShortcutItem.preconditions!(notFocused)).toBe(false);
        expect(OnlyDisplayPasteShortcutItem.preconditions!(focused)).toBe(false);
    });

    it('should block undo/redo when editor or fx bar is activated', () => {
        const allowed = createContextService({
            [FOCUSING_UNIVER_EDITOR]: true,
            [EDITOR_ACTIVATED]: false,
            [FOCUSING_FX_BAR_EDITOR]: false,
        });
        const blockedByEditor = createContextService({
            [FOCUSING_UNIVER_EDITOR]: true,
            [EDITOR_ACTIVATED]: true,
            [FOCUSING_FX_BAR_EDITOR]: false,
        });
        const blockedByFxBar = createContextService({
            [FOCUSING_UNIVER_EDITOR]: true,
            [EDITOR_ACTIVATED]: false,
            [FOCUSING_FX_BAR_EDITOR]: true,
        });

        expect(UndoShortcutItem.preconditions!(allowed)).toBe(true);
        expect(RedoShortcutItem.preconditions!(allowed)).toBe(true);
        expect(UndoShortcutItem.preconditions!(blockedByEditor)).toBe(false);
        expect(RedoShortcutItem.preconditions!(blockedByFxBar)).toBe(false);
    });
});

describe('SharedController', () => {
    it('registers working clipboard/history shortcuts and releases its registrations', () => {
        const { controller, commandService, shortcutService } = createControllerTestBed('windows');
        const copy = new KeyboardEvent('keydown', { keyCode: KeyCode.C, ctrlKey: true });
        const undo = new KeyboardEvent('keydown', { keyCode: KeyCode.Z, ctrlKey: true });
        expect(commandService.hasCommand(CopyCommand.id)).toBe(true);
        expect(commandService.hasCommand(ToggleFullscreenOperation.id)).toBe(true);
        expect(shortcutService.dispatch(copy)?.id).toBe(CopyCommand.id);
        expect(shortcutService.dispatch(undo)?.id).toBe(UndoCommand.id);
        controller.dispose();
        expect(commandService.hasCommand(CopyCommand.id)).toBe(false);
        expect(commandService.hasCommand(ToggleFullscreenOperation.id)).toBe(false);
        expect(shortcutService.dispatch(copy)).toBeUndefined();
        expect(shortcutService.dispatch(undo)).toBeUndefined();
    });

    it.each(['mac', 'windows', 'linux'] as const)('preserves redo bindings and editor isolation on %s', (platform) => {
        const { controller, shortcutService, context } = createControllerTestBed(platform);
        const modifier = { metaKey: platform === 'mac', ctrlKey: platform !== 'mac' };
        const legacyRedo = new KeyboardEvent('keydown', { ...modifier, keyCode: KeyCode.Y });
        const macRedo = new KeyboardEvent('keydown', { ...modifier, shiftKey: true, keyCode: KeyCode.Z });
        expect(shortcutService.dispatch(legacyRedo)?.id).toBe(RedoCommand.id);
        expect(shortcutService.dispatch(macRedo)?.id).toBe(platform === 'mac' ? RedoCommand.id : undefined);

        for (const editorContext of [EDITOR_ACTIVATED, FOCUSING_FX_BAR_EDITOR]) {
            context.setContextValue(editorContext, true);
            expect(shortcutService.dispatch(legacyRedo)).toBeUndefined();
            expect(shortcutService.dispatch(macRedo)).toBeUndefined();
            context.setContextValue(editorContext, false);
        }

        controller.dispose();
        expect(shortcutService.dispatch(legacyRedo)).toBeUndefined();
        expect(shortcutService.dispatch(macRedo)).toBeUndefined();
    });
});
