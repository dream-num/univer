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

import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DropdownMenu } from '../DropdownMenu';
import '@testing-library/jest-dom/vitest';

afterEach(cleanup);

describe('DropdownMenu', () => {
    it('should render with normal items', () => {
        const items = [
            { type: 'item' as const, children: 'Item 1' },
            { type: 'item' as const, children: 'Item 2', disabled: true },
        ];
        const { container } = render(
            <DropdownMenu items={items}>
                <button type="button">Trigger</button>
            </DropdownMenu>
        );
        expect(container).toMatchSnapshot();
    });

    it('should render with separator', () => {
        const items = [
            { type: 'item' as const, children: 'Item 1' },
            { type: 'separator' as const },
            { type: 'item' as const, children: 'Item 2' },
        ];
        const { container } = render(
            <DropdownMenu items={items}>
                <button type="button">Trigger</button>
            </DropdownMenu>
        );
        expect(container).toMatchSnapshot();
    });

    it('should render with subItem', () => {
        const items = [
            {
                type: 'subItem' as const,
                children: 'More',
                options: [
                    { type: 'item' as const, children: 'Sub 1' },
                    { type: 'item' as const, children: 'Sub 2' },
                ],
            },
        ];
        const { container } = render(
            <DropdownMenu items={items}>
                <button type="button">Trigger</button>
            </DropdownMenu>
        );
        expect(container).toMatchSnapshot();
    });

    it('should render with radio group', () => {
        const items = [
            {
                type: 'radio' as const,
                value: 'a',
                options: [
                    { label: 'A', value: 'a' },
                    { label: 'B', value: 'b' },
                ],
            },
        ];
        const { container } = render(
            <DropdownMenu items={items}>
                <button type="button">Trigger</button>
            </DropdownMenu>
        );
        expect(container).toMatchSnapshot();
    });

    it('should render with checkbox', () => {
        const items = [
            {
                type: 'checkbox' as const,
                value: 'c1',
                label: 'Check 1',
                checked: true,
            },
            {
                type: 'checkbox' as const,
                value: 'c2',
                label: 'Check 2',
                checked: false,
            },
        ];
        const { container } = render(
            <DropdownMenu items={items}>
                <button type="button">Trigger</button>
            </DropdownMenu>
        );
        expect(container).toMatchSnapshot();
    });

    it('should invoke onSelect callbacks for item/checkbox/radio', () => {
        const onItemSelect = vi.fn();
        const onCheckboxSelect = vi.fn();
        const onRadioSelect = vi.fn();

        const items = [
            { type: 'item' as const, children: 'Run', onSelect: onItemSelect },
            { type: 'checkbox' as const, value: 'c1', label: 'Check', checked: false, onSelect: onCheckboxSelect },
            {
                type: 'radio' as const,
                value: 'a',
                onSelect: onRadioSelect,
                options: [{ label: 'A', value: 'a' }, { label: 'B', value: 'b' }],
            },
        ];

        const { getByText } = render(
            <DropdownMenu open items={items}>
                <button type="button">Trigger</button>
            </DropdownMenu>
        );

        fireEvent.click(getByText('Run'));
        fireEvent.click(getByText('Check'));
        fireEvent.click(getByText('B'));

        expect(onItemSelect).toHaveBeenCalled();
        expect(onCheckboxSelect).toHaveBeenCalledWith('c1');
        expect(onRadioSelect).toHaveBeenCalledWith('b');
    });

    it('should throw when radio option misses value', () => {
        const badItems = [
            {
                type: 'radio' as const,
                value: 'a',
                options: [{ label: 'Missing Value' }],
            },
        ];

        expect(() =>
            render(
                <DropdownMenu open items={badItems}>
                    <button type="button">Trigger</button>
                </DropdownMenu>
            )
        ).toThrow('[DropdownMenu]: `value` is required');
    });
});
