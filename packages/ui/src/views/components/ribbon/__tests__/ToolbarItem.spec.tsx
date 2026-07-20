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

import type { ComponentType, ReactElement } from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { ICommandService, ILogService, Injector, LocaleService } from '@univerjs/core';
import { Subject } from 'rxjs';
import { afterEach, describe, expect, it } from 'vitest';
import { ComponentManager } from '../../../../common/component-manager';
import { IconManager } from '../../../../common/icon-manager';
import { ILayoutService } from '../../../../services/layout/layout.service';
import { MenuItemType } from '../../../../services/menu/menu';
import { IMenuManagerService } from '../../../../services/menu/menu-manager.service';
import { IShortcutService } from '../../../../services/shortcut/shortcut.service';
import { connectInjector } from '../../../../utils/di';
import { ToolbarItem } from '../ToolbarItem';

class TestLocaleService {
    t(key: string) {
        return key;
    }
}

class TestCommandService {
    calls: Array<{ commandId: string; params?: Record<string, unknown> }> = [];

    executeCommand(commandId: string, params?: Record<string, unknown>): void {
        this.calls.push({ commandId, params });
    }
}

class TestLayoutService {
    focus(): void {}
}

class TestShortcutService {
    readonly shortcutChanged$ = new Subject<void>();

    getShortcutDisplayOfCommand(): null {
        return null;
    }
}

class TestMenuManagerService {
    readonly menuChanged$ = new Subject<void>();

    getMenuByPositionKey() {
        return [];
    }
}

class TestLogService {
    warn(): void {}
}

function renderWithDependencies(element: ReactElement) {
    const injector = new Injector();
    injector.add([LocaleService, { useClass: TestLocaleService as never }]);
    injector.add([ICommandService, { useClass: TestCommandService as never }]);
    injector.add([ILayoutService, { useClass: TestLayoutService as never }]);
    injector.add([IShortcutService, { useClass: TestShortcutService as never }]);
    injector.add([IMenuManagerService, { useClass: TestMenuManagerService as never }]);
    injector.add([ILogService, { useClass: TestLogService as never }]);
    injector.add([ComponentManager]);
    injector.add([IconManager]);
    injector.get(ComponentManager).register('TestDynamicOption', ({ onChange }: { onChange: (value: string) => void }) => (
        <button type="button" onClick={() => onChange('dynamic-value')}>Choose dynamic value</button>
    ));

    injector.get(IconManager).register({
        TestIcon: ({ className }: { className?: string }) => <span className={className} data-icon="test" />,
    });

    const ConnectedTestRoot = connectInjector(() => element, injector) as ComponentType;
    return {
        ...render(<ConnectedTestRoot />),
        commandService: injector.get(ICommandService) as unknown as TestCommandService,
    };
}

afterEach(cleanup);

describe('ToolbarItem', () => {
    it('resolves menu params when clicking a button', () => {
        const { getByRole, commandService } = renderWithDependencies(
            <ToolbarItem
                id="test-button"
                type={MenuItemType.BUTTON}
                title="Dynamic params"
                params={() => ({ unitId: 'unit-1' })}
            />
        );

        fireEvent.click(getByRole('button', { name: 'Dynamic params' }));

        expect(commandService.calls).toEqual([
            {
                commandId: 'test-button',
                params: { unitId: 'unit-1' },
            },
        ]);
    });

    it('forwards menu params when clicking a button selector main action', () => {
        const rule = { type: 'checkbox' };
        const { container, commandService } = renderWithDependencies(
            <ToolbarItem
                id="test-button-selector"
                type={MenuItemType.BUTTON_SELECTOR}
                icon="TestIcon"
                title="Checkbox"
                params={{ rule }}
                selections={[]}
            />
        );

        fireEvent.click(container.querySelector('.univer-toolbar-button-selector-main') as HTMLElement);

        expect(commandService.calls).toEqual([
            {
                commandId: 'test-button-selector',
                params: { rule },
            },
        ]);
    });

    it('resolves option params with a value emitted by a custom option', async () => {
        const { container, findByRole, commandService } = renderWithDependencies(
            <ToolbarItem
                id="test-dynamic-selector"
                type={MenuItemType.SUBITEMS}
                icon="TestIcon"
                title="Dropdown"
                slot
                selectionsCommandId="insert-dynamic-rule"
                selections={[
                    {
                        id: 'insert-dynamic-rule',
                        label: {
                            name: 'TestDynamicOption',
                            selectable: false,
                        },
                        params: (value?: string | number) => ({ rule: { formula1: value } }),
                    },
                ]}
            />
        );

        fireEvent.click(container.querySelector('.univer-toolbar-selector-root') as HTMLElement);
        fireEvent.click(await findByRole('button', { name: 'Choose dynamic value' }));

        expect(commandService.calls).toEqual([
            {
                commandId: 'insert-dynamic-rule',
                params: { rule: { formula1: 'dynamic-value' } },
            },
        ]);
    });

    it('forwards static option params without wrapping them as a value', async () => {
        const { container, findByRole, commandService } = renderWithDependencies(
            <ToolbarItem
                id="test-static-selector"
                type={MenuItemType.SUBITEMS}
                icon="TestIcon"
                title="Dropdown"
                slot
                selectionsCommandId="insert-rule"
                selections={[
                    {
                        id: 'clear-rule',
                        label: {
                            name: 'TestDynamicOption',
                            selectable: false,
                        },
                        params: { types: ['list'] },
                    },
                ]}
            />
        );

        fireEvent.click(container.querySelector('.univer-toolbar-selector-root') as HTMLElement);
        fireEvent.click(await findByRole('button', { name: 'Choose dynamic value' }));

        expect(commandService.calls).toEqual([
            {
                commandId: 'clear-rule',
                params: { types: ['list'] },
            },
        ]);
    });
});
