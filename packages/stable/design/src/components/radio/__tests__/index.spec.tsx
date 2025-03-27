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
import React from 'react';
import { describe, expect, it } from 'vitest';

import { Radio } from '../Radio';

describe('Radio', () => {
    const component = <Radio value="0">text</Radio>;

    it('click Radio', async () => {
        const { container } = render(component);

        fireEvent.click(container.querySelector('input')!);

        const $input = container.querySelector('input');

        expect($input?.checked).toBe(true);
    });
});
