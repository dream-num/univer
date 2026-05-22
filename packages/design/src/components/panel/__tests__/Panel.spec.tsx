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

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Panel, PanelField, PanelSection } from '../Panel';
import '@testing-library/jest-dom/vitest';

describe('Panel', () => {
    it('should render children', () => {
        render(
            <Panel>
                <div data-testid="child">Content</div>
            </Panel>
        );
        expect(screen.getByTestId('child')).toBeInTheDocument();
    });
});

describe('PanelSection', () => {
    it('should render title and children', () => {
        render(
            <PanelSection title="Section Title">
                <div data-testid="section-child">Section Content</div>
            </PanelSection>
        );
        expect(screen.getByText('Section Title')).toBeInTheDocument();
        expect(screen.getByTestId('section-child')).toBeInTheDocument();
    });

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
    it('should render label and children', () => {
        render(
            <PanelField label="Field Label">
                <input data-testid="field-input" />
            </PanelField>
        );
        expect(screen.getByText('Field Label')).toBeInTheDocument();
        expect(screen.getByTestId('field-input')).toBeInTheDocument();
    });

    it('should show required indicator', () => {
        render(
            <PanelField label="Required Field" required>
                <input />
            </PanelField>
        );
        expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('should show error message', () => {
        render(
            <PanelField label="Field" error="Something went wrong">
                <input />
            </PanelField>
        );
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
});
