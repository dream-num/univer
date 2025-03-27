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

import { fireEvent, render } from '@testing-library/react';
import React, { useState } from 'react';
import { describe, expect, it } from 'vitest';

import { Checkbox } from '../../checkbox/Checkbox';
import { CheckboxGroup } from '../CheckboxGroup';

describe('CheckboxGroup', () => {
    let active = ['0'];
    const group = (
        <CheckboxGroup
            value={active}
            onChange={(value) => {
                active = value as string[];
            }}
        >
            <Checkbox value="0">0</Checkbox>
            <Checkbox value="1">1</Checkbox>
        </CheckboxGroup>
    );

    it('click Checkbox', async () => {
        render(group);

        let result = ['0'];
        function Demo() {
            const [active, setActive] = useState(result);

            return (
                <CheckboxGroup
                    value={active}
                    onChange={(value) => {
                        setActive(value as string[]);
                        result = value as string[];
                    }}
                >
                    <Checkbox value="0">x</Checkbox>
                    <Checkbox value="1">y</Checkbox>
                </CheckboxGroup>
            );
        }

        const { getByText } = render(<Demo />);

        fireEvent.click(getByText('y'));
        fireEvent.click(getByText('y'));
        fireEvent.click(getByText('y'));

        expect(result).toEqual(['0', '1']);
    });
});
