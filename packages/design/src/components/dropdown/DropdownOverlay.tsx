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
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            let top = triggerRect.bottom + window.scrollY;
            let left = triggerRect.left + window.scrollX;

            // Check if dropdown would go off the bottom of the viewport
            if (top + overlayRect.height > viewportHeight) {
                top = triggerRect.top - overlayRect.height + window.scrollY;
            }

            // Check if dropdown would go off the right of the viewport
            if (left + overlayRect.width > viewportWidth) {
                left = triggerRect.right - overlayRect.width + window.scrollX;
            }

            setPosition({
                top: top + (offset?.y ?? 0),
                left: left + (offset?.x ?? 0),
            });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            ref={overlayRef}
            className={clsx(
                `
                  univer-fixed univer-z-50 univer-min-w-[8rem] univer-overflow-hidden univer-rounded-md univer-border
                  univer-bg-white univer-p-1 univer-shadow-md univer-animate-in univer-fade-in-0 univer-zoom-in-95
                `,
                className
            )}
            style={{
                top: position.top,
                left: position.left,
            }}
        >
            {children}
        </div>
    );
}
