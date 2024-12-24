/**
 * Copyright 2023-present DreamNum Inc.
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

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import clsx from '../../helper/clsx';
import { useDropdown } from './DropdownContext';

interface IDropdownOverlayProps {
    children: React.ReactNode;
    className?: string;
    offset?: {
        x?: number;
        y?: number;
    };
}

export function DropdownOverlay({ children, className, offset }: IDropdownOverlayProps) {
    const { isOpen, overlayRef, triggerRef } = useDropdown();
    const [position, setPosition] = useState({ top: 0, left: 0 });

    useEffect(() => {
        if (isOpen && triggerRef.current && overlayRef.current) {
            const triggerRect = triggerRef.current.getBoundingClientRect();
            const overlayRect = overlayRef.current.getBoundingClientRect();
            const viewportWidth = document.documentElement.clientWidth;
            const viewportHeight = document.documentElement.clientHeight;

            let top = triggerRect.bottom + window.scrollY;
            let left = triggerRect.left + window.scrollX;

            if (top + overlayRect.height > viewportHeight + window.scrollY) {
                top = triggerRect.top - overlayRect.height + window.scrollY;
            }

            if (left + overlayRect.width > viewportWidth + window.scrollX) {
                left = triggerRect.right - overlayRect.width + window.scrollX;
            }

            top = Math.max(top, window.scrollY);
            left = Math.max(left, window.scrollX);

            setPosition({
                top: top + (offset?.y ?? 0),
                left: left + (offset?.x ?? 0),
            });
        }
    }, [isOpen, offset?.x, offset?.y, overlayRef, triggerRef]);

    if (!isOpen) return null;

    return createPortal(
        <div
            ref={overlayRef}
            className={clsx(
                `
                  univer-fixed univer-z-50 univer-overflow-hidden univer-rounded-md univer-border univer-bg-white
                  univer-shadow-md univer-animate-in univer-fade-in-0 univer-zoom-in-95
                `,
                className
            )}
            style={{
                top: position.top,
                left: position.left,
            }}
        >
            {children}
        </div>,
        document.body
    );
}
