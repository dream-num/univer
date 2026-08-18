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

import type { ComponentType, ReactElement } from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { ILogService, Injector, LocaleService } from '@univerjs/core';
import { ConfigProvider } from '@univerjs/design';
import { of } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ComponentManager } from '../../../../common/component-manager';
import { IconManager } from '../../../../common/icon-manager';
import { MenuItemType } from '../../../../services/menu/menu';
import { IMenuManagerService } from '../../../../services/menu/menu-manager.service';
import { connectInjector } from '../../../../utils/di';
import {
    DropdownMenuLabel,
    DropdownMenuWrapper,
    DropdownWrapper,
    ToolbarDropdownProvider,
    ToolbarTooltip,
    TooltipWrapper,
} from '../TooltipButtonWrapper';

class TestLocaleService {
    t(key: string) {
        return key;
    }
}

class TestLogService {
    warn(): void {}
}

function renderWithDependencies(
    element: ReactElement,
    menuItems: ReturnType<IMenuManagerService['getMenuByPositionKey']> = []
) {
    const injector = new Injector();
    injector.add([LocaleService, { useClass: TestLocaleService as never }]);
    injector.add([ILogService, { useClass: TestLogService as never }]);
    injector.add([ComponentManager]);
    injector.add([IconManager]);
    injector.add([IMenuManagerService, {
        useValue: {
            menuChanged$: of(undefined),
            mergeMenu: () => {},
            appendRootMenu: () => {},
            getMenuByPositionKey: () => menuItems,
            getFlatMenuByPositionKey: () => [],
        },
    }]);
    injector.get(ComponentManager).register('TestDynamicOption', ({ onChange }: { onChange: (value: string) => void }) => (
        <button type="button" onClick={() => onChange('dynamic-value')}>Choose dynamic value</button>
    ));

    const ConnectedTestRoot = connectInjector(() => element, injector) as ComponentType;
    return render(<ConnectedTestRoot />);
}

afterEach(cleanup);

describe('ToolbarTooltip', () => {
    it('stays hidden after its popup closes until a new trigger interaction', () => {
        const renderTooltip = (popupOpen: boolean) => (
            <ToolbarTooltip title="Fill" popupOpen={popupOpen}>
                <button type="button">Fill trigger</button>
            </ToolbarTooltip>
        );
        const { getByRole, queryByRole, rerender } = render(renderTooltip(false));
        const trigger = getByRole('button', { name: 'Fill trigger' }).parentElement;
        if (!trigger) {
            throw new Error('Expected toolbar tooltip trigger wrapper');
        }

        fireEvent.mouseEnter(trigger);
        expect(getByRole('tooltip').textContent).toBe('Fill');

        rerender(renderTooltip(true));
        expect(queryByRole('tooltip')).toBeNull();

        rerender(renderTooltip(false));
        expect(queryByRole('tooltip')).toBeNull();

        fireEvent.mouseLeave(trigger);
        fireEvent.mouseEnter(trigger);
        expect(getByRole('tooltip').textContent).toBe('Fill');
    });
});

describe('DropdownMenuLabel', () => {
    it('preserves option metadata when a custom label emits a dynamic value', () => {
        const onOptionSelect = vi.fn();
        const params = (value?: string | number) => ({ value });
        const option = {
            id: 'dynamic-option',
            commandId: 'dynamic-command',
            label: {
                name: 'TestDynamicOption',
                selectable: false,
            },
            params,
        };
        const { getByRole } = renderWithDependencies(
            <DropdownMenuLabel
                option={option}
                onOptionSelect={onOptionSelect}
            />
        );

        fireEvent.click(getByRole('button', { name: 'Choose dynamic value' }));

        expect(onOptionSelect).toHaveBeenCalledWith({
            ...option,
            value: 'dynamic-value',
        });
    });
});

describe('DropdownWrapper', () => {
    it('opens toward the left in RTL layouts', async () => {
        const { findByText, getByRole } = render(
            <ConfigProvider direction="rtl" mountContainer={document.body}>
                <ToolbarDropdownProvider>
                    <TooltipWrapper dropdownKey="test-dropdown">
                        <DropdownWrapper overlay={<div>Dropdown content</div>}>
                            <button type="button">Open dropdown</button>
                        </DropdownWrapper>
                    </TooltipWrapper>
                </ToolbarDropdownProvider>
            </ConfigProvider>
        );

        fireEvent.click(getByRole('button', { name: 'Open dropdown' }));
        const content = (await findByText('Dropdown content')).closest('[data-slot="popover-content"]');

        expect(content?.getAttribute('data-align')).toBe('end');
    });

    it('closes on an outside pointerdown even when no click follows', async () => {
        const { findByText, getByRole, queryByText } = render(
            <ToolbarDropdownProvider>
                <TooltipWrapper dropdownKey="test-dropdown">
                    <DropdownWrapper overlay={<div>Dropdown content</div>}>
                        <button type="button">Open dropdown</button>
                    </DropdownWrapper>
                </TooltipWrapper>
            </ToolbarDropdownProvider>
        );

        fireEvent.click(getByRole('button', { name: 'Open dropdown' }));
        await findByText('Dropdown content');
        fireEvent.pointerDown(document.body);

        expect(queryByText('Dropdown content')).toBeNull();
    });
});

