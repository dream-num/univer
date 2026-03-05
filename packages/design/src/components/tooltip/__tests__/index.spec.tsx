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

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Tooltip } from '../Tooltip';
import '@testing-library/jest-dom/vitest';

function createRect(left: number, top: number, width: number, height: number): DOMRect {
    return {
        x: left,
        y: top,
        top,
        left,
        width,
        height,
        right: left + width,
        bottom: top + height,
        toJSON() {
            return {};
        },
    } as DOMRect;
}

describe('Tooltip', () => {
    beforeEach(() => {
        vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function getRect() {
            if (this.getAttribute('role') === 'tooltip') {
                return createRect(0, 0, 120, 40);
            }

            if (this.tagName === 'SPAN' || this.tagName === 'BUTTON') {
                return createRect(100, 100, 80, 20);
            }

            return createRect(0, 0, 0, 0);
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
        cleanup();
    });

    it('should show and hide in uncontrolled mode', async () => {
        render(
            <Tooltip title="Tip content">
                Trigger
            </Tooltip>
        );

        const trigger = screen.getByText('Trigger');
        fireEvent.mouseEnter(trigger);
        expect(await screen.findByRole('tooltip')).toHaveTextContent('Tip content');

        fireEvent.mouseLeave(trigger);
        await waitFor(() => {
            expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
        });
    });

    it('should notify visibility changes in controlled mode', () => {
        const onVisibleChange = vi.fn();
        render(
            <Tooltip title="Controlled" visible={false} onVisibleChange={onVisibleChange}>
                Trigger
            </Tooltip>
        );

        const trigger = screen.getByText('Trigger');
        fireEvent.mouseEnter(trigger);
        fireEvent.mouseLeave(trigger);

        expect(onVisibleChange).toHaveBeenCalledWith(true);
        expect(onVisibleChange).toHaveBeenCalledWith(false);
    });

    it('should support non-asChild trigger and focus/blur events', async () => {
        render(
            <Tooltip title="From button" asChild={false}>
                Trigger button
            </Tooltip>
        );

        const button = screen.getByRole('button', { name: 'Trigger button' });
        fireEvent.focus(button);
        expect(await screen.findByRole('tooltip')).toHaveTextContent('From button');
        fireEvent.blur(button);

        await waitFor(() => {
            expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
        });
    });

    it('should only show when overflowing if showIfEllipsis is true', async () => {
        render(
            <Tooltip title="Ellipsis tip" showIfEllipsis>
                Ellipsis target
            </Tooltip>
        );

        const trigger = screen.getByText('Ellipsis target');
        Object.defineProperty(trigger, 'clientWidth', { value: 100, configurable: true });
        Object.defineProperty(trigger, 'scrollWidth', { value: 100, configurable: true });

        fireEvent.mouseEnter(trigger);
        await waitFor(() => {
            expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
        });

        Object.defineProperty(trigger, 'scrollWidth', { value: 140, configurable: true });
        fireEvent.mouseEnter(trigger);
        const tooltip = await screen.findByRole('tooltip');
        expect(tooltip).toBeInTheDocument();
    });

    it('should compute styles for top/left/right placements and update on resize/scroll', async () => {
        const placements = ['top', 'left', 'right'] as const;

        for (const placement of placements) {
            const { unmount } = render(
                <Tooltip title={`tip-${placement}`} placement={placement}>
                    Trigger
                    {' '}
                    {placement}
                </Tooltip>
            );

            const trigger = screen.getByText(`Trigger ${placement}`);
            fireEvent.mouseEnter(trigger);
            const tooltip = await screen.findByRole('tooltip');
            expect(tooltip).toBeInTheDocument();

            fireEvent.resize(window);
            fireEvent.scroll(window);
            expect(tooltip.style.top).not.toBe('');
            expect(tooltip.style.left).not.toBe('');

            unmount();
        }
    });

    it('should run fallback position clamping when no placement fully fits', async () => {
        Object.defineProperty(window, 'innerWidth', { value: 100, configurable: true });
        Object.defineProperty(window, 'innerHeight', { value: 100, configurable: true });

        render(
            <Tooltip title="fallback-tip" placement="top">
                fallback-trigger
            </Tooltip>
        );

        fireEvent.mouseEnter(screen.getByText('fallback-trigger'));
        const tooltip = await screen.findByRole('tooltip');
        expect(tooltip.style.top).not.toBe('');
        expect(tooltip.style.left).not.toBe('');
    });

    it('should handle mouse enter/leave on tooltip portal node', async () => {
        render(
            <Tooltip title="portal-tip">
                portal-trigger
            </Tooltip>
        );

        const trigger = screen.getByText('portal-trigger');
        fireEvent.mouseEnter(trigger);
        const tooltip = await screen.findByRole('tooltip');

        fireEvent.mouseEnter(tooltip);
        fireEvent.mouseLeave(tooltip);
        await waitFor(() => {
            expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
        });
    });

    it('should execute left-placement recompute branch on scroll', async () => {
        vi.restoreAllMocks();
        vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function getRect() {
            if (this.getAttribute('role') === 'tooltip') {
                return createRect(0, 0, 80, 30);
            }
            if (this.tagName === 'SPAN' || this.tagName === 'BUTTON') {
                return createRect(300, 120, 60, 20);
            }
            return createRect(0, 0, 0, 0);
        });
        Object.defineProperty(window, 'innerWidth', { value: 1200, configurable: true });
        Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });

        render(
            <Tooltip title="left-tip" placement="left">
                left-trigger
            </Tooltip>
        );

        fireEvent.mouseEnter(screen.getByText('left-trigger'));
        const tooltip = await screen.findByRole('tooltip');
        fireEvent.scroll(window);
        expect(tooltip.style.left).not.toBe('');
    });
});
