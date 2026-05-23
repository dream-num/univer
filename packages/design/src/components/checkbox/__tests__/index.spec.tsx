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
import { useState } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { Checkbox } from '../Checkbox';
import '@testing-library/jest-dom/vitest';

afterEach(cleanup);

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

    it('should have correct a11y attributes', () => {
        const { container } = render(<Checkbox checked={false}>text</Checkbox>);
        const label = container.querySelector('label');
        const checkbox = container.querySelector('[role="checkbox"]');
        expect(checkbox).toHaveAttribute('aria-checked', 'false');
        expect(label).toHaveAttribute('data-u-comp', 'checkbox');
    });

    it('should have aria-indeterminate when indeterminate', () => {
        const { container } = render(<Checkbox checked indeterminate>text</Checkbox>);
        const checkbox = container.querySelector('[role="checkbox"]');
        const input = container.querySelector('input');
        expect(checkbox).toHaveAttribute('aria-checked', 'true');
        expect(input).toHaveAttribute('aria-indeterminate', 'true');
    });
});
