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
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Gallery } from '../Gallery';
import '@testing-library/jest-dom/vitest';

const images = [
    'https://example.com/1.jpg',
    'https://example.com/2.jpg',
    'https://example.com/3.jpg',
];

afterEach(() => {
    cleanup();
});

describe('Gallery', () => {
    beforeEach(() => {
        vi.useRealTimers();
    });
    it('does not render when open is false', () => {
        render(<Gallery images={images} open={false} />);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders and displays the first image when open', () => {
        render(<Gallery images={images} open={true} />);
        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();
        const img = screen.getByRole('img');
        expect(img).toHaveAttribute('src', images[0]);
        expect(img).toHaveAttribute('alt', 'Image 1 of 3');
    });

    it('calls onOpenChange(false) when clicking the overlay', () => {
        const onOpenChange = vi.fn();
        render(<Gallery images={images} open={true} onOpenChange={onOpenChange} />);
        // The overlay is the first child of the dialog
        const dialog = screen.getByRole('dialog');
        const overlay = dialog.querySelector('div');
        if (overlay) {
            fireEvent.click(overlay);
            expect(onOpenChange).toHaveBeenCalledWith(false);
        }
    });

    it('calls onOpenChange(false) when pressing ESC', () => {
        const onOpenChange = vi.fn();
        render(<Gallery images={images} open={true} onOpenChange={onOpenChange} />);
        fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
        expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('toolbar buttons have correct aria-labels', () => {
        render(<Gallery images={images} open={true} />);
        expect(screen.getByRole('button', { name: /zoom in/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /zoom out/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /reset zoom/i })).toBeInTheDocument();
    });

    it('zoom in/out/reset buttons adjust the image scale', () => {
        render(<Gallery images={images} open={true} />);
        const img = screen.getByRole('img');
        const zoomInBtn = screen.getByRole('button', { name: /zoom in/i });
        const zoomOutBtn = screen.getByRole('button', { name: /zoom out/i });
        const resetBtn = screen.getByRole('button', { name: /reset zoom/i });

        expect(img).toHaveStyle('transform: scale(1)');

        fireEvent.click(zoomInBtn);
        expect(img).toHaveStyle('transform: scale(1.25)');

        fireEvent.click(zoomOutBtn);
        expect(img).toHaveStyle('transform: scale(1)');

        fireEvent.click(resetBtn);
        expect(img).toHaveStyle('transform: scale(1)');
    });

    it('can switch images using the pager', () => {
        render(<Gallery images={images} open={true} />);
        const nextButton = document.querySelector('[data-u-comp="pager-right-arrow"]') as HTMLButtonElement;
        fireEvent.click(nextButton);
        const img = screen.getByRole('img');
        expect(img).toHaveAttribute('src', images[1]);
        expect(img).toHaveAttribute('alt', 'Image 2 of 3');
    });

    it('should zoom with wheel event and keep value in range', () => {
        render(<Gallery images={images} open={true} />);
        const img = screen.getByRole('img');
        const getScale = () => Number.parseFloat((img.style.transform.match(/scale\(([^)]+)\)/)?.[1] ?? '1'));

        fireEvent.wheel(window, { deltaY: -300 });
        expect(img.style.transform).toContain('scale(');

        const zoomInBtn = screen.getByRole('button', { name: /zoom in/i });
        const zoomOutBtn = screen.getByRole('button', { name: /zoom out/i });
        for (let i = 0; i < 8; i++) {
            fireEvent.click(zoomInBtn);
        }
        const atUpperBound = getScale();
        fireEvent.click(zoomInBtn);
        expect(getScale()).toBe(atUpperBound);
        expect(getScale()).toBeLessThanOrEqual(2);

        for (let i = 0; i < 12; i++) {
            fireEvent.click(zoomOutBtn);
        }
        const atLowerBound = getScale();
        fireEvent.click(zoomOutBtn);
        expect(getScale()).toBe(atLowerBound);
        expect(getScale()).toBeGreaterThanOrEqual(0.5);
    });

    it('should schedule close animation timer when closing', () => {
        const timeoutSpy = vi.spyOn(globalThis, 'setTimeout');
        const { rerender } = render(<Gallery images={images} open={true} />);
        expect(screen.getByRole('dialog')).toBeInTheDocument();

        rerender(<Gallery images={images} open={false} />);
        expect(screen.getByRole('dialog')).toBeInTheDocument();

        expect(timeoutSpy).toHaveBeenCalled();
        expect(timeoutSpy.mock.calls.some(([, delay]) => delay === 150)).toBe(true);
    });
});
