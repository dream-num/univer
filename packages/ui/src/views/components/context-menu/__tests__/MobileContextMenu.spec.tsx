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

import { act, cleanup, render, screen } from '@testing-library/react';
import {
    CommandService,
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
import { ConfigProvider } from '@univerjs/design';
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
import { ContextMenuPosition } from '../../../../services/menu/types';
import {
    IUIRuntimeScopeService,
    UIRuntimeScopeService,
} from '../../../../services/runtime-scope/ui-runtime-scope.service';
import { MobileContextMenu, resolveMobileCaretMenuPlacement, shouldUseFloatingMobileContextMenu } from '../MobileContextMenu';

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

describe('MobileContextMenu', () => {
    it.each([false, true])('closes and blocks the mobile menu during host suspension (caret anchor: %s)', (caretAnchor) => {
        const injector = createInjector();
        const locale = injector.get(LocaleService);
        locale.load({ [LocaleType.EN_US]: { ...enUS, test: { action: 'Insert row' } } });
        locale.setLocale(LocaleType.EN_US);
        locale.setDirection('ltr');
        injector.get(ILayoutService).registerRootContainerElement(document.body);
        injector.get(IMenuManagerService).appendRootMenu({
            test: {
                action: {
                    menuItemFactory: () => ({ id: 'insert-row', type: MenuItemType.BUTTON, title: 'test.action' }),
                },
            },
        });
        const contextMenu = injector.get(IContextMenuService);
        const host = injector.get(IContextMenuHostService);
        render(
            <RediContext.Provider value={{ injector }}>
                <ConfigProvider mountContainer={document.body}>
                    <MobileContextMenu />
                </ConfigProvider>
            </RediContext.Provider>
        );
        const open = () => contextMenu.triggerContextMenu(
            { clientX: 50, clientY: 100, stopPropagation() {} },
            'test',
            { caretAnchor }
        );
        act(open);
        expect(screen.getByRole(caretAnchor ? 'menuitem' : 'button', { name: 'Insert row' })).toBeTruthy();
        let suspension: ReturnType<IContextMenuHostService['suspend']>;
        act(() => {
            suspension = host.suspend();
        });
        expect(screen.queryByRole(caretAnchor ? 'menuitem' : 'button', { name: 'Insert row' })).toBeNull();
        act(open);
        expect(screen.queryByRole(caretAnchor ? 'menuitem' : 'button', { name: 'Insert row' })).toBeNull();
        act(() => suspension.dispose());
        act(open);
        expect(screen.getByRole(caretAnchor ? 'menuitem' : 'button', { name: 'Insert row' })).toBeTruthy();
    });

    it('uses a floating menu only for an explicit caret anchor', () => {
        expect(shouldUseFloatingMobileContextMenu(ContextMenuPosition.MAIN_AREA)).toBe(false);
        expect(shouldUseFloatingMobileContextMenu(ContextMenuPosition.MAIN_AREA, { unitId: 'sheet-1' })).toBe(false);
        expect(shouldUseFloatingMobileContextMenu(ContextMenuPosition.MAIN_AREA, {
            unitId: 'doc-1',
            caretAnchor: true,
        })).toBe(true);
    });

    it('keeps the pointer aligned with the caret when the compact menu reaches viewport edges', () => {
        expect(resolveMobileCaretMenuPlacement(200, 12, 400, 180)).toEqual({
            menuLeft: 98,
            pointerLeft: 86,
        });
        expect(resolveMobileCaretMenuPlacement(8, 12, 400, 180)).toEqual({
            menuLeft: 0,
            pointerLeft: 12,
        });
        expect(resolveMobileCaretMenuPlacement(420, 12, 400, 180)).toEqual({
            menuLeft: 220,
            pointerLeft: 160,
        });
    });
});
