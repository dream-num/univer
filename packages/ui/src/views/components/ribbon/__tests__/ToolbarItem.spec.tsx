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
import type { IIconProps } from '../../../../common/icon-manager';
import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { ICommandService, ILogService, Injector, LocaleService } from '@univerjs/core';
import { BehaviorSubject, Subject } from 'rxjs';
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
    injector.get(ComponentManager).register('TestDynamicOption', ({ onChange, className }: { onChange: (value: string) => void; className?: string }) => (
        <button type="button" className={className} onClick={() => onChange('dynamic-value')}>Choose dynamic value</button>
    ));

    injector.get(IconManager).register({
        TestIcon: ({ className, style, extend }: IIconProps) => (
            <span className={className} data-color-channel={extend?.colorChannel1} data-icon="test" style={style} />
        ),
    });

    const ConnectedTestRoot = connectInjector(() => element, injector) as ComponentType;
    return {
        ...render(<ConnectedTestRoot />),
        commandService: injector.get(ICommandService) as unknown as TestCommandService,
    };
}

afterEach(cleanup);

describe('ToolbarItem', () => {
    it('closes open selector options when the parent becomes disabled', async () => {
        const disabled$ = new BehaviorSubject(false);
        const { container, findByText, queryByText } = renderWithDependencies(
            <ToolbarItem
                id="test-selector"
                type={MenuItemType.SELECTOR}
                icon="TestIcon"
                title="Format"
                selections={[{ label: 'Format rows', value: 'row' }]}
                disabled$={disabled$}
            />
        );

        fireEvent.pointerDown(container.querySelector('.univer-toolbar-selector-root') as HTMLElement, {
            button: 0,
            ctrlKey: false,
        });
        expect(await findByText('Format rows')).toBeTruthy();

        act(() => disabled$.next(true));
        await waitFor(() => expect(queryByText('Format rows')).toBeNull());
    });

    it('shows a title for a large Grid button', () => {
        const { getByText } = renderWithDependencies(
            <ToolbarItem
                id="test-grid-button"
                type={MenuItemType.BUTTON}
                icon="TestIcon"
                title="Format"
                grid
                large
                showLabel
            />
        );

        expect(getByText('Format')).toBeTruthy();
    });

    it('shows a title for a large Grid button selector', () => {
        const { getByText } = renderWithDependencies(
            <ToolbarItem
                id="test-grid-selector"
                type={MenuItemType.BUTTON_SELECTOR}
                icon="TestIcon"
                title="Insert"
                selections={[{ label: 'Image', value: 'image' }]}
                grid
                large
                showLabel
            />
        );

        expect(getByText('Insert')).toBeTruthy();
    });

    it('hides the title of a large Grid selector when showLabel is false', () => {
        const { queryByText } = renderWithDependencies(
            <ToolbarItem
                id="test-grid-selector"
                type={MenuItemType.SELECTOR}
                icon="TestIcon"
                title="Common Functions"
                selections={[{ label: 'SUM', value: 'SUM' }]}
                grid
                large
            />
        );

        expect(queryByText('Common Functions')).toBeNull();
    });

    it('keeps the title of a regular Grid selector', () => {
        const { getByText } = renderWithDependencies(
            <ToolbarItem
                id="test-grid-selector"
                type={MenuItemType.SELECTOR}
                icon="TestIcon"
                title="Financial"
                selections={[{ label: 'FV', value: 'FV' }]}
                grid
            />
        );

        expect(getByText('Financial')).toBeTruthy();
    });

    it('does not wrap an interactive custom button label in another button', () => {
        const { container } = renderWithDependencies(
            <ToolbarItem
                id="test-custom-button"
                type={MenuItemType.BUTTON}
                label={{ name: 'TestDynamicOption' }}
                grid
            />
        );

        expect(container.querySelector('[data-u-command="test-custom-button"]')).toBeTruthy();
        expect(container.querySelector('button button')).toBeNull();
    });

    it('applies a configured Grid icon size', () => {
        const { container } = renderWithDependencies(
            <ToolbarItem
                id="test-grid-sized-icon"
                type={MenuItemType.BUTTON}
                icon="TestIcon"
                grid
                iconSize={18}
            />
        );

        const icon = container.querySelector('[data-icon="test"]') as HTMLElement;
        expect(icon.style.width).toBe('18px');
        expect(icon.style.height).toBe('18px');
    });

    it('uses the tooltip as the label for a compact Grid button selector when requested', () => {
        const { getByText } = renderWithDependencies(
            <ToolbarItem
                id="test-grid-button-selector"
                type={MenuItemType.BUTTON_SELECTOR}
                icon="TestIcon"
                tooltip="Crosshair Highlight"
                selections={[{ label: 'Green', value: 'green' }]}
                grid
                showLabel
            />
        );

        expect(getByText('Crosshair Highlight')).toBeTruthy();
    });

    it('uses the tooltip as the Grid label when title is absent', () => {
        const { getByText } = renderWithDependencies(
            <ToolbarItem
                id="test-grid-tooltip-label"
                type={MenuItemType.BUTTON}
                icon="TestIcon"
                tooltip="Protect"
                grid
                large
                showLabel
            />
        );

        expect(getByText('Protect')).toBeTruthy();
    });

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

    it('overrides a button selector icon color without changing its command value', () => {
        const { container, commandService } = renderWithDependencies(
            <ToolbarItem
                id="test-color-selector"
                type={MenuItemType.BUTTON_SELECTOR}
                icon="TestIcon"
                iconColor="var(--univer-primary-600)"
                value$={new BehaviorSubject('#ffffff')}
                selections={[]}
            />
        );

        expect(container.querySelector('[data-icon="test"]')?.getAttribute('data-color-channel'))
            .toBe('var(--univer-primary-600)');

        fireEvent.click(container.querySelector('.univer-toolbar-button-selector-main') as HTMLElement);
        expect(commandService.calls).toEqual([{
            commandId: 'test-color-selector',
            params: { value: '#ffffff' },
        }]);
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
