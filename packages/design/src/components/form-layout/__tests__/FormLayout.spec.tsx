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

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { InputNumber } from '../../input-number/InputNumber';
import { Input } from '../../input/Input';
import { Select } from '../../select/Select';
import { Textarea } from '../../textarea/Textarea';
import { FormLayout } from '../FormLayout';
import '@testing-library/jest-dom/vitest';

afterEach(cleanup);

describe('FormLayout', () => {
    it('should toggle content when collapsable', () => {
        const { container } = render(
            <FormLayout
                label="Section"
                desc="Description"
                error="Invalid value"
                collapsable
                defaultCollapsed
            >
                <input data-u-comp="input" />
            </FormLayout>
        );

        expect(screen.queryByText('Description')).not.toBeInTheDocument();
        expect(screen.queryByText('Invalid value')).not.toBeInTheDocument();

        fireEvent.click(screen.getByText('Section'));

        expect(screen.getByText('Description')).toBeInTheDocument();
        expect(screen.getByText('Invalid value')).toBeInTheDocument();
        expect(container.querySelector('[data-u-comp="input"]')).toBeInTheDocument();
    });

    it('should keep content visible when not collapsable', () => {
        render(
            <FormLayout label="Always Visible" defaultCollapsed>
                <div>Child Content</div>
            </FormLayout>
        );

        fireEvent.click(screen.getByText('Always Visible'));
        expect(screen.getByText('Child Content')).toBeInTheDocument();
    });

    it('propagates validation to the editable controls and clears it when corrected', () => {
        const fields = (
            <>
                <Input aria-label="Name" />
                <InputNumber aria-label="Count" />
                <Textarea aria-label="Description" />
                <Select aria-label="Type" value="first" options={[{ value: 'first', label: 'First' }]} onChange={() => {}} />
                <FormLayout><Input aria-label="Independent field" /></FormLayout>
            </>
        );
        const { rerender } = render(<FormLayout error="Invalid value">{fields}</FormLayout>);
        for (const name of ['Name', 'Count', 'Description', 'Type']) {
            expect(screen.getByLabelText(name)).toHaveAttribute('aria-invalid', 'true');
        }
        expect(screen.getByLabelText('Independent field')).not.toHaveAttribute('aria-invalid');

        rerender(<FormLayout>{fields}</FormLayout>);
        for (const name of ['Name', 'Count', 'Description', 'Type']) {
            expect(screen.getByLabelText(name)).not.toHaveAttribute('aria-invalid');
        }
        expect(screen.queryByText('Invalid value')).not.toBeInTheDocument();
    });
});
