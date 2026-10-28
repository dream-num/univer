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

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
    CommandService,
    CommandType,
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
    IUndoRedoService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    LocalUndoRedoService,
    RedoCommand,
    UndoCommand,
    UniverInstanceService,
    Workbook,
} from '@univerjs/core';
import { createElement } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { ToggleFullscreenOperation } from '../../commands/operations/toggle-fullscreen.operation';
import { ComponentManager } from '../../common/component-manager';
import { IconManager } from '../../common/icon-manager';
import enUS from '../../locale/en-US';
import { CopyCommand } from '../../services/clipboard/clipboard.command';
import { DesktopLayoutService, ILayoutService } from '../../services/layout/layout.service';
import { IPlatformService } from '../../services/platform/platform.service';
import { IUIRuntimeScopeService, UIRuntimeScopeService } from '../../services/runtime-scope/ui-runtime-scope.service';
import { KeyCode } from '../../services/shortcut/keycode';
import { IShortcutService, ShortcutService } from '../../services/shortcut/shortcut.service';
import { DesktopSidebarService } from '../../services/sidebar/desktop-sidebar.service';
import { ISidebarService } from '../../services/sidebar/sidebar.service';
import { RediProvider } from '../../utils/di';
import { Sidebar } from '../../views/components/sidebar/Sidebar';
import {
    CopyShortcutItem,
    CutShortcutItem,
    OnlyDisplayPasteShortcutItem,
    RedoShortcutItem,
    SharedController,
    UndoShortcutItem,
} from '../shared-shortcut.controller';

const injectors: Injector[] = [];

afterEach(() => {
    cleanup();
    injectors.splice(0).forEach((injector) => injector.dispose());
    document.body.replaceChildren();
});

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

