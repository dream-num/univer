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

import type { ModalStyles } from 'rc-dialog/lib/IDialogPropTypes';
import type { CSSProperties, MouseEvent as ReactMouseEvent, ReactNode } from 'react';
import { CloseSingle } from '@univerjs/icons';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { clsx } from '../../helper/clsx';
import { Button } from '../button';
import { ConfigContext } from '../config-provider/ConfigProvider';
import { Dialog as Dialog2, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './DialogPrimitive';

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
    visible?: boolean;

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
     * The close icon of the dialog.
     */
    closeIcon?: ReactNode;

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
     * Callback when the dialog is closed.
     */
    onClose?: () => void;

    /**
     *  Whether the dialog should show a mask.
     */
    mask?: boolean;

    /**
     * additional className for dialog
     */
    className?: string;

    /**
     * The style of the customize.
     */
    dialogStyles?: ModalStyles;

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

    showOk?: boolean;
    showCancel?: boolean;

    onOk?: () => void;
    onCancel?: () => void;
}

// 自定义拖拽钩子
function useDraggable(
    options: {
        defaultPosition?: { x: number; y: number };
        enabled?: boolean;
    } = {}
) {
    const { defaultPosition = { x: 0, y: 0 }, enabled = false } = options;

    const [position, setPosition] = useState(defaultPosition);
    const [isDragging, setIsDragging] = useState(false);

    const elementRef = useRef<HTMLElement | null>(null);
    const startPosRef = useRef({ x: 0, y: 0 });
    const startClientRef = useRef({ x: 0, y: 0 });

    // 计算边界
    const calculateBounds = useCallback((clientX: number, clientY: number) => {
        if (!elementRef.current) return { x: clientX, y: clientY };

        const rect = elementRef.current.getBoundingClientRect();
        const { clientWidth, clientHeight } = document.documentElement;

        // 计算新位置
        let newX = startPosRef.current.x + (clientX - startClientRef.current.x);
        let newY = startPosRef.current.y + (clientY - startClientRef.current.y);

        // 应用边界约束
        if (newX < 0) newX = 0;
        if (newY < 0) newY = 0;
        if (newX + rect.width > clientWidth) newX = clientWidth - rect.width;
        if (newY + rect.height > clientHeight) newY = clientHeight - rect.height;

        return { x: newX, y: newY };
    }, []);

    // 开始拖拽
    const startDrag = useCallback((e: ReactMouseEvent<HTMLElement> | MouseEvent) => {
        if (!enabled) return;

        // 阻止默认行为和冒泡
        e.preventDefault();
        e.stopPropagation();

        startPosRef.current = { ...position };
        startClientRef.current = { x: e.clientX, y: e.clientY };
        setIsDragging(true);

        // 在拖拽过程中添加选择样式
        document.body.style.userSelect = 'none';
    }, [enabled, position]);

    // 拖拽过程
    const onDrag = useCallback((e: MouseEvent) => {
        if (!isDragging) return;

        e.preventDefault();
        e.stopPropagation();

        const newPosition = calculateBounds(e.clientX, e.clientY);
        setPosition(newPosition);
    }, [isDragging, calculateBounds]);

    // 结束拖拽
    const endDrag = useCallback(() => {
        setIsDragging(false);
        document.body.style.userSelect = '';
    }, []);

    // 绑定全局事件
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
        },
        handleMouseDown: startDrag,
    };
}

export function Dialog(props: IDialogProps) {
    const {
        className,
        children,
        style,
        visible = false,
        title,
        width,
        draggable = false,
        closeIcon = <CloseSingle />,
        defaultPosition,
        destroyOnClose = false,
        footer: propFooter,
        onClose,
        mask = false,
        keyboard = true,
        dialogStyles,
        closable = true,
        maskClosable,
        showOk,
        showCancel,
        onOk,
        onCancel,
    } = props;

    const { locale } = useContext(ConfigContext);

    const { position, isDragging, setElementRef, handleMouseDown } = useDraggable({ defaultPosition, enabled: draggable });

    // 准备页脚内容
    const footer = propFooter ?? (showOk || showCancel
        ? (
            <div className="univer-flex univer-justify-end univer-gap-2">
                {showCancel && (
                    <Button onClick={onCancel ?? onClose}>
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

    return (
        <Dialog2
            open={visible}
            // onOpenChange={onClose}
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
                    ...dialogStyles?.content,
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
            >
                <DialogHeader
                    data-drag-handle={draggable ? 'true' : undefined}
                    style={{
                        cursor: draggable ? 'grab' : undefined,
                        userSelect: draggable ? 'none' : undefined,
                        touchAction: draggable ? 'none' : undefined,
                        ...dialogStyles?.header,
                    }}
                    onMouseDown={draggable ? handleMouseDown : undefined}
                >
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription />
                </DialogHeader>

                {children}

                {footer && (
                    <div className="univer-p-4 univer-pt-2">
                        {footer}
                    </div>
                )}
            </DialogContent>
        </Dialog2>
    );
}
