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

import { CloseIcon, OneToOneIcon, ZoomInIcon, ZoomOutIcon } from '@univerjs/icons';
import { useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from '../../helper/clsx';
import { Button } from '../button/Button';
import { ConfigContext } from '../config-provider/ConfigProvider';
import { Pager } from '../pager/Pager';

export interface IGalleryProps {
    className?: string;
    images: string[];
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

const toolbarButtonClassName = `
    !univer-border-transparent !univer-bg-transparent !univer-text-gray-300
    hover:!univer-bg-gray-600 hover:!univer-text-gray-0
    focus-visible:!univer-outline-none focus-visible:!univer-ring-2 focus-visible:!univer-ring-gray-0
`;

const focusableElementSelector = `
    button:not([disabled]), [href], input:not([disabled]), select:not([disabled]),
    textarea:not([disabled]), [tabindex]:not([tabindex="-1"])
`;

export function Gallery(props: IGalleryProps) {
    const { className, images, open, onOpenChange } = props;
    const [isVisible, setIsVisible] = useState(Boolean(open));
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [zoomLevel, setZoomLevel] = useState(1);
    const { direction, locale } = useContext(ConfigContext);

    const dialogRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

    const activeImage = images[activeImageIndex];
    const hasPagination = images.length > 1;
    const imageLabel = locale?.Accessibility.image
        ?.replace('{0}', String(activeImageIndex + 1))
        .replace('{1}', String(images.length)) ?? `Image ${activeImageIndex + 1} of ${images.length}`;

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(Boolean(open));

            if (!open && previouslyFocusedElementRef.current?.isConnected) {
                previouslyFocusedElementRef.current.focus();
            }
            if (!open) {
                previouslyFocusedElementRef.current = null;
            }
        }, open ? 0 : 150);

        return () => clearTimeout(timer);
    }, [open]);

    useEffect(() => {
        if (!open) return;

        previouslyFocusedElementRef.current = document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;
        closeButtonRef.current?.focus();
    }, [open]);

    useEffect(() => {
        if (!open && !isVisible) return;

        const handler = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && open) {
                event.preventDefault();
                event.stopPropagation();
                onOpenChange?.(false);
                return;
            }

            if (event.key !== 'Tab' || !dialogRef.current) {
                return;
            }

            const focusableElements = Array.from(
                dialogRef.current.querySelectorAll<HTMLElement>(focusableElementSelector)
            );

            if (focusableElements.length === 0) {
                event.preventDefault();
                dialogRef.current.focus();
                return;
            }

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            const activeElement = document.activeElement;

            if (event.shiftKey && (activeElement === firstElement || !dialogRef.current.contains(activeElement))) {
                event.preventDefault();
                lastElement.focus();
            } else if (!event.shiftKey && (activeElement === lastElement || !dialogRef.current.contains(activeElement))) {
                event.preventDefault();
                firstElement.focus();
            }
        };

        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isVisible, onOpenChange, open]);

    useEffect(() => {
        return () => {
            if (previouslyFocusedElementRef.current?.isConnected) {
                previouslyFocusedElementRef.current.focus();
            }
        };
    }, []);

    // wheel
    useEffect(() => {
        if (!open) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            const step = -e.deltaY * 0.001;
            setZoomLevel((prev) => Math.min(Math.max(0.5, prev + step), 2));
        };

        window.addEventListener('wheel', handleWheel, { passive: false });
        return () => {
            window.removeEventListener('wheel', handleWheel);
        };
    }, [open]);

    if (!open && !isVisible) return null;

    function handleToggleZoom(ratio: number | 'reset') {
        if (ratio === 'reset') {
            setZoomLevel(1);
            return;
        }

        setZoomLevel((previousZoomLevel) => Math.min(Math.max(0.5, previousZoomLevel + ratio), 2));
    }

    function handleClose() {
        onOpenChange?.(false);
    }

    return createPortal(
        <div
            data-u-comp="gallery"
            dir={direction}
            role="dialog"
            aria-modal="true"
            aria-label={locale?.Accessibility.imageGallery ?? 'Image gallery'}
            tabIndex={-1}
            ref={dialogRef}
            className={clsx(
                `
                  univer-fixed univer-inset-0 univer-z-[1080] univer-flex univer-h-screen univer-w-screen
                  univer-select-none univer-items-center univer-justify-center
                `,
                {
                    'univer-animate-in univer-fade-in': open,
                    'univer-animate-out univer-fade-out': !open,
                },
                className
            )}
        >
            <div
                className="univer-absolute univer-inset-0 univer-size-full univer-bg-gray-900 univer-opacity-80"
                aria-hidden="true"
                onClick={handleClose}
            />

            <Button
                ref={closeButtonRef}
                data-u-comp="gallery-close"
                type="button"
                variant="ghost"
                size="icon"
                aria-label={locale?.Accessibility.close ?? 'Close'}
                className={`
                  univer-absolute univer-right-4 univer-top-4 univer-z-10 univer-size-10 univer-rounded-full
                  !univer-border-gray-500 !univer-bg-gray-800 !univer-text-gray-0
                  hover:!univer-bg-gray-700
                  focus-visible:!univer-outline-none focus-visible:!univer-ring-2 focus-visible:!univer-ring-gray-0
                  rtl:univer-left-4 rtl:univer-right-auto
                `}
                onClick={handleClose}
            >
                <CloseIcon aria-hidden="true" />
            </Button>

            {/* Content */}
            <div
                className="univer-relative univer-flex univer-w-fit univer-items-center univer-justify-center"
            >
                {activeImage && (
                    <img
                        className={`
                          univer-h-full univer-w-full univer-object-contain univer-transition-transform
                          univer-duration-300 univer-ease-out
                        `}
                        style={{
                            transform: `scale(${zoomLevel})`,
                        }}
                        src={activeImage}
                        alt={imageLabel}
                        draggable={false}
                    />
                )}
            </div>

            <span className="univer-sr-only" aria-live="polite" aria-atomic="true">
                {imageLabel}
            </span>

            {/* Toolbar */}
            <footer
                className={`
                  univer-absolute univer-bottom-6 univer-left-1/2 univer-flex -univer-translate-x-1/2
                  univer-items-center univer-gap-3 univer-rounded-full univer-bg-gray-800 univer-px-6 univer-py-3
                  univer-text-gray-400
                  rtl:univer-flex-row-reverse
                `}
            >
                {hasPagination && (
                    <Pager
                        className={`
                          !univer-text-gray-400
                          [&_[data-u-comp=pager-left-arrow]:hover]:!univer-bg-gray-600
                          [&_[data-u-comp=pager-right-arrow]:hover]:!univer-bg-gray-600
                        `}
                        value={activeImageIndex + 1}
                        total={images.length}
                        previousButtonAriaLabel={locale?.Accessibility.previous ?? 'Previous'}
                        nextButtonAriaLabel={locale?.Accessibility.next ?? 'Next'}
                        onChange={(value) => setActiveImageIndex(value - 1)}
                    />
                )}
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={locale?.Accessibility.zoomIn ?? 'Zoom in'}
                    className={toolbarButtonClassName}
                    disabled={zoomLevel >= 2}
                    onClick={() => handleToggleZoom(0.25)}
                >
                    <ZoomInIcon aria-hidden="true" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={locale?.Accessibility.zoomOut ?? 'Zoom out'}
                    className={toolbarButtonClassName}
                    disabled={zoomLevel <= 0.5}
                    onClick={() => handleToggleZoom(-0.25)}
                >
                    <ZoomOutIcon aria-hidden="true" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={locale?.Accessibility.resetZoom ?? 'Reset zoom'}
                    className={toolbarButtonClassName}
                    disabled={zoomLevel === 1}
                    onClick={() => handleToggleZoom('reset')}
                >
                    <OneToOneIcon aria-hidden="true" />
                </Button>
            </footer>
        </div>,
        document.body
    );
}
