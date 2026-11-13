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
import { PanelField, PanelSection } from '../Panel';
import '@testing-library/jest-dom/vitest';

afterEach(cleanup);

describe('PanelSection', () => {
    it('should toggle content when clicked', () => {
        render(
            <PanelSection title="Toggle Me">
                <div data-testid="toggle-child">Hidden Content</div>
            </PanelSection>
        );

        const button = screen.getByRole('button', { name: /Toggle Me/i });
        expect(button).toHaveAttribute('aria-expanded', 'true');

        fireEvent.click(button);
        expect(button).toHaveAttribute('aria-expanded', 'false');

        fireEvent.click(button);
        expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('should not toggle when collapsible is false', () => {
        render(
            <PanelSection title="Static" collapsible={false}>
                <div>Content</div>
            </PanelSection>
        );

        const button = screen.getByRole('button', { name: /Static/i });
        expect(button).toBeDisabled();
    });
});

describe('PanelField', () => {
    it('connects the control with its required label and validation error', () => {
        render(
            <PanelField label="Name" required error="Enter a name">
                {(controlProps) => <input {...controlProps} />}
            </PanelField>
        );
        const control = screen.getByRole('textbox', { name: 'Name *' });
        expect(control).toHaveAccessibleDescription('Enter a name');
        expect(control).toHaveAttribute('aria-invalid', 'true');
    });
});
