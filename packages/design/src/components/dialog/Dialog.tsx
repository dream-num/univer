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

import type { CSSProperties, MouseEvent as ReactMouseEvent, ReactNode } from 'react';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { clsx } from '../../helper/clsx';
import { Button } from '../button/Button';
import { ConfigContext } from '../config-provider/ConfigProvider';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, Dialog as DialogProvider, DialogTitle } from './DialogPrimitive';

export interface IDialogProps {
    children: ReactNode;

    /**
     * The style of the dialog.
     */
    style?: CSSProperties;

    /**
     * Whether the dialog is visible.
     * @default false
     */
    open?: boolean;

    /**
     * The width of the dialog.
     */
    width?: number | string;

    /**
     * The title of the dialog.
     */
    title?: ReactNode;

    /**
     * Whether the dialog can be dragged. If a dialog is draggable, the backdrop would be hidden and
     * the wrapper container would not response to user's mouse events.
     *
     * @default false
     */
    draggable?: boolean;

    /**
     * The default position of the dialog.
     */
    defaultPosition?: { x: number; y: number };

    /**
     * Whether the dialog should be destroyed on close.
     * @default false
     */
    destroyOnClose?: boolean;

    /**
     * Whether the dialog should preserve its position on destroy.
     * @default false
     */
    preservePositionOnDestroy?: boolean;

    /**
     * The footer of the dialog.
     */
    footer?: ReactNode;

    /**
     *  Whether the dialog should show a mask.
     */
    mask?: boolean;

    /**
     * additional className for dialog
     */
    className?: string;

    /**
     * whether show close button
     */
    closable?: boolean;

    /**
     * whether click mask to close, default is true
     */
    maskClosable?: boolean;

    /**
     * whether support press esc to close
     * @default true
     */
    keyboard?: boolean;

    /**
     * The callback function when the open state changes.
     */
    onOpenChange?: (open: boolean) => void;

    /**
     * The callback function when the dialog is closed.
     */
    onClose?: () => void;

    showOk?: boolean;
    showCancel?: boolean;

    onOk?: () => void;
    onCancel?: () => void;
}

function useDraggable(
    options: {
        defaultPosition?: { x: number; y: number };
        enabled?: boolean;
    } = {}
) {
    const getCenteredPosition = useCallback(() => {
        const { innerWidth, innerHeight } = window;

        const defaultWidth = 0;
        const defaultHeight = 0;

        return {
            x: Math.max(0, (innerWidth - defaultWidth) / 2),
            y: Math.max(0, (innerHeight - defaultHeight) / 2),
        };
    }, []);

    const { defaultPosition = getCenteredPosition(), enabled = false } = options;

    const [position, setPosition] = useState(defaultPosition);
    const [isDragging, setIsDragging] = useState(false);

    const elementRef = useRef<HTMLElement | null>(null);
    const startPosRef = useRef({ x: 0, y: 0 });
    const startClientRef = useRef({ x: 0, y: 0 });
    const initializedRef = useRef(false);

    useEffect(() => {
        if (!elementRef.current || initializedRef.current || options.defaultPosition) return;

        const { width, height } = elementRef.current.getBoundingClientRect();
        const { innerWidth, innerHeight } = window;

        const centeredX = Math.max(0, (innerWidth - width) / 2);
        const centeredY = Math.max(0, (innerHeight - height) / 2);

        setPosition({ x: centeredX, y: centeredY });
        startPosRef.current = { x: centeredX, y: centeredY };
        initializedRef.current = true;
    }, [options.defaultPosition]);

    const calculateBounds = useCallback((clientX: number, clientY: number) => {
        if (!elementRef.current) return { x: clientX, y: clientY };

        const rect = elementRef.current.getBoundingClientRect();
        const { clientWidth, clientHeight } = document.documentElement;

        let newX = startPosRef.current.x + (clientX - startClientRef.current.x);
        let newY = startPosRef.current.y + (clientY - startClientRef.current.y);

        if (newX < 0) newX = 0;
        if (newY < 0) newY = 0;
        if (newX + rect.width > clientWidth) newX = clientWidth - rect.width;
        if (newY + rect.height > clientHeight) newY = clientHeight - rect.height;

        return { x: newX, y: newY };
    }, []);

    const startDrag = useCallback((e: ReactMouseEvent<HTMLElement> | MouseEvent) => {
        if (!enabled) return;

        e.preventDefault();
        e.stopPropagation();

        startPosRef.current = { ...position };
        startClientRef.current = { x: e.clientX, y: e.clientY };
        setIsDragging(true);

        document.body.style.userSelect = 'none';
    }, [enabled, position]);

    const onDrag = useCallback((e: MouseEvent) => {
        if (!isDragging) return;

        e.preventDefault();
        e.stopPropagation();

        const newPosition = calculateBounds(e.clientX, e.clientY);
        setPosition(newPosition);
    }, [isDragging, calculateBounds]);

    const endDrag = useCallback(() => {
        setIsDragging(false);
        document.body.style.userSelect = '';
    }, []);

    useEffect(() => {
        if (enabled) {
            document.addEventListener('mousemove', onDrag);
            document.addEventListener('mouseup', endDrag);

            return () => {
                document.removeEventListener('mousemove', onDrag);
                document.removeEventListener('mouseup', endDrag);
            };
        }
    }, [enabled, onDrag, endDrag]);

    return {
        position,
        isDragging,
        elementRef,
        setElementRef: (el: HTMLElement | null) => {
            elementRef.current = el;

            if (el && !initializedRef.current && !options.defaultPosition) {
                const { width, height } = el.getBoundingClientRect();
                const { innerWidth, innerHeight } = window;

                const centeredX = Math.max(0, (innerWidth - width) / 2);
                const centeredY = Math.max(0, (innerHeight - height) / 2);

                setPosition({ x: centeredX, y: centeredY });
                startPosRef.current = { x: centeredX, y: centeredY };
                initializedRef.current = true;
            }
        },
        handleMouseDown: startDrag,
    };
}

