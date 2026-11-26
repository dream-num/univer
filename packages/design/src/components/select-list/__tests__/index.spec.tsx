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
import { SelectList } from '../SelectList';
import '@testing-library/jest-dom/vitest';

afterEach(cleanup);

describe('SelectList', () => {
    const options = [
        { label: 'A', value: 'a' },
        { label: 'B', value: 'b', color: 'red' },
        { label: 'C', value: 'c' },
    ];

    it('should render with value', () => {
        const { getByText } = render(<SelectList value="a" options={options} onChange={() => {}} />);
        expect(getByText('A')).toBeInTheDocument();
    });

    it('should call onChange when select changes (single)', () => {
        const handleChange = vi.fn();
        const { getByText } = render(<SelectList value="a" options={options} onChange={handleChange} />);
        getByText('B').click();
        expect(handleChange).toHaveBeenCalledWith('b');
    });

    it('should call onChange when select changes (multi)', () => {
        const handleChange = vi.fn();
        const { getByText } = render(<SelectList value={['a']} options={options} onChange={handleChange} multiple />);
        getByText('B').click();
        expect(handleChange).toHaveBeenCalledWith(['a', 'b']);
    });

    it('should hide check mark', () => {
        const { container } = render(<SelectList value="a" options={options} onChange={() => {}} hideCheckMark />);
        expect(container.querySelector('svg')).toBeNull();
    });

    it('should apply color style', () => {
        const { getByText } = render(<SelectList value="b" options={options} onChange={() => {}} />);
        expect(getByText('B')).toHaveStyle({ color: 'rgb(255, 0, 0)' });
    });

    it('deselects only the clicked option in multiple mode and supports keyboard navigation', () => {
        const handleChange = vi.fn();
        const { getByRole, getAllByRole } = render(
            <SelectList value={['a', 'b']} options={options} onChange={handleChange} multiple />
        );

        expect(getByRole('listbox')).toHaveAttribute('aria-multiselectable', 'true');
        const optionButtons = getAllByRole('option');
        expect(optionButtons[0]).toHaveAttribute('aria-selected', 'true');
        expect(optionButtons[1]).toHaveAttribute('aria-selected', 'true');
        expect(optionButtons[2]).toHaveAttribute('aria-selected', 'false');

        fireEvent.click(optionButtons[0]);
        expect(handleChange).toHaveBeenCalledExactlyOnceWith(['b']);

        optionButtons[0].focus();
        fireEvent.keyDown(optionButtons[0], { key: 'ArrowDown' });
        expect(optionButtons[1]).toHaveFocus();

        fireEvent.keyDown(optionButtons[1], { key: 'End' });
        expect(optionButtons[2]).toHaveFocus();
    });
});
