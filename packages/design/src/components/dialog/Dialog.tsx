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
import React, { useContext, useState } from 'react';
import Draggable from 'react-draggable';

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
     * Whether the dialog should be destroyed on close.
     * @default false
     */
    destroyOnClose?: boolean;

    /**
     * The footer of the dialog.
     */
    footer?: React.ReactNode;

    /**
     * Callback when the dialog is closed.
     */
    onClose?: () => void;
}

export function Dialog(props: IDialogProps) {
    const {
        children,
        style,
        visible = false,
        title,
        width,
        draggable = false,
        closeIcon = <CloseSingle />,
        destroyOnClose = false,
        footer,
        onClose,
    } = props;
    const [dragDisabled, setDragDisabled] = useState(false);

    const { mountContainer } = useContext(ConfigContext);

    const TitleIfDraggable = draggable
        ? (
            <div
                style={{
                    width: '100%',
                    cursor: 'pointer',
                }}
                onMouseOver={() => {
                    if (dragDisabled) {
                        setDragDisabled(false);
                    }
                }}
                onMouseOut={() => {
                    setDragDisabled(true);
                }}
                onFocus={() => {}}
                onBlur={() => {}}
            >
                {title}
            </div>
        )
        : (
            title
        );

    const modalRender = (modal: React.ReactNode) =>
        draggable ? <Draggable disabled={dragDisabled}>{modal}</Draggable> : modal;

    return (
        <RcDialog
            width={width}
            prefixCls={styles.dialog}
            rootClassName={draggable ? styles.dialogRootDraggable : styles.dialogRoot}
            getContainer={() => mountContainer}
            visible={visible}
            title={TitleIfDraggable}
            modalRender={modalRender}
            closeIcon={closeIcon}
            destroyOnClose={destroyOnClose}
            footer={footer}
            mask={!draggable}
            style={style}
            onClose={onClose}
        >
            {children}
        </RcDialog>
    );
}
