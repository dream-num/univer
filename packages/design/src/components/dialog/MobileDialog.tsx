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

import type { IDialogProps } from './Dialog';
import { useContext, useRef } from 'react';
import { clsx } from '../../helper/clsx';
import { Button } from '../button/Button';
import { ConfigContext } from '../config-provider/ConfigProvider';
import {
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    Dialog as DialogProvider,
    DialogTitle,
} from './DialogPrimitive';

export type IMobileDialogProps = IDialogProps;

export function MobileDialog(props: IMobileDialogProps) {
    const {
        className,
        overlayClassName,
        children,
        style,
        open = false,
        title,
        footer: propFooter,
        mask = true,
        keyboard = true,
        closable = true,
        maskClosable = true,
        showOk,
        showCancel,
        onOpenChange,
        onClose,
        onOk,
        onCancel,
    } = props;
    const contentRef = useRef<HTMLDivElement>(null);
    const { locale, mountContainer, direction } = useContext(ConfigContext);
    const maxHeight = globalThis.CSS?.supports('height', '1dvh') ? '80dvh' : '80vh';
    const footer = propFooter ?? (showOk || showCancel
        ? (
            <div className="univer-flex univer-justify-end univer-gap-2">
                {showCancel && <Button onClick={onCancel}>{locale?.Confirm.cancel}</Button>}
                {showOk && <Button variant="primary" onClick={onOk}>{locale?.Confirm.confirm}</Button>}
            </div>
        )
        : null);

    function close() {
        onOpenChange?.(false);
        onClose?.();
    }

    function handleOpenChange(isOpen: boolean) {
        if (!mask && !isOpen) {
            return;
        }

        onOpenChange?.(isOpen);
        if (!isOpen) {
            onClose?.();
        }
    }

    return (
        <DialogProvider open={open} onOpenChange={handleOpenChange} modal={mask !== false}>
            <DialogContent
                className={clsx(`
                  !univer-bottom-0 !univer-left-0 !univer-right-0 !univer-top-auto !univer-flex !univer-max-w-none
                  !univer-translate-x-0 !univer-translate-y-0 !univer-flex-col !univer-gap-4 !univer-overflow-hidden
                  !univer-rounded-t-2xl !univer-p-4
                  [&_[data-slot='dialog-footer']]:!univer-flex-row [&_[data-slot='dialog-footer']]:!univer-gap-3
                  [&_[data-slot='dialog-footer']_button]:!univer-h-12
                  [&_[data-slot='dialog-footer']_button]:!univer-flex-1
                  [&_button[data-slot='close']]:!univer-right-3 [&_button[data-slot='close']]:!univer-top-3
                  [&_button[data-slot='close']]:!univer-size-10
                `, className)}
                ref={contentRef}
                onOpenAutoFocus={(event) => {
                    event.preventDefault();
                    contentRef.current?.focus({ preventScroll: true });
                }}
                style={{
                    ...style,
                    position: 'fixed',
                    insetInline: 0,
                    top: 'auto',
                    bottom: 0,
                    width: '100%',
                    maxHeight,
                    maxWidth: 'none',
                    margin: 0,
                    transform: 'none',
                }}
                closable={closable}
                mountContainer={mountContainer}
                overlayClassName={overlayClassName}
                dir={direction}
                onEscapeKeyDown={(event) => {
                    if (keyboard) {
                        close();
                    }
                    event.preventDefault();
                }}
                onPointerDownOutside={(event) => {
                    if (maskClosable) {
                        close();
                    }
                    event.preventDefault();
                }}
            >
                <DialogHeader className={title ? 'univer-shrink-0 univer-px-10' : '!univer-hidden'}>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription className="univer-hidden" />
                </DialogHeader>

                <div className="univer-min-h-0 univer-min-w-0 univer-overflow-y-auto">
                    {children}
                </div>

                {footer && <DialogFooter className="univer-shrink-0">{footer}</DialogFooter>}
            </DialogContent>
        </DialogProvider>
    );
}