export function Dialog(props: IDialogProps) {
    const {
        className,
        children,
        style,
        open = false,
        title,
        width,
        draggable = false,
        defaultPosition,
        destroyOnClose = false,
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

    const { locale } = useContext(ConfigContext);

    const { position, isDragging, setElementRef, handleMouseDown } = useDraggable({ defaultPosition, enabled: draggable });

    const footer = propFooter ?? (showOk || showCancel
        ? (
            <div className="univer-flex univer-justify-end univer-gap-2">
                {showCancel && (
                    <Button onClick={onCancel}>
                        {locale?.Confirm?.cancel ?? 'Cancel'}
                    </Button>
                )}
                {showOk && (
                    <Button variant="primary" onClick={onOk}>
                        {locale?.Confirm?.confirm ?? 'OK'}
                    </Button>
                )}
            </div>
        )
        : null);

    const handleContentRef = useCallback((node: HTMLDivElement | null) => {
        if (node && draggable) {
            setElementRef(node);
        }
    }, [draggable, setElementRef]);

    const handleOpenChange = useCallback((isOpen: boolean) => {
        if (!maskClosable && !isOpen) {
            return;
        }

        onOpenChange?.(isOpen);

        if (!isOpen) {
            onClose?.();
        }
    }, [onClose, onOpenChange]);

    function handleClickClose() {
        onOpenChange?.(false);
        onClose?.();
    }

    return (
        <DialogProvider
            open={open}
            onOpenChange={handleOpenChange}
            modal={mask !== false}
        >
            <DialogContent
                ref={handleContentRef}
                className={clsx(className, {
                    '!univer-animate-none': draggable,
                })}
                style={{
                    ...style,
                    width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
                    ...(draggable
                        ? {
                            position: 'absolute',
                            margin: 0,
                            left: 0,
                            top: 0,
                            transform: `translate(${position.x}px, ${position.y}px)`,
                            transition: isDragging ? 'none' : undefined,
                            cursor: isDragging ? 'grabbing' : undefined,
                        }
                        : {}),
                }}
                closable={closable}
                onClickClose={handleClickClose}
            >
                <DialogHeader
                    className={clsx({
                        '!univer-hidden': !title,
                    })}
                    data-drag-handle={draggable ? 'true' : undefined}
                    style={{
                        cursor: draggable ? 'grab' : undefined,
                        userSelect: draggable ? 'none' : undefined,
                        touchAction: draggable ? 'none' : undefined,
                    }}
                    onMouseDown={draggable ? handleMouseDown : undefined}
                >
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription className="univer-hidden" />
                </DialogHeader>

                {children}

                {footer && (
                    <DialogFooter>
                        {footer}
                    </DialogFooter>
                )}
            </DialogContent>
        </DialogProvider>
    );
}
