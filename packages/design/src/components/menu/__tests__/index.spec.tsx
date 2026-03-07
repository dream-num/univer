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

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ConfigProvider } from '../../config-provider/ConfigProvider';
import { Menu, MenuItem, TinyMenuGroup } from '../Menu';
import '@testing-library/jest-dom/vitest';

const { menuPropsSpy } = vi.hoisted(() => ({
    menuPropsSpy: vi.fn(),
}));

vi.mock('rc-menu', () => ({
    default: (props: any) => {
        menuPropsSpy(props);
        return (
            <div data-testid="rc-menu" data-prefix={props.prefixCls} className={props.className}>
                {props.children}
            </div>
        );
    },
    MenuItem: (props: any) => <div data-testid="rc-menu-item">{props.children}</div>,
    MenuItemGroup: (props: any) => <div data-testid="rc-menu-group">{props.children}</div>,
    SubMenu: (props: any) => <div data-testid="rc-sub-menu">{props.children}</div>,
}));

vi.mock('../../tooltip/Tooltip', () => ({
    Tooltip: (props: any) => (
        <div data-testid="mock-tooltip" data-title={props.title}>
            {props.children}
        </div>
    ),
}));

afterEach(() => {
    cleanup();
    menuPropsSpy.mockClear();
});

describe('Menu', () => {
    it('should render rc-menu with mount container', () => {
        const mountContainer = document.createElement('div');

        render(
            <ConfigProvider mountContainer={mountContainer}>
                <Menu className="inner-class" wrapperClass="wrapper-class">
                    <MenuItem key="menu-item">Menu Item</MenuItem>
                </Menu>
            </ConfigProvider>
        );

        const rcMenu = screen.getByTestId('rc-menu');
        expect(rcMenu).toHaveClass('wrapper-class');
        expect(rcMenu).toHaveAttribute('data-prefix');
        expect(rcMenu.getAttribute('data-prefix')).toContain('univer-menu');

        const props = menuPropsSpy.mock.calls.at(-1)?.[0];
        expect(props.getPopupContainer()).toBe(mountContainer);
    });

    it('should render nothing without mount container', () => {
        render(
            <ConfigProvider mountContainer={null}>
                <Menu className="inner-class" wrapperClass="wrapper-class" />
            </ConfigProvider>
        );

        expect(screen.queryByTestId('rc-menu')).not.toBeInTheDocument();
    });

    it('should render tiny menu group and support click/tooltip', () => {
        const onClickA = vi.fn();
        const onClickB = vi.fn();

        function IconA(props: { className?: string }) {
            return <span className={props.className}>IconA</span>;
        }

        function IconB(props: { className?: string }) {
            return <span className={props.className}>IconB</span>;
        }

        const { container } = render(
            <TinyMenuGroup
                items={[
                    {
                        key: 'a',
                        className: 'custom-a',
                        Icon: IconA,
                        active: true,
                        tooltip: 'tip-a',
                        onClick: onClickA,
                    },
                    {
                        key: 'b',
                        className: 'custom-b',
                        Icon: IconB,
                        onClick: onClickB,
                    },
                ]}
            />
        );

        expect(screen.getByTestId('mock-tooltip')).toHaveAttribute('data-title', 'tip-a');

        const iconA = screen.getByText('IconA');
        const iconAWrapper = iconA.parentElement as HTMLElement;
        expect(iconAWrapper.className).toContain('univer-bg-gray-50');

        fireEvent.click(iconAWrapper);
        expect(onClickA).toHaveBeenCalledTimes(1);

        const iconB = screen.getByText('IconB');
        fireEvent.click(iconB.parentElement as HTMLElement);
        expect(onClickB).toHaveBeenCalledTimes(1);

        expect(container.querySelectorAll('.custom-a, .custom-b').length).toBe(2);
    });
});
