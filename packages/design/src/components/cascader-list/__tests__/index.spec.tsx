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

import { afterEach, describe, expect, it } from 'vitest';
import React from 'react';
import { cleanup, render } from '@testing-library/react';
import { CascaderList } from '../CascaderList';

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
});
