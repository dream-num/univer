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

import { CloseSingle } from '@univerjs/icons';
import RcDialog from 'rc-dialog';
import React, { useContext, useRef, useState } from 'react';
import type { DraggableData, DraggableEvent, DraggableEventHandler } from 'react-draggable';
import Draggable from 'react-draggable';

import type { ModalStyles } from 'rc-dialog/lib/IDialogPropTypes';
import { ConfigContext } from '../config-provider/ConfigProvider';
import styles from './index.module.less';

export interface IDialogProps {
    children: React.ReactNode;

    /**
     * The style of the dialog.
     */
    style?: React.CSSProperties;

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
    title?: React.ReactNode;

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
    closeIcon?: React.ReactNode;

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
    footer?: React.ReactNode;

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
        preservePositionOnDestroy = false,
        footer,
        onClose,
        mask,
        dialogStyles,
        closable,
        maskClosable,
    } = props;
    const [dragDisabled, setDragDisabled] = useState(false);
    const [positionOffset, setPositionOffset] = useState<{ x: number; y: number } | null>(null);

    const { mountContainer } = useContext(ConfigContext);

    const TitleIfDraggable = draggable
        ? (
            <div
                className={styles.dialogTitleContent}
                style={{
                    width: '100%',
                    cursor: 'pointer',
                    ...dialogStyles?.header,
                }}
                onMouseOver={() => {
                    if (dragDisabled) {
                        setDragDisabled(false);
                    }
                }}
                onMouseOut={() => {
                    setDragDisabled(true);
                }}
                onFocus={() => {
                    // empty
                }}
                onBlur={() => {
                    // empty
                }}
            >
                {title}
            </div>
        )
        : (
            <div className={styles.dialogTitleContent}>{title}</div>
        );

    const modalRender = (modal: React.ReactNode) => {
        const [bounds, setBounds] = useState({ left: 0, top: 0, bottom: 0, right: 0 });
        const draggleRef = useRef<HTMLDivElement>(null);

        function handleStop(_event: MouseEvent, data: DraggableData) {
            if (preservePositionOnDestroy) {
                setPositionOffset({ x: data.x, y: data.y });
            }
        }

        const position = positionOffset || defaultPosition || { x: 0, y: 0 };

        const onStart = (_event: DraggableEvent, uiData: DraggableData) => {
            const { clientWidth, clientHeight } = window.document.documentElement;
            const targetRect = draggleRef.current?.getBoundingClientRect();
            if (!targetRect) {
                return;
            }

            setBounds({
                left: -targetRect.left + uiData.x,
                right: clientWidth - (targetRect.right - uiData.x),
                top: -targetRect.top + uiData.y,
                bottom: clientHeight - (targetRect.bottom - uiData.y),
            });
        };

        return draggable
            ? (
                <Draggable
                    disabled={dragDisabled}
                    defaultPosition={position}
                    bounds={bounds}
                    nodeRef={draggleRef}
                    onStart={(event, uiData) => onStart(event, uiData)}
                    onStop={handleStop as DraggableEventHandler}
                >
                    <div ref={draggleRef}>{modal}</div>
                </Draggable>
            )
            : modal;
    };

    const needMask = mask ?? !draggable;

    return mountContainer && (
        <RcDialog
            className={className}
            width={width}
            prefixCls={styles.dialog}
            rootClassName={!needMask ? styles.dialogRootDraggable : styles.dialogRoot}
            getContainer={() => mountContainer}
            visible={visible}
            title={TitleIfDraggable}
            modalRender={modalRender}
            closeIcon={closeIcon}
            destroyOnClose={destroyOnClose}
            footer={footer}
            mask={needMask}
            style={style}
            onClose={onClose}
            styles={dialogStyles}
            closable={closable}
            maskClosable={maskClosable}
        >
            {children}
        </RcDialog>
    );
}