function createControllerTestBed(platform: 'mac' | 'windows' | 'linux', withSidebar = false) {
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
    if (withSidebar) {
        injector.add([IUniverInstanceService, { useClass: UniverInstanceService }]);
        injector.add([ILayoutService, { useClass: DesktopLayoutService }]);
        injector.add([ISidebarService, { useClass: DesktopSidebarService }]);
        injector.add([IUndoRedoService, { useClass: LocalUndoRedoService }]);
        injector.add([LocaleService]);
        injector.add([ComponentManager]);
        injector.add([IconManager]);
        const locale = injector.get(LocaleService);
        locale.load({ [LocaleType.EN_US]: enUS });
        locale.setLocale(LocaleType.EN_US);
        locale.setDirection('ltr');
    }
    const context = injector.get(IContextService);
    context.setContextValue(FOCUSING_UNIVER_EDITOR, true);
    return {
        injector,
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
    it.each(['mac', 'windows'] as const)('undoes and redoes with a real sidebar open while preserving native editing on %s', async (platform) => {
        const { injector, commandService } = createControllerTestBed(platform, true);
        const instances = injector.get(IUniverInstanceService);
        const workbook = injector.createInstance(Workbook, { id: 'history-unit', name: 'Before' });
        instances.__addUnit(workbook);
        instances.focusUnit(workbook.getUnitId());
        const history = injector.get(IUndoRedoService);
        const mutationId = 'test.sidebar-history.set-name';
        commandService.registerCommand({
            id: mutationId,
            type: CommandType.MUTATION,
            handler: (_accessor, params: { name: string }) => {
                workbook.setName(params.name);
                return true;
            },
        });
        commandService.syncExecuteCommand(mutationId, { name: 'After' });
        history.pushUndoRedo({
            unitID: workbook.getUnitId(),
            undoMutations: [{ id: mutationId, params: { name: 'Before' } }],
            redoMutations: [{ id: mutationId, params: { name: 'After' } }],
        });
        const rendered = render(createElement(RediProvider, { value: { injector } }, createElement('div', null, createElement('div', { 'data-u-comp': 'editor', tabIndex: 0 }, 'Canvas'), createElement(Sidebar))));
        injector.get(ILayoutService).registerRootContainerElement(rendered.container);
        const editor = screen.getByText('Canvas');
        editor.focus();
        const sidebar = injector.get(ISidebarService);
        const controls = createElement('div', null, createElement('button', { type: 'button' }, 'Customize'), createElement('input', { 'aria-label': 'Chart title' }), createElement('textarea', { 'aria-label': 'Description' }), createElement('select', { 'aria-label': 'Format' }), createElement('div', { 'aria-label': 'Notes', contentEditable: true, tabIndex: 0 }));
        act(() => sidebar.open({ id: 'chart-edit', children: { title: controls } }));
        const closeButton = screen.getByRole('button', { name: 'Close sidebar' });
        expect(document.activeElement).toBe(closeButton);
        const undo = () => new KeyboardEvent('keydown', {
            key: 'z',
            keyCode: KeyCode.Z,
            ctrlKey: platform !== 'mac',
            metaKey: platform === 'mac',
            bubbles: true,
            cancelable: true,
        });

        fireEvent(closeButton, undo());
        await waitFor(() => expect(workbook.getSnapshot().name).toBe('Before'));
        expect(sidebar.visible).toBe(true);
        const customize = screen.getByRole('button', { name: 'Customize' });
        customize.focus();
        fireEvent(customize, new KeyboardEvent('keydown', {
            keyCode: platform === 'mac' ? KeyCode.Z : KeyCode.Y,
            shiftKey: platform === 'mac',
            metaKey: platform === 'mac',
            ctrlKey: platform !== 'mac',
            bubbles: true,
        }));
        await waitFor(() => expect(workbook.getSnapshot().name).toBe('After'));
        for (const label of ['Chart title', 'Description', 'Format', 'Notes']) {
            const field = screen.getByLabelText(label);
            field.focus();
            const nativeUndo = undo();
            fireEvent(field, nativeUndo);
            expect(nativeUndo.defaultPrevented).toBe(false);
            expect(workbook.getSnapshot().name).toBe('After');
        }
    });

    it.each((['mac', 'windows', 'linux'] as const).flatMap((platform) => [
        { platform, compact: false },
        { platform, compact: true },
    ]))('routes history from a focused command selector on $platform (compact: $compact)', ({ platform, compact }) => {
        const { controller, shortcutService, context } = createControllerTestBed(platform);
        context.setContextValue(FOCUSING_UNIVER_EDITOR, false);
        const container = document.createElement('div');
        const trigger = document.createElement(compact ? 'button' : 'div');
        if (compact) {
            container.setAttribute('data-embed-floating-menu', 'true');
        } else {
            trigger.dataset.uCommand = 'sheet.command.set-horizontal-text-align';
            trigger.setAttribute('role', 'button');
        }
        trigger.tabIndex = 0;
        container.appendChild(trigger);
        document.body.appendChild(container);
        trigger.focus();
        const undo = new KeyboardEvent('history-test', {
            keyCode: KeyCode.Z,
            metaKey: platform === 'mac',
            ctrlKey: platform !== 'mac',
        });
        const redo = new KeyboardEvent('history-test', {
            keyCode: platform === 'mac' ? KeyCode.Z : KeyCode.Y,
            shiftKey: platform === 'mac',
            metaKey: platform === 'mac',
            ctrlKey: platform !== 'mac',
        });
        trigger.dispatchEvent(undo);
        trigger.dispatchEvent(redo);
        expect(shortcutService.dispatch(undo)?.id).toBe(UndoCommand.id);
        expect(shortcutService.dispatch(redo)?.id).toBe(RedoCommand.id);

        for (const key of [EDITOR_ACTIVATED, FOCUSING_FX_BAR_EDITOR]) {
            context.setContextValue(key, true);
            expect(shortcutService.dispatch(undo)).toBeUndefined();
            expect(shortcutService.dispatch(redo)).toBeUndefined();
            context.setContextValue(key, false);
        }
        const input = document.createElement('input');
        trigger.appendChild(input);
        input.focus();
        input.dispatchEvent(undo);
        input.dispatchEvent(redo);
        expect(shortcutService.dispatch(undo)).toBeUndefined();
        expect(shortcutService.dispatch(redo)).toBeUndefined();
        trigger.focus();
        trigger.dispatchEvent(undo);
        trigger.blur();
        expect(shortcutService.dispatch(undo)).toBeUndefined();
        trigger.focus();
        trigger.removeAttribute('data-u-command');
        container.removeAttribute('data-embed-floating-menu');
        expect(shortcutService.dispatch(undo)).toBeUndefined();
        if (compact) {
            container.setAttribute('data-embed-floating-menu', 'true');
        } else {
            trigger.dataset.uCommand = 'sheet.command.set-horizontal-text-align';
        }
        controller.dispose();
        expect(shortcutService.dispatch(undo)).toBeUndefined();
    });

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
