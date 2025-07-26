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

import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MultipleSelect } from '../MultipleSelect';
import { Select } from '../Select';
import '@testing-library/jest-dom/vitest';

const options = [
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' },
    { label: 'Option 3', value: '3', disabled: true },
    { label: 'Group', options: [
        { label: 'G1', value: 'g1' },
        { label: 'G2', value: 'g2' },
    ] },
];

afterEach(cleanup);

describe('Select', () => {
    it('should render with value', () => {
        const { getByText } = render(<Select value="1" options={options} onChange={() => {}} />);
        expect(getByText('Option 1')).toBeInTheDocument();
    });

    it('should render with group value', () => {
        const { getByText } = render(<Select value="g2" options={options} onChange={() => {}} />);
        expect(getByText('G2')).toBeInTheDocument();
    });

    it('should call onChange when select changes', () => {
        const handleChange = vi.fn();
        const { container } = render(<Select value="1" options={options} onChange={handleChange} />);
        const selectDiv = container.querySelector('[data-u-comp="select"]');
        if (selectDiv) {
            selectDiv.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            const optionBtn = Array.from(document.querySelectorAll('button')).find((btn) => btn.textContent === 'Option 2');
            if (optionBtn) {
                optionBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                expect(handleChange).toHaveBeenCalledWith('2');
            }
        }
    });

    it('should not call onChange when disabled', () => {
        const handleChange = vi.fn();
        const { container } = render(<Select value="1" options={options} onChange={handleChange} disabled />);
        const selectDiv = container.querySelector('[data-u-comp="select"]');
        if (selectDiv) {
            selectDiv.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            const optionBtn = Array.from(document.querySelectorAll('button')).find((btn) => btn.textContent === 'Option 2');
            if (optionBtn) {
                optionBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                expect(handleChange).not.toHaveBeenCalled();
            }
        }
    });

    it('should render borderless', () => {
        const { container } = render(<Select value="1" options={options} onChange={() => {}} borderless />);
        expect(container.querySelector('[data-u-comp="select"]')).toHaveClass('univer-border-transparent', { exact: false });
    });
});

describe('MultipleSelect', () => {
    it('should render with values', () => {
        const { getByText } = render(<MultipleSelect value={['1', '2']} options={options} onChange={() => {}} />);
        expect(getByText('Option 1')).toBeInTheDocument();
        expect(getByText('Option 2')).toBeInTheDocument();
    });

    it('should call onChange when select changes', () => {
        const handleChange = vi.fn();
        const { container } = render(<MultipleSelect value={['1']} options={options} onChange={handleChange} />);
        const selectDiv = container.querySelector('[data-u-comp="select"]');
        if (selectDiv) {
            selectDiv.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            const optionBtn = Array.from(document.querySelectorAll('button')).find((btn) => btn.textContent === 'Option 2');
            if (optionBtn) {
                optionBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                expect(handleChange).toHaveBeenCalledWith(['1', '2']);
            }
        }
    });

    it('should not call onChange when disabled', () => {
        const handleChange = vi.fn();
        const { container } = render(<MultipleSelect value={['1']} options={options} onChange={handleChange} disabled />);
        const selectDiv = container.querySelector('[data-u-comp="select"]');
        if (selectDiv) {
            selectDiv.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            const optionBtn = Array.from(document.querySelectorAll('button')).find((btn) => btn.textContent === 'Option 2');
            if (optionBtn) {
                optionBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                expect(handleChange).not.toHaveBeenCalled();
            }
        }
    });
});
