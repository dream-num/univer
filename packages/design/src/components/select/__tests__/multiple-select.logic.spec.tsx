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
import { MultipleSelect } from '../MultipleSelect';

import '@testing-library/jest-dom/vitest';

vi.mock('../../dropdown-menu/DropdownMenu', () => {
    return {
        DropdownMenu: ({ children, items = [], onOpenChange }: any) => (
            <div>
                <button type="button" data-testid="open-menu" onClick={() => onOpenChange?.(true)}>
                    open
                </button>
                <button type="button" data-testid="close-menu" onClick={() => onOpenChange?.(false)}>
                    close
                </button>
                {items.map((item: any) => (
                    <button
                        key={item.value}
                        type="button"
                        data-testid={`item-${item.value}`}
                        onClick={() => item.onSelect?.(item.value)}
                    >
                        {String(item.value)}
                    </button>
                ))}
                {children}
            </div>
        ),
    };
});

afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
});

describe('MultipleSelect logic branches', () => {
    const options = [
        { label: 'Option 1', value: '1' },
        { label: 'Option 2', value: '2' },
    ];

    it('should handle open state and checkbox item select branches', () => {
        const onChange = vi.fn();
        const { container } = render(<MultipleSelect value={['1']} options={options} onChange={onChange} />);

        fireEvent.click(screen.getByTestId('open-menu'));
        expect((container.querySelector('[data-u-comp="multiple-select"]') as HTMLDivElement).className).toContain('univer-ring-2');

        fireEvent.click(screen.getByTestId('item-1'));
        expect(onChange).toHaveBeenCalledWith([]);

        fireEvent.click(screen.getByTestId('item-2'));
        expect(onChange).toHaveBeenCalledWith(['1', '2']);

        fireEvent.click(screen.getByTestId('close-menu'));
        expect((container.querySelector('[data-u-comp="multiple-select"]') as HTMLDivElement).className).toContain('univer-cursor-pointer');
    });
});
