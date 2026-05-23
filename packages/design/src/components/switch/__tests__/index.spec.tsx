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
import { afterEach, describe, expect, it } from 'vitest';
import { Switch } from '../Switch';
import '@testing-library/jest-dom/vitest';

afterEach(cleanup);

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

    it('should have correct a11y attributes', () => {
        const { container } = render(<Switch />);
        const label = container.querySelector('label');
        expect(label).toHaveAttribute('role', 'switch');
        expect(label).toHaveAttribute('aria-checked', 'false');
    });

    it('should update aria-checked when checked changes', () => {
        const { container } = render(<Switch defaultChecked />);
        const label = container.querySelector('label');
        expect(label).toHaveAttribute('aria-checked', 'true');
    });
});
