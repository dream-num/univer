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
import { afterEach, describe, expect, it } from 'vitest';
import { Input } from '../Input';

describe('Input', () => {
    afterEach(cleanup);

    it('renders correctly', () => {
        const { container } = render(<Input />);

        expect(container);
    });

    it('renders the placeholder', () => {
        const { getByPlaceholderText } = render(<Input placeholder="Test" />);
        const inputElement = getByPlaceholderText('Test');

        expect(inputElement).not.toBeNull();
    });

    it('renders the value', () => {
        const { getByDisplayValue } = render(<Input value="Test" />);
        const inputElement = getByDisplayValue('Test');

        expect(inputElement).not.toBeNull();
    });

    it('renders the disabled', () => {
        const { container } = render(<Input disabled />);

        expect(container.querySelector('input')?.disabled).toBeTruthy();
    });

    it('renders the size', () => {
        const { container } = render(<Input size="large" />);

        expect(container.innerHTML).contains('univer-h-12');
    });

    it('renders the clearable', () => {
        const { container } = render(<Input allowClear value="x" />);

        expect(container.innerHTML).contains('type="button"');
    });

    it('change the value', () => {
        const { container } = render(<Input />);

        const inputElement = container.querySelector('input')!;

        fireEvent.change(inputElement, { target: { value: 'Test' } });

        expect(inputElement.value).toBe('Test');
    });
});
