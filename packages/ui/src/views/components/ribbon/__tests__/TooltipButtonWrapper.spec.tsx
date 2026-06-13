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

import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { DropdownMenuLabel } from '../TooltipButtonWrapper';

vi.mock('../../../custom-label/CustomLabel', () => ({
    CustomLabel: (props: { label?: unknown }) => React.createElement(
        'span',
        {
            'data-testid': 'custom-label',
        },
        typeof props.label === 'string' ? props.label : 'custom-label'
    ),
}));

describe('DropdownMenuLabel', () => {
    it('keeps menu content left-aligned and renders the selected checkmark on the right', () => {
        const { container } = render(
            <DropdownMenuLabel
                value="normal"
                option={{
                    value: 'normal',
                    label: 'Normal',
                }}
            />
        );

        const root = container.firstElementChild as HTMLElement;
        const children = Array.from(root.children) as HTMLElement[];

        expect(root.className).toContain('univer-justify-between');
        expect(children[0].className).toContain('univer-min-w-0');
        expect(children[0].className).toContain('univer-gap-2');
        expect(children[1].className).toContain('univer-ml-auto');
        expect(children[1].querySelector('svg')).toBeTruthy();
        expect(screen.getByTestId('custom-label').textContent).toBe('Normal');
    });

    it('reserves the right-side checkmark slot for selectable items even when not selected', () => {
        const { container } = render(
            <DropdownMenuLabel
                value="normal"
                option={{
                    value: 'heading-1',
                    label: 'Heading 1',
                }}
            />
        );

        const root = container.firstElementChild as HTMLElement;
        const children = Array.from(root.children) as HTMLElement[];

        expect(root.className).toContain('univer-justify-between');
        expect(children[1].className).toContain('univer-w-4');
        expect(children[1].querySelector('svg')).toBeNull();
    });
});
