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
import { FormDualColumnLayout, FormLayout } from '../FormLayout';
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

        expect(container.innerHTML).toContain('univer-border-red-500');
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

    it('should render dual column layout', () => {
        const { container } = render(
            <FormDualColumnLayout>
                <div>Left</div>
                <div>Right</div>
            </FormDualColumnLayout>
        );

        expect(screen.getByText('Left')).toBeInTheDocument();
        expect(screen.getByText('Right')).toBeInTheDocument();

        const wrapper = container.firstElementChild as HTMLElement;
        expect(wrapper.className).toContain('univer-flex');
        expect(wrapper.className).toContain('univer-justify-between');
    });
});
