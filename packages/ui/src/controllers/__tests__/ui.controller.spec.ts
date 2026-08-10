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

import { RedoCommand, UndoCommand } from '@univerjs/core';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { OpenFeatureSearchOperation } from '../../commands/operations/open-feature-search.operation';
import { ToggleShortcutPanelOperation } from '../../commands/operations/toggle-shortcut-panel.operation';
import { menuSchema } from '../../menu/schema';
import { ShortcutPanelMenuItemFactory } from '../../menu/shortcut-panel.menu';
import { RibbonStartGroup } from '../../services/menu/types';
import { KeyCode, MetaKeys } from '../../services/shortcut/keycode';
import { ErrorController } from '../error/error.controller';
import { FeatureSearchController } from '../feature-search/feature-search.controller';
import { ShortcutPanelController } from '../shortcut-display/shortcut-panel.controller';

describe('ErrorController', () => {
    it('should forward errors to message service', () => {
        const error$ = new Subject<{ errorKey: string }>();
        const errorService = {
            error$,
        };
        const messageService = {
            show: vi.fn(),
        };

        const controller = new ErrorController(errorService as any, messageService as any);
        error$.next({ errorKey: 'boom' });

        expect(messageService.show).toHaveBeenCalledWith(
            expect.objectContaining({
                content: 'boom',
            })
        );

        controller.dispose();
    });
});

describe('shortcut-display controllers', () => {
    it('should return shortcut panel menu item', () => {
        expect(ShortcutPanelMenuItemFactory()).toEqual({
            id: ToggleShortcutPanelOperation.id,
            title: 'ui.toggle-shortcut-panel',
            tooltip: 'ui.toggle-shortcut-panel',
            icon: 'KeyboardIcon',
            type: 0,
        });
    });

    it('should register command and shortcut', () => {
        const shortcutService = {
            registerShortcut: vi.fn(() => ({ dispose: vi.fn() })),
        };
        const commandService = {
            registerCommand: vi.fn(() => ({ dispose: vi.fn() })),
        };

        const controller = new ShortcutPanelController(
            shortcutService as any,
            {} as any,
            commandService as any
        );

        expect(commandService.registerCommand).toHaveBeenCalledWith(ToggleShortcutPanelOperation);
        expect(shortcutService.registerShortcut).toHaveBeenCalledTimes(1);

        controller.dispose();
    });
});

describe('FeatureSearchController', () => {
    it('registers the operation and a non-conflicting shortcut', () => {
        const disposable = () => ({ dispose: vi.fn() });
        const commandService = { registerCommand: vi.fn(disposable) };
        const shortcutService = { registerShortcut: vi.fn(disposable) };
        let controller: FeatureSearchController | undefined;

        expect(() => {
            controller = new FeatureSearchController(commandService as never, shortcutService as never);
        }).not.toThrow();

        expect(commandService.registerCommand).toHaveBeenCalledWith(OpenFeatureSearchOperation);
        expect(shortcutService.registerShortcut).toHaveBeenCalledWith(expect.objectContaining({
            id: OpenFeatureSearchOperation.id,
            binding: MetaKeys.CTRL_COMMAND | MetaKeys.SHIFT | KeyCode.P,
        }));

        controller?.dispose();
    });
});

describe('menu schema and ui token', () => {
    it('should expose static menu schema entries', () => {
        const groupedSchema = menuSchema as Record<RibbonStartGroup.HISTORY | RibbonStartGroup.OTHERS, Record<string, unknown>>;
        const history = groupedSchema[RibbonStartGroup.HISTORY];
        const others = groupedSchema[RibbonStartGroup.OTHERS];

        expect(history).toBeDefined();
        expect(others).toBeDefined();
        expect(Object.keys(history).length).toBeGreaterThanOrEqual(2);
        expect(Object.keys(others).length).toBeGreaterThanOrEqual(1);
        expect((history[UndoCommand.id] as { gridLayout?: unknown }).gridLayout).toEqual({ row: 1, column: 1, iconSize: 18 });
        expect((history[RedoCommand.id] as { gridLayout?: unknown }).gridLayout).toEqual({ row: 2, column: 1, iconSize: 18 });
        const shortcutPanel = others[ToggleShortcutPanelOperation.id] as { order?: number; gridLayout?: unknown };
        expect(shortcutPanel.order).toBe(1);
        expect(shortcutPanel.gridLayout).toBeUndefined();
    });
});
