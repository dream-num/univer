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

import type { ReactNode } from 'react';
import { useContext, useLayoutEffect, useState } from 'react';
import { ConfigContext } from '../config-provider/ConfigProvider';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogTrigger,
} from '../dialog/DialogPrimitive';
import { MobileOverlayContext } from './mobile-overlay-context';

export function MobileDropdownSurface(props: {
    children: ReactNode;
    content: ReactNode;
    open: boolean;
    disabled?: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const { children, content, open, disabled, onOpenChange } = props;
    const { locale, mountContainer } = useContext(ConfigContext);
    const mobileOverlay = useContext(MobileOverlayContext);
    const [surface, setSurface] = useState<HTMLDivElement | null>(null);
    const modal = mobileOverlay?.modal ?? true;
    useLayoutEffect(() => {
        if (open && surface) {
            return mobileOverlay?.onMount(surface);
        }
    }, [open, surface, mobileOverlay]);
    const viewportHeightUnit = globalThis.CSS?.supports('height', '1dvh') ? 'dvh' : 'vh';

    return (
        <Dialog open={open} onOpenChange={onOpenChange} modal={modal}>
            <DialogTrigger asChild disabled={disabled}>
                {children}
            </DialogTrigger>
            <DialogContent
                ref={setSurface}
                mountContainer={mountContainer}
                overlayClassName="!univer-z-[1390]"
                className="
                  !univer-left-0 !univer-right-0 !univer-top-auto !univer-z-[1400] !univer-block !univer-w-full
                  !univer-max-w-none !univer-translate-x-0 !univer-translate-y-0 !univer-overflow-y-auto
                  !univer-rounded-t-2xl !univer-border-0 !univer-bg-gray-50 !univer-p-4 !univer-pt-14
                  dark:!univer-bg-gray-900
                  [&_button[data-slot='close']]:!univer-right-3 [&_button[data-slot='close']]:!univer-top-3
                  [&_button[data-slot='close']]:!univer-size-10
                  [&_button]:!univer-min-h-11
                "
                style={{
                    position: 'fixed',
                    insetInline: 0,
                    top: 'auto',
                    bottom: 0,
                    maxHeight: `80${viewportHeightUnit}`,
                    width: '100%',
                    maxWidth: 'none',
                    transform: 'none',
                    ...mobileOverlay?.contentProps.style,
                }}
                onOpenAutoFocus={mobileOverlay?.contentProps.onOpenAutoFocus}
                onCloseAutoFocus={mobileOverlay?.contentProps.onCloseAutoFocus}
            >
                <div
                    aria-hidden="true"
                    className="
                      univer-absolute univer-left-1/2 univer-top-3 univer-h-1 univer-w-10 -univer-translate-x-1/2
                      univer-rounded-full univer-bg-gray-300
                      dark:!univer-bg-gray-600
                    "
                />
                <DialogTitle className="univer-sr-only">{locale?.Accessibility.menu}</DialogTitle>
                <DialogDescription className="univer-hidden" />
                {content}
            </DialogContent>
        </Dialog>
    );
}
