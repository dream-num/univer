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
import { afterEach, expect, it } from 'vitest';
import { FieldGroup } from '../FieldGroup';
import '@testing-library/jest-dom/vitest';

afterEach(cleanup);

it('labels and disables related controls together while exposing validation messages', () => {
    const controls = (
        <>
            <input aria-label="Minimum" />
            <input aria-label="Maximum" />
        </>
    );
    const view = render(
        <FieldGroup disabled label={<strong>Scale</strong>} help="Visible scale" error="Maximum must exceed minimum">
            {controls}
        </FieldGroup>
    );
    expect(view.getByRole('group', { name: 'Scale' })).toHaveAccessibleDescription('Visible scale Maximum must exceed minimum');
    expect(view.getByRole('textbox', { name: 'Minimum' })).toBeDisabled();
    expect(view.getByRole('textbox', { name: 'Maximum' })).toBeDisabled();
    view.rerender(<FieldGroup label="Scale">{controls}</FieldGroup>);
    expect(view.getByRole('textbox', { name: 'Minimum' })).toBeEnabled();
    expect(view.getByRole('textbox', { name: 'Maximum' })).toBeEnabled();
    expect(view.getByRole('group', { name: 'Scale' })).not.toHaveAttribute('aria-invalid');
});
