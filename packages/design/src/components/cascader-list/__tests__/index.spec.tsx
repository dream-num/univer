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
import { CascaderList } from '../CascaderList';

afterEach(cleanup);

describe('CascaderList', () => {
    afterEach(cleanup);

    // const options: ICascaderListProps['options'] = [
    //     {
    //         label: 'Option 1',
    //         value: 'option1',
    //         children: [
    //             { label: 'Option 1-1', value: 'option1-1' },
    //             { label: 'Option 1-2', value: 'option1-2' },
    //         ],
    //     },
    //     {
    //         label: 'Option 2',
    //         value: 'option2',
    //         children: [
    //             { label: 'Option 2-1', value: 'option2-1' },
    //             { label: 'Option 2-2', value: 'option2-2' },
    //         ],
    //     },
    // ];

    it('renders correctly with default props', () => {
        const { container } = render(<CascaderList value={[]} onChange={() => {}} />);

        expect(container).toBeTruthy();
    });

    it('should select parent and child options', () => {
        const onChange = vi.fn();
        const options = [
            {
                label: 'A',
                value: 'a',
                children: [
                    { label: 'A-1', value: 'a-1' },
                    { label: 'A-2', value: 'a-2' },
                ],
            },
            {
                label: 'B',
                value: 'b',
            },
        ];

        const { getByText, rerender } = render(<CascaderList value={[]} options={options} onChange={onChange} />);
        fireEvent.click(getByText('A'));
        expect(onChange).toHaveBeenCalledWith(['a']);

        rerender(<CascaderList value={['a']} options={options} onChange={onChange} />);
        fireEvent.click(getByText('A-2'));
        expect(onChange).toHaveBeenCalledWith(['a', 'a-2']);
    });

    it('should ignore same value click and rewrite path when parent changes', () => {
        const onChange = vi.fn();
        const options = [
            {
                label: 'A',
                value: 'a',
                children: [{ label: 'A-1', value: 'a-1' }],
            },
            {
                label: 'B',
                value: 'b',
                children: [{ label: 'B-1', value: 'b-1' }],
            },
        ];

        const { getByText } = render(
            <CascaderList value={['a', 'a-1']} options={options} onChange={onChange} />
        );

        fireEvent.click(getByText('A'));
        expect(onChange).not.toHaveBeenCalledWith(['a', 'a-1']);

        fireEvent.click(getByText('B'));
        expect(onChange).toHaveBeenCalledWith(['b']);
    });
});
