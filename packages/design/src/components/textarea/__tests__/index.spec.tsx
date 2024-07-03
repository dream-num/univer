/**
 * Copyright 2023-present DreamNum Inc.
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
import { cleanup, fireEvent, render } from '@testing-library/react';
import { Textarea } from '../Textarea';

describe('Textarea', () => {
    afterEach(cleanup);

    it('renders correctly', () => {
        const { container } = render(<Textarea />);

        expect(container).toBeTruthy();
    });

    it('change the value', () => {
        const { container } = render(<Textarea />);

        const inputElement = container.querySelector('textarea')!;

        fireEvent.change(inputElement, { target: { value: 'Test' } });

        expect(inputElement.value).toBe('Test');
    });
});
