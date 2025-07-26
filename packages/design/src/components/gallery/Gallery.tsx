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

import { OneToOneIcon, ZoomInIcon, ZoomOutIcon } from '@univerjs/icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from '../../helper/clsx';
import { Pager } from '../pager/Pager';

export interface IGalleryProps {
    className?: string;
    images: string[];
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

const buttonClassName = `
    univer-flex univer-cursor-pointer univer-items-center univer-justify-center univer-border-none
    univer-bg-transparent univer-p-0 univer-text-current
    hover:univer-text-white
`;

export function Gallery(props: IGalleryProps) {
    const { className, images, open, onOpenChange } = props;
    const [isVisible, setIsVisible] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [zoomLevel, setZoomLevel] = useState(1);

    const dialogRef = useRef<HTMLDivElement>(null);

    const activeImage = useMemo(() => images[activeImageIndex], [activeImageIndex, images]);

    // 聚焦管理
    useEffect(() => {
        if (open && dialogRef.current) {
            dialogRef.current.focus();
        }
    }, [open]);

    // ESC 关闭支持
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onOpenChange?.(false);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, onOpenChange]);

    useEffect(() => {
        if (open) {
            setIsVisible(true);
        } else {
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, 150);
            return () => clearTimeout(timer);
        }
    }, [open]);

    if (!open && !isVisible) return null;

    function handleToggleZoom(ratio: number | 'reset') {
        if (ratio === 'reset') {
            setZoomLevel(1);
            return;
        }
        const newZoomLevel = zoomLevel + ratio;
        if (newZoomLevel < 0.5) return;
        if (newZoomLevel > 2) return;
        setZoomLevel(newZoomLevel);
    }

    return createPortal(
        <div
            data-u-comp="gallery"
            role="dialog"
            aria-modal="true"
            aria-label="Image gallery"
            tabIndex={-1}
            ref={dialogRef}
            className={clsx(
                `
                  univer-absolute univer-inset-0 univer-z-[1080] univer-flex univer-size-full univer-select-none
                  univer-items-center univer-justify-center
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
                onClick={() => onOpenChange?.(false)}
            />

            {/* Content */}
            <div className="univer-relative">
                {activeImage && (
                    <img
                        className={`
                          univer-max-h-[40vh] univer-max-w-[60vw] univer-transition-transform univer-duration-300
                          univer-ease-out
                        `}
                        style={{
                            transform: `scale(${zoomLevel})`,
                        }}
                        src={activeImage}
                        alt={`Image ${activeImageIndex + 1} of ${images.length}`}
                        draggable={false}
                    />
                )}
            </div>

            {/* Toolbar */}
            <footer
                className={`
                  univer-absolute univer-bottom-6 univer-left-1/2 univer-flex -univer-translate-x-1/2
                  univer-items-center univer-gap-3 univer-rounded-full univer-bg-gray-800 univer-px-6 univer-py-3
                  univer-text-gray-400
                `}
            >
                <Pager
                    className={`
                      !univer-text-gray-400
                      [&_[data-u-comp=pager-left-arrow]:hover]:!univer-bg-gray-600
                      [&_[data-u-comp=pager-right-arrow]:hover]:!univer-bg-gray-600
                    `}
                    value={activeImageIndex + 1}
                    total={images.length}
                    onChange={(value) => setActiveImageIndex(value - 1)}
                />
                <button
                    type="button"
                    aria-label="Zoom in"
                    className={buttonClassName}
                    onClick={() => handleToggleZoom(0.25)}
                >
                    <ZoomInIcon aria-hidden="true" />
                </button>
                <button
                    type="button"
                    aria-label="Zoom out"
                    className={buttonClassName}
                    onClick={() => handleToggleZoom(-0.25)}
                >
                    <ZoomOutIcon aria-hidden="true" />
                </button>
                <button
                    type="button"
                    aria-label="Reset zoom"
                    className={buttonClassName}
                    onClick={() => handleToggleZoom('reset')}
                >
                    <OneToOneIcon aria-hidden="true" />
                </button>
            </footer>
        </div>,
        document.body
    );
}
