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

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
    CommandService,
    CommandType,
    ConfigService,
    ContextService,
    DesktopLogService,
    ICommandService,
    IConfigService,
    IContextService,
    ILogService,
    Injector,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    UniverInstanceService,
} from '@univerjs/core';
import { RediContext } from '@wendellhu/redi/react-bindings';
import { afterEach, describe, expect, it } from 'vitest';
import { ComponentManager } from '../../../../common/component-manager';
import { IconManager } from '../../../../common/icon-manager';
import enUS from '../../../../locale/en-US';
import { ContextMenuHostService, IContextMenuHostService } from '../../../../services/contextmenu/contextmenu-host.service';
import { ContextMenuService, IContextMenuService } from '../../../../services/contextmenu/contextmenu.service';
import { DesktopLayoutService, ILayoutService } from '../../../../services/layout/layout.service';
import { MenuItemType } from '../../../../services/menu/menu';
import { IMenuManagerService, MenuManagerService } from '../../../../services/menu/menu-manager.service';
import {
    IUIRuntimeScopeService,
    UIRuntimeScopeService,
} from '../../../../services/runtime-scope/ui-runtime-scope.service';
import { DesktopContextMenu } from '../ContextMenu';

const injectors: Injector[] = [];

function createInjector() {
    const injector = new Injector([
        [IConfigService, { useClass: ConfigService }],
        [IContextService, { useClass: ContextService }],
        [ILogService, { useClass: DesktopLogService }],
        [IUniverInstanceService, { useClass: UniverInstanceService }],
        [ICommandService, { useClass: CommandService }],
        [IMenuManagerService, { useClass: MenuManagerService }],
        [ILayoutService, { useClass: DesktopLayoutService }],
        [IContextMenuService, { useClass: ContextMenuService }],
        [IContextMenuHostService, { useClass: ContextMenuHostService }],
        [IUIRuntimeScopeService, { useClass: UIRuntimeScopeService }],
        [LocaleService],
        [ComponentManager],
        [IconManager],
    ]);
    injectors.push(injector);
    return injector;
}

afterEach(() => {
    cleanup();
    injectors.splice(0).forEach((injector) => injector.dispose());
});

describe('DesktopContextMenu', () => {
    it('discards a deferred open when another view takes over, even if it exits before the next frame', async () => {
        const injector = createInjector();
        const locale = injector.get(LocaleService);
        locale.load({ [LocaleType.EN_US]: enUS });
        locale.setLocale(LocaleType.EN_US);
        locale.setDirection('ltr');
        injector.get(ILayoutService).registerRootContainerElement(document.body);
        const contextMenuService = injector.get(IContextMenuService);
        const menuHost = injector.get(IContextMenuHostService);
        render(<RediContext.Provider value={{ injector }}><DesktopContextMenu /></RediContext.Provider>);
        act(() => {
            contextMenuService.triggerContextMenu({ clientX: 20, clientY: 20, stopPropagation() {} }, 'table');
            menuHost.suspend().dispose();
        });
        await act(async () => {
            await new Promise(requestAnimationFrame);
        });
        expect(contextMenuService.visible).toBe(false);
        act(() => contextMenuService.triggerContextMenu({ clientX: 20, clientY: 20, stopPropagation() {} }, 'table'));
        await waitFor(() => expect(contextMenuService.visible).toBe(true));
    });

    it.each([
        { id: 'insert-row', commandId: undefined, scoped: false },
        { id: 'table.insert-row', commandId: undefined, scoped: false },
        { id: 'table.insert-row', commandId: 'table.insert-two-rows', scoped: true },
    ])('executes $id with command override $commandId in its runtime scope', async ({ id, commandId, scoped }) => {
        const injector = createInjector();
        const locale = injector.get(LocaleService);
        locale.load({ [LocaleType.EN_US]: { ...enUS, test: { insert: 'Insert row' } } });
        locale.setLocale(LocaleType.EN_US);
        locale.setDirection('ltr');
        injector.get(ILayoutService).registerRootContainerElement(document.body);
        const scopedInjector = scoped ? createInjector() : injector;
        const commandService = scopedInjector.get(ICommandService);
        const menuService = scopedInjector.get(IMenuManagerService);
        const contextMenuService = injector.get(IContextMenuService);
        let rows = 3;
        let requestedCount = 1;
        for (const command of new Set(['insert-row', id, commandId].filter((value) => value !== undefined))) {
            commandService.registerCommand({
                id: command,
                type: CommandType.OPERATION,
                handler: (_accessor, params: { count: number }) => {
                    if (command === (commandId ?? id)) {
                        rows += params.count;
                    }
                    return true;
                },
            });
        }
        menuService.appendRootMenu({
            table: {
                'insert-row': {
                    menuItemFactory: () => ({
                        id,
                        commandId,
                        type: MenuItemType.BUTTON,
                        title: 'test.insert',
                        params: () => ({ count: requestedCount }),
                    }),
                },
            },
        });
        if (scoped) {
            injector.get(IUIRuntimeScopeService).register({
                unitId: 'embedded-slide',
                has: (identifier) => identifier === ICommandService || identifier === IMenuManagerService,
                get: <T,>(identifier: unknown) => scopedInjector.get(identifier as typeof ICommandService) as T,
            });
        }
        render(<RediContext.Provider value={{ injector }}><DesktopContextMenu /></RediContext.Provider>);
        act(() => contextMenuService.triggerContextMenu(
            { clientX: 20, clientY: 20, stopPropagation() {} },
            'table',
            scoped ? { unitId: 'embedded-slide' } : undefined
        ));
        const button = await screen.findByRole('button', { name: 'Insert row' });
        requestedCount = 2;
        fireEvent.click(button);
        await waitFor(() => expect(rows).toBe(5));
        await waitFor(() => expect(contextMenuService.visible).toBe(false));
    });
});
