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
import { Segmented } from '../Segmented';
import '@testing-library/jest-dom/vitest';

afterEach(cleanup);

describe('Segmented', () => {
    const items = [
        { label: 'A', value: 'a' },
        { label: 'B', value: 'b' },
        { label: 'C', value: 'c' },
    ];

    it('should render and select first by default', () => {
        const { getByText } = render(<Segmented items={items} />);
        expect(getByText('A')).toHaveClass('univer-text-gray-900', { exact: false });
        expect(getByText('B')).not.toHaveClass('univer-text-gray-900', { exact: false });
    });

    it('should select by defaultValue', () => {
        const { getByText } = render(<Segmented items={items} defaultValue="b" />);
        expect(getByText('B')).toHaveClass('univer-text-gray-900', { exact: false });
    });

    it('should call onChange when click', () => {
        const handleChange = vi.fn();
        const { getByText } = render(<Segmented items={items} onChange={handleChange} />);
        getByText('B').click();
        expect(handleChange).toHaveBeenCalledWith('b');
    });

    it('should support controlled value', () => {
        const { getByText, rerender } = render(<Segmented items={items} value="a" />);
        expect(getByText('A')).toHaveClass('univer-text-gray-900', { exact: false });
        rerender(<Segmented items={items} value="c" />);
        expect(getByText('C')).toHaveClass('univer-text-gray-900', { exact: false });
    });
});
