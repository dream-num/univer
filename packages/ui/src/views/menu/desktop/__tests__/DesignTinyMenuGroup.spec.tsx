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
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { DesignTinyMenuGroup } from '../DesignTinyMenuGroup';

describe('DesignTinyMenuGroup', () => {
    it('renders quick icon items as focusable menu buttons', () => {
        const onClick = vi.fn();
        const Icon = () => <span data-testid="quick-icon" />;

        render(
            <DesignTinyMenuGroup
                items={[{
                    key: 'h1',
                    Icon,
                    className: '',
                    onClick,
                    tooltip: 'Heading 1',
                }]}
                columns={6}
                sizeVariant="paragraph-t"
            />
        );

        const button = screen.getByRole('button', { name: 'Heading 1' });
        button.focus();
        fireEvent.click(button);

        expect(document.activeElement).toBe(button);
        expect(button.getAttribute('title')).toBeNull();
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('keeps native titles for default tiny menus', () => {
        const Icon = () => <span data-testid="quick-icon" />;

        const { container } = render(
            <DesignTinyMenuGroup
                items={[{
                    key: 'h1',
                    Icon,
                    className: '',
                    onClick: vi.fn(),
                    tooltip: 'Heading 1',
                }]}
            />
        );

        expect(container.querySelector('button')?.getAttribute('title')).toBe('Heading 1');
    });

    it('uses the primary color channel for two-channel icons', () => {
        const Icon = ({ extend }: { className?: string; extend?: { colorChannel1?: string } }) => (
            React.createElement('span', { 'data-color-channel': extend?.colorChannel1 })
        );
        const { container } = render(
            <DesignTinyMenuGroup
                items={[{
                    key: 'reset',
                    onClick: () => {},
                    className: '',
                    Icon,
                }]}
            />
        );

        expect(container.querySelector('[data-color-channel]')?.getAttribute('data-color-channel')).toBe('var(--univer-primary-600)');
    });

    it('defines explicit grid columns for compact quick layouts with custom column counts', () => {
        const Icon = () => <span data-testid="quick-icon" />;
        const { container } = render(
            <DesignTinyMenuGroup
                items={[
                    { key: 'black', Icon, className: '', onClick: vi.fn() },
                    { key: 'red', Icon, className: '', onClick: vi.fn() },
                ]}
                columns={8}
                layoutVariant="compact"
            />
        );

        expect((container.firstElementChild as HTMLElement).style.gridTemplateColumns).toBe('repeat(8, max-content)');
    });
});
