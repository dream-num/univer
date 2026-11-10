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

import type { ComponentProps, PropsWithChildren } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import enUS from '../../../locale/en-US';
import { ConfigProvider } from '../../config-provider/ConfigProvider';
import { Gallery } from '../Gallery';
import '@testing-library/jest-dom/vitest';

const images = [
    'https://example.com/1.jpg',
    'https://example.com/2.jpg',
    'https://example.com/3.jpg',
];

function LocaleProvider({ children }: PropsWithChildren) {
    return <ConfigProvider locale={enUS.design} mountContainer={document.body}>{children}</ConfigProvider>;
}

function renderGallery(props: ComponentProps<typeof Gallery>) {
    return render(<Gallery {...props} />, { wrapper: LocaleProvider });
}

function FocusHarness({ open }: { open: boolean }) {
    return (
        <>
            <button type="button">Open gallery trigger</button>
            <Gallery images={images} open={open} />
        </>
    );
}

afterEach(() => {
    cleanup();
    vi.useRealTimers();
});

describe('Gallery', () => {
    it('does not render when open is false', () => {
        renderGallery({ images, open: false });
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders and displays the first image when open', () => {
        renderGallery({ images, open: true });
        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();
        const img = screen.getByRole('img');
        expect(img).toHaveAttribute('src', images[0]);
        expect(img).toHaveAttribute('alt', 'Image 1 of 3');
    });

    it('calls onOpenChange(false) when clicking the overlay', () => {
        const onOpenChange = vi.fn();
        renderGallery({ images, open: true, onOpenChange });
        // The overlay is the first child of the dialog
        const dialog = screen.getByRole('dialog');
        const overlay = dialog.querySelector('div');
        expect(overlay).not.toBeNull();
        fireEvent.click(overlay!);
        expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('calls onOpenChange(false) when pressing ESC', () => {
        const onOpenChange = vi.fn();
        renderGallery({ images, open: true, onOpenChange });
        fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
        expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('provides named close, pagination, and zoom controls', () => {
        renderGallery({ images, open: true });
        expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
        expect(screen.getByRole('button', { name: /zoom in/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /zoom out/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /reset zoom/i })).toBeInTheDocument();
    });

    it('calls onOpenChange(false) when clicking the close button', () => {
        const onOpenChange = vi.fn();
        renderGallery({ images, open: true, onOpenChange });

        fireEvent.click(screen.getByRole('button', { name: 'Close' }));

        expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('contains focus while open and restores it after closing', () => {
        vi.useFakeTimers();
        const { rerender } = render(<FocusHarness open={false} />, { wrapper: LocaleProvider });
        const trigger = screen.getByRole('button', { name: 'Open gallery trigger' });
        trigger.focus();

        rerender(<FocusHarness open />);

        const closeButton = screen.getByRole('button', { name: 'Close' });
        const zoomOutButton = screen.getByRole('button', { name: /zoom out/i });
        expect(closeButton).toHaveFocus();

        fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });
        expect(zoomOutButton).toHaveFocus();

        fireEvent.keyDown(window, { key: 'Tab' });
        expect(closeButton).toHaveFocus();

        rerender(<FocusHarness open={false} />);
        act(() => vi.advanceTimersByTime(150));
        expect(trigger).toHaveFocus();
    });

    it('zoom in/out/reset buttons adjust the image scale', () => {
        renderGallery({ images, open: true });
        const img = screen.getByRole('img');
        const zoomInBtn = screen.getByRole('button', { name: /zoom in/i });
        const zoomOutBtn = screen.getByRole('button', { name: /zoom out/i });
        const resetBtn = screen.getByRole('button', { name: /reset zoom/i });
        const getScale = () => Number.parseFloat(img.style.transform.match(/scale\(([^)]+)\)/)?.[1] ?? '');
        const initialScale = getScale();

        fireEvent.click(zoomInBtn);
        const zoomedScale = getScale();
        expect(zoomedScale).toBeGreaterThan(initialScale);

        fireEvent.click(zoomOutBtn);
        expect(getScale()).toBeLessThan(zoomedScale);

        fireEvent.click(zoomInBtn);
        fireEvent.click(resetBtn);
        expect(getScale()).toBe(initialScale);
    });

    it('can switch images using the pager', () => {
        renderGallery({ images, open: true });
        const nextButton = document.querySelector('[data-u-comp="pager-right-arrow"]') as HTMLButtonElement;
        fireEvent.click(nextButton);
        const img = screen.getByRole('img');
        expect(img).toHaveAttribute('src', images[1]);
        expect(img).toHaveAttribute('alt', 'Image 2 of 3');
    });

    it('opens the requested first image in each new preview session', () => {
        const { rerender } = renderGallery({ images, open: true });
        fireEvent.click(screen.getByRole('button', { name: 'Next' }));
        rerender(<Gallery images={images} open={false} />);
        const reorderedImages = [images[2], images[0], images[1]];
        rerender(<Gallery images={reorderedImages} open />);
        expect(screen.getByRole('img')).toHaveAttribute('src', images[2]);
        expect(screen.getByRole('img')).toHaveAccessibleName('Image 1 of 3');

        fireEvent.click(screen.getByRole('button', { name: 'Next' }));
        rerender(<Gallery images={reorderedImages} open={false} />);
        rerender(<Gallery images={[images[0]]} open />);
        expect(screen.getByRole('img')).toHaveAttribute('src', images[0]);
    });

    it('keeps a valid preview when images are removed while open', () => {
        const { rerender } = renderGallery({ images, open: true });
        fireEvent.click(screen.getByRole('button', { name: 'Next' }));
        fireEvent.click(screen.getByRole('button', { name: 'Next' }));
        rerender(<Gallery images={[images[0]]} open />);
        expect(screen.getByRole('img')).toHaveAttribute('src', images[0]);
        expect(screen.getByRole('img')).toHaveAccessibleName('Image 1 of 1');
    });

    it('does not render pagination for a single image', () => {
        renderGallery({ images: [images[0]], open: true });

        expect(document.querySelector('[data-u-comp="pager"]')).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: /zoom in/i })).toBeInTheDocument();
    });

    it('should zoom with wheel event and keep value in range', () => {
        renderGallery({ images, open: true });
        const img = screen.getByRole('img');
        const getScale = () => Number.parseFloat(img.style.transform.match(/scale\(([^)]+)\)/)?.[1] ?? '');
        const initialScale = getScale();

        fireEvent.wheel(window, { deltaY: -300 });
        const zoomedScale = getScale();
        expect(zoomedScale).toBeGreaterThan(initialScale);
        fireEvent.wheel(window, { deltaY: 300 });
        expect(getScale()).toBeLessThan(zoomedScale);

        const zoomInBtn = screen.getByRole('button', { name: /zoom in/i });
        const zoomOutBtn = screen.getByRole('button', { name: /zoom out/i });
        for (let i = 0; i < 8; i++) {
            fireEvent.click(zoomInBtn);
        }
        const atUpperBound = getScale();
        fireEvent.click(zoomInBtn);
        expect(getScale()).toBe(atUpperBound);
        expect(zoomInBtn).toBeDisabled();

        for (let i = 0; i < 12; i++) {
            fireEvent.click(zoomOutBtn);
        }
        const atLowerBound = getScale();
        fireEvent.click(zoomOutBtn);
        expect(getScale()).toBe(atLowerBound);
        expect(zoomOutBtn).toBeDisabled();
    });

    it('keeps the preview during exit and removes it after the animation', () => {
        vi.useFakeTimers();
        const { rerender } = renderGallery({ images, open: true });
        act(() => vi.runAllTimers());
        rerender(<Gallery images={images} open={false} />);
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        act(() => vi.runAllTimers());
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
});
