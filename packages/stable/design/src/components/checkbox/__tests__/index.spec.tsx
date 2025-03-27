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

import { Checkbox } from '../Checkbox';

describe('Checkbox', () => {
    it('click Checkbox', async () => {
        function Component() {
            const [checked, setChecked] = useState(false);

            function handleChange(value: string | number | boolean) {
                setChecked(value as boolean);
            }

            return <Checkbox checked={checked} onChange={handleChange}>text</Checkbox>;
        }

        const root = render(<Component />);

        fireEvent.click(root.container.querySelector('input')!);

        const $input = root.container.querySelector('input');

        expect($input?.checked).toBe(true);

        root.unmount();
    });
});
