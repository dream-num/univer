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

import { useCallback, useRef } from 'react';

export function useDialogFocus(mask: boolean, onCloseAutoFocus?: (event: Event) => void) {
    const returnFocusRef = useRef<HTMLElement | null>(null);
    const contentRef = useRef<HTMLDivElement | null>(null);

    const handleContentRef = useCallback((node: HTMLDivElement | null) => {
        const previousContent = contentRef.current;
        contentRef.current = node;
        if (!node && previousContent && mask && !onCloseAutoFocus) {
            // Restore input after DOM removal, before FocusScope's deferred unmount timer.
            Promise.resolve().then(() => {
                const returnFocus = returnFocusRef.current;
                if (!contentRef.current && !previousContent.isConnected && returnFocus?.isConnected &&
                    returnFocus.ownerDocument.activeElement === returnFocus.ownerDocument.body) {
                    returnFocus.focus({ preventScroll: true });
                }
            });
        }
    }, [mask, onCloseAutoFocus]);

    function handleOpenAutoFocus() {
        const activeElement = document.activeElement;
        returnFocusRef.current = activeElement instanceof HTMLElement ? activeElement : null;
    }

    function handleCloseAutoFocus(event: Event) {
        const returnFocus = returnFocusRef.current;
        returnFocusRef.current = null;
        onCloseAutoFocus?.(event);
        if (event.defaultPrevented) {
            return;
        }
        if (mask && returnFocus?.isConnected) {
            // Controlled dialogs have no Radix Trigger to receive focus on close.
            event.preventDefault();
            const activeElement = returnFocus.ownerDocument.activeElement;
            const focusInClosingDialog = event.target instanceof HTMLElement && event.target.contains(activeElement);
            if (activeElement === returnFocus.ownerDocument.body || activeElement === returnFocus || focusInClosingDialog) {
                returnFocus.focus({ preventScroll: true });
            }
        }
    }

    return { handleContentRef, handleOpenAutoFocus, handleCloseAutoFocus };
}