describe('DropdownMenuWrapper', () => {
    it('renders a single embedded custom panel flush with the dropdown edge', async () => {
        const { findByRole, getByRole } = renderWithDependencies(
            <ToolbarDropdownProvider>
                <TooltipWrapper dropdownKey="test-custom-panel">
                    <DropdownMenuWrapper
                        menuId="test-menu"
                        options={[{
                            label: {
                                name: 'TestDynamicOption',
                                hoverable: false,
                                selectable: false,
                                props: { embedded: true },
                            },
                        }]}
                        onOptionSelect={vi.fn()}
                    >
                        <button type="button">Open custom panel</button>
                    </DropdownMenuWrapper>
                </TooltipWrapper>
            </ToolbarDropdownProvider>
        );

        fireEvent.pointerDown(getByRole('button', { name: 'Open custom panel' }), { button: 0, ctrlKey: false });
        const option = await findByRole('button', { name: 'Choose dynamic value' });
        const menuItem = option.closest('[data-slot="dropdown-menu-item"]');
        const menuContent = option.closest('[data-slot="dropdown-menu-content"]');

        expect(menuItem?.className).toContain('!univer-p-0');
        expect(menuContent?.className).toContain('!univer-p-0');
    });

    it('keeps padding around a non-embedded custom panel', async () => {
        const { findByRole, getByRole } = renderWithDependencies(
            <ToolbarDropdownProvider>
                <TooltipWrapper dropdownKey="test-non-embedded-custom-panel">
                    <DropdownMenuWrapper
                        menuId="test-menu"
                        options={[{
                            label: {
                                name: 'TestDynamicOption',
                                hoverable: false,
                                selectable: false,
                            },
                        }]}
                        onOptionSelect={vi.fn()}
                    >
                        <button type="button">Open non-embedded custom panel</button>
                    </DropdownMenuWrapper>
                </TooltipWrapper>
            </ToolbarDropdownProvider>
        );

        fireEvent.pointerDown(getByRole('button', { name: 'Open non-embedded custom panel' }), { button: 0, ctrlKey: false });
        const option = await findByRole('button', { name: 'Choose dynamic value' });
        const menuItem = option.closest('[data-slot="dropdown-menu-item"]');
        const menuContent = option.closest('[data-slot="dropdown-menu-content"]');

        expect(menuItem?.className).not.toContain('!univer-p-0');
        expect(menuContent?.className).not.toContain('!univer-p-0');
    });

    it('keeps padding around a custom panel when menu actions follow it', async () => {
        const { findByRole, getByRole } = renderWithDependencies(
            <ToolbarDropdownProvider>
                <TooltipWrapper dropdownKey="test-custom-panel-with-action">
                    <DropdownMenuWrapper
                        menuId="test-menu"
                        options={[{
                            label: {
                                name: 'TestDynamicOption',
                                hoverable: false,
                                selectable: false,
                                props: { embedded: true },
                            },
                        }]}
                        onOptionSelect={vi.fn()}
                    >
                        <button type="button">Open custom panel with action</button>
                    </DropdownMenuWrapper>
                </TooltipWrapper>
            </ToolbarDropdownProvider>,
            [{
                key: 'reset',
                order: 0,
                item: {
                    id: 'reset',
                    type: MenuItemType.BUTTON,
                    title: 'Reset',
                },
            }]
        );

        fireEvent.pointerDown(getByRole('button', { name: 'Open custom panel with action' }), { button: 0, ctrlKey: false });
        const option = await findByRole('button', { name: 'Choose dynamic value' });
        const menuItem = option.closest('[data-slot="dropdown-menu-item"]');
        const menuContent = option.closest('[data-slot="dropdown-menu-content"]');

        expect(menuItem?.className).not.toContain('!univer-p-0');
        expect(menuContent?.className).not.toContain('!univer-p-0');
    });
});
