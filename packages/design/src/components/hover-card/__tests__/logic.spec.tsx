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
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HoverCard } from '../HoverCard';

import '@testing-library/jest-dom/vitest';

vi.mock('../HoverCardPrimitive', async () => {
    const React = await import('react');
    return {
        HoverCardPrimitive: ({ open, onOpenChange, children }: any) => (
            <div
                data-testid="hover-root"
                data-open={String(open)}
                onMouseEnter={() => onOpenChange?.(true)}
                onMouseLeave={() => onOpenChange?.(false)}
            >
                {children}
            </div>
        ),
        HoverCardTrigger: ({ children }: any) => <div data-testid="hover-trigger">{children}</div>,
        HoverCardPortal: ({ children }: any) => <div>{children}</div>,
        HoverCardContent: React.forwardRef<HTMLDivElement, any>(({ children }, ref) => (
            <div ref={ref} data-testid="hover-content">{children}</div>
        )),
    };
});

afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
});

describe('HoverCard logic branches', () => {
    it('should update uncontrolled open state and call onOpenChange', () => {
        const onOpenChange = vi.fn();
        render(
            <HoverCard overlay={<div>Overlay</div>} onOpenChange={onOpenChange}>
                <button type="button">Trigger</button>
            </HoverCard>
        );

        const root = screen.getByTestId('hover-root');
        expect(root.getAttribute('data-open')).toBe('false');

        fireEvent.mouseEnter(root);
        expect(onOpenChange).toHaveBeenCalledWith(true);
        expect(root.getAttribute('data-open')).toBe('true');

        fireEvent.mouseLeave(root);
        expect(onOpenChange).toHaveBeenCalledWith(false);
        expect(root.getAttribute('data-open')).toBe('false');
    });

    it('should block open changes when disabled', () => {
        const onOpenChange = vi.fn();
        render(
            <HoverCard overlay={<div>Overlay</div>} disabled onOpenChange={onOpenChange}>
                <button type="button">Trigger</button>
            </HoverCard>
        );

        const root = screen.getByTestId('hover-root');
        fireEvent.mouseEnter(root);
        fireEvent.mouseLeave(root);

        expect(onOpenChange).not.toHaveBeenCalled();
        expect(root.getAttribute('data-open')).toBe('false');
    });
});
