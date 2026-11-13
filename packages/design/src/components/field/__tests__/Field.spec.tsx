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
import { Field } from '../Field';
import '@testing-library/jest-dom/vitest';

afterEach(cleanup);

describe('Field', () => {
    it('connects the control to its label, help and current validation error', () => {
        const view = render(
            <Field disabled label={<span>Category</span>} help="Choose one field" error="Invalid category">
                {(controlProps) => <input {...controlProps} />}
            </Field>
        );
        const control = view.getByRole('textbox', { name: 'Category' });
        expect(control).toHaveAccessibleDescription('Choose one field Invalid category');
        expect(control).toHaveAttribute('aria-invalid', 'true');
        expect(view.getByRole('group', { name: 'Category' })).toHaveAttribute('aria-disabled', 'true');
        view.rerender(<Field label="Category">{(props) => <input {...props} />}</Field>);
        expect(control).not.toHaveAttribute('aria-invalid');
        expect(control).not.toHaveAttribute('aria-describedby');
        expect(view.getByRole('group', { name: 'Category' })).not.toHaveAttribute('aria-disabled');
    });

    it('exposes numeric messages and leaves supplied controls unchanged', () => {
        const view = render(<Field label="Scale" error={0} help={0}><input aria-label="Scale value" /></Field>);
        expect(view.getByRole('group', { name: 'Scale' })).toHaveAccessibleDescription('0 0');
        expect(view.getByRole('group', { name: 'Scale' })).toHaveAttribute('aria-invalid', 'true');
        expect(view.getByRole('textbox', { name: 'Scale value' })).toBeEnabled();
    });
});
