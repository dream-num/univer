import RcDialog from 'rc-dialog';
import React, { useContext, useState } from 'react';
import Draggable from 'react-draggable';

import { ConfigContext } from '../config-provider/ConfigProvider';
import styles from './index.module.less';

export interface IDialogProps {
    children: React.ReactNode;

    /**
     * Whether the dialog is visible.
     * @default false
     */
    visible?: boolean;

    /**
     * The title of the dialog.
     */
    title?: React.ReactNode;

    /**
     * Whether the dialog can be dragged.
     * @default false
     */
    draggable?: boolean;

    /**
     * The close icon of the dialog.
     */
    closeIcon?: React.ReactNode;

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
    const { children, visible = false, title, draggable = false, closeIcon, footer, onClose } = props;
    const [dragDisabled, setDragDisabled] = useState(false);

    const { mountContainer } = useContext(ConfigContext);

    const TitleIfDraggable = draggable ? (
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
    ) : (
        title
    );

    const modalRender = (modal: React.ReactNode) =>
        draggable ? <Draggable disabled={dragDisabled}>{modal}</Draggable> : modal;

    return (
        <RcDialog
            prefixCls={styles.dialog}
            getContainer={() => mountContainer}
            visible={visible}
            title={TitleIfDraggable}
            modalRender={modalRender}
            closeIcon={closeIcon}
            footer={footer}
            onClose={onClose}
        >
            {children}
        </RcDialog>
    );
}
