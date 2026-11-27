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
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Accordion } from '../Accordion';

afterEach(cleanup);

describe('Accordion', () => {
    it('should render all items and only open one at a time', () => {
        const items = [
            { label: 'Item 1', children: <div>Content 1</div> },
            { label: 'Item 2', children: <div>Content 2</div> },
            { label: 'Item 3', children: <div>Content 3</div> },
        ];
        const { getByText, queryByText } = render(<Accordion items={items} />);
        const firstTrigger = getByText('Item 1').closest('button');
        const firstArrow = firstTrigger?.querySelector('[aria-hidden="true"]');

        // Should be hidden by default
        expect(firstArrow?.getAttribute('class')).toContain('rtl:univer-rotate-90');
        expect(queryByText('Content 1')?.parentElement?.parentElement?.className).toContain('univer-max-h-0');
        expect(queryByText('Content 2')?.parentElement?.parentElement?.className).toContain('univer-max-h-0');
        expect(queryByText('Content 3')?.parentElement?.parentElement?.className).toContain('univer-max-h-0');

        // Should expand the first item
        fireEvent.click(getByText('Item 1'));
        expect(firstArrow?.getAttribute('class')).not.toContain('rtl:univer-rotate-90');
        expect(getByText('Content 1').parentElement?.parentElement?.className).toContain('univer-max-h-screen');
        expect(queryByText('Content 2')?.parentElement?.parentElement?.className).toContain('univer-max-h-0');
        expect(queryByText('Content 3')?.parentElement?.parentElement?.className).toContain('univer-max-h-0');

        // Should expand the second item
        fireEvent.click(getByText('Item 2'));
        expect(getByText('Content 2').parentElement?.parentElement?.className).toContain('univer-max-h-screen');
        expect(queryByText('Content 1')?.parentElement?.parentElement?.className).toContain('univer-max-h-0');
        expect(queryByText('Content 3')?.parentElement?.parentElement?.className).toContain('univer-max-h-0');

        // Should collapse the second item
        fireEvent.click(getByText('Item 2'));
        expect(queryByText('Content 2')?.parentElement?.parentElement?.className).toContain('univer-max-h-0');
    });

    it('exposes WAI-ARIA trigger/region relationships and honors controlled openIndex including null', () => {
        const onOpenIndexChange = vi.fn();
        const items = [
            { id: 'first', label: 'Section A', children: <div>Body A</div> },
            { id: 'second', label: 'Section B', children: <div>Body B</div> },
        ];

        const { getByRole, rerender } = render(
            <Accordion items={items} defaultOpenIndex={0} openIndex={null} onOpenIndexChange={onOpenIndexChange} />
        );

        const triggerA = getByRole('button', { name: 'Section A' });
        expect(triggerA.getAttribute('aria-expanded')).toBe('false');
        const panelAId = triggerA.getAttribute('aria-controls');
        expect(panelAId).toBeTruthy();

        const panelA = document.getElementById(panelAId!);
        expect(panelA?.getAttribute('role')).toBe('region');
        expect(panelA?.getAttribute('aria-labelledby')).toBe(triggerA.id);
        expect(panelA?.getAttribute('aria-hidden')).toBe('true');

        fireEvent.click(triggerA);
        expect(onOpenIndexChange).toHaveBeenCalledWith(0);
        // Remains collapsed while controlled openIndex stays null
        expect(triggerA.getAttribute('aria-expanded')).toBe('false');

        rerender(
            <Accordion items={items} defaultOpenIndex={0} openIndex={0} onOpenIndexChange={onOpenIndexChange} />
        );
        expect(triggerA.getAttribute('aria-expanded')).toBe('true');
        expect(panelA?.getAttribute('aria-hidden')).toBe('false');
    });
});
