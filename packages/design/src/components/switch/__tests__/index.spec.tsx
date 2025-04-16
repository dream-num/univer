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
import { cleanup, render } from '@testing-library/react';
import React from 'react';

import { Switch } from '../Switch';

describe('Switch', () => {
    afterEach(cleanup);

    it('renders correctly', () => {
        const { container } = render(<Switch />);
        expect(container);
    });

    it('renders the checked', () => {
        const { container } = render(<Switch defaultChecked />);

        const checkboxElement = container.querySelector('[type="checkbox"]')! as HTMLInputElement;

        expect(checkboxElement.checked).toBeTruthy();
    });

    it('change the checked', () => {
        const { container } = render(<Switch defaultChecked />);

        const checkboxElement = container.querySelector('[type="checkbox"]')! as HTMLInputElement;

        checkboxElement.click();

        expect(checkboxElement.checked).toBeFalsy();
    });
});
